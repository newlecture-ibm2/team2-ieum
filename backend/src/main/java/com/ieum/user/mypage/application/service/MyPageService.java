package com.ieum.user.mypage.application.service;

import com.ieum.attachment.application.port.in.UploadAttachmentUseCase;
import com.ieum.user.auth.application.port.out.LoadUserPort;
import com.ieum.user.auth.application.port.out.SaveUserPort;
import com.ieum.user.auth.domain.User;
import com.ieum.user.mypage.adapter.in.web.dto.MyPageReq;
import com.ieum.user.mypage.adapter.in.web.dto.MyPageRes;
import com.ieum.user.mypage.application.port.in.MyPageUseCase;
import com.ieum.user.mypage.application.port.out.LoadMyActivityPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * [Service] 마이페이지 도메인 로직 실장
 * 설계서 API_USR_0030, API_USR_0020 준수
 */
@Service
@RequiredArgsConstructor
public class MyPageService implements MyPageUseCase {

    private final LoadMyActivityPort loadMyActivityPort;
    private final LoadUserPort loadUserPort;
    private final SaveUserPort saveUserPort;
    private final UploadAttachmentUseCase uploadAttachmentUseCase;

    @Override
    @Transactional(readOnly = true)
    public MyPageRes.ActivityList getMyActivities(Long userId, String type, int page, int size) {
        if ("posts".equalsIgnoreCase(type)) {
            return loadMyActivityPort.loadMyPosts(userId, page, size);
        } else if ("reviews".equalsIgnoreCase(type)) {
            return loadMyActivityPort.loadMyReviews(userId, page, size);
        } else if ("comments".equalsIgnoreCase(type)) {
            return loadMyActivityPort.loadMyComments(userId, page, size);
        }
        
        throw new IllegalArgumentException("유효하지 않은 활동 유형입니다: " + type);
    }

    @Override
    @Transactional
    public MyPageRes.ProfileUpdate updateProfile(Long userId, MyPageReq.UpdateProfile request, MultipartFile profileImg) {
        User user = loadUserPort.loadUserById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        String newNickname = user.getNickname();
        String newProfileImage = user.getProfileImage();

        // 1. 닉네임 변경 및 중복 체크
        if (request != null && request.getNickname() != null && !request.getNickname().equals(user.getNickname())) {
            if (loadUserPort.existsByNickname(request.getNickname())) {
                throw new IllegalStateException("이미 사용 중인 닉네임입니다.");
            }
            newNickname = request.getNickname();
        }

        // 2. 프로필 이미지 업로드 (S3/로컬 저장소 연동)
        if (profileImg != null && !profileImg.isEmpty()) {
            // attachment 도메인의 기능을 재사용 (우리 것만 건드리는 규칙 준수)
            newProfileImage = uploadAttachmentUseCase.upload("USER", userId, profileImg).getFilePath();
        }

        // 3. 사용자 정보 갱신
        User updatedUser = user.toBuilder()
                .nickname(newNickname)
                .profileImage(newProfileImage)
                .build();

        saveUserPort.saveUser(updatedUser);

        return MyPageRes.ProfileUpdate.builder()
                .updatedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .build();
    }
}
