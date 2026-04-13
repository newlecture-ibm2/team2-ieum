'use client';

import common from '@/app/admin/_styles/admin-common.module.css';
import { useAdminNoticeList } from './useAdminNoticeList';
import NoticeListKPI from './_components/NoticeListKPI';
import NoticeListFilterBar from './_components/NoticeListFilterBar';
import NoticeListTable from './_components/NoticeListTable';
import NoticeFormModal from '../NoticeFormModal';
import NoticeDetailModal from '../NoticeDetailModal';
import ConfirmModal from '@/_component/common/Modal/ConfirmModal';

export default function NoticeListPage() {
  const {
    notices, loading, totalElements, currentPage, totalPages, setCurrentPage,
    allCount, pinnedCount, popupCount, pushedCount,
    filterType, handleFilterChange,
    localSearchType, setLocalSearchType,
    searchTerm, setSearchTerm, onSearchSubmit, handleSearchKeyDown,
    formMode, setFormMode,
    editTarget, setEditTarget,
    deleteTarget, setDeleteTarget,
    detailTarget, setDetailTarget,
    fetchNotices, fetchKpiCounts, handleDelete
  } = useAdminNoticeList();

  return (
    <div className={common.container}>
      {/* ── 페이지 헤더 ── */}
      <div className={common.pageHeader}>
        <div>
          <h1 className={common.pageTitle}>📢 공지사항 관리</h1>
          <p className={common.pageSubtitle}>공지사항을 작성, 수정, 삭제합니다</p>
        </div>
        <button
          className={common.btnPrimary}
          onClick={() => { setFormMode('create'); setEditTarget(null); }}
        >
          + 공지 작성
        </button>
      </div>

      {/* ── KPI 통계 카드 ── */}
      <NoticeListKPI
        allCount={allCount}
        pinnedCount={pinnedCount}
        popupCount={popupCount}
        pushedCount={pushedCount}
        filterType={filterType}
        onFilterChange={handleFilterChange}
      />

      {/* ── 필터 및 검색 바 ── */}
      <NoticeListFilterBar
        filterType={filterType}
        onFilterTypeChange={handleFilterChange}
        localSearchType={localSearchType}
        onLocalSearchTypeChange={setLocalSearchType}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        onSearchSubmit={onSearchSubmit}
        onSearchKeyDown={handleSearchKeyDown}
      />

      {/* ── 공지사항 테이블 ── */}
      <NoticeListTable
        loading={loading}
        notices={notices}
        totalElements={totalElements}
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
        onDetailClick={setDetailTarget}
        onEditClick={(notice) => { setFormMode('edit'); setEditTarget(notice); }}
        onDeleteClick={setDeleteTarget}
      />

      {/* ── 작성/수정 모달 ── */}
      {formMode && (
        <NoticeFormModal
          mode={formMode}
          notice={editTarget}
          onClose={() => { setFormMode(null); setEditTarget(null); }}
          onSaved={() => {
            setFormMode(null);
            setEditTarget(null);
            fetchNotices();
            fetchKpiCounts();
          }}
        />
      )}

      {/* ── 삭제 확인 모달 ── */}
      {deleteTarget && (
        <ConfirmModal
          title="공지사항 삭제"
          message={`"${deleteTarget.title}" 공지사항을 삭제하시겠습니까?\n삭제 후에는 복구할 수 없습니다.`}
          confirmText="삭제"
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* ── 상세보기 모달 ── */}
      {detailTarget && (
        <NoticeDetailModal
          notice={detailTarget}
          onClose={() => setDetailTarget(null)}
          onEdit={() => {
            setDetailTarget(null);
            setFormMode('edit');
            setEditTarget(detailTarget);
          }}
        />
      )}
    </div>
  );
}
