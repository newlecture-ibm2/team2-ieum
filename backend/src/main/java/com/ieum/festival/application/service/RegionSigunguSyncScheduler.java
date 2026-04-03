package com.ieum.festival.application.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ieum.festival.adapter.out.persistence.entity.RegionMasterEntity;
import com.ieum.festival.adapter.out.persistence.entity.SigunguMasterEntity;
import com.ieum.festival.adapter.out.persistence.repository.RegionMasterRepository;
import com.ieum.festival.adapter.out.persistence.repository.SigunguMasterRepository;
import com.ieum.festival.adapter.out.persistence.entity.CategoryMasterEntity;
import com.ieum.festival.adapter.out.persistence.repository.CategoryMasterRepository;
import com.ieum.festival.domain.model.CustomRegion;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RegionSigunguSyncScheduler {

    private final RegionMasterRepository regionRepo;
    private final SigunguMasterRepository sigunguRepo;
    private final CategoryMasterRepository categoryRepo;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${tour-api.service-key}")
    private String serviceKey;

    @Value("${tour-api.base-url}")
    private String baseUrl;

    @PostConstruct
    @Transactional
    public void seedCustomRegions() {
        for (CustomRegion customRegion : CustomRegion.values()) {
            if (!regionRepo.existsById(customRegion.getValue())) {
                regionRepo.save(RegionMasterEntity.builder()
                        .regionCode(customRegion.getValue())
                        .name(customRegion.getLabel())
                        .type(customRegion.getType())
                        .isActive(true)
                        .updatedAt(LocalDateTime.now())
                        .build());
            }
        }
        
        seedCategories();
    }

    private void seedCategories() {
        java.util.Map<String, String> standardCat = new java.util.HashMap<>();
        standardCat.put("A02070100", "문화관광축제");
        standardCat.put("A02070200", "일반축제");
        standardCat.put("A02080100", "전통공연/예술");
        standardCat.put("A02080200", "연극");
        standardCat.put("A02080300", "뮤지컬");
        standardCat.put("A02080400", "오페라");
        standardCat.put("A02080500", "전시/미술");
        standardCat.put("A02080600", "박람회");
        standardCat.put("A02081300", "대중공연");
        standardCat.put("A02080700", "기타행사");
        standardCat.put("A02", "인문(문화/예술/역사)");
        standardCat.put("A0207", "축제");
        standardCat.put("A0208", "공연/행사");

        java.util.Map<String, String> customCat = new java.util.HashMap<>();
        customCat.put("LOCAL", "지역축제");
        customCat.put("SCHOOL", "대학축제");
        customCat.put("COMPANY", "기업행사");
        customCat.put("ONLINE", "온라인행사");
        customCat.put("ETC", "기타");

        for (java.util.Map.Entry<String, String> entry : standardCat.entrySet()) {
            if (!categoryRepo.existsById(entry.getKey())) {
                categoryRepo.save(CategoryMasterEntity.builder()
                        .categoryCode(entry.getKey())
                        .name(entry.getValue())
                        .type("STANDARD")
                        .isActive(true)
                        .updatedAt(LocalDateTime.now())
                        .build());
            }
        }

        for (java.util.Map.Entry<String, String> entry : customCat.entrySet()) {
            if (!categoryRepo.existsById(entry.getKey())) {
                categoryRepo.save(CategoryMasterEntity.builder()
                        .categoryCode(entry.getKey())
                        .name(entry.getValue())
                        .type("CUSTOM")
                        .isActive(true)
                        .updatedAt(LocalDateTime.now())
                        .build());
            }
        }
        log.info("카테고리 마스터 테이블 Seeding 완료.");
    }

    @Scheduled(cron = "0 0 3 * * ?") // 매일 03시 시행
    @Transactional
    public void syncRegionsAndSigungus() {
        System.out.println("=============== syncRegionsAndSigungus FORCED EXECUTION START ==============");
        log.info("TourAPI 지역(Region)/시군구(Sigungu) 마스터 테이블 배치 동기화 시작...");
        try {
            String regionUrl = baseUrl + "/areaCode1?serviceKey=" + serviceKey + "&MobileOS=ETC&MobileApp=ieum&_type=json&numOfRows=100&pageNo=1";
            String rawResponse = restTemplate.getForObject(URI.create(regionUrl), String.class);
            log.info("TourAPI 지역 목록 raw response: {}", rawResponse);
            JsonNode root = mapper.readTree(rawResponse);
            JsonNode items = root.path("response").path("body").path("items").path("item");

            // 공공 API 타입(STANDARD) 지역들을 먼저 비활성화 처리해둠.
            // 이후 API에서 수신된 코드만 활성화 처리 -> 응답에서 사라진 코드는 자동 비활성화 됨 (Soft Delete)
            List<RegionMasterEntity> standards = regionRepo.findByType("STANDARD");
            standards.forEach(s -> s.setActive(false));

            if (items.isArray()) {
                for (JsonNode item : items) {
                    String code = item.path("code").asText();
                    String name = item.path("name").asText();

                    RegionMasterEntity entity = regionRepo.findById(code).orElse(
                            RegionMasterEntity.builder()
                                    .regionCode(code)
                                    .type("STANDARD")
                                    .build()
                    );
                    entity.setName(name);
                    entity.setActive(true);
                    entity.setUpdatedAt(LocalDateTime.now());
                    regionRepo.save(entity);

                    // 해당 지역코드에 대한 시군구 동기화 진행
                    syncSigungusForRegion(code);
                }
            }
            log.info("TourAPI 지역/시군구 배치 동기화 성공.");
        } catch (Exception e) {
            log.warn("TourAPI 지역/시군구 배치 동기화 실패 (API 응답 에러 등). 사전에 정의된 정적 데이터로 Fallback 합니다. 원인: {}", e.getMessage());
            fallbackSyncRegionsAndSigungus();
        }
    }

    private void fallbackSyncRegionsAndSigungus() {
        try {
            java.util.Map<String, String> standardRegions = new java.util.HashMap<>();
            standardRegions.put("1", "서울");
            standardRegions.put("2", "인천");
            standardRegions.put("3", "대전");
            standardRegions.put("4", "대구");
            standardRegions.put("5", "광주");
            standardRegions.put("6", "부산");
            standardRegions.put("7", "울산");
            standardRegions.put("8", "세종특별자치시");
            standardRegions.put("31", "경기도");
            standardRegions.put("32", "강원특별자치도");
            standardRegions.put("33", "충청북도");
            standardRegions.put("34", "충청남도");
            standardRegions.put("35", "경상북도");
            standardRegions.put("36", "경상남도");
            standardRegions.put("37", "전북특별자치도");
            standardRegions.put("38", "전라남도");
            standardRegions.put("39", "제주특별자치도");

            for (java.util.Map.Entry<String, String> entry : standardRegions.entrySet()) {
                String code = entry.getKey();
                String name = entry.getValue();

                RegionMasterEntity entity = regionRepo.findById(code).orElse(
                        RegionMasterEntity.builder()
                                .regionCode(code)
                                .type("STANDARD")
                                .build()
                );
                entity.setName(name);
                entity.setActive(true);
                entity.setUpdatedAt(LocalDateTime.now());
                regionRepo.save(entity);
            }

            org.springframework.core.io.ClassPathResource resource = new org.springframework.core.io.ClassPathResource("sigungu.json");
            if (resource.exists()) {
                JsonNode sigunguJson = mapper.readTree(resource.getInputStream());
                java.util.Iterator<String> fieldNames = sigunguJson.fieldNames();
                while (fieldNames.hasNext()) {
                    String regionCode = fieldNames.next();
                    JsonNode sigungusNode = sigunguJson.path(regionCode);
                    if (sigungusNode.isArray()) {
                        for (JsonNode sItem : sigungusNode) {
                            String code = sItem.path("value").asText();
                            String name = sItem.path("label").asText();

                            SigunguMasterEntity sm = sigunguRepo.findByRegionCodeAndSigunguCode(regionCode, code).orElse(
                                    SigunguMasterEntity.builder()
                                            .regionCode(regionCode)
                                            .sigunguCode(code)
                                            .build()
                            );
                            sm.setName(name);
                            sm.setActive(true);
                            sm.setUpdatedAt(LocalDateTime.now());
                            sigunguRepo.save(sm);
                        }
                    }
                }
            }
            log.info("정적 데이터 기반 지역/시군구 Fallback 동기화 완료.");
        } catch (Exception ex) {
            log.error("Fallback 동기화 중 에러 발생", ex);
        }
    }

    private void syncSigungusForRegion(String regionCode) {
        try {
            String sigunguUrl = baseUrl + "/areaCode1?serviceKey=" + serviceKey + "&MobileOS=ETC&MobileApp=ieum&_type=json&numOfRows=100&pageNo=1&areaCode=" + regionCode;
            JsonNode root = mapper.readTree(restTemplate.getForObject(URI.create(sigunguUrl), String.class));
            JsonNode items = root.path("response").path("body").path("items").path("item");

            List<SigunguMasterEntity> existings = sigunguRepo.findByRegionCode(regionCode);
            existings.forEach(s -> s.setActive(false));

            if (items.isArray()) {
                for (JsonNode item : items) {
                    String code = item.path("code").asText();
                    String name = item.path("name").asText();

                    SigunguMasterEntity sm = sigunguRepo.findByRegionCodeAndSigunguCode(regionCode, code).orElse(
                            SigunguMasterEntity.builder()
                                    .regionCode(regionCode)
                                    .sigunguCode(code)
                                    .build()
                    );
                    sm.setName(name);
                    sm.setActive(true);
                    sm.setUpdatedAt(LocalDateTime.now());
                    sigunguRepo.save(sm);
                }
            }
        } catch (Exception e) {
            log.error("Failed to sync Sigungus for regionCode={}", regionCode, e);
        }
    }
}
