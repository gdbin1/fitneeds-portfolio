import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { branchInfoApi, branchApi, programApi, sportTypeApi } from '../../api'

function CenterInfo() {
  const { branchId } = useParams()
  const navigate = useNavigate()
  const [branches, setBranches] = useState([])
  const [branch, setBranch] = useState(null)
  const [centerInfo, setCenterInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editStates, setEditStates] = useState({
    time: false,
    holiday: false,
    policy: false
  })
  const [formData, setFormData] = useState({
    openTime: '06:00',
    closeTime: '23:00',
    breakStartTime: '',
    breakEndTime: '',
    holidayInfo: '',
    policyInfo: ''
  })

  // 공휴일 정보 가져오기 (2026년 기준)
  const getPublicHolidays = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 1-12

    const holidayMap = {
      1: [{ date: '1월 1일', name: '신정' }],
      2: [{ date: '2월 16일', name: '설날 연휴' }, { date: '2월 17일', name: '설날' }, { date: '2월 18일', name: '설날 연휴' }],
      3: [{ date: '3월 1일', name: '삼일절' }],
      5: [{ date: '5월 5일', name: '어린이날' }, { date: '5월 24일', name: '부처님 오신 날' }],
      6: [{ date: '6월 6일', name: '현충일' }],
      8: [{ date: '8월 15일', name: '광복절' }],
      9: [{ date: '9월 24일', name: '추석 연휴' }, { date: '9월 25일', name: '추석' }, { date: '9월 26일', name: '추석 연휴' }],
      10: [{ date: '10월 3일', name: '개천절' }, { date: '10월 9일', name: '한글날' }],
      12: [{ date: '12월 25일', name: '성탄절' }]
    };

    return holidayMap[month] || [];
  };

  const currentMonthHolidays = getPublicHolidays();

  const [programs, setPrograms] = useState([])
  const [allPrograms, setAllPrograms] = useState([])
  const [programsLoading, setProgramsLoading] = useState(false)
  const [sportTypes, setSportTypes] = useState([])
  const [showProgramModal, setShowProgramModal] = useState(false)
  const [editingProgram, setEditingProgram] = useState(null)
  const [programFormData, setProgramFormData] = useState({
    progNm: '',
    sportId: '',
    brchId: branchId,
    useYn: 1,
    oneTimeAmt: 0,
  })

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await Promise.all([
        loadBranches(),
        loadSportTypes()
      ])

      if (branchId && branchId !== 'all') {
        await loadData()
      } else {
        setLoading(false)
        if (branchId === 'all') {
          await loadPrograms()
        }
      }
    }
    init()
  }, [branchId])

  // 지점이 변경되고 데이터 로딩이 완료되면 프로그램 관리 섹션으로 스크롤
  useEffect(() => {
    if (branchId && branchId !== 'all' && !loading && !programsLoading && programs.length >= 0) {
      // 프로그램 섹션이 렌더링될 때까지 대기 후 스크롤
      const scrollToPrograms = () => {
        const programSection = document.getElementById('program-management')
        if (programSection) {
          programSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
          return true
        }
        return false
      }

      const timer = setTimeout(scrollToPrograms, 300)
      return () => clearTimeout(timer)
    }
  }, [branchId, loading, programsLoading])

  const loadBranches = async () => {
    try {
      const response = await branchApi.getAll()
      const branchesData = Array.isArray(response) ? response : (response?.data || [])
      setBranches(branchesData)
      if (!branchId && branchesData.length > 0) {
        navigate(`/centers/${branchesData[0].brchId}`, { replace: true })
      }
      return branchesData
    } catch (error) {
      console.error('Failed to load branches:', error)
      return []
    }
  }

  const loadData = async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      // 저장 중일 때는 로딩하지 않음 (데이터 충돌 방지)
      if (saving && silent) return;

      console.log('Fetching data for branch:', branchId)

      const [branchData, branchInfoRes] = await Promise.all([
        branchApi.getById(branchId),
        branchInfoApi.getAll().catch(() => [])
      ])

      console.log('Branch data received:', branchData)
      setBranch(branchData)

      const branchInfoList = Array.isArray(branchInfoRes) ? branchInfoRes : (branchInfoRes?.data || [])
      const foundInfo = branchInfoList.find(bi =>
        String(bi.brchId || bi.brch_id) === String(branchId)
      )

      if (foundInfo) {
        // 저장 중인 섹션이 있으면 해당 데이터는 덮어쓰지 않음
        setCenterInfo(foundInfo)
        setFormData(prev => {
          // 이미 수정 중인 상태라면 덮어쓰지 않음 (단, silent 로드일 때만)
          if (silent && (editStates.time || editStates.holiday || editStates.policy)) {
            return prev;
          }

          return {
            openTime: (foundInfo.openTime || foundInfo.open_time || '09:00').toString().substring(0, 5),
            closeTime: (foundInfo.closeTime || foundInfo.close_time || '22:00').toString().substring(0, 5),
            breakStartTime: (foundInfo.breakStartTime || foundInfo.break_start_time || '').toString().substring(0, 5),
            breakEndTime: (foundInfo.breakEndTime || foundInfo.break_end_time || '').toString().substring(0, 5),
            holidayInfo: foundInfo.holidayInfo || foundInfo.holiday_info || '',
            policyInfo: foundInfo.policyInfo || foundInfo.policy_info || ''
          }
        })
      } else {
        // ... 기존 defaultData 로직 동일
        const branchName = branchData?.brchNm || branchData?.branchName || '지점'
        const defaultData = {
          openTime: '09:00',
          closeTime: '22:00',
          breakStartTime: '12:00',
          breakEndTime: '13:00',
          holidayInfo: '매주 일요일 휴무',
          policyInfo: `${branchName}의 기본 운영 정책입니다. 예약 취소는 24시간 전까지 가능합니다.`
        }
        setCenterInfo(null)
        if (!silent || (!editStates.time && !editStates.holiday && !editStates.policy)) {
          setFormData(defaultData)
        }
      }

      await loadPrograms(branchData)
    } catch (error) {
      console.error('Failed to load data:', error)
      if (!silent) alert('데이터를 불러오는 중 오류가 발생했습니다.')
    } finally {
      if (!silent) setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async (section = null) => {
    try {
      setSaving(true)
      const data = {
        brchId: branchId === 'all' ? null : parseInt(branchId),
        openTime: formData.openTime ? (formData.openTime.length === 5 ? `${formData.openTime}:00` : formData.openTime) : '06:00:00',
        closeTime: formData.closeTime ? (formData.closeTime.length === 5 ? `${formData.closeTime}:00` : formData.closeTime) : '23:00:00',
        breakStartTime: formData.breakStartTime && formData.breakStartTime !== '' ? (formData.breakStartTime.length === 5 ? `${formData.breakStartTime}:00` : formData.breakStartTime) : null,
        breakEndTime: formData.breakEndTime && formData.breakEndTime !== '' ? (formData.breakEndTime.length === 5 ? `${formData.breakEndTime}:00` : formData.breakEndTime) : null,
        holidayInfo: formData.holidayInfo || null,
        policyInfo: formData.policyInfo || null
      }

      const existingBrInfoId = centerInfo?.brInfoId || centerInfo?.br_info_id
      let savedResult;

      if (existingBrInfoId) {
        savedResult = await branchInfoApi.update(existingBrInfoId, data)
      } else {
        savedResult = await branchInfoApi.create(data)
      }

      // 서버에서 반환된 데이터 또는 보낸 데이터로 상태 고정
      const finalData = (savedResult && typeof savedResult === 'object' && (savedResult.brInfoId || savedResult.openTime))
        ? savedResult
        : { ...data, brInfoId: existingBrInfoId };

      setCenterInfo(finalData)

      // 즉시 UI 반영 (HH:mm 형식)
      const formatTime = (t) => t ? t.toString().substring(0, 5) : '';

      setFormData({
        openTime: formatTime(finalData.openTime || finalData.open_time || data.openTime || '09:00'),
        closeTime: formatTime(finalData.closeTime || finalData.close_time || data.closeTime || '22:00'),
        breakStartTime: formatTime(finalData.breakStartTime || finalData.break_start_time || data.breakStartTime),
        breakEndTime: formatTime(finalData.breakEndTime || finalData.break_end_time || data.breakEndTime),
        holidayInfo: finalData.holidayInfo || finalData.holiday_info || data.holidayInfo || '',
        policyInfo: finalData.policyInfo || finalData.policy_info || data.policyInfo || ''
      })

      if (section) {
        setEditStates(prev => ({ ...prev, [section]: false }))
      } else {
        setEditStates({ time: false, holiday: false, policy: false })
      }

      console.log('Save successful, UI state updated and fixed.')
    } catch (error) {
      console.error('Failed to save:', error)
      const errorMessage = error.response?.data?.message || error.response?.data || error.message
      alert('저장에 실패했습니다. ' + errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = (section = null) => {
    if (section) {
      setEditStates(prev => ({ ...prev, [section]: false }))
    } else {
      setEditStates({ time: false, holiday: false, policy: false })
    }
    loadData()
  }

  const loadPrograms = async (targetBranch = null) => {
    try {
      setProgramsLoading(true)
      console.log('Fetching all programs... Current branchId:', branchId)
      const response = await programApi.getAll()

      let fetchedPrograms = []
      if (Array.isArray(response)) {
        fetchedPrograms = response
      } else if (Array.isArray(response?.data)) {
        fetchedPrograms = response.data
      } else if (response?.data) {
        fetchedPrograms = [response.data]
      }

      console.log('Total programs fetched from DB:', fetchedPrograms.length)
      console.log('Sample program names:', fetchedPrograms.slice(0, 3).map(p => p.progNm))

      setAllPrograms(fetchedPrograms)

      // 전체 지점 선택 시 모든 프로그램 표시
      if (branchId === 'all' || !branchId) {
        console.log('Showing all programs (all branches mode)')
        setPrograms(fetchedPrograms)
        return
      }

      // 현재 지점 정보 가져오기 (전달받은 데이터 우선, 없으면 상태, 없으면 목록에서 찾기)
      let currentBranch = targetBranch || branch
      if (!currentBranch || String(currentBranch.brchId || currentBranch.branchId) !== String(branchId)) {
        currentBranch = branches.find(b => String(b.brchId || b.branchId) === String(branchId))

        if (!currentBranch && branchId) {
          try {
            console.log('Branch not found in state/list, fetching by ID:', branchId)
            currentBranch = await branchApi.getById(branchId)
          } catch (error) {
            console.error('Failed to fetch branch by ID:', error)
          }
        }
      }

      const currentBranchName = currentBranch?.brchNm || currentBranch?.branchName || ''
      console.log('Target branch for filtering:', currentBranchName)

      if (currentBranchName) {
        // 프로그램명이 현재 지점명을 포함하고 있는지 확인 (대소문자 무시, 공백 제거 후 비교)
        const searchName = currentBranchName.toLowerCase().replace(/\s+/g, '')
        const filtered = fetchedPrograms.filter(program => {
          const progNm = (program.progNm || program.programName || '').toLowerCase().replace(/\s+/g, '')
          return progNm.includes(searchName)
        })
        console.log(`Filtered programs for "${currentBranchName}":`, filtered.length)
        setPrograms(filtered)
      } else {
        console.warn('Branch name is empty, showing no programs for specific branch')
        setPrograms([])
      }
    } catch (error) {
      console.error('Error in loadPrograms:', error)
      setPrograms([])
    } finally {
      setProgramsLoading(false)
    }
  }

  const loadSportTypes = async () => {
    try {
      const response = await sportTypeApi.getAll()
      // API 응답이 배열이면 그대로 사용, 아니면 response.data 사용
      let sportTypesData = Array.isArray(response) ? response : (response?.data || [])
      // useYn이 1인 항목만 필터링 (사용 가능한 스포츠 종목만)
      sportTypesData = sportTypesData.filter(sport => sport.useYn === 1 || sport.useYn === undefined)
      setSportTypes(sportTypesData)
      console.log('Loaded sport types from sport_type table:', sportTypesData)
    } catch (error) {
      console.error('Failed to load sport types:', error)
      setSportTypes([])
    }
  }

  const handleProgramCreate = () => {
    setEditingProgram(null)
    setProgramFormData({
      progNm: '',
      sportId: '',
      brchId: branchId,
      useYn: 1,
      oneTimeAmt: '',
    })
    setShowProgramModal(true)
  }

  const handleProgramEdit = (program) => {
    setEditingProgram(program)

    // 현재 지점명 가져오기
    const branchName = branch?.brchNm || branch?.branchName ||
      (branchId ? branches.find(b => String(b.brchId || b.branchId) === String(branchId))?.brchNm : null) || ''

    // 수정 시에는 프로그램명에서 지점명 접두사 제거하여 표시
    let displayProgNm = program.progNm || ''
    if (branchName && displayProgNm.startsWith(branchName)) {
      displayProgNm = displayProgNm.substring(branchName.length).trim()
    }

    setProgramFormData({
      progNm: displayProgNm,
      sportId: Number(program.sportId || ''),
      brchId: Number(branchId),
      useYn: program.useYn !== undefined ? program.useYn : 1,
      oneTimeAmt: program.oneTimeAmt ? Number(program.oneTimeAmt) : '',
    })
    setShowProgramModal(true)
  }

  const handleProgramDelete = async (progId) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      await programApi.delete(progId)
      alert('삭제되었습니다.')
      loadPrograms()
    } catch (error) {
      console.error('Error deleting program:', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  const handleProgramChange = (e) => {
    const { name, value } = e.target
    setProgramFormData(prev => ({
      ...prev,
      [name]: name === 'useYn' ? (value === '1' ? 1 : 0) :
        (name === 'oneTimeAmt' ? (value === '' ? '' : parseInt(value)) : value)
    }))
  }

  const handleProgramSave = async () => {
    if (!programFormData.progNm || !programFormData.sportId) {
      alert('프로그램명과 스포츠 종목을 입력해주세요.')
      return
    }

    try {
      // 현재 지점명 가져오기
      const currentBranchName = branch?.brchNm || branch?.branchName ||
        (branchId ? branches.find(b => String(b.brchId || b.branchId) === String(branchId))?.brchNm : null) || ''

      // 프로그램명 앞에 지점명 항상 붙이기 (목록 필터링을 위해)
      let programName = programFormData.progNm.trim()
      if (currentBranchName) {
        // 이미 지점명이 포함되어 있는지 확인
        if (!programName.startsWith(currentBranchName)) {
          programName = `${currentBranchName} ${programName}`
        }
      }

      const data = {
        progNm: programName,
        sportId: programFormData.sportId,
        brchId: programFormData.brchId,
        useYn: programFormData.useYn,
        oneTimeAmt: parseInt(programFormData.oneTimeAmt),
      }

      if (editingProgram) {
        await programApi.update(editingProgram.progId, data)
      } else {
        await programApi.create(data)
      }

      setShowProgramModal(false)
      // 저장 후 최신 데이터 다시 로드
      loadPrograms()
    } catch (error) {
      console.error('Failed to save program:', error)
      alert('저장에 실패했습니다. ' + (error.response?.data?.message || error.message))
    }
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '16px',
        color: '#666'
      }}>
        로딩 중...
      </div>
    )
  }

  const currentBranchName = branchId === 'all' ? null : (
    branch?.brchNm || branch?.branchName ||
    (branchId ? branches.find(b => String(b.brchId || b.branchId) === String(branchId))?.brchNm : null)
  )
  const pageTitle = branchId === 'all' ? '센터 관리 (전체 지점)' :
    (currentBranchName ? `${currentBranchName} 센터 관리` : '센터 관리')

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f7fa',
      padding: '24px',
      overflowX: 'hidden',
      overflowY: 'auto'
    }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#fff',
        padding: '24px 32px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        maxWidth: '1400px',
        width: '100%',
        margin: '0 auto 24px auto',
        border: '1px solid #e9ecef',
        boxSizing: 'border-box'
      }}>
        <div>
          <h1 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: '600',
            color: '#1a1a1a',
            marginBottom: '4px'
          }}>
            {pageTitle}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <p style={{
              margin: 0,
              color: '#666',
              fontSize: '14px'
            }}>
              운영 정보 관리
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select
            value={branchId || 'all'}
            onChange={(e) => {
              const selectedValue = e.target.value
              if (selectedValue === 'all') {
                navigate('/centers/all')
              } else if (selectedValue) {
                navigate(`/centers/${selectedValue}`)
              }
            }}
            style={{
              padding: '10px 16px',
              paddingRight: '40px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '14px',
              background: '#fff',
              cursor: 'pointer',
              minWidth: '180px',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center'
            }}
          >
            <option value="all">전체 지점</option>
            {branches.map(b => (
              <option key={b.brchId || b.branchId} value={b.brchId || b.branchId}>
                {b.brchNm || b.branchName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 메인 컨텐츠 그리드 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        maxWidth: '1400px',
        width: '100%',
        margin: '0 auto',
        boxSizing: 'border-box'
      }}>
        {/* 운영 시간 카드 */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #e9ecef',
          boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #f0f0f0' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1a1a1a' }}>운영 시간</h2>
            <div>
              {!editStates.time ? (
                <button onClick={() => setEditStates(prev => ({ ...prev, time: true }))} style={{ padding: '6px 16px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>수정</button>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleCancel('time')} style={{ padding: '6px 12px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>취소</button>
                  <button onClick={() => handleSave('time')} disabled={saving} style={{ padding: '6px 12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>{saving ? '...' : '저장'}</button>
                </div>
              )}
            </div>
          </div>

          {editStates.time ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#333' }}>운영 시간</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input type="time" name="openTime" value={formData.openTime} onChange={handleChange} style={{ flex: 1, padding: '10px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '14px' }} />
                  <span style={{ color: '#999' }}>~</span>
                  <input type="time" name="closeTime" value={formData.closeTime} onChange={handleChange} style={{ flex: 1, padding: '10px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '14px' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#333' }}>휴게 시간</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input type="time" name="breakStartTime" value={formData.breakStartTime} onChange={handleChange} style={{ flex: 1, padding: '10px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '14px' }} />
                  <span style={{ color: '#999' }}>~</span>
                  <input type="time" name="breakEndTime" value={formData.breakEndTime} onChange={handleChange} style={{ flex: 1, padding: '10px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '14px' }} />
                </div>
                <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#999' }}>* 휴게 시간은 선택사항입니다.</p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '200px', padding: '10px 0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '14px', color: '#888', fontWeight: '500' }}>운영 시간</span>
                <span style={{ fontSize: '20px', color: '#333', fontWeight: '600' }}>{formData.openTime || '--:--'} ~ {formData.closeTime || '--:--'}</span>
              </div>
              <div style={{ width: '40px', height: '2px', background: '#f0f0f0' }}></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '14px', color: '#888', fontWeight: '500' }}>휴게 시간</span>
                <span style={{ fontSize: '18px', color: '#555', fontWeight: '500' }}>
                  {formData.breakStartTime || formData.breakEndTime ? (
                    `${formData.breakStartTime || '--:--'} ~ ${formData.breakEndTime || '--:--'}`
                  ) : (
                    <span style={{ color: '#ccc', fontSize: '14px', fontStyle: 'italic' }}>설정된 휴게 시간이 없습니다.</span>
                  )}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 휴무일 정보 카드 */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #e9ecef',
          boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #f0f0f0' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1a1a1a' }}>휴무일 정보</h2>
            <div>
              {!editStates.holiday ? (
                <button onClick={() => setEditStates(prev => ({ ...prev, holiday: true }))} style={{ padding: '6px 16px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>수정</button>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleCancel('holiday')} style={{ padding: '6px 12px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>취소</button>
                  <button onClick={() => handleSave('holiday')} disabled={saving} style={{ padding: '6px 12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>{saving ? '...' : '저장'}</button>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 기본 공휴일 정보 (항상 표시) */}
            <div>
              <span style={{ fontSize: '14px', color: '#888', fontWeight: '500', display: 'block', marginBottom: '10px' }}>이번 달 공휴일</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {currentMonthHolidays.length > 0 ? (
                  currentMonthHolidays.map((h, i) => (
                    <div key={i} style={{
                      padding: '6px 12px',
                      background: '#fff1f0',
                      border: '1px solid #ffa39e',
                      borderRadius: '6px',
                      color: '#cf1322',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}>
                      <span style={{ marginRight: '6px', opacity: 0.8 }}>{h.date}</span>
                      {h.name}
                    </div>
                  ))
                ) : (
                  <span style={{ color: '#ccc', fontSize: '13px', fontStyle: 'italic' }}>이번 달은 공휴일이 없습니다.</span>
                )}
              </div>
            </div>

            <div style={{ width: '40px', height: '2px', background: '#f0f0f0' }}></div>

            {/* 추가 휴무일 정보 */}
            <div>
              <span style={{ fontSize: '14px', color: '#888', fontWeight: '500', display: 'block', marginBottom: '10px' }}>추가 휴무일 및 안내</span>
              {editStates.holiday ? (
                <textarea
                  name="holidayInfo"
                  value={formData.holidayInfo}
                  onChange={handleChange}
                  placeholder="예: 매주 일요일 정기 휴무, 내부 수리 기간 등 추가 정보를 입력하세요."
                  style={{
                    width: '100%',
                    minHeight: '120px',
                    padding: '12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    lineHeight: '1.6'
                  }}
                />
              ) : (
                <div style={{
                  color: '#444',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.8',
                  fontSize: '15px'
                }}>
                  {formData.holidayInfo ? (
                    formData.holidayInfo
                  ) : (
                    <span style={{ color: '#aaa', fontSize: '14px', fontStyle: 'italic' }}>추가된 휴무일 정보가 없습니다.</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 운영 정책 카드 (전체 너비) */}
        <div style={{
          gridColumn: '1 / -1',
          background: '#fff',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #e9ecef',
          boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #f0f0f0' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1a1a1a' }}>운영 정책</h2>
            <div>
              {!editStates.policy ? (
                <button onClick={() => setEditStates(prev => ({ ...prev, policy: true }))} style={{ padding: '6px 16px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>수정</button>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleCancel('policy')} style={{ padding: '6px 12px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>취소</button>
                  <button onClick={() => handleSave('policy')} disabled={saving} style={{ padding: '6px 12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>{saving ? '...' : '저장'}</button>
                </div>
              )}
            </div>
          </div>

          {editStates.policy ? (
            <textarea name="policyInfo" value={formData.policyInfo} onChange={handleChange} placeholder="예: 예약 취소는 수업 24시간 전까지 가능합니다." style={{ width: '100%', minHeight: '200px', padding: '12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.6' }} />
          ) : (
            <div style={{
              padding: '15px 0',
              minHeight: '200px',
              color: '#444',
              whiteSpace: 'pre-wrap',
              lineHeight: '1.8',
              fontSize: '16px'
            }}>
              {formData.policyInfo ? (
                formData.policyInfo
              ) : (
                <span style={{ color: '#aaa', fontSize: '14px', fontStyle: 'italic' }}>설정된 운영 정책이 없습니다.</span>
              )}
            </div>
          )}
        </div>

        {/* 프로그램 관리 카드 (전체 너비) */}
        <div
          id="program-management"
          style={{
            gridColumn: '1 / -1',
            background: '#fff',
            borderRadius: '12px',
            padding: '32px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid #e9ecef',
            boxSizing: 'border-box',
            scrollMarginTop: '100px' // 스크롤 시 상단 여백
          }}
        >
          <div style={{
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '2px solid #f0f0f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}>
            <div>
              <h2 style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '4px'
              }}>
                프로그램 관리
              </h2>
              <div style={{
                fontSize: '14px',
                color: '#666',
                fontWeight: '500',
                marginTop: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                {branchId === 'all'
                  ? `전체 지점 프로그램 목록 (${programs.length}개)`
                  : currentBranchName
                    ? `${currentBranchName} 프로그램 목록 (${programs.length}개)`
                    : `프로그램 목록 (${programs.length}개)`
                }
                <button
                  onClick={() => loadPrograms()}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#007bff'
                  }}
                  title="목록 새로고침"
                >
                  🔄
                </button>
              </div>
            </div>
            <button
              onClick={handleProgramCreate}
              style={{
                padding: '10px 24px',
                background: '#28a745',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#218838'}
              onMouseLeave={(e) => e.target.style.background = '#28a745'}
            >
              + 프로그램 등록
            </button>
          </div>

          {programsLoading ? (
            <div style={{
              padding: '60px 40px',
              textAlign: 'center',
              color: '#999'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid #ddd',
                borderTopColor: '#3498db',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 16px auto'
              }}></div>
              <div style={{ fontSize: '16px', fontWeight: '500' }}>
                프로그램 목록을 불러오는 중...
              </div>
            </div>
          ) : programs.length === 0 ? (
            <div style={{
              padding: '60px 40px',
              textAlign: 'center',
              color: '#999'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
              <div style={{ fontSize: '16px', marginBottom: '8px', fontWeight: '500' }}>
                등록된 프로그램이 없습니다
              </div>
              <div style={{ fontSize: '14px', color: '#bbb' }}>
                위의 "프로그램 등록" 버튼을 클릭하여 프로그램을 등록하세요
              </div>
            </div>
          ) : (
            <div style={{
              overflowX: 'auto',
              borderRadius: '12px',
              border: '1px solid #e0e0e0',
              background: '#fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                backgroundColor: '#fff',
                minWidth: '800px'
              }}>
                <thead>
                  <tr style={{
                    background: '#f8f9fa',
                    borderBottom: '2px solid #dee2e6'
                  }}>
                    <th style={{
                      padding: '18px 12px',
                      textAlign: 'center',
                      fontWeight: '700',
                      fontSize: '15px',
                      color: '#212529',
                      whiteSpace: 'nowrap',
                      width: '80px'
                    }}>순번</th>
                    <th style={{
                      padding: '18px 12px',
                      textAlign: 'center',
                      fontWeight: '700',
                      fontSize: '15px',
                      color: '#212529',
                      whiteSpace: 'nowrap'
                    }}>프로그램명</th>
                    <th style={{
                      padding: '18px 12px',
                      textAlign: 'center',
                      fontWeight: '700',
                      fontSize: '15px',
                      color: '#212529',
                      whiteSpace: 'nowrap'
                    }}>스포츠 종목</th>
                    <th style={{
                      padding: '18px 12px',
                      textAlign: 'center',
                      fontWeight: '700',
                      fontSize: '15px',
                      color: '#212529',
                      whiteSpace: 'nowrap'
                    }}>1회 금액</th>
                    <th style={{
                      padding: '18px 12px',
                      textAlign: 'center',
                      fontWeight: '700',
                      fontSize: '15px',
                      color: '#212529',
                      whiteSpace: 'nowrap'
                    }}>상태</th>
                    <th style={{
                      padding: '18px 12px',
                      textAlign: 'center',
                      fontWeight: '700',
                      fontSize: '15px',
                      color: '#212529',
                      whiteSpace: 'nowrap'
                    }}>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {programs.map((program, index) => {
                    const sportType = sportTypes.find(st => String(st.sportId) === String(program.sportId))

                    // 현재 지점명 가져오기 (접두사 제거용)
                    const branchName = branch?.brchNm || branch?.branchName ||
                      (branchId ? branches.find(b => String(b.brchId || b.branchId) === String(branchId))?.brchNm : null) || ''

                    // 프로그램명에서 지점명 접두사 제거하여 표시 (더 깔끔하게)
                    let displayProgNm = program.progNm || ''
                    if (branchName && displayProgNm.startsWith(branchName)) {
                      displayProgNm = displayProgNm.substring(branchName.length).trim()
                    }

                    const detailTypeCdLabels = {
                      'BEGINNER': '초급반',
                      'INTERMEDIATE': '중급반',
                      'ADVANCED': '고급반',
                      'HIPHOP': '힙합',
                      'KPOP': '케이팝',
                      'LATIN': '라틴',
                      'MEDITATION': '명상',
                      'CORE': '코어',
                      'DIET': '다이어트',
                      'FREESTYLE': '프리스타일'
                    }
                    const detailTypeCdLabel = program.detailTypeCd ? (detailTypeCdLabels[program.detailTypeCd] || program.detailTypeCd) : '-'

                    return (
                      <tr
                        key={program.progId}
                        style={{
                          borderBottom: '1px solid #e9ecef',
                          transition: 'all 0.2s ease',
                          backgroundColor: '#fff'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f8f9fa'
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#fff'
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                      >
                        <td style={{
                          padding: '18px 12px',
                          textAlign: 'center',
                          fontWeight: '600',
                          fontSize: '15px',
                          color: '#495057',
                          width: '80px'
                        }}>
                          {index + 1}
                        </td>
                        <td style={{
                          padding: '18px 12px',
                          textAlign: 'center',
                          fontWeight: '600',
                          fontSize: '15px',
                          color: '#2c3e50',
                          maxWidth: '300px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }} title={program.progNm}>
                          {displayProgNm}
                        </td>
                        <td style={{
                          padding: '18px 12px',
                          textAlign: 'center',
                          fontSize: '14px'
                        }}>
                          <span style={{
                            padding: '6px 14px',
                            background: '#e3f2fd',
                            color: '#1976d2',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '600',
                            display: 'inline-block'
                          }}>
                            {sportType?.sportNm || program.sportId || '-'}
                          </span>
                        </td>
                        <td style={{
                          padding: '18px 12px',
                          textAlign: 'center',
                          fontWeight: '700',
                          fontSize: '15px',
                          color: '#27ae60'
                        }}>
                          {program.oneTimeAmt?.toLocaleString() || 0}원
                        </td>
                        <td style={{
                          padding: '18px 12px',
                          textAlign: 'center'
                        }}>
                          <span style={{
                            padding: '6px 14px',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '600',
                            display: 'inline-block',
                            background: program.useYn === 1 ? '#d5f4e6' : '#fadbd8',
                            color: program.useYn === 1 ? '#16a085' : '#c0392b',
                            border: `1px solid ${program.useYn === 1 ? '#a8e6cf' : '#f1948a'}`
                          }}>
                            {program.useYn === 1 ? '✓ 사용중' : '✗ 미사용'}
                          </span>
                        </td>
                        <td style={{
                          padding: '18px 12px',
                          textAlign: 'center'
                        }}>
                          <div style={{
                            display: 'flex',
                            gap: '8px',
                            justifyContent: 'center'
                          }}>
                            <button
                              onClick={() => handleProgramEdit(program)}
                              style={{
                                padding: '8px 18px',
                                background: '#3498db',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.background = '#2980b9'
                                e.target.style.transform = 'translateY(-1px)'
                                e.target.style.boxShadow = '0 2px 6px rgba(52,152,219,0.4)'
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = '#3498db'
                                e.target.style.transform = 'translateY(0)'
                                e.target.style.boxShadow = 'none'
                              }}
                            >
                              수정
                            </button>
                            <button
                              onClick={() => handleProgramDelete(program.progId)}
                              style={{
                                padding: '8px 18px',
                                background: '#e74c3c',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.background = '#c0392b'
                                e.target.style.transform = 'translateY(-1px)'
                                e.target.style.boxShadow = '0 2px 6px rgba(231,76,60,0.4)'
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = '#e74c3c'
                                e.target.style.transform = 'translateY(0)'
                                e.target.style.boxShadow = 'none'
                              }}
                            >
                              삭제
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 프로그램 등록/수정 팝업 */}
      {showProgramModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowProgramModal(false)}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{
              margin: '0 0 24px 0',
              fontSize: '20px',
              fontWeight: '600'
            }}>
              {editingProgram ? '프로그램 수정' : '프로그램 등록'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  프로그램명 *
                </label>
                <input
                  type="text"
                  name="progNm"
                  value={programFormData.progNm}
                  onChange={handleProgramChange}
                  required
                  placeholder="예: 기초 요가 클래스"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  스포츠 종목 *
                </label>
                <select
                  name="sportId"
                  value={programFormData.sportId}
                  onChange={handleProgramChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">선택하세요</option>
                  {sportTypes.map(sport => (
                    <option key={sport.sportId} value={String(sport.sportId)}>
                      {sport.sportNm}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    1회 금액 (원) *
                  </label>
                  <input
                    type="number"
                    name='oneTimeAmt'
                    value={programFormData.oneTimeAmt || ''}
                    onChange={handleProgramChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  사용 여부 *
                </label>
                <select
                  name="useYn"
                  value={programFormData.useYn}
                  onChange={handleProgramChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="1">사용</option>
                  <option value="0">미사용</option>
                </select>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              marginTop: '24px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowProgramModal(false)}
                style={{
                  padding: '10px 20px',
                  background: '#6c757d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                취소
              </button>
              <button
                onClick={handleProgramSave}
                style={{
                  padding: '10px 20px',
                  background: '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                저장
              </button>
            </div>
          </div>
        </div>
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

export default CenterInfo
