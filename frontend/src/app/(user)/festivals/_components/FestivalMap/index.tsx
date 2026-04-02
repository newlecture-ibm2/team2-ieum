"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Map,
  MapMarker,
  MarkerClusterer,
  useKakaoLoader,
} from "react-kakao-maps-sdk";
import styles from "./FestivalMap.module.css";

// ===== 타입 정의 =====
interface FestivalItem {
  id: number;
  sourceId: string | null;
  title: string;
  address: string | null;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  status: string | null;
  latitude: number | null;
  longitude: number | null;
}

// 지역 필터 목록
const REGIONS = [
  "서울", "경기", "인천", "강원",
  "대전", "충북", "충남", "세종",
  "광주", "전북", "전남", "대구",
  "경북", "경남", "부산", "울산", "제주",
];

// 상태 필터 옵션
const STATUS_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "ongoing", label: "진행 중" },
  { value: "upcoming", label: "진행 예정" },
];

// 한반도 최종 좌표/줌
const KOREA_CENTER = { lat: 36.5, lng: 127.5 };
const KOREA_ZOOM = 13;

export default function FestivalMap() {
  // ===== 카카오맵 SDK 로드 =====
  const [loading, error] = useKakaoLoader({
    appkey: process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY as string,
    libraries: ["clusterer", "services"],
  });

  // ===== 지도 줌인 애니메이션 =====
  const [zoomReady, setZoomReady] = useState(false); // 줌인 완료 여부

  // 지도 시작: 매우 줌아웃 (level 14 = 전세계/아시아)
  const [center, setCenter] = useState({ lat: 35, lng: 127 });
  const [level, setLevel] = useState(14);
  const [mapInstance, setMapInstance] = useState<kakao.maps.Map | null>(null);

  // ===== 인포윈도우 =====
  const [selectedFestival, setSelectedFestival] = useState<FestivalItem | null>(null);

  // ===== 데이터 상태 =====
  const [festivals, setFestivals] = useState<FestivalItem[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // ===== 필터 상태 =====
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchKeyword, setSearchKeyword] = useState("");

  // ===== 하단 목록 토글 + 리사이즈 =====
  const [listOpen, setListOpen] = useState(true);
  const [listHeight, setListHeight] = useState(220);
  const isResizing = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(0);

  // 드래그 리사이즈 핸들러
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    startY.current = e.clientY;
    startHeight.current = listHeight;
    document.body.style.cursor = "ns-resize";
    document.body.style.userSelect = "none";

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizing.current) return;
      const delta = startY.current - moveEvent.clientY;
      const newHeight = Math.min(Math.max(startHeight.current + delta, 100), 600);
      setListHeight(newHeight);
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [listHeight]);

  // ===== 🌍 지도 줌인 애니메이션 (지구 → 전국 → 한반도) =====
  useEffect(() => {
    if (!mapInstance || zoomReady) return;

    // 지도 생성 후 0.5초 대기 → 부드럽게 줌인 시작
    const startTimer = setTimeout(() => {
      // 단계별 줌인: 14(전세계) → 13(한반도)
      // requestAnimationFrame으로 부드럽게
      const zoomSteps = [
        { lvl: 13, cx: 35.5, cy: 127.2, delay: 0 },
        { lvl: 12, cx: 36.0, cy: 127.3, delay: 350 },
        { lvl: 11, cx: 36.3, cy: 127.4, delay: 700 },
        { lvl: 12, cx: 36.4, cy: 127.45, delay: 1100 },
        { lvl: KOREA_ZOOM, cx: KOREA_CENTER.lat, cy: KOREA_CENTER.lng, delay: 1500 },
      ];

      const timers: ReturnType<typeof setTimeout>[] = [];

      zoomSteps.forEach(({ lvl, cx, cy, delay }) => {
        const t = setTimeout(() => {
          setLevel(lvl);
          setCenter({ lat: cx, lng: cy });
        }, delay);
        timers.push(t);
      });

      // 줌인 완료 → 마커 & 컨트롤 표시
      const doneTimer = setTimeout(() => {
        setZoomReady(true);
      }, 1800);
      timers.push(doneTimer);

      return () => timers.forEach(clearTimeout);
    }, 500);

    return () => clearTimeout(startTimer);
  }, [mapInstance, zoomReady]);

  // ===== 축제 데이터 fetch =====
  const fetchFestivals = useCallback(async () => {
    setDataLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (searchKeyword.trim()) params.set("keyword", searchKeyword.trim());
      params.set("size", "100");

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
      const res = await fetch(`${backendUrl}/api/festivals?${params.toString()}`);
      const json = await res.json();

      if (json.success && json.data?.list) {
        setFestivals(json.data.list);
      } else {
        setFestivals([]);
      }
    } catch {
      console.error("축제 데이터 로딩 실패");
      setFestivals([]);
    } finally {
      setDataLoading(false);
    }
  }, [statusFilter, searchKeyword]);

  useEffect(() => {
    fetchFestivals();
  }, [fetchFestivals]);

  // ===== GPS 현위치 =====
  const handleMyLocation = () => {
    if (!navigator.geolocation) {
      alert("이 브라우저에서는 현위치(GPS) 기능을 지원하지 않습니다.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLevel(5);
      },
      () => {
        alert("위치 정보 이용 동의를 확인해주세요.");
      }
    );
  };

  // ===== 줌 컨트롤 =====
  const handleZoomIn = () => {
    if (mapInstance) {
      const currentLevel = mapInstance.getLevel();
      mapInstance.setLevel(currentLevel - 1);
      setLevel(currentLevel - 1);
    }
  };

  const handleZoomOut = () => {
    if (mapInstance) {
      const currentLevel = mapInstance.getLevel();
      mapInstance.setLevel(currentLevel + 1);
      setLevel(currentLevel + 1);
    }
  };

  // ===== 필터 핸들러 =====
  const toggleRegion = (region: string) => {
    setSelectedRegions((prev) =>
      prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]
    );
  };

  const resetFilters = () => {
    setSelectedRegions([]);
    setStatusFilter("all");
    setSearchKeyword("");
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      fetchFestivals();
    }
  };

  // ===== 목록 행 클릭 → 지도 이동 =====
  const handleListRowClick = (fest: FestivalItem) => {
    if (!fest.latitude || !fest.longitude) return;
    setCenter({ lat: fest.latitude, lng: fest.longitude });
    setLevel(7);
    setSelectedFestival(fest);
  };

  // ===== 마커 클릭 → 인포윈도우 =====
  const handleMarkerClick = (fest: FestivalItem) => {
    setSelectedFestival((prev) => (prev?.id === fest.id ? null : fest));
    if (fest.latitude && fest.longitude) {
      setCenter({ lat: fest.latitude, lng: fest.longitude });
    }
  };

  // ===== 필터링 =====
  const filteredFestivals = festivals.filter((f) => {
    if (selectedRegions.length === 0) return true;
    return selectedRegions.some((region) => f.address?.includes(region));
  });

  const markerFestivals = filteredFestivals.filter(
    (f) => f.latitude && f.longitude
  );

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  // ===== 렌더링 =====
  return (
    <div className={styles.mapPageWrapper}>
      {/* 타이틀 */}
      <div className={styles.pageTitle}>
        <div>
          <div className={styles.pageTitleText}>🎭 전국 축제 지도</div>
          <div className={styles.pageTitleSub}>
            지도로 전국의 축제를 한눈에 탐색하세요 🗺️
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className={styles.mapBody}>
        {/* 필터 사이드바 (처음부터 보임) */}
        <aside className={styles.filterSidebar}>
          <div className={styles.filterSectionTitle}>📍 지역 필터</div>
          <div className={styles.regionGrid}>
            {REGIONS.map((region) => (
              <label key={region} className={styles.filterItem}>
                <input
                  type="checkbox"
                  checked={selectedRegions.includes(region)}
                  onChange={() => toggleRegion(region)}
                />
                {region}
              </label>
            ))}
          </div>

          <div className={styles.filterSectionTitle}>🔄 상태 필터</div>
          {STATUS_OPTIONS.map((opt) => (
            <label key={opt.value} className={styles.filterItem}>
              <input
                type="radio"
                name="statusFilter"
                checked={statusFilter === opt.value}
                onChange={() => setStatusFilter(opt.value)}
              />
              {opt.label}
            </label>
          ))}

          <div className={styles.filterSectionTitle}>🔍 검색</div>
          <div className={styles.searchInputWrapper}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="축제명 검색"
              className={styles.filterSearchInput}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </div>

          <button
            type="button"
            className={styles.filterBtnReset}
            onClick={resetFilters}
          >
            🔄 필터 초기화
          </button>
        </aside>

        {/* 오른쪽 영역 */}
        <div className={styles.mapContent}>
          <div className={styles.mapArea}>
            {loading ? (
              <div className={styles.mapLoading}>
                <div className={styles.spinner} />
                <span>지도 로딩중...</span>
              </div>
            ) : error ? (
              <div className={styles.mapError}>
                <span style={{ fontSize: 28 }}>⚠️</span>
                <span>지도 로딩 실패 (API 키를 확인하세요)</span>
              </div>
            ) : (
              <Map
                center={center}
                style={{ width: "100%", height: "100%" }}
                level={level}
                onZoomChanged={(map) => {
                  if (zoomReady) setLevel(map.getLevel());
                }}
                onCreate={(map) => setMapInstance(map)}
                onClick={() => setSelectedFestival(null)}
              >
                {/* 마커는 줌인 완료 후에만 표시 */}
                {zoomReady && (
                  <MarkerClusterer averageCenter={true} minLevel={10}>
                    {markerFestivals.map((fest) => (
                      <MapMarker
                        key={fest.id}
                        position={{
                          lat: fest.latitude!,
                          lng: fest.longitude!,
                        }}
                        onClick={() => handleMarkerClick(fest)}
                      />
                    ))}
                  </MarkerClusterer>
                )}

                {zoomReady &&
                  selectedFestival &&
                  selectedFestival.latitude &&
                  selectedFestival.longitude && (
                    <MapMarker
                      position={{
                        lat: selectedFestival.latitude,
                        lng: selectedFestival.longitude,
                      }}
                    >
                      <div className={styles.infoWindow}>
                        <div className={styles.infoTitle}>
                          🎪 {selectedFestival.title}
                        </div>
                        <div className={styles.infoMeta}>
                          <span>
                            📍 {selectedFestival.address || "위치 정보 없음"}
                          </span>
                        </div>
                        <div className={styles.infoMeta}>
                          <span>
                            📅 {formatDate(selectedFestival.startDate)} ~{" "}
                            {formatDate(selectedFestival.endDate)}
                          </span>
                        </div>
                        <a
                          href={`/festivals/${selectedFestival.id}`}
                          className={styles.infoLink}
                        >
                          상세보기 →
                        </a>
                      </div>
                    </MapMarker>
                  )}
              </Map>
            )}

            {/* GPS / 줌 컨트롤 (줌인 완료 후 페이드인) */}
            {!loading && !error && (
              <div
                className={`${styles.mapControls} ${
                  zoomReady ? styles.mapControlsVisible : ""
                }`}
              >
                <button
                  type="button"
                  className={styles.mapCtrlBtn}
                  onClick={handleMyLocation}
                  title="내 위치로 이동"
                >
                  📍
                </button>
                <button
                  type="button"
                  className={styles.mapCtrlBtn}
                  onClick={handleZoomIn}
                  title="확대"
                >
                  +
                </button>
                <button
                  type="button"
                  className={styles.mapCtrlBtn}
                  onClick={handleZoomOut}
                  title="축소"
                >
                  −
                </button>
              </div>
            )}
          </div>

          {/* 리사이즈 핸들 */}
          {listOpen && (
            <div
              className={`${styles.resizeHandle} ${
                isResizing.current ? styles.resizeHandleActive : ""
              }`}
              onMouseDown={handleResizeStart}
            >
              <div className={styles.resizeHandleBar} />
            </div>
          )}

          {/* 하단 검색 결과 목록 */}
          <div
            className={`${styles.bottomList} ${
              !listOpen ? styles.bottomListCollapsed : ""
            }`}
            style={listOpen ? { height: listHeight } : undefined}
          >
            <div className={styles.listHeader}>
              <div className={styles.listTitle}>
                📋 검색 결과 목록{" "}
                <span className={styles.listCount}>
                  (총 {filteredFestivals.length}개)
                </span>
              </div>
              <button
                type="button"
                className={styles.listToggle}
                onClick={() => setListOpen(!listOpen)}
              >
                {listOpen ? "▲ 목록 접기" : "▼ 목록 펼치기"}
              </button>
            </div>

            {listOpen && (
              <div className={styles.listBody}>
                <div className={styles.listHeaderRow}>
                  <div></div>
                  <div>축제명</div>
                  <div>지역</div>
                  <div>기간</div>
                  <div>상태</div>
                </div>

                {dataLoading ? (
                  <div className={styles.emptyState}>데이터 로딩중...</div>
                ) : filteredFestivals.length === 0 ? (
                  <div className={styles.emptyState}>
                    조건에 맞는 축제가 없습니다.
                  </div>
                ) : (
                  filteredFestivals.slice(0, 50).map((fest) => (
                    <div
                      key={fest.id}
                      className={styles.listRow}
                      onClick={() => handleListRowClick(fest)}
                    >
                      <div>
                        {fest.thumbnailUrl ? (
                          <img
                            src={fest.thumbnailUrl}
                            alt={fest.title}
                            className={styles.listImg}
                          />
                        ) : (
                          <div className={styles.listImg} />
                        )}
                      </div>
                      <div className={styles.listName}>🎪 {fest.title}</div>
                      <div className={styles.listRegion}>
                        📍{" "}
                        {fest.address?.split(" ").slice(0, 2).join(" ") || "-"}
                      </div>
                      <div className={styles.listDate}>
                        📅 {formatDate(fest.startDate)}~
                        {formatDate(fest.endDate)}
                      </div>
                      <div className={styles.listRating}>
                        {fest.status === "ONGOING"
                          ? "🟢 진행중"
                          : fest.status === "UPCOMING"
                          ? "🔵 예정"
                          : "⚫ 종료"}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
