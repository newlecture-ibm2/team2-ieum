'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/_component/common/Modal';
import type { AdminNoticeItem } from '@/types/admin-notice';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import common from '@/app/admin/_styles/admin-common.module.css';
import api from '@/lib/api';
import s from './NoticeDetailModal.module.css';

interface Attachment {
  id: number;
  fileName: string;
  filePath: string;
  fileSize: number;
  contentType: string;
}

interface Props {
  notice: AdminNoticeItem;
  onClose: () => void;
  onEdit: () => void;
}

export default function NoticeDetailModal({ notice, onClose, onEdit }: Props) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  useEffect(() => {
    const fetchAttachments = async () => {
      try {
        const { data } = await api.get('/api/attachments', {
          params: { targetType: 'NOTICE', targetId: notice.id },
        });
        setAttachments(data.data || []);
      } catch (err) {
        console.error('첨부파일 조회 실패:', err);
      }
    };
    fetchAttachments();
  }, [notice.id]);

  const formatDate = (dt: string) => {
    if (!dt) return '-';
    const d = new Date(dt);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const handleDownload = (fileId: number) => {
    window.open(`/api/attachments/${fileId}/download`, '_blank');
  };

  return (
    <Modal
      title="📋 공지사항 상세"
      size="large"
      onClose={onClose}
      closeOnOverlay
    >
      <div className={s.detailBody}>
        {/* 메타 정보 */}
        <div className={s.metaRow}>
          <span className={s.metaItem}>
            📅 작성일: {formatDate(notice.createdAt)}
          </span>
          <span className={s.metaItem}>
            👁️ 조회수: {notice.viewCount?.toLocaleString() || 0}
          </span>
        </div>

        {/* 배지 */}
        <div className={s.badgeRow}>
          {notice.isPinned && (
            <span className={`${common.statusBadge} ${common.badgeUpcoming}`}>
              📌 상단 고정
            </span>
          )}
          {notice.isPopup && (
            <span className={`${common.statusBadge} ${common.badgeOngoing}`}>
              📢 팝업 공지
            </span>
          )}
        </div>

        {/* 제목 */}
        <h2 className={s.detailTitle}>{notice.title}</h2>

        {/* 요약 */}
        {notice.summary && (
          <p className={s.detailSummary}>{notice.summary}</p>
        )}

        {/* 본문 */}
        <div className={s.detailContent}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {notice.content}
          </ReactMarkdown>
        </div>

        {/* 첨부파일 목록 */}
        {attachments.length > 0 && (
          <div className={s.attachmentSection}>
            {/* 이미지 미리보기 */}
            {attachments.filter(a => a.contentType?.startsWith('image/')).length > 0 && (
              <div className={s.imagePreviewArea}>
                {attachments
                  .filter(a => a.contentType?.startsWith('image/'))
                  .map(img => (
                    <div key={img.id} className={s.imagePreviewWrap}>
                      <img
                        src={`/api/attachments/${img.id}/download`}
                        alt={img.fileName}
                        className={s.imagePreview}
                      />
                    </div>
                  ))}
              </div>
            )}

            <h4 className={s.attachmentTitle}>📎 첨부파일 ({attachments.length})</h4>
            <ul className={s.attachmentList}>
              {attachments.map((file) => (
                <li key={file.id} className={s.attachmentItem}>
                  <span
                    className={s.attachmentName}
                    onClick={() => handleDownload(file.id)}
                  >
                    📄 {file.fileName}
                  </span>
                  <span className={s.attachmentSize}>
                    {(file.fileSize / 1024).toFixed(1)} KB
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className={s.detailFooter}>
        <button className={common.btnCancel} onClick={onClose}>닫기</button>
        <button className={common.btnPrimary} onClick={onEdit}>수정하기</button>
      </div>
    </Modal>
  );
}
