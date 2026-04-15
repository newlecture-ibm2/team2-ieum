// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Firebase 설정 (클라이언트 키 — 브라우저에 노출되는 공개 정보이므로 하드코딩 OK)
const firebaseConfig = {
  apiKey: "AIzaSyATlHhbCwTDkKaolwYB5AaMiKzDq9WPDBw",
  authDomain: "team2-ieum.firebaseapp.com",
  projectId: "team2-ieum",
  storageBucket: "team2-ieum.firebasestorage.app",
  messagingSenderId: "920769033731",
  appId: "1:920769033731:web:9a443d83025a788cb3c036",
  measurementId: "G-W1D66PBWS7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 브라우저 오류 방지(SSR 환경에서는 실행 안 함)
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
export const messaging = typeof window !== "undefined" ? getMessaging(app) : null;

/**
 * 사용자 기기의 FCM 토큰(Device Token) 발급 요청 함수
 */
export const requestFcmToken = async () => {
    if (!messaging) return null;
    try {
        // 백엔드에 전달할 디바이스 토큰 받기 (VAPID KEY는 추후 콘솔에서 복사 필요)
        const currentToken = await getToken(messaging, { 
            vapidKey: "BC8lNT59SL9jHN7qPyMHUinuu8NuMHi9Dhqx6jMilqdps3E6aIbxLQEPfWJOIdo_pzuejRzvikhNIzZo5M3780A"
        });

        if (currentToken) {
            // 백엔드로 토큰을 보내는 로직을 여기에 추가하거나 호출부에서 처리합니다.
            return currentToken;
        } else {
            return null;
        }
    } catch (err) {
        console.error("FCM 토큰 발급 중 에러 발생:", err);
        return null;
    }
};

export default app;
