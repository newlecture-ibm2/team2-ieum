'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ImagePlus, X } from 'lucide-react';
import api from '@/lib/api';
import { CATEGORY_OPTIONS, REGION_OPTIONS } from '@/constants/filterOptions';
import { useToast } from '@/_component/common/Toast';
import { ConfirmModal } from '@/_component/common/Modal';
import styles from './write.module.css';

export default function CommunityWritePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [authChecked, setAuthChecked] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // 로그인 체크 — 미로그인 시 모달 표시
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.isLoggedIn) {
          setShowLoginModal(true);
        } else {
          setAuthChecked(true);
        }
      })
      .catch(() => {
        setShowLoginModal(true);
      });
  }, []);

  const [category, setCategory] = useState('');
  const [areaCode, setAreaCode] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files).slice(0, 5 - images.length);
    setImages(prev => [...prev, ...newFiles]);

    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!category || !title.trim() || !content.trim()) {
      toast('말머리, 제목, 내용은 필수 입력 항목입니다.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const body = {
        category,
        title: title.trim(),
        content: content.trim(),
        areaCode: areaCode || null,
      };

      const res = await api.post('/api/community/posts', body);

      if (res.data && res.data.success) {
        toast('게시글이 등록되었습니다!', 'success');
        router.push('/community');
      } else {
        toast('게시글 등록에 실패했습니다.', 'error');
      }
    } catch (err: unknown) {
      console.error(err);
      toast('게시글 등록 중 오류가 발생했습니다.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // 인증 확인 전에는 폼을 보여주지 않음
  if (!authChecked) {
    return (
      <>
        <div style={{ textAlign: 'center', padding: '100px 0', color: '#94a3b8' }}>로그인 확인 중...</div>
        {showLoginModal && (
          <ConfirmModal
            message={"로그인이 필요한 기능입니다.\n로그인 페이지로 이동하시겠습니까?"}
            confirmText="로그인"
            onConfirm={() => router.replace('/login')}
            onCancel={() => router.replace('/community')}
          />
        )}
      </>
    );
  }

  return (
    <main className={styles.writeContainer}>
      {/* 히어로 배너 */}
      <div className={styles.heroBanner}>
        <div className={styles.heroInner}>
          <div className={styles.heroTitle}>게시글 작성</div>
          <div className={styles.heroSub}>커뮤니티에 새로운 글을 작성해 보세요 ✍️</div>
        </div>
      </div>

      {/* 폼 영역 */}
      <div className={styles.formContainer}>
        <h2 className={styles.formHeader}>게시글 작성</h2>

        {/* 말머리 + 지역 (2열) */}
        <div className={styles.formMultiCols}>
          <div className={styles.formRow}>
            <label className={styles.formLabel}>
              말머리<span className={styles.req}>*</span>
            </label>
            <select
              className={styles.formSelect}
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              {CATEGORY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value} disabled={opt.value === ''}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formRow}>
            <label className={styles.formLabel}>지역 분류</label>
            <select
              className={styles.formSelect}
              value={areaCode}
              onChange={e => setAreaCode(e.target.value)}
            >
              {REGION_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 제목 */}
        <div className={styles.formRow}>
          <label className={styles.formLabel}>
            제목<span className={styles.req}>*</span>
          </label>
          <input
            type="text"
            className={styles.formInput}
            placeholder="게시글 제목을 입력하세요"
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={200}
          />
        </div>

        {/* 내용 */}
        <div className={styles.formRow}>
          <label className={styles.formLabel}>
            내용<span className={styles.req}>*</span>
          </label>
          <textarea
            className={styles.formTextarea}
            placeholder="게시글 내용을 입력하세요"
            value={content}
            onChange={e => setContent(e.target.value)}
          />
        </div>

        {/* 이미지 업로드 */}
        <div className={styles.formRow}>
          <label className={styles.formLabel}>사진 첨부</label>
          <label className={styles.imageUploadBox}>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              style={{ display: 'none' }}
              disabled={images.length >= 5}
            />
            <ImagePlus size={28} className={styles.imageUploadIcon} />
            <div className={styles.imageUploadText}>
              클릭하여 이미지 업로드 (최대 5장)
            </div>
            <div className={styles.imageUploadHint}>
              {images.length}/5장 선택됨
            </div>
          </label>

          {previews.length > 0 && (
            <div className={styles.imagePreviewList}>
              {previews.map((src, idx) => (
                <div key={idx} className={styles.imagePreviewItem}>
                  <img src={src} alt={`미리보기 ${idx + 1}`} />
                  <button
                    type="button"
                    className={styles.imageRemoveBtn}
                    onClick={() => removeImage(idx)}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className={styles.formActions}>
          <button
            type="button"
            className={styles.btnCancel}
            onClick={() => router.back()}
          >
            취소
          </button>
          <button
            type="button"
            className={styles.btnSave}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? '등록 중...' : '등록'}
          </button>
        </div>
      </div>
    </main>
  );
}
