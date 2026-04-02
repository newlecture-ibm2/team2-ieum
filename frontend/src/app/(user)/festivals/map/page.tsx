import FestivalMap from "../_components/FestivalMap";

export default function FestivalsMapPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* 임시 타이틀 표시 영역 */}
      <div style={{ padding: "16px 24px", background: "#f8f9fa", fontWeight: "bold", borderBottom: "1px solid #eee" }}>
        🎭 전국 축제 지도
      </div>
      
      {/* 메인 지도 컴포넌트 렌더링 영역 */}
      <div style={{ flex: 1, backgroundColor: "#e2e8f0" }}>
        <FestivalMap />
      </div>
    </div>
  );
}
