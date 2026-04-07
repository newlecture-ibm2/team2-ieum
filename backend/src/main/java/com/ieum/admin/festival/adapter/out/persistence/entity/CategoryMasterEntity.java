package com.ieum.admin.festival.adapter.out.persistence.entity;

import com.ieum.admin.festival.domain.model.CategoryMaster;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "festival_master_category")
@Getter
@Setter
@NoArgsConstructor
public class CategoryMasterEntity {

    @Id
    @Column(name = "code", length = 10, nullable = false)
    private String code;

    @Column(name = "name", length = 50, nullable = false)
    private String name;

    @Column(name = "type", length = 20)
    private String type; // STANDARD, CUSTOM

    @Column(name = "is_active", nullable = false, columnDefinition = "boolean default true")
    private boolean isActive = true;

    @Column(name = "level", nullable = false, columnDefinition = "integer default 1")
    private Integer level;

    @Column(name = "parent_code", length = 10)
    private String parentCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_code", insertable = false, updatable = false)
    private CategoryMasterEntity parent;

    @OneToMany(mappedBy = "parent")
    private List<CategoryMasterEntity> children = new ArrayList<>();

    public CategoryMasterEntity(String code, String name, String type, Integer level, String parentCode) {
        this.code = code;
        this.name = name;
        this.type = type;
        this.isActive = true;
        this.level = level == null ? 1 : level;
        this.parentCode = parentCode;
    }

    public CategoryMaster toDomain() {
        return CategoryMaster.builder()
                .code(this.code)
                .name(this.name)
                .type(this.type)
                .isActive(this.isActive)
                .level(this.level)
                .parentCode(this.parentCode)
                .build();
    }

    public static CategoryMasterEntity fromDomain(CategoryMaster master) {
        CategoryMasterEntity entity = new CategoryMasterEntity();
        entity.setCode(master.getCode());
        entity.setName(master.getName());
        entity.setType(master.getType());
        entity.setActive(master.isActive());
        entity.setLevel(master.getLevel() == null ? 1 : master.getLevel());
        entity.setParentCode(master.getParentCode());
        return entity;
    }
}
