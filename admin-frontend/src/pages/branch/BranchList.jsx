import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { branchApi } from '../../api'

function BranchList() {
  const [branches, setBranches] = useState([])
  const [filteredBranches, setFilteredBranches] = useState([])
  const [sortedBranches, setSortedBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState(null)
  const [sortDirection, setSortDirection] = useState('asc')
  const navigate = useNavigate()

  useEffect(() => {
    loadBranches()
  }, [])

  useEffect(() => {
    filterBranches()
  }, [branches, filter, searchTerm])

  useEffect(() => {
    if (sortField) {
      const sorted = [...filteredBranches].sort((a, b) => {
        // 잠실 본점을 항상 맨 위에 배치
        const aIsJamsil = a.branchName && (a.branchName.includes('잠실') && a.branchName.includes('본점'))
        const bIsJamsil = b.branchName && (b.branchName.includes('잠실') && b.branchName.includes('본점'))
        
        if (aIsJamsil && !bIsJamsil) return -1
        if (!aIsJamsil && bIsJamsil) return 1
        
        let aVal = a[sortField]
        let bVal = b[sortField]
        
        if (aVal == null) aVal = ''
        if (bVal == null) bVal = ''
        
        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase()
          bVal = bVal.toLowerCase()
        }
        
        if (sortField === 'createdAt') {
          aVal = new Date(aVal).getTime()
          bVal = new Date(bVal).getTime()
        }
        
        if (sortDirection === 'asc') {
          return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
        } else {
          return aVal < bVal ? 1 : aVal > bVal ? -1 : 0
        }
      })
      setSortedBranches(sorted)
    } else {
      // 정렬 필드가 없을 때도 잠실 본점을 맨 위에 배치
      const sorted = [...filteredBranches].sort((a, b) => {
        const aIsJamsil = a.branchName && (a.branchName.includes('잠실') && a.branchName.includes('본점'))
        const bIsJamsil = b.branchName && (b.branchName.includes('잠실') && b.branchName.includes('본점'))
        
        if (aIsJamsil && !bIsJamsil) return -1
        if (!aIsJamsil && bIsJamsil) return 1
        return 0
      })
      setSortedBranches(sorted)
    }
  }, [filteredBranches, sortField, sortDirection])

  const loadBranches = async () => {
    try {
      const response = await branchApi.getAll()
      setBranches(response.data)
    } catch (error) {
      console.error('Failed to load branches:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterBranches = () => {
    let filtered = [...branches]
    
    if (filter !== 'all') {
      filtered = filtered.filter(b => b.status === filter)
    }
    
    if (searchTerm) {
      filtered = filtered.filter(b => 
        b.branchRegNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.roadAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.managerName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    setFilteredBranches(filtered)
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
      return '↕️'
    }
    return sortDirection === 'asc' ? '↑' : '↓'
  }

  const handleDelete = async (branchId) => {
    if (!window.confirm('정말 이 지점을 삭제하시겠습니까? 관련된 모든 데이터가 삭제됩니다.')) {
      return
    }
    
    try {
      await branchApi.delete(branchId)
      loadBranches()
    } catch (error) {
      console.error('Failed to delete branch:', error)
      alert('지점 삭제에 실패했습니다.')
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1>지점 목록</h1>
          <p style={{ color: '#666', marginTop: '4px' }}>전체 {branches.length}개 지점</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/branches/new')}>
          ➕ 새 지점 등록
        </button>
      </div>

      <div className="content-box" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '4px', background: '#f2f2f2', padding: '4px', borderRadius: '4px' }}>
            <button 
              className={`btn-sm ${filter === 'all' ? 'btn-primary' : ''}`}
              onClick={() => setFilter('all')}
              style={{ background: filter === 'all' ? '#3498db' : 'transparent', color: filter === 'all' ? 'white' : '#333' }}
            >
              전체
            </button>
            <button 
              className={`btn-sm ${filter === 'OPERATING' ? 'btn-primary' : ''}`}
              onClick={() => setFilter('OPERATING')}
              style={{ background: filter === 'OPERATING' ? '#3498db' : 'transparent', color: filter === 'OPERATING' ? 'white' : '#333' }}
            >
              운영
            </button>
            <button 
              className={`btn-sm ${filter === 'CLOSED_TEMP' ? 'btn-primary' : ''}`}
              onClick={() => setFilter('CLOSED_TEMP')}
              style={{ background: filter === 'CLOSED_TEMP' ? '#3498db' : 'transparent', color: filter === 'CLOSED_TEMP' ? 'white' : '#333' }}
            >
              휴점
            </button>
            <button 
              className={`btn-sm ${filter === 'CLOSED_PERM' ? 'btn-primary' : ''}`}
              onClick={() => setFilter('CLOSED_PERM')}
              style={{ background: filter === 'CLOSED_PERM' ? '#3498db' : 'transparent', color: filter === 'CLOSED_PERM' ? 'white' : '#333' }}
            >
              폐점
            </button>
          </div>
          <input 
            type="text"
            className="form-input"
            placeholder="등록번호, 지점명, 주소, 담당자 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: '300px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
      </div>

      <div className="content-box">
        {sortedBranches.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <h3>검색 결과가 없습니다</h3>
            <p>다른 검색어나 필터를 시도해보세요.</p>
          </div>
        ) : (
          <div className="table-container">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th 
                    onClick={() => handleSort('branchRegNo')}
                    style={{ 
                      cursor: 'pointer', 
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '2px solid #ddd',
                      background: '#f2f2f2'
                    }}
                  >
                    등록번호 {getSortIcon('branchRegNo')}
                  </th>
                  <th 
                    onClick={() => handleSort('branchName')}
                    style={{ 
                      cursor: 'pointer', 
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '2px solid #ddd',
                      background: '#f2f2f2'
                    }}
                  >
                    지점명 {getSortIcon('branchName')}
                  </th>
                  <th 
                    onClick={() => handleSort('roadAddress')}
                    style={{ 
                      cursor: 'pointer', 
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '2px solid #ddd',
                      background: '#f2f2f2'
                    }}
                  >
                    주소 {getSortIcon('roadAddress')}
                  </th>
                  <th 
                    onClick={() => handleSort('phone')}
                    style={{ 
                      cursor: 'pointer', 
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '2px solid #ddd',
                      background: '#f2f2f2'
                    }}
                  >
                    전화번호 {getSortIcon('phone')}
                  </th>
                  <th 
                    onClick={() => handleSort('managerName')}
                    style={{ 
                      cursor: 'pointer', 
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '2px solid #ddd',
                      background: '#f2f2f2'
                    }}
                  >
                    담당자 {getSortIcon('managerName')}
                  </th>
                  <th 
                    onClick={() => handleSort('status')}
                    style={{ 
                      cursor: 'pointer', 
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '2px solid #ddd',
                      background: '#f2f2f2'
                    }}
                  >
                    상태 {getSortIcon('status')}
                  </th>
                  <th 
                    onClick={() => handleSort('operationStatus')}
                    style={{ 
                      cursor: 'pointer', 
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '2px solid #ddd',
                      background: '#f2f2f2'
                    }}
                  >
                    운영 상태 {getSortIcon('operationStatus')}
                  </th>
                  <th 
                    onClick={() => handleSort('createdAt')}
                    style={{ 
                      cursor: 'pointer', 
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '2px solid #ddd',
                      background: '#f2f2f2'
                    }}
                  >
                    등록일 {getSortIcon('createdAt')}
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd', background: '#f2f2f2' }}>관리</th>
                </tr>
              </thead>
              <tbody>
                {sortedBranches.map(branch => (
                  <tr key={branch.branchId} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '12px' }}>
                      <strong style={{ color: '#3498db' }}>
                        {branch.branchRegNo || '-'}
                      </strong>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <strong 
                        style={{ cursor: 'pointer', color: '#3498db' }}
                        onClick={() => navigate(`/branches/${branch.branchId}`)}
                      >
                        {branch.branchName}
                      </strong>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div>{branch.roadAddress}</div>
                      {branch.detailAddress && (
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {branch.detailAddress}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>{branch.phone || '-'}</td>
                    <td style={{ padding: '12px' }}>{branch.managerName || '-'}</td>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge ${getStatusBadge(branch.status)}`}>
                        {getStatusLabel(branch.status)}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge ${getOperationBadge(branch.operationStatus)}`}>
                        {getOperationLabel(branch.operationStatus)}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>{formatDate(branch.createdAt)}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn-sm"
                          onClick={() => navigate(`/branches/${branch.branchId}/edit`)}
                        >
                          수정
                        </button>
                        <button 
                          className="btn-del btn-sm"
                          onClick={() => handleDelete(branch.branchId)}
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

export default BranchList

