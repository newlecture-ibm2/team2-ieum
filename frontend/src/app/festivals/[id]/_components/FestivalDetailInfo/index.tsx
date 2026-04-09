'use client';

import { useState } from 'react';
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

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>축제 상세 정보</h2>
      <div className={styles.descText}>
        {overview || description || '축제의 상세 설명이 아직 등록되지 않았습니다. (공공데이터 내용 업데이트 예정)'}
      </div>

      {/* 이미지 갤러리 */}
      <div className={styles.gallery}>
        {/* 메인 이미지 (선택된 이미지가 크게 표시) */}
        <div className={styles.mainImageWrapper}>
          <Image
            key={mainImage}
            src={mainImage}
            alt="축제 이미지"
            fill
            sizes="(max-width: 1200px) 100vw, 800px"
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>

        {/* 서브 썸네일 스트립 (모든 이미지가 가로 나열) */}
        {allImages.length > 1 && (
          <div className={styles.thumbnailStrip}>
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
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
