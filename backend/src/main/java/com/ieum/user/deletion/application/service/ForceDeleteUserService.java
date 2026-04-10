package com.ieum.user.deletion.application.service;

import com.ieum.user.deletion.application.port.in.ForceDeleteUserUseCase;
import com.ieum.user.deletion.application.port.out.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class ForceDeleteUserService implements ForceDeleteUserUseCase {

    private final DeleteAuthTokenPort deleteAuthTokenPort;
    private final DeleteUserNotificationPort deleteUserNotificationPort;
    private final DeleteUserActivityPort deleteUserActivityPort;
    private final BackupAndArchivePort backupAndArchivePort;
    private final DeleteUserCommunityHistoryPort communityHistoryPort;
    private final DeleteUserReviewPort deleteUserReviewPort;
    private final PhysicalFileRemovalPort physicalFileRemovalPort;
    private final DeletePhysicalMemberPort deletePhysicalMemberPort;

    @Override
    // 전역 @Transactional 은 데드락 및 장애 방지를 위해 절대 걸지 않습니다.
    // 각 Port 구현부에서 Chunk/개별 트랜잭션을 적용합니다.
    // 본 클래스는 회원 상태값을 절대 변경(Update Set Status)하지 않습니다.
    public void execute(Long userId) {
        log.info("[회원 물리 삭제 시작] userId: {}", userId);

        try {
            // Step 1: Token 삭제
            deleteAuthTokenPort.deleteAllTokens(userId);

            // Step 2: 알림 및 설정 삭제
            deleteUserNotificationPort.deleteSettingsAndNotifications(userId);

            // Step 3: 좋아요/찜 삭제 및 like_count 보정
            deleteUserActivityPort.deleteFavorites(userId);
            deleteUserActivityPort.deleteLikesAndSyncCount(userId);

            // Step 4: 문의/신고 -> History 스냅샷 보관 후 원본 삭제
            backupAndArchivePort.archiveAndRemoveInquiries(userId);
            backupAndArchivePort.archiveAndRemoveReports(userId);

            // Step 5: 댓글 삭제 및 comment_count 보정
            communityHistoryPort.deleteCommentsAndSyncCount(userId);

            // Step 6: 리뷰 삭제 및 축제 통계(review_count, avg_rating) 재산출
            deleteUserReviewPort.deleteReviewsAndRecalculateStats(userId);

            // Step 7: 작성 게시글 삭제 및 종속 하위 데이터 연쇄 삭제
            communityHistoryPort.deletePostsAndChildEntities(userId);

            // Step 8: (Optional) S3/Local 정적 파일 삭제 호출
            physicalFileRemovalPort.deleteFilesFromStorage(userId);

            // Step 9: 최종 users 테이블 메인 레코드 물리 파기
            deletePhysicalMemberPort.deleteUserRecord(userId);

            log.info("[회원 물리 삭제 완료] userId: {}", userId);

        } catch (Exception e) {
            log.error("[회원 물리 삭제 중 예외 발생] userId: {}, 사유: {}", userId, e.getMessage(), e);
            throw e; // 미처리 건은 스케줄러(DELETED 조회)가 다시 호출하여 재개할 수 있도록 에러 전파
        }
    }
}
