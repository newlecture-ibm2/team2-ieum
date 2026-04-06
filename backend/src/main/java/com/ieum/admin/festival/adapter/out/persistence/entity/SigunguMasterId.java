package com.ieum.admin.festival.adapter.out.persistence.entity;

import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SigunguMasterId implements Serializable {
    private String regionCode;
    private String sigunguCode;
}
