import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';        // 🔥 axios → api

function CommunityMyRecruitList() {
    const navigate = useNavigate();
    const loginUserId = localStorage.getItem('userId');

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    /* =========================
       내가 참여한 모집 글 조회
    ========================= */
    const fetchMyRecruits = async () => {
        if (!loginUserId) return;

        try {
            const res = await api.get(                 // 🔥 변경
                '/user/community/recruit/my',
                { params: { userId: loginUserId } }
            );
            setPosts(res.data);
        } catch (e) {
            alert('모집 글 목록 조회에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    /* =========================
       참여 취소
    ========================= */
    const handleCancel = async (postId) => {
        if (!window.confirm('해당 모집 참여를 취소하시겠습니까?')) return;

        try {
            await api.delete(`/user/community/${postId}/join`, {   // 🔥 변경
                data: { userId: loginUserId }
            });

            alert('참여가 취소되었습니다.');
            fetchMyRecruits();
        } catch (e) {
            alert(e.response?.data || '참여 취소에 실패했습니다.');
        }
    };

    useEffect(() => {
        fetchMyRecruits();
    }, []);

    if (loading) return <div>로딩 중...</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
            <button
                className="community-action-btn"
                onClick={() => navigate(-1)}
                style={{ marginBottom: '12px' }}
            >
                전체 목록
            </button>
            <h2>내가 참여한 모집 글</h2>

            {posts.length === 0 && (
                <p style={{ color: '#888', marginTop: '20px' }}>
                    참여한 모집 글이 없습니다.
                </p>
            )}

            {posts.map((post) => {
                /* =========================
                   🔥 모집 상태 (백엔드 기준)
                ========================= */
                const isRecruitClosed = post.recruitStatus === '모집종료';

                return (
                    <div
                        key={post.postId}
                        style={{
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            padding: '15px',
                            marginTop: '15px',
                            background: '#fff',
                        }}
                    >
                        <h4
                            style={{ cursor: 'pointer' }}
                            onClick={() => navigate(`/community/${post.postId}`)}
                        >
                            {post.title}
                        </h4>

                        <div style={{ fontSize: '13px', color: '#666' }}>
                            운동 종목: {post.sportType} ·
                            모집 인원: {post.recruitMax}명 ·
                            종료일: {post.recruitEndDate}
                        </div>

                        <div style={{ marginTop: '10px' }}>
                            <span
                                style={{
                                    fontWeight: 'bold',
                                    color: isRecruitClosed ? '#d32f2f' : '#388e3c',
                                }}
                            >
                                {post.recruitStatus}
                            </span>
                        </div>

                        <button
                            onClick={() => handleCancel(post.postId)}
                            style={{
                                marginTop: '10px',
                                padding: '6px 12px',
                                background: '#eee',
                                border: '1px solid #ccc',
                                borderRadius: '6px',
                                cursor: 'pointer',
                            }}
                        >
                            참여 취소
                        </button>
                    </div>
                );
            })}
        </div>
    );
}

export default CommunityMyRecruitList;
