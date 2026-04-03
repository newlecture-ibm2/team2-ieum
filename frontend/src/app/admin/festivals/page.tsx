import FestivalListPage from './_components/FestivalListPage';

/**
 * 관리자 > 공공 축제 리스트 페이지 (Server Component)
 * 라우트: /admin/festivals
 *
 * workflow 규칙: page.tsx는 Server Component로 유지하고,
 * 인터랙션이 필요한 부분은 클라이언트 컴포넌트로 분리
 */
export default function AdminFestivalsPage() {
  return <FestivalListPage />;
}
