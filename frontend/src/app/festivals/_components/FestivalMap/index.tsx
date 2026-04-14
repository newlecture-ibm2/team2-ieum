"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Map,
  MapMarker,
  MarkerClusterer,
  CustomOverlayMap,
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

// 지역 필터 목록 (공통 상수)
import { REGION_NAMES } from '@/constants/filterOptions';
const REGIONS = REGION_NAMES;

// 상태 필터 옵션 (공통 상수)
import { FESTIVAL_STATUS_OPTIONS } from '@/constants/filterOptions';
const STATUS_OPTIONS = FESTIVAL_STATUS_OPTIONS;

// 한반도 최종 좌표/줌
const KOREA_CENTER = { lat: 36.5, lng: 127.5 };
const KOREA_ZOOM = 13;

// 인트로 애니메이션 단계
type IntroPhase = "warp" | "fadeout" | "done";

// 별 모양이 들어간 깔끔한 물방울 형태의 보라색 축제 핀 (크기 축소)
const CUSTOM_MARKER_IMAGE = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 36' width='28' height='42'%3E%3Cpath d='M12 0C5.373 0 0 5.373 0 12c0 8.01 10.155 22.378 11.162 23.774a1.025 1.025 0 0 0 1.676 0C13.845 34.378 24 20.01 24 12c0-6.627-5.373-12-12-12z' fill='%236c4ff5'/%3E%3Cpath d='M12 6.5l1.5 3.5 4 .5-3 2.5 1 4-3.5-2-3.5 2 1-4-3-2.5 4-.5z' fill='%23ffffff'/%3E%3C/svg%3E";

export default function FestivalMap() {
  // ===== 카카오맵 SDK 로드 =====
  const [loading, error] = useKakaoLoader({
    appkey: process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY as string,
    libraries: ["clusterer", "services"],
  });

  // ===== 인트로 애니메이션 상태 =====
  const [introPhase, setIntroPhase] = useState<IntroPhase>("warp");
  const introComplete = introPhase === "done";

  // 지도는 처음부터 최종 한반도 줌으로 로드 (타일 재로딩 없음)
  const [center, setCenter] = useState(KOREA_CENTER);
  const [level, setLevel] = useState(KOREA_ZOOM);
  const [mapInstance, setMapInstance] = useState<kakao.maps.Map | null>(null);

  // Canvas refs for hyperspace warp
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

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

  // ===== 🚀 하이퍼스페이스 워프 캔버스 애니메이션 =====
  useEffect(() => {
    if (introComplete || loading || introPhase !== "warp") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // HiDPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;
    const CX = W / 2;
    const CY = H / 2;
    const FOV = W * 0.6;
    const MAX_Z = 1800;

    // 별 파티클
    interface Star { x: number; y: number; z: number; pz: number }
    const makeStar = (): Star => {
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * Math.max(W, H) * 0.8;
      return { x: Math.cos(a) * r, y: Math.sin(a) * r, z: Math.random() * MAX_Z + 200, pz: 0 };
    };
    const stars: Star[] = Array.from({ length: 500 }, makeStar);
    stars.forEach((s) => { s.pz = s.z; });

    const T0 = performance.now();
    const DUR = 1500;   // 1.5초 워프
    const FLASH = 1200; // 1.2초부터 플래시
    let prev = T0;

    const frame = (now: number) => {
      const elapsed = now - T0;
      const dt = Math.min((now - prev) / 16.67, 3);
      prev = now;
      const t = Math.min(elapsed / DUR, 1);

      ctx.fillStyle = "#030308";
      ctx.fillRect(0, 0, W, H);

      // 지수적 가속: 처음 느림 → 폭발
      const speed = 3 + Math.pow(t, 2.5) * 250;

      for (const s of stars) {
        s.pz = s.z;
        s.z -= speed * dt;
        if (s.z <= 1) {
          const n = makeStar(); s.x = n.x; s.y = n.y; s.z = MAX_Z; s.pz = MAX_Z;
          continue;
        }
        const sx = (s.x / s.z) * FOV + CX;
        const sy = (s.y / s.z) * FOV + CY;
        const px = (s.x / s.pz) * FOV + CX;
        const py = (s.y / s.pz) * FOV + CY;
        if (sx < -100 || sx > W + 100 || sy < -100 || sy > H + 100) continue;

        const d = Math.max(0, 1 - s.z / MAX_Z);
        const a = Math.min(1, d * 2.2);
        const sz = Math.max(0.1, 0.3 + d * 3);

        // 속도선 트레일
        if (t > 0.03) {
          const tr = Math.min(t * 1.8, 1);
          ctx.strokeStyle = `rgba(180, 160, 255, ${a * tr * 0.5})`;
          ctx.lineWidth = Math.max(0.1, sz * 0.6);
          ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(sx, sy); ctx.stroke();
        }
        // 별 점
        ctx.fillStyle = `rgba(255, 255, 255, ${a})`;
        ctx.beginPath(); ctx.arc(sx, sy, Math.max(0.1, sz * 0.4), 0, Math.PI * 2); ctx.fill();
      }

      // 중심 보라 글로우
      const gr = 60 + t * 300;
      const gg = ctx.createRadialGradient(CX, CY, 0, CX, CY, gr);
      gg.addColorStop(0, `rgba(108, 92, 231, ${0.08 + t * 0.2})`);
      gg.addColorStop(0.5, `rgba(147, 120, 255, ${0.02 + t * 0.06})`);
      gg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gg; ctx.fillRect(0, 0, W, H);

      // 비네트
      const vg = ctx.createRadialGradient(CX, CY, Math.min(W, H) * 0.2, CX, CY, Math.max(W, H) * 0.75);
      vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.4)");
      ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);

      // 화이트 플래시
      if (elapsed > FLASH) {
        const fp = (elapsed - FLASH) / (DUR - FLASH);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.pow(fp, 0.5) * 0.85})`;
        ctx.fillRect(0, 0, W, H);
      }

      if (elapsed < DUR) {
        animFrameRef.current = requestAnimationFrame(frame);
      } else {
        setIntroPhase("fadeout");
        setTimeout(() => setIntroPhase("done"), 350);
      }
    };

    animFrameRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [introComplete, loading, introPhase]);

  // ===== 축제 데이터 fetch =====
  const fetchFestivals = useCallback(async () => {
    setDataLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (searchKeyword.trim()) params.set("keyword", searchKeyword.trim());
      params.set("size", "999"); // 한 번에 모든 지도 마커 호출을 위해 확장

      const res = await fetch(`/api/festivals?${params.toString()}`, {
        cache: "no-store",
      });
      const json = await res.json();

      if (json.success && json.data?.list) {
        // 숨김처리 판단: 백엔드에서 문자열 'False' 또는 불리언 false로 올 수 있으므로 대소문자 무시 검사
        const isHidden = (f: any) => {
          const val = f.isVisible !== undefined ? f.isVisible : f.is_visible;
          if (val === false) return true;
          if (typeof val === "string" && val.toLowerCase() === "false") return true;
          return false;
        };

        const filteredList = json.data.list.filter(
          (fest: any) =>
            !isHidden(fest) &&
            (fest.status === "ONGOING" || fest.status === "UPCOMING")
        );

        // 진행중(ONGOING)인 축제를 우선적으로 앞쪽에 배치
        filteredList.sort((a: FestivalItem, b: FestivalItem) => {
          if (a.status === "ONGOING" && b.status !== "ONGOING") return -1;
          if (a.status !== "ONGOING" && b.status === "ONGOING") return 1;
          return 0;
        });

        setFestivals(filteredList);
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

  // ===== 지역명 정규화 헬퍼 (주소 앞머리로 시/도 추출) =====
  const getMatchableRegion = (addr: string | undefined | null) => {
    if (!addr) return "";
    const prefix = addr.trim().split(" ")[0] || ""; // 예: "서울특별시", "충청북도", "세종특별자치시"
    if (prefix.startsWith("서울")) return "서울";
    if (prefix.startsWith("인천")) return "인천";
    if (prefix.startsWith("대전")) return "대전";
    if (prefix.startsWith("대구")) return "대구";
    if (prefix.startsWith("광주")) return "광주";
    if (prefix.startsWith("부산")) return "부산";
    if (prefix.startsWith("울산")) return "울산";
    if (prefix.startsWith("세종")) return "세종";
    if (prefix.startsWith("경기")) return "경기";
    if (prefix.startsWith("강원")) return "강원";
    if (prefix.startsWith("충청북") || prefix.startsWith("충북")) return "충북";
    if (prefix.startsWith("충청남") || prefix.startsWith("충남")) return "충남";
    if (prefix.startsWith("경상북") || prefix.startsWith("경북")) return "경북";
    if (prefix.startsWith("경상남") || prefix.startsWith("경남")) return "경남";
    if (prefix.startsWith("전라북") || prefix.startsWith("전북")) return "전북";
    if (prefix.startsWith("전라남") || prefix.startsWith("전남")) return "전남";
    if (prefix.startsWith("제주")) return "제주";
    return prefix;
  };

  // ===== 필터링 =====
  const filteredFestivals = festivals.filter((f) => {
    if (selectedRegions.length === 0) return true;
    const actualRegion = getMatchableRegion(f.address);
    return selectedRegions.includes(actualRegion);
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
            {/* 카카오맵 (뒤에서 이미 로드) */}
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
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                level={level}
                onZoomChanged={(map) => {
                  if (introComplete) setLevel(map.getLevel());
                }}
                onCreate={(map) => setMapInstance(map)}
                onClick={() => setSelectedFestival(null)}
              >
                {/* 마커는 인트로 완료 후에만 표시 */}
                {introComplete && (
                  <MarkerClusterer averageCenter={true} minLevel={10}>
                    {markerFestivals.map((fest) => (
                      <MapMarker
                        key={fest.id}
                        position={{
                          lat: fest.latitude!,
                          lng: fest.longitude!,
                        }}
                        image={{
                          src: CUSTOM_MARKER_IMAGE,
                          size: { width: 22, height: 26 },
                          options: { offset: { x: 11, y: 26 } }
                        }}
                        onClick={() => handleMarkerClick(fest)}
                      />
                    ))}
                  </MarkerClusterer>
                )}

                {introComplete &&
                  selectedFestival &&
                  selectedFestival.latitude &&
                  selectedFestival.longitude && (
                    <CustomOverlayMap
                      position={{
                        lat: selectedFestival.latitude,
                        lng: selectedFestival.longitude,
                      }}
                      yAnchor={1.35}
                      clickable={true}
                      zIndex={100}
                    >
                      <div
                        className={styles.customInfoWindow}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className={styles.customInfoTitle}>
                          🎪 {selectedFestival.title}
                        </div>
                        <div className={styles.customInfoMeta}>
                          <span>📍</span>
                          <span>{selectedFestival.address || "위치 정보 없음"}</span>
                        </div>
                        <div className={styles.customInfoMeta}>
                          <span>📅</span>
                          <span>
                            {formatDate(selectedFestival.startDate)} ~{" "}
                            {formatDate(selectedFestival.endDate)}
                          </span>
                        </div>
                        <a
                          href={`/festivals/${selectedFestival.id}`}
                          className={styles.customInfoLink}
                        >
                          상세보기 →
                        </a>
                      </div>
                    </CustomOverlayMap>
                  )}
              </Map>
            )}

            {/* ===== 🚀 하이퍼스페이스 워프 인트로 ===== */}
            {!introComplete && !loading && !error && (
              <div
                className={`${styles.introOverlay} ${introPhase === "fadeout" ? styles.introFadeOut : ""
                  }`}
              >
                <canvas ref={canvasRef} className={styles.warpCanvas} />

                {/* 🌍 지구 워프 줌인 이미지 */}
                <div className={styles.warpEarth}>
                  <img src="/images/map-intro/earth.png" alt="지구" />
                </div>

                <div className={styles.introText}>
                  <div className={styles.introTextTitle}>🎭 전국 축제 지도</div>
                  <div className={styles.introTextSub}>FESTIVAL MAP OF KOREA</div>
                </div>
              </div>
            )}

            {/* GPS / 줌 컨트롤 (인트로 완료 후 페이드인) */}
            {!loading && !error && (
              <div
                className={`${styles.mapControls} ${introComplete ? styles.mapControlsVisible : ""
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
              className={`${styles.resizeHandle} ${isResizing.current ? styles.resizeHandleActive : ""
                }`}
              onMouseDown={handleResizeStart}
            >
              <div className={styles.resizeHandleBar} />
            </div>
          )}

          {/* 하단 검색 결과 목록 */}
          <div
            className={`${styles.bottomList} ${!listOpen ? styles.bottomListCollapsed : ""
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
                  filteredFestivals.slice(0, 999).map((fest) => (
                    <div
                      key={fest.id}
                      className={`${styles.listRow} ${selectedFestival?.id === fest.id ? styles.listRowActive : ""}`}
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
