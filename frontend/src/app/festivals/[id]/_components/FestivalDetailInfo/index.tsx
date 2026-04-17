'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
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
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Close lightbox on Escape key
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft') setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
      if (e.key === 'ArrowRight') setSelectedIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxOpen, allImages.length]);

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
        {/* Main image - click to open full size */}
        <div
          className={styles.mainImageWrapper}
          onClick={() => setLightboxOpen(true)}
          style={{ cursor: 'pointer' }}
        >
          <Image
            key={mainImage}
            src={mainImage}
            alt="Festival image"
            fill
            sizes="(max-width: 1200px) 100vw, 800px"
            style={{ objectFit: 'cover' }}
            priority
          />
          <div className={styles.zoomOverlay}>
            <span>🔍 클릭하여 크게 보기</span>
          </div>
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

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className={styles.lightboxOverlay} onClick={() => setLightboxOpen(false)}>
          <button
            className={styles.lightboxClose}
            onClick={() => setLightboxOpen(false)}
            type="button"
          >
            ✕
          </button>

          {allImages.length > 1 && (
            <button
              className={`${styles.lightboxNav} ${styles.lightboxPrev}`}
              onClick={(e) => { e.stopPropagation(); setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1)); }}
              type="button"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
          )}

          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <img
              src={mainImage}
              alt="Festival full image"
              className={styles.lightboxImg}
            />
            {allImages.length > 1 && (
              <div className={styles.lightboxCounter}>
                {selectedIndex + 1} / {allImages.length}
              </div>
            )}
          </div>

          {allImages.length > 1 && (
            <button
              className={`${styles.lightboxNav} ${styles.lightboxNext}`}
              onClick={(e) => { e.stopPropagation(); setSelectedIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0)); }}
              type="button"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
