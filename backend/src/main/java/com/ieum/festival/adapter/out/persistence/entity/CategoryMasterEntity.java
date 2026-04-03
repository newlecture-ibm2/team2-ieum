package com.ieum.festival.adapter.out.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "category_master")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryMasterEntity {

    @Id
    @Column(name = "category_code", length = 20)
    private String categoryCode;

    @Column(name = "name", length = 50, nullable = false)
    private String name;

    @Column(name = "type", length = 20, nullable = false)
    private String type; // STANDARD, CUSTOM

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
