package com.ieum.admin.inquiry.application.service;

import com.ieum.admin.inquiry.application.port.in.AnswerInquiryUseCase;
import com.ieum.admin.inquiry.application.port.in.GetInquiryListUseCase;
import com.ieum.admin.inquiry.application.port.out.InquiryPort;
import com.ieum.admin.inquiry.application.result.InquiryItem;
import com.ieum.admin.inquiry.application.result.InquiryListResult;
import com.ieum.admin.inquiry.domain.model.Inquiry;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 문의 관리 서비스 (UseCase 구현체)
 * - Port 인터페이스만 의존
 * - Entity 직접 사용 금지
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InquiryAdminService implements GetInquiryListUseCase, AnswerInquiryUseCase {

    private final InquiryPort inquiryPort;

    @Override
    public InquiryListResult getInquiries(int page, int size, String status, String searchType, String keyword) {
        Page<Inquiry> inquiries = inquiryPort.findAll(status, searchType, keyword, PageRequest.of(page - 1, size));

        return InquiryListResult.builder()
                .content(inquiries.getContent().stream().map(this::toItem).toList())
                .totalPages(inquiries.getTotalPages())
                .totalElements(inquiries.getTotalElements())
                .pendingCount(inquiryPort.countByStatus("PENDING"))
                .answeredCount(inquiryPort.countByStatus("ANSWERED"))
                .build();
    }

    @Override
    public InquiryItem getInquiry(Long inquiryId) {
        Inquiry inquiry = inquiryPort.findByIdWithNickname(inquiryId)
                .orElseThrow(() -> new IllegalArgumentException("INQUIRY_NOT_FOUND"));
        return toItem(inquiry);
    }

    @Override
    @Transactional
    public void answerInquiry(Long inquiryId, String answer) {
        // Port 내부에서 NOT_FOUND / ALREADY_ANSWERED 예외 발생
        inquiryPort.answer(inquiryId, answer);
    }

    private InquiryItem toItem(Inquiry i) {
        return InquiryItem.builder()
                .id(i.getId())
                .title(i.getTitle())
                .content(i.getContent())
                .status(i.getStatus())
                .answer(i.getAnswer())
                .answeredAt(i.getAnsweredAt())
                .authorNickname(i.getAuthorNickname())
                .createdAt(i.getCreatedAt())
                .build();
    }
}
