import React, { useState, useEffect } from 'react';
import api from '../../api';

function AdminMemberPage() {
    /* ===============================
       State
    =============================== */
    const [userList, setUserList] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const [searchName, setSearchName] = useState('');

    const ITEMS_PER_PAGE = 8;

    /* ===============================
       Derived Data (파생 데이터)
    =============================== */
    const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE);

    const currentItems = filteredList.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    /* ===============================
       Lifecycle
    =============================== */
    useEffect(() => {
        fetchUserList();
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [currentPage]);

    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(1);
    }, [filteredList, totalPages]);

    /* ===============================
       API
    =============================== */
    const fetchUserList = async () => {
        setLoading(true);
        try {
            const response = await api.get('/user/all');
            setUserList(response.data); // 전체 리스트
            setFilteredList(response.data); // ⭐ 초기에는 전체
        } catch (error) {
            alert('데이터를 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    };

    /* ===============================
       Event Handlers
    =============================== */
    const handleSearch = () => {
        setCurrentPage(1);
        if (!searchName.trim()) {
            setFilteredList(userList);
            return;
        }

        const result = userList.filter(user =>
            user.userName?.includes(searchName)
        );

        setFilteredList(result);
    };

    const handleIsActiveChange = async (e, userId) => {
        const newIsActive = e.target.checked;

        setUserList(prev =>
            prev.map(user =>
                user.userId === userId
                    ? { ...user, isActive: newIsActive }
                    : user
            )
        );

        setFilteredList(prev =>
            prev.map(user =>
                user.userId === userId
                    ? { ...user, isActive: newIsActive }
                    : user
            )
        );

        try {
            // 2️⃣ 서버 반영 (조용히)
            await api.post('/user/updateUserIsActive', {
                userId,
                isActive: newIsActive
            });
        } catch (error) {
            // 3️⃣ 실패 시 롤백
            setUserList(prev =>
                prev.map(user =>
                    user.userId === userId
                        ? { ...user, isActive: !newIsActive }
                        : user
                )
            );
            setFilteredList(prev =>
                prev.map(user =>
                    user.userId === userId
                        ? { ...user, isActive: !newIsActive }
                        : user
                )
            );

            alert('사용자 활성 상태 변경에 실패했습니다.');
        }
    };

    /* ===============================
       Render
    =============================== */
    return (
        <div className="container" style={{ padding: '20px' }}>
            <h1>[관리자] 회원 관리</h1>

            <div
                className="content-box"
                style={{
                    background: '#fff',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
            >
                {/* 검색 영역 */}
                <div
                    style={{
                        marginBottom: '20px',
                        padding: '15px',
                        background: '#f8f9fa',
                        borderRadius: '5px',
                        display: 'flex',
                        gap: '20px',
                        justifyContent: 'flex-end'
                    }}>
                    <input
                        type="text"
                        placeholder="이름 검색"
                        value={searchName}
                        onChange={e => setSearchName(e.target.value)}
                        style={{ padding: '6px' }}
                    />
                    <button
                        onClick={handleSearch}
                        style={{
                            padding: '8px 16px',
                            background: '#2c3e50',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        조회하기
                    </button>
                </div>

                {/* 테이블 */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        데이터를 불러오는 중입니다...
                    </div>
                ) : (
                    <table
                        style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            textAlign: 'center',
                            fontSize: '14px'
                        }}
                    >
                        <thead
                            style={{
                                background: '#ecf0f1',
                                borderBottom: '2px solid #bdc3c7',
                                color: '#2c3e50',
                                height: '40px'
                            }}
                        >
                            <tr>
                                <th>이름</th>
                                <th>이메일</th>
                                <th>전화번호</th>
                                <th>동의날짜</th>
                                <th>활성</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '40px', color: '#7f8c8d' }}>
                                        조회된 회원이 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map(user => (
                                    <tr
                                        key={user.userId}
                                        style={{ borderBottom: '1px solid #eee', height: '50px' }}
                                    >
                                        <td>{user.userName}</td>
                                        <td>{user.email}</td>
                                        <td>{user.phoneNumber}</td>
                                        <td>{user.agreeAt}</td>
                                        <td style={{ cursor: 'pointer' }}>
                                            <input style={{ cursor: 'pointer' }}
                                                type="checkbox"
                                                checked={user.isActive}
                                                onChange={e =>
                                                    handleIsActiveChange(e, user.userId)
                                                }
                                            />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                >
                    이전
                </button>

                {Array.from({ length: totalPages }, (_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        style={{
                            margin: '0 4px',
                            fontWeight: currentPage === i + 1 ? 'bold' : 'normal'
                        }}
                    >
                        {i + 1}
                    </button>
                ))}

                <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                >
                    다음
                </button>
            </div>
        </div>
    );
}

export default AdminMemberPage;