"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Modal } from "@/_component/common/Modal";
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
          <div className={styles.legalContent}>
            <h3>제1조 (목적)</h3>
            <p>
              본 약관은 이음(IEUM) 플랫폼(이하 &quot;서비스&quot;)이 제공하는 축제 정보 서비스의 이용과 관련하여
              회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
            </p>

            <h3>제2조 (정의)</h3>
            <p>
              ① &quot;서비스&quot;란 이음 플랫폼을 통해 제공되는 축제 정보 조회, 리뷰 작성, 커뮤니티, 즐겨찾기 등 일체의 서비스를 말합니다.<br />
              ② &quot;회원&quot;이란 본 약관에 동의하고 회원가입을 완료한 자를 말합니다.<br />
              ③ &quot;게시물&quot;이란 회원이 서비스 내에 게시한 글, 댓글, 리뷰, 이미지 등을 말합니다.
            </p>

            <h3>제3조 (약관의 효력 및 변경)</h3>
            <p>
              ① 본 약관은 서비스 화면에 게시하거나 기타 방법으로 회원에게 공지함으로써 효력이 발생합니다.<br />
              ② 회사는 관련 법령에 위배되지 않는 범위 내에서 약관을 변경할 수 있으며, 변경 시 적용일자 및
              변경 사유를 명시하여 최소 7일 전에 공지합니다.
            </p>

            <h3>제4조 (회원가입 및 탈퇴)</h3>
            <p>
              ① 회원가입은 이용자가 약관에 동의하고, 회원정보를 기입한 후 회사가 이를 승인함으로써 완료됩니다.<br />
              ② 회원은 언제든지 서비스 내 설정을 통해 탈퇴를 요청할 수 있으며, 회사는 즉시 처리합니다.<br />
              ③ 회원 탈퇴 시 개인정보는 관련 법령에 따라 일정 기간 보관 후 파기됩니다.
            </p>

            <h3>제5조 (서비스의 제공 및 변경)</h3>
            <p>
              ① 회사는 다음의 서비스를 제공합니다: 전국 축제 정보 조회, 축제 리뷰 작성, 축제 즐겨찾기,
              커뮤니티 게시판, 축제 달력, 1:1 문의 등.<br />
              ② 회사는 운영상·기술상 필요에 따라 서비스의 전부 또는 일부를 변경할 수 있습니다.
            </p>

            <h3>제6조 (회원의 의무)</h3>
            <p>
              ① 회원은 타인의 정보를 도용하거나 허위 정보를 등록해서는 안 됩니다.<br />
              ② 회원은 서비스를 이용하여 불법 행위, 타인의 명예 훼손, 음란물 유포 등을 해서는 안 됩니다.<br />
              ③ 회원은 서비스의 안정적 운영을 방해하는 행위를 해서는 안 됩니다.
            </p>

            <h3>제7조 (게시물의 관리)</h3>
            <p>
              ① 회원이 작성한 게시물의 저작권은 해당 회원에게 있습니다.<br />
              ② 회사는 관련 법령에 위반되거나 본 약관에 반하는 게시물을 사전 통보 없이 삭제하거나 이동할 수 있습니다.<br />
              ③ 회사는 신고된 게시물에 대해 검토 후 적절한 조치를 취할 수 있습니다.
            </p>

            <h3>제8조 (신고 및 이용 제한)</h3>
            <p>
              ① 회원은 게시글, 댓글, 리뷰 등에서 불건전하거나 부적절한 내용을 발견한 경우 신고할 수 있습니다.<br />
              ② 신고된 콘텐츠는 관리자가 검토하며, 신고 사유가 타당하다고 판단될 경우 해당 콘텐츠는 삭제 또는 비공개 처리됩니다.<br />
              ③ 동일 회원이 신고 처리(경고) 누적 3회까지는 경고 조치하며, 4회째 신고가 확인될 경우 관리자는 해당 회원의 서비스 이용을 7일간 정지할 수 있습니다.<br />
              ④ 이용 정지 기간 중 해당 회원은 게시글 작성, 댓글 작성, 리뷰 작성 등 서비스 이용이 제한됩니다.<br />
              ⑤ 이용 정지 이후에도 반복적인 위반이 확인될 경우, 관리자는 영구 이용 정지 등 추가 조치를 취할 수 있습니다.
            </p>

            <h3>제9조 (면책 조항)</h3>
            <p>
              ① 회사는 천재지변, 전쟁, 기간통신사업자의 서비스 중지 등 불가항력으로 서비스를 제공할 수 없는
              경우 책임이 면제됩니다.<br />
              ② 회사는 회원의 귀책사유로 인한 서비스 이용 장애에 대해 책임을 지지 않습니다.<br />
              ③ 회사는 회원이 게재한 정보·자료의 신뢰도, 정확성에 대해 책임을 지지 않습니다.
            </p>

            <p className={styles.legalDate}>시행일: 2026년 1월 1일</p>
          </div>
        </Modal>
      )}

      {/* ===== 개인정보처리방침 모달 ===== */}
      {openModal === "privacy" && (
        <Modal
          title="개인정보처리방침"
          size="large"
          onClose={() => setOpenModal(null)}
        >
          <div className={styles.legalContent}>
            <h3>제1조 (개인정보의 수집 항목 및 수집 방법)</h3>
            <p>
              회사는 서비스 제공을 위해 다음의 개인정보를 수집합니다.<br />
              ① 필수항목: 아이디, 비밀번호, 닉네임, 이름<br />
              ② 선택항목: 전화번호, 프로필 이미지<br />
              ③ 자동 수집항목: 접속 IP, 쿠키, 서비스 이용 기록
            </p>

            <h3>제2조 (개인정보의 수집 및 이용 목적)</h3>
            <p>
              ① 회원 관리: 회원제 서비스 이용, 본인 확인, 부정 이용 방지<br />
              ② 서비스 제공: 축제 정보 제공, 맞춤형 서비스 제공, 이벤트 안내<br />
              ③ 서비스 개선: 접속 빈도 분석, 통계 활용
            </p>

            <h3>제3조 (개인정보의 보유 및 이용 기간)</h3>
            <p>
              ① 회원 탈퇴 시 지체 없이 파기합니다. 단, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.<br />
              ② 전자상거래 등에서의 소비자보호에 관한 법률: 계약 또는 청약철회 등에 관한 기록 5년<br />
              ③ 통신비밀보호법: 로그인 기록 3개월
            </p>

            <h3>제4조 (개인정보의 제3자 제공)</h3>
            <p>
              회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 이용자의 동의가 있거나
              법령에 의한 경우에는 예외로 합니다.
            </p>

            <h3>제5조 (개인정보의 파기 절차 및 방법)</h3>
            <p>
              ① 파기 절차: 목적 달성 후 별도 DB로 옮겨 일정 기간 저장 후 파기<br />
              ② 파기 방법: 전자적 파일은 복구 불가능한 방법으로, 종이 문서는 분쇄 또는 소각하여 파기
            </p>

            <h3>제6조 (이용자의 권리)</h3>
            <p>
              ① 이용자는 언제든지 자신의 개인정보를 조회하거나 수정할 수 있습니다.<br />
              ② 이용자는 개인정보 수집·이용에 대한 동의를 철회할 수 있습니다.<br />
              ③ 개인정보 관련 문의는 고객지원(ieum@festival.kr)으로 연락해 주시기 바랍니다.
            </p>

            <p className={styles.legalDate}>시행일: 2026년 1월 1일</p>
          </div>
        </Modal>
      )}
    </>
  );
}
