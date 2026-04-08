package com.ieum.user.inquiry.application.service;

import com.ieum.user.inquiry.application.port.out.UserInquiryPort;
import com.ieum.user.inquiry.domain.model.UserInquiry;
import com.ieum.user.inquiry.application.port.in.GetMyInquiriesUseCase;
import com.ieum.user.inquiry.application.port.in.RegisterInquiryUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * [Service] 1:1 문의 등록 및 조회 비즈니스 로직 실장
 */
@Service
@RequiredArgsConstructor
public class InquiryService implements RegisterInquiryUseCase, GetMyInquiriesUseCase {

    private final UserInquiryPort userInquiryPort;

    @Override
    @Transactional
    public Long registerInquiry(Command command) {
        // 0. 유효성 검사 (제목 50자, 내용 200자)
        if (command.getTitle() == null || command.getTitle().length() > 200) {
            throw new IllegalArgumentException("문의 제목은 최대 200자까지 입력 가능합니다.");
        }
        if (command.getContent() == null || command.getContent().length() > 2000) {
            throw new IllegalArgumentException("문의 내용은 최대 2000자까지 입력 가능합니다.");
        }

        // 1. 도메인 모델 생성 (기본 상태 PENDING)
        UserInquiry inquiry = UserInquiry.builder()
                .userId(command.getUserId())
                .title(command.getTitle())
                .content(command.getContent())
                .status("PENDING")
                .build();

        // 2. 영속성 포트를 통한 저장
        return userInquiryPort.save(inquiry);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserInquiry> getMyInquiries(Long userId) {
        return userInquiryPort.findByUserId(userId);
    }
}
