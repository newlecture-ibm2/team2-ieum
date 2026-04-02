package com.ieum.admin.festival.application.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ieum.admin.festival.adapter.out.persistence.AdminFestivalRepository;
import com.ieum.admin.festival.application.result.FestivalSyncResult;
import com.ieum.festival.domain.model.Festival;
import com.ieum.festival.domain.model.FestivalSource;
import com.ieum.festival.domain.model.FestivalStatus;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class FestivalSyncService {

    private final AdminFestivalRepository festivalRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${tour-api.service-key}")
    private String apiKey;

    @Value("${tour-api.base-url}")
    private String baseUrl;

    public FestivalSyncResult syncFestivalsFromTourApi() {
        log.info("Starting TourAPI sync...");
        int syncCount = 0;
        int pageNo = 1;
        int numOfRows = 200;

        try {
            // 오늘 기준으로 2년 전 데이터부터 검색
            LocalDate now = LocalDate.now();
            String startDateStr = now.minusYears(2).format(DateTimeFormatter.ofPattern("yyyyMMdd"));

            while (true) {
                URI uri = UriComponentsBuilder.fromHttpUrl(baseUrl + "/searchFestival2")
                        .queryParam("serviceKey", apiKey)
                        .queryParam("numOfRows", numOfRows)
                        .queryParam("pageNo", pageNo)
                        .queryParam("MobileOS", "ETC")
                        .queryParam("MobileApp", "ieum")
                        .queryParam("_type", "json")
                        .queryParam("eventStartDate", startDateStr)
                        .queryParam("arrange", "A") // 제목순 정렬 기준. 혹은 최신순 C도 가능. 우리는 전부 가져옴
                        .build(true).toUri();

                String responseBody;
                try {
                    responseBody = restTemplate.getForObject(uri, String.class);
                } catch (org.springframework.web.client.HttpClientErrorException apiEx) {
                    log.error("Tour API call failed at page {}", pageNo, apiEx);
                    if (apiEx.getStatusCode() == org.springframework.http.HttpStatus.FORBIDDEN || apiEx.getStatusCode() == org.springframework.http.HttpStatus.UNAUTHORIZED) {
                        throw new com.ieum.global.exception.BusinessException(com.ieum.global.exception.ErrorCode.FEST_002, "API 통신 권한 없음: " + apiEx.getMessage(), apiEx);
                    }
                    throw new com.ieum.global.exception.BusinessException(com.ieum.global.exception.ErrorCode.FEST_001, "API 통신 실패: " + apiEx.getMessage(), apiEx);
                } catch (Exception apiEx) {
                    log.error("Tour API call failed at page {}", pageNo, apiEx);
                    throw new com.ieum.global.exception.BusinessException(com.ieum.global.exception.ErrorCode.FEST_001, "API 통신 에러: " + apiEx.getMessage(), apiEx);
                }

                JsonNode rootNode = objectMapper.readTree(responseBody);
                JsonNode bodyNode = rootNode.path("response").path("body");
                JsonNode itemsNode = bodyNode.path("items").path("item");

                if (itemsNode.isArray() && !itemsNode.isEmpty()) {
                    List<Festival> saveList = new ArrayList<>();
                    for (JsonNode item : itemsNode) {
                        try {
                            String sourceId = item.path("contentid").asText(null);
                            if (sourceId == null) continue;

                            Festival festival = festivalRepository.findBySourceId(sourceId).orElse(null);
                            if (festival == null) {
                                festival = Festival.builder()
                                        .sourceId(sourceId)
                                        .source(FestivalSource.API)
                                        .isCustom(false)
                                        .isVisible(true)
                                        .build();
                            }
                            
                            updateFestivalData(festival, item);
                            saveList.add(festival);
                            syncCount++;
                        } catch (Exception e) {
                            log.warn("Skipping festival due to parsing error", e);
                        }
                    }
                    festivalRepository.saveAll(saveList);
                } else {
                    break;
                }

                int totalCount = bodyNode.path("totalCount").asInt(0);
                if (pageNo * numOfRows >= totalCount) {
                    break;
                }
                pageNo++;
            }
            
            log.info("TourAPI sync completed successfully. Synced {} items.", syncCount);
            return FestivalSyncResult.builder().status("COMPLETED").syncCount(syncCount).build();

        } catch (com.ieum.global.exception.BusinessException be) {
            throw be;
        } catch (Exception e) {
            log.error("Failed to sync festivals from TourAPI", e);
            throw new com.ieum.global.exception.BusinessException(com.ieum.global.exception.ErrorCode.COMMON_500, "동기화 중 오류 발생: " + e.getMessage(), e);
        }
    }

    private void updateFestivalData(Festival festival, JsonNode item) {
        String title = item.path("title").asText(null);
        String addr1 = item.path("addr1").asText("");
        String addr2 = item.path("addr2").asText("");
        String firstimage = item.path("firstimage").asText(null);
        String firstimage2 = item.path("firstimage2").asText(null);
        String tel = item.path("tel").asText(null);
        String mapx = item.path("mapx").asText(null);
        String mapy = item.path("mapy").asText(null);

        LocalDate startDate = parseDate(item.path("eventstartdate").asText(null));
        LocalDate endDate = parseDate(item.path("eventenddate").asText(null));

        FestivalStatus status = FestivalStatus.UPCOMING;
        LocalDate today = LocalDate.now();
        if (startDate != null && endDate != null) {
            if (today.isBefore(startDate)) {
                status = FestivalStatus.UPCOMING;
            } else if (today.isAfter(endDate)) {
                status = FestivalStatus.ENDED;
            } else {
                status = FestivalStatus.ONGOING;
            }
        }

        title = title != null ? title : "제목 없음";
        if (title.length() > 255) title = title.substring(0, 255);
        festival.setTitle(title);

        String fullAddress = (addr1 + " " + addr2).trim();
        if (fullAddress.length() > 500) fullAddress = fullAddress.substring(0, 500);
        festival.setAddress(fullAddress);

        String loc = addr1.split(" ").length > 0 ? addr1.split(" ")[0] : "";
        if (loc.length() > 255) loc = loc.substring(0, 255);
        festival.setLocation(loc);

        if (firstimage != null && firstimage.length() > 500) firstimage = firstimage.substring(0, 500);
        festival.setImageUrl(firstimage);

        if (firstimage2 != null && firstimage2.length() > 500) firstimage2 = firstimage2.substring(0, 500);
        festival.setThumbnailUrl(firstimage2);

        if (tel != null && tel.length() > 50) tel = tel.substring(0, 50);
        festival.setTel(tel);

        try {
            festival.setLongitude(mapx != null && !mapx.isEmpty() ? Double.parseDouble(mapx) : null);
            festival.setLatitude(mapy != null && !mapy.isEmpty() ? Double.parseDouble(mapy) : null);
        } catch (NumberFormatException e) {
            log.debug("Invalid mapx/mapy format for sourceId {}", festival.getSourceId());
        }
        festival.setStartDate(startDate);
        festival.setEndDate(endDate);
        if (festival.getStatus() != FestivalStatus.ENDED || !festival.isCustom()) {
            festival.setStatus(status);
        }
        
        festival.setApiModifiedAt(java.time.LocalDateTime.now());
    }

    private LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.length() != 8) return null;
        try {
            return LocalDate.parse(dateStr, DateTimeFormatter.ofPattern("yyyyMMdd"));
        } catch (Exception e) {
            return null;
        }
    }
}
