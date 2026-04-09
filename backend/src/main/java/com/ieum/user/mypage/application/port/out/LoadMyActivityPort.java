package com.ieum.user.mypage.application.port.out;

import com.ieum.user.mypage.adapter.in.web.dto.MyPageRes;

/**
 * 아웃바운드 포트: 마이페이지 전용 데이터 조회를 정의합니다.
 * 타 도메인의 포트를 수정하지 않고 독립적으로 데이터를 요청하기 위해 사용합니다.
 */
public interface LoadMyActivityPort {

    /** 설계서 API_USR_0030: 내가 쓴 게시글 목록 조회 */
    MyPageRes.ActivityList loadMyPosts(Long userId, int page, int size);

    /** 설계서 API_USR_0030: 내가 쓴 리뷰 목록 조회 */
    MyPageRes.ActivityList loadMyReviews(Long userId, int page, int size);

    /** 설계서 API_USR_0030: 내가 쓴 댓글 목록 조회 */
    MyPageRes.ActivityList loadMyComments(Long userId, int page, int size);

    /** 설계서 API_USR_0030: 내 문의 내역 목록 조회 */
    MyPageRes.ActivityList loadMyInquiries(Long userId, int page, int size);

    /** 설계서 API_USR_0030: 내 신고 내역 목록 조회 */
    MyPageRes.ActivityList loadMyReports(Long userId, int page, int size);
}
