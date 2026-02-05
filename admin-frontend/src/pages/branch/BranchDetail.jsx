import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { branchApi, centerInfoApi } from '../../api'

function BranchDetail() {
  const { branchId } = useParams()
  const navigate = useNavigate()
  const [branch, setBranch] = useState(null)
  const [centerInfo, setCenterInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showBranchEdit, setShowBranchEdit] = useState(false)
  const [branchFormData, setBranchFormData] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [branchId])

  const loadData = async () => {
    try {
      // 지점 정보와 센터 정보를 병렬로 로드
      const [branchRes, centerRes] = await Promise.allSettled([
        branchApi.getById(branchId),
        centerInfoApi.getByBranch(branchId).catch(() => ({ data: null }))
      ])
      
      // 지점 정보 처리
      if (branchRes.status === 'fulfilled') {
        const branchData = branchRes.value.data
        setBranch(branchData)
        setBranchFormData({
          branchRegNo: branchData.branchRegNo || '',
          branchName: branchData.branchName || '',
          branchDesc: branchData.branchDesc || '',
          roadAddress: branchData.roadAddress || '',
          detailAddress: branchData.detailAddress || '',
          postalCode: branchData.postalCode || '',
          phone: branchData.phone || '',
          managerName: branchData.managerName || '',
          managerPhone: branchData.managerPhone || '',
          managerEmail: branchData.managerEmail || '',
          status: branchData.status || 'OPERATING',
          operationStatus: branchData.operationStatus || 'PREPARING'
        })
      } else {
        console.error('Failed to load branch:', branchRes.reason)
        const error = branchRes.reason
        if (error.response?.status === 500) {
          console.error('백엔드 서버 오류:', error.response?.data)
          const errorData = error.response?.data || {}
          const errorType = errorData.error || 'UnknownError'
          const errorMessage = errorData.message || error.message || '알 수 없는 오류'
          const hint = errorData.hint || ''
          const cause = errorData.cause || ''
          
          let alertMessage = `지점 정보를 불러오는데 실패했습니다.\n\n`
          alertMessage += `오류 유형: ${errorType}\n`
          alertMessage += `오류 메시지: ${errorMessage}\n`
          if (cause) {
            alertMessage += `\n상세: ${cause}\n`
          }
          if (hint) {
            alertMessage += `\n${hint}\n`
          } else {
            alertMessage += `\n데이터베이스 스키마를 적용했는지 확인하세요.\n백엔드 서버를 재시작했는지 확인하세요.`
          }
          
          alert(alertMessage)
        } else if (error.response?.status === 404) {
          alert('요청한 지점을 찾을 수 없습니다.')
          navigate('/branches')
        } else {
          alert(`지점 정보를 불러오는데 실패했습니다.\n\n${error.message || '알 수 없는 오류'}`)
          navigate('/branches')
        }
        return
      }
      
      // 센터 정보 처리 (없어도 계속 진행)
      if (centerRes.status === 'fulfilled' && centerRes.value?.data) {
        setCenterInfo(centerRes.value.data)
      } else {
        console.log('센터 정보가 없습니다. 센터 정보 페이지에서 등록할 수 있습니다.')
      }
    } catch (error) {
      console.error('Failed to load data:', error)
      alert('데이터를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (status) => {
    if (!window.confirm(`지점 상태를 ${getStatusLabel(status)}(으)로 변경하시겠습니까?`)) {
      return
    }

    try {
      if (status === 'CLOSED_PERM') {
        await branchApi.update(branchId, { ...branch, status, operationStatus: 'TERMINATED' })
      } else {
        await branchApi.updateStatus(branchId, status)
      }
      loadData()
    } catch (error) {
      console.error('Failed to update status:', error)
      alert('상태 변경에 실패했습니다.')
    }
  }

  const handleBranchUpdate = async () => {
    if (!branchFormData.branchName || !branchFormData.roadAddress || !branchFormData.phone) {
      alert('지점명, 주소, 전화번호는 필수 입력 항목입니다.')
      return
    }

    setSaving(true)
    try {
      await branchApi.update(branchId, branchFormData)
      alert('지점 정보가 수정되었습니다.')
      setShowBranchEdit(false)
      loadData()
    } catch (error) {
      console.error('Failed to update branch:', error)
      const errorMessage = error.response?.data?.message || error.message || '수정에 실패했습니다.'
      alert(`수정에 실패했습니다.\n\n${errorMessage}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4">
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
      </div>
    )
  }

  if (!branch) {
    return (
      <div className="p-4">
        <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>
          <h3>지점을 찾을 수 없습니다.</h3>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1>{branch.branchRegNo ? `[${branch.branchRegNo}] ` : ''}{branch.branchName}</h1>
          <p style={{ color: '#666', marginTop: '4px' }}>{branch.roadAddress}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-sm" onClick={() => navigate('/branches')}>
            목록으로
          </button>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px',
        marginBottom: '20px'
      }}>
        <div 
          className="content-box" 
          style={{ cursor: 'pointer', textAlign: 'center', padding: '20px' }}
          onClick={() => navigate(`/centers/${branchId}`)}
        >
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>ℹ️</div>
          <h3 style={{ marginBottom: '5px' }}>센터 정보</h3>
          <p style={{ fontSize: '14px', color: '#666' }}>운영 정보 관리</p>
        </div>
        <div 
          className="content-box" 
          style={{ cursor: 'pointer', textAlign: 'center', padding: '20px' }}
          onClick={() => navigate(`/centers/${branchId}/categories`)}
        >
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>🏷️</div>
          <h3 style={{ marginBottom: '5px' }}>운동 종목</h3>
          <p style={{ fontSize: '14px', color: '#666' }}>종목 설정</p>
        </div>
        <div 
          className="content-box" 
          style={{ cursor: 'pointer', textAlign: 'center', padding: '20px' }}
          onClick={() => navigate(`/centers/${branchId}/schedules`)}
        >
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>📅</div>
          <h3 style={{ marginBottom: '5px' }}>스케줄</h3>
          <p style={{ fontSize: '14px', color: '#666' }}>수업 스케줄 관리</p>
        </div>
        <div 
          className="content-box" 
          style={{ cursor: 'pointer', textAlign: 'center', padding: '20px' }}
          onClick={() => navigate(`/centers/${branchId}/membership-payments`)}
        >
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>💳</div>
          <h3 style={{ marginBottom: '5px' }}>결제 관리</h3>
          <p style={{ fontSize: '14px', color: '#666' }}>결제 내역 조회</p>
        </div>
      </div>

      {/* 지점 등록 정보 수정 폼 */}
      {showBranchEdit && branchFormData && (
        <div className="content-box" style={{ marginBottom: '20px', background: '#fff', border: '2px solid #3498db' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ paddingBottom: '10px', borderBottom: '2px solid #ddd', flex: 1 }}>
              지점 등록 정보 수정
            </h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="btn-sm" 
                onClick={() => {
                  setShowBranchEdit(false)
                  loadData() // 원래 데이터로 복원
                }}
                disabled={saving}
              >
                취소
              </button>
              <button 
                className="btn-primary btn-sm" 
                onClick={handleBranchUpdate}
                disabled={saving}
              >
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                지점등록번호
              </label>
              <input
                type="text"
                className="form-input"
                value={branchFormData.branchRegNo || ''}
                onChange={(e) => setBranchFormData({ ...branchFormData, branchRegNo: e.target.value })}
                placeholder={`BR-${new Date().getFullYear()}-01`}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                지점명 <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                className="form-input"
                value={branchFormData.branchName || ''}
                onChange={(e) => setBranchFormData({ ...branchFormData, branchName: e.target.value })}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                도로명 주소 <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                className="form-input"
                value={branchFormData.roadAddress || ''}
                onChange={(e) => setBranchFormData({ ...branchFormData, roadAddress: e.target.value })}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                상세 주소
              </label>
              <input
                type="text"
                className="form-input"
                value={branchFormData.detailAddress || ''}
                onChange={(e) => setBranchFormData({ ...branchFormData, detailAddress: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                우편번호
              </label>
              <input
                type="text"
                className="form-input"
                value={branchFormData.postalCode || ''}
                onChange={(e) => setBranchFormData({ ...branchFormData, postalCode: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                전화번호 <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                className="form-input"
                value={branchFormData.phone || ''}
                onChange={(e) => setBranchFormData({ ...branchFormData, phone: e.target.value })}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                담당자명
              </label>
              <input
                type="text"
                className="form-input"
                value={branchFormData.managerName || ''}
                onChange={(e) => setBranchFormData({ ...branchFormData, managerName: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                담당자 연락처
              </label>
              <input
                type="text"
                className="form-input"
                value={branchFormData.managerPhone || ''}
                onChange={(e) => setBranchFormData({ ...branchFormData, managerPhone: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                담당자 이메일
              </label>
              <input
                type="email"
                className="form-input"
                value={branchFormData.managerEmail || ''}
                onChange={(e) => setBranchFormData({ ...branchFormData, managerEmail: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                지점 설명
              </label>
              <textarea
                className="form-input"
                value={branchFormData.branchDesc || ''}
                onChange={(e) => setBranchFormData({ ...branchFormData, branchDesc: e.target.value })}
                style={{ minHeight: '80px', padding: '10px' }}
              />
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        <div className="content-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ paddingBottom: '10px', borderBottom: '2px solid #ddd', flex: 1 }}>기본 정보</h2>
            <button 
              className="btn-sm" 
              onClick={() => setShowBranchEdit(!showBranchEdit)}
            >
              {showBranchEdit ? '취소' : '수정'}
            </button>
          </div>
          {!showBranchEdit && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <DetailItem label="지점등록번호" value={branch.branchRegNo || '-'} />
              <DetailItem label="지점명" value={branch.branchName} />
              <DetailItem label="도로명 주소" value={branch.roadAddress} />
              <DetailItem label="상세 주소" value={branch.detailAddress || '-'} />
              <DetailItem label="우편번호" value={branch.postalCode || '-'} />
              <DetailItem label="전화번호" value={branch.phone || '-'} />
              <DetailItem label="지점 설명" value={branch.branchDesc || '-'} />
              <DetailItem label="등록일" value={formatDate(branch.createdAt)} />
            </div>
          )}
        </div>

        <div className="content-box">
          <h2 style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '2px solid #ddd' }}>담당자 정보</h2>
          {!showBranchEdit && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <DetailItem label="담당자명" value={branch.managerName || '-'} />
              <DetailItem label="연락처" value={branch.managerPhone || '-'} />
              <DetailItem label="이메일" value={branch.managerEmail || '-'} />
            </div>
          )}
        </div>

        <div className="content-box">
          <h2 style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '2px solid #ddd' }}>운영 상태</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #eee' }}>
              <span style={{ fontSize: '14px', color: '#666' }}>지점 상태</span>
              <span className={`badge ${getStatusBadge(branch.status)}`}>
                {getStatusLabel(branch.status)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
              <span style={{ fontSize: '14px', color: '#666' }}>운영 여부</span>
              <span className={`badge ${getOperationBadge(branch.operationStatus)}`}>
                {getOperationLabel(branch.operationStatus)}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              className="btn-sm"
              disabled={branch.status === 'OPERATING'}
              onClick={() => handleStatusChange('OPERATING')}
            >
              운영으로 변경
            </button>
            <button 
              className="btn-sm"
              disabled={branch.status === 'CLOSED_TEMP'}
              onClick={() => handleStatusChange('CLOSED_TEMP')}
            >
              휴점으로 변경
            </button>
            <button 
              className="btn-del btn-sm"
              disabled={branch.status === 'CLOSED_PERM'}
              onClick={() => handleStatusChange('CLOSED_PERM')}
            >
              폐점으로 변경
            </button>
          </div>
        </div>

        {/* 센터 정보 섹션 추가 */}
        <div className="content-box" style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ paddingBottom: '10px', borderBottom: '2px solid #ddd', flex: 1 }}>센터 운영 정보</h2>
            <button 
              className="btn-sm"
              onClick={() => navigate(`/centers/${branchId}`)}
            >
              상세 보기
            </button>
          </div>
          {centerInfo ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <div>
                <h3 style={{ fontSize: '16px', marginBottom: '12px', color: '#333' }}>운영 시간</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <DetailItem 
                    label="운영 시간" 
                    value={formatTime(centerInfo.openTime || centerInfo.open_time) + ' ~ ' + formatTime(centerInfo.closeTime || centerInfo.close_time)} 
                  />
                  {(centerInfo.breakStartTime || centerInfo.break_start_time) && (
                    <DetailItem 
                      label="휴게 시간" 
                      value={formatTime(centerInfo.breakStartTime || centerInfo.break_start_time) + ' ~ ' + formatTime(centerInfo.breakEndTime || centerInfo.break_end_time)} 
                    />
                  )}
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: '16px', marginBottom: '12px', color: '#333' }}>휴무일 정보</h3>
                <p style={{ color: '#666', lineHeight: '1.6', fontSize: '14px' }}>
                  {centerInfo.holidayInfo || centerInfo.holiday_info || '설정된 휴무일 정보가 없습니다.'}
                </p>
              </div>
              <div>
                <h3 style={{ fontSize: '16px', marginBottom: '12px', color: '#333' }}>운영 정책</h3>
                <p style={{ color: '#666', lineHeight: '1.6', fontSize: '14px', whiteSpace: 'pre-wrap' }}>
                  {centerInfo.policyInfo || centerInfo.policy_info || '설정된 운영 정책이 없습니다.'}
                </p>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
              <p style={{ marginBottom: '16px' }}>센터 정보가 등록되지 않았습니다.</p>
              <button 
                className="btn-primary"
                onClick={() => navigate(`/centers/${branchId}`)}
              >
                센터 정보 등록하기
              </button>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

function DetailItem({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #eee' }}>
      <span style={{ fontSize: '14px', color: '#666' }}>{label}</span>
      <span style={{ fontSize: '14px', color: '#333', fontWeight: '500' }}>{value}</span>
    </div>
  )
}

function getStatusBadge(status) {
  switch (status) {
    case 'OPERATING': return 'badge-success'
    case 'CLOSED_TEMP': return 'badge-warning'
    case 'CLOSED_PERM': return 'badge-error'
    default: return 'badge-gray'
  }
}

function getStatusLabel(status) {
  switch (status) {
    case 'OPERATING': return '운영'
    case 'CLOSED_TEMP': return '휴점'
    case 'CLOSED_PERM': return '폐점'
    default: return status
  }
}

function getOperationBadge(op) {
  switch (op) {
    case 'RUNNING': return 'badge-success'
    case 'PREPARING': return 'badge-warning'
    case 'TERMINATED': return 'badge-gray'
    default: return 'badge-gray'
  }
}

function getOperationLabel(op) {
  switch (op) {
    case 'RUNNING': return '운영 중'
    case 'PREPARING': return '준비 중'
    case 'TERMINATED': return '종료 완료'
    default: return op
  }
}

function formatDate(dateString) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('ko-KR')
}

function formatTime(timeString) {
  if (!timeString) return '-'
  // "06:00:00" 형식에서 "06:00" 형식으로 변환
  if (typeof timeString === 'string') {
    return timeString.substring(0, 5)
  }
  return timeString
}

export default BranchDetail

