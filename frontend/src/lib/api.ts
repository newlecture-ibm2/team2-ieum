import axios from "axios";

// 환경변수 처리를 위한 함수. 
// 프론트엔드(클라이언트) 환경에서는 Next.js Proxy(/api/...)를 타게 하여 BFF 패턴이 유지되도록 함.
// 서버사이드(SSR) 요청일 경우는 백엔드 API URL을 그대로 사용.
const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return ""; 
  }
  return process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || "http://localhost:8080";
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
