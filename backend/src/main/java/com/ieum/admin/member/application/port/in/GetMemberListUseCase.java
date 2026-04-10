package com.ieum.admin.member.application.port.in;

import com.ieum.admin.member.application.result.MemberListResult;

/**
 * 회원 목록 조회 UseCase
 */
public interface GetMemberListUseCase {
    MemberListResult getMembers(int page, int size, String status, String role, String searchType, String keyword);
}
