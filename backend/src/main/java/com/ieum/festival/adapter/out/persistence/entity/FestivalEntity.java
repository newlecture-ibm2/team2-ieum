package com.ieum.festival.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.DynamicUpdate;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "festivals")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
@DynamicUpdate
public class FestivalEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "source_id", unique = true, length = 100)
    private String sourceId;

    @Column(length = 255, nullable = false)
    private String title;

    @Column(length = 500)
    private String address;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;

    @Column(columnDefinition = "TEXT")
    private String overview;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 50)
    private String tel;

    @Column(name = "use_fee", length = 200)
    private String useFee;

    @Column(name = "extra_images", columnDefinition = "TEXT")
    private String extraImages; // 콤마로 구분된 여러 장의 갤러리 이미지 URL

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "status", length = 20)
    private String status; // UPCOMING, ONGOING, ENDED

    @Column(length = 20)
    private String source; // API, MANUAL

    private Double latitude;
    private Double longitude;

    // --- 새로 추가된 속성들 (schema.sql 동기화) --- //
    @Column(length = 255)
    private String location;

    @Column(length = 500)
    private String homepage;

    @Column(length = 10)
    private String category;

    @Column(name = "category_mid", length = 10)
    private String categoryMid;

    @Column(name = "category_sub", length = 10)
    private String categorySub;

    @Column(name = "area_code", length = 10)
    private String areaCode;

    @Column(name = "sigungu_code", length = 5)
    private String sigunguCode;

    @Column(name = "ldong_code", length = 20)
    private String ldongCode;

    @Column(name = "event_place", length = 200)
    private String eventPlace;

    @Column(name = "play_time", length = 200)
    private String playTime;

    @Column(columnDefinition = "TEXT")
    private String program;

    @Column(length = 100)
    private String sponsor;

    @Column(name = "is_custom")
    @Builder.Default
    private Boolean isCustom = false;

    @Column(name = "is_visible")
    @Builder.Default
    private Boolean isVisible = true;

    @Column(name = "avg_rating")
    @Builder.Default
    private Double avgRating = 0.0;

    @Column(name = "review_count")
    @Builder.Default
    private Integer reviewCount = 0;

    @Column(name = "favorite_count", nullable = false)
    @Builder.Default
    private Integer favoriteCount = 0;

    @Column(name = "view_count")
    @Builder.Default
    private Integer viewCount = 0;

    @Column(name = "api_modified_at")
    private LocalDateTime apiModifiedAt;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
