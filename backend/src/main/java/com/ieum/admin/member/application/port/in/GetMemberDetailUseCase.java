package com.ieum.admin.member.application.port.in;

import com.ieum.admin.member.application.result.MemberItem;

import java.util.Optional;

/**
 * 회원 상세 조회 UseCase
 */
public interface GetMemberDetailUseCase {
    Optional<MemberItem> getMember(Long userId);
}
