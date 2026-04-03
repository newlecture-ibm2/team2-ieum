import axios from "axios";

// 환경변수 처리를 위한 함수. 
// 팀원들간의 환경 차이(8080, 9090)를 .env 파일(NEXT_PUBLIC_API_URL)로만 제어합니다.
// 하드코딩된 포트는 모두 제거되었습니다.
const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || "";
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
