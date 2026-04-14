"use client";

import Modal from "./Modal";
import styles from "./Modal.module.css";

interface ConfirmModalProps {
  /** 모달 제목 */
  title?: string;
  /** 확인 메시지 */
  message: string;
  /** 확인 버튼 텍스트 (기본: "확인") */
  confirmText?: string;
  /** 취소 버튼 텍스트 (기본: "취소") */
  cancelText?: string;
  /** 위험 액션 여부 — true면 확인 버튼이 빨간색 (기본: false) */
  danger?: boolean;
  /** 확인 클릭 콜백 */
  onConfirm: () => void;
  /** 취소/닫기 콜백 */
  onCancel: () => void;
}

/**
 * 확인 모달 컴포넌트
 * - "정말 삭제하시겠습니까?" 류의 간단한 확인/취소 모달
 * - danger 옵션으로 삭제 등 위험 액션 시 빨간 버튼 표시
 */
export default function ConfirmModal({
  title = "확인",
  message,
  confirmText = "확인",
  cancelText = "취소",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal title={title} size="small" onClose={onCancel}>
      <p className={styles.confirmMessage}>{message}</p>
      <div className={styles.footer}>
        <button
          type="button"
          className={styles.btnCancel}
          onClick={onCancel}
        >
          {cancelText}
        </button>
        <button
          type="button"
          className={`${styles.btnConfirm} ${danger ? styles.btnDanger : ""}`}
          onClick={onConfirm}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}
