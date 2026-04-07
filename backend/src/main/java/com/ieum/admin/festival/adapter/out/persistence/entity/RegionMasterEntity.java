package com.ieum.admin.festival.adapter.out.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "festival_master_region")
@Getter
@Setter
@NoArgsConstructor
public class RegionMasterEntity {

    /** Tour API 지역 코드 (예: "1", "37", "39") — 축제 검색 API 호출 시 사용 */
    @Id
    @Column(name = "region_code", length = 10, nullable = false)
    private String regionCode;

    /** 구버전 지역 이름 (Tour API 원본, 예: "서울", "전라북도") — 하위 호환용 */
    @Column(name = "name", length = 50, nullable = false)
    private String name;

    /** 최신 행정구역 공식 명칭 (예: "서울특별시", "전북특별자치도") — 화면 표시용 */
    @Column(name = "display_name", length = 50)
    private String displayName;

    /** 짧은 명칭 (예: "서울", "전북") — 컴팩트 UI용 */
    @Column(name = "short_name", length = 20)
    private String shortName;

    @Column(name = "is_active", nullable = false, columnDefinition = "boolean default true")
    private boolean isActive = true;

    public RegionMasterEntity(String regionCode, String name) {
        this.regionCode = regionCode;
        this.name = name;
        this.isActive = true;
    }

    public RegionMasterEntity(String regionCode, String name, String displayName, String shortName) {
        this.regionCode = regionCode;
        this.name = name;
        this.displayName = displayName;
        this.shortName = shortName;
        this.isActive = true;
    }

    /** 화면 표시에 사용할 이름 반환 (displayName 우선, 없으면 name fallback) */
    public String getEffectiveDisplayName() {
        return displayName != null && !displayName.isEmpty() ? displayName : name;
    }
}
