import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { branchApi } from '../../api'

function ScheduleManagement() {
  const navigate = useNavigate()
  const [branches, setBranches] = useState([])
  const [selectedBranchId, setSelectedBranchId] = useState(null)
  const [selectedBranchName, setSelectedBranchName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBranches()
  }, [])

  const loadBranches = async () => {
    try {
      setLoading(true)
      const response = await branchApi.getAll()
      const rawList = Array.isArray(response) ? response : (response?.data || [])
      // branch 테이블 필드(camel/snake) 정규화: 상태는 snake_case로 통일
      const branchesList = rawList
        .map(b => {
          const brch_id = b.brch_id ?? b.brchId ?? b.branch_id ?? b.branchId
          const brch_nm = b.brch_nm ?? b.brchNm ?? b.branch_name ?? b.branchName
          return brch_id && brch_nm ? { ...b, brch_id, brch_nm } : null
        })
        .filter(Boolean)

      // fallback 데모 지점 (API가 빈 배열을 줄 경우 화면 시연용)
      const fallbackBranches = [
        { brch_id: '001', brch_nm: '수원본점' },
        { brch_id: '002', brch_nm: '강남점' },
      ]

      const finalBranches = branchesList.length > 0 ? branchesList : fallbackBranches

      setBranches(finalBranches)
      if (finalBranches.length > 0) {
        setSelectedBranchId(String(finalBranches[0].brch_id))
        setSelectedBranchName(finalBranches[0].brch_nm)
      }
    } catch (error) {
      console.error('Failed to load branches:', error)
      const errorMessage = error.response?.data?.message || error.message || '지점 목록을 불러오는데 실패했습니다.'
      alert(`지점 목록을 불러오는데 실패했습니다.\n\n${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handleBranchChange = (e) => {
    const branchId = e.target.value
    const selectedBranch = branches.find(b => String(b.brch_id) === branchId)
    setSelectedBranchId(branchId)
    setSelectedBranchName(selectedBranch ? selectedBranch.brch_nm : '')
    if (branchId) {
      navigate(`/centers/${branchId}/schedules`)
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
            스케줄 관리
          </h1>
          <p style={{ color: '#666', fontSize: '14px' }}>
            지점별 스케줄을 관리합니다.
          </p>
        </div>
      </div>

      <div className="content-box" style={{ marginBottom: '20px' }}>
        <h2 style={{ 
          marginBottom: '20px', 
          paddingBottom: '10px', 
          borderBottom: '2px solid #ddd',
          fontSize: '20px',
          fontWeight: '600',
          color: '#1a237e'
        }}>
          지점 선택
        </h2>

        <div className="form-grid">
          <label style={{ fontWeight: '600', color: '#333' }}>지점 선택</label>
          <select
            value={selectedBranchId || ''}
            onChange={handleBranchChange}
            style={{
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '15px',
              background: '#fff',
              cursor: 'pointer',
              minWidth: '200px'
            }}
          >
            {branches.length === 0 ? (
              <option value="">등록된 지점이 없습니다</option>
            ) : (
              branches.map(b => (
                <option key={b.brch_id} value={String(b.brch_id)}>
                  {b.brch_nm}
                </option>
              ))
            )}
          </select>
        </div>

        {selectedBranchId && (
          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <button
              className="btn-primary"
              onClick={() => navigate(`/centers/${selectedBranchId}/schedules`)}
              style={{
                background: '#28a745',
                color: 'white',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#218838'}
              onMouseLeave={(e) => e.target.style.background = '#28a745'}
            >
              스케줄 관리 페이지로 이동
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default ScheduleManagement

