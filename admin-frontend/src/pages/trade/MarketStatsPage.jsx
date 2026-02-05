import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import statsApi from '../../api/statsApi';

const MarketStatsPage = () => {
    const [data, setData] = useState([]);
    const today = new Date();
    const [dates, setDates] = useState({ 
        startDate: new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
    });

    // 기간 설정 함수
    const setPeriod = (type) => {
        const end = new Date();
        let start = new Date();
        
        switch(type) {
            case 'week':
                start.setDate(end.getDate() - 7);
                break;
            case 'month':
                start.setMonth(end.getMonth() - 1);
                break;
            case 'year':
                start.setFullYear(end.getFullYear() - 1);
                break;
            default:
                return;
        }
        
        setDates({
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0]
        });
    };

    // API 호출: MarketStatsController의 /summary 엔드포인트 사용
    useEffect(() => {
        const loadStats = async () => {
            try {
                const res = await statsApi.getMarketSummary({
                    startDate: dates.startDate,
                    endDate: dates.endDate
                });
                setData(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error('통계 로드 실패:', err);
                setData([]);
            }
        };
        loadStats();
    }, [dates]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <div style={{ padding: '20px' }}>
            <h2>📊 양도 거래 시장 분석</h2>
            
            {/* 기간 선택 필터 */}
            <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <label style={{ fontWeight: 'bold', marginRight: '10px' }}>조회 기간:</label>
                    <button 
                        onClick={() => setPeriod('week')}
                        style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: 'white', cursor: 'pointer' }}
                    >
                        최근 1주일
                    </button>
                    <button 
                        onClick={() => setPeriod('month')}
                        style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: 'white', cursor: 'pointer' }}
                    >
                        최근 1개월
                    </button>
                    <button 
                        onClick={() => setPeriod('year')}
                        style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: 'white', cursor: 'pointer' }}
                    >
                        최근 1년
                    </button>
                    <span style={{ margin: '0 10px' }}>|</span>
                    <input
                        type="date"
                        value={dates.startDate}
                        onChange={(e) => setDates(prev => ({ ...prev, startDate: e.target.value }))}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                    <span>~</span>
                    <input
                        type="date"
                        value={dates.endDate}
                        onChange={(e) => setDates(prev => ({ ...prev, endDate: e.target.value }))}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                </div>
            </div>
            
            {data.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    데이터를 불러오는 중이거나 통계 데이터가 없습니다.
                </div>
            ) : (
                <>
                    {/* 1. 종목별 게시글 대비 거래 완료 건수 (Bar Chart) */}
                    <div style={{ width: '100%', height: '400px', marginBottom: '50px' }}>
                        <h3>종목별 거래 활성도 (게시글 vs 완료)</h3>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="sportName" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="totalPostCount" fill="#8884d8" name="총 게시글" />
                                <Bar dataKey="completedTradeCount" fill="#82ca9d" name="거래 완료" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* 2. 종목별 거래 성공률 (Pie Chart) */}
                    <div style={{ width: '100%', height: '400px' }}>
                        <h3>종목별 거래 성공률 (%)</h3>
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Pie
                                    data={data}
                                    dataKey="successRate"
                                    nameKey="sportName"
                                    cx="50%" cy="50%"
                                    outerRadius={120}
                                    label={(entry) => `${entry.sportName}: ${entry.successRate}%`}
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </>
            )}
        </div>
    );
};

export default MarketStatsPage;