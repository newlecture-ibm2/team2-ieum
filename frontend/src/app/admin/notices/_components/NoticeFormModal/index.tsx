'use client';

import { useRef } from 'react';
import type ReactQuillType from 'react-quill-new';
import dynamic from 'next/dynamic';
import { Modal } from '@/_component/common/Modal';
import common from '@/app/admin/_styles/admin-common.module.css';
import type { AdminNoticeItem } from '@/types/admin-notice';
import { useNoticeForm } from './useNoticeForm';
import s from './NoticeFormModal.module.css';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(async () => {
  const { default: RQ } = await import('react-quill-new');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function Comp({ forwardedRef, ...props }: any) {
    return <RQ ref={forwardedRef} {...props} />;
  };
}, {
  ssr: false,
  loading: () => <div style={{ height: '260px', padding: '16px', border: '1px solid #cbd5e1', borderRadius: '8px' }}>에디터를 불러오는 중입니다...</div>
});

interface Props {
  mode: 'create' | 'edit';
  notice: AdminNoticeItem | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function NoticeFormModal({ mode, notice, onClose, onSaved }: Props) {
  const {
    isEdit,
    quillRefHolder,
    quillModules,
    formState,
    errors,
    processing,
    handleSubmit
  } = useNoticeForm({ mode, notice, onSaved });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const quillRef = useRef<ReactQuillType | null>(null);
  quillRefHolder.current = quillRef.current;

  return (
    <Modal
      title={isEdit ? '📝 공지사항 수정' : '📝 공지사항 작성'}
      size="xlarge"
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
            className={`${s.fieldInput} ${errors.titleError ? s.fieldInputError : ''}`}
            value={formState.title}
            onChange={(e) => { formState.setTitle(e.target.value); if (errors.titleError) errors.setTitleError(''); }}
            placeholder="공지사항 제목을 입력하세요"
            maxLength={100}
          />
          {errors.titleError && <span className={s.errorText}>⚠ {errors.titleError}</span>}
        </div>

        {/* 요약 */}
        <div className={s.fieldGroup}>
          <label className={s.fieldLabel}>요약 (선택)</label>
          <input
            type="text"
            className={s.fieldInput}
            value={formState.summary}
            onChange={(e) => formState.setSummary(e.target.value)}
            placeholder="목록에 표시될 간단한 요약"
            maxLength={200}
          />
        </div>

        {/* 게시 기간 */}
        <div className={s.fieldGroup}>
          <label className={s.fieldLabel}>게시 기간 (예약 설정)</label>
          <div className={s.dateRangeInput}>
            <input
              type="datetime-local"
              className={s.fieldInput}
              value={formState.startDate}
              onChange={(e) => formState.setStartDate(e.target.value)}
            />
            <span className={s.dateSeparator}>~</span>
            <input
              type="datetime-local"
              className={s.fieldInput}
              value={formState.endDate}
              onChange={(e) => formState.setEndDate(e.target.value)}
              placeholder="종료일 (미설정 시 무제한)"
            />
          </div>
          <p className={s.fieldDesc}>게시 기간 미설정 시 즉시 노출되며, 종료일 미설정 시 수동 비활성 전까지 노출됩니다.</p>
        </div>

        {/* 내용 (Quill 에디터) */}
        <div className={s.fieldGroup}>
          <label className={s.fieldLabel}>
            <span className={s.requiredStar}>*</span> 내용
          </label>
          <div className={s.textareaWrap}>
            <ReactQuill
              forwardedRef={quillRef}
              theme="snow"
              value={formState.content}
              onChange={(val: string) => { formState.setContent(val); if (errors.contentError) errors.setContentError(''); }}
              modules={quillModules}
              placeholder="공지사항 내용을 작성하세요 (이미지 삽입 가능)"
            />
            <span className={s.charCount}>{formState.content.replace(/<[^>]*>?/gm, '').length} / 5000 (태그 제외)</span>
          </div>
          {errors.contentError && <span className={s.errorText}>⚠ {errors.contentError}</span>}
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
                formState.setFiles((prev) => [...prev, ...newFiles]);
                e.target.value = '';
              }
            }}
          />
          {/* 기존 첨부파일 목록 (수정 모드) */}
          {formState.existingFiles.length > 0 && (
            <ul className={s.fileList} style={{ marginBottom: '8px' }}>
              {formState.existingFiles.map((file) => (
                <li key={file.id} className={s.fileItem}>
                  <span className={s.fileName}>기존 📄 {file.fileName}</span>
                  {file.fileSize && (
                    <span className={s.fileSize}>
                      {(file.fileSize / 1024).toFixed(1)} KB
                    </span>
                  )}
                  <button
                    type="button"
                    className={s.fileRemoveBtn}
                    title="기존 첨부파일 삭제"
                    onClick={() => {
                      formState.setDeleteFileIds(prev => [...prev, file.id]);
                      formState.setExistingFiles(prev => prev.filter(f => f.id !== file.id));
                    }}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* 새로 추가하는 파일 목록 */}
          {formState.files.length > 0 && (
            <ul className={s.fileList}>
              {formState.files.map((file, idx) => (
                <li key={idx} className={s.fileItem}>
                  <span className={s.fileName}>새로 📄 {file.name}</span>
                  <span className={s.fileSize}>
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                  <button
                    type="button"
                    className={s.fileRemoveBtn}
                    title="새 파일 삭제"
                    onClick={() => formState.setFiles((prev) => prev.filter((_, i) => i !== idx))}
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
          <label className={s.toggleWrap} onClick={() => formState.setIsPinned(!formState.isPinned)}>
            <div className={`${common.toggleTrack} ${formState.isPinned ? common.toggleTrackOn : ''}`}>
              <div className={`${common.toggleThumb} ${formState.isPinned ? common.toggleThumbOn : ''}`} />
            </div>
            <span className={s.toggleLabel}>📌 상단 고정</span>
          </label>

          <label className={s.toggleWrap} onClick={() => formState.setIsPopup(!formState.isPopup)}>
            <div className={`${common.toggleTrack} ${formState.isPopup ? common.toggleTrackOn : ''}`}>
              <div className={`${common.toggleThumb} ${formState.isPopup ? common.toggleThumbOn : ''}`} />
            </div>
            <span className={s.toggleLabel}>📢 메인 팝업</span>
          </label>

          <label className={s.toggleWrap} onClick={() => formState.setSendPush(!formState.sendPush)}>
            <div className={`${common.toggleTrack} ${formState.sendPush ? common.toggleTrackOn : ''}`}>
              <div className={`${common.toggleThumb} ${formState.sendPush ? common.toggleThumbOn : ''}`} />
            </div>
            <span className={s.toggleLabel}>🔔 푸시 알림 발송</span>
          </label>

          <label className={s.toggleWrap} onClick={() => formState.setIsActive(!formState.isActive)}>
            <div className={`${common.toggleTrack} ${formState.isActive ? common.toggleTrackOn : ''}`}>
              <div className={`${common.toggleThumb} ${formState.isActive ? common.toggleThumbOn : ''}`} />
            </div>
            <span className={s.toggleLabel}>👁 공개 여부</span>
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
