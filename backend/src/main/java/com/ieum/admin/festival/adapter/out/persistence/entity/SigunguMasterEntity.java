package com.ieum.admin.festival.adapter.out.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "master_sigungu")
@IdClass(SigunguMasterId.class)
@Getter
@Setter
@NoArgsConstructor
public class SigunguMasterEntity {

    @Id
    @Column(name = "region_code", length = 10, nullable = false)
    private String regionCode;

    @Id
    @Column(name = "sigungu_code", length = 10, nullable = false)
    private String sigunguCode;

    @Column(name = "name", length = 50, nullable = false)
    private String name;

    @Column(name = "is_active", nullable = false, columnDefinition = "boolean default true")
    private boolean isActive = true;

    public SigunguMasterEntity(String sigunguCode, String regionCode, String name) {
        this.sigunguCode = sigunguCode;
        this.regionCode = regionCode;
        this.name = name;
        this.isActive = true;
    }
}
