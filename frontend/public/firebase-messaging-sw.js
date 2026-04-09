// firebase-messaging-sw.js
// 백그라운드(탭 비활성/브라우저 최소화) 상태에서 FCM 푸시 알림을 수신하는 Service Worker

importScripts("https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js");

// Firebase 설정 (클라이언트 키 — 브라우저에 이미 노출되는 공개 정보)
const firebaseConfig = {
  apiKey: "AIzaSyATlHhbCwTDkKaolwYB5AaMiKzDq9WPDBw",
  authDomain: "team2-ieum.firebaseapp.com",
  projectId: "team2-ieum",
  storageBucket: "team2-ieum.firebasestorage.app",
  messagingSenderId: "920769033731",
  appId: "1:920769033731:web:9a443d83025a788cb3c036",
  measurementId: "G-W1D66PBWS7"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// 백그라운드 메시지 수신 핸들러 (FCM SDK가 notification 객체를 만나면 자동 알림을 띄우므로 중복 호출 방지)
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] 백그라운드 메시지 수신 (데이터 페이로드 통과):", payload);
  // FCM Web SDK는 payload에 'notification' 키가 존재하면 브라우저에 네이티브 알림을 자동으로 보여줍니다.
  // 이곳에서 self.registration.showNotification()을 한 번 더 호출하면 알림이 2번 오게 되므로 주석/삭제 처리합니다.
  // 알림 아이콘은 백엔드의 WebpushConfig에서 설정한 값으로 보여집니다.
});

// 알림 클릭 시 해당 페이지로 이동
self.addEventListener("notificationclick", (event) => {
  console.log("[firebase-messaging-sw.js] 알림 클릭:", event.notification);
  event.notification.close();

  // data에 targetUrl이 있으면 해당 URL로 이동, 없으면 메인 페이지
  const targetUrl = event.notification.data?.targetUrl || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // 이미 열려있는 탭이 있으면 포커스
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && "focus" in client) {
          return client.focus();
        }
      }
      // 없으면 새 탭 열기
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
