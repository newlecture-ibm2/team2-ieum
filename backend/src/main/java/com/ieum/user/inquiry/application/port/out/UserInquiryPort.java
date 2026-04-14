package com.ieum.user.inquiry.application.port.out;

import com.ieum.user.inquiry.domain.model.UserInquiry;
import java.util.List;

/**
 * [Port OUT] 데이터 영속성 계층과의 통신 명세
 */
public interface UserInquiryPort {
    Long save(UserInquiry inquiry);
    List<UserInquiry> findByUserId(Long userId);
}
