"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { X } from "lucide-react";
import styles from "./Toast.module.css";

/* ===== 타입 ===== */
export type ToastType = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
  exiting?: boolean;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

/* ===== Context ===== */
const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast는 ToastProvider 안에서 사용해야 합니다.");
  return ctx;
}

/* ===== 아이콘 ===== */
const ICONS: Record<ToastType, string> = {
  success: "✅",
  error: "❌",
  warning: "⚠️",
  info: "ℹ️",
};

/* ===== Provider ===== */
let idCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    // 퇴장 애니메이션 후 제거
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 200);
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, type, message }]);

      // 자동 제거 (api-response-ruleset: 성공 토스트 2초)
      const duration = type === "error" ? 4000 : 2000;
      setTimeout(() => removeToast(id), duration);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* 토스트 렌더링 영역 */}
      {toasts.length > 0 && (
        <div className={styles.container}>
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`${styles.toast} ${styles[t.type]} ${t.exiting ? styles.exiting : ""}`}
            >
              <span className={styles.icon}>{ICONS[t.type]}</span>
              <span className={styles.message}>{t.message}</span>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => removeToast(t.id)}
                aria-label="닫기"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}
