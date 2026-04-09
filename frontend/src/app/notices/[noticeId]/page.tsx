'use client';

import { Calendar, Eye, User, FileWarning, Paperclip, Download } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { useNoticeDetail } from './useNoticeDetail';
import styles from './page.module.css';

export default function NoticeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const noticeId = params.noticeId as string;

  const { notice, prevNotice, nextNotice, attachments, loading, error } = useNoticeDetail(noticeId);

  const formatDate = (dt: string) => {
    if (!dt) return '-';
    return dt.substring(0, 10).replace(/-/g, '.');
  };

  if (loading) {
    return <main className={styles.container}><div className={styles.loadingState}>불러오는 중...</div></main>;
  }

  if (error || !notice) {
    return (
      <main className={styles.container}>
        <div className={styles.errorState}>
          <FileWarning size={40} />
          <h3>공지사항을 찾을 수 없습니다</h3>
          <p>삭제되었거나 존재하지 않는 공지사항입니다.</p>
          <div className={styles.backBtnWrap} style={{ marginTop: 20 }}>
            <button className={styles.backBtn} onClick={() => router.push('/notices')}>목록으로</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <div className={styles.breadcrumb}>
        <Link href="/notices">공지사항</Link>
        <span>&gt;</span>
        <span>상세</span>
      </div>

      <div className={styles.detailHeader}>
        <h1 className={styles.detailTitle}>
          {notice.isPinned && <span className={styles.pinIcon}>📌</span>}
          {notice.title}
        </h1>
        <div className={styles.detailMeta}>
          <span><Calendar size={14} /> {formatDate(notice.createdAt)}</span>
          <span><Eye size={14} /> 조회수 {notice.viewCount?.toLocaleString()}</span>
          <span><User size={14} /> 관리자</span>
        </div>
      </div>

      <div className={`${styles.detailBody} ${styles.markdownBody || ''}`}>
        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
          {notice.content}
        </ReactMarkdown>
      </div>

      {/* 첨부파일 */}
      {attachments.length > 0 && (
        <div className={styles.attachSection}>
          {/* 이미지 미리보기 */}
          {attachments.filter(a => a.contentType?.startsWith('image/')).length > 0 && (
            <div className={styles.imagePreviewArea}>
              {attachments
                .filter(a => a.contentType?.startsWith('image/'))
                .map(img => (
                  <div key={img.id} className={styles.imagePreviewWrap}>
                    <img
                      src={`/api/attachments/${img.id}/download`}
                      alt={img.fileName}
                      className={styles.imagePreview}
                    />
                    <span className={styles.imageCaption}>{img.fileName}</span>
                  </div>
                ))}
            </div>
          )}

          {/* 파일 다운로드 리스트 */}
          <div className={styles.fileSection}>
            <h4 className={styles.fileSectionTitle}>
              <Paperclip size={14} /> 첨부파일 ({attachments.length})
            </h4>
            <ul className={styles.fileList}>
              {attachments.map(file => (
                <li key={file.id} className={styles.fileItem}>
                  <a
                    href={`/api/attachments/${file.id}/download`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.fileLink}
                  >
                    <Download size={13} />
                    <span>{file.fileName}</span>
                    <span className={styles.fileSizeText}>
                      {(file.fileSize / 1024).toFixed(1)} KB
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className={styles.detailNav}>
        {prevNotice ? (
          <button className={styles.navLink} onClick={() => router.push(`/notices/${prevNotice.id}`)}>
            ◀ 이전글: {prevNotice.title}
          </button>
        ) : (
          <span className={`${styles.navLink} ${styles.navDisabled}`}>◀ 이전글 없음</span>
        )}
        {nextNotice ? (
          <button className={styles.navLink} onClick={() => router.push(`/notices/${nextNotice.id}`)}>
            다음글: {nextNotice.title} ▶
          </button>
        ) : (
          <span className={`${styles.navLink} ${styles.navDisabled}`}>다음글 없음 ▶</span>
        )}
      </div>

      <div className={styles.backBtnWrap}>
        <button className={styles.backBtn} onClick={() => router.push('/notices')}>목록으로</button>
      </div>
    </main>
  );
}
