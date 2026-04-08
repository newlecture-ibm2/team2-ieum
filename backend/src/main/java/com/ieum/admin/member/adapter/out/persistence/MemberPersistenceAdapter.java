package com.ieum.admin.member.adapter.out.persistence;

import com.ieum.admin.member.adapter.out.persistence.entity.MemberEntity;
import com.ieum.admin.member.adapter.out.persistence.repository.MemberAdminRepository;
import com.ieum.admin.member.application.port.out.MemberPort;
import com.ieum.admin.member.domain.model.Member;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 회원 Persistence Adapter (OutPort 구현체)
 * - 신고 당한 횟수는 reports 테이블에서 별도 집계
 */
@Component
@RequiredArgsConstructor
public class MemberPersistenceAdapter implements MemberPort {

    private final MemberAdminRepository repository;
    private final EntityManager em;

    @Override
    public Page<Member> findAll(String status, String role, String searchType, String keyword, Pageable pageable) {
        Page<MemberEntity> page = repository.findMembersByConditions(status, role, searchType, keyword, pageable);

        List<Member> members = page.getContent().stream().map(entity -> {
            long reportedCount = countReportedByUser(entity.getUserId());
            entity.setReportedCount(reportedCount);
            return entity.toDomain();
        }).toList();

        return new PageImpl<>(members, pageable, page.getTotalElements());
    }

    @Override
    public Optional<Member> findById(Long userId) {
        return repository.findById(userId).map(entity -> {
            long reportedCount = countReportedByUser(entity.getUserId());
            entity.setReportedCount(reportedCount);
            return entity.toDomain();
        });
    }

    @Override
    public void updateStatus(Long userId, String status) {
        repository.findById(userId).ifPresent(entity -> {
            entity.setStatus(status);
            if ("DELETED".equalsIgnoreCase(status)) {
                entity.setDeletedAt(LocalDateTime.now());
            }
            repository.save(entity);
        });
    }

    @Override
    public long countByStatus(String status) {
        return repository.countByStatus(status);
    }

    @Override
    public long countByRole(String role) {
        return repository.countByRole(role);
    }

    @Override
    public long countAll() {
        return repository.count();
    }

    /**
     * 특정 회원이 신고 "당한" 횟수를 집계
     * - reports 테이블에서 해당 유저가 작성한 콘텐츠(POST/COMMENT/REVIEW)에 대한 신고 건수
     * - 네이티브 쿼리로 처리 (JPQL 서브쿼리 한계 회피)
     */
    private long countReportedByUser(Long userId) {
        try {
            // POST 신고: posts.author_id = userId인 게시글에 대한 신고
            // COMMENT 신고: comments.user_id = userId인 댓글에 대한 신고
            // REVIEW 신고: reviews.user_id = userId인 리뷰에 대한 신고
            String nativeQuery = """
                    SELECT COUNT(*) FROM reports r WHERE
                      (r.target_type = 'POST' AND r.target_id IN (SELECT p.id FROM posts p WHERE p.author_id = :userId))
                      OR (r.target_type = 'COMMENT' AND r.target_id IN (SELECT c.comment_id FROM comments c WHERE c.user_id = :userId))
                      OR (r.target_type = 'REVIEW' AND r.target_id IN (SELECT rv.id FROM reviews rv WHERE rv.user_id = :userId))
                    """;
            Object result = em.createNativeQuery(nativeQuery)
                    .setParameter("userId", userId)
                    .getSingleResult();
            return ((Number) result).longValue();
        } catch (Exception e) {
            // 테이블이 아직 없거나 오류 시 0 반환
            return 0;
        }
    }
}
