import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format, subMonths } from 'date-fns'
import { paymentApi, branchApi, userApi } from '../../api'

function SinglePayments() {
  const { branchId: urlBranchId } = useParams()
  const navigate = useNavigate()
  const [branches, setBranches] = useState([])
  const [selectedBranchId, setSelectedBranchId] = useState(urlBranchId ? Number(urlBranchId) : null)
  const [selectedBranch, setSelectedBranch] = useState(null)
  const [payments, setPayments] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState(format(subMonths(new Date(), 1), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    loadBranches()
    loadUsers()
  }, [])

  useEffect(() => {
    if (selectedBranchId) {
      loadPayments()
    }
  }, [selectedBranchId, startDate, endDate])

  const loadBranches = async () => {
    try {
      const response = await branchApi.getAll()
      const branchList = response.data || []
      setBranches(branchList)
      if (urlBranchId) {
        const branch = branchList.find(b => b.branchId === Number(urlBranchId))
        if (branch) {
          setSelectedBranchId(Number(urlBranchId))
          setSelectedBranch(branch)
        } else if (branchList.length > 0) {
          setSelectedBranchId(branchList[0].branchId)
          setSelectedBranch(branchList[0])
        }
      } else if (branchList.length > 0) {
        setSelectedBranchId(branchList[0].branchId)
        setSelectedBranch(branchList[0])
      }
    } catch (error) {
      console.error('Failed to load branches:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const response = await userApi.getAll()
      setUsers(response.data || [])
    } catch (error) {
      console.error('Failed to load users:', error)
      setUsers([])
    }
  }

  const loadPayments = async () => {
    if (!selectedBranchId) return
    setLoading(true)
    try {
      const response = await paymentApi.getAll()
      const allPayments = response.data || []
      // 날짜 필터링
      const filtered = allPayments.filter(p => {
        const regDate = p.regDt ? new Date(p.regDt) : null
        if (!regDate) return false
        const start = new Date(startDate)
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        return regDate >= start && regDate <= end
      })
      setPayments(filtered)
    } catch (error) {
      console.error('Failed to load payments:', error)
      setPayments([])
    } finally {
      setLoading(false)
    }
  }

  const handleBranchChange = (e) => {
    const branchId = Number(e.target.value)
    const branch = branches.find(b => b.branchId === branchId)
    setSelectedBranchId(branchId)
    setSelectedBranch(branch)
    navigate(`/centers/${branchId}/single-payments`, { replace: true })
  }

  const handleViewDetail = (payment) => {
    setSelectedPayment(payment)
    setShowDetailModal(true)
  }

  const getUserName = (userId) => {
    const user = users.find(u => (u.userId || u.USER_ID) === userId)
    return user ? (user.userName || user.USER_NAME) : userId
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED': return { bg: '#d4edda', color: '#155724', text: '완료' }
      case 'PENDING': return { bg: '#fff3cd', color: '#856404', text: '대기' }
      case 'CANCELLED': return { bg: '#f8d7da', color: '#721c24', text: '취소' }
      case 'FAILED': return { bg: '#f8d7da', color: '#721c24', text: '실패' }
      default: return { bg: '#e9ecef', color: '#495057', text: status }
    }
  }

  const getPaymentTypeLabel = (payTypeCd) => {
    switch (payTypeCd) {
      case 'PASS_PRODUCT': return '이용권 상품'
      case 'SINGLE': return '단건 결제'
      case 'TRADE': return '거래 결제'
      default: return payTypeCd
    }
  }

  const getPaymentMethodLabel = (payMethod) => {
    switch (payMethod) {
      case 'CARD': return '카드'
      case 'CASH': return '현금'
      case 'TRANSFER': return '계좌이체'
      default: return payMethod
    }
  }

  const filteredPayments = filterStatus === 'all' 
    ? payments 
    : payments.filter(p => p.sttsCd === filterStatus)

  const getTotalAmount = () => {
    return filteredPayments
      .filter(p => p.sttsCd === 'COMPLETED')
      .reduce((sum, p) => sum + Number(p.payAmt || 0), 0)
  }

  if (loading && branches.length === 0) {
    return (
      <div className="p-4" style={{ background: '#f8f9fa', minHeight: 'calc(100vh - 80px)' }}>
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '4px solid #f3f3f3', 
            borderTopColor: '#667eea', 
            borderRadius: '50%', 
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ marginTop: '16px', color: '#666', fontSize: '16px' }}>데이터를 불러오는 중... ⏳</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4" style={{ background: '#f8f9fa', minHeight: 'calc(100vh - 80px)' }}>
      {/* 헤더 */}
      <div style={{ 
        marginBottom: '24px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        padding: '24px',
        color: '#fff',
        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '32px' }}>💳</span>
            결제 정보
          </h1>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
            {selectedBranch?.branchName || '지점을 선택해주세요'} - 결제 ID 기준 결제 정보 조회
          </p>
        </div>
      </div>

      {/* 지점 선택 */}
      <div className="content-box" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '16px', fontWeight: '600', color: '#333', minWidth: '80px' }}>
            🏢 지점:
          </label>
          <select
            value={selectedBranchId || ''}
            onChange={handleBranchChange}
            style={{
              padding: '12px 20px',
              fontSize: '16px',
              border: '2px solid #e0e0e0',
              borderRadius: '12px',
              minWidth: '250px',
              backgroundColor: '#fff',
              cursor: 'pointer'
            }}
          >
            {branches.map(branch => (
              <option key={branch.branchId} value={branch.branchId}>
                {branch.branchName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 통계 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <div className="content-box" style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>💳</div>
          <h3 style={{ marginBottom: '5px' }}>{filteredPayments.length}</h3>
          <p style={{ fontSize: '14px', color: '#666' }}>총 결제 건수</p>
        </div>
        <div className="content-box" style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>💰</div>
          <h3 style={{ marginBottom: '5px' }}>{getTotalAmount().toLocaleString()}원</h3>
          <p style={{ fontSize: '14px', color: '#666' }}>총 결제 금액</p>
        </div>
        <div className="content-box" style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>✅</div>
          <h3 style={{ marginBottom: '5px' }}>{payments.filter(p => p.sttsCd === 'COMPLETED').length}</h3>
          <p style={{ fontSize: '14px', color: '#666' }}>정상 결제</p>
        </div>
        <div className="content-box" style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>❌</div>
          <h3 style={{ marginBottom: '5px' }}>{payments.filter(p => p.sttsCd === 'CANCELLED').length}</h3>
          <p style={{ fontSize: '14px', color: '#666' }}>취소/환불</p>
        </div>
      </div>

      {/* 필터 */}
      <div className="content-box" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>시작일</label>
            <input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>종료일</label>
            <input 
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>상태</label>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="all">전체</option>
              <option value="COMPLETED">완료</option>
              <option value="PENDING">대기</option>
              <option value="CANCELLED">취소</option>
              <option value="FAILED">실패</option>
            </select>
          </div>
          <button className="btn-primary" onClick={loadPayments} style={{ alignSelf: 'flex-end' }}>
            조회
          </button>
        </div>
      </div>

      {/* 결제 내역 테이블 */}
      <div className="content-box">
        <h2 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: '600' }}>결제 내역</h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              border: '3px solid #ddd', 
              borderTopColor: '#3498db', 
              borderRadius: '50%', 
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto'
            }}></div>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💳</div>
            <h3>결제 내역이 없습니다</h3>
            <p>선택한 기간에 결제 내역이 없습니다.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr>
                  <th style={{ padding: '16px 12px', textAlign: 'center', fontWeight: '700', color: '#fff', backgroundColor: '#667eea' }}>결제ID</th>
                  <th style={{ padding: '16px 12px', textAlign: 'center', fontWeight: '700', color: '#fff', backgroundColor: '#667eea' }}>결제일</th>
                  <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: '700', color: '#fff', backgroundColor: '#667eea' }}>주문번호</th>
                  <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: '700', color: '#fff', backgroundColor: '#667eea' }}>회원</th>
                  <th style={{ padding: '16px 12px', textAlign: 'center', fontWeight: '700', color: '#fff', backgroundColor: '#667eea' }}>결제유형</th>
                  <th style={{ padding: '16px 12px', textAlign: 'right', fontWeight: '700', color: '#fff', backgroundColor: '#667eea' }}>결제금액</th>
                  <th style={{ padding: '16px 12px', textAlign: 'center', fontWeight: '700', color: '#fff', backgroundColor: '#667eea' }}>결제방법</th>
                  <th style={{ padding: '16px 12px', textAlign: 'center', fontWeight: '700', color: '#fff', backgroundColor: '#667eea' }}>상태</th>
                  <th style={{ padding: '16px 12px', textAlign: 'center', fontWeight: '700', color: '#fff', backgroundColor: '#667eea' }}>상세</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment, index) => {
                  const statusBadge = getStatusBadge(payment.sttsCd)
                  return (
                    <tr 
                      key={payment.payId}
                      style={{ 
                        borderBottom: '1px solid #f0f0f0',
                        backgroundColor: index % 2 === 0 ? '#fff' : '#fafafa'
                      }}
                    >
                      <td style={{ padding: '16px 12px', textAlign: 'center', fontWeight: '600' }}>
                        {payment.payId}
                      </td>
                      <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                        {payment.regDt ? format(new Date(payment.regDt), 'yyyy-MM-dd HH:mm') : '-'}
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <strong>{payment.orderNo || '-'}</strong>
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        {getUserName(payment.usrId)}
                      </td>
                      <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                        {getPaymentTypeLabel(payment.payTypeCd)}
                      </td>
                      <td style={{ padding: '16px 12px', textAlign: 'right', fontWeight: '600' }}>
                        {Number(payment.payAmt || 0).toLocaleString()}원
                      </td>
                      <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                        {getPaymentMethodLabel(payment.payMethod)}
                      </td>
                      <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                        <span style={{ 
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: statusBadge.bg,
                          color: statusBadge.color
                        }}>
                          {statusBadge.text}
                        </span>
                      </td>
                      <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleViewDetail(payment)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#667eea',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          상세보기
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 결제 상세 모달 */}
      {showDetailModal && selectedPayment && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '24px',
            borderRadius: '12px',
            minWidth: '500px',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>결제 상세 정보</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <strong>결제 ID:</strong>
                <span>{selectedPayment.payId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <strong>주문번호:</strong>
                <span>{selectedPayment.orderNo || '-'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <strong>회원 ID:</strong>
                <span>{selectedPayment.usrId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <strong>회원명:</strong>
                <span>{getUserName(selectedPayment.usrId)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <strong>결제 유형:</strong>
                <span>{getPaymentTypeLabel(selectedPayment.payTypeCd)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <strong>참조 ID:</strong>
                <span>{selectedPayment.refId || '-'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <strong>결제 금액:</strong>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#667eea' }}>
                  {Number(selectedPayment.payAmt || 0).toLocaleString()}원
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <strong>결제 방법:</strong>
                <span>{getPaymentMethodLabel(selectedPayment.payMethod)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <strong>상태:</strong>
                <span style={{ 
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  backgroundColor: getStatusBadge(selectedPayment.sttsCd).bg,
                  color: getStatusBadge(selectedPayment.sttsCd).color
                }}>
                  {getStatusBadge(selectedPayment.sttsCd).text}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <strong>결제일시:</strong>
                <span>{selectedPayment.regDt ? format(new Date(selectedPayment.regDt), 'yyyy-MM-dd HH:mm:ss') : '-'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <strong>PG 주문번호:</strong>
                <span>{selectedPayment.pgOrderNo || '-'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                onClick={() => {
                  setShowDetailModal(false)
                  setSelectedPayment(null)
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6c757d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .content-box {
          background: #fff;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .btn-primary {
          padding: 10px 20px;
          background-color: #667eea;
          color: #fff;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
        }
        .btn-primary:hover {
          background-color: #5568d3;
        }
      `}</style>
    </div>
  )
}

export default SinglePayments
