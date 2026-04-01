package com.ieum.festival.application.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ieum.festival.adapter.out.persistence.entity.FestivalEntity;
import com.ieum.festival.adapter.out.persistence.repository.FestivalJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import org.springframework.scheduling.annotation.Scheduled;

@Slf4j
@Service
@RequiredArgsConstructor
public class TourApiSyncService {

    private final FestivalJpaRepository repository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${tour-api.service-key}")
    private String serviceKey;

    @Value("${tour-api.base-url}")
    private String baseUrl;

    @Scheduled(cron = "0 0 4 * * ?") // 매일 04시에 자동 수행
    public void scheduledSync() {
        log.info("⏰ 스케줄러 직동: 공공데이터 자동 동기화 시작");
        // 오늘 날짜 기준으로 진행중/예정 축제 동기화 (원하는 기준에 따라 변경 가능)
        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        syncFestivals(today);
    }

    @Transactional
    public void syncFestivals(String eventStartDate) {
        try {
            int pageNo = 1;
            int totalSynced = 0;

            while (true) {
                // 안전하고 명확하게 수동 문자열 결합 방식으로 URL 구성
                String url = baseUrl + "/searchFestival2"
                        + "?serviceKey=" + serviceKey
                        + "&MobileOS=ETC"
                        + "&MobileApp=ieum"
                        + "&_type=json"
                        + "&eventStartDate=" + eventStartDate
                        + "&numOfRows=100"
                        + "&pageNo=" + pageNo
                        + "&arrange=A";

                URI uri = URI.create(url);

                log.info("Fetching TourAPI festivals... Page: {}", pageNo);
                String response = restTemplate.getForObject(uri, String.class);
                JsonNode root = mapper.readTree(response);

                JsonNode itemsNode = root.path("response").path("body").path("items").path("item");
                
                // 더 이상 가져올 데이터가 없으면 루프 탈출
                if (itemsNode.isMissingNode() || !itemsNode.isArray() || itemsNode.isEmpty()) {
                    log.info("모든 페이지를 순회했습니다. (최종 페이지: {})", pageNo - 1);
                    break;
                }

                int count = 0;
                for (JsonNode item : itemsNode) {
                    String contentId = item.path("contentid").asText();
                    String title = item.path("title").asText();
                    String addr1 = item.path("addr1").asText();
                    String firstImage = item.path("firstimage").asText();
                    String firstImage2 = item.path("firstimage2").asText();
                    String startDt = item.path("eventstartdate").asText();
                    String endDt = item.path("eventenddate").asText();
                    double mapX = item.path("mapx").asDouble(0);
                    double mapY = item.path("mapy").asDouble(0);

                    FestivalEntity entity = repository.findBySourceId(contentId)
                            .orElseGet(() -> FestivalEntity.builder()
                                    .sourceId(contentId)
                                    .source("API")
                                    .status("UPCOMING") // 기본값
                                    .build());

                    entity.setTitle(title);
                    entity.setAddress(addr1);
                    entity.setImageUrl(firstImage.isEmpty() ? null : firstImage);
                    entity.setThumbnailUrl(firstImage2.isEmpty() ? null : firstImage2);

                    DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyyMMdd");
                    try {
                        if (!startDt.isEmpty()) entity.setStartDate(LocalDate.parse(startDt, dtf));
                        if (!endDt.isEmpty()) entity.setEndDate(LocalDate.parse(endDt, dtf));
                    } catch (Exception e) {}
                    
                    entity.setLongitude(mapX == 0 ? null : mapX);
                    entity.setLatitude(mapY == 0 ? null : mapY);

                    repository.save(entity);
                    count++;
                }
                
                totalSynced += count;
                pageNo++;

                // 무한 루프 방지 (안전망: 최대 100페이지 = 10,000개 수집)
                if (pageNo > 100) {
                    log.warn("안전망 도달: 최대 지정된 페이지(100)를 초과하여 동기화를 중단합니다.");
                    break;
                }
            }
            log.info("🎉 전체 동기화 완료! 총 {} 개 데이터 무사히 저장/업데이트", totalSynced);

        } catch (Exception e) {
            log.error("Failed to sync TourAPI", e);
        }
    }
}
