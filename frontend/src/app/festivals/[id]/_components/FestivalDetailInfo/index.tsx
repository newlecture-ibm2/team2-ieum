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
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>축제 상세 정보</h2>
      <div className={styles.descText}>
        {overview || description || '축제의 상세 설명이 아직 등록되지 않았습니다. (공공데이터 내용 업데이트 예정)'}
      </div>
      <div className={styles.descImageGallery}>
        <div className={styles.mainImageWrapper}>
          <Image
            src={imageSrc}
            alt="축제 포스터 및 전경"
            fill
            sizes="(max-width: 1200px) 100vw, 800px"
            style={{ objectFit: 'cover' }}
          />
        </div>
        {images && images.length > 0 && (
          <div className={styles.extraImageGrid}>
            {images.map((img: string, idx: number) => (
              <div key={idx} className={styles.extraImageWrapper}>
                <Image
                  src={img}
                  alt={`추가 이미지 ${idx + 1}`}
                  fill
                  sizes="(max-width: 1200px) 25vw, 200px"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
