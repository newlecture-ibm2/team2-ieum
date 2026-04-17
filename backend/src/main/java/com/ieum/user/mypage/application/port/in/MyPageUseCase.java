package com.ieum.user.mypage.application.port.in;

import com.ieum.user.mypage.adapter.in.web.dto.MyPageReq;
import com.ieum.user.mypage.application.result.ActivityPageResult;
import com.ieum.user.mypage.application.result.MyProfileResult;
import com.ieum.user.mypage.application.result.ProfileUpdateResult;
import org.springframework.core.io.Resource;

/**
 * 인바운드 포트: 마이페이지(내 활동 조회, 프로필 수정 등) 비즈니스 로직 요구사항 정의
 */
public interface MyPageUseCase {

    /** 설계서 API_USR_0030: 내 활동 내역 조회 */
    ActivityPageResult getMyActivities(Long userId, String type, int page, int size);

    /** 설계서 API_USR_0020: 프로필 정보 수정 */
    ProfileUpdateResult updateProfile(Long userId, MyPageReq.UpdateProfile request);

    /** 설계서 API_USR_0011: 프로필 이미지 전용 수정 */
    ProfileUpdateResult updateProfileImage(Long userId, String base64Image);

    /** 추가: 프로필 이미지 실물 자원 조회 */
    Resource getProfileImage(String filename);

    /** 추가 (API_USR_0012): 내 프로필 상세 정보 조회 (사진 URL 포함) */
    MyProfileResult getMyProfile(Long userId);
}
