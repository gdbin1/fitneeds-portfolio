// PassTradeDetail.jsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import './PassTradeDetail.css';


import fitnessPass from '../../assets/passes/pass-fitness.png';
import swimPass from '../../assets/passes/pass-swim.png';
import yogaPass from '../../assets/passes/pass-yoga.png';
import pilatesPass from '../../assets/passes/pass-pilates.png';
import jujitsuPass from '../../assets/passes/pass-jujitsu.png';

const passImageMap = {
  헬스: fitnessPass,
  수영: swimPass,
  요가: yogaPass,
  필라테스: pilatesPass,
  주짓수: jujitsuPass,
};

function PassTradeDetail({ post, onClose, onOpenBuy }) {
  const loginUserId = useSelector((state) => state.auth.userId);
  const isMyPost = post.sellerId === loginUserId;

 

  const sellerDisplayName =
    post.sellerName ?? post.sellerId?.slice(0, 3) + '***';

  const passImage = passImageMap[post.sportNm];

  const unitPrice =
    post.sellCount > 0
      ? Math.floor(post.saleAmount / post.sellCount)
      : 0;

  return (
    <>
      {/* ✅ 상세 모달 backdrop (원래대로 고정) */}
      {/* <div className="detail-modal-backdrop"> */}
      <div className="detail-modal-content">

        {/* ===== 헤더 (이미지 + 제목) ===== */}
        <div className="detail-header">
          {passImage && (
            <img
              src={passImage}
              alt={post.sportNm}
              className="detail-pass-image"
            />
          )}

          <div className="detail-header-text">
            <h3 className="detail-title">이용권 거래 상세</h3>
            <p className="detail-pass-name">
              {post.passName ?? post.title}
            </p>
          </div>
        </div>

        {/* ===== 기본 정보 ===== */}
        <div className="detail-row">
          <strong>종목</strong>
          <span>{post.sportNm ?? '-'}</span>
        </div>

        <div className="detail-row">
          <strong>판매자</strong>
          <span>{sellerDisplayName}</span>
        </div>

        <div className="detail-row">
          <strong>1장당 가격</strong>
          <span>{unitPrice.toLocaleString()}원</span>
        </div>

        {/* ===== 거래 정보 ===== */}
        <div className="detail-row">
          <strong>판매 수량</strong>
          <span>{post.sellCount}</span>
        </div>

        <div className="detail-row amount">
          <strong>총 금액</strong>
          <span>{post.saleAmount?.toLocaleString()}원</span>
        </div>

        {/* ===== 판매 사유 ===== */}
        <div className="detail-row reason">
          <strong>판매 사유</strong>
          <span>{post.content ?? '-'}</span>
        </div>

        {/* ===== 버튼 ===== */}
        <div className="modal-actions">
          <button className="btn-outline" onClick={onClose}>
            닫기
          </button>

          {!isMyPost ? (
            <button
              className="btn btn-primary"
              onClick={onOpenBuy}
            >
              구매하기
            </button>

          ) : (
            <button className="btn btn-secondary" disabled>
              내가 등록한 게시물입니다
            </button>
          )}
        </div>
      </div>
     

      
     
    </>
  );
}

export default PassTradeDetail;
