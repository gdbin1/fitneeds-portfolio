import React, { useState, useEffect, useMemo } from 'react';
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

    const [branchList, setBranchList] = useState([]);
    const [editingUserId, setEditingUserId] = useState(null);

    const ROLE_OPTIONS = ['ADMIN', 'USER', 'TEACHER', 'MANAGER'];

    /* ===============================
       Derived Data
    =============================== */
    const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE);

    const currentItems = filteredList.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const getBranchName = (branchId) =>
        branchList.find(b => b.id === branchId)?.name || '-';

    /* ===============================
       Lifecycle
    =============================== */
    useEffect(() => {
        fetchUserList();
        fetchBranches();
    }, []);

    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(1);
    }, [filteredList, totalPages]);

    /* ===============================
       API
    =============================== */
    const fetchUserList = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/all');
            setUserList(response.data);
            setFilteredList(response.data); // ⭐ 초기에는 전체
        } catch {
            alert('데이터를 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const fetchBranches = async () => {
        const response = await api.get('/admin/branchCode', {
            headers: { Accept: 'application/xml' }
        });

        const parser = new DOMParser();
        const xml = parser.parseFromString(response.data, 'text/xml');

        const items = Array.from(xml.getElementsByTagName('item')).map(item => ({
            id: Number(item.getElementsByTagName('brchId')[0].textContent),
            name: item.getElementsByTagName('brchNm')[0].textContent
        }));
        setBranchList(items);
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
            await api.post('/admin/updateUserIsActive', {
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

    const handleBranchChange = async (userId, newBranchId) => {
        const prevBranchId = userList.find(u => u.userId === userId)?.brchId;

        // optimistic update
        setUserList(prev =>
            prev.map(user =>
                user.userId === userId
                    ? { ...user, brchId: Number(newBranchId) }
                    : user
            )
        );
        setFilteredList(prev =>
            prev.map(user =>
                user.userId === userId
                    ? { ...user, brchId: Number(newBranchId) }
                    : user
            )
        );

        try {
            await api.post('/admin/updateUserBranch', {
                userId,
                brchId: Number(newBranchId)
            });
        } catch {
            // 정확한 롤백
            setUserList(prev =>
                prev.map(user =>
                    user.userId === userId
                        ? { ...user, brchId: prevBranchId }
                        : user
                )
            );
            setFilteredList(prev =>
                prev.map(user =>
                    user.userId === userId
                        ? { ...user, brchId: prevBranchId }
                        : user
                )
            );
            alert('지점 변경에 실패했습니다.');
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        // 0️⃣ 이전 role 백업 (정확 롤백용)
        const prevRole = userList.find(u => u.userId === userId)?.role;

        // 1️⃣ UI 즉시 반영 (Optimistic UI)
        setUserList(prev =>
            prev.map(user =>
                user.userId === userId
                    ? { ...user, role: newRole }
                    : user
            )
        );

        setFilteredList(prev =>
            prev.map(user =>
                user.userId === userId
                    ? { ...user, role: newRole }
                    : user
            )
        );

        try {
            // 2️⃣ 서버 반영 (조용히)
            await api.post('/admin/updateUserRole', {
                userId,
                role: newRole
            });
        } catch (error) {
            // 3️⃣ 실패 시 이전 role로 정확 롤백
            setUserList(prev =>
                prev.map(user =>
                    user.userId === userId
                        ? { ...user, role: prevRole }
                        : user
                )
            );

            setFilteredList(prev =>
                prev.map(user =>
                    user.userId === userId
                        ? { ...user, role: prevRole }
                        : user
                )
            );

            alert('권한 변경에 실패했습니다.');
        }
    };

    /* ===============================
       Render
    =============================== */
    return (
        <div className="container" style={{ padding: '20px' }}>
            <h1>[관리자] 관리자 관리</h1>

            <div className="content-box"
                style={{
                    background: '#fff',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>

                {/* 검색 영역 */}
                <div style={{
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
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        textAlign: 'center',
                        fontSize: '14px'
                    }}>
                        <thead style={{
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
                                <th>권한</th>
                                <th>지점</th>
                                <th>동의날짜</th>
                                <th>활성</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ padding: '40px' }}>
                                        조회된 회원이 없습니다.
                                    </td>
                                </tr>
                            ) : currentItems.map(user => (
                                <tr key={user.userId} style={{ borderBottom: '1px solid #eee', height: '50px' }}>
                                    <td>{user.userName}</td>
                                    <td>{user.email}</td>
                                    <td>{user.phoneNumber}</td>

                                    <td style={{ cursor: 'pointer' }} onClick={() => setEditingUserId(`role-${user.userId}`)}>
                                        {editingUserId === `role-${user.userId}` ? (
                                            <select
                                                value={user.role}
                                                onChange={e => {
                                                    handleRoleChange(user.userId, e.target.value);
                                                    setEditingUserId(null);
                                                }}
                                                autoFocus
                                            >
                                                {ROLE_OPTIONS.map(r => (
                                                    <option key={r} value={r}>{r}</option>
                                                ))}
                                            </select>
                                        ) : user.role}
                                    </td>

                                    <td style={{ cursor: 'pointer' }} onClick={() => setEditingUserId(user.userId)}>
                                        {editingUserId === user.userId ? (
                                            <select
                                                value={user.brchId ?? ''}
                                                onChange={e =>
                                                    handleBranchChange(user.userId, e.target.value)
                                                }
                                                onBlur={() => setEditingUserId(null)}
                                                autoFocus
                                            >
                                                {branchList.map(b => (
                                                    <option key={b.id} value={b.id}>{b.name}</option>
                                                ))}
                                            </select>
                                        ) : getBranchName(user.brchId)}
                                    </td>

                                    <td>{user.agreeAt}</td>

                                    <td style={{ cursor: 'pointer' }}>
                                        <input style={{ cursor: 'pointer' }}
                                            type="checkbox"
                                            checked={user.isActive}
                                            onChange={e => handleIsActiveChange(e, user.userId)}
                                        />
                                    </td>
                                </tr>
                            ))}
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
