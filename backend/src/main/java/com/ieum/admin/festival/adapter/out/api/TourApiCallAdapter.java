package com.ieum.admin.festival.adapter.out.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ieum.admin.festival.application.dto.ApiCategoryItem;
import com.ieum.admin.festival.application.port.out.TourApiOutPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class TourApiCallAdapter implements TourApiOutPort {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper;

    @Value("${tour-api.service-key}")
    private String apiKey;

    @Value("${tour-api.base-url}")
    private String baseUrl;

    @Override
    public List<ApiCategoryItem> fetchCategoryOptions(String cat1, String cat2) {
        log.info("Tour API 조회: /categoryCode1 (cat1={}, cat2={})", cat1, cat2);
        
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(baseUrl + "/categoryCode2")
                .queryParam("serviceKey", apiKey)
                .queryParam("MobileOS", "ETC")
                .queryParam("MobileApp", "ieum")
                .queryParam("_type", "json")
                .queryParam("numOfRows", "1000"); // Ensure we get all options

        if (cat1 != null && !cat1.isEmpty()) {
            builder.queryParam("cat1", cat1);
        }
        if (cat2 != null && !cat2.isEmpty()) {
            builder.queryParam("cat2", cat2);
        }

        URI uri = builder.build(true).toUri();
        List<ApiCategoryItem> result = new ArrayList<>();

        try {
            String response = restTemplate.getForObject(uri, String.class);
            JsonNode rootNode = objectMapper.readTree(response);
            JsonNode itemsNode = rootNode.path("response").path("body").path("items").path("item");

            if (itemsNode.isArray()) {
                for (JsonNode item : itemsNode) {
                    String code = item.path("code").asText(null);
                    String name = item.path("name").asText(null);
                    if (code != null && name != null) {
                        result.add(new ApiCategoryItem(code, name));
                    }
                }
            } else if (itemsNode.isObject()) {
                String code = itemsNode.path("code").asText(null);
                String name = itemsNode.path("name").asText(null);
                if (code != null && name != null) {
                    result.add(new ApiCategoryItem(code, name));
                }
            }
        } catch (Exception e) {
            log.error("Tour API 조회 실패 (cat1={}, cat2={}): {}", cat1, cat2, e.getMessage());
        }
        return result;
    }
}
