package com.ieum.user.inquiry.application.port.in;

import lombok.Builder;
import lombok.Getter;

/**
 * [InPort] 1:1 문의 등록 유스케이스 정의
 */
public interface RegisterInquiryUseCase {

    Long registerInquiry(Command command);

    @Getter
    @Builder
    class Command {
        private final Long userId;
        private final String title;
        private final String content;
        private final String type;
    }
}
