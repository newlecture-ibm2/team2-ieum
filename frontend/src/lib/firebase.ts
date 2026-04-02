// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken } from "firebase/messaging";

// .env.local에 저장된 환경변수 불러오기
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
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
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
        });

        if (currentToken) {
            console.log("🔥 FCM 토큰 발급 성공:", currentToken);
            // 백엔드로 토큰을 보내는 로직을 여기에 추가하거나 호출부에서 처리합니다.
            return currentToken;
        } else {
            console.log("🚫 FCM 알림 권한이 거부되었습니다.");
            return null;
        }
    } catch (err) {
        console.error("FCM 토큰 발급 중 에러 발생:", err);
        return null;
    }
};

export default app;
