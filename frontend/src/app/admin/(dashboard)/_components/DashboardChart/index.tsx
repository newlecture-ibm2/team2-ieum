import { useState, useEffect, useCallback, useMemo } from 'react';
import type { DashboardTrendItem } from '@/types/admin-dashboard';
import { fetchDashboardTrend } from '../../_api/fetchDashboardData';
import s from '../DashboardPage/DashboardPage.module.css';

interface Props {
  initialTrend: DashboardTrendItem[];
}

type PeriodType = '7D' | '30D' | 'CUSTOM';

/** 두 날짜 사이 일수 (절대값) */
function daysBetween(a: string, b: string): number {
  const msPerDay = 86400000;
  return Math.round(Math.abs(new Date(a).getTime() - new Date(b).getTime()) / msPerDay);
}

/** 최대 조회 가능 일수 */
const MAX_DAYS = 365;

export default function DashboardChart({ initialTrend }: Props) {
  const [trend, setTrend] = useState<DashboardTrendItem[]>(initialTrend);
  const [period, setPeriod] = useState<PeriodType>('7D');
  const [loading, setLoading] = useState(false);
  const [dateError, setDateError] = useState('');

  // 직접 입력 기본값: 오늘 ~ 1년 전 (최대 조회 가능 일수)
  const [customStart, setCustomStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - MAX_DAYS);
    return d.toISOString().split('T')[0];
  });
  const [customEnd, setCustomEnd] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  /** 날짜 유효성 검증 */
  const validateDates = useCallback((start: string, end: string): string => {
    if (!start || !end) return '';
    if (start > end) return '시작일이 종료일보다 늦을 수 없습니다.';
    if (daysBetween(start, end) > MAX_DAYS) return `직접 입력은 1년(${MAX_DAYS}일) 이내만 조회 가능합니다.`;
    return '';
  }, []);

  /** 날짜 변경 핸들러 — 유효성 검증 포함 */
  const handleStartChange = (val: string) => {
    setCustomStart(val);
    setDateError(validateDates(val, customEnd));
  };
  const handleEndChange = (val: string) => {
    setCustomEnd(val);
    setDateError(validateDates(customStart, val));
  };

  useEffect(() => {
    if (period === '7D') {
      setTrend(initialTrend);
      setDateError('');
      return;
    }

    // CUSTOM 모드에서 날짜 에러 시 API 호출 차단
    if (period === 'CUSTOM') {
      const err = validateDates(customStart, customEnd);
      if (err) {
        setDateError(err);
        return;
      }
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        let startStr = '';
        let endStr = '';

        if (period === '30D') {
          const endDate = new Date();
          const startDate = new Date();
          startDate.setDate(endDate.getDate() - 29);
          startStr = startDate.toISOString().split('T')[0];
          endStr = endDate.toISOString().split('T')[0];
        } else if (period === 'CUSTOM') {
          startStr = customStart;
          endStr = customEnd;
        }

        const newTrend = await fetchDashboardTrend(startStr, endStr);
        if (!cancelled) setTrend(newTrend);
      } catch (err) {
        console.error('차트 데이터 로드 실패:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [period, initialTrend, customStart, customEnd, validateDates]);

  // 렌더링 전 집계 (trend 데이터 길이 기준 그룹화)
  const displayTrend = useMemo(() => {
    const days = trend.length;
    if (days <= 31) return trend;

    const result: DashboardTrendItem[] = [];
    if (days <= 180) {
      // 주 단위 (7일씩 묶기)
      for (let i = 0; i < trend.length; i += 7) {
        const chunk = trend.slice(i, i + 7);
        const reports = chunk.reduce((acc, cur) => acc + cur.reports, 0);
        const inquiries = chunk.reduce((acc, cur) => acc + cur.inquiries, 0);
        result.push({ date: `${chunk[0].date}~${chunk[chunk.length - 1].date}`, reports, inquiries });
      }
    } else {
      // 월 단위 (월 정보로 묶기)
      let currentMonth = trend[0].date.split('/')[0];
      let rSum = 0, iSum = 0;
      for (let i = 0; i < trend.length; i++) {
        const month = trend[i].date.split('/')[0];
        if (month !== currentMonth) {
          result.push({ date: `${currentMonth}월`, reports: rSum, inquiries: iSum });
          currentMonth = month;
          rSum = 0; iSum = 0;
        }
        rSum += trend[i].reports;
        iSum += trend[i].inquiries;
      }
      result.push({ date: `${currentMonth}월`, reports: rSum, inquiries: iSum });
    }
    return result;
  }, [trend]);

  const maxReport = Math.max(...displayTrend.map(d => d.reports), 0);
  const maxInquiry = Math.max(...displayTrend.map(d => d.inquiries), 0);
  const dataMax = Math.max(maxReport, maxInquiry, 1);
  const maxValue = dataMax < 4 ? 4 : Math.ceil(dataMax * 1.25);

  return (
    <div className={s.chartCard}>
      {/* ── 헤더 영역 (타이틀 + 탭) ── */}
      {/* ── 헤더 영역 (타이틀 + 탭) ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div className={s.chartTitle}>접수 현황 추이</div>
        </div>

        {/* ── 기간 선택 탭 ── */}
        <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => { setPeriod('7D'); setDateError(''); }}
            style={{
              padding: '6px 12px', fontSize: '12px', fontWeight: period === '7D' ? 600 : 500,
              background: period === '7D' ? '#fff' : 'transparent',
              color: period === '7D' ? '#1e293b' : '#64748b',
              border: 'none', borderRadius: '6px', cursor: 'pointer',
              boxShadow: period === '7D' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              flex: '1 1 auto'
            }}
          >
            최근 7일
          </button>
          <button
            onClick={() => { setPeriod('30D'); setDateError(''); }}
            style={{
              padding: '6px 12px', fontSize: '12px', fontWeight: period === '30D' ? 600 : 500,
              background: period === '30D' ? '#fff' : 'transparent',
              color: period === '30D' ? '#1e293b' : '#64748b',
              border: 'none', borderRadius: '6px', cursor: 'pointer',
              boxShadow: period === '30D' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              flex: '1 1 auto'
            }}
          >
            최근 30일
          </button>
          <button
            onClick={() => setPeriod('CUSTOM')}
            style={{
              padding: '6px 12px', fontSize: '12px', fontWeight: period === 'CUSTOM' ? 600 : 500,
              background: period === 'CUSTOM' ? '#fff' : 'transparent',
              color: period === 'CUSTOM' ? '#1e293b' : '#64748b',
              border: 'none', borderRadius: '6px', cursor: 'pointer',
              boxShadow: period === 'CUSTOM' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              flex: '1 1 auto'
            }}
          >
            직접 입력
          </button>
        </div>
      </div>

      {/* ── 직접 입력 달력 (탭 아래 별도 행) ── */}
      {period === 'CUSTOM' && (
        <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', width: '100%' }}>
            <input
              type="date"
              value={customStart}
              onChange={(e) => handleStartChange(e.target.value)}
              style={{
                flex: 1, minWidth: '130px', height: '32px', padding: '0 8px', fontSize: '13px',
                border: dateError ? '1px solid #ef4444' : '1px solid #e2e8f0',
                borderRadius: '6px', outline: 'none', color: '#475569', boxSizing: 'border-box'
              }}
            />
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>~</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => handleEndChange(e.target.value)}
              style={{
                flex: 1, minWidth: '130px', height: '32px', padding: '0 8px', fontSize: '13px',
                border: dateError ? '1px solid #ef4444' : '1px solid #e2e8f0',
                borderRadius: '6px', outline: 'none', color: '#475569', boxSizing: 'border-box'
              }}
            />
          </div>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
            ※ 1년 이내만 조회 가능
          </span>
          {dateError && (
            <div style={{
              fontSize: '12px', color: '#ef4444', fontWeight: 500,
              padding: '4px 8px', background: '#fef2f2', borderRadius: '4px',
              display: 'inline-flex', alignItems: 'center', gap: '4px', width: 'fit-content'
            }}>
              ⚠ {dateError}
            </div>
          )}
        </div>
      )}

      {/* 내부 차트 영역: 로딩 시 흐려짐 */}
      <div style={{ marginTop: '20px', marginBottom: '12px', opacity: loading ? 0.3 : 1, transition: 'opacity 0.3s' }}>
        <div style={{ position: 'relative', height: '110px' }}>

          <svg
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}
            viewBox={`0 0 ${displayTrend.length * 100} 100`}
            preserveAspectRatio="none"
          >
            <polyline
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeLinejoin="round"
              points={displayTrend.map((d, i) => {
                const x = (i + 0.5) * 100;
                const y = 100 - (d.inquiries / maxValue) * 100;
                return `${x},${y}`;
              }).join(' ')}
            />
          </svg>

          <div style={{ display: 'flex', width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
            {displayTrend.map((d, i) => {
              const repPct = (d.reports / maxValue) * 100;
              const inqPct = (d.inquiries / maxValue) * 100;
              const isOverlap = Math.abs(repPct - inqPct) < 15;

              const isCompact = displayTrend.length > 14;
              const showText = !isCompact || (d.reports > 0 || d.inquiries > 0);

              return (
                <div key={i} style={{ flex: 1, position: 'relative' }}>
                  {d.reports > 0 && (
                    <>
                      <div className={s.bar} style={{ height: `${repPct}%`, width: isCompact ? '8px' : '24px' }} />
                      {showText && (
                        <div
                          className={s.reportLineValue}
                          style={{
                            bottom: `${repPct}%`,
                            transform: isOverlap ? 'translate(-120%, -10px)' : 'translate(-50%, -6px)',
                            fontSize: isCompact ? '9px' : '11px'
                          }}
                        >
                          {d.reports}
                        </div>
                      )}
                    </>
                  )}
                  {d.inquiries > 0 && (
                    <>
                      <div className={s.lineDot} style={{ bottom: `${inqPct}%`, left: '50%', width: isCompact ? '4px' : '8px', height: isCompact ? '4px' : '8px' }} />
                      {showText && (
                        <div
                          className={s.lineValue}
                          style={{
                            bottom: `${inqPct}%`, left: '50%',
                            transform: isOverlap ? 'translate(20%, -14px)' : 'translate(-50%, -14px)',
                            fontSize: isCompact ? '9px' : '11px'
                          }}
                        >
                          {d.inquiries}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* X축 날짜 라벨 */}
        <div style={{ display: 'flex', marginTop: '16px' }}>
          {displayTrend.map((d, i) => {
            const isCompact = displayTrend.length > 14;
            let showLabel = true;
            if (isCompact) {
              // 라벨이 너무 촘촘해지면 간격을 두고 보여줌 
              const intervalDays = Math.ceil(displayTrend.length / 6);
              showLabel = (i % intervalDays === 0) || i === displayTrend.length - 1;
            }
            return (
              <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: '10px', color: '#64748b' }}>
                {showLabel ? d.date : ''}
              </div>
            );
          })}
        </div>
      </div>

      <div className={s.legend} style={{ marginTop: '0px' }}>
        <span><span className={s.legendDot} style={{ background: '#818cf8', borderRadius: '4px' }} />신고</span>
        <span><span className={s.legendDot} style={{ background: '#f59e0b', borderRadius: '50%' }} />문의</span>
      </div>
    </div>
  );
}
