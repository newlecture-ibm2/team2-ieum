'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import styles from './FestivalDetailInfo.module.css';

interface FestivalDetailInfoProps {
  overview?: string;
  description?: string;
  imageSrc: string;
  images?: string[];
}

export default function FestivalDetailInfo({
  overview,
  description,
  imageSrc,
  images,
}: FestivalDetailInfoProps) {
  // 모든 이미지를 하나의 배열로 통합 (대표 이미지 + API 추가 이미지)
  const allImages: string[] = [];
  if (imageSrc) allImages.push(imageSrc);
  if (images && images.length > 0) {
    images.forEach((img) => {
      if (!allImages.includes(img)) allImages.push(img);
    });
  }

  const [selectedIndex, setSelectedIndex] = useState(0);
  const mainImage = allImages[selectedIndex] || imageSrc;

  // 드래그 스크롤 처리
  const stripRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // 🔍 줌 렌즈 상태
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const [isZooming, setIsZooming] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });
  const [bgPos, setBgPos] = useState({ x: 0, y: 0 });

  const ZOOM_LEVEL = 2.5; // 확대 배율
  const LENS_SIZE = 150;  // 렌즈 크기(px)

  const handleZoomMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const wrapper = imageWrapperRef.current;
    if (!wrapper) return;

    const rect = wrapper.getBoundingClientRect();
    // 마우스 위치를 wrapper 내부 좌표로 변환
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    // 렌즈가 이미지 영역 밖으로 나가지 않도록 클램핑
    const halfLens = LENS_SIZE / 2;
    x = Math.max(halfLens, Math.min(x, rect.width - halfLens));
    y = Math.max(halfLens, Math.min(y, rect.height - halfLens));

    setLensPos({ x, y });

    // 확대 미리보기의 배경 위치 계산 (백분율)
    const bgX = ((x - halfLens) / (rect.width - LENS_SIZE)) * 100;
    const bgY = ((y - halfLens) / (rect.height - LENS_SIZE)) * 100;
    setBgPos({ x: bgX, y: bgY });
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!stripRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - stripRef.current.offsetLeft);
    setScrollLeft(stripRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !stripRef.current) return;
    e.preventDefault();
    const x = e.pageX - stripRef.current.offsetLeft;
    const walk = (x - startX) * 2; // 스크롤 속도
    stripRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>축제 상세 정보</h2>
      <div className={styles.descText}>
        {overview || description || '축제의 상세 설명이 아직 등록되지 않았습니다. (공공데이터 내용 업데이트 예정)'}
      </div>

      {/* 이미지 갤러리 */}
      <div className={styles.gallery}>
        {/* 메인 이미지 + 줌 프리뷰 영역 */}
        <div className={styles.zoomContainer}>
          {/* 메인 이미지 (선택된 이미지가 크게 표시) */}
          <div
            className={styles.mainImageWrapper}
            ref={imageWrapperRef}
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
            onMouseMove={handleZoomMove}
          >
            <Image
              key={mainImage}
              src={mainImage}
              alt="축제 이미지"
              fill
              sizes="(max-width: 1200px) 100vw, 800px"
              style={{ objectFit: 'contain' }}
              priority
            />

            {/* 🔍 줌 렌즈 (마우스 따라다니는 사각형) */}
            {isZooming && (
              <div
                className={styles.zoomLens}
                style={{
                  width: LENS_SIZE,
                  height: LENS_SIZE,
                  left: lensPos.x - LENS_SIZE / 2,
                  top: lensPos.y - LENS_SIZE / 2,
                }}
              />
            )}

            {/* 🔍 안내 텍스트 */}
            {!isZooming && (
              <div className={styles.zoomHint}>
                🔍 마우스를 올리면 확대됩니다
              </div>
            )}
          </div>

          {/* 🔍 확대 미리보기 패널 (오른쪽에 표시) */}
          {isZooming && (
            <div
              className={styles.zoomPreview}
              style={{
                backgroundImage: `url(${mainImage})`,
                backgroundSize: `${ZOOM_LEVEL * 100}%`,
                backgroundPosition: `${bgPos.x}% ${bgPos.y}%`,
              }}
            />
          )}
        </div>

      {/* 서브 썸네일 스트립 (모든 이미지가 가로 나열) */}
      {allImages.length > 1 && (
        <div 
          className={styles.thumbnailStrip}
          ref={stripRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {allImages.map((img, idx) => (
            <button
              key={idx}
              className={`${styles.thumbnailBtn} ${idx === selectedIndex ? styles.thumbnailActive : ''}`}
              onClick={() => setSelectedIndex(idx)}
              type="button"
              aria-label={`이미지 ${idx + 1} 보기`}
            >
              <Image
                src={img}
                alt={`축제 이미지 ${idx + 1}`}
                fill
                sizes="100px"
                style={{ objectFit: 'cover' }}
                draggable={false}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  </div>
  );
}
