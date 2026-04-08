"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Modal } from "@/_component/common/Modal";
import TermsContent from "./TermsContent";
import PrivacyContent from "./PrivacyContent";
import styles from "./Footer.module.css";

type ModalType = "terms" | "privacy" | null;

export default function Footer() {
  const pathname = usePathname();
  const [openModal, setOpenModal] = useState<ModalType>(null);

  if (pathname.startsWith("/admin")) return null;

  return (
    <>
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
              전국의 다양한 축제 정보를 하나로 연결합니다.<br />
              지역 축제의 매력을 발견하고, 특별한 경험을 만들어 보세요.
            </p>
          </div>

          {/* ②③④ 링크 컬럼 */}
          <div className={styles.links}>
            {/* ② 서비스 */}
            <div className={styles.linkCol}>
              <h4>서비스</h4>
              <ul>
                <li><Link href="/">전국축제</Link></li>
                <li><Link href="/pastFestivals">지난축제</Link></li>
                <li><Link href="/calendar">축제 달력</Link></li>
                <li><Link href="/community">커뮤니티</Link></li>
              </ul>
            </div>

            {/* ③ 고객지원 */}
            <div className={styles.linkCol}>
              <h4>고객지원</h4>
              <ul>
                <li><Link href="/notices">공지사항</Link></li>
                <li><Link href="/inquiry">1:1 문의</Link></li>
                <li>
                  <button
                    type="button"
                    className={styles.modalLink}
                    onClick={() => setOpenModal("terms")}
                  >
                    이용약관
                  </button>
                </li>
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

        {/* ===== 하단: 저작권 ===== */}
        <div className={styles.footerBottom}>
          <p className={styles.copyright}>
            © 2026 이음(IEUM). All rights reserved. |{" "}
            <button
              type="button"
              className={styles.modalLink}
              onClick={() => setOpenModal("privacy")}
            >
              개인정보처리방침
            </button>{" "}
            |{" "}
            <button
              type="button"
              className={styles.modalLink}
              onClick={() => setOpenModal("terms")}
            >
              이용약관
            </button>
          </p>
        </div>
      </footer>

      {/* ===== 이용약관 모달 ===== */}
      {openModal === "terms" && (
        <Modal
          title="이용약관"
          size="large"
          onClose={() => setOpenModal(null)}
        >
          <TermsContent />
        </Modal>
      )}

      {/* ===== 개인정보처리방침 모달 ===== */}
      {openModal === "privacy" && (
        <Modal
          title="개인정보처리방침"
          size="large"
          onClose={() => setOpenModal(null)}
        >
          <PrivacyContent />
        </Modal>
      )}
    </>
  );
}
