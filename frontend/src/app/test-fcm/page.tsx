"use client";

import { useState } from "react";
import { requestFcmToken } from "@/lib/firebase";

export default function TestFcmPage() {
  const [token, setToken] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  const handleGetToken = async () => {
    try {
      const fcmToken = await requestFcmToken();
      if (fcmToken) {
        setToken(fcmToken);
        setMessage("✅ 단말기 토큰 발급 성공!");
      } else {
        setMessage("❌ 토큰 발급 실패 (권한 거부 또는 설정 오류)");
      }
    } catch (error: any) {
      setMessage(`에러: ${error.message}`);
    }
  };

  return (
    <main style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>FCM 푸시 알림 테스트</h1>
      <p>지금까지 구성한 FCM 설정이 정상 작동하는지 확인하기 위한 테스트 페이지입니다.</p>
      
      <div style={{ margin: "20px 0" }}>
        <button 
          onClick={handleGetToken}
          style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}
        >
          FCM 토큰 발급받기
        </button>
      </div>

      <div style={{ marginTop: "20px", padding: "10px", backgroundColor: "#f0f0f0", borderRadius: "8px" }}>
        <strong>상태 메시지:</strong> <br />
        {message}
      </div>

      {token && (
        <div style={{ marginTop: "20px" }}>
          <strong>🔑 발급된 토큰:</strong>
          <textarea 
            readOnly 
            value={token} 
            style={{ width: "100%", height: "100px", marginTop: "10px", padding: "10px" }}
          />
          <p style={{ marginTop: "10px", color: "blue" }}>
            이제 백엔드 Swagger UI (<code>/swagger-ui/index.html</code>) 또는 Postman을 열고,<br/>
            <strong>POST <code>/api/test/fcm/send</code></strong> 로 위 토큰을 넣어 요청해보세요!
          </p>
        </div>
      )}
    </main>
  );
}
