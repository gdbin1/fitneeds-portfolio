import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { branchApi } from '../../api'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

function BranchInfo() {
  const { branchId } = useParams()
  const navigate = useNavigate()
  const [branches, setBranches] = useState([])
  const [branch, setBranch] = useState(null)
  const [branchFormData, setBranchFormData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [inquiryMessage, setInquiryMessage] = useState(null)
  const [inquiryType, setInquiryType] = useState('info') // 'info', 'warning', 'error', 'success'

  useEffect(() => {
    loadBranches()
    if (branchId) {
      loadData()
    }
  }, [branchId])

  const loadBranches = async () => {
    try {
      const response = await branchApi.getAll()
      setBranches(response.data || [])
      // branchId가 없으면 첫 번째 지점으로 설정
      if (!branchId && response.data && response.data.length > 0) {
        navigate(`/branches/${response.data[0].branchId}/info`, { replace: true })
      }
    } catch (error) {
      console.error('Failed to load branches:', error)
    }
  }

  const loadData = async () => {
    try {
      const response = await branchApi.getById(branchId)
      const branchData = response.data
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
    } catch (error) {
      console.error('Failed to load branch data:', error)
      setInquiryMessage('지점 정보를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.')
      setInquiryType('warning')
      setTimeout(() => setInquiryMessage(null), 5000)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setBranchFormData(prev => {
      // 지점 상태에 따라 운영 상태 자동 변경
      if (name === 'status') {
        if (value === 'CLOSED_PERM') {
          // 폐점 -> 종료 완료
          return { ...prev, [name]: value, operationStatus: 'TERMINATED' }
        } else if (value === 'OPERATING') {
          // 운영 -> 운영 중
          return { ...prev, [name]: value, operationStatus: 'RUNNING' }
        } else if (value === 'CLOSED_TEMP') {
          // 휴점 -> 준비 중
          return { ...prev, [name]: value, operationStatus: 'PREPARING' }
        }
      }
      return { ...prev, [name]: value }
    })
  }

  const handleSave = async () => {
    if (!branchFormData.branchName || !branchFormData.roadAddress || !branchFormData.phone) {
      setInquiryMessage('지점명, 주소, 전화번호는 필수 입력 항목입니다.')
      setInquiryType('warning')
      setTimeout(() => setInquiryMessage(null), 5000)
      return
    }

    setSaving(true)
    try {
      // 지점등록번호 포함하여 업데이트
      const updateData = { ...branchFormData }
      
      // 지점 상태에 따라 운영 상태가 자동으로 설정되었는지 확인
      // 만약 설정되지 않았다면 여기서 설정
      if (updateData.status === 'CLOSED_PERM' && updateData.operationStatus !== 'TERMINATED') {
        updateData.operationStatus = 'TERMINATED'
      } else if (updateData.status === 'OPERATING' && updateData.operationStatus !== 'RUNNING') {
        updateData.operationStatus = 'RUNNING'
      } else if (updateData.status === 'CLOSED_TEMP' && updateData.operationStatus !== 'PREPARING') {
        updateData.operationStatus = 'PREPARING'
      }
      
      console.log('Updating branch with data:', updateData)
      await branchApi.update(branchId, updateData)
      setInquiryMessage('지점 정보가 수정되었습니다.')
      setInquiryType('success')
      setTimeout(() => setInquiryMessage(null), 3000)
      setEditing(false)
      loadData()
      loadBranches()
    } catch (error) {
      console.error('Failed to update branch:', error)
      const errorMessage = error.response?.data?.message || error.message || '수정에 실패했습니다.'
      setInquiryMessage(`문의 사항: ${errorMessage}`)
      setInquiryType('error')
      setTimeout(() => setInquiryMessage(null), 5000)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`정말로 "${branchFormData.branchName}" 지점을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
      return
    }

    setDeleting(true)
    try {
      await branchApi.delete(branchId)
      setInquiryMessage('지점이 삭제되었습니다.')
      setInquiryType('success')
      setTimeout(() => {
        navigate('/branches')
      }, 2000)
    } catch (error) {
      console.error('Failed to delete branch:', error)
      const errorMessage = error.response?.data?.message || error.message || '삭제에 실패했습니다.'
      setInquiryMessage(`문의 사항: ${errorMessage}`)
      setInquiryType('error')
      setTimeout(() => setInquiryMessage(null), 5000)
    } finally {
      setDeleting(false)
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
          <button className="btn-primary" onClick={() => navigate('/branches')} style={{ marginTop: '20px' }}>
            목록으로
          </button>
        </div>
      </div>
    )
  }

  const today = format(new Date(), 'yyyy년 MM월 dd일 (EEEE)', { locale: ko })
  const currentBranchName = branch?.branchName || 
    (branchId ? branches.find(b => String(b.branchId) === String(branchId))?.branchName : null)

  return (
    <div className="p-4">
      {/* 문의 사항 알림 */}
      {inquiryMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          padding: '16px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          maxWidth: '400px',
          animation: 'slideIn 0.3s ease-out',
          background: inquiryType === 'success' ? '#d4edda' : 
                     inquiryType === 'error' ? '#f8d7da' : 
                     inquiryType === 'warning' ? '#fff3cd' : '#d1ecf1',
          border: `1px solid ${
            inquiryType === 'success' ? '#c3e6cb' : 
            inquiryType === 'error' ? '#f5c6cb' : 
            inquiryType === 'warning' ? '#ffeaa7' : '#bee5eb'
          }`,
          color: inquiryType === 'success' ? '#155724' : 
                 inquiryType === 'error' ? '#721c24' : 
                 inquiryType === 'warning' ? '#856404' : '#0c5460',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontWeight: '600', 
              marginBottom: '4px',
              fontSize: '14px'
            }}>
              {inquiryType === 'success' ? '✓ 성공' : 
               inquiryType === 'error' ? '⚠ 문의 사항' : 
               inquiryType === 'warning' ? '⚠ 안내' : 'ℹ 안내'}
            </div>
            <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
              {inquiryMessage}
            </div>
          </div>
          <button
            onClick={() => setInquiryMessage(null)}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: 'inherit',
              opacity: 0.7,
              padding: '0',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: '1'
            }}
            onMouseEnter={(e) => e.target.style.opacity = '1'}
            onMouseLeave={(e) => e.target.style.opacity = '0.7'}
          >
            ×
          </button>
        </div>
      )}
      
      {/* 헤더: 날짜와 제목, 컨트롤을 한 줄로 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '2px solid #e0e0e0'
      }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ 
            margin: '0 0 8px 0',
            fontSize: '28px',
            fontWeight: '700',
            color: '#1a237e'
          }}>
            {currentBranchName ? `${currentBranchName} 지점 등록 정보` : '지점 등록 정보'}
          </h1>
          <p style={{ 
            color: '#666', 
            margin: '0',
            fontSize: '14px'
          }}>
            지점의 기본 정보를 관리합니다
          </p>
        </div>
        
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '12px'
        }}>
          {/* 오늘 날짜 */}
          <div style={{ 
            padding: '10px 18px', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#fff',
            fontWeight: '600',
            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
            whiteSpace: 'nowrap'
          }}>
            📅 {today}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* 지점 선택 드롭다운 */}
            <select
              value={branchId || ''}
              onChange={(e) => {
                if (e.target.value) {
                  navigate(`/branches/${e.target.value}/info`)
                }
              }}
              style={{
                padding: '10px 16px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                background: '#fff',
                cursor: 'pointer',
                minWidth: '160px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#667eea'
                e.target.style.boxShadow = '0 2px 6px rgba(102, 126, 234, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#ddd'
                e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              {branches.length === 0 ? (
                <option value="">지점을 불러오는 중...</option>
              ) : (
                branches.map(b => (
                  <option key={b.branchId} value={b.branchId}>
                    {b.branchName}
                  </option>
                ))
              )}
            </select>
            
            {/* 액션 버튼들 */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="btn-sm" 
                onClick={() => navigate('/branches')}
                style={{ 
                  background: '#6c757d', 
                  color: '#fff',
                  padding: '10px 18px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#5a6268'
                  e.target.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#6c757d'
                  e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                목록으로
              </button>
              {!editing ? (
                <>
                  <button 
                    className="btn-primary" 
                    onClick={() => setEditing(true)}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.2s',
                      boxShadow: '0 2px 6px rgba(40, 167, 69, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-1px)'
                      e.target.style.boxShadow = '0 4px 8px rgba(40, 167, 69, 0.4)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)'
                      e.target.style.boxShadow = '0 2px 6px rgba(40, 167, 69, 0.3)'
                    }}
                  >
                    수정하기
                  </button>
                  <button 
                    className="btn-sm" 
                    onClick={handleDelete}
                    disabled={deleting}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: deleting ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.2s',
                      background: deleting ? '#95a5a6' : '#dc3545',
                      color: '#fff',
                      boxShadow: deleting ? 'none' : '0 2px 6px rgba(220, 53, 69, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      if (!deleting) {
                        e.target.style.transform = 'translateY(-1px)'
                        e.target.style.boxShadow = '0 4px 8px rgba(220, 53, 69, 0.4)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!deleting) {
                        e.target.style.transform = 'translateY(0)'
                        e.target.style.boxShadow = '0 2px 6px rgba(220, 53, 69, 0.3)'
                      }
                    }}
                  >
                    {deleting ? '삭제 중...' : '삭제하기'}
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className="btn-sm" 
                    onClick={() => {
                      setEditing(false)
                      loadData()
                    }}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '6px',
                      border: '1px solid #ddd',
                      background: '#fff',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#f8f9fa'
                      e.target.style.borderColor = '#999'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#fff'
                      e.target.style.borderColor = '#ddd'
                    }}
                  >
                    취소
                  </button>
                  <button 
                    className="btn-primary" 
                    onClick={handleSave} 
                    disabled={saving}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.2s',
                      background: saving ? '#95a5a6' : '#28a745',
                      color: '#fff',
                      boxShadow: saving ? 'none' : '0 2px 6px rgba(40, 167, 69, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      if (!saving) {
                        e.target.style.transform = 'translateY(-1px)'
                        e.target.style.boxShadow = '0 4px 8px rgba(40, 167, 69, 0.4)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!saving) {
                        e.target.style.transform = 'translateY(0)'
                        e.target.style.boxShadow = '0 2px 6px rgba(40, 167, 69, 0.3)'
                      }
                    }}
                  >
                    {saving ? '저장 중...' : '저장하기'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 지점 등록 정보 폼 */}
      {branchFormData && (
        <div className="content-box" style={{ background: '#fff' }}>
          <h2 style={{ 
            marginBottom: '20px', 
            paddingBottom: '10px', 
            borderBottom: '2px solid #ddd',
            fontSize: '20px',
            fontWeight: '600',
            color: '#1a237e'
          }}>
            지점 등록 정보
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                지점등록번호
              </label>
              {editing ? (
                <input
                  type="text"
                  className="form-input"
                  name="branchRegNo"
                  value={branchFormData.branchRegNo || ''}
                  onChange={handleChange}
                  placeholder={`예: BR-${new Date().getFullYear()}-01`}
                  style={{ marginBottom: '4px' }}
                />
              ) : (
                <div style={{ 
                  padding: '10px', 
                  background: '#f8f9fa', 
                  borderRadius: '4px',
                  color: '#333',
                  fontWeight: '500'
                }}>
                  {branchFormData.branchRegNo || '-'}
                </div>
              )}
              <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                {editing ? '지점등록번호를 수정할 수 있습니다.' : '지점등록번호를 수정하려면 수정하기 버튼을 클릭하세요.'}
              </small>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                지점명 <span style={{ color: 'red' }}>*</span>
              </label>
              {editing ? (
                <input
                  type="text"
                  className="form-input"
                  name="branchName"
                  value={branchFormData.branchName || ''}
                  onChange={handleChange}
                  required
                />
              ) : (
                <div style={{ 
                  padding: '10px', 
                  background: '#f8f9fa', 
                  borderRadius: '4px',
                  color: '#333',
                  fontWeight: '500'
                }}>
                  {branchFormData.branchName || '-'}
                </div>
              )}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                도로명 주소 <span style={{ color: 'red' }}>*</span>
              </label>
              {editing ? (
                <input
                  type="text"
                  className="form-input"
                  name="roadAddress"
                  value={branchFormData.roadAddress || ''}
                  onChange={handleChange}
                  required
                />
              ) : (
                <div style={{ 
                  padding: '10px', 
                  background: '#f8f9fa', 
                  borderRadius: '4px',
                  color: '#333',
                  fontWeight: '500'
                }}>
                  {branchFormData.roadAddress || '-'}
                </div>
              )}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                상세 주소
              </label>
              {editing ? (
                <input
                  type="text"
                  className="form-input"
                  name="detailAddress"
                  value={branchFormData.detailAddress || ''}
                  onChange={handleChange}
                />
              ) : (
                <div style={{ 
                  padding: '10px', 
                  background: '#f8f9fa', 
                  borderRadius: '4px',
                  color: '#333',
                  fontWeight: '500'
                }}>
                  {branchFormData.detailAddress || '-'}
                </div>
              )}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                우편번호
              </label>
              {editing ? (
                <input
                  type="text"
                  className="form-input"
                  name="postalCode"
                  value={branchFormData.postalCode || ''}
                  onChange={handleChange}
                />
              ) : (
                <div style={{ 
                  padding: '10px', 
                  background: '#f8f9fa', 
                  borderRadius: '4px',
                  color: '#333',
                  fontWeight: '500'
                }}>
                  {branchFormData.postalCode || '-'}
                </div>
              )}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                전화번호 <span style={{ color: 'red' }}>*</span>
              </label>
              {editing ? (
                <input
                  type="text"
                  className="form-input"
                  name="phone"
                  value={branchFormData.phone || ''}
                  onChange={handleChange}
                  required
                />
              ) : (
                <div style={{ 
                  padding: '10px', 
                  background: '#f8f9fa', 
                  borderRadius: '4px',
                  color: '#333',
                  fontWeight: '500'
                }}>
                  {branchFormData.phone || '-'}
                </div>
              )}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                담당자명
              </label>
              {editing ? (
                <input
                  type="text"
                  className="form-input"
                  name="managerName"
                  value={branchFormData.managerName || ''}
                  onChange={handleChange}
                />
              ) : (
                <div style={{ 
                  padding: '10px', 
                  background: '#f8f9fa', 
                  borderRadius: '4px',
                  color: '#333',
                  fontWeight: '500'
                }}>
                  {branchFormData.managerName || '-'}
                </div>
              )}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                담당자 연락처
              </label>
              {editing ? (
                <input
                  type="text"
                  className="form-input"
                  name="managerPhone"
                  value={branchFormData.managerPhone || ''}
                  onChange={handleChange}
                />
              ) : (
                <div style={{ 
                  padding: '10px', 
                  background: '#f8f9fa', 
                  borderRadius: '4px',
                  color: '#333',
                  fontWeight: '500'
                }}>
                  {branchFormData.managerPhone || '-'}
                </div>
              )}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                담당자 이메일
              </label>
              {editing ? (
                <input
                  type="email"
                  className="form-input"
                  name="managerEmail"
                  value={branchFormData.managerEmail || ''}
                  onChange={handleChange}
                />
              ) : (
                <div style={{ 
                  padding: '10px', 
                  background: '#f8f9fa', 
                  borderRadius: '4px',
                  color: '#333',
                  fontWeight: '500'
                }}>
                  {branchFormData.managerEmail || '-'}
                </div>
              )}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                지점 설명
              </label>
              {editing ? (
                <textarea
                  className="form-textarea"
                  name="branchDesc"
                  value={branchFormData.branchDesc || ''}
                  onChange={handleChange}
                  style={{ minHeight: '100px', padding: '20px' }}
                />
              ) : (
                <div style={{ 
                  padding: '10px', 
                  background: '#f8f9fa', 
                  borderRadius: '4px',
                  color: '#333',
                  fontWeight: '500',
                  minHeight: '100px',
                  whiteSpace: 'pre-wrap'
                }}>
                  {branchFormData.branchDesc || '-'}
                </div>
              )}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                지점 상태
              </label>
              {editing ? (
                <select
                  className="form-select"
                  name="status"
                  value={branchFormData.status || 'OPERATING'}
                  onChange={handleChange}
                >
                  <option value="OPERATING">운영</option>
                  <option value="CLOSED_TEMP">휴점</option>
                  <option value="CLOSED_PERM">폐점</option>
                </select>
              ) : (
                <div style={{ 
                  padding: '10px', 
                  background: '#f8f9fa', 
                  borderRadius: '4px',
                  color: '#333',
                  fontWeight: '500'
                }}>
                  {getStatusLabel(branchFormData.status)}
                </div>
              )}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                운영 상태
              </label>
              {editing ? (
                <select
                  className="form-select"
                  name="operationStatus"
                  value={branchFormData.operationStatus || 'PREPARING'}
                  onChange={handleChange}
                >
                  <option value="RUNNING">운영 중</option>
                  <option value="PREPARING">준비 중</option>
                  <option value="TERMINATED">종료 완료</option>
                </select>
              ) : (
                <div style={{ 
                  padding: '10px', 
                  background: '#f8f9fa', 
                  borderRadius: '4px',
                  color: '#333',
                  fontWeight: '500'
                }}>
                  {getOperationLabel(branchFormData.operationStatus)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

function getStatusLabel(status) {
  switch (status) {
    case 'OPERATING': return '운영'
    case 'CLOSED_TEMP': return '휴점'
    case 'CLOSED_PERM': return '폐점'
    default: return status
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

export default BranchInfo

