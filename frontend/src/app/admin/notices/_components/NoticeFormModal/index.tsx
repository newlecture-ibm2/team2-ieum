'use client';

import { useState, useRef } from 'react';
import { Modal } from '@/_component/common/Modal';
import { useToast } from '@/_component/common/Toast';
import common from '@/app/admin/_styles/admin-common.module.css';
import adminApi from '@/lib/adminApi';
import type { AdminNoticeItem } from '@/types/admin-notice';
import s from './NoticeFormModal.module.css';

interface Props {
  mode: 'create' | 'edit';
  notice: AdminNoticeItem | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function NoticeFormModal({ mode, notice, onClose, onSaved }: Props) {
  const isEdit = mode === 'edit' && notice !== null;
  const { toast } = useToast();

  const [title, setTitle] = useState(isEdit ? notice!.title : '');
  const [content, setContent] = useState(isEdit ? notice!.content : '');
  const [summary, setSummary] = useState(isEdit ? (notice!.summary || '') : '');
  const [isPinned, setIsPinned] = useState(isEdit ? notice!.isPinned : false);
  const [isPopup, setIsPopup] = useState(isEdit ? notice!.isPopup : false);
  const [sendPush, setSendPush] = useState(false); // 작성/수정 시 푸시 알림 발송 여부
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [titleError, setTitleError] = useState('');
  const [contentError, setContentError] = useState('');
  const [processing, setProcessing] = useState(false);

  const validate = (): boolean => {
    let valid = true;
    if (!title.trim()) {
      setTitleError('제목을 입력해주세요.');
      valid = false;
    } else {
      setTitleError('');
    }
    if (!content.trim()) {
      setContentError('내용을 입력해주세요.');
      valid = false;
    } else if (content.trim().length < 5) {
      setContentError('내용은 최소 5자 이상 작성해주세요.');
      valid = false;
    } else {
      setContentError('');
    }
    return valid;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', content.trim());
      if (summary.trim()) formData.append('summary', summary.trim());
      formData.append('isPinned', String(isPinned));
      formData.append('isPopup', String(isPopup));
      formData.append('sendPush', String(sendPush));
      const fileKey = isEdit ? 'newFiles' : 'files';
      files.forEach((file) => formData.append(fileKey, file));

      if (isEdit) {
        await adminApi.put(`/notices/${notice!.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast('공지사항이 수정되었습니다.', 'success');
      } else {
        await adminApi.post('/notices', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast('공지사항이 작성되었습니다.', 'success');
      }
      onSaved();
    } catch (err: any) {
      console.error('공지사항 저장 실패:', err);
      const msg = err?.response?.data?.error?.message || '저장 중 오류가 발생했습니다.';
      toast(msg, 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Modal
      title={isEdit ? '📝 공지사항 수정' : '📝 공지사항 작성'}
      size="large"
      onClose={onClose}
      closeOnOverlay={false}
    >
      <div className={s.formBody}>
        {/* 제목 */}
        <div className={s.fieldGroup}>
          <label className={s.fieldLabel}>
            <span className={s.requiredStar}>*</span> 제목
          </label>
          <input
            type="text"
            className={`${s.fieldInput} ${titleError ? s.fieldInputError : ''}`}
            value={title}
            onChange={(e) => { setTitle(e.target.value); if (titleError) setTitleError(''); }}
            placeholder="공지사항 제목을 입력하세요"
            maxLength={100}
          />
          {titleError && <span className={s.errorText}>⚠ {titleError}</span>}
        </div>

        {/* 요약 */}
        <div className={s.fieldGroup}>
          <label className={s.fieldLabel}>요약 (선택)</label>
          <input
            type="text"
            className={s.fieldInput}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="목록에 표시될 간단한 요약"
            maxLength={200}
          />
        </div>

        {/* 내용 */}
        <div className={s.fieldGroup}>
          <label className={s.fieldLabel}>
            <span className={s.requiredStar}>*</span> 내용
          </label>
          <div className={s.textareaWrap}>
            <textarea
              className={`${s.fieldTextarea} ${contentError ? s.fieldInputError : ''}`}
              value={content}
              onChange={(e) => { setContent(e.target.value); if (contentError) setContentError(''); }}
              placeholder="공지사항 내용을 작성하세요"
              maxLength={5000}
              rows={10}
            />
            <span className={s.charCount}>{content.length} / 5000</span>
          </div>
          {contentError && <span className={s.errorText}>⚠ {contentError}</span>}
        </div>

        {/* 첨부파일 */}
        <div className={s.fieldGroup}>
          <label className={s.fieldLabel}>📎 첨부파일</label>
          <div
            className={s.fileDropZone}
            onClick={() => fileInputRef.current?.click()}
          >
            <span className={s.fileDropText}>클릭하여 파일을 선택하세요</span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className={s.fileInputHidden}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                const newFiles = Array.from(e.target.files);
                setFiles((prev) => [...prev, ...newFiles]);
                e.target.value = '';
              }
            }}
          />
          {files.length > 0 && (
            <ul className={s.fileList}>
              {files.map((file, idx) => (
                <li key={idx} className={s.fileItem}>
                  <span className={s.fileName}>📄 {file.name}</span>
                  <span className={s.fileSize}>
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                  <button
                    type="button"
                    className={s.fileRemoveBtn}
                    onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 옵션 토글 */}
        <div className={s.optionRow}>
          <label className={s.toggleWrap} onClick={() => setIsPinned(!isPinned)}>
            <div className={`${common.toggleTrack} ${isPinned ? common.toggleTrackOn : ''}`}>
              <div className={`${common.toggleThumb} ${isPinned ? common.toggleThumbOn : ''}`} />
            </div>
            <span className={s.toggleLabel}>📌 상단 고정</span>
          </label>

          <label className={s.toggleWrap} onClick={() => setIsPopup(!isPopup)}>
            <div className={`${common.toggleTrack} ${isPopup ? common.toggleTrackOn : ''}`}>
              <div className={`${common.toggleThumb} ${isPopup ? common.toggleThumbOn : ''}`} />
            </div>
            <span className={s.toggleLabel}>📢 메인 팝업</span>
          </label>

          <label className={s.toggleWrap} onClick={() => setSendPush(!sendPush)}>
            <div className={`${common.toggleTrack} ${sendPush ? common.toggleTrackOn : ''}`}>
              <div className={`${common.toggleThumb} ${sendPush ? common.toggleThumbOn : ''}`} />
            </div>
            <span className={s.toggleLabel}>🔔 푸시 알림 발송</span>
          </label>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className={s.formFooter}>
        <button className={common.btnCancel} onClick={onClose}>취소</button>
        <button
          className={common.btnPrimary}
          onClick={handleSubmit}
          disabled={processing}
          style={{ opacity: processing ? 0.6 : 1 }}
        >
          {processing ? '저장 중...' : isEdit ? '수정 완료' : '작성 완료'}
        </button>
      </div>
    </Modal>
  );
}
