package com.ieum.admin.report.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;

/**
 * 사용자 참조용 읽기 전용 Entity (report 모듈 전용)
 * - reports JOIN 시 닉네임 가져오기 위해 사용
 * - 쓰기 작업 없음
 */
@Entity
@Table(name = "users")
@Getter
public class UserRef {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    @Column(nullable = false)
    private String nickname;
}
