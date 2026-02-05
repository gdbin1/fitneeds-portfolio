import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { programApi, categoryApi, instructorApi, branchApi } from '../../api'

function ProgramList() {
  const { branchId: urlBranchId } = useParams()
  const navigate = useNavigate()
  const [branches, setBranches] = useState([])
  const [selectedBranchId, setSelectedBranchId] = useState(urlBranchId ? Number(urlBranchId) : null)
  const [selectedBranch, setSelectedBranch] = useState(null)
  const [programs, setPrograms] = useState([])
  const [categories, setCategories] = useState([])
  const [instructors, setInstructors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProgram, setEditingProgram] = useState(null)
  const [filterCategory, setFilterCategory] = useState('')
  const [formData, setFormData] = useState({
    categoryId: '',
    programName: '',
    programDesc: '',
    difficulty: 'BEGINNER',
    equipmentInfo: '',
    maxCapacity: 10,
    defaultInstructorId: '',
    singlePrice: 0,
    durationMinutes: 60,
    isVisible: true
  })

  useEffect(() => {
    loadBranches()
  }, [])

  useEffect(() => {
    if (selectedBranchId) {
      loadData()
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

  const loadData = async () => {
    if (!selectedBranchId) return
    
    try {
      setLoading(true)
      const [branchRes, programRes, categoryRes, instructorRes] = await Promise.all([
        branchApi.getById(selectedBranchId),
        programApi.getByBranch(selectedBranchId),
        categoryApi.getActiveByBranch(selectedBranchId),
        instructorApi.getActiveByBranch(selectedBranchId)
      ])
      setSelectedBranch(branchRes.data)
      setPrograms(programRes.data || [])
      setCategories(categoryRes.data || [])
      setInstructors(instructorRes.data || [])
    } catch (error) {
      console.error('Failed to load data:', error)
      alert('데이터를 불러오는데 실패했습니다. 😢')
      setPrograms([])
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
      navigate(`/centers/${branchId}/programs`, { replace: true })
    }
  }

  const filteredPrograms = filterCategory 
    ? programs.filter(p => p.categoryId === parseInt(filterCategory))
    : programs

  const handleOpenModal = (program = null) => {
    if (program) {
      setEditingProgram(program)
      setFormData({
        categoryId: program.categoryId,
        programName: program.programName,
        programDesc: program.programDesc || '',
        difficulty: program.difficulty,
        equipmentInfo: program.equipmentInfo || '',
        maxCapacity: program.maxCapacity,
        defaultInstructorId: program.defaultInstructorId || '',
        singlePrice: program.singlePrice,
        durationMinutes: program.durationMinutes,
        isVisible: program.isVisible
      })
    } else {
      setEditingProgram(null)
      setFormData({
        categoryId: categories[0]?.categoryId || '',
        programName: '',
        programDesc: '',
        difficulty: 'BEGINNER',
        equipmentInfo: '',
        maxCapacity: 10,
        defaultInstructorId: '',
        singlePrice: 0,
        durationMinutes: 60,
        isVisible: true
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingProgram(null)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
    }))
  }

  const handleSave = async () => {
    if (!formData.programName || !formData.categoryId) {
      alert('종목과 프로그램명을 입력해주세요. ✏️')
      return
    }

    try {
      const data = {
        ...formData,
        defaultInstructorId: formData.defaultInstructorId || null
      }
      
      if (editingProgram) {
        await programApi.update(selectedBranchId, editingProgram.programId, data)
        alert('프로그램이 수정되었습니다! ✨')
      } else {
        await programApi.create(selectedBranchId, data)
        alert('새 프로그램이 추가되었습니다! 🎉')
      }
      handleCloseModal()
      loadData()
    } catch (error) {
      console.error('Failed to save:', error)
      alert('저장에 실패했습니다. 😢\n\n' + (error.response?.data?.message || error.message))
    }
  }

  const handleToggleVisible = async (program) => {
    try {
      await programApi.updateVisible(selectedBranchId, program.programId, !program.isVisible)
      loadData()
    } catch (error) {
      console.error('Failed to update:', error)
      alert('상태 변경에 실패했습니다. 😢')
    }
  }

  const handleDelete = async (programId, programName) => {
    if (!window.confirm(`"${programName}" 프로그램을 삭제하시겠습니까? 🗑️\n\n관련 스케줄도 모두 삭제됩니다.`)) {
      return
    }

    try {
      await programApi.delete(selectedBranchId, programId)
      alert('프로그램이 삭제되었습니다. 🗑️')
      loadData()
    } catch (error) {
      console.error('Failed to delete:', error)
      alert('삭제에 실패했습니다. 😢\n\n' + (error.response?.data?.message || error.message))
    }
  }

  const getDifficultyLabel = (difficulty) => {
    switch (difficulty) {
      case 'BEGINNER': return '초급'
      case 'INTERMEDIATE': return '중급'
      case 'ADVANCED': return '고급'
      default: return difficulty
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'BEGINNER': return { bg: '#d4edda', color: '#155724' }
      case 'INTERMEDIATE': return { bg: '#fff3cd', color: '#856404' }
      case 'ADVANCED': return { bg: '#f8d7da', color: '#721c24' }
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
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        borderRadius: '16px',
        padding: '24px',
        color: '#fff',
        boxShadow: '0 4px 15px rgba(245, 87, 108, 0.3)'
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
              <span style={{ fontSize: '32px' }}>📋</span>
              운동 프로그램 관리
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
              color: '#f5576c',
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
            새 프로그램 추가
          </button>
        </div>
      </div>

      {/* 지점 선택 및 필터 */}
      <div className="content-box" style={{ marginBottom: '20px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px',
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
              e.target.style.borderColor = '#f5576c'
              e.target.style.boxShadow = '0 0 0 3px rgba(245, 87, 108, 0.1)'
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
          <label style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            color: '#333',
            marginLeft: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>🏷️</span>
            종목 필터:
          </label>
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{
              padding: '12px 20px',
              fontSize: '16px',
              border: '2px solid #e0e0e0',
              borderRadius: '12px',
              minWidth: '200px',
              backgroundColor: '#fff',
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.3s ease',
              fontWeight: '500'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#f5576c'
              e.target.style.boxShadow = '0 0 0 3px rgba(245, 87, 108, 0.1)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e0e0e0'
              e.target.style.boxShadow = 'none'
            }}
          >
            <option value="">전체</option>
            {categories.map(cat => (
              <option key={cat.categoryId} value={cat.categoryId}>
                {cat.categoryName}
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
              총 {filteredPrograms.length}개 프로그램
            </div>
          )}
        </div>
      </div>

      {/* 프로그램 목록 */}
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
      ) : filteredPrograms.length === 0 ? (
        <div className="content-box" style={{ textAlign: 'center', padding: '80px 40px' }}>
          <div style={{ fontSize: '80px', marginBottom: '20px' }}>📋</div>
          <h3 style={{ marginBottom: '12px', color: '#333', fontSize: '24px', fontWeight: '600' }}>
            등록된 프로그램이 없습니다
          </h3>
          <p style={{ color: '#666', marginBottom: '24px', fontSize: '16px' }}>
            {filterCategory ? '선택한 종목에 등록된 프로그램이 없습니다.' : '운동 프로그램을 추가하여 수업을 구성하세요.'}
          </p>
          <button
            onClick={() => handleOpenModal()}
            style={{
              padding: '14px 28px',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(245, 87, 108, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(245, 87, 108, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(245, 87, 108, 0.3)'
            }}
          >
            <span>➕</span>
            첫 프로그램 추가하기
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
                {selectedBranch?.branchName} 운동 프로그램
              </h2>
              <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                {filteredPrograms.length}개의 프로그램이 등록되어 있습니다.
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
                    textAlign: 'left', 
                    fontWeight: '700',
                    color: '#fff',
                    backgroundColor: '#f5576c',
                    border: 'none',
                    fontSize: '14px'
                  }}>
                    종목
                  </th>
                  <th style={{ 
                    padding: '16px 12px', 
                    textAlign: 'left', 
                    fontWeight: '700',
                    color: '#fff',
                    backgroundColor: '#f5576c',
                    border: 'none',
                    fontSize: '14px'
                  }}>
                    프로그램명
                  </th>
                  <th style={{ 
                    padding: '16px 12px', 
                    textAlign: 'center', 
                    fontWeight: '700',
                    color: '#fff',
                    backgroundColor: '#f5576c',
                    border: 'none',
                    fontSize: '14px'
                  }}>
                    난이도
                  </th>
                  <th style={{ 
                    padding: '16px 12px', 
                    textAlign: 'center', 
                    fontWeight: '700',
                    color: '#fff',
                    backgroundColor: '#f5576c',
                    border: 'none',
                    fontSize: '14px'
                  }}>
                    정원
                  </th>
                  <th style={{ 
                    padding: '16px 12px', 
                    textAlign: 'center', 
                    fontWeight: '700',
                    color: '#fff',
                    backgroundColor: '#f5576c',
                    border: 'none',
                    fontSize: '14px'
                  }}>
                    시간
                  </th>
                  <th style={{ 
                    padding: '16px 12px', 
                    textAlign: 'right', 
                    fontWeight: '700',
                    color: '#fff',
                    backgroundColor: '#f5576c',
                    border: 'none',
                    fontSize: '14px'
                  }}>
                    단가
                  </th>
                  <th style={{ 
                    padding: '16px 12px', 
                    textAlign: 'center', 
                    fontWeight: '700',
                    color: '#fff',
                    backgroundColor: '#f5576c',
                    border: 'none',
                    fontSize: '14px'
                  }}>
                    기본 강사
                  </th>
                  <th style={{ 
                    padding: '16px 12px', 
                    textAlign: 'center', 
                    fontWeight: '700',
                    color: '#fff',
                    backgroundColor: '#f5576c',
                    border: 'none',
                    fontSize: '14px'
                  }}>
                    노출
                  </th>
                  <th style={{ 
                    padding: '16px 12px', 
                    textAlign: 'center', 
                    fontWeight: '700',
                    color: '#fff',
                    backgroundColor: '#f5576c',
                    border: 'none',
                    fontSize: '14px'
                  }}>
                    관리
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPrograms.map((program, index) => {
                  const diffColor = getDifficultyColor(program.difficulty)
                  return (
                    <tr 
                      key={program.programId}
                      style={{ 
                        borderBottom: '1px solid #f0f0f0',
                        transition: 'all 0.2s ease',
                        backgroundColor: index % 2 === 0 ? '#fff' : '#fafafa'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#fff5f7'
                        e.currentTarget.style.transform = 'scale(1.01)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#fff' : '#fafafa'
                        e.currentTarget.style.transform = 'scale(1)'
                      }}
                    >
                      <td style={{ padding: '20px 12px' }}>
                        <span style={{ 
                          padding: '6px 14px',
                          background: '#d1ecf1',
                          borderRadius: '12px',
                          color: '#0c5460',
                          fontSize: '13px',
                          fontWeight: '600'
                        }}>
                          {program.categoryName}
                        </span>
                      </td>
                      <td style={{ padding: '20px 12px' }}>
                        <strong style={{ 
                          fontSize: '17px', 
                          color: '#333',
                          display: 'block',
                          marginBottom: '6px',
                          fontWeight: '700'
                        }}>
                          {program.programName}
                        </strong>
                        {program.programDesc && (
                          <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                            {program.programDesc}
                          </div>
                        )}
                        {program.equipmentInfo && (
                          <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                            🏋️ {program.equipmentInfo}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '20px 12px', textAlign: 'center' }}>
                        <span style={{ 
                          padding: '6px 14px',
                          background: diffColor.bg,
                          borderRadius: '12px',
                          color: diffColor.color,
                          fontSize: '13px',
                          fontWeight: '600'
                        }}>
                          {getDifficultyLabel(program.difficulty)}
                        </span>
                      </td>
                      <td style={{ padding: '20px 12px', textAlign: 'center', color: '#666', fontSize: '15px', fontWeight: '600' }}>
                        <span style={{ 
                          padding: '4px 12px',
                          background: '#fff3cd',
                          borderRadius: '8px',
                          color: '#856404'
                        }}>
                          {program.maxCapacity}명
                        </span>
                      </td>
                      <td style={{ padding: '20px 12px', textAlign: 'center', color: '#666', fontSize: '15px', fontWeight: '600' }}>
                        <span style={{ 
                          padding: '4px 12px',
                          background: '#e8f4f8',
                          borderRadius: '8px',
                          color: '#0c5460'
                        }}>
                          {program.durationMinutes}분
                        </span>
                      </td>
                      <td style={{ padding: '20px 12px', textAlign: 'right', color: '#333', fontWeight: '700', fontSize: '15px' }}>
                        <span style={{ 
                          padding: '4px 12px',
                          background: '#d4edda',
                          borderRadius: '8px',
                          color: '#155724'
                        }}>
                          {Number(program.singlePrice).toLocaleString()}원
                        </span>
                      </td>
                      <td style={{ padding: '20px 12px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
                        {program.instructorName || <span style={{ color: '#999', fontStyle: 'italic' }}>-</span>}
                      </td>
                      <td style={{ padding: '20px 12px', textAlign: 'center' }}>
                        <span 
                          onClick={() => handleToggleVisible(program)}
                          style={{ 
                            display: 'inline-block',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            fontSize: '13px',
                            fontWeight: '600',
                            backgroundColor: program.isVisible ? '#d4edda' : '#f8d7da',
                            color: program.isVisible ? '#155724' : '#721c24',
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
                          {program.isVisible ? '✅ 노출' : '❌ 숨김'}
                        </span>
                      </td>
                      <td style={{ padding: '20px 12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button 
                            onClick={() => handleOpenModal(program)}
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
                            onClick={() => handleDelete(program.programId, program.programName)}
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
                  )
                })}
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
            className="content-box modal-container"
            style={{ 
              maxWidth: '550px', 
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
              marginBottom: '16px', 
              paddingBottom: '12px', 
              borderBottom: '3px solid #f0f0f0' 
            }}>
              <h3 style={{ 
                margin: 0,
                fontSize: '20px',
                fontWeight: '700',
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '24px' }}>
                  {editingProgram ? '✏️' : '➕'}
                </span>
                {editingProgram ? '프로그램 수정' : '새 프로그램 추가'}
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
            
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ 
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    종목 <span style={{ color: '#f5576c' }}>*</span>
                  </label>
                  <select 
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    style={{ 
                      padding: '10px 14px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '10px',
                      width: '100%',
                      fontSize: '14px',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box',
                      cursor: 'pointer'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#f5576c'
                      e.target.style.boxShadow = '0 0 0 3px rgba(245, 87, 108, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e0e0e0'
                      e.target.style.boxShadow = 'none'
                    }}
                  >
                    <option value="">선택하세요</option>
                    {categories.map(cat => (
                      <option key={cat.categoryId} value={cat.categoryId}>
                        {cat.categoryName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ 
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    난이도
                  </label>
                  <select 
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    style={{ 
                      padding: '10px 14px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '10px',
                      width: '100%',
                      fontSize: '14px',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box',
                      cursor: 'pointer'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#f5576c'
                      e.target.style.boxShadow = '0 0 0 3px rgba(245, 87, 108, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e0e0e0'
                      e.target.style.boxShadow = 'none'
                    }}
                  >
                    <option value="BEGINNER">초급</option>
                    <option value="INTERMEDIATE">중급</option>
                    <option value="ADVANCED">고급</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ 
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  프로그램명 <span style={{ color: '#f5576c' }}>*</span>
                </label>
                <input 
                  type="text"
                  name="programName"
                  placeholder="예: 기구 필라테스 초급"
                  value={formData.programName}
                  onChange={handleChange}
                  style={{ 
                    padding: '10px 14px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '10px',
                    width: '100%',
                    fontSize: '14px',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#f5576c'
                    e.target.style.boxShadow = '0 0 0 3px rgba(245, 87, 108, 0.1)'
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
                  marginBottom: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  프로그램 설명
                </label>
                <textarea 
                  name="programDesc"
                  placeholder="프로그램에 대한 설명을 입력하세요."
                  value={formData.programDesc}
                  onChange={handleChange}
                  style={{ 
                    padding: '10px 14px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '10px',
                    width: '100%',
                    minHeight: '60px',
                    fontSize: '14px',
                    resize: 'vertical',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#f5576c'
                    e.target.style.boxShadow = '0 0 0 3px rgba(245, 87, 108, 0.1)'
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
                  marginBottom: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  사용 장비
                </label>
                <input 
                  type="text"
                  name="equipmentInfo"
                  placeholder="예: 리포머, 캐딜락"
                  value={formData.equipmentInfo}
                  onChange={handleChange}
                  style={{ 
                    padding: '10px 14px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '10px',
                    width: '100%',
                    fontSize: '14px',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#f5576c'
                    e.target.style.boxShadow = '0 0 0 3px rgba(245, 87, 108, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e0e0e0'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ 
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    최대 정원
                  </label>
                  <input 
                    type="number"
                    name="maxCapacity"
                    value={formData.maxCapacity}
                    onChange={handleChange}
                    min="1"
                    style={{ 
                      padding: '10px 14px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '10px',
                      width: '100%',
                      fontSize: '14px',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#f5576c'
                      e.target.style.boxShadow = '0 0 0 3px rgba(245, 87, 108, 0.1)'
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
                    marginBottom: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    수업 시간(분)
                  </label>
                  <input 
                    type="number"
                    name="durationMinutes"
                    value={formData.durationMinutes}
                    onChange={handleChange}
                    min="1"
                    step="5"
                    style={{ 
                      padding: '10px 14px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '10px',
                      width: '100%',
                      fontSize: '14px',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#f5576c'
                      e.target.style.boxShadow = '0 0 0 3px rgba(245, 87, 108, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e0e0e0'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ 
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    단건 결제 금액 (원)
                  </label>
                  <input 
                    type="number"
                    name="singlePrice"
                    value={formData.singlePrice}
                    onChange={handleChange}
                    min="0"
                    step="1000"
                    style={{ 
                      padding: '10px 14px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '10px',
                      width: '100%',
                      fontSize: '14px',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#f5576c'
                      e.target.style.boxShadow = '0 0 0 3px rgba(245, 87, 108, 0.1)'
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
                    marginBottom: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    기본 강사
                  </label>
                  <select 
                    name="defaultInstructorId"
                    value={formData.defaultInstructorId}
                    onChange={handleChange}
                    style={{ 
                      padding: '10px 14px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '10px',
                      width: '100%',
                      fontSize: '14px',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box',
                      cursor: 'pointer'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#f5576c'
                      e.target.style.boxShadow = '0 0 0 3px rgba(245, 87, 108, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e0e0e0'
                      e.target.style.boxShadow = 'none'
                    }}
                  >
                    <option value="">선택 안함</option>
                    {instructors.map(inst => (
                      <option key={inst.instructorId} value={inst.instructorId}>
                        {inst.instructorName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px',
                  padding: '10px 14px',
                  background: formData.isVisible ? '#d4edda' : '#f8d7da',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}>
                  <input 
                    type="checkbox"
                    name="isVisible"
                    checked={formData.isVisible}
                    onChange={handleChange}
                    style={{ 
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer'
                    }}
                  />
                  <span style={{ 
                    fontSize: '13px',
                    fontWeight: '600',
                    color: formData.isVisible ? '#155724' : '#721c24'
                  }}>
                    {formData.isVisible ? '✅ 프로그램 노출' : '❌ 프로그램 숨김'}
                  </span>
                </label>
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              justifyContent: 'flex-end', 
              marginTop: '20px', 
              paddingTop: '16px', 
              borderTop: '3px solid #f0f0f0' 
            }}>
              <button 
                onClick={handleCloseModal}
                style={{
                  padding: '10px 20px',
                  background: '#f8f9fa',
                  color: '#666',
                  border: '2px solid #e0e0e0',
                  borderRadius: '10px',
                  fontSize: '14px',
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
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(245, 87, 108, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(245, 87, 108, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(245, 87, 108, 0.3)'
                }}
              >
                {editingProgram ? '💾 수정하기' : '✨ 추가하기'}
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
        .modal-container {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
        }
        .modal-container::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
      `}</style>
    </div>
  )
}

export default ProgramList
