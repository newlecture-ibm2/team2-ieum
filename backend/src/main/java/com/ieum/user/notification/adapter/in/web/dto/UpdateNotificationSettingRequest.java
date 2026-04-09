package com.ieum.user.notification.adapter.in.web.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 알림 설정 변경 요청 DTO (API_USR_0060)
 */
@Getter
@NoArgsConstructor
public class UpdateNotificationSettingRequest {

    /** 전체 푸시 수신 동의 */
    private Boolean pushEnabled;

    /** 축제 시작 알림 */
    private Boolean festivalStart;

    /** 축제 종료 알림 */
    private Boolean festivalEnd;

    /** 공지사항 알림 */
    private Boolean notice;

    /** 댓글 알림 */
    private Boolean comment;
}
