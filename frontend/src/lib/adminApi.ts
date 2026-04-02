// 관리자 API Axios 인스턴스
//
// 프론트엔드 BFF → 백엔드 /api/admin/* 호출용

import axios from "axios";

const adminApi = axios.create({
  baseURL: (process.env.BACKEND_URL || "http://localhost:8080") + "/api/admin",
  timeout: 120000, // 동기화 등 장시간 작업 고려 (120초)
  headers: {
    "Content-Type": "application/json",
  },
});

export default adminApi;
