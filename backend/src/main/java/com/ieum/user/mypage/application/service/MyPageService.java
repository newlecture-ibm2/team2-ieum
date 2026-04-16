package com.ieum.user.mypage.application.service;

import com.ieum.attachment.application.port.out.FileStoragePort;
import com.ieum.global.security.JwtProvider;
import com.ieum.user.auth.application.port.out.LoadUserPort;
import com.ieum.user.auth.application.port.out.SaveUserPort;
import com.ieum.user.auth.domain.User;
import com.ieum.user.mypage.adapter.in.web.dto.MyPageReq;
import com.ieum.user.mypage.application.port.in.MyPageUseCase;
import com.ieum.user.mypage.application.port.out.LoadMyActivityPort;
import com.ieum.user.mypage.application.result.ActivityPageResult;
import com.ieum.user.mypage.application.result.MyProfileResult;
import com.ieum.user.mypage.application.result.ProfileUpdateResult;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.UUID;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * [Service] 마이페이지 도메인 로직 실장
 * 설계서 API_USR_0030, API_USR_0020 준수
 *
 * 프로필 이미지 저장은 공통 파일 저장 모듈(FileStoragePort)과 동일한
 * ${file.upload-dir} 경로 체계를 사용합니다.
 * - 로컬: ./uploads/profile/
 * - Docker: /app/upload/profile/ (볼륨 → 호스트 /dist/upload/profile/)
 */
@Service
@RequiredArgsConstructor
public class MyPageService implements MyPageUseCase {

    private final LoadMyActivityPort loadMyActivityPort;
    private final LoadUserPort loadUserPort;
    private final SaveUserPort saveUserPort;
    private final JwtProvider jwtProvider;
    private final FileStoragePort fileStoragePort;

    /** 공통 파일 저장 모듈과 동일한 루트 경로 설정값 사용 */
    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    @Override
    @Transactional(readOnly = true)
    public ActivityPageResult getMyActivities(Long userId, String type, int page, int size) {
        if ("posts".equalsIgnoreCase(type)) {
            return loadMyActivityPort.loadMyPosts(userId, page, size);
        } else if ("reviews".equalsIgnoreCase(type)) {
            return loadMyActivityPort.loadMyReviews(userId, page, size);
        } else if ("comments".equalsIgnoreCase(type)) {
            return loadMyActivityPort.loadMyComments(userId, page, size);
        } else if ("inquiries".equalsIgnoreCase(type)) {
            return loadMyActivityPort.loadMyInquiries(userId, page, size);
        } else if ("reports".equalsIgnoreCase(type)) {
            return loadMyActivityPort.loadMyReports(userId, page, size);
        }

        throw new IllegalArgumentException("유효하지 않은 활동 유형입니다: " + type);
    }

    @Override
    @Transactional
    public ProfileUpdateResult updateProfile(Long userId, MyPageReq.UpdateProfile request) {
        User user = loadUserPort.loadUserById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        String oldNickname = user.getNickname();
        String newNickname = oldNickname;
        boolean nicknameChanged = false;

        // 1. 닉네임 변경 및 중복 체크
        if (request != null && request.getNickname() != null && !request.getNickname().equals(oldNickname)) {
            if (loadUserPort.existsByNickname(request.getNickname())) {
                throw new IllegalStateException("이미 사용 중인 닉네임입니다.");
            }
            newNickname = request.getNickname();
            nicknameChanged = true;
        }

        // 2. 사용자 정보 갱신 (이미지는 이미지 전용 API에서 처리함)
        User updatedUser = user.toBuilder()
                .nickname(newNickname)
                .build();

        saveUserPort.saveUser(updatedUser);

        // 3. 닉네임이 실제로 변경된 경우에만 새 JWT 토큰을 발급합니다.
        String newToken = null;
        if (nicknameChanged) {
            newToken = jwtProvider.generateAccessToken(
                    updatedUser.getUserId(),
                    updatedUser.getNickname(),
                    updatedUser.getRole().name());
        }

        return ProfileUpdateResult.builder()
                .updatedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .newToken(newToken)
                .nickname(nicknameChanged ? newNickname : null)
                .build();
    }

    @Override
    public Resource getProfileImage(String filename) {
        // 공통 모듈과 동일한 경로 체계: {upload-dir}/profile/{filename}
        Path filePath = Paths.get(uploadDir, "profile", filename).toAbsolutePath().normalize();
        return fileStoragePort.loadAsResource(filePath.toString());
    }

    @Override
    @Transactional
    public ProfileUpdateResult updateProfileImage(Long userId, String base64Image) {
        User user = loadUserPort.loadUserById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (base64Image == null || base64Image.isEmpty()) {
            throw new IllegalArgumentException("업로드할 이미지 데이터가 없습니다.");
        }

        String newProfileImage = saveBase64Image(base64Image);

        User updatedUser = user.toBuilder()
                .profileImage(newProfileImage)
                .build();

        saveUserPort.saveUser(updatedUser);

        return ProfileUpdateResult.builder()
                .updatedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .build();
    }

    /**
     * Base64 문자열을 디코딩하여 공통 업로드 경로에 저장합니다.
     * 저장 위치: {file.upload-dir}/profile/UUID.확장자
     * - 로컬: ./uploads/profile/
     * - Docker: /app/upload/profile/ (볼륨 → 호스트 /dist/upload/profile/)
     */
    private String saveBase64Image(String base64Image) {
        try {
            String base64Data = base64Image;
            String extension = ".png";

            if (base64Image.contains(",")) {
                String[] parts = base64Image.split(",");
                String header = parts[0];
                base64Data = parts[1];

                if (header.contains("image/jpeg")) extension = ".jpg";
                else if (header.contains("image/gif")) extension = ".gif";
                else if (header.contains("image/webp")) extension = ".webp";
            }

            byte[] imageBytes = Base64.getDecoder().decode(base64Data);
            String savedFileName = UUID.randomUUID().toString() + extension;

            // 공통 모듈과 동일한 경로: {upload-dir}/profile/
            Path profileDir = Paths.get(uploadDir, "profile");
            Files.createDirectories(profileDir);

            Path destPath = profileDir.resolve(savedFileName);
            Files.write(destPath, imageBytes);

            // 프론트에서 접근 가능한 URL
            return "/api/mypage/profile/view/" + savedFileName;
        } catch (Exception e) {
            throw new RuntimeException("프로필 이미지 저장 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public MyProfileResult getMyProfile(Long userId) {
        User user = loadUserPort.loadUserById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        return MyProfileResult.from(user);
    }
}

