"use client";

import { Map, MapMarker, MarkerClusterer, useKakaoLoader } from "react-kakao-maps-sdk";
import { useState } from "react";

// 샘플 마커 데이터 (추후 API로 대체 가능)
const dummyFestivals = [
  { id: 1, name: "보령 머드축제", lat: 36.333, lng: 126.581, region: "충남 보령" },
  { id: 2, name: "안동 탈춤축제", lat: 36.568, lng: 128.729, region: "경북 안동" },
  { id: 3, name: "부산 불꽃축제", lat: 35.153, lng: 129.118, region: "부산 수영구" }
];

export default function FestivalMap() {
  const [loading, error] = useKakaoLoader({
    appkey: process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY as string,
    libraries: ["clusterer", "services"],
  });

  // 한반도 중심좌표 초기값
  const [center, setCenter] = useState({ lat: 36.5, lng: 127.5 });
  const [level, setLevel] = useState(13);

  // 현위치 좌표 얻기 (Geolocation)
  const handleMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLevel(5); // 줌인
        },
        (error) => {
          console.error("현위치를 가져올 수 없습니다: ", error);
          alert("위치 정보 이용 동의를 확인해주세요.");
        }
      );
    } else {
      alert("이 브라우저에서는 현위치(GPS) 기능을 지원하지 않습니다.");
    }
  };

  if (loading) return <div style={{ width: "100%", height: "600px", display: "flex", alignItems: "center", justifyContent: "center" }}>📍 지도 로딩중...</div>;
  if (error) return <div style={{ width: "100%", height: "600px", display: "flex", alignItems: "center", justifyContent: "center" }}>⚠️ 지도 로딩 실패 (API 키를 확인하세요)</div>;

  return (
    <div style={{ position: "relative", width: "100%", height: "600px" }}>
      <Map
        center={center}
        style={{ width: "100%", height: "100%" }}
        level={level}
        onZoomChanged={(map) => setLevel(map.getLevel())}
      >
        <MarkerClusterer averageCenter={true} minLevel={10}>
          {dummyFestivals.map((fest) => (
            <MapMarker
              key={fest.id}
              position={{ lat: fest.lat, lng: fest.lng }}
              onClick={() => alert(`${fest.name} 클릭됨!`)}
            />
          ))}
        </MarkerClusterer>
      </Map>
      
      {/* 화면설계서 'E6. GPS 현위치 이동' 맵 컨트롤 버튼 */}
      <div style={{ position: "absolute", bottom: "20px", right: "20px", zIndex: 10 }}>
        <button 
          onClick={handleMyLocation}
          style={{
            width: "40px", height: "40px",
            background: "white",
            border: "1px solid #ddd", borderRadius: "8px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
            cursor: "pointer", fontSize: "16px"
          }}
          title="내 위치로 이동"
        >
          📍
        </button>
      </div>
    </div>
  );
}
