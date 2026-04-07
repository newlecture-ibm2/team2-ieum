'use client';

import { useEffect, useState } from 'react';
import common from '@/app/admin/_styles/admin-common.module.css';
import s from './DashboardPage.module.css';
import type { DashboardData } from '@/types/admin-dashboard';
import { fetchDashboardData } from '../../_api/fetchDashboardData';
import DashboardKPI from '../DashboardKPI';
import DashboardChart from '../DashboardChart';
import DashboardRecentList from '../DashboardRecentList';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const result = await fetchDashboardData();
        if (!cancelled) setData(result);
      } catch (err) {
        console.error('대시보드 데이터 로드 실패:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className={common.container}>
      {/* ── 페이지 헤더 ── */}
      <div className={common.pageHeader}>
        <div>
          <h1 className={common.pageTitle}>운영 현황 대시보드</h1>
          <p className={common.pageSubtitle}>축제 플랫폼 전반의 운영 현황을 한눈에 확인합니다</p>
        </div>
      </div>

      {loading || !data ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <span className={common.spinner} /> 대시보드 로딩 중...
        </div>
      ) : (
        <>
          {/* ── KPI 카드 4종 ── */}
          <DashboardKPI kpi={data.kpi} />

          {/* ── 차트 영역 ── */}
          <DashboardChart initialTrend={data.trend} />

          {/* ── 최근 현황 (리스트) 1:1 배치 ── */}
          <div className={s.twoColGridEq}>
            <DashboardRecentList 
              type="REPORT" 
              title={`최근 신고 현황 (${data.recentReports.length}건)`} 
              items={data.recentReports} 
            />
            <DashboardRecentList 
              type="INQUIRY" 
              title={`최근 문의 현황 (${data.recentInquiries.length}건)`} 
              items={data.recentInquiries} 
            />
          </div>
        </>
      )}
    </div>
  );
}
