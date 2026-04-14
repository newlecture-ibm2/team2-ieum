package com.ieum.admin.inquiry.application.port.in;

import com.ieum.admin.inquiry.application.result.InquiryItem;
import com.ieum.admin.inquiry.application.result.InquiryListResult;

/**
 * 문의 조회 UseCase (Port IN)
 */
public interface GetInquiryListUseCase {
    InquiryListResult getInquiries(int page, int size, String status, String searchType, String keyword);

    /** 문의 상세 조회 (단건) */
    InquiryItem getInquiry(Long inquiryId);
}
