package com.ieum.user.mypage.application.port.in;

import com.ieum.user.mypage.adapter.in.web.dto.MyPageReq;
import com.ieum.user.mypage.adapter.in.web.dto.MyPageRes;
import org.springframework.web.multipart.MultipartFile;

/**
 * 인바운드 포트: 마이페이지(내 활동 조회, 프로필 수정 등) 비즈니스 로직 요구사항 정의
 */
public interface MyPageUseCase {

    /** 설계서 API_USR_0030: 내 활동 내역 조회 */
    MyPageRes.ActivityList getMyActivities(Long userId, String type, int page, int size);

    /** 설계서 API_USR_0020: 프로필 정보 수정 */
    MyPageRes.ProfileUpdate updateProfile(Long userId, MyPageReq.UpdateProfile request, MultipartFile profileImg);

    /** 설계서 API_USR_0011: 프로필 이미지 전용 수정 */
    MyPageRes.ProfileUpdate updateProfileImage(Long userId, MultipartFile profileImg);
}
