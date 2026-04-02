import Link from "next/link";
import Image from "next/image";
import { Camera, Play, BookOpen } from "lucide-react";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      {/* ===== 상단: 브랜드 + 링크 ===== */}
      <div className={styles.footerTop}>
        {/* ① 브랜드 영역 */}
        <div className={styles.brand}>
          <Link href="/" className={styles.brandLogo}>
            <Image
              src="/favicon/favicon-ieum-transparent.png"
              alt="이음"
              width={24}
              height={24}
            />
            <span className={styles.brandLogoText}>이음</span>
          </Link>
          <p className={styles.brandDesc}>
            전국의 다양한 축제 정보를 하나로 연결합니다.
            <br />
            지역 축제의 매력을 발견하고, 특별한 경험을 만들어 보세요.
          </p>
        </div>

        {/* ②③④ 링크 컬럼 */}
        <div className={styles.links}>
          {/* ② 서비스 — E1: 각 링크 클릭 시 해당 페이지 이동 */}
          <div className={styles.linkCol}>
            <h4>서비스</h4>
            <ul>
              <li><Link href="/festivals">전국축제</Link></li>
              <li><Link href="/pastFestivals">지난축제</Link></li>
              <li><Link href="/calendar">축제 달력</Link></li>
              <li><Link href="/community">커뮤니티</Link></li>
            </ul>
          </div>

          {/* ③ 고객지원 — E2: 1:1 문의는 회원 전용 */}
          <div className={styles.linkCol}>
            <h4>고객지원</h4>
            <ul>
              <li><Link href="/notices">공지사항</Link></li>
              <li><Link href="/inquiry">1:1 문의</Link></li>
              <li><Link href="/faq">자주 묻는 질문</Link></li>
              <li><Link href="/terms">이용약관</Link></li>
            </ul>
          </div>

          {/* ④ 문의하기 */}
          <div className={styles.linkCol}>
            <h4>문의하기</h4>
            <ul>
              <li>이메일: ieum@festival.kr</li>
              <li>전화: 02-1234-5678</li>
              <li>평일 09:00 ~ 18:00</li>
              <li>주말 및 공휴일 휴무</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ===== 하단: 저작권 + SNS ===== */}
      <div className={styles.footerBottom}>
        {/* ⑤ 저작권 — E3: 법적 고지 클릭 시 별도 페이지 */}
        <p className={styles.copyright}>
          © 2026 이음(IEUM). All rights reserved. |{" "}
          <Link href="/privacy" target="_blank" rel="noopener noreferrer">
            개인정보처리방침
          </Link>{" "}
          |{" "}
          <Link href="/terms" target="_blank" rel="noopener noreferrer">
            이용약관
          </Link>
        </p>

        {/* ⑥ SNS 아이콘 — E4: 새 탭으로 열기 */}
        <div className={styles.social}>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialIcon}
            aria-label="인스타그램"
          >
            <Camera strokeWidth={1.5} />
          </a>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialIcon}
            aria-label="유튜브"
          >
            <Play strokeWidth={1.5} />
          </a>
          <a
            href="https://blog.naver.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialIcon}
            aria-label="블로그"
          >
            <BookOpen strokeWidth={1.5} />
          </a>
        </div>
      </div>
    </footer>
  );
}
