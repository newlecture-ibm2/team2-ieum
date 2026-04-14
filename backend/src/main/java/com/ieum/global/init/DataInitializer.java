package com.ieum.global.init;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * 애플리케이션 시작 시 초기 데이터를 삽입하는 클래스
 *
 * TODO: 필요한 Repository를 주입받아 초기 데이터 생성
 *  - 관리자 계정 (ADMIN)
 *  - 테스트용 축제 데이터
 *  - 커뮤니티 게시판 초기 데이터 등
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    // TODO: Repository 주입
    // private final UserJpaRepository userRepository;
    // private final FestivalJpaRepository festivalRepository;

    @Override
    public void run(String... args) throws Exception {
        log.info("========== DataInitializer 시작 ==========");

        // initAdmin();
        // initFestivals();

        log.info("========== DataInitializer 완료 ==========");
    }

    /**
     * 관리자 계정 초기 생성
     */
    // private void initAdmin() {
    //     if (userRepository.findByLoginId("admin").isEmpty()) {
    //         User admin = User.builder()
    //             .loginId("admin")
    //             .password(passwordEncoder.encode("admin1234"))
    //             .nickname("관리자")
    //             .role(Role.ADMIN)
    //             .build();
    //         userRepository.save(UserJpaEntity.from(admin));
    //         log.info("✅ 관리자 계정 생성: admin");
    //     }
    // }

    /**
     * 테스트용 축제 데이터 생성
     */
    // private void initFestivals() {
    //     if (festivalRepository.count() == 0) {
    //         // TODO: 공공데이터 API 또는 더미 데이터로 축제 정보 삽입
    //         log.info("✅ 테스트 축제 데이터 생성");
    //     }
    // }
}
