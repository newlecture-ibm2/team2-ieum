import common from '@/app/admin/_styles/admin-common.module.css';

interface Props {
  allCount: number;
  pinnedCount: number;
  popupCount: number;
  pushedCount: number;
  filterType: 'all' | 'pinned' | 'popup' | 'pushed' | 'ACTIVE' | 'INACTIVE' | 'RESERVED' | 'ENDED';
  onFilterChange: (type: 'all' | 'pinned' | 'popup' | 'pushed') => void;
}

export default function NoticeListKPI({ 
  allCount, pinnedCount, popupCount, pushedCount, filterType, onFilterChange 
}: Props) {
  return (
    <div className={common.card}>
      <div className={common.statGrid}>
        <div
          className={`${common.statCard} ${common.statTotal} ${common.statCardInteractive} ${filterType === 'all' ? common.statActive : ''}`}
          onClick={() => onFilterChange('all')}
        >
          <div className={common.statLabel}>전체</div>
          <div className={common.statValue}>{allCount}</div>
        </div>
        <div
          className={`${common.statCard} ${common.statUpcoming} ${common.statCardInteractive} ${filterType === 'pinned' ? common.statActive : ''}`}
          onClick={() => onFilterChange('pinned')}
        >
          <div className={common.statLabel}>상단고정</div>
          <div className={`${common.statValue} ${common.textPurple}`}>{pinnedCount}</div>
        </div>
        <div
          className={`${common.statCard} ${common.statOngoing} ${common.statCardInteractive} ${filterType === 'popup' ? common.statActive : ''}`}
          onClick={() => onFilterChange('popup')}
        >
          <div className={common.statLabel}>팝업</div>
          <div className={`${common.statValue} ${common.textGreen}`}>{popupCount}</div>
        </div>
        <div
          className={`${common.statCard} ${common.statEnded} ${common.statCardInteractive} ${filterType === 'pushed' ? common.statActive : ''}`}
          onClick={() => onFilterChange('pushed')}
        >
          <div className={common.statLabel}>푸시알림</div>
          <div className={`${common.statValue}`}>{pushedCount}</div>
        </div>
      </div>
    </div>
  );
}
