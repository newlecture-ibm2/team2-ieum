// 사용자 API Axios 인스턴스
//
// 프론트엔드 BFF → 백엔드 호출용
// TODO: axios 설치 후 구현
// npm install axios

import axios from "axios";

const api = axios.create({
  baseURL: process.env.BACKEND_URL || "http://localhost:8080",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
