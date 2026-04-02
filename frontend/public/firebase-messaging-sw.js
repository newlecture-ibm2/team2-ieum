// firebase-messaging-sw.js

// Import and configure the Firebase SDK
// These scripts are made available when the app is served or bundled on the browser
importScripts("https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js");

// 주의: 아래 config는 VAPID KEY 등의 보안 이슈가 없으므로 하드코딩해도 웹앱에서 공개되는 정보와 동일합니다.
// 테스트 편의성을 위해 프로젝트 설정에서 복사해온 config를 직접 넣어도 됩니다.
// (또는 URL 파라미터를 통해 주입하는 방식도 있으나, 초기 테스트용으로는 빈 객체 상태로도
// Token 발급을 위한 뼈대 역할을 수행할 수 있습니다.)

// "messagingSenderId"만 필수로 요구할 때도 있습니다 (없으면 콘솔 에러 발생 가능성)
// const firebaseConfig = {
//   apiKey: "[API_KEY]",
//   projectId: "[PROJECT_ID]",
//   messagingSenderId: "[SENDER_ID]",
//   appId: "[APP_ID]"
// };
// firebase.initializeApp(firebaseConfig);

// const messaging = firebase.messaging();

// messaging.onBackgroundMessage((payload) => {
//   console.log("[firebase-messaging-sw.js] Received background message ", payload);
//   const notificationTitle = payload.notification.title;
//   const notificationOptions = {
//     body: payload.notification.body,
//     icon: "/favicon.ico"
//   };
//   self.registration.showNotification(notificationTitle, notificationOptions);
// });
