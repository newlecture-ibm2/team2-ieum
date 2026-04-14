import { useRouter } from 'next/navigation';
import { Notice } from '@/types/notice';
import { FileText } from 'lucide-react';
import styles from './NoticeTable.module.css';

interface NoticeTableProps {
  notices: Notice[];
  totalElements: number;
  currentPage: number;
  loading: boolean;
}

export default function NoticeTable({ notices, totalElements, currentPage, loading }: NoticeTableProps) {
  const router = useRouter();

  const formatDate = (dt: string) => {
    if (!dt) return '-';
    return dt.substring(0, 10).replace(/-/g, '.');
  };


  if (loading) {
    return <div className={styles.emptyState}><p>불러오는 중...</p></div>;
  }

  if (notices.length === 0) {
    return (
      <div className={styles.emptyState}>
        <FileText size={40} />
        <h3>등록된 공지사항이 없습니다</h3>
        <p>새로운 공지사항이 등록되면 여기에 표시됩니다.</p>
      </div>
    );
  }

  return (
    <table className={styles.noticeTable}>
      <thead>
        <tr>
          <th style={{ width: 60 }}>No</th>
          <th>제목</th>
          <th style={{ width: 110 }}>작성일</th>
          <th style={{ width: 80 }}>조회수</th>

        </tr>
      </thead>
      <tbody>
        {notices.map((notice, idx) => {
          return (
            <tr key={notice.id} className={notice.isPinned ? styles.pinnedRow : ''}>
              <td>{totalElements - ((currentPage - 1) * 10 + idx)}</td>
              <td>
                <span
                  className={styles.titleCell}
                  onClick={() => router.push(`/notices/${notice.id}`)}
                >
                  {notice.isPinned && <span className={styles.pinIcon}>📌</span>}
                  {notice.title}
                </span>
              </td>
              <td>{formatDate(notice.createdAt)}</td>
              <td>{notice.viewCount?.toLocaleString()}</td>

            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
