import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { sportTypeApi } from '../api'

function AdminSportTypePage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const response = await sportTypeApi.getAll()
      setItems(response.data || [])
    } catch (error) {
      console.error('Error loading data:', error)
      alert('데이터를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingItem(null)
    setShowModal(true)
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setShowModal(true)
  }

  const handleDelete = async (sportId) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    
    try {
      await sportTypeApi.delete(sportId)
      alert('삭제되었습니다.')
      loadData()
    } catch (error) {
      console.error('Error deleting:', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  const handleSave = async (formData) => {
    try {
      if (editingItem) {
        await sportTypeApi.update(editingItem.sportId, formData)
        alert('수정되었습니다.')
      } else {
        await sportTypeApi.create(formData)
        alert('생성되었습니다.')
      }
      setShowModal(false)
      loadData()
    } catch (error) {
      console.error('Error saving:', error)
      alert('저장 중 오류가 발생했습니다.')
    }
  }

  if (loading) {
    return <div className="p-4">로딩 중...</div>
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>운동 종류 관리</h2>
        <button className="btn btn-primary" onClick={handleCreate}>
          <i className="bi bi-plus-circle"></i> 추가
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
            <th>Sport ID</th>
            <th>Sport Name</th>
            <th>Sport Memo</th>
            <th>Sport Use</th>
            <th>Registration Date Time</th>
            <th>Update Date Time</th>
            <th>Delete Date Time</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.sportId}>
                <td>{item.sportId}</td>
                <td>{item.sportNm}</td>
                <td>{item.sportMemo || '-'}</td>
                <td>{item.useYn ? '사용' : '미사용'}</td>
                <td>{item.regDt ? new Date(item.regDt).toLocaleString() : '-'}</td>
                <td>{item.updDt ? new Date(item.updDt).toLocaleString() : '-'}</td>
                <td>{item.delDt ? new Date(item.delDt).toLocaleString() : '-'}</td>
                <td>
                  <button 
                    className="btn btn-sm btn-outline-primary me-2" 
                    onClick={() => handleEdit(item)}
                  >
                    수정
                  </button>
                  <button 
                    className="btn btn-sm btn-outline-danger" 
                    onClick={() => handleDelete(item.sportId)}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingItem ? '수정' : '추가'}</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>폼 구현 필요</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminSportTypePage
