package com.ieum.admin.festival.adapter.in.web.request;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDate;

@Data
public class CustomFestivalRequest {
    private String title;
    private String region;
    private LocalDate startDate;
    private LocalDate endDate;
    private String content;
    private String category;
    private MultipartFile img;
    private Boolean isVisible; // nullable for POST (default true), provided usually for PUT
}
