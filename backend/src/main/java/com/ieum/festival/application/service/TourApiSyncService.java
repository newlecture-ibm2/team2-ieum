package com.ieum.festival.application.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ieum.festival.application.port.in.SyncFestivalUseCase;
import com.ieum.festival.application.port.out.FestivalPersistencePort;
import com.ieum.festival.domain.model.Festival;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.scheduling.annotation.Scheduled;

/**
 * 공공데이터 동기화 서비스
 * - SyncFestivalUseCase 구현
 *
 * ✅ Port + Domain Model 기반으로 리팩토링
 *    - Entity/JpaRepository 직접 참조 제거
 *    - 도메인 팩토리 메서드(Festival.createFromApiData, updateFromApiData) 사용
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TourApiSyncService implements SyncFestivalUseCase {

    private final FestivalPersistencePort festivalPersistencePort;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${tour-api.service-key}")
    private String serviceKey;

    @Value("${tour-api.base-url}")
    private String baseUrl;

    @Scheduled(cron = "0 0 4 * * ?") // 매일 04시에 자동 수행
    public void scheduledSync() {
        log.info("⏰ 스케줄러 작동: 공공데이터 자동 동기화 시작");
        String twoYearsAgo = LocalDate.now().minusYears(2).format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        syncFestivals(twoYearsAgo);
    }

    @Override
    @Transactional
    public void syncFestivals(String eventStartDate) {
        try {
            int pageNo = 1;
            int totalSynced = 0;

            while (true) {
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

                if (itemsNode.isMissingNode() || !itemsNode.isArray() || itemsNode.isEmpty()) {
                    log.info("모든 페이지를 순회했습니다. (최종 페이지: {})", pageNo - 1);
                    break;
                }

                int count = 0;
                DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyyMMdd");

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

                    String areaCode = item.path("areacode").asText();
                    String sigunguCode = item.path("sigungucode").asText();
                    String cat1 = item.path("cat1").asText();
                    String cat2 = item.path("cat2").asText();
                    String cat3 = item.path("cat3").asText();

                    // 날짜 파싱
                    LocalDate startDate = null;
                    LocalDate endDate = null;
                    try {
                        if (!startDt.isEmpty()) startDate = LocalDate.parse(startDt, dtf);
                        if (!endDt.isEmpty()) endDate = LocalDate.parse(endDt, dtf);
                    } catch (Exception e) {
                        // 날짜 파싱 실패 시 무시
                    }

                    // 좌표 처리
                    Double longitude = mapX == 0 ? null : mapX;
                    Double latitude = mapY == 0 ? null : mapY;

                    // 빈 문자열 → null 변환
                    String parsedAreaCode = areaCode.isEmpty() ? null : areaCode;
                    String parsedSigunguCode = sigunguCode.isEmpty() ? null : sigunguCode;
                    String parsedCat1 = cat1.isEmpty() ? null : cat1;
                    String parsedCat2 = cat2.isEmpty() ? null : cat2;
                    String parsedCat3 = cat3.isEmpty() ? null : cat3;
                    String parsedImage = firstImage.isEmpty() ? null : firstImage;
                    String parsedThumb = firstImage2.isEmpty() ? null : firstImage2;

                    // 도메인 모델 기반 upsert
                    Optional<Festival> existing = festivalPersistencePort.findBySourceId(contentId);
                    Festival festival;

                    if (existing.isPresent()) {
                        festival = existing.get();
                        festival.updateFromApiData(title, addr1, parsedImage, parsedThumb,
                                startDate, endDate, latitude, longitude,
                                parsedAreaCode, parsedSigunguCode,
                                parsedCat1, parsedCat2, parsedCat3);
                    } else {
                        festival = Festival.createFromApiData(contentId, title, addr1,
                                parsedImage, parsedThumb, startDate, endDate,
                                latitude, longitude, parsedAreaCode, parsedSigunguCode,
                                parsedCat1, parsedCat2, parsedCat3);
                    }

                    festivalPersistencePort.save(festival);
                    count++;
                }

                totalSynced += count;
                pageNo++;

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

    /**
     * 특정 축제의 상세 정보(개요, 전화번호, 이용요금)를 TourAPI에서 실시간 조회
     */
    public Map<String, Object> fetchFestivalDetail(String contentId) {
        Map<String, Object> details = new HashMap<>();
        try {
            // 1. 공통정보 (overview, tel, title)
            String commonUrl = baseUrl + "/detailCommon2"
                    + "?serviceKey=" + serviceKey
                    + "&MobileOS=ETC&MobileApp=ieum&_type=json"
                    + "&contentId=" + contentId;

            JsonNode commonRoot = mapper.readTree(restTemplate.getForObject(URI.create(commonUrl), String.class));
            JsonNode commonItem = commonRoot.path("response").path("body").path("items").path("item").get(0);
            if (commonItem != null) {
                details.put("overview", commonItem.path("overview").asText().replaceAll("<[^>]*>", ""));
                details.put("tel", commonItem.path("tel").asText().replaceAll("<[^>]*>", ""));
            }

            // 2. 소개정보 (fee / usetimefestival)
            String introUrl = baseUrl + "/detailIntro2"
                    + "?serviceKey=" + serviceKey
                    + "&MobileOS=ETC&MobileApp=ieum&_type=json"
                    + "&contentId=" + contentId
                    + "&contentTypeId=15";

            JsonNode introRoot = mapper.readTree(restTemplate.getForObject(URI.create(introUrl), String.class));
            JsonNode introItem = introRoot.path("response").path("body").path("items").path("item").get(0);
            if (introItem != null) {
                details.put("fee", introItem.path("usetimefestival").asText().replaceAll("<[^>]*>", ""));
            }

            // 3. 사진 정보 (detailImage2)
            String imageUrlReq = baseUrl + "/detailImage2"
                    + "?serviceKey=" + serviceKey
                    + "&MobileOS=ETC&MobileApp=ieum&_type=json"
                    + "&contentId=" + contentId;

            JsonNode imageRoot = mapper.readTree(restTemplate.getForObject(URI.create(imageUrlReq), String.class));
            JsonNode imageItems = imageRoot.path("response").path("body").path("items").path("item");

            List<String> images = new ArrayList<>();
            if (imageItems != null && imageItems.isArray()) {
                for (JsonNode imgItem : imageItems) {
                    String originImgUrl = imgItem.path("originimgurl").asText();
                    if (!originImgUrl.isEmpty()) {
                        images.add(originImgUrl);
                    }
                }
            }
            details.put("images", images);

        } catch (Exception e) {
            log.error("Failed to fetch detail for contentId: {}", contentId, e);
        }
        return details;
    }
}
