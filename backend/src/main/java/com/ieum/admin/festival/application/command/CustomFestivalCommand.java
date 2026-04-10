package com.ieum.admin.festival.application.command;

import lombok.Builder;
import lombok.Getter;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDate;
import java.util.List;

/**
 * 축제 관리 Application Command 객체 (DTO -> Command)
 * 웹 요청용 DTO를 순수 서비스 계층의 Command로 격리합니다.
 */
@Getter
@Builder
public class CustomFestivalCommand {
    private final String title;
    private final String areaCode;
    private final LocalDate startDate;
    private final LocalDate endDate;
    private final String content;
    private final String category;

    private final String eventPlace;
    private final String address;
    private final String useFee;
    private final String playTime;
    private final String tel;
    private final String homepage;
    private final String sigunguCode;

    private final MultipartFile img;
    private final List<MultipartFile> extraImgs;
    private final Boolean isVisible;
}
