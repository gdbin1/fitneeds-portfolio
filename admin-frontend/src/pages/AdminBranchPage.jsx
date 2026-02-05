import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { branchApi } from '../api'

function AdminBranchPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [sortField, setSortField] = useState(null)
  const [sortDirection, setSortDirection] = useState('asc')
  const [stats, setStats] = useState({
    totalBranches: 0,
    operatingBranches: 0,
    closedBranches: 0,
    closedPermanently: 0
  })
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const response = await branchApi.getAll()
      console.log('Branch API response:', response)
      
      // response.data가 배열인지 확인
      let branches = []
      if (Array.isArray(response)) {
        branches = response
      } else if (Array.isArray(response?.data)) {
        branches = response.data
      } else if (response?.data) {
        // 단일 객체인 경우 배열로 변환
        branches = [response.data]
      }
      
      console.log('Branches array:', branches)
      
      // 001 (수원본점)을 맨 위로, 새로운 지점들(002, 003...)은 001 바로 아래, 기존 지점들은 그 아래로 정렬
      const sorted = [...branches].sort((a, b) => {
        // 001은 항상 맨 위 (첫 번째 위치)
        if (a.brchId === '001') return -1
        if (b.brchId === '001') return 1
        
        // 숫자 형식 ID 여부 확인
        const aIsNumeric = /^[0-9]+$/.test(a.brchId)
        const bIsNumeric = /^[0-9]+$/.test(b.brchId)
        
        // 새로운 지점들(숫자 형식)이 기존 지점들보다 먼저
        if (aIsNumeric && !bIsNumeric) return -1
        if (!aIsNumeric && bIsNumeric) return 1
        
        // 둘 다 숫자 형식이면 숫자 순서로 정렬 (002, 003, 004...)
        if (aIsNumeric && bIsNumeric) {
          const aNum = parseInt(a.brchId) || 999999
          const bNum = parseInt(b.brchId) || 999999
          return aNum - bNum
        }
        
        // 둘 다 숫자가 아니면 문자열 비교
        return a.brchId.localeCompare(b.brchId)
      })
      setItems(sorted)
      
      // 통계 계산
      setStats({
        totalBranches: branches.length,
        operatingBranches: branches.filter(b => b.operYn === 1).length,
        closedBranches: branches.filter(b => b.operYn === 0).length,
        closedPermanently: branches.filter(b => b.operYn === 2).length
      })
    } catch (error) {
      console.error('Error loading data:', error)
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data,
        stack: error.stack
      })
      
      let errorMessage = '데이터를 불러오는 중 오류가 발생했습니다.'
      if (error.response?.status === 500) {
        const errorData = error.response?.data
        errorMessage += '\n\n백엔드 서버 오류 (500)'
        if (errorData) {
          if (typeof errorData === 'string') {
            errorMessage += '\n' + errorData
          } else if (errorData.message) {
            errorMessage += '\n' + errorData.message
          }
        }
        errorMessage += '\n\n백엔드 로그를 확인하세요.'
      } else if (error.response?.status) {
        errorMessage += `\n\nHTTP ${error.response.status}`
        if (error.response?.data?.message) {
          errorMessage += '\n' + error.response.data.message
        }
      } else if (error.message) {
        errorMessage += '\n\n' + error.message
      }
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (field) => {
    let direction = 'asc'
    if (sortField === field && sortDirection === 'asc') {
      direction = 'desc'
    }
    
    setSortField(field)
    setSortDirection(direction)
  }

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return ' ↕️'
    }
    return sortDirection === 'asc' ? ' ↑' : ' ↓'
  }

  const getSortedItems = () => {
    if (!sortField) {
      return items
    }

    return [...items].sort((a, b) => {
      // 001은 항상 맨 위에 유지 (정렬 필드가 brchId가 아닐 때만)
      if (sortField !== 'brchId') {
        if (a.brchId === '001') return -1
        if (b.brchId === '001') return 1
      }

      let aVal = a[sortField]
      let bVal = b[sortField]

      // null/undefined 처리
      if (aVal == null) aVal = ''
      if (bVal == null) bVal = ''

      // 날짜 필드 처리
      if (sortField === 'regDt' || sortField === 'updDt') {
        aVal = aVal ? new Date(aVal).getTime() : 0
        bVal = bVal ? new Date(bVal).getTime() : 0
      }

      // 문자열 비교
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0
      }
    })
  }

  const handleCreate = () => {
    setEditingItem(null)
    setShowModal(true)
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setShowModal(true)
  }

  const handleDelete = async (brchId) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    
    try {
      await branchApi.delete(brchId)
      alert('삭제되었습니다.')
      loadData()
    } catch (error) {
      console.error('Error deleting:', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  const handleSave = async (formData) => {
    try {
      console.log('Saving formData:', formData)
      if (editingItem) {
        console.log('Updating branch:', editingItem.brchId, formData)
        await branchApi.update(editingItem.brchId, formData)
      } else {
        console.log('Creating branch:', formData)
        await branchApi.create(formData)
      }
      setShowModal(false)
      loadData()
    } catch (error) {
      console.error('Error saving:', error)
      console.error('Error response:', error.response)
      
      let errorMessage = '저장 중 오류가 발생했습니다.'
      
      if (error.response?.data) {
        const data = error.response.data
        if (typeof data === 'string') {
          errorMessage = data
          // 데이터베이스 관련 에러 메시지 확인
          if (data.includes('Incorrect integer value') || data.includes('brch_id')) {
            errorMessage = '데이터베이스 오류: 지점 ID 컬럼 타입이 올바르지 않습니다.\n\n' +
                          '데이터베이스에서 다음 SQL을 실행하세요:\n\n' +
                          'DELETE FROM `branch_info`;\n' +
                          'DELETE FROM `USERS_ADMIN` WHERE brch_id IS NOT NULL;\n' +
                          'DELETE FROM `branch`;\n' +
                          'ALTER TABLE `branch` MODIFY COLUMN `brch_id` VARCHAR(50) NOT NULL;'
          }
        } else if (data.message) {
          errorMessage = data.message
        } else {
          errorMessage = JSON.stringify(data)
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      alert(errorMessage)
      throw error
    }
  }

  if (loading) {
    return <div className="p-4">로딩 중...</div>
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: '#f5f7fa',
      padding: '24px',
      overflowX: 'hidden'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px',
        background: '#fff',
        padding: '20px 28px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: '24px', 
          fontWeight: '600', 
          color: '#1a1a1a'
        }}>
          지점 관리
        </h1>
        <button 
          onClick={handleCreate}
          style={{
            padding: '10px 24px',
            background: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => e.target.style.background = '#0056b3'}
          onMouseLeave={(e) => e.target.style.background = '#007bff'}
        >
          <span>+</span> 지점 추가
        </button>
      </div>

      {/* 전 지점 현황 통계 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px',
        marginBottom: '24px'
      }}>
        <div style={{ 
          background: '#fff',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center',
          borderTop: '4px solid #3498db'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏢</div>
          <h3 style={{ 
            color: '#3498db', 
            marginBottom: '8px',
            fontSize: '28px',
            fontWeight: '600'
          }}>
            {stats.totalBranches}
          </h3>
          <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>전체 지점</p>
        </div>
        
        <div style={{ 
          background: '#fff',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center',
          borderTop: '4px solid #27ae60'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>✅</div>
          <h3 style={{ 
            color: '#27ae60', 
            marginBottom: '8px',
            fontSize: '28px',
            fontWeight: '600'
          }}>
            {stats.operatingBranches}
          </h3>
          <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>운영중</p>
        </div>
        
        <div style={{ 
          background: '#fff',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center',
          borderTop: '4px solid #f39c12'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏸️</div>
          <h3 style={{ 
            color: '#f39c12', 
            marginBottom: '8px',
            fontSize: '28px',
            fontWeight: '600'
          }}>
            {stats.closedBranches}
          </h3>
          <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>휴업중</p>
        </div>
        
        <div style={{ 
          background: '#fff',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center',
          borderTop: '4px solid #e74c3c'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>❌</div>
          <h3 style={{ 
            color: '#e74c3c', 
            marginBottom: '8px',
            fontSize: '28px',
            fontWeight: '600'
          }}>
            {stats.closedPermanently}
          </h3>
          <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>폐업</p>
        </div>
      </div>

      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        overflowX: 'hidden'
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '14px'
        }}>
          <thead>
            <tr style={{
              background: '#f8f9fa',
              borderBottom: '2px solid #dee2e6'
            }}>
            <th 
              style={{ 
                cursor: 'pointer', 
                userSelect: 'none',
                padding: '12px 16px',
                textAlign: 'center',
                fontWeight: '700',
                color: '#495057',
                fontSize: '15px'
              }}
              onClick={() => handleSort('brchId')}
            >
              지점 ID{getSortIcon('brchId')}
            </th>
            <th 
              style={{ 
                cursor: 'pointer', 
                userSelect: 'none',
                padding: '12px 16px',
                textAlign: 'center',
                fontWeight: '700',
                color: '#495057',
                fontSize: '15px'
              }}
              onClick={() => handleSort('brchNm')}
            >
              지점명{getSortIcon('brchNm')}
            </th>
            <th 
              style={{ 
                cursor: 'pointer', 
                userSelect: 'none',
                padding: '12px 16px',
                textAlign: 'center',
                fontWeight: '700',
                color: '#495057',
                fontSize: '15px'
              }}
              onClick={() => handleSort('addr')}
            >
              지점 주소{getSortIcon('addr')}
            </th>
            <th 
              style={{ 
                cursor: 'pointer', 
                userSelect: 'none',
                padding: '12px 16px',
                textAlign: 'center',
                fontWeight: '700',
                color: '#495057',
                fontSize: '15px'
              }}
              onClick={() => handleSort('operYn')}
            >
              운영 상태{getSortIcon('operYn')}
            </th>
            <th 
              style={{ 
                cursor: 'pointer', 
                userSelect: 'none',
                padding: '12px 16px',
                textAlign: 'center',
                fontWeight: '700',
                color: '#495057',
                fontSize: '15px'
              }}
              onClick={() => handleSort('regDt')}
            >
              등록일{getSortIcon('regDt')}
            </th>
            <th 
              style={{ 
                cursor: 'pointer', 
                userSelect: 'none',
                padding: '12px 16px',
                textAlign: 'center',
                fontWeight: '700',
                color: '#495057',
                fontSize: '15px'
              }}
              onClick={() => handleSort('updDt')}
            >
              수정일{getSortIcon('updDt')}
            </th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'center',
                fontWeight: '700',
                color: '#495057',
                fontSize: '15px'
              }}>수정</th>
            </tr>
          </thead>
          <tbody>
            {getSortedItems().map((item, index) => (
              <tr 
                key={item.brchId}
                style={{
                  borderBottom: '1px solid #e9ecef',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
              >
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <span 
                    style={{ 
                      color: '#007bff', 
                      cursor: 'pointer', 
                      fontWeight: '700',
                      fontSize: '15px',
                      transition: 'color 0.2s'
                    }}
                    onClick={() => navigate(`/centers/${item.brchId}`)}
                    onMouseEnter={(e) => e.target.style.color = '#0056b3'}
                    onMouseLeave={(e) => e.target.style.color = '#007bff'}
                  >
                    {item.brchId}
                  </span>
                </td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <span 
                    style={{ 
                      color: '#007bff', 
                      cursor: 'pointer', 
                      fontWeight: '700',
                      fontSize: '15px',
                      transition: 'color 0.2s'
                    }}
                    onClick={() => navigate(`/centers/${item.brchId}`)}
                    onMouseEnter={(e) => e.target.style.color = '#0056b3'}
                    onMouseLeave={(e) => e.target.style.color = '#007bff'}
                  >
                    {item.brchNm}
                  </span>
                </td>
                <td style={{ padding: '16px', color: '#495057', textAlign: 'center', fontWeight: '600', fontSize: '15px' }}>{item.addr}</td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  {item.operYn === 1 ? (
                    <span style={{
                      display: 'inline-block',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      background: '#d4edda',
                      color: '#155724',
                      fontSize: '13px',
                      fontWeight: '700',
                      border: '1px solid #c3e6cb'
                    }}>
                      ✅ 운영중
                    </span>
                  ) : item.operYn === 0 ? (
                    <span style={{
                      display: 'inline-block',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      background: '#fff3cd',
                      color: '#856404',
                      fontSize: '13px',
                      fontWeight: '700',
                      border: '1px solid #ffeaa7'
                    }}>
                      ⏸️ 휴업중
                    </span>
                  ) : item.operYn === 2 ? (
                    <span style={{
                      display: 'inline-block',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      background: '#f8d7da',
                      color: '#721c24',
                      fontSize: '13px',
                      fontWeight: '700',
                      border: '1px solid #f5c6cb'
                    }}>
                      ❌ 폐업
                    </span>
                  ) : (
                    <span style={{
                      display: 'inline-block',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      background: '#e2e3e5',
                      color: '#383d41',
                      fontSize: '13px',
                      fontWeight: '700',
                      border: '1px solid #d6d8db'
                    }}>
                      ⚠️ 중지
                    </span>
                  )}
                </td>
                <td style={{ padding: '16px', color: '#495057', fontSize: '15px', textAlign: 'center', fontWeight: '600' }}>
                  {item.regDt ? new Date(item.regDt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                  }) : '-'}
                </td>
                <td style={{ padding: '16px', color: '#495057', fontSize: '15px', textAlign: 'center', fontWeight: '600' }}>
                  {item.updDt ? new Date(item.updDt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                  }) : '-'}
                </td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <button 
                    onClick={() => handleEdit(item)}
                      style={{
                        padding: '6px 16px',
                        background: '#007bff',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#0056b3'}
                      onMouseLeave={(e) => e.target.style.background = '#007bff'}
                  >
                    수정
                  </button>
                  <button 
                    onClick={() => handleDelete(item.brchId)}
                      style={{
                        padding: '6px 16px',
                        background: '#dc3545',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#c82333'}
                      onMouseLeave={(e) => e.target.style.background = '#dc3545'}
                  >
                    삭제
                  </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <BranchFormModal
          editingItem={editingItem}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
      
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        /* 스크롤바 하나만 보이게 - body만 스크롤 */
        html {
          overflow: hidden;
        }
        body {
          overflow-x: hidden;
          overflow-y: auto;
        }
        /* 모든 내부 div의 스크롤바 숨기기 */
        div div::-webkit-scrollbar {
          display: none;
        }
        div div {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
      `}</style>
    </div>
  )
}

// Branch Form Modal Component
function BranchFormModal({ editingItem, onClose, onSave, onDelete }) {
  const [formData, setFormData] = useState({
    brchNm: editingItem?.brchNm || '',
    addr: editingItem?.addr || '',
    phone: editingItem?.phone || '',
    operYn: editingItem?.operYn !== undefined ? editingItem.operYn : 1
  })
  const [saving, setSaving] = useState(false)
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    const operYnValue = parseInt(value)
    
    // 폐업(2) 선택 시 확인 다이얼로그 표시
    if (name === 'operYn' && operYnValue === 2) {
      setShowCloseConfirm(true)
      return
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'operYn' ? operYnValue : value
    }))
  }

  const handleCloseConfirm = async (action) => {
    setShowCloseConfirm(false)
    
    if (action === 'delete') {
      // 삭제 선택
      if (editingItem && editingItem.brchId) {
        if (confirm('정말 삭제하시겠습니까?')) {
          setSaving(true)
          try {
            await onDelete(editingItem.brchId)
            onClose()
          } catch (error) {
            console.error('Error deleting:', error)
            alert('삭제 중 오류가 발생했습니다.')
          } finally {
            setSaving(false)
          }
        }
      }
    } else if (action === 'save') {
      // 폐업으로 저장
      setFormData(prev => ({
        ...prev,
        operYn: 2
      }))
    } else {
      // 취소 - 원래 상태로 복원
      setFormData(prev => ({
        ...prev,
        operYn: editingItem?.operYn !== undefined ? editingItem.operYn : 1
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.brchNm || !formData.addr) {
      alert('지점명과 주소는 필수 입력 항목입니다.')
      return
    }

    setSaving(true)
    try {
      await onSave(formData)
    } catch (error) {
      console.error('Error saving:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCloseModal = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1050,
        backdropFilter: 'blur(2px)'
      }}
      onClick={handleCloseModal}
    >
      <div 
        style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '24px',
          width: '90%',
          maxWidth: '500px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          animation: 'modalSlideIn 0.2s ease-out',
          position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid #e0e0e0'
        }}>
          <h5 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
            {editingItem ? '지점 수정' : '지점 추가'}
          </h5>
                <button 
                  type="button" 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666',
              padding: '0',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px'
            }}
            onMouseOver={(e) => e.target.style.background = '#f0f0f0'}
            onMouseOut={(e) => e.target.style.background = 'none'}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontSize: '14px',
              fontWeight: '500',
              color: '#333'
            }}>
              지점명 <span style={{color: 'red'}}>*</span>
            </label>
            <input
              type="text"
              name="brchNm"
              value={formData.brchNm}
              onChange={handleChange}
              required
              placeholder="예: 영통점"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontSize: '14px',
              fontWeight: '500',
              color: '#333'
            }}>
              주소 <span style={{color: 'red'}}>*</span>
            </label>
            <input
              type="text"
              name="addr"
              value={formData.addr}
              onChange={handleChange}
              required
              placeholder="예: 경기도 수원시 영통구 영통로 123번지"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontSize: '14px',
              fontWeight: '500',
              color: '#333'
            }}>
              전화번호
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="예: 031-1234-5678"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '12px', 
              fontSize: '14px',
              fontWeight: '500',
              color: '#333'
            }}>
              운영 상태
            </label>
            <div style={{ 
              display: 'flex', 
              position: 'relative',
              width: '100%',
              alignItems: 'center'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                fontSize: '14px',
                gap: '8px',
                position: 'relative'
              }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <input
                    type="radio"
                    name="operYn"
                    value="1"
                    checked={formData.operYn === 1}
                    onChange={handleChange}
                    style={{
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer',
                      margin: 0,
                      appearance: 'none',
                      border: '2px solid #007bff',
                      borderRadius: '4px',
                      backgroundColor: formData.operYn === 1 ? '#007bff' : '#fff',
                      position: 'relative'
                    }}
                  />
                  {formData.operYn === 1 && (
                    <span style={{
                      position: 'absolute',
                      left: '4px',
                      top: '-2px',
                      color: '#fff',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      pointerEvents: 'none',
                      lineHeight: '20px'
                    }}>✓</span>
                  )}
                </div>
                <span>운영중</span>
              </label>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                fontSize: '14px',
                gap: '8px',
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)'
              }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <input
                    type="radio"
                    name="operYn"
                    value="0"
                    checked={formData.operYn === 0}
                    onChange={handleChange}
                    style={{
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer',
                      margin: 0,
                      appearance: 'none',
                      border: '2px solid #ffc107',
                      borderRadius: '4px',
                      backgroundColor: formData.operYn === 0 ? '#ffc107' : '#fff',
                      position: 'relative'
                    }}
                  />
                  {formData.operYn === 0 && (
                    <span style={{
                      position: 'absolute',
                      left: '4px',
                      top: '-2px',
                      color: '#fff',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      pointerEvents: 'none',
                      lineHeight: '20px'
                    }}>✓</span>
                  )}
                </div>
                <span>휴업중</span>
              </label>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                fontSize: '14px',
                gap: '8px',
                position: 'absolute',
                right: 0
              }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <input
                    type="radio"
                    name="operYn"
                    value="2"
                    checked={formData.operYn === 2}
                    onChange={handleChange}
                    style={{
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer',
                      margin: 0,
                      appearance: 'none',
                      border: '2px solid #dc3545',
                      borderRadius: '4px',
                      backgroundColor: formData.operYn === 2 ? '#dc3545' : '#fff',
                      position: 'relative'
                    }}
                  />
                  {formData.operYn === 2 && (
                    <span style={{
                      position: 'absolute',
                      left: '4px',
                      top: '-2px',
                      color: '#fff',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      pointerEvents: 'none',
                      lineHeight: '20px'
                    }}>✓</span>
                  )}
                </div>
                <span>폐업</span>
              </label>
            </div>
              </div>

          {/* 폐업 선택 시 확인 다이얼로그 */}
          {showCloseConfirm && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '12px',
              zIndex: 10
            }}>
              <div style={{
                background: '#fff',
                padding: '24px',
                borderRadius: '12px',
                maxWidth: '400px',
                width: '90%',
                boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
              }}>
                <h6 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
                  폐업 처리
                </h6>
                <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#666' }}>
                  폐업으로 저장하시겠습니까?<br/>
                  아니면 지점을 삭제하시겠습니까?
                </p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => handleCloseConfirm('cancel')}
                    style={{
                      padding: '8px 16px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      background: '#fff',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#666'
                    }}
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCloseConfirm('delete')}
                    style={{
                      padding: '8px 16px',
                      border: 'none',
                      borderRadius: '6px',
                      background: '#dc3545',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#fff',
                      fontWeight: '500'
                    }}
                  >
                    삭제
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCloseConfirm('save')}
                    style={{
                      padding: '8px 16px',
                      border: 'none',
                      borderRadius: '6px',
                      background: '#6c757d',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#fff',
                      fontWeight: '500'
                    }}
                  >
                    폐업으로 저장
                  </button>
              </div>
            </div>
          </div>
          )}

          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '10px',
            paddingTop: '16px',
            borderTop: '1px solid #e0e0e0'
          }}>
            <button 
              type="button"
              onClick={onClose}
              disabled={saving}
              style={{
                padding: '10px 20px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                background: '#fff',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                color: '#666',
                opacity: saving ? 0.6 : 1
              }}
            >
              취소
            </button>
            <button 
              type="submit"
              disabled={saving}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
                background: saving ? '#ccc' : '#007bff',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                color: '#fff',
                fontWeight: '500'
              }}
            >
              {saving ? '저장 중...' : (editingItem ? '수정' : '추가')}
            </button>
          </div>
        </form>
        </div>
    </div>
  )
}

export default AdminBranchPage


