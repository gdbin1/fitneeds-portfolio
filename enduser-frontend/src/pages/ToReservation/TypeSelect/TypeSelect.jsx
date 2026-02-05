import React, { useEffect, useState } from 'react';
import api from '../../../api';
import { Link, useLocation } from 'react-router-dom';
import './TypeSelect.css';
import BranchSearchModal from '../BranchSearchModal/BranchSearchModal';


const TypeSelect = () => {
    const [sports, setSports] = useState([]);
    const [sportLoading, setSportLoading] = useState(true);
    const [sportError, setSportError] = useState(null);

    const [branches, setBranches] = useState([]);
    const [filteredBranches, setFilteredBranches] = useState([]);
    const [branchloading, setBranchLoading] = useState(true);
    const [branchError, setBranchError] = useState(null);

    // --- 모달 상태 관리 ---
    const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);

    const location = useLocation();

    // 종목 데이터 호출
    useEffect(() => {
        const fetchSports = async () => {
            try {
                const response = await api.get('/sporttypes/getAllSportTypesForR');
                setSports(response.data.data);
            } catch (err) {
                setSportError('스포츠 종목 데이터를 불러오는 데 실패 했습니다.');
                console.error('Error fetching sport data:', err);
            } finally {
                setSportLoading(false);
            }
        }

        fetchSports();
    }, [])

    // 지점 데이터 호출
    useEffect(() => {
        const fetchBranchs = async () => {
            try {
                const response = await api.get('/branches/getAllBranchesForR');
                setBranches(response.data.data);
                setFilteredBranches(response.data.data.slice(0, 4)); // 가장 앞의 4개의 데이터만 저장
            } catch (err) {
                setBranchError('지점 데이터를 불러오는 데 실패 했습니다.');
                console.error('Error fetching branch data:', err);
            } finally {
                setBranchLoading(false);
            }
        }

        fetchBranchs();
    }, [])

    return (
        <div className='type-select-container'>
            <div className='type-section'>
                <p className='section-title'>지점별 예약</p>
                <div className="branch-selection-area">
                    {branchloading ? (
                        <div>지점 데이터를 불러오는 중 입니다.</div>
                    ) : (
                        branchError ? (
                            <div>{branchError}</div>
                        ) : (
                            branches.length === 0 ? (
                                <div>등록된 지점이 없습니다.</div>
                            ) : (
                                filteredBranches.map(branch => (
                                    <div key={branch.brchId} className="branch-item-wrapper">
                                        <Link
                                            className='branch-link-item'
                                            to={`/schedule-list?type=branch&brchId=${branch.brchId}&name=${encodeURIComponent(branch.brchNm)}`}
                                        >
                                            <p className="branch-name-text">{branch.brchNm}</p>
                                        </Link>
                                    </div>
                                ))
                            )
                        )
                    )}
                </div>
                <p 
                    className='info-text more' 
                    onClick={() => setIsBranchModalOpen(true)}
                >
                    더보기
                </p>
            </div>

            <div className='type-section'>
                <p className='section-title'>종목별 예약</p>
                {sportLoading ? (<div>스포츠 종목 데이터를 불러오는 중 입니다.</div>) :
                    sportError ? (<div>{sportError}</div>) : (
                        sports.length === 0 ? (
                            <div>등록된 종목이 없습니다.</div>
                        ) : (
                            <div className="sport-selection-area"> {/* 종목 목록을 감쌀 새로운 div */}
                                {sports.map(sport => (
                                    <div key={sport.sportId} className="sport-item-wrapper"> {/* 각 종목 링크를 감싸는 div */}
                                        <Link
                                            className='sport-link-item' // 새로운 클래스명으로 변경
                                            to={`/schedule-list?type=sport&sportId=${sport.sportId}&name=${encodeURIComponent(sport.sportNm)}`}
                                        >
                                            <p className="sport-name-text">{sport.sportNm}</p> {/* p 태그에도 클래스 부여 */}
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )

                    )
                }

            </div>

            {/* --- 지점 검색 모달 추가 --- */}
            <BranchSearchModal 
                isOpen={isBranchModalOpen} 
                onClose={() => setIsBranchModalOpen(false)} 
                branches={branches} // 전체 지점 데이터를 전달
            />
        </div>
    );
};

export default TypeSelect;