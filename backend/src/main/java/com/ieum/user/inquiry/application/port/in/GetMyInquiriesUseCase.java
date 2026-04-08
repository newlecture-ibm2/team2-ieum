package com.ieum.user.inquiry.application.port.in;

import com.ieum.admin.inquiry.domain.model.Inquiry;
import java.util.List;

/**
 * [Port IN] 내 문의 내역 조회 유스케이스
 */
public interface GetMyInquiriesUseCase {
    List<Inquiry> getMyInquiries(Long userId);
}
