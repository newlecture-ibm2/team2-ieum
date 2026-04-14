package com.ieum.user.mypage.application.service;

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
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.Base64;
import java.util.UUID;
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

    private static final String UPLOAD_DIR = "uploads" + File.separator + "profile" + File.separator;

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

        String newNickname = user.getNickname();

        // 1. 닉네임 변경 및 중복 체크
        if (request != null && request.getNickname() != null && !request.getNickname().equals(user.getNickname())) {
            if (loadUserPort.existsByNickname(request.getNickname())) {
                throw new IllegalStateException("이미 사용 중인 닉네임입니다.");
            }
            newNickname = request.getNickname();
        }

        // 2. 사용자 정보 갱신 (이미지는 이미지 전용 API에서 처리함)
        User updatedUser = user.toBuilder()
                .nickname(newNickname)
                .build();

        saveUserPort.saveUser(updatedUser);

        return new ProfileUpdateResult(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
    }

    @Override
    public Resource getProfileImage(String filename) {
        try {
            // 물리 프로젝트 루트 기준 uploads/profile 폴더에서 파일을 찾습니다.
            File uploadRoot = new File(System.getProperty("user.dir"), "uploads" + File.separator + "profile");
            File file = new File(uploadRoot, filename);
            
            if (!file.exists()) {
                throw new IllegalArgumentException("요청하신 파일을 찾을 수 없습니다: " + filename);
            }
            
            return new FileSystemResource(file);
        } catch (Exception e) {
            throw new RuntimeException("프로필 이미지 조회 중 오류가 발생했습니다.", e);
        }
    }

    @Override
    @Transactional
    public ProfileUpdateResult updateProfileImage(Long userId, String base64Image) {
        User user = loadUserPort.loadUserById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (base64Image == null || base64Image.isEmpty()) {
            throw new IllegalArgumentException("업로드할 이미지 데이터가 없습니다.");
        }

        // 블로그 방식 + Base64 우회: 텍스트 수신 -> 디코딩 -> 파일 저장
        String newProfileImage = saveBase64Image(base64Image);

        // 2. 사용자 정보 갱신
        User updatedUser = user.toBuilder()
                .profileImage(newProfileImage)
                .build();

        saveUserPort.saveUser(updatedUser);

        return new ProfileUpdateResult(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
    }

    /**
     * Base64 문자열을 디코딩하여 서버 디스크에 저장합니다.
     */
    private String saveBase64Image(String base64Image) {
        try {
            String base64Data = base64Image;
            String extension = ".png"; // 기본 확장자

            // "data:image/png;base64,iVBOR..." 형태의 접두사 제거 및 확장자 추출
            if (base64Image.contains(",")) {
                String[] parts = base64Image.split(",");
                String header = parts[0];
                base64Data = parts[1];
                
                if (header.contains("image/jpeg")) extension = ".jpg";
                else if (header.contains("image/gif")) extension = ".gif";
                else if (header.contains("image/webp")) extension = ".webp";
            }

            // 1. Base64 디코딩
            byte[] imageBytes = Base64.getDecoder().decode(base64Data);
            String savedFileName = UUID.randomUUID().toString() + extension;

            // 2. 물리적 저장 경로 설정
            File uploadRoot = new File(System.getProperty("user.dir"), "uploads" + File.separator + "profile");
            if (!uploadRoot.exists()) {
                uploadRoot.mkdirs();
            }

            File destFile = new File(uploadRoot, savedFileName);
            
            // 3. 파일 쓰기
            java.nio.file.Files.write(destFile.toPath(), imageBytes);

            // 4. 우리 집 전용 조회 창구 주소를 반환합니다.
            return "/api/mypage/profile/view/" + savedFileName;
        } catch (Exception e) {
            throw new RuntimeException("프로필 이미지 저장 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }

    /**
     * Multipart 파일을 서버 디스크에 저장합니다.
     */
    private String saveProfileFile(MultipartFile profileImg) {
        try {
            String originalFileName = profileImg.getOriginalFilename();
            String extension = ".png";
            if (originalFileName != null && originalFileName.contains(".")) {
                extension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            String savedFileName = UUID.randomUUID().toString() + extension;

            File uploadRoot = new File(System.getProperty("user.dir"), "uploads" + File.separator + "profile");
            if (!uploadRoot.exists()) {
                uploadRoot.mkdirs();
            }

            File destFile = new File(uploadRoot, savedFileName);
            profileImg.transferTo(destFile);

            // 우리 집 전용 조회 창구 주소를 반환합니다.
            return "/api/mypage/profile/view/" + savedFileName;
        } catch (IOException e) {
            throw new RuntimeException("프로필 이미지 저장 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public MyProfileResult getMyProfile(Long userId) {
        User user = loadUserPort.loadUserById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 🚀 [v18-1] Festival 패턴 전매특허: 서비스는 비즈니스 로직만! 매핑은 Result가 알아서!
        return MyProfileResult.from(user);
    }
}
