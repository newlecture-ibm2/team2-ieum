'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { Notice } from '@/types/notice';
import s from './NoticePopup.module.css';

export default function NoticePopup() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // 1. Check localStorage for 'hidePopupToday'
    const hideUntil = localStorage.getItem('hideNoticePopupUntil');
    if (hideUntil && new Date().getTime() < parseInt(hideUntil, 10)) {
      return; // "오늘 하루 안보기" 상태
    }

    // 2. Fetch popup notice
    const fetchPopup = async () => {
      try {
        const { data } = await api.get<{ data: Notice[] }>('/api/notices/popup');
        if (data && data.data && data.data.length > 0) {
          setNotices(data.data);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('팝업 공지사항을 불러오는 중 오류 발생:', err);
      }
    };

    fetchPopup();
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleHideToday = () => {
    // 24 hours from now
    const tomorrow = new Date().getTime() + 24 * 60 * 60 * 1000;
    localStorage.setItem('hideNoticePopupUntil', tomorrow.toString());
    setIsOpen(false);
  };

  if (!isOpen || notices.length === 0) return null;

  const currentNotice = notices[currentIndex];

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleNext = () => {
    if (currentIndex < notices.length - 1) setCurrentIndex(currentIndex + 1);
  };

  return (
    <div className={s.overlay}>
      <div className={s.popupContainer}>
        <div className={s.header}>
          <h2 className={s.title}>{currentNotice.title}</h2>
          <button className={s.closeBtn} onClick={handleClose}>&times;</button>
        </div>
        <div className={s.body}>
          {currentNotice.content}
        </div>
        
        {notices.length > 1 && (
          <div className={s.carouselControls}>
            <button className={s.carouselBtn} onClick={handlePrev} disabled={currentIndex === 0}>
              &lt; 이전
            </button>
            <span className={s.carouselIndicator}>
              {currentIndex + 1} / {notices.length}
            </span>
            <button className={s.carouselBtn} onClick={handleNext} disabled={currentIndex === notices.length - 1}>
              다음 &gt;
            </button>
          </div>
        )}

        <div className={s.footer}>
          <button className={s.hideTodayBtn} onClick={handleHideToday}>
            오늘 하루 보지 않기
          </button>
          <button className={s.confirmBtn} onClick={handleClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
