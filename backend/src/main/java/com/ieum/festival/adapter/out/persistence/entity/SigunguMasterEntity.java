package com.ieum.festival.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sigungu_master",
       uniqueConstraints = {@UniqueConstraint(columnNames = {"region_code", "sigungu_code"})})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SigunguMasterEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "region_code", length = 20, nullable = false)
    private String regionCode;

    @Column(name = "sigungu_code", length = 20, nullable = false)
    private String sigunguCode;

    @Column(name = "name", length = 50, nullable = false)
    private String name;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
