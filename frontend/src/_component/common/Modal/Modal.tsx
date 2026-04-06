"use client";

import { useEffect, useCallback } from "react";
import { X } from "lucide-react";
import styles from "./Modal.module.css";

interface ModalProps {
  /** 모달 제목 (생략 시 헤더 없이 본문만 표시) */
  title?: string;
  /** 모달 크기 */
  size?: "small" | "medium" | "large";
  /** 닫기 콜백 */
  onClose: () => void;
  /** 오버레이 클릭 시 닫기 허용 여부 (기본 true) */
  closeOnOverlay?: boolean;
  /** 본문 */
  children: React.ReactNode;
}

/**
 * 공용 모달 컴포넌트
 * - 오버레이 + 모달 박스 + 선택적 헤더(제목/닫기)
 * - children으로 자유롭게 내용 배치
 * - ESC 키로 닫기 지원
 */
export default function Modal({
  title,
  size = "medium",
  onClose,
  closeOnOverlay = true,
  children,
}: ModalProps) {
  /* ESC 키 닫기 */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden"; // 배경 스크롤 방지
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  const sizeClass =
    size === "small"
      ? styles.sizeSmall
      : size === "large"
        ? styles.sizeLarge
        : styles.sizeMedium;

  return (
    <div
      className={styles.overlay}
      onClick={closeOnOverlay ? onClose : undefined}
    >
      <div
        className={`${styles.modal} ${sizeClass}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title || "모달"}
      >
        {/* 헤더 */}
        {title && (
          <div className={styles.header}>
            <h2 className={styles.title}>{title}</h2>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="닫기"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* 본문 */}
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
