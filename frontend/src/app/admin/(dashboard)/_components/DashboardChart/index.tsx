import { useState, useEffect } from 'react';
import type { DashboardTrendItem } from '@/types/admin-dashboard';
import { fetchDashboardTrend } from '../../_api/fetchDashboardData';
import s from '../DashboardPage/DashboardPage.module.css';

interface Props {
  initialTrend: DashboardTrendItem[];
}

type PeriodType = '7D' | '30D';

export default function DashboardChart({ initialTrend }: Props) {
  const [trend, setTrend] = useState<DashboardTrendItem[]>(initialTrend);
  const [period, setPeriod] = useState<PeriodType>('7D');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 7D는 초기 데이터와 동일하지만 일단 API로도 대응 가능
    if (period === '7D') {
      setTrend(initialTrend);
      return;
    }

    // 다른 기간 데이터 페칭
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const endDate = new Date();
        const startDate = new Date();
        
        if (period === '30D') {
          startDate.setDate(endDate.getDate() - 29);
        }

        const startStr = startDate.toISOString().split('T')[0];
        const endStr = endDate.toISOString().split('T')[0];
        
        const newTrend = await fetchDashboardTrend(startStr, endStr);
        if (!cancelled) setTrend(newTrend);
      } catch (err) {
        console.error('차트 데이터 로드 실패:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [period, initialTrend]);

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
              
              // 30일일 경우 텍스트 라벨이 너무 많아지므로 0보다 클 때만, 혹은 일정 간격으로만 텍스트 표시
              const showText = period === '7D' || (d.reports > 0 || d.inquiries > 0);

              return (
                <div key={i} style={{ flex: 1, position: 'relative' }}>
                  {d.reports > 0 && (
                    <>
                      <div className={s.bar} style={{ height: `${repPct}%`, width: period === '30D' ? '8px' : '24px' }} />
                      {showText && (
                        <div 
                          className={s.reportLineValue} 
                          style={{ 
                            bottom: `${repPct}%`,
                            transform: isOverlap ? 'translate(-120%, -10px)' : 'translate(-50%, -6px)',
                            fontSize: period === '30D' ? '9px' : '11px'
                          }}
                        >
                          {d.reports}
                        </div>
                      )}
                    </>
                  )}
                  {d.inquiries > 0 && (
                    <>
                      <div className={s.lineDot} style={{ bottom: `${inqPct}%`, left: '50%', width: period === '30D' ? '4px' : '8px', height: period === '30D' ? '4px' : '8px' }} />
                      {showText && (
                        <div 
                          className={s.lineValue} 
                          style={{ 
                            bottom: `${inqPct}%`, left: '50%',
                            transform: isOverlap ? 'translate(20%, -14px)' : 'translate(-50%, -14px)',
                            fontSize: period === '30D' ? '9px' : '11px'
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
            // 30일 뷰에서는 날짜 라벨을 5일에 한 번 꼴로 줄임 (가독성 목적)
            const showLabel = period === '7D' || (i % 5 === 0) || i === trend.length - 1;
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
