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

    @Transactional
    public void syncFestivals(String eventStartDate) {
        try {
            // 안전하고 명확하게 수동 문자열 결합 방식으로 URL 구성
            String url = baseUrl + "/searchFestival2"
                    + "?serviceKey=" + serviceKey
                    + "&MobileOS=ETC"
                    + "&MobileApp=ieum"
                    + "&_type=json"
                    + "&eventStartDate=" + eventStartDate
                    + "&numOfRows=50"
                    + "&pageNo=1"
                    + "&arrange=A";

            URI uri = URI.create(url);

            log.info("Fetching TourAPI festivals...");
            String response = restTemplate.getForObject(uri, String.class);
            JsonNode root = mapper.readTree(response);

            JsonNode itemsNode = root.path("response").path("body").path("items").path("item");
            if (itemsNode.isMissingNode() || !itemsNode.isArray()) {
                log.warn("No items found or API error: {}", response);
                return;
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
            log.info("Successfully synced {} festivals into DB.", count);

        } catch (Exception e) {
            log.error("Failed to sync TourAPI", e);
        }
    }
}
