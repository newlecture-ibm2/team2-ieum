package com.ieum.admin.member.application.service;

import com.ieum.admin.member.application.port.out.MemberPort;
import com.ieum.global.common.enums.UserStatus;
import com.ieum.user.deletion.application.port.in.ForceDeleteUserUseCase;
import com.ieum.user.deletion.application.port.out.FindDeletionTargetPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 일일 회원 상태 정리 배치 스케줄러
 * - [1] 매일 자정(00:00)에 실행되어 SUSPENDED 회원의 정지를 ACTIVE로 복구
 * - [2] 매일 자정(00:00)에 실행되어 30일이 경과한 WITHDRAWAL 탈퇴 유예자들을 완전 삭제 배분
 * - [3] 매일 자정(00:00)에 삭제 실패로 남아있는 중간 처리 상태 "DELETED" 유저들을 식별하여 재호출
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MemberSuspensionScheduler {

    private final MemberPort memberPort;
    private final FindDeletionTargetPort findDeletionTargetPort;
    private final ForceDeleteUserUseCase forceDeleteUserUseCase;

    @Scheduled(cron = "0 0 0 * * *") // 매일 00시(자정)에 실행
    // 스케줄러 자체에 @Transactional 안 거는 것 권장 -> 포트/유스케이스가 트랜잭션을 자체 제어하게 함
    public void processDailyMemberJobs() {
        log.info(">>> [MemberSuspensionScheduler] 일일 회원 상태 정리 배치 시작...");

        // 1. 만료된 회원 징계 복구 (admin 권한, SUSPENDED -> ACTIVE)
        try {
            LocalDateTime now = LocalDateTime.now();
            int releasedCount = memberPort.releaseSuspendedMembers(now);
            if (releasedCount > 0) {
                log.info(">>> [MemberSuspensionScheduler] 정지 해제 완료! 총 {}명 ACTIVE로 전환됨.", releasedCount);
            } else {
                log.info(">>> [MemberSuspensionScheduler] 정지 해제 대상 없음. 스킵.");
            }
        } catch (Exception e) {
            log.error("[MemberSuspensionScheduler] 징계 해제 중 오류 발생: {}", e.getMessage(), e);
        }

        // 2. 30일 경과한 탈퇴유예 유저(WITHDRAWAL) 물리 파기 진행
        List<Long> expiredWithdrawals = findDeletionTargetPort.findExpiredWithdrawals(30);
        if (!expiredWithdrawals.isEmpty()) {
            log.info(">>> [MemberSuspensionScheduler] 30일 경과 만료자 {}명 파기 진행", expiredWithdrawals.size());
        }
        for (Long userId : expiredWithdrawals) {
            try {
                // 한 명 실패 시에도 다음 사람 처리를 이어가기 위해 try-catch 보장
                forceDeleteUserUseCase.execute(userId);
            } catch (Exception e) {
                log.error("[MemberSuspensionScheduler] 만료자 탈퇴 파기 실패 - userId: {}", userId, e);
            }
        }

        // 3. 삭제 에러 등으로 남아있는 중간 잔여고아 상태 (DELETED) 유저의 파기 재진행 (Recovery)
        List<Long> failedDeletedStands = findDeletionTargetPort.findAllByStatus(UserStatus.DELETED.name());
        if (!failedDeletedStands.isEmpty()) {
            log.info(">>> [MemberSuspensionScheduler] 파기 실패(DELETED 잔류) 복구 대상자 {}명 재호출 진행", failedDeletedStands.size());
        }
        for (Long userId : failedDeletedStands) {
            try {
                // 한 명 실패 시에도 다음 사람 처리를 이어나감
                forceDeleteUserUseCase.execute(userId);
            } catch (Exception e) {
                log.error("[MemberSuspensionScheduler] 재시도 파기 최종 실패 - userId: {}", userId, e);
            }
        }

        log.info(">>> [MemberSuspensionScheduler] 일일 회원 배치 프로세스 정상 완료");
    }

    /**
     * 관리자 수동 조작 - 정지(SUSPENDED) 중인 모든 회원을 즉시 영구 탈퇴(물리 삭제) 처리합니다.
     */
    public int processManualForceDeleteSuspendedUsers() {
        log.info(">>> [MemberSuspensionScheduler] 수동 발동: 현재 정지중(SUSPENDED)인 회원 전원 즉시 탈퇴(물리 파기) 진행!");
        List<Long> suspendedList = findDeletionTargetPort.findAllByStatus(UserStatus.SUSPENDED.name());
        int successCount = 0;
        for (Long userId : suspendedList) {
            try {
                forceDeleteUserUseCase.execute(userId);
                successCount++;
            } catch (Exception e) {
                log.error("[MemberSuspensionScheduler] 수동 발동 탈퇴 실패 - userId: {}", userId, e);
            }
        }
        log.info(">>> [MemberSuspensionScheduler] 수동 발동 완료: 총 {}명 시도 중 {}명 삭제 완료", suspendedList.size(), successCount);
        return successCount;
    }
}
