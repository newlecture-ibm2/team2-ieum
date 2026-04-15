package com.ieum.admin.inquiry.adapter.out.persistence;

import com.ieum.admin.inquiry.adapter.out.persistence.entity.InquiryEntity;
import com.ieum.admin.inquiry.adapter.out.persistence.repository.InquiryAdminRepository;
import com.ieum.global.common.enums.InquiryStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * 문의 더미 데이터 초기화 (개발/테스트 전용)
 * ⚠️ @Profile("dev") — 운영 환경에서는 절대 실행되지 않음
 */
@Profile("dev")
@Component
@RequiredArgsConstructor
public class InquiryDummyDataInitializer implements CommandLineRunner {

    private final InquiryAdminRepository repository;

    @Override
    public void run(String... args) {
        if (repository.count() > 0) return;

        repository.save(InquiryEntity.builder()
                .userId(1L)
                .title("축제 정보 오류 문의")
                .content("서울 벚꽃 축제 날짜가 실제와 다릅니다. 확인 부탁드립니다.")
                .status(InquiryStatus.PENDING.name())
                .createdAt(LocalDateTime.of(2026, 4, 5, 14, 30))
                .build());

        repository.save(InquiryEntity.builder()
                .userId(1L)
                .title("계정 관련 문의")
                .content("비밀번호 변경이 되지 않습니다. 도움을 부탁드립니다.")
                .status(InquiryStatus.ANSWERED.name())
                .answer("안녕하세요. 비밀번호 재설정 이메일을 발송해드렸습니다. 확인 부탁드립니다.")
                .answeredAt(LocalDateTime.of(2026, 4, 5, 16, 0))
                .createdAt(LocalDateTime.of(2026, 4, 4, 10, 15))
                .build());

        repository.save(InquiryEntity.builder()
                .userId(1L)
                .title("리뷰 삭제 요청")
                .content("제가 작성한 리뷰가 삭제되었는데 어떤 사유인지 알 수 있을까요?")
                .status(InquiryStatus.PENDING.name())
                .createdAt(LocalDateTime.of(2026, 4, 3, 9, 0))
                .build());

        repository.save(InquiryEntity.builder()
                .userId(1L)
                .title("축제 즐겨찾기 오류")
                .content("즐겨찾기 버튼을 눌러도 반영이 되지 않습니다.")
                .status(InquiryStatus.PENDING.name())
                .createdAt(LocalDateTime.of(2026, 4, 2, 11, 20))
                .build());

        repository.save(InquiryEntity.builder()
                .userId(1L)
                .title("이벤트 참여 문의")
                .content("현재 진행 중인 이벤트 참여 방법이 궁금합니다.")
                .status(InquiryStatus.ANSWERED.name())
                .answer("현재 진행 중인 이벤트는 메인 페이지 배너를 통해 참여 가능합니다. 감사합니다.")
                .answeredAt(LocalDateTime.of(2026, 4, 2, 14, 0))
                .createdAt(LocalDateTime.of(2026, 4, 1, 16, 45))
                .build());
    }
}
