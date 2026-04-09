package com.ieum.admin.member.application.service;

import com.ieum.admin.member.application.port.out.MemberPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * 회원 정지 자동 해제 스케줄러
 * - 매일 자정(00:00)에 실행
 * - suspended_until이 현재 시각 이전인 SUSPENDED 회원을 ACTIVE로 일괄 전환
 * - Port를 통해 persistence에 접근하며, Entity를 직접 사용하지 않음
 * - JPQL Bulk Update를 사용하여 대량 처리 성능 최적화
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MemberSuspensionScheduler {

    private final MemberPort memberPort;

    /**
     * 매일 자정(00:00)에 자동 실행
     * - 정지 해제 대상: status='SUSPENDED' AND suspended_until <= now()
     * - ACTIVE로 전환 + suspended_until을 null로 초기화
     */
    @Scheduled(cron = "0 0 0 * * *") // 매일 00시(자정)에 실행
    @Transactional
    public void releaseSuspendedMembers() {
        log.info(">>> [MemberSuspensionScheduler] 정지 자동 해제 배치 시작...");

        LocalDateTime now = LocalDateTime.now();
        int releasedCount = memberPort.releaseSuspendedMembers(now);

        if (releasedCount > 0) {
            log.info(">>> [MemberSuspensionScheduler] 정지 해제 완료! 총 {}명 ACTIVE로 전환됨.", releasedCount);
        } else {
            log.info(">>> [MemberSuspensionScheduler] 정지 해제 대상 없음. 스킵.");
        }
    }
}
