import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import statsApi from '../../api/statsApi';

const PassUsageStatsPage = () => {
    const [stats, setStats] = useState({ statusStats: [], logStats: [] });
    const [dates, setDates] = useState({ startDate: '2026-01-01', endDate: '2026-12-31' });

    // API 호출: PassUsageStatsController의 /analysis 엔드포인트 사용
    useEffect(() => {
        const loadStats = async () => {
            try {
                const res = await statsApi.getPassUsageAnalysis({
                    startDate: dates.startDate,
                    endDate: dates.endDate
                });
                setStats(res.data || { statusStats: [], logStats: [] });
            } catch (err) {
                console.error('통계 로드 실패:', err);
                setStats({ statusStats: [], logStats: [] });
            }
        };
        loadStats();
    }, [dates]);

    const COLORS = ['#0088FE', '#FF8042', '#FFBB28', '#FF0000'];

    return (
        <div style={{ padding: '20px' }}>
            <h2>🎫 이용권 사용 현황 분석</h2>

            {(!stats.statusStats || stats.statusStats.length === 0) && (!stats.logStats || stats.logStats.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    데이터를 불러오는 중이거나 통계 데이터가 없습니다.
                </div>
            ) : (
                <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px' }}>
                    {/* 1. 이용권 상태 분포 (Pie Chart) */}
                    <div style={{ width: '45%', minWidth: '400px', height: '400px' }}>
                        <h3>현재 이용권 상태 분포</h3>
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Pie
                                    data={stats.statusStats || []}
                                    dataKey="userCount"
                                    nameKey="statusCd"
                                    cx="50%" cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    label
                                >
                                    {(stats.statusStats || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* 2. 변동 사유별 로그 통계 (Bar Chart) */}
                    <div style={{ width: '45%', minWidth: '400px', height: '400px' }}>
                        <h3>이용권 변동 사유 분석 (기간 내)</h3>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={stats.logStats || []} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="chgTypeCd" type="category" />
                                <Tooltip />
                                <Bar dataKey="totalChgCnt" fill="#FFBB28" name="총 변동 횟수" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PassUsageStatsPage;