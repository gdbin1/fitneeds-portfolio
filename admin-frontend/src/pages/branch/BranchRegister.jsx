import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { branchApi } from '../../api'

function BranchRegister() {
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    brchNm: '',
    addr: '',
    operYn: 1
  })
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.brchNm || !formData.addr) {
      alert('지점명과 주소는 필수 입력 항목입니다.')
      return
    }

    setSaving(true)
    try {
      await branchApi.create(formData)
      alert('새 지점이 등록되었습니다.')
      navigate('/branches')
    } catch (error) {
      console.error('Failed to save branch:', error)
      const errorMessage = error.response?.data?.message || error.message || '저장에 실패했습니다.'
      alert(`저장에 실패했습니다.\n\n${errorMessage}`)
    } finally {
      setSaving(false)
    }
  }


  return (
    <div className="p-4">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        paddingBottom: '20px',
        borderBottom: '2px solid #e0e0e0'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '700', 
            color: '#1a237e',
            marginBottom: '8px'
          }}>
            지점 등록
          </h1>
          <p style={{ color: '#666', fontSize: '14px' }}>
            새로운 지점을 시스템에 등록합니다.
          </p>
        </div>
        <button 
          type="button"
          className="btn-sm"
          onClick={() => navigate('/branches')}
          style={{
            background: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          목록으로
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="content-box" style={{ marginBottom: '20px' }}>
          <h2 style={{ 
            marginBottom: '20px', 
            paddingBottom: '10px', 
            borderBottom: '2px solid #ddd',
            fontSize: '20px',
            fontWeight: '600',
            color: '#1a237e'
          }}>
            기본 정보
          </h2>

          <div className="form-grid">
            <label style={{ fontWeight: '600', color: '#333' }}>
              지점명 <span className="required" style={{ color: '#e74c3c' }}>*</span>
            </label>
            <input 
              type="text"
              name="brchNm"
              className="form-input"
              placeholder="예: 강남점"
              value={formData.brchNm}
              onChange={handleChange}
              required
              style={{ fontSize: '15px', padding: '10px' }}
            />
            
            <label style={{ fontWeight: '600', color: '#333' }}>
              주소 <span className="required" style={{ color: '#e74c3c' }}>*</span>
            </label>
            <input 
              type="text"
              name="addr"
              className="form-input"
              placeholder="예: 서울특별시 강남구 테헤란로 123"
              value={formData.addr}
              onChange={handleChange}
              required
              style={{ fontSize: '15px', padding: '10px' }}
            />
          </div>

          <div className="form-grid">
            <label style={{ fontWeight: '600', color: '#333' }}>운영 여부</label>
            <div className="form-check" style={{ paddingTop: '8px' }}>
              <input
                className="form-check-input"
                type="checkbox"
                name="operYn"
                checked={formData.operYn === 1}
                onChange={handleChange}
                id="operYn"
              />
              <label className="form-check-label" htmlFor="operYn">
                운영 중
              </label>
            </div>
          </div>
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          justifyContent: 'flex-end',
          paddingTop: '20px',
          borderTop: '2px solid #e0e0e0'
        }}>
          <button 
            type="button" 
            className="btn-sm"
            onClick={() => navigate('/branches')}
            style={{
              background: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            취소
          </button>
          <button 
            type="submit" 
            className="btn-primary"
            disabled={saving}
            style={{
              background: saving ? '#95a5a6' : '#28a745',
              color: 'white',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '4px',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!saving) e.target.style.background = '#218838'
            }}
            onMouseLeave={(e) => {
              if (!saving) e.target.style.background = '#28a745'
            }}
          >
            {saving ? '등록 중...' : '등록하기'}
          </button>
        </div>
      </form>
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default BranchRegister

