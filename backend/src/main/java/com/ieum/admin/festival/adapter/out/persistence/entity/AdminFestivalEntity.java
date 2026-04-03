package com.ieum.admin.festival.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "festivals")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminFestivalEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "source_id", unique = true, length = 100)
    private String sourceId;

    @Column(name = "source", nullable = false)
    @ColumnDefault("'MANUAL'")
    private String source;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "overview", columnDefinition = "TEXT")
    private String overview;

    @Column(name = "location", length = 255)
    private String location;

    @Column(name = "address", length = 500)
    private String address;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "status", nullable = false)
    @ColumnDefault("'UPCOMING'")
    private String status;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;

    @Column(name = "extra_images", columnDefinition = "TEXT")
    private String extraImages;

    @Column(name = "homepage", length = 500)
    private String homepage;

    @Column(name = "tel", length = 50)
    private String tel;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "category", length = 10)
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

    @Column(name = "program", columnDefinition = "TEXT")
    private String program;

    @Column(name = "use_fee", length = 200)
    private String useFee;

    @Column(name = "sponsor", length = 100)
    private String sponsor;

    @Column(name = "is_custom", nullable = false)
    @ColumnDefault("false")
    private boolean isCustom;

    @Column(name = "is_visible", nullable = false)
    @ColumnDefault("true")
    private boolean isVisible;

    @Column(name = "avg_rating", nullable = false)
    @ColumnDefault("0.0")
    private Double avgRating;

    @Column(name = "review_count", nullable = false)
    @ColumnDefault("0")
    private Integer reviewCount;

    @Column(name = "favorite_count", nullable = false)
    @ColumnDefault("0")
    private Integer favoriteCount;

    @Column(name = "view_count", nullable = false)
    @ColumnDefault("0")
    private Integer viewCount;

    @Column(name = "api_modified_at")
    private LocalDateTime apiModifiedAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (this.source == null) this.source = "MANUAL";
        if (this.status == null) this.status = "UPCOMING";
        if (this.avgRating == null) this.avgRating = 0.0;
        if (this.reviewCount == null) this.reviewCount = 0;
        if (this.favoriteCount == null) this.favoriteCount = 0;
        if (this.viewCount == null) this.viewCount = 0;
        this.createdAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
