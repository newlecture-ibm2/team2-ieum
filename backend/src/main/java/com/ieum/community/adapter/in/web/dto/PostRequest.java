package com.ieum.community.adapter.in.web.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PostRequest {
    private String category;
    private String title;
    private String content;
    private String areaCode;
}
