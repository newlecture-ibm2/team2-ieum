package com.ieum.admin.festival.application.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ieum.admin.festival.domain.model.RegionMaster;
import com.ieum.admin.festival.domain.model.SigunguMaster;
import com.ieum.admin.festival.application.port.in.SyncCategoryMasterUseCase;
import com.ieum.admin.festival.application.port.in.SyncRegionMasterUseCase;
import com.ieum.admin.festival.application.result.DataSyncResult;
import com.ieum.admin.festival.application.port.out.MasterDataPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 마스터 데이터 동기화 서비스 (공공 API → DB)
 * - SyncCategoryMasterUseCase, SyncRegionMasterUseCase 구현체
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MasterDataSyncService implements SyncRegionMasterUseCase {

    private final MasterDataPort masterDataPort;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${tour-api.service-key}")
    private String apiKey;

    @Value("${tour-api.base-url}")
    private String baseUrl;

    // ──────────────────────────────────────────────
    // Region 동기화 — Tour API 의존 제거, 내부 Seed 기반으로 전환
    // (RegionSeedInitializer가 서버 기동 시 자동으로 17개 시도를 세팅하므로,
    //  수동 '지역 갱신' 버튼 시에도 Seed를 다시 적용 + 시군구만 API 동기화)
    // ──────────────────────────────────────────────
    @Override
    @Transactional
    public DataSyncResult syncRegions() {
        log.info("지역 마스터 동기화 시작 (내부 Seed 기반)...");
        try {
            // 시군구만 Tour API로 동기화 (지역 마스터는 Seed에서 관리)
            int sigunguChangeCount = doSyncSigungus();

            return DataSyncResult.builder()
                    .status("COMPLETED")
                    .type("REGION")
                    .totalChanged(sigunguChangeCount)
                    .details(DataSyncResult.Details.builder()
                            .region(0)
                            .sigungu(sigunguChangeCount)
                            .build())
                    .build();

        } catch (Exception e) {
            log.error("지역 마스터 동기화 실패: {}", e.getMessage(), e);
            return DataSyncResult.builder().status("FAILED").type("REGION").totalChanged(0).build();
        }
    }



    // ──────────────────────────────────────────────
    // Sigungu 동기화 (Tour API areaCode1?areaCode=X)
    // ──────────────────────────────────────────────
    private int doSyncSigungus() {
        log.info("시군구 마스터 동기화 시작...");
        try {
            // 활성화된 지역(region) 목록을 기준으로 각 지역별 시군구 조회
            List<RegionMaster> activeRegions = masterDataPort.findAllRegions().stream()
                    .filter(RegionMaster::isActive)
                    .toList();

            if (activeRegions.isEmpty()) {
                log.warn("활성 지역이 없어 시군구 동기화 건너뜀");
                return 0;
            }

            // 전체 DB 시군구 → Map<regionCode_sigunguCode, entity>
            List<SigunguMaster> allDbSigungus = masterDataPort.findAllSigungus();
            Map<String, SigunguMaster> dbMap = allDbSigungus.stream()
                    .collect(Collectors.toMap(
                            e -> e.getRegionCode() + "_" + e.getSigunguCode(),
                            e -> e, (a, b) -> a));

            Set<String> allApiKeys = new HashSet<>();
            int totalChangeCount = 0;
            List<SigunguMaster> toSave = new ArrayList<>();

            for (RegionMaster region : activeRegions) {
                List<JsonNode> apiItems = callTourApi("/areaCode2",
                        Map.of("areaCode", region.getRegionCode()));

                for (JsonNode item : apiItems) {
                    String code = item.path("code").asText(null);
                    String name = item.path("name").asText(null);
                    if (code == null || name == null) continue;

                    String key = region.getRegionCode() + "_" + code;
                    allApiKeys.add(key);
                    SigunguMaster existing = dbMap.get(key);

                    if (existing == null) {
                        toSave.add(SigunguMaster.builder()
                                .sigunguCode(code)
                                .regionCode(region.getRegionCode())
                                .name(name)
                                .active(true)
                                .build());
                        totalChangeCount++;
                    } else {
                        boolean changed = false;
                        SigunguMaster.SigunguMasterBuilder builder = existing.toBuilder();
                        
                        if (!name.equals(existing.getName())) {
                            builder.name(name);
                            changed = true;
                        }
                        if (!existing.isActive()) {
                            builder.active(true);
                            changed = true;
                        }
                        if (changed) {
                            toSave.add(builder.build());
                            totalChangeCount++;
                        }
                    }
                }
            }

            // SOFT DELETE: DB에 있지만 API에 없는 시군구
            for (SigunguMaster dbEntity : allDbSigungus) {
                String key = dbEntity.getRegionCode() + "_" + dbEntity.getSigunguCode();
                if (!allApiKeys.contains(key) && dbEntity.isActive()) {
                    toSave.add(dbEntity.toBuilder().active(false).build());
                    totalChangeCount++;
                }
            }

            if (!toSave.isEmpty()) {
                masterDataPort.saveAllSigungus(toSave);
            }
            log.info("시군구 마스터 동기화 완료: 총 {}건 변경", totalChangeCount);
            return totalChangeCount;

        } catch (Exception e) {
            log.error("시군구 마스터 동기화 실패: {}", e.getMessage(), e);
            return 0;
        }
    }

    // ──────────────────────────────────────────────
    // Tour API 공통 호출 메서드
    // ──────────────────────────────────────────────
    private List<JsonNode> callTourApi(String endpoint, Map<String, String> extraParams) {
        try {
            var builder = UriComponentsBuilder.fromHttpUrl(baseUrl + endpoint)
                    .queryParam("serviceKey", apiKey)
                    .queryParam("numOfRows", 100)
                    .queryParam("pageNo", 1)
                    .queryParam("MobileOS", "ETC")
                    .queryParam("MobileApp", "ieum")
                    .queryParam("_type", "json");

            for (Map.Entry<String, String> param : extraParams.entrySet()) {
                builder.queryParam(param.getKey(), param.getValue());
            }

            URI uri = builder.build(true).toUri();
            String responseBody = restTemplate.getForObject(uri, String.class);

            JsonNode rootNode = objectMapper.readTree(responseBody);
            JsonNode itemsNode = rootNode.path("response").path("body").path("items").path("item");

            List<JsonNode> result = new ArrayList<>();
            if (itemsNode.isArray()) {
                for (JsonNode item : itemsNode) {
                    result.add(item);
                }
            }
            return result;

        } catch (Exception e) {
            log.error("Tour API 호출 실패 [{}]: {}", endpoint, e.getMessage());
            return Collections.emptyList();
        }
    }
}
