package com.ieum.admin.festival.application.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ieum.admin.festival.application.port.in.SyncPublicFestivalUseCase;
import com.ieum.admin.festival.application.port.out.AdminFestivalPort;
import com.ieum.admin.festival.application.result.DataSyncResult;
import com.ieum.admin.festival.domain.model.Festival;
import com.ieum.admin.festival.domain.model.FestivalSource;
import com.ieum.admin.festival.domain.model.FestivalStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * 관리자 수동 동기화 서비스 (공공 API → DB)
 * - SyncPublicFestivalUseCase 구현체
 * - 공공 API 축제 데이터 동기화
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FestivalSyncService implements SyncPublicFestivalUseCase {

    private final AdminFestivalPort festivalPort;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${tour-api.service-key}")
    private String apiKey;

    @Value("${tour-api.base-url}")
    private String baseUrl;

    @Override
    @Transactional
    public DataSyncResult syncPublicFestivals() {
        log.info("Starting TourAPI public festival sync...");

        int syncCount = 0;
        int pageNo = 1;
        int numOfRows = 200;

        try {
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
                        .queryParam("arrange", "A")
                        .build(true).toUri();

                String responseBody;
                try {
                    responseBody = restTemplate.getForObject(uri, String.class);
                } catch (org.springframework.web.client.HttpClientErrorException apiEx) {
                    log.error("Tour API call failed at page {}", pageNo, apiEx);
                    if (apiEx.getStatusCode() == org.springframework.http.HttpStatus.FORBIDDEN
                            || apiEx.getStatusCode() == org.springframework.http.HttpStatus.UNAUTHORIZED) {
                        throw new RuntimeException(
                                "API 통신 권한 없음: " + apiEx.getMessage(),
                                apiEx);
                    }
                    throw new RuntimeException(
                            "API 통신 실패: " + apiEx.getMessage(), apiEx);
                } catch (Exception apiEx) {
                    log.error("Tour API call failed at page {}", pageNo, apiEx);
                    throw new RuntimeException(
                            "API 통신 에러: " + apiEx.getMessage(), apiEx);
                }

                JsonNode rootNode = objectMapper.readTree(responseBody);
                JsonNode bodyNode = rootNode.path("response").path("body");
                JsonNode itemsNode = bodyNode.path("items").path("item");

                if (itemsNode.isArray() && !itemsNode.isEmpty()) {
                    List<Festival> saveList = new ArrayList<>();
                    for (JsonNode item : itemsNode) {
                        try {
                            String sourceId = item.path("contentid").asText(null);
                            if (sourceId == null)
                                continue;

                            Festival festival = festivalPort.findBySourceId(sourceId).orElse(null);
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
                    festivalPort.saveAll(saveList);
                } else {
                    break;
                }

                int totalCount = bodyNode.path("totalCount").asInt(0);
                if (pageNo * numOfRows >= totalCount) {
                    break;
                }
                pageNo++;
            }

            log.info("TourAPI public festival sync completed successfully. Synced {} items.", syncCount);
            
            return DataSyncResult.builder()
                    .status("COMPLETED")
                    .type("PUBLIC")
                    .totalChanged(syncCount)
                    .details(DataSyncResult.Details.builder().festival(syncCount).build())
                    .build();

        } catch (RuntimeException be) {
            log.error("Failed to sync public festivals from TourAPI", be);
            return DataSyncResult.builder().status("FAILED").type("PUBLIC").totalChanged(0).build();
        } catch (Exception e) {
            log.error("Failed to sync public festivals from TourAPI", e);
            return DataSyncResult.builder().status("FAILED").type("PUBLIC").totalChanged(0).build();
        }
    }

    /**
     * 공공 API JSON → Festival 도메인 모델 필드 업데이트
     */
    private void updateFestivalData(Festival festival, JsonNode item) {
        String title = item.path("title").asText(null);
        String addr1 = item.path("addr1").asText("");
        String addr2 = item.path("addr2").asText("");
        String firstimage = item.path("firstimage").asText(null);
        String firstimage2 = item.path("firstimage2").asText(null);
        String tel = item.path("tel").asText(null);
        String mapx = item.path("mapx").asText(null);
        String mapy = item.path("mapy").asText(null);
        String areacode = item.path("areacode").asText();
        String sigungucode = item.path("sigungucode").asText();
        String cat1 = item.path("cat1").asText();
        String cat2 = item.path("cat2").asText();
        String cat3 = item.path("cat3").asText();

        LocalDate startDate = parseDate(item.path("eventstartdate").asText(null));
        LocalDate endDate = parseDate(item.path("eventenddate").asText(null));

        FestivalStatus newStatus = Festival.calculateStatus(startDate, endDate);

        title = title != null ? title : "제목 없음";
        if (title.length() > 255)
            title = title.substring(0, 255);
        festival.setTitle(title);

        String fullAddress = (addr1 + " " + addr2).trim();
        if (fullAddress.length() > 500)
            fullAddress = fullAddress.substring(0, 500);
        festival.setAddress(fullAddress);

        String loc = addr1.split(" ").length > 0 ? addr1.split(" ")[0] : "";
        if (loc.length() > 255)
            loc = loc.substring(0, 255);
        festival.setLocation(loc);

        if (firstimage != null && firstimage.length() > 500)
            firstimage = firstimage.substring(0, 500);
        festival.setImageUrl(firstimage);

        if (firstimage2 != null && firstimage2.length() > 500)
            firstimage2 = firstimage2.substring(0, 500);
        festival.setThumbnailUrl(firstimage2);

        if (tel != null && tel.length() > 50)
            tel = tel.substring(0, 50);
        festival.setTel(tel);

        // ── 지역코드: API 값 우선, 비어있으면 주소에서 역추론 ──
        String resolvedAreaCode = areacode.isEmpty() ? null : areacode;
        if (resolvedAreaCode == null) {
            resolvedAreaCode = RegionCodeResolver.resolveFromAddress(addr1);
            if (resolvedAreaCode != null) {
                log.debug("지역코드 역추론: '{}' → areaCode={}", addr1, resolvedAreaCode);
            }
        }
        festival.setAreaCode(resolvedAreaCode);
        festival.setSigunguCode(sigungucode.isEmpty() ? null : sigungucode);

        // ── 카테고리: API 값 우선, 비어있으면 축제 기본값(A02/A0207) 적용 ──
        festival.setCategory(RegionCodeResolver.resolveCategoryFallback(cat1.isEmpty() ? null : cat1, "cat1"));
        festival.setCategoryMid(RegionCodeResolver.resolveCategoryFallback(cat2.isEmpty() ? null : cat2, "cat2"));
        festival.setCategorySub(cat3.isEmpty() ? null : cat3);

        try {
            festival.setLongitude(mapx != null && !mapx.isEmpty() ? Double.parseDouble(mapx) : null);
            festival.setLatitude(mapy != null && !mapy.isEmpty() ? Double.parseDouble(mapy) : null);
        } catch (NumberFormatException e) {
            log.debug("Invalid mapx/mapy format for sourceId {}", festival.getSourceId());
        }

        festival.setStartDate(startDate);
        festival.setEndDate(endDate);
        if (festival.getStatus() != FestivalStatus.ENDED || !festival.isCustom()) {
            festival.setStatus(newStatus);
        }

        festival.setApiModifiedAt(LocalDateTime.now());
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
