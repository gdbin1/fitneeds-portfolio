import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { branchApi } from '../../api'

function BranchForm() {
  const { branchId } = useParams()
  const isEditMode = Boolean(branchId)
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    brchNm: '',
    addr: '',
    operYn: 1
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isEditMode) {
      loadBranch()
    }
  }, [branchId, isEditMode])

  const loadBranch = async () => {
    setLoading(true)
    try {
      const response = await branchApi.getById(branchId)
      const data = response.data
      setFormData({
        brchNm: data.brchNm || data.branchName || '',
        addr: data.addr || data.address || '',
        operYn: data.operYn !== undefined ? data.operYn : 1
      })
    } catch (error) {
      console.error('Failed to load branch:', error)
      alert('지점 정보를 불러오는데 실패했습니다.')
      navigate('/branches')
    } finally {
      setLoading(false)
    }
  }

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
      if (isEditMode) {
        await branchApi.update(branchId, formData)
        alert('지점 정보가 수정되었습니다.')
      } else {
        await branchApi.create(formData)
        alert('새 지점이 등록되었습니다.')
      }
      navigate('/branches')
    } catch (error) {
      console.error('Failed to save branch:', error)
      const errorMessage = error.response?.data?.message || error.message || '저장에 실패했습니다.'
      alert(`저장에 실패했습니다.\n\n${errorMessage}`)
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

  return (
    <div className="p-4">
      <h1>{isEditMode ? '지점 수정' : '지점 등록'}</h1>
      <p style={{ color: '#666', marginTop: '4px', marginBottom: '20px' }}>
        {isEditMode ? '지점 정보를 수정합니다.' : '새로운 지점을 시스템에 등록합니다.'}
      </p>

      <form onSubmit={handleSubmit}>
        <div className="content-box" style={{ marginBottom: '20px' }}>
          <h2 style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '2px solid #ddd' }}>기본 정보</h2>

          <div className="form-grid">
            <label>지점명 <span className="required" style={{color: 'red'}}>*</span></label>
            <input 
              type="text"
              name="brchNm"
              className="form-input"
              placeholder="예: 강남점"
              value={formData.brchNm}
              onChange={handleChange}
              required
            />
            
            <label>주소 <span className="required" style={{color: 'red'}}>*</span></label>
            <input 
              type="text"
              name="addr"
              className="form-input"
              placeholder="예: 서울특별시 강남구 테헤란로 123"
              value={formData.addr}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-grid">
            <label>운영 여부</label>
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
        
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button 
            type="button" 
            className="btn-sm"
            onClick={() => navigate('/branches')}
          >
            취소
          </button>
          <button 
            type="submit" 
            className="btn-primary"
            disabled={saving}
          >
            {saving ? '저장 중...' : (isEditMode ? '수정하기' : '등록하기')}
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

export default BranchForm

