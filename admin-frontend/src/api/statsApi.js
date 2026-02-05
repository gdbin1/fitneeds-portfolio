// src/api/statsApi.js
import api from './index';

const statsApi = {
    // 이용권 사용 현황 분석
    getPassUsageAnalysis: (params) => {
        return api.get('/stats/pass-usage/analysis', { params });
    },

    // 양도 거래 시장 분석
    getMarketSummary: (params) => {
        return api.get('/stats/market/summary', { params });
    }
};

export default statsApi;
