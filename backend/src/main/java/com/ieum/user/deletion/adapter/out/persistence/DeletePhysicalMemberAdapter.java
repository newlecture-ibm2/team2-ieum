package com.ieum.user.deletion.adapter.out.persistence;

import com.ieum.admin.member.adapter.out.persistence.repository.MemberAdminRepository;
import com.ieum.user.deletion.application.port.out.DeletePhysicalMemberPort;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * 최종 회원 레코드 물리 삭제 어댑터
 * - 모든 제약 조건이 해금된 상태의 텅 빈 users 행을 삭제합니다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DeletePhysicalMemberAdapter implements DeletePhysicalMemberPort {

    @PersistenceContext
    private final EntityManager em;

    private final MemberAdminRepository memberAdminRepository;

    @Override
    @Transactional
    public void deleteUserRecord(Long userId) {
        log.info("[DeletePhysicalMemberAdapter] users 테이블 본체 최종 물리 파기 시도 - userId: {}", userId);
        
        try {
            // [FK 원천 방어]: 타 유저의 신고나 문의를 처리했던 Admin의 경우 FK(RESTRICT) 때문에 삭제가 차단되는 고질적 오류 해제
            try {
                em.createNativeQuery("UPDATE inquiries SET answered_by = NULL WHERE answered_by = :userId").setParameter("userId", userId).executeUpdate();
                em.createNativeQuery("UPDATE report_responses SET admin_id = NULL WHERE admin_id = :userId").setParameter("userId", userId).executeUpdate();
                em.createNativeQuery("UPDATE batch_log SET triggered_by = NULL WHERE triggered_by = :userId").setParameter("userId", userId).executeUpdate();
            } catch(Exception ignored) {} // FK 해제 안전 파서

            // JPQL Modifying을 통한 벌크 연산으로 이미 데이터가 없을 때의 Empty 예외를 멱등성 있게 방어함
            int deletedCount = memberAdminRepository.deletePhysicalMember(userId);
            
            if (deletedCount > 0) {
                log.info("[DeletePhysicalMemberAdapter] 정상 처리 - 회원 레코드 삭제 완료. userId: {}", userId);
            } else {
                log.warn("[DeletePhysicalMemberAdapter] 방어 처리 - 삭제할 유저 레코드가 존재하지 않습니다. (이미 이전에 파기됨) userId: {}", userId);
            }
        } catch (Exception e) {
            log.error("[DeletePhysicalMemberAdapter] 심각한 오류 - 회원 본체 파기 실패. 연관 데이터(FK) 잔류 의심. userId: {}, 사유: {}", userId, e.getMessage(), e);
            throw e; // 상위 Orchestrator 로 예외를 던져 루프를 끊고 재시도를 유도합니다.
        }
    }
}
