"use client";

import React, { useState } from 'react';
import styles from '../mypage.module.css';
import api from '@/lib/api';
import { useToast } from '@/_component/common/Toast';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function InquiryModal({ isOpen, onClose, onSuccess }: InquiryModalProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast('제목과 내용을 모두 입력해주세요.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.post('/api/users/me/inquiries', {
        title,
        content,
        type: 'GENERAL'
      });

      if (res.data.success) {
        toast('문의가 정상적으로 접수되었습니다.', 'success');
        setTitle('');
        setContent('');
        onSuccess();
        onClose();
      } else {
        toast(res.data.message || '문의 등록에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('Failed to submit inquiry:', error);
      toast('문의 등록 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <h2 className={styles.modalTitle}>1:1 문의하기</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label className={styles.sectionLabel}>문의 제목</label>
            <input 
              type="text" 
              className={styles.inputField} 
              placeholder="제목을 입력해주세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              maxLength={200}
              required
            />
            <div className={styles.charCount}>{title.length}/200</div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.sectionLabel}>문의 내용</label>
            <textarea 
              className={styles.inputField} 
              style={{ minHeight: '150px', resize: 'none', padding: '12px' }}
              placeholder="상세 내용을 입력해주세요 (최대 2000자)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isSubmitting}
              maxLength={2000}
              required
            />
            <div className={styles.charCount}>{content.length}/2000</div>
          </div>
          <div className={styles.buttonGroup}>
            <button 
              type="button" 
              className={styles.cancelBtn} 
              onClick={onClose}
              disabled={isSubmitting}
            >
              취소
            </button>
            <button 
              type="submit" 
              className={styles.confirmBtn}
              style={{ backgroundColor: 'var(--color-primary-500)' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? '등록 중...' : '문의 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
