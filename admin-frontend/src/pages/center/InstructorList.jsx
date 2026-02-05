import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { instructorApi, branchApi } from '../../api'

function InstructorList() {
  const { branchId: urlBranchId } = useParams()
  const navigate = useNavigate()
  const [branches, setBranches] = useState([])
  const [selectedBranchId, setSelectedBranchId] = useState(urlBranchId ? Number(urlBranchId) : null)
  const [selectedBranch, setSelectedBranch] = useState(null)
  const [instructors, setInstructors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingInstructor, setEditingInstructor] = useState(null)
  const [formData, setFormData] = useState({
    instructorName: '',
    phone: '',
    email: '',
    specialty: '',
    intro: '',
    status: 'ACTIVE'
  })

  useEffect(() => {
    loadBranches()
  }, [])

  useEffect(() => {
    if (selectedBranchId) {
      loadInstructors()
    }
  }, [selectedBranchId])

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
      alert('지점 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const loadInstructors = async () => {
    if (!selectedBranchId) return
    
    try {
      setLoading(true)
      const [branchRes, instructorRes] = await Promise.all([
        branchApi.getById(selectedBranchId),
        instructorApi.getByBranch(selectedBranchId)
      ])
      setSelectedBranch(branchRes.data)
      setInstructors(instructorRes.data || [])
    } catch (error) {
      console.error('Failed to load data:', error)
      alert('강사 목록을 불러오는데 실패했습니다. 😢')
      setInstructors([])
    } finally {
      setLoading(false)
    }
  }

  const handleBranchChange = (e) => {
    const branchId = Number(e.target.value)
    const branch = branches.find(b => b.branchId === branchId)
    setSelectedBranchId(branchId)
    setSelectedBranch(branch)
    if (urlBranchId) {
      navigate(`/centers/${branchId}/instructors`, { replace: true })
    }
  }

  const handleOpenModal = (instructor = null) => {
    if (instructor) {
      setEditingInstructor(instructor)
      setFormData({
        instructorName: instructor.instructorName,
        phone: instructor.phone || '',
        email: instructor.email || '',
        specialty: instructor.specialty || '',
        intro: instructor.intro || '',
        status: instructor.status
      })
    } else {
      setEditingInstructor(null)
      setFormData({
        instructorName: '',
        phone: '',
        email: '',
        specialty: '',
        intro: '',
        status: 'ACTIVE'
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingInstructor(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (!formData.instructorName) {
      alert('강사명을 입력해주세요. ✏️')
      return
    }

    try {
      if (editingInstructor) {
        await instructorApi.update(selectedBranchId, editingInstructor.instructorId, formData)
        alert('강사 정보가 수정되었습니다! ✨')
      } else {
        await instructorApi.create(selectedBranchId, formData)
        alert('새 강사가 등록되었습니다! 🎉')
      }
      handleCloseModal()
      loadInstructors()
    } catch (error) {
      console.error('Failed to save:', error)
      alert('저장에 실패했습니다. 😢\n\n' + (error.response?.data?.message || error.message))
    }
  }

  const handleStatusChange = async (instructor, newStatus) => {
    try {
      await instructorApi.updateStatus(selectedBranchId, instructor.instructorId, newStatus)
      loadInstructors()
    } catch (error) {
      console.error('Failed to update status:', error)
      alert('상태 변경에 실패했습니다. 😢')
    }
  }

  const handleDelete = async (instructorId, instructorName) => {
    if (!window.confirm(`"${instructorName}" 강사를 삭제하시겠습니까? 🗑️\n\n관련 스케줄도 모두 삭제됩니다.`)) {
      return
    }

    try {
      await instructorApi.delete(selectedBranchId, instructorId)
      alert('강사가 삭제되었습니다. 🗑️')
      loadInstructors()
    } catch (error) {
      console.error('Failed to delete:', error)
      alert('삭제에 실패했습니다. 😢\n\n' + (error.response?.data?.message || error.message))
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'ACTIVE': return '활동 중'
      case 'INACTIVE': return '비활동'
      case 'LEAVE': return '휴직'
      default: return status
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return { bg: '#d4edda', color: '#155724' }
      case 'INACTIVE': return { bg: '#e9ecef', color: '#495057' }
      case 'LEAVE': return { bg: '#fff3cd', color: '#856404' }
      default: return { bg: '#e9ecef', color: '#495057' }
    }
  }

  if (loading && branches.length === 0) {
    return (
      <div className="p-4">
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '4px solid #f3f3f3', 
            borderTopColor: '#FFC107', 
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
      {/* 헤더 섹션 */}
      <div style={{ 
        marginBottom: '24px',
        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        borderRadius: '16px',
        padding: '24px',
        color: '#fff',
        boxShadow: '0 4px 15px rgba(79, 172, 254, 0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: '28px', 
              fontWeight: 'bold',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '32px' }}>🏋️</span>
              강사 관리
            </h1>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
              {selectedBranch?.branchName || '지점을 선택해주세요'}
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            style={{
              padding: '12px 24px',
              background: '#fff',
              color: '#4facfe',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <span style={{ fontSize: '20px' }}>➕</span>
            새 강사 등록
          </button>
        </div>
      </div>

      {/* 지점 선택 */}
      <div className="content-box" style={{ marginBottom: '20px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <label style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            color: '#333',
            minWidth: '80px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>🏢</span>
            지점 선택:
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
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.3s ease',
              fontWeight: '500'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#4facfe'
              e.target.style.boxShadow = '0 0 0 3px rgba(79, 172, 254, 0.1)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e0e0e0'
              e.target.style.boxShadow = 'none'
            }}
          >
            {branches.map(branch => (
              <option key={branch.branchId} value={branch.branchId}>
                {branch.branchName}
              </option>
            ))}
          </select>
          {selectedBranch && (
            <div style={{ 
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '20px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>📊</span>
              총 {instructors.length}명
            </div>
          )}
        </div>
      </div>

      {/* 강사 목록 */}
      {loading ? (
        <div className="content-box" style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '4px solid #f3f3f3', 
            borderTopColor: '#FFC107', 
            borderRadius: '50%', 
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#666', fontSize: '16px' }}>로딩 중... ⏳</p>
        </div>
      ) : instructors.length === 0 ? (
        <div className="content-box" style={{ textAlign: 'center', padding: '80px 40px' }}>
          <div style={{ fontSize: '80px', marginBottom: '20px' }}>🏋️</div>
          <h3 style={{ marginBottom: '12px', color: '#333', fontSize: '24px', fontWeight: '600' }}>
            등록된 강사가 없습니다
          </h3>
          <p style={{ color: '#666', marginBottom: '24px', fontSize: '16px' }}>
            강사를 등록하여 수업을 배정하세요.
          </p>
          <button
            onClick={() => handleOpenModal()}
            style={{
              padding: '14px 28px',
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(79, 172, 254, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(79, 172, 254, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(79, 172, 254, 0.3)'
            }}
          >
            <span>➕</span>
            첫 강사 등록하기
          </button>
        </div>
      ) : (
        <div className="content-box">
          <div style={{ 
            marginBottom: '24px', 
            paddingBottom: '16px', 
            borderBottom: '3px solid #f0f0f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <h2 style={{ 
                fontSize: '22px', 
                fontWeight: '700', 
                color: '#333',
                marginBottom: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ fontSize: '28px' }}>🏋️</span>
                {selectedBranch?.branchName} 강사 목록
              </h2>
              <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                {instructors.length}명의 강사가 등록되어 있습니다.
              </p>
            </div>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: '24px' 
          }}>
            {instructors.map(instructor => {
              const statusColor = getStatusColor(instructor.status)
              return (
                <div 
                  key={instructor.instructorId} 
                  style={{ 
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    borderRadius: '16px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    border: '1px solid #e9ecef',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(79, 172, 254, 0.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
                  }}
                >
                  {/* 아바타 */}
                  <div style={{ 
                    width: '80px', 
                    height: '80px', 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    color: 'white', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '32px', 
                    fontWeight: '700',
                    boxShadow: '0 4px 12px rgba(79, 172, 254, 0.3)',
                    marginBottom: '8px'
                  }}>
                    {instructor.instructorName.charAt(0)}
                  </div>

                  {/* 이름 및 상태 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <h3 style={{ 
                      fontSize: '20px', 
                      fontWeight: '700', 
                      color: '#333', 
                      margin: 0 
                    }}>
                      {instructor.instructorName}
                    </h3>
                    <span style={{ 
                      padding: '6px 14px',
                      background: statusColor.bg,
                      borderRadius: '20px',
                      color: statusColor.color,
                      fontSize: '12px',
                      fontWeight: '600',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      {getStatusLabel(instructor.status)}
                    </span>
                  </div>

                  {/* 상세 정보 */}
                  <div style={{ fontSize: '14px', color: '#666', flex: 1 }}>
                    {instructor.specialty && (
                      <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px' }}>🎯</span>
                        <div>
                          <strong style={{ color: '#333' }}>전문분야:</strong> {instructor.specialty}
                        </div>
                      </div>
                    )}
                    {instructor.phone && (
                      <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px' }}>📞</span>
                        <div>
                          <strong style={{ color: '#333' }}>연락처:</strong> {instructor.phone}
                        </div>
                      </div>
                    )}
                    {instructor.email && (
                      <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px' }}>📧</span>
                        <div>
                          <strong style={{ color: '#333' }}>이메일:</strong> {instructor.email}
                        </div>
                      </div>
                    )}
                    {instructor.intro && (
                      <div style={{ 
                        marginTop: '16px', 
                        paddingTop: '16px', 
                        borderTop: '2px solid #f0f0f0',
                        fontStyle: 'italic',
                        color: '#555',
                        lineHeight: '1.6'
                      }}>
                        💬 {instructor.intro}
                      </div>
                    )}
                  </div>

                  {/* 액션 버튼 */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '8px', 
                    marginTop: 'auto', 
                    paddingTop: '16px', 
                    borderTop: '2px solid #f0f0f0' 
                  }}>
                    <button 
                      onClick={() => handleOpenModal(instructor)}
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 4px rgba(102, 126, 234, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(102, 126, 234, 0.4)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(102, 126, 234, 0.3)'
                      }}
                    >
                      ✏️ 수정
                    </button>
                    {instructor.status === 'ACTIVE' ? (
                      <button 
                        onClick={() => handleStatusChange(instructor, 'INACTIVE')}
                        style={{
                          flex: 1,
                          padding: '10px 16px',
                          background: '#f8f9fa',
                          color: '#666',
                          border: '2px solid #e0e0e0',
                          borderRadius: '10px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#e9ecef'
                          e.currentTarget.style.borderColor = '#dee2e6'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#f8f9fa'
                          e.currentTarget.style.borderColor = '#e0e0e0'
                        }}
                      >
                        ⏸️ 비활성
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleStatusChange(instructor, 'ACTIVE')}
                        style={{
                          flex: 1,
                          padding: '10px 16px',
                          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '10px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 2px 4px rgba(79, 172, 254, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)'
                          e.currentTarget.style.boxShadow = '0 4px 8px rgba(79, 172, 254, 0.4)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(79, 172, 254, 0.3)'
                        }}
                      >
                        ▶️ 활성화
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(instructor.instructorId, instructor.instructorName)}
                      style={{
                        padding: '10px 16px',
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 4px rgba(245, 87, 108, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(245, 87, 108, 0.4)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(245, 87, 108, 0.3)'
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 모달 */}
      {showModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}
          onClick={handleCloseModal}
        >
          <div 
            className="content-box"
            style={{ 
              maxWidth: '600px', 
              width: '90%', 
              maxHeight: '90vh', 
              overflowY: 'auto',
              background: '#fff',
              borderRadius: '20px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              animation: 'modalSlideIn 0.3s ease-out'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '24px', 
              paddingBottom: '16px', 
              borderBottom: '3px solid #f0f0f0' 
            }}>
              <h3 style={{ 
                margin: 0,
                fontSize: '24px',
                fontWeight: '700',
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ fontSize: '28px' }}>
                  {editingInstructor ? '✏️' : '➕'}
                </span>
                {editingInstructor ? '강사 정보 수정' : '새 강사 등록'}
              </h3>
              <button 
                onClick={handleCloseModal} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  fontSize: '28px', 
                  cursor: 'pointer',
                  color: '#999',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f0f0f0'
                  e.currentTarget.style.color = '#333'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none'
                  e.currentTarget.style.color = '#999'
                }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              <div>
                <label style={{ 
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  강사명 <span style={{ color: '#f5576c' }}>*</span>
                </label>
                <input 
                  type="text"
                  name="instructorName"
                  placeholder="강사명을 입력하세요"
                  value={formData.instructorName}
                  onChange={handleChange}
                  style={{ 
                    padding: '12px 16px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '12px',
                    width: '100%',
                    fontSize: '15px',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4facfe'
                    e.target.style.boxShadow = '0 0 0 3px rgba(79, 172, 254, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e0e0e0'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ 
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    연락처
                  </label>
                  <input 
                    type="tel"
                    name="phone"
                    placeholder="010-0000-0000"
                    value={formData.phone}
                    onChange={handleChange}
                    style={{ 
                      padding: '12px 16px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '12px',
                      width: '100%',
                      fontSize: '15px',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#4facfe'
                      e.target.style.boxShadow = '0 0 0 3px rgba(79, 172, 254, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e0e0e0'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    이메일
                  </label>
                  <input 
                    type="email"
                    name="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    style={{ 
                      padding: '12px 16px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '12px',
                      width: '100%',
                      fontSize: '15px',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#4facfe'
                      e.target.style.boxShadow = '0 0 0 3px rgba(79, 172, 254, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e0e0e0'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ 
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  전문 분야
                </label>
                <input 
                  type="text"
                  name="specialty"
                  placeholder="예: PT, 필라테스, 요가"
                  value={formData.specialty}
                  onChange={handleChange}
                  style={{ 
                    padding: '12px 16px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '12px',
                    width: '100%',
                    fontSize: '15px',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4facfe'
                    e.target.style.boxShadow = '0 0 0 3px rgba(79, 172, 254, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e0e0e0'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  소개
                </label>
                <textarea 
                  name="intro"
                  placeholder="강사 소개를 입력하세요"
                  value={formData.intro}
                  onChange={handleChange}
                  style={{ 
                    padding: '12px 16px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '12px',
                    width: '100%',
                    minHeight: '100px',
                    fontSize: '15px',
                    resize: 'vertical',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4facfe'
                    e.target.style.boxShadow = '0 0 0 3px rgba(79, 172, 254, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e0e0e0'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  상태
                </label>
                <select 
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  style={{ 
                    padding: '12px 16px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '12px',
                    width: '100%',
                    fontSize: '15px',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box',
                    cursor: 'pointer'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4facfe'
                    e.target.style.boxShadow = '0 0 0 3px rgba(79, 172, 254, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e0e0e0'
                    e.target.style.boxShadow = 'none'
                  }}
                >
                  <option value="ACTIVE">활동 중</option>
                  <option value="INACTIVE">비활동</option>
                  <option value="LEAVE">휴직</option>
                </select>
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'flex-end', 
              marginTop: '32px', 
              paddingTop: '24px', 
              borderTop: '3px solid #f0f0f0' 
            }}>
              <button 
                onClick={handleCloseModal}
                style={{
                  padding: '12px 24px',
                  background: '#f8f9fa',
                  color: '#666',
                  border: '2px solid #e0e0e0',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e9ecef'
                  e.currentTarget.style.borderColor = '#dee2e6'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f8f9fa'
                  e.currentTarget.style.borderColor = '#e0e0e0'
                }}
              >
                취소
              </button>
              <button 
                onClick={handleSave}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(79, 172, 254, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(79, 172, 254, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(79, 172, 254, 0.3)'
                }}
              >
                {editingInstructor ? '💾 수정하기' : '✨ 등록하기'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  )
}

export default InstructorList
