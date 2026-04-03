// 관리자 API Axios 인스턴스
//
// 프론트엔드 BFF → 백엔드 /api/admin/* 호출용

import axios from "axios";

// 환경변수 처리를 위한 함수. 
const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || "";
};

const adminApi = axios.create({
  baseURL: getBaseUrl() + "/api/admin",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default adminApi;
