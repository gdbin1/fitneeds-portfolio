import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { categoryApi, branchApi } from '../../api'

function CategoryList() {
  const { branchId: urlBranchId } = useParams()
  const navigate = useNavigate()
  const [branches, setBranches] = useState([])
  const [selectedBranchId, setSelectedBranchId] = useState(urlBranchId ? Number(urlBranchId) : null)
  const [selectedBranch, setSelectedBranch] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({
    categoryName: '',
    categoryDesc: '',
    availableStartTime: '06:00',
    availableEndTime: '22:00',
    maxCapacity: 10,
    basePrice: 0,
    isActive: true,
    sortOrder: 0
  })

  useEffect(() => {
    loadBranches()
  }, [])

  useEffect(() => {
    if (selectedBranchId) {
      loadCategories()
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

  const loadCategories = async () => {
    if (!selectedBranchId) return
    
    try {
      setLoading(true)
      const [branchRes, categoryRes] = await Promise.all([
        branchApi.getById(selectedBranchId),
        categoryApi.getByBranch(selectedBranchId)
      ])
      setSelectedBranch(branchRes.data)
      setCategories(categoryRes.data || [])
    } catch (error) {
      console.error('Failed to load categories:', error)
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method
      })
      
      let errorMessage = '운동 종목을 불러오는데 실패했습니다.\n\n'
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        errorMessage += '네트워크 연결 오류가 발생했습니다.\n\n'
        errorMessage += '확인 사항:\n'
        errorMessage += '1. 백엔드 서버가 http://localhost:8021에서 실행 중인지 확인\n'
        errorMessage += '2. 프론트엔드 개발 서버를 재시작했는지 확인\n'
        errorMessage += '3. 브라우저 콘솔에서 추가 오류 메시지 확인'
      } else if (error.response) {
        const status = error.response.status
        const statusText = error.response.statusText || ''
        const errorData = error.response.data || {}
        
        errorMessage += `HTTP 상태 코드: ${status} ${statusText}\n`
        errorMessage += `요청 URL: ${error.config?.url || '알 수 없음'}\n\n`
        
        if (status === 404) {
          errorMessage += '요청한 리소스를 찾을 수 없습니다.\n\n'
          errorMessage += '확인 사항:\n'
          errorMessage += '1. 백엔드 API 엔드포인트가 올바른지 확인\n'
          errorMessage += `2. 지점 ID(${selectedBranchId})가 유효한지 확인\n`
          errorMessage += '3. 백엔드 서버 로그에서 추가 오류 확인'
        } else if (status === 500) {
          errorMessage += '서버 내부 오류가 발생했습니다.\n\n'
          errorMessage += '확인 사항:\n'
          errorMessage += '1. 데이터베이스 연결 상태 확인\n'
          errorMessage += '2. 데이터베이스 스키마가 올바르게 적용되었는지 확인\n'
          errorMessage += '3. 백엔드 서버 로그에서 상세 오류 확인\n\n'
          
          if (errorData.message) {
            errorMessage += `서버 오류 메시지: ${errorData.message}\n`
          }
          if (errorData.error) {
            errorMessage += `오류 유형: ${errorData.error}\n`
          }
        } else if (status === 401) {
          errorMessage += '인증이 필요합니다.\n'
          errorMessage += '로그인 상태를 확인하세요.'
        } else {
          errorMessage += `알 수 없는 오류가 발생했습니다.\n`
          if (errorData.message) {
            errorMessage += `오류 메시지: ${errorData.message}\n`
          }
        }
      } else {
        errorMessage += `오류: ${error.message || '알 수 없는 오류'}\n`
      }
      
      alert(errorMessage)
      setCategories([])
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
      navigate(`/centers/${branchId}/categories`, { replace: true })
    }
  }

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        categoryName: category.categoryName,
        categoryDesc: category.categoryDesc || '',
        availableStartTime: category.availableStartTime?.substring(0, 5) || '06:00',
        availableEndTime: category.availableEndTime?.substring(0, 5) || '22:00',
        maxCapacity: category.maxCapacity,
        basePrice: category.basePrice,
        isActive: category.isActive,
        sortOrder: category.sortOrder || 0
      })
    } else {
      setEditingCategory(null)
      setFormData({
        categoryName: '',
        categoryDesc: '',
        availableStartTime: '06:00',
        availableEndTime: '22:00',
        maxCapacity: 10,
        basePrice: 0,
        isActive: true,
        sortOrder: categories.length
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingCategory(null)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
    }))
  }

  const handleSave = async () => {
    if (!formData.categoryName) {
      alert('종목명을 입력해주세요. ✏️')
      return
    }

    try {
      const data = {
        categoryName: formData.categoryName,
        categoryDesc: formData.categoryDesc,
        availableStartTime: formData.availableStartTime ? `${formData.availableStartTime}:00` : null,
        availableEndTime: formData.availableEndTime ? `${formData.availableEndTime}:00` : null,
        maxCapacity: formData.maxCapacity,
        basePrice: formData.basePrice,
        isActive: formData.isActive,
        sortOrder: formData.sortOrder
      }

      if (editingCategory) {
        await categoryApi.update(selectedBranchId, editingCategory.categoryId, data)
        alert('종목이 수정되었습니다! ✨')
      } else {
        await categoryApi.create(selectedBranchId, data)
        alert('새 종목이 추가되었습니다! 🎉')
      }
      handleCloseModal()
      loadCategories()
    } catch (error) {
      console.error('Failed to save:', error)
      alert('저장에 실패했습니다. 😢\n\n' + (error.response?.data?.message || error.message))
    }
  }

  const handleDelete = async (categoryId, categoryName) => {
    if (!window.confirm(`"${categoryName}" 종목을 삭제하시겠습니까? 🗑️\n\n관련 프로그램도 모두 삭제됩니다.`)) {
      return
    }

    try {
      await categoryApi.delete(selectedBranchId, categoryId)
      alert('종목이 삭제되었습니다. 🗑️')
      loadCategories()
    } catch (error) {
      console.error('Failed to delete:', error)
      alert('삭제에 실패했습니다. 😢\n\n' + (error.response?.data?.message || error.message))
    }
  }

  const handleToggleActive = async (category) => {
    try {
      await categoryApi.updateActive(selectedBranchId, category.categoryId, !category.isActive)
      loadCategories()
    } catch (error) {
      console.error('Failed to update:', error)
      alert('상태 변경에 실패했습니다. 😢')
    }
  }

  const formatTime = (time) => {
    if (!time) return '-'
    if (typeof time === 'string') {
      return time.substring(0, 5)
    }
    return time
  }

  const formatPrice = (price) => {
    if (!price) return '0원'
    return `${Number(price).toLocaleString()}원`
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        padding: '24px',
        color: '#fff',
        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
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
              운동 종목 관리
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
              color: '#667eea',
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
            새 종목 추가
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
              e.target.style.borderColor = '#667eea'
              e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
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
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              borderRadius: '20px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>📊</span>
              총 {categories.length}개 종목
            </div>
          )}
        </div>
      </div>

      {/* 종목 목록 */}
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
      ) : categories.length === 0 ? (
        <div className="content-box" style={{ textAlign: 'center', padding: '80px 40px' }}>
          <div style={{ fontSize: '80px', marginBottom: '20px' }}>🏋️‍♀️</div>
          <h3 style={{ marginBottom: '12px', color: '#333', fontSize: '24px', fontWeight: '600' }}>
            등록된 종목이 없습니다
          </h3>
          <p style={{ color: '#666', marginBottom: '24px', fontSize: '16px' }}>
            선택한 지점에 등록된 운동 종목이 없습니다.
          </p>
          <button
            onClick={() => handleOpenModal()}
            style={{
              padding: '14px 28px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)'
            }}
          >
            <span>➕</span>
            첫 종목 추가하기
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
                <span style={{ fontSize: '28px' }}>📋</span>
                {selectedBranch?.branchName} 운동 종목
              </h2>
              <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                {categories.length}개의 종목이 등록되어 있습니다.
              </p>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'separate',
              borderSpacing: 0,
              fontSize: '14px'
            }}>
              <thead>
                <tr>
                  <th style={{ 
                    padding: '16px 12px', 
                    textAlign: 'center', 
                    fontWeight: '700',
                    color: '#fff',
                    backgroundColor: '#667eea',
                    border: 'none',
                    fontSize: '14px',
                    position: 'sticky',
                    left: 0,
                    zIndex: 10
                  }}>
                    순서
                  </th>
                  <th style={{ 
                    padding: '16px 12px', 
                    textAlign: 'left', 
                    fontWeight: '700',
                    color: '#fff',
                    backgroundColor: '#667eea',
                    border: 'none',
                    fontSize: '14px'
                  }}>
                    종목명
                  </th>
                  <th style={{ 
                    padding: '16px 12px', 
                    textAlign: 'left', 
                    fontWeight: '700',
                    color: '#fff',
                    backgroundColor: '#667eea',
                    border: 'none',
                    fontSize: '14px'
                  }}>
                    설명
                  </th>
                  <th style={{ 
                    padding: '16px 12px', 
                    textAlign: 'center', 
                    fontWeight: '700',
                    color: '#fff',
                    backgroundColor: '#667eea',
                    border: 'none',
                    fontSize: '14px'
                  }}>
                    이용 시간
                  </th>
                  <th style={{ 
                    padding: '16px 12px', 
                    textAlign: 'center', 
                    fontWeight: '700',
                    color: '#fff',
                    backgroundColor: '#667eea',
                    border: 'none',
                    fontSize: '14px'
                  }}>
                    최대 정원
                  </th>
                  <th style={{ 
                    padding: '16px 12px', 
                    textAlign: 'right', 
                    fontWeight: '700',
                    color: '#fff',
                    backgroundColor: '#667eea',
                    border: 'none',
                    fontSize: '14px'
                  }}>
                    기본 요금
                  </th>
                  <th style={{ 
                    padding: '16px 12px', 
                    textAlign: 'center', 
                    fontWeight: '700',
                    color: '#fff',
                    backgroundColor: '#667eea',
                    border: 'none',
                    fontSize: '14px'
                  }}>
                    상태
                  </th>
                  <th style={{ 
                    padding: '16px 12px', 
                    textAlign: 'center', 
                    fontWeight: '700',
                    color: '#fff',
                    backgroundColor: '#667eea',
                    border: 'none',
                    fontSize: '14px'
                  }}>
                    관리
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category, index) => (
                  <tr 
                    key={category.categoryId}
                    style={{ 
                      borderBottom: '1px solid #f0f0f0',
                      transition: 'all 0.2s ease',
                      backgroundColor: index % 2 === 0 ? '#fff' : '#fafafa'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f0f4ff'
                      e.currentTarget.style.transform = 'scale(1.01)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#fff' : '#fafafa'
                      e.currentTarget.style.transform = 'scale(1)'
                    }}
                  >
                    <td style={{ 
                      padding: '20px 12px', 
                      textAlign: 'center', 
                      color: '#666',
                      fontWeight: '600',
                      fontSize: '15px'
                    }}>
                      {category.sortOrder || index + 1}
                    </td>
                    <td style={{ padding: '20px 12px' }}>
                      <strong style={{ 
                        fontSize: '17px', 
                        color: '#333',
                        display: 'block',
                        marginBottom: '6px',
                        fontWeight: '700'
                      }}>
                        {category.categoryName}
                      </strong>
                    </td>
                    <td style={{ padding: '20px 12px', color: '#666', fontSize: '14px' }}>
                      {category.categoryDesc || <span style={{ color: '#999', fontStyle: 'italic' }}>-</span>}
                    </td>
                    <td style={{ padding: '20px 12px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
                      <span style={{ 
                        padding: '4px 12px',
                        background: '#e8f4f8',
                        borderRadius: '8px',
                        fontWeight: '500'
                      }}>
                        {formatTime(category.availableStartTime)} ~ {formatTime(category.availableEndTime)}
                      </span>
                    </td>
                    <td style={{ padding: '20px 12px', textAlign: 'center', color: '#666', fontSize: '15px', fontWeight: '600' }}>
                      <span style={{ 
                        padding: '4px 12px',
                        background: '#fff3cd',
                        borderRadius: '8px',
                        color: '#856404'
                      }}>
                        {category.maxCapacity}명
                      </span>
                    </td>
                    <td style={{ padding: '20px 12px', textAlign: 'right', color: '#333', fontWeight: '700', fontSize: '15px' }}>
                      <span style={{ 
                        padding: '4px 12px',
                        background: '#d4edda',
                        borderRadius: '8px',
                        color: '#155724'
                      }}>
                        {formatPrice(category.basePrice)}
                      </span>
                    </td>
                    <td style={{ padding: '20px 12px', textAlign: 'center' }}>
                      <span 
                        onClick={() => handleToggleActive(category)}
                        style={{ 
                          display: 'inline-block',
                          padding: '8px 16px',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: '600',
                          backgroundColor: category.isActive ? '#d4edda' : '#f8d7da',
                          color: category.isActive ? '#155724' : '#721c24',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.05)'
                          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)'
                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      >
                        {category.isActive ? '✅ 활성' : '❌ 비활성'}
                      </span>
                    </td>
                    <td style={{ padding: '20px 12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button 
                          onClick={() => handleOpenModal(category)}
                          style={{
                            padding: '8px 16px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '13px',
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
                        <button 
                          onClick={() => handleDelete(category.categoryId, category.categoryName)}
                          style={{
                            padding: '8px 16px',
                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '13px',
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
                          🗑️ 삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              maxWidth: '700px', 
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
                  {editingCategory ? '✏️' : '➕'}
                </span>
                {editingCategory ? '종목 수정' : '새 종목 추가'}
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
                  종목명 <span style={{ color: '#f5576c' }}>*</span>
                </label>
                <input 
                  type="text"
                  name="categoryName"
                  placeholder="예: PT, GX, 필라테스, 요가"
                  value={formData.categoryName}
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
                    e.target.style.borderColor = '#667eea'
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
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
                  종목 설명
                </label>
                <textarea 
                  name="categoryDesc"
                  placeholder="종목에 대한 설명을 입력하세요."
                  value={formData.categoryDesc}
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
                    e.target.style.borderColor = '#667eea'
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
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
                    이용 시작 시간
                  </label>
                  <input 
                    type="time"
                    name="availableStartTime"
                    value={formData.availableStartTime}
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
                      e.target.style.borderColor = '#667eea'
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
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
                    이용 종료 시간
                  </label>
                  <input 
                    type="time"
                    name="availableEndTime"
                    value={formData.availableEndTime}
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
                      e.target.style.borderColor = '#667eea'
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e0e0e0'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>
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
                    최대 수용 인원
                  </label>
                  <input 
                    type="number"
                    name="maxCapacity"
                    value={formData.maxCapacity}
                    onChange={handleChange}
                    min="1"
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
                      e.target.style.borderColor = '#667eea'
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
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
                    기본 요금 (원)
                  </label>
                  <input 
                    type="number"
                    name="basePrice"
                    value={formData.basePrice}
                    onChange={handleChange}
                    min="0"
                    step="1000"
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
                      e.target.style.borderColor = '#667eea'
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e0e0e0'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>
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
                    정렬 순서
                  </label>
                  <input 
                    type="number"
                    name="sortOrder"
                    value={formData.sortOrder}
                    onChange={handleChange}
                    min="0"
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
                      e.target.style.borderColor = '#667eea'
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
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
                    활성화
                  </label>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    marginTop: '12px',
                    padding: '12px 16px',
                    background: formData.isActive ? '#d4edda' : '#f8d7da',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}>
                    <input 
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      style={{ 
                        width: '20px',
                        height: '20px',
                        cursor: 'pointer'
                      }}
                    />
                    <span style={{ 
                      fontSize: '15px',
                      fontWeight: '600',
                      color: formData.isActive ? '#155724' : '#721c24'
                    }}>
                      {formData.isActive ? '✅ 활성화됨' : '❌ 비활성화됨'}
                    </span>
                  </label>
                </div>
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
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)'
                }}
              >
                {editingCategory ? '💾 수정하기' : '✨ 추가하기'}
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

export default CategoryList
