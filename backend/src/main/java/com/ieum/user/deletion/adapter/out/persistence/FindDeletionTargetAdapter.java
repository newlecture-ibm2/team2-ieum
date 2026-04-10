package com.ieum.user.deletion.adapter.out.persistence;

import com.ieum.admin.member.adapter.out.persistence.repository.MemberAdminRepository;
import com.ieum.admin.member.domain.model.MemberStatus; // 상수 사용
import com.ieum.user.deletion.application.port.out.FindDeletionTargetPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 전역 물리 삭제용 조회 전용 어댑터
 * - 기존 Admin의 member repository 재사용을 통해 유저 테이블에 접근하지만
 *   책임과 인터페이스는 deletion 패키지 내부에 독립시킵니다.
 */
@Component
@RequiredArgsConstructor
public class FindDeletionTargetAdapter implements FindDeletionTargetPort {

    private final MemberAdminRepository memberAdminRepository;

    @Override
    public List<Long> findExpiredWithdrawals(int days) {
        // days 이전 시점을 cutoff 로 계산
        LocalDateTime cutoff = LocalDateTime.now().minusDays(days);
        // 상태값 하드코딩 회피 (해당 상태 상수 사용이 명시되어 있다면 MemberStatus 확장 참조)
        return memberAdminRepository.findMemberIdsByStatusAndUpdatedAtBefore(MemberStatus.WITHDRAWAL, cutoff);
    }

    @Override
    public List<Long> findAllByStatus(String status) {
        return memberAdminRepository.findMemberIdsByStatus(status);
    }
}
