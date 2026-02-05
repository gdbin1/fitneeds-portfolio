import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import './BranchSearchModal.css';


const BranchSearchModal = ({ isOpen, onClose, branches }) => {
    const [selectedCity, setSelectedCity] = useState('');     // 대분류 (서울/경기)
    const [selectedDistrict, setSelectedDistrict] = useState(''); // 중분류 (마포/수원)

    const generateRegionTree = (branchList) => {
        const tree = {};

        branchList.forEach(branch => {
            // '서울특별시 마포구 합정동...' -> ['서울특별시', '마포구', '합정동']
            const parts = branch.addr.split(' ');
            const city = parts[0];    // 서울특별시
            const district = parts[1]; // 마포구

            if (!city || !district) return;

            if (!tree[city]) {
                tree[city] = new Set();
            }
            tree[city].add(district);
        });



        // Set을 Array로 변환하여 반환
        const result = {};
        for (const city in tree) {
            result[city] = Array.from(tree[city]);
        }
        return result; // { "서울특별시": ["마포구", "강남구"], "경기도": ["수원시", "화성시"] }
    };

    // 1. 주소 데이터를 기반으로 지역 목록 동적 생성
    const regionTree = useMemo(() => generateRegionTree(branches), [branches]);
    const cities = Object.keys(regionTree);

    // 2. 선택된 지역에 따른 지점 필터링
    const displayedBranches = branches.filter(branch => {
        const matchCity = selectedCity ? branch.addr.startsWith(selectedCity) : true;
        const matchDistrict = selectedDistrict ? branch.addr.includes(selectedDistrict) : true;
        return matchCity && matchDistrict;
    });

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="branch-modal-content">
                <div className="modal-header">
                    <h2>지점 찾기</h2>
                    <button className="close-x" onClick={onClose}>&times;</button>
                </div>

                <div className="region-selector">
                    {/* 시/도 선택 */}
                    <div className="selector-group">
                        <h4>지역(시/도)</h4>
                        <div className="filter-chips">
                            {cities.map(city => (
                                <button
                                    key={city}
                                    className={`chip ${selectedCity === city ? 'active' : ''}`}
                                    onClick={() => { setSelectedCity(city); setSelectedDistrict(''); }}
                                >
                                    {city}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 시/군/구 선택 (시/도가 선택된 경우만 노출) */}
                    {selectedCity && (
                        <div className="selector-group">
                            <h4>세부 지역</h4>
                            <div className="filter-chips">
                                {regionTree[selectedCity].map(dist => (
                                    <button
                                        key={dist}
                                        className={`chip ${selectedDistrict === dist ? 'active' : ''}`}
                                        onClick={() => setSelectedDistrict(dist)}
                                    >
                                        {dist}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-branch-list">
                    <h4>검색 결과 ({displayedBranches.length})</h4>
                    <div className="modal-grid">
                        {displayedBranches.map(branch => (
                            <Link
                                key={branch.brchId}
                                to={`/schedule-list?type=branch&brchId=${branch.brchId}&name=${encodeURIComponent(branch.brchNm)}`}
                                onClick={onClose}
                                className="modal-branch-item"
                            >
                                <strong>{branch.brchNm}</strong>
                                <span>{branch.addr}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BranchSearchModal;