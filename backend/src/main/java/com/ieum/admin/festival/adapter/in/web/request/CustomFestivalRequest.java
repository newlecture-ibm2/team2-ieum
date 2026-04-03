package com.ieum.admin.festival.adapter.in.web.request;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDate;

@Data
public class CustomFestivalRequest {
    private String title;
    private String areaCode;
    private LocalDate startDate;
    private LocalDate endDate;
    private String content;
    private String category;
    
    // 추가 세부 필드 (DB 축제 테이블과 연동)
    private String eventPlace;
    private String address;
    private String useFee;
    private String playTime;
    private String tel;
    private String homepage;
    private String sigunguCode;

    private MultipartFile img;
    private java.util.List<MultipartFile> extraImgs;
    private Boolean isVisible; // nullable for POST (default true), provided usually for PUT
}
