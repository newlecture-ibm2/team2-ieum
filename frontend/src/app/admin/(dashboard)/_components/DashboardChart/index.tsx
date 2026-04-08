import { useState, useEffect } from 'react';
import type { DashboardTrendItem } from '@/types/admin-dashboard';
import { fetchDashboardTrend } from '../../_api/fetchDashboardData';
import s from '../DashboardPage/DashboardPage.module.css';

interface Props {
  initialTrend: DashboardTrendItem[];
}

type PeriodType = '7D' | '30D' | 'CUSTOM';

export default function DashboardChart({ initialTrend }: Props) {
  const [trend, setTrend] = useState<DashboardTrendItem[]>(initialTrend);
  const [period, setPeriod] = useState<PeriodType>('7D');
  const [loading, setLoading] = useState(false);

  // 직접 입력 기본값: 오늘 ~ 한달 전
  const [customStart, setCustomStart] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [customEnd, setCustomEnd] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  useEffect(() => {
    if (period === '7D') {
      setTrend(initialTrend);
      return;
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
  }, [period, initialTrend, customStart, customEnd]);

  const maxReport = Math.max(...trend.map(d => d.reports), 0);
  const maxInquiry = Math.max(...trend.map(d => d.inquiries), 0);
  const dataMax = Math.max(maxReport, maxInquiry, 1);
  const maxValue = dataMax < 4 ? 4 : Math.ceil(dataMax * 1.25);

  return (
    <div className={s.chartCard}>
      {/* ── 헤더 영역 (타이틀 + 탭) ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className={s.chartTitle}>접수 현황 추이</div>
          <div className={s.chartSubtitle}>신고(막대) · 문의(선) 등록 추이</div>
        </div>

        {/* ── 우측 조작부 (달력 + 탭) ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* 직접 입력 선택 시 노출되는 달력 폼 (탭의 좌측에 인라인으로 렌더링) */}
          {period === 'CUSTOM' && (
            <div style={{ display: 'flex', alignItems: 'center', height: '28px' }}>
              <input 
                type="date" 
                value={customStart} 
                onChange={(e) => setCustomStart(e.target.value)}
                style={{ width: '130px', height: '100%', padding: '0 6px', fontSize: '12px', border: '1px solid #e2e8f0', borderRadius: '6px', outline: 'none', color: '#475569', boxSizing: 'border-box' }}
              />
              <span style={{ fontSize: '12px', color: '#94a3b8', margin: '0 6px' }}>~</span>
              <input 
                type="date" 
                value={customEnd} 
                onChange={(e) => setCustomEnd(e.target.value)}
                style={{ width: '130px', height: '100%', padding: '0 6px', fontSize: '12px', border: '1px solid #e2e8f0', borderRadius: '6px', outline: 'none', color: '#475569', boxSizing: 'border-box' }}
              />
            </div>
          )}

          {/* ── 기간 선택 탭 ── */}
          <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
            <button
              onClick={() => setPeriod('7D')}
              style={{
                padding: '6px 12px', fontSize: '12px', fontWeight: period === '7D' ? 600 : 500,
                background: period === '7D' ? '#fff' : 'transparent',
                color: period === '7D' ? '#1e293b' : '#64748b',
                border: 'none', borderRadius: '6px', cursor: 'pointer',
                boxShadow: period === '7D' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              최근 7일
            </button>
            <button
              onClick={() => setPeriod('30D')}
              style={{
                padding: '6px 12px', fontSize: '12px', fontWeight: period === '30D' ? 600 : 500,
                background: period === '30D' ? '#fff' : 'transparent',
                color: period === '30D' ? '#1e293b' : '#64748b',
                border: 'none', borderRadius: '6px', cursor: 'pointer',
                boxShadow: period === '30D' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
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
              }}
            >
              직접 입력
            </button>
          </div>
        </div>
      </div>

      {/* 내부 차트 영역: 로딩 시 흐려짐 */}
      <div style={{ marginTop: '20px', marginBottom: '12px', opacity: loading ? 0.3 : 1, transition: 'opacity 0.3s' }}>
        <div style={{ position: 'relative', height: '110px' }}>
          
          <svg 
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }} 
            viewBox={`0 0 ${trend.length * 100} 100`} 
            preserveAspectRatio="none"
          >
            <polyline
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeLinejoin="round"
              points={trend.map((d, i) => {
                const x = (i + 0.5) * 100;
                const y = 100 - (d.inquiries / maxValue) * 100;
                return `${x},${y}`;
              }).join(' ')}
            />
          </svg>

          <div style={{ display: 'flex', width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
            {trend.map((d, i) => {
              const repPct = (d.reports / maxValue) * 100;
              const inqPct = (d.inquiries / maxValue) * 100;
              const isOverlap = Math.abs(repPct - inqPct) < 15;
              
              const isCompact = trend.length > 14;
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
          {trend.map((d, i) => {
            const isCompact = trend.length > 14;
            let showLabel = true;
            if (isCompact) {
              // 라벨이 너무 촘촘해지면 간격을 두고 보여줌 
              const intervalDays = Math.ceil(trend.length / 6);
              showLabel = (i % intervalDays === 0) || i === trend.length - 1;
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
