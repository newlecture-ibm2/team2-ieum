package com.ieum.admin.member.application.port.out;

import com.ieum.admin.member.domain.model.Member;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

/**
 * 회원 데이터 접근 OutPort
 */
public interface MemberPort {
    Page<Member> findAll(String status, String role, String searchType, String keyword, Pageable pageable);
    Optional<Member> findById(Long userId);
    void updateStatus(Long userId, String status);
    void suspendMember(Long userId, int days);
    void updateRole(Long userId, String role);
    void deleteMember(Long userId);
    long countByStatus(String status);
    long countByRole(String role);
    long countAll();
}
