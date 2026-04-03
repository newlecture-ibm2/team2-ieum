package com.ieum.festival.application.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ieum.festival.adapter.out.persistence.entity.RegionMasterEntity;
import com.ieum.festival.adapter.out.persistence.entity.SigunguMasterEntity;
import com.ieum.festival.adapter.out.persistence.repository.RegionMasterRepository;
import com.ieum.festival.adapter.out.persistence.repository.SigunguMasterRepository;
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
        log.info("자체 기획(CUSTOM) 지역 마스터 데이터 Seeding 완료.");
        
        // 애플리케이션 시작 시 최초 1회 즉시 동기화 실행 (선택적)
        // syncRegionsAndSigungus(); 
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
            log.error("TourAPI 지역/시군구 배치 동기화 실패", e);
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
