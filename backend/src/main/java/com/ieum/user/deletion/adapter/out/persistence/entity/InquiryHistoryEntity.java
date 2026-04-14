package com.ieum.user.deletion.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 회원 물리 파기 시 Inquiries(문의) 데이터 보존용 로그 테이블
 * - 외래키(FK) 설정 절대 금지
 */
@Entity
@Table(name = "inquiry_history")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class InquiryHistoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "original_id", nullable = false)
    private Long originalId;

    // 절대 FK 설정 금지. 단순 회원 식별형 숫자 복사
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(length = 20)
    private String status;

    @Column(columnDefinition = "TEXT")
    private String answer;

    @Column(name = "answered_at")
    private LocalDateTime answeredAt;

    @Column(name = "answered_by")
    private Long answeredBy;

    // 원본 데이터 생성 시간
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // 삭제 사유 분류 (USER_HARD_DELETE)
    @Column(name = "deleted_reason", length = 30)
    private String deletedReason;

    // 데이터가 역사로 치환 파기된 시간
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @PrePersist
    public void prePersist() {
        this.deletedAt = LocalDateTime.now();
        this.deletedReason = "USER_HARD_DELETE";
    }
}
