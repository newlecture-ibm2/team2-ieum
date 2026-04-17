package com.ieum.global.init;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

/**
 * 🎬 Demo / Presentation 용 시드 데이터 삽입기
 *
 * <p>실행 조건: SPRING_PROFILES_ACTIVE=seed</p>
 * <p>실행 순서: RegionSeedInitializer(@Order(1)) 이후</p>
 *
 * <p>삽입 데이터:</p>
 * <ul>
 *   <li>Admin 1명 + 일반 멤버 13명</li>
 *   <li>더미 축제 8개</li>
 *   <li>리뷰 25건, 게시글 18건, 댓글 35건, 좋아요 15건</li>
 *   <li>신고 10건, 문의 7건, 공지 5건, 찜 18건, 알림 12건</li>
 * </ul>
 */
@Slf4j
@Component
@Order(10)
@RequiredArgsConstructor
@Profile("seed")
public class DemoDataSeeder implements CommandLineRunner {

    private final JdbcTemplate jdbc;
    private final PasswordEncoder passwordEncoder;

    // ── 닉네임 → userId 매핑 (댓글·신고 등에서 FK 참조용) ──
    private final Map<String, Long> userMap = new LinkedHashMap<>();
    private final Map<String, Long> festMap = new LinkedHashMap<>();
    private final Map<String, Long> postMap = new LinkedHashMap<>();
    private final Map<String, Long> reviewMap = new LinkedHashMap<>();
    private final Map<String, Long> commentMap = new LinkedHashMap<>();
    private Long adminId;

    @Override
    @Transactional
    public void run(String... args) {
        if (alreadySeeded()) {
            log.info("✅ Demo 시드 데이터 이미 존재, 스킵");
            return;
        }

        log.info("===== 🎬 Demo Seed 시작 =====");
        seedAdmin();
        seedMembers();
        seedFestivals();
        seedReviews();
        seedPosts();
        seedComments();
        seedPostLikes();
        seedReports();
        seedInquiries();
        seedNotices();
        seedFavorites();
        seedNotifications();
        syncCaches();
        log.info("===== 🎬 Demo Seed 완료 =====");
    }

    // ═══════════════════════════════════════════════
    //  1. Admin
    // ═══════════════════════════════════════════════
    private void seedAdmin() {
        String pw = passwordEncoder.encode("admin1234");
        jdbc.update("""
            INSERT INTO users (login_id, password, name, nickname, role,
                               terms_agreed, status, created_at)
            VALUES (?, ?, '관리자', '관리자', 'ADMIN', true, 'ACTIVE', ?)
            ON CONFLICT (login_id) DO NOTHING
            """, "admin", pw, at(60, 9, 0));
        adminId = jdbc.queryForObject(
                "SELECT user_id FROM users WHERE login_id = 'admin'", Long.class);
        userMap.put("관리자", adminId);
        log.info("  ✅ Admin 생성 (id={})", adminId);
    }

    // ═══════════════════════════════════════════════
    //  2. Members (13명)
    // ═══════════════════════════════════════════════
    private void seedMembers() {
        String pw = passwordEncoder.encode("test1234!");

        Object[][] members = {
            // loginId,         name,     nickname,           status,       daysAgo, suspDays
            {"jiyeon.park",    "박지연", "축제요정",          "ACTIVE",      30, null},
            {"minsoo.kim",     "김민수", "축제탐험가",        "ACTIVE",      28, null},
            {"soojin.lee",     "이수진", "여행하는수진",      "ACTIVE",      25, null},
            {"hyunwoo.choi",   "최현우", "현우의축제일기",    "ACTIVE",      22, null},
            {"yuna.jung",      "정유나", "유나맛집",          "ACTIVE",      20, null},
            {"dongho.han",     "한동호", "동호아재",          "ACTIVE",      18, null},
            {"minji.seo",      "서민지", "민지의하루",        "ACTIVE",      15, null},
            {"jaehyuk.oh",     "오재혁", "오재혁여행기",      "ACTIVE",      14, null},
            {"eunji.yang",     "양은지", "은지트래블",        "ACTIVE",      12, null},
            {"sungmin.ryu",    "류성민", "성민이야기",        "ACTIVE",       5, null},
            {"haein.kwon",     "권해인", "해인스타",          "SUSPENDED",   20,   30},
            {"taeyang.bae",    "배태양", "태양이",            "SUSPENDED",   16,   14},
            {"jiwoo.na",       "나지우", "지우여행",          "WITHDRAWAL",  25, null},
        };

        for (Object[] m : members) {
            String loginId = (String) m[0];
            String name = (String) m[1];
            String nickname = (String) m[2];
            String status = (String) m[3];
            int daysAgo = (int) m[4];
            Integer suspDays = (Integer) m[5];
            LocalDateTime signupAt = at(daysAgo, 9 + (daysAgo % 12), (daysAgo * 7) % 60);
            LocalDateTime suspUntil = suspDays != null ? signupAt.plusDays(suspDays) : null;

            jdbc.update("""
                INSERT INTO users (login_id, password, name, nickname, role,
                                   terms_agreed, status, suspended_until, created_at)
                VALUES (?, ?, ?, ?, 'USER', true, ?, ?, ?)
                """, loginId, pw, name, nickname, status, suspUntil, signupAt);

            Long id = jdbc.queryForObject(
                    "SELECT user_id FROM users WHERE login_id = ?", Long.class, loginId);
            userMap.put(nickname, id);
        }
        log.info("  ✅ 멤버 {}명 생성", members.length);
    }

    // ═══════════════════════════════════════════════
    //  3. Festivals (8개)
    // ═══════════════════════════════════════════════
    private void seedFestivals() {
        Object[][] fests = {
            // title, areaCode, status, startDate, endDate
            {"서울 벚꽃 축제 2026",          "1",  "ONGOING",  LocalDate.now().minusDays(5), LocalDate.now().plusDays(10)},
            {"부산 해운대 모래 축제",         "6",  "UPCOMING", LocalDate.now().plusDays(20), LocalDate.now().plusDays(25)},
            {"제주 유채꽃 축제",             "39", "ONGOING",  LocalDate.now().minusDays(3), LocalDate.now().plusDays(7)},
            {"전주 비빔밥 축제",             "37", "ENDED",    LocalDate.now().minusDays(30), LocalDate.now().minusDays(20)},
            {"강릉 커피 축제 2026",          "32", "UPCOMING", LocalDate.now().plusDays(15), LocalDate.now().plusDays(18)},
            {"경주 벚꽃 마라톤",             "35", "ENDED",    LocalDate.now().minusDays(25), LocalDate.now().minusDays(24)},
            {"대구 치맥 페스티벌",           "4",  "UPCOMING", LocalDate.now().plusDays(30), LocalDate.now().plusDays(33)},
            {"인천 펜타포트 록 페스티벌",     "2",  "UPCOMING", LocalDate.now().plusDays(60), LocalDate.now().plusDays(62)},
        };

        for (Object[] f : fests) {
            String title = (String) f[0];
            jdbc.update("""
                INSERT INTO festivals (title, area_code, status, source, is_custom, is_visible,
                                       start_date, end_date, address, avg_rating, review_count,
                                       favorite_count, view_count, created_at)
                VALUES (?, ?, ?, 'MANUAL', true, true, ?, ?, ?, 0.0, 0, 0, 0, ?)
                """,
                    title, f[1], f[2], f[3], f[4],
                    title + " 행사장",
                    at(30, 10, 0));

            Long id = jdbc.queryForObject(
                    "SELECT id FROM festivals WHERE title = ?", Long.class, title);
            festMap.put(title, id);
        }
        log.info("  ✅ 축제 {}개 생성", fests.length);
    }

    // ═══════════════════════════════════════════════
    //  4. Reviews (25건)
    // ═══════════════════════════════════════════════
    private void seedReviews() {
        // [nickname, festivalTitle, rating, content, daysAgo, key]
        Object[][] reviews = {
            // 서울 벚꽃 (7건 — 인기 축제)
            {"축제요정",        "서울 벚꽃 축제 2026", 5, "벚꽃이 정말 아름다웠어요! 석촌호수 최고!", 20, "r_blossom1"},
            {"축제탐험가",      "서울 벚꽃 축제 2026", 4, "사람이 많지만 분위기가 좋습니다", 18, "r_blossom2"},
            {"여행하는수진",    "서울 벚꽃 축제 2026", 5, "야경이 특히 환상적이에요. 꼭 가보세요!", 17, "r_blossom3"},
            {"현우의축제일기",  "서울 벚꽃 축제 2026", 4, "주차가 힘들었지만 만족스러운 축제였습니다", 15, "r_blossom4"},
            {"유나맛집",        "서울 벚꽃 축제 2026", 3, "먹거리 부스가 좀 부족했어요. 다음엔 더 늘려주세요!", 14, "r_blossom5"},
            {"동호아재",        "서울 벚꽃 축제 2026", 4, "가족 나들이로 딱입니다. 아이가 좋아했어요", 12, "r_blossom6"},
            {"태양이",          "서울 벚꽃 축제 2026", 1, "최악. 쓰레기만 잔뜩이고 볼거리도 없음", 10, "r_spam_review"},  // 신고 대상

            // 부산 해운대 (4건)
            {"축제요정",        "부산 해운대 모래 축제", 5, "해운대 모래 조각 퀄리티가 놀라워요!", 15, "r_busan1"},
            {"축제탐험가",      "부산 해운대 모래 축제", 4, "아이들과 함께 즐기기 좋은 축제!", 12, "r_busan2"},
            {"현우의축제일기",  "부산 해운대 모래 축제", 4, "바다와 축제를 동시에 즐길 수 있어서 좋아요", 10, "r_busan3"},
            {"태양이",          "부산 해운대 모래 축제", 2, "별로임. 그냥 모래밖에 없음 ㅋㅋ", 8, "r_taeyang_busan"}, // 신고 대상

            // 제주 유채꽃 (4건)
            {"축제요정",        "제주 유채꽃 축제", 5, "유채꽃밭 사진 진짜 예쁘게 나와요!", 18, "r_jeju1"},
            {"여행하는수진",    "제주 유채꽃 축제", 4, "바람이 많이 불지만 경치는 최고!", 15, "r_jeju2"},
            {"오재혁여행기",    "제주 유채꽃 축제", 4, "카메라 필수! 인생샷 건질 수 있어요", 13, "r_jeju3"},
            {"은지트래블",      "제주 유채꽃 축제", 3, "꽃가루 알레르기가 있으면 주의하세요", 10, "r_jeju4"},

            // 전주 비빔밥 (3건)
            {"유나맛집",        "전주 비빔밥 축제", 5, "진짜 전주 비빔밥 맛집들이 총출동! 최고!", 22, "r_jeonju1"},
            {"동호아재",        "전주 비빔밥 축제", 4, "비빔밥 뿐만 아니라 한옥마을도 볼만합니다", 20, "r_jeonju2"},
            {"축제탐험가",      "전주 비빔밥 축제", 4, "먹거리 천국이에요. 배터지게 먹고 왔습니다", 18, "r_jeonju3"},

            // 강릉 커피 (2건)
            {"여행하는수진",    "강릉 커피 축제 2026", 4, "커피 장인들의 다양한 원두를 맛볼 수 있어요", 10, "r_gangneung1"},
            {"축제요정",        "강릉 커피 축제 2026", 5, "커피 좋아하시는 분 필수코스!", 8, "r_gangneung2"},

            // 경주 마라톤 (2건)
            {"오재혁여행기",    "경주 벚꽃 마라톤", 4, "벚꽃 길을 달리는 경험은 정말 특별했어요!", 22, "r_gyeongju1"},
            {"현우의축제일기",  "경주 벚꽃 마라톤", 3, "코스가 좀 길지만 경치로 보상받습니다", 20, "r_gyeongju2"},

            // 대구 치맥 (2건)
            {"유나맛집",        "대구 치맥 페스티벌", 5, "치킨과 맥주의 완벽한 조합! 매년 가고 싶어요", 10, "r_daegu1"},
            {"축제탐험가",      "대구 치맥 페스티벌", 4, "다양한 치킨 브랜드를 한 자리에서 맛볼 수 있어요", 8, "r_daegu2"},

            // 인천 펜타포트 (1건)
            {"축제탐험가",      "인천 펜타포트 록 페스티벌", 5, "라인업이 역대급이에요! 기대됩니다", 5, "r_incheon1"},
        };

        for (Object[] r : reviews) {
            // r[0]=nickname, r[1]=festTitle, r[2]=rating, r[3]=content, r[4]=daysAgo, r[5]=key
            jdbc.update("""
                INSERT INTO reviews (user_id, festival_id, rating, content, status, created_at)
                VALUES (?, ?, ?, ?, 'ACTIVE', ?)
                """,
                    userMap.get((String) r[0]),
                    festMap.get((String) r[1]),
                    r[2],
                    r[3],
                    at((int) r[4], 10 + ((int) r[4] % 10), ((int) r[4] * 13) % 60));

            Long id = jdbc.queryForObject("SELECT MAX(id) FROM reviews", Long.class);
            reviewMap.put((String) r[5], id);
        }
        log.info("  ✅ 리뷰 {}건 생성", reviews.length);
    }

    // ═══════════════════════════════════════════════
    //  5. Posts (18건)
    // ═══════════════════════════════════════════════
    private void seedPosts() {
        // [category, nickname, title, content, daysAgo, key]
        Object[][] posts = {
            // QNA (7건)
            {"QNA", "민지의하루", "서울 벚꽃 축제 주차장 있나요?",
                "이번 주말에 가족과 서울 벚꽃 축제에 가려고 하는데 주차장이 있나요? 차로 가려고 합니다.", 20, "p_qna1"},
            {"QNA", "축제요정", "제주 유채꽃 축제 아이와 가도 괜찮을까요?",
                "5살 아이랑 같이 가려고 하는데 유모차 끌고 다닐 수 있을까요?", 18, "p_qna2"},
            {"QNA", "성민이야기", "강릉 커피 축제 교통편 추천해주세요",
                "서울에서 강릉까지 KTX vs 버스 어떤 게 나을까요?", 5, "p_qna3"},
            {"QNA", "은지트래블", "부산 모래축제 준비물 뭐가 필요한가요?",
                "처음 가보는데 뭘 챙겨가야 할지 모르겠어요!", 10, "p_qna4"},
            {"QNA", "여행하는수진", "전주 비빔밥 축제 당일치기 가능한가요?",
                "서울에서 출발해서 당일치기로 다녀올 수 있을까요?", 22, "p_qna5"},
            {"QNA", "현우의축제일기", "축제 예매 취소 어떻게 하나요?",
                "실수로 중복 예매했는데 취소 방법을 모르겠습니다.", 8, "p_qna6"},
            {"QNA", "오재혁여행기", "경주 마라톤 참가 신청 방법?",
                "경주 벚꽃 마라톤 참가 신청은 어디서 하나요?", 20, "p_qna7"},

            // TIP (6건)
            {"TIP", "축제탐험가", "🌸 벚꽃 축제 꿀팁 TOP 5 (사진 스팟 포함)",
                "안녕하세요! 매년 벚꽃 축제를 다니는 축제탐험가입니다.\n\n1. 오전 8시 이전에 도착하면 사람 없이 사진 찍을 수 있어요!\n2. 석촌호수 서쪽 입구가 가장 예쁩니다\n3. 돗자리 필수! 텐트는 반입 불가\n4. 근처 편의점은 줄이 길어요, 간식 미리 챙기세요\n5. 야경도 놓치지 마세요! 해질녘이 제일 예뻐요", 25, "p_tip_popular"},
            {"TIP", "축제요정", "제주 유채꽃 축제 오전에 가세요! 이유는...",
                "오후에 가면 역광이라 사진이 안 나와요. 오전 10시 전이 황금시간대!", 16, "p_tip2"},
            {"TIP", "여행하는수진", "축제 갈 때 꼭 챙기는 준비물 리스트",
                "선크림, 접이식 의자, 보조배터리, 물티슈, 비닐봉지, 현금! 현금은 필수입니다.", 14, "p_tip3"},
            {"TIP", "현우의축제일기", "가족과 축제 즐기는 나만의 노하우",
                "아이 동반 시 유모차보다 유아 캐리어가 편해요. 축제장은 비포장이 많아서요.", 10, "p_tip4"},
            {"TIP", "오재혁여행기", "축제 사진 잘 찍는 꿀팁 공유합니다",
                "광각보다 인물 모드로! 배경 흐림 효과가 축제 사진을 살려줍니다.", 8, "p_tip5"},
            {"TIP", "해인스타", "이거 보면 무조건 돈 벌 수 있음",
                "축제에서 이것만 알면 돈을 벌 수 있습니다. 링크 클릭하세요 bit.ly/spam...", 12, "p_spam_post"},  // 신고 대상

            // FOOD (5건)
            {"FOOD", "유나맛집", "전주 비빔밥 축제 맛집 BEST 3 🍚",
                "1위: 한국집 - 전통 비빔밥이 최고!\n2위: 고궁 - 돌솥비빔밥 꼭 드세요\n3위: 가족회관 - 콩나물국밥도 별미!", 19, "p_food1"},
            {"FOOD", "유나맛집", "부산 해운대 근처 회 맛집 추천 🐟",
                "해운대 시장 안에 있는 OO횟집 추천합니다. 모듬회가 진짜 신선해요!", 15, "p_food2"},
            {"FOOD", "축제탐험가", "강릉 커피 축제 숨은 카페 발견!",
                "축제장에서 5분 거리에 있는 소문난 로스터리 카페 공유합니다. 핸드드립이 일품!", 9, "p_food3"},
            {"FOOD", "동호아재", "대구 치맥 페스티벌 기대되는 메뉴 미리보기",
                "올해 치맥 페스티벌 참가 브랜드가 발표됐는데 기대되는 메뉴들 정리해봤어요.", 7, "p_food4"},
            {"FOOD", "태양이", "축제 음식 다 맛없음 ㅋㅋ 차라리 편의점 가셈",
                "비싸기만 하고 맛없음. 축제 음식 기대하지 마세요. 돈 아까움.", 10, "p_inappropriate_post"},  // 신고 대상
        };

        for (Object[] p : posts) {
            String nickname = (String) p[1];
            jdbc.update("""
                INSERT INTO posts (category, author_id, author_name, title, content,
                                   view_count, like_count, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, 0, 'ACTIVE', ?)
                """,
                    p[0],
                    userMap.get(nickname), nickname,
                    p[2], p[3],
                    50 + ((int) p[4] * 7) % 150,
                    at((int) p[4], 11 + ((int) p[4] % 8), ((int) p[4] * 17) % 60));

            Long id = jdbc.queryForObject("SELECT MAX(id) FROM posts", Long.class);
            postMap.put((String) p[5], id);
        }
        log.info("  ✅ 게시글 {}건 생성", posts.length);
    }

    // ═══════════════════════════════════════════════
    //  6. Comments (35건)
    // ═══════════════════════════════════════════════
    private void seedComments() {
        // 인기글 #1: "서울 벚꽃 축제 주차장 있나요?" (5개)
        Long qna1 = postMap.get("p_qna1");
        insertComment(qna1, "축제탐험가", "석촌호수 근처 공영주차장 이용하세요! 1시간에 2000원이에요.", 19, null, "c_qna1_1");
        insertComment(qna1, "여행하는수진", "대중교통 강력 추천합니다. 2호선 잠실역 3번 출구에서 5분!", 19, null, "c_qna1_2");
        insertComment(qna1, "민지의하루", "감사합니다! 지하철로 갈게요 👍", 18, "c_qna1_2", "c_qna1_2_reply"); // 대댓글
        insertComment(qna1, "유나맛집", "주차 진짜 힘들어요... 주말은 포기하세요 ㅠ", 18, null, "c_qna1_3");
        insertComment(qna1, "현우의축제일기", "네비에 석촌호수 공영주차장 치면 나와요!", 17, null, "c_qna1_4");

        // 인기글 #8: "벚꽃 축제 꿀팁 TOP 5" (6개)
        Long tip1 = postMap.get("p_tip_popular");
        insertComment(tip1, "축제요정", "1번 팁 완전 공감! 오전 일찍 가야 사진 잘 나와요", 24, null, "c_tip1_1");
        insertComment(tip1, "여행하는수진", "작년에 저도 이 방법으로 갔는데 대성공이었어요", 23, null, "c_tip1_2");
        insertComment(tip1, "동호아재", "좋은 정보 감사합니다 ㅎㅎ", 22, null, "c_tip1_3");
        insertComment(tip1, "은지트래블", "혹시 돗자리 반입 되나요?", 21, null, "c_tip1_4");
        insertComment(tip1, "축제탐험가", "네 돗자리 가능하고 텐트는 안 됩니다!", 20, "c_tip1_4", "c_tip1_4_reply"); // 대댓글
        insertRemovedComment(tip1, "해인스타", 20, "c_tip1_removed"); // 삭제된 댓글

        // QNA2: 제주 유채꽃 (3건)
        Long qna2 = postMap.get("p_qna2");
        insertComment(qna2, "여행하는수진", "유모차 다닐 수 있어요! 산책로가 잘 되어 있습니다", 17, null, "c_qna2_1");
        insertComment(qna2, "동호아재", "저도 아이 데리고 갔는데 좋았어요", 16, null, "c_qna2_2");
        insertComment(qna2, "축제요정", "감사합니다! 그럼 이번 주말에 가봐야겠네요 ☺️", 16, "c_qna2_1", "c_qna2_reply"); // 대댓글

        // QNA3: 강릉 커피 (2건)
        Long qna3 = postMap.get("p_qna3");
        insertComment(qna3, "축제탐험가", "KTX 추천해요! 2시간이면 도착합니다", 4, null, "c_qna3_1");
        insertComment(qna3, "오재혁여행기", "버스도 괜찮아요. 요금이 KTX 절반!", 3, null, "c_qna3_2");

        // QNA4: 부산 모래 (2건)
        Long qna4 = postMap.get("p_qna4");
        insertComment(qna4, "축제요정", "선크림이랑 여분 옷 꼭 챙기세요!", 9, null, "c_qna4_1");
        insertComment(qna4, "축제탐험가", "아쿠아슈즈 필수입니다!", 8, null, "c_qna4_2");

        // QNA5: 전주 당일치기 (1건)
        Long qna5 = postMap.get("p_qna5");
        insertComment(qna5, "유나맛집", "KTX 타면 충분해요! 아침 일찍 출발하세요", 21, null, "c_qna5_1");

        // QNA7: 경주 마라톤 (1건)
        Long qna7 = postMap.get("p_qna7");
        insertComment(qna7, "현우의축제일기", "경주시 홈페이지에서 신청 가능합니다!", 19, null, "c_qna7_1");

        // TIP2: 제주 유채꽃 오전 (3건)
        Long tip2 = postMap.get("p_tip2");
        insertComment(tip2, "현우의축제일기", "오 이거 진짜 꿀팁이네요!", 15, null, "c_tip2_1");
        insertComment(tip2, "은지트래블", "역광 때문인지 오후 사진 다 망했었어요 ㅠ", 14, null, "c_tip2_2");
        insertComment(tip2, "축제탐험가", "맞아요! 골든아워는 오전이에요", 13, null, "c_tip2_3");

        // TIP3: 준비물 (2건)
        Long tip3 = postMap.get("p_tip3");
        insertComment(tip3, "민지의하루", "현금 진짜 중요해요! 카드 안 되는 데 많더라고요", 13, null, "c_tip3_1");
        insertComment(tip3, "축제요정", "보조배터리 꼭!! 축제장에서 충전할 데가 없어요", 12, null, "c_tip3_2");

        // TIP4: 가족 노하우 (1건)
        Long tip4 = postMap.get("p_tip4");
        insertComment(tip4, "축제요정", "유아 캐리어 완전 공감! 유모차는 바퀴가 빠져요 ㅋㅋ", 9, null, "c_tip4_1");

        // TIP5: 사진 꿀팁 (1건)
        Long tip5 = postMap.get("p_tip5");
        insertComment(tip5, "여행하는수진", "인물 모드 진짜 차이 많이 나더라고요!!", 7, null, "c_tip5_1");

        // FOOD1: 전주 비빔밥 맛집 (4건)
        Long food1 = postMap.get("p_food1");
        insertComment(food1, "축제탐험가", "한국집 저도 갔어요! 비빔밥 진짜 맛있었습니다", 18, null, "c_food1_1");
        insertComment(food1, "동호아재", "역시 전주 비빔밥은 현지에서 먹어야...", 17, null, "c_food1_2");
        insertComment(food1, "현우의축제일기", "가족회관 콩나물국밥도 추천!", 17, null, "c_food1_3");
        insertRemovedComment(food1, "태양이", 16, "c_food1_removed"); // 삭제된 댓글

        // FOOD2: 부산 회 맛집 (2건)
        Long food2 = postMap.get("p_food2");
        insertComment(food2, "축제요정", "오 여기 진짜 맛있어 보여요! 메모해둘게요", 14, null, "c_food2_1");
        insertComment(food2, "동호아재", "해운대 시장 회 맛집 다 찾아봐도 이 집이 최고", 13, null, "c_food2_2");

        // FOOD3: 강릉 카페 (2건)
        Long food3 = postMap.get("p_food3");
        insertComment(food3, "축제요정", "와 핸드드립 카페 진짜 찾고 있었는데!", 8, null, "c_food3_1");
        insertComment(food3, "여행하는수진", "강릉은 역시 커피 천국이네요 ☕", 7, null, "c_food3_2");

        // FOOD4: 대구 치맥 (1건)
        Long food4 = postMap.get("p_food4");
        insertComment(food4, "유나맛집", "올해 라인업 기대되네요!", 6, null, "c_food4_1");

        log.info("  ✅ 댓글 {}건 생성", commentMap.size());
    }

    private void insertComment(Long postId, String nickname, String content,
                               int daysAgo, String parentKey, String key) {
        Long parentId = parentKey != null ? commentMap.get(parentKey) : null;
        jdbc.update("""
            INSERT INTO comments (post_id, user_id, user_name, content, parent_id, status, created_at)
            VALUES (?, ?, ?, ?, ?, 'ACTIVE', ?)
            """,
                postId, userMap.get(nickname), nickname, content, parentId,
                at(daysAgo, 12 + (daysAgo % 10), (daysAgo * 11) % 60));
        Long id = jdbc.queryForObject("SELECT MAX(comment_id) FROM comments", Long.class);
        commentMap.put(key, id);
    }

    private void insertRemovedComment(Long postId, String nickname, int daysAgo, String key) {
        jdbc.update("""
            INSERT INTO comments (post_id, user_id, user_name, content, status, created_at)
            VALUES (?, ?, ?, '삭제된 댓글입니다.', 'REMOVED', ?)
            """,
                postId, userMap.get(nickname), nickname,
                at(daysAgo, 14, 30));
        Long id = jdbc.queryForObject("SELECT MAX(comment_id) FROM comments", Long.class);
        commentMap.put(key, id);
    }

    // ═══════════════════════════════════════════════
    //  7. Post Likes (15건)
    // ═══════════════════════════════════════════════
    private void seedPostLikes() {
        // 인기글 2개에 집중
        String[][] likes = {
            // postKey, nickname
            {"p_tip_popular", "축제요정"},
            {"p_tip_popular", "여행하는수진"},
            {"p_tip_popular", "동호아재"},
            {"p_tip_popular", "은지트래블"},
            {"p_tip_popular", "민지의하루"},
            {"p_tip_popular", "현우의축제일기"},
            {"p_qna1", "축제탐험가"},
            {"p_qna1", "여행하는수진"},
            {"p_qna1", "유나맛집"},
            {"p_food1", "축제탐험가"},
            {"p_food1", "동호아재"},
            {"p_food1", "현우의축제일기"},
            {"p_tip2", "축제탐험가"},
            {"p_tip2", "현우의축제일기"},
            {"p_food3", "축제요정"},
        };

        for (String[] l : likes) {
            jdbc.update("""
                INSERT INTO post_likes (post_id, user_id, created_at)
                VALUES (?, ?, NOW() - INTERVAL '1 day' * ?)
                """, postMap.get(l[0]), userMap.get(l[1]), 1 + new Random().nextInt(20));
        }
        log.info("  ✅ 좋아요 {}건 생성", likes.length);
    }

    // ═══════════════════════════════════════════════
    //  8. Reports (10건)
    // ═══════════════════════════════════════════════
    private void seedReports() {
        // PENDING (5건) — 관리자 시연용
        insertReport("여행하는수진", "REVIEW", reviewMap.get("r_spam_review"), "SPAM",
                "광고성 리뷰입니다. 축제와 무관한 비방이 포함되어 있습니다.", "PENDING", 8);
        insertReport("현우의축제일기", "POST", postMap.get("p_inappropriate_post"), "INAPPROPRIATE",
                "부적절한 표현이 포함된 게시글입니다.", "PENDING", 7);
        insertReport("축제요정", "POST", postMap.get("p_spam_post"), "SPAM",
                "스팸 링크가 포함된 홍보성 게시글입니다.", "PENDING", 9);
        insertReport("축제탐험가", "COMMENT", commentMap.get("c_tip1_removed"), "ABUSE",
                "삭제된 댓글에 욕설이 포함되어 있었습니다.", "PENDING", 6);
        insertReport("유나맛집", "REVIEW", reviewMap.get("r_taeyang_busan"), "FALSE_INFO",
                "허위 정보가 포함된 리뷰입니다. 실제 방문하지 않은 것으로 보입니다.", "PENDING", 5);

        // RESOLVED (3건)
        Long r6 = insertReport("축제요정", "COMMENT", commentMap.get("c_food1_removed"), "ABUSE",
                "욕설과 비방이 포함된 댓글입니다.", "RESOLVED", 15);
        jdbc.update("UPDATE reports SET action = 'DELETE_CONTENT', admin_note = '콘텐츠 확인, 삭제 처리 완료', processed_at = ? WHERE id = ?",
                at(13, 14, 0), r6);

        Long r7 = insertReport("민지의하루", "COMMENT", commentMap.get("c_qna1_3"), "ABUSE",
                "해당 댓글의 표현이 부적절합니다.", "RESOLVED", 14);
        jdbc.update("UPDATE reports SET action = 'WARN_USER', admin_note = '사용자 경고 처리', processed_at = ? WHERE id = ?",
                at(12, 15, 0), r7);

        Long r8 = insertReport("동호아재", "REVIEW", reviewMap.get("r_jeju4"), "INAPPROPRIATE",
                "부적절한 표현이 있습니다.", "RESOLVED", 10);
        jdbc.update("UPDATE reports SET action = 'DELETE_CONTENT', admin_note = '내용 확인, 삭제 처리', processed_at = ? WHERE id = ?",
                at(8, 11, 0), r8);

        // REJECTED (2건)
        Long r9 = insertReport("축제탐험가", "POST", postMap.get("p_food2"), "OTHER",
                "내용이 의심스럽습니다.", "REJECTED", 12);
        jdbc.update("UPDATE reports SET action = 'NONE', admin_note = '확인 결과 문제 없음', processed_at = ? WHERE id = ?",
                at(10, 16, 0), r9);

        Long r10 = insertReport("여행하는수진", "COMMENT", commentMap.get("c_qna3_2"), "OTHER",
                "과장된 내용 같아서 신고합니다.", "REJECTED", 3);
        jdbc.update("UPDATE reports SET action = 'NONE', admin_note = '주관적 의견으로 판단, 기각 처리', processed_at = ? WHERE id = ?",
                at(2, 10, 0), r10);

        log.info("  ✅ 신고 10건 생성 (PENDING 5 / RESOLVED 3 / REJECTED 2)");
    }

    private Long insertReport(String reporterNick, String targetType, Long targetId,
                              String reason, String description, String status, int daysAgo) {
        jdbc.update("""
            INSERT INTO reports (reporter_id, target_type, target_id, reason,
                                 description, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
                userMap.get(reporterNick), targetType, targetId, reason,
                description, status, at(daysAgo, 10, 30));
        return jdbc.queryForObject("SELECT MAX(id) FROM reports", Long.class);
    }

    // ═══════════════════════════════════════════════
    //  9. Inquiries (7건)
    // ═══════════════════════════════════════════════
    private void seedInquiries() {
        // PENDING (4건)
        insertInquiry("민지의하루", "비밀번호 변경이 안 됩니다",
                "비밀번호 변경 버튼을 눌러도 반응이 없습니다. 크롬 브라우저 사용 중입니다.", "PENDING", 5, null);
        insertInquiry("오재혁여행기", "축제 정보 등록 요청합니다",
                "저희 지역에서 열리는 축제가 등록되어 있지 않아서 추가 요청드립니다.", "PENDING", 4, null);
        insertInquiry("해인스타", "계정 정지 해제 요청드립니다",
                "제 계정이 정지되었는데 사유를 알고 싶고, 해제를 요청드립니다.", "PENDING", 3, null);
        insertInquiry("동호아재", "즐겨찾기 동기화가 안 됩니다",
                "PC에서 찜한 축제가 모바일에서 안 보입니다.", "PENDING", 2, null);

        // ANSWERED (3건)
        insertInquiry("축제탐험가", "축제 일정 정보가 원래와 다릅니다",
                "서울 벚꽃 축제 시작일이 실제와 다른 것 같습니다. 확인 부탁드립니다.",
                "ANSWERED", 20,
                "안녕하세요. 확인 후 수정 반영하였습니다. 이용해 주셔서 감사합니다.");
        insertInquiry("은지트래블", "프로필 이미지 업로드 오류",
                "프로필 사진을 변경하려고 하는데 업로드가 안 됩니다.",
                "ANSWERED", 15,
                "안녕하세요. 10MB 이하의 JPG/PNG 파일만 업로드 가능합니다. 파일 크기를 확인해 주세요.");
        insertInquiry("여행하는수진", "알림이 오지 않습니다",
                "즐겨찾기한 축제의 알림이 안 옵니다. 설정은 모두 켜져 있습니다.",
                "ANSWERED", 12,
                "안녕하세요. 앱 설정 > 알림 권한이 허용되어 있는지 확인해 주세요. 문제가 지속되면 다시 문의해 주세요.");

        log.info("  ✅ 문의 7건 생성 (PENDING 4 / ANSWERED 3)");
    }

    private void insertInquiry(String nickname, String title, String content,
                               String status, int daysAgo, String answer) {
        if ("ANSWERED".equals(status) && answer != null) {
            jdbc.update("""
                INSERT INTO inquiries (user_id, title, content, status, answer, answered_at, answered_by, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                    userMap.get(nickname), title, content, status,
                    answer, at(daysAgo - 1, 14, 0), adminId,
                    at(daysAgo, 10, 30));
        } else {
            jdbc.update("""
                INSERT INTO inquiries (user_id, title, content, status, created_at)
                VALUES (?, ?, ?, ?, ?)
                """,
                    userMap.get(nickname), title, content, status,
                    at(daysAgo, 10, 30));
        }
    }

    // ═══════════════════════════════════════════════
    //  10. Notices (5건)
    // ═══════════════════════════════════════════════
    private void seedNotices() {
        Object[][] notices = {
            // title, content, isPinned, isActive, daysAgo
            {"🎉 이음(ieum) 축제 플랫폼 정식 오픈!",
                "안녕하세요! 대한민국 축제 정보 플랫폼 '이음'이 정식 오픈하였습니다.\n\n전국의 축제 정보를 한눈에 확인하고, 리뷰와 커뮤니티를 통해 다양한 경험을 나눌 수 있습니다.\n\n많은 이용 부탁드립니다 🎪",
                true, true, 30},
            {"개인정보 처리방침 안내",
                "이음 서비스의 개인정보 처리방침을 안내드립니다.\n\n자세한 내용은 하단의 개인정보 처리방침 링크를 확인해 주세요.",
                false, true, 20},
            {"서버 점검 안내 (4/10 02:00~04:00)",
                "안녕하세요. 서비스 안정화를 위한 서버 점검이 예정되어 있습니다.\n\n점검 시간: 4/10(목) 02:00 ~ 04:00 (약 2시간)\n점검 중에는 서비스 이용이 제한됩니다.",
                false, true, 10},
            {"🌸 2026 봄 축제 시즌 이벤트 안내",
                "2026 봄 축제 시즌을 맞아 특별 이벤트를 진행합니다!\n\n리뷰 작성 시 추첨을 통해 커피 기프티콘을 드립니다.\n이벤트 기간: 4/10 ~ 4/30",
                true, true, 5},
            {"커뮤니티 이용 가이드라인",
                "쾌적한 커뮤니티 이용을 위한 가이드라인입니다.\n\n1. 욕설/비방 금지\n2. 광고/스팸 금지\n3. 허위 정보 유포 금지\n4. 개인정보 노출 금지\n\n위반 시 게시물 삭제 및 계정 정지 조치될 수 있습니다.",
                false, true, 3},
        };

        for (Object[] n : notices) {
            jdbc.update("""
                INSERT INTO notices (title, content, is_pinned, is_active, view_count, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                    n[0], n[1], n[2], n[3],
                    30 + ((int) n[4] * 5),
                    at((int) n[4], 9, 0));
        }
        log.info("  ✅ 공지 5건 생성");
    }

    // ═══════════════════════════════════════════════
    //  11. Favorites (18건)
    // ═══════════════════════════════════════════════
    private void seedFavorites() {
        String[][] favs = {
            {"축제요정", "서울 벚꽃 축제 2026"},
            {"축제요정", "제주 유채꽃 축제"},
            {"축제요정", "강릉 커피 축제 2026"},
            {"축제요정", "인천 펜타포트 록 페스티벌"},
            {"축제탐험가", "서울 벚꽃 축제 2026"},
            {"축제탐험가", "부산 해운대 모래 축제"},
            {"축제탐험가", "대구 치맥 페스티벌"},
            {"여행하는수진", "서울 벚꽃 축제 2026"},
            {"여행하는수진", "제주 유채꽃 축제"},
            {"현우의축제일기", "서울 벚꽃 축제 2026"},
            {"현우의축제일기", "전주 비빔밥 축제"},
            {"현우의축제일기", "경주 벚꽃 마라톤"},
            {"유나맛집", "전주 비빔밥 축제"},
            {"유나맛집", "대구 치맥 페스티벌"},
            {"동호아재", "서울 벚꽃 축제 2026"},
            {"은지트래블", "제주 유채꽃 축제"},
            {"은지트래블", "강릉 커피 축제 2026"},
            {"성민이야기", "서울 벚꽃 축제 2026"},
        };

        for (String[] f : favs) {
            jdbc.update("""
                INSERT INTO favorites (user_id, festival_id, created_at)
                VALUES (?, ?, NOW() - INTERVAL '1 day' * ?)
                """, userMap.get(f[0]), festMap.get(f[1]), 1 + new Random().nextInt(25));
        }
        log.info("  ✅ 찜 {}건 생성", favs.length);
    }

    // ═══════════════════════════════════════════════
    //  12. Notifications (12건)
    // ═══════════════════════════════════════════════
    private void seedNotifications() {
        Object[][] notifs = {
            // userId(nickname), type, message, isRead, daysAgo
            {"축제요정", "COMMENT_REPLY", "축제탐험가님이 회원님의 게시글에 댓글을 남겼습니다.", false, 3},
            {"축제요정", "FESTIVAL_REMINDER", "내일 서울 벚꽃 축제가 시작됩니다!", true, 6},
            {"축제요정", "REPORT_RESULT", "신고하신 게시글이 처리되었습니다.", false, 2},
            {"축제탐험가", "COMMENT_REPLY", "축제요정님이 댓글을 남겼습니다.", true, 4},
            {"축제탐험가", "NOTICE", "새로운 공지사항이 등록되었습니다.", false, 5},
            {"여행하는수진", "COMMENT_REPLY", "민지의하루님이 답글을 남겼습니다.", true, 7},
            {"유나맛집", "FESTIVAL_REMINDER", "전주 비빔밥 축제가 종료되었습니다.", true, 20},
            {"민지의하루", "COMMENT_REPLY", "축제탐험가님이 답글을 남겼습니다.", false, 3},
            {"해인스타", "SYSTEM", "회원님의 계정이 정지되었습니다.", true, 10},
            {"태양이", "SYSTEM", "회원님의 계정이 정지되었습니다.", false, 8},
            {"동호아재", "NOTICE", "새로운 공지사항이 등록되었습니다.", false, 5},
            {"은지트래블", "FESTIVAL_REMINDER", "제주 유채꽃 축제가 진행 중입니다!", true, 3},
        };

        for (Object[] n : notifs) {
            jdbc.update("""
                INSERT INTO notifications (user_id, type, message, is_read, created_at)
                VALUES (?, ?, ?, ?, ?)
                """,
                    userMap.get((String) n[0]), n[1], n[2], n[3],
                    at((int) n[4], 9 + ((int) n[4] % 8), ((int) n[4] * 13) % 60));
        }
        log.info("  ✅ 알림 {}건 생성", notifs.length);
    }

    // ═══════════════════════════════════════════════
    //  13. Cache Sync
    // ═══════════════════════════════════════════════
    private void syncCaches() {
        // festivals: avg_rating, review_count
        jdbc.update("""
            UPDATE festivals f SET
              avg_rating = COALESCE(s.r, 0), review_count = COALESCE(s.c, 0)
            FROM (SELECT festival_id, AVG(rating)::NUMERIC(3,2) r, COUNT(*) c
                  FROM reviews WHERE status = 'ACTIVE' GROUP BY festival_id) s
            WHERE f.id = s.festival_id
            """);

        // festivals: favorite_count
        jdbc.update("""
            UPDATE festivals f SET favorite_count = COALESCE(s.c, 0)
            FROM (SELECT festival_id, COUNT(*) c FROM favorites GROUP BY festival_id) s
            WHERE f.id = s.festival_id
            """);

        // posts: like_count
        jdbc.update("""
            UPDATE posts p SET like_count = COALESCE(s.c, 0)
            FROM (SELECT post_id, COUNT(*) c FROM post_likes GROUP BY post_id) s
            WHERE p.id = s.post_id
            """);

        log.info("  ✅ 캐시 동기화 완료 (avg_rating, review_count, favorite_count, like_count)");
    }

    // ═══════════════════════════════════════════════
    //  Helper
    // ═══════════════════════════════════════════════
    private LocalDateTime at(int daysAgo, int hour, int minute) {
        return LocalDateTime.now().minusDays(daysAgo)
                .withHour(Math.min(hour, 23))
                .withMinute(Math.min(minute, 59))
                .withSecond(0).withNano(0);
    }

    private boolean alreadySeeded() {
        try {
            Integer count = jdbc.queryForObject(
                    "SELECT COUNT(*) FROM users WHERE login_id = 'jiyeon.park'", Integer.class);
            return count != null && count > 0;
        } catch (Exception e) {
            return false;
        }
    }
}
