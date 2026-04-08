package com.ieum.admin.inquiry.application.port.in;

/**
 * 문의 답변 등록 UseCase (Port IN)
 */
public interface AnswerInquiryUseCase {
    void answerInquiry(Long inquiryId, String answer);
}
