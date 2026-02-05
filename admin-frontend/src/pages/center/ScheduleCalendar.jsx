import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
// [수정] 주차 계산을 위해 getWeek 함수 추가
import { format, startOfWeek, endOfWeek, addDays, addWeeks, subWeeks, isSameDay, startOfMonth, endOfMonth, isSameMonth, getDay, getWeek } from 'date-fns'
import { ko } from 'date-fns/locale'
import { scheduleApi, programApi, userApi, branchApi, teacherApi } from '../../api'

function ScheduleCalendar() {
  const { branchId } = useParams()
  const navigate = useNavigate()
  const [branch, setBranch] = useState(null)
  const [branches, setBranches] = useState([])
  const [schedules, setSchedules] = useState([])
  const [allPrograms, setAllPrograms] = useState([])
  const [programs, setPrograms] = useState([])
  const [instructors, setInstructors] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('week')
  const [showModal, setShowModal] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [formData, setFormData] = useState({
    progId: '',
    usrId: '',
    scheduleDate: '',
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '10:00',
    maxCapacity: 10
  })
  const [dateMode, setDateMode] = useState('single')

  useEffect(() => {
    loadData()
  }, [branchId])

  useEffect(() => {
    loadSchedules()
  }, [currentDate, branchId, viewMode])

  const loadData = async () => {
    try {
      setLoading(true)
      // 지점 목록을 먼저 로드 (branch 테이블 기준: brch_id / brch_nm 지원)
      const branchesRes = await branchApi.getAll()
      const branchesRaw = Array.isArray(branchesRes) ? branchesRes : (branchesRes?.data || [])
      // API 응답 형태가 camelCase 또는 snake_case 일 수 있으므로 정규화 (상태는 snake_case로 통일)
      const branchesList = branchesRaw
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
      
      // 지점 목록이 제대로 로드되었는지 확인
      console.log('Loaded branches:', branchesList.length, branchesList)
      
      // 모든 지점을 표시하도록 설정 (필터링 없이)
      setBranches(finalBranches)
      
      // 지점이 없는 경우 (fallback 적용 시 이 블록은 통과)
      if (finalBranches.length === 0) {
        setLoading(false)
        return
      }
      
      // 현재 지점이 없거나 유효하지 않은 경우 첫 번째 지점으로 리다이렉트
      if (!branchId) {
        navigate(`/centers/${finalBranches[0].brch_id}/schedules`, { replace: true })
        return
      }
      
      // 현재 지점 정보와 기타 데이터 로드
      try {
        const branchIdStr = String(branchId)
        
        // 지점 목록에서 먼저 찾아서 즉시 표시
        const branchFromList = finalBranches.find(b => String(b.brch_id) === branchIdStr)
        if (branchFromList) {
          setBranch(branchFromList)
        }
        
        // 병렬로 데이터 로드 (에러가 발생해도 일부는 성공할 수 있도록 Promise.allSettled 사용)
        const [branchRes, programRes, instructorRes] = await Promise.allSettled([
          branchApi.getById(branchIdStr),
          programApi.getAll(),
          teacherApi.getAll()
        ])
        
        // 지점 정보 업데이트
        if (branchRes.status === 'fulfilled' && branchRes.value?.data) {
          setBranch(branchRes.value.data)
        } else if (branchFromList) {
          // API 호출 실패 시 목록에서 가져온 정보 사용
          setBranch(branchFromList)
        }
        
        // 프로그램 정보 업데이트 및 필터링
        if (programRes.status === 'fulfilled') {
          const rawPrograms = Array.isArray(programRes.value) ? programRes.value : (programRes.value?.data || [])
          setAllPrograms(rawPrograms)
          
          // 선택된 지점의 프로그램만 필터링 (프로그램 이름에 지점명이 포함된 경우)
          const currentBranch = branchRes.status === 'fulfilled' && branchRes.value?.data ? branchRes.value.data : branchFromList
          const branchName = currentBranch?.brch_nm || currentBranch?.brchNm || ''
          
          if (branchName) {
            const filtered = rawPrograms.filter(prog => {
              const progNm = prog.progNm || prog.programName || ''
              return progNm.includes(branchName)
            })
            setPrograms(filtered)
          } else {
            setPrograms(rawPrograms)
          }
        } else {
          setPrograms([])
          console.warn('Failed to load programs:', programRes.status === 'rejected' ? programRes.reason : 'Unknown error')
        }
        
        // 강사 정보 업데이트 (모든 강사 표시)
        if (instructorRes.status === 'fulfilled') {
          const rawTeachers = Array.isArray(instructorRes.value) ? instructorRes.value : (instructorRes.value?.data || [])
          setInstructors(rawTeachers)
        } else {
          setInstructors([])
          console.warn('Failed to load teachers:', instructorRes.status === 'rejected' ? instructorRes.reason : 'Unknown error')
        }
      } catch (branchError) {
        console.error('Failed to load branch data:', branchError)
        // 지점 정보를 불러올 수 없는 경우 첫 번째 지점으로 리다이렉트
        if (branchesList.length > 0) {
          navigate(`/centers/${branchesList[0].brchId}/schedules`, { replace: true })
          return
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error)
      const errorMessage = error.response?.data?.message || error.message || '데이터를 불러오는데 실패했습니다.'
      alert(`스케줄 데이터를 불러오는데 실패했습니다.\n\n${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handleBranchChange = (e) => {
    const newBranchId = e.target.value
    const currentBranchIdStr = branchId ? String(branchId) : ''
    console.log('Branch changed:', newBranchId, 'from', currentBranchIdStr)
    
    if (newBranchId && newBranchId !== currentBranchIdStr) {
      // 선택된 지점 정보를 즉시 찾아서 상태 업데이트
      const selectedBranch = branches.find(b => String(b.brch_id) === newBranchId)
      if (selectedBranch) {
        setBranch(selectedBranch)
      }
      
      // 부드러운 전환을 위해 로딩 상태 설정
      setLoading(true)
      
      // 지점 변경 시 즉시 네비게이션
      navigate(`/centers/${newBranchId}/schedules`, { replace: false })
    }
  }
  
  // 스크롤바 클릭 시에도 변경되도록 처리
  const handleSelectClick = (e) => {
    // 드롭다운이 열릴 때 이벤트 전파 방지
    e.stopPropagation()
  }
  
  const handleSelectMouseUp = (e) => {
    // 마우스 업 시 현재 선택된 값 확인
    const selectedValue = e.target.value
    const currentBranchIdStr = branchId ? String(branchId) : ''
    if (selectedValue && selectedValue !== currentBranchIdStr) {
      handleBranchChange(e)
    }
  }

  const loadSchedules = async () => {
    if (!branchId) {
      setSchedules([])
      return
    }
    try {
      let start, end
      if (viewMode === 'month') {
        const mStart = startOfMonth(currentDate)
        const mEnd = endOfMonth(currentDate)
        start = startOfWeek(mStart, { weekStartsOn: 1 })
        end = endOfWeek(mEnd, { weekStartsOn: 1 })
      } else {
        start = startOfWeek(currentDate, { weekStartsOn: 1 })
        end = endOfWeek(currentDate, { weekStartsOn: 1 })
      }
      const branchIdNum = Number(branchId)
      if (isNaN(branchIdNum)) {
        console.error('Invalid branchId:', branchId)
        setSchedules([])
        return
      }
      const response = await scheduleApi.getByDateRange(
        branchIdNum,
        format(start, 'yyyy-MM-dd'),
        format(end, 'yyyy-MM-dd')
      )
      setSchedules(response.data || [])
    } catch (error) {
      console.error('Failed to load schedules:', error)
      // 500 에러가 발생해도 빈 배열로 설정하여 UI가 계속 작동하도록
      setSchedules([])
      // 에러 메시지는 콘솔에만 출력 (사용자에게는 조용히 처리)
    }
  }

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  // [수정] 주간 보기에서 주의 마지막 날짜(일요일) 계산 추가
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  // [수정] 주차 계산 추가 (ISO 주차 기준: 첫 주는 1월 4일이 포함된 주)
  const weekNumber = getWeek(currentDate, { weekStartsOn: 1, firstWeekContainsDate: 4 })

  const monthStart = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 })
  const monthEnd = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 })
  const monthDays = []
  for (let d = monthStart; d <= monthEnd; d = addDays(d, 1)) {
    monthDays.push(new Date(d))
  }

  const handlePrev = () => {
    if (viewMode === 'month') setCurrentDate(subWeeks(currentDate, 4))
    else setCurrentDate(subWeeks(currentDate, 1))
  }
  const handleNext = () => {
    if (viewMode === 'month') setCurrentDate(addWeeks(currentDate, 4))
    else setCurrentDate(addWeeks(currentDate, 1))
  }
  const handleToday = () => setCurrentDate(new Date())

  const handleOpenModal = (schedule = null, date = null) => {
    if (schedule) {
      setEditingSchedule(schedule)
      const strtDt = schedule.strtDt || schedule.scheduleDate
      const endDt = schedule.endDt || schedule.scheduleDate
      // 시작일과 종료일이 다르면 기간, 같으면 단일
      const isRange = strtDt !== endDt && endDt
      setFormData({
        progId: schedule.progId || schedule.programId,
        usrId: schedule.usrId || schedule.instructorId || '',
        scheduleDate: strtDt,
        startDate: strtDt,
        endDate: endDt || strtDt,
        startTime: (schedule.strtTm || schedule.startTime)?.substring(0, 5) || '09:00',
        endTime: (schedule.endTm || schedule.endTime)?.substring(0, 5) || '10:00',
        maxCapacity: schedule.maxNopCnt || schedule.maxCapacity
      })
      setDateMode(isRange ? 'range' : 'single')
    } else {
      setEditingSchedule(null)
      const program = programs[0]
      setFormData({
        progId: program?.progId || program?.programId || '',
        usrId: '',
        scheduleDate: date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        startDate: date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        endDate: date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        startTime: '09:00',
        endTime: '10:00',
        maxCapacity: program?.maxNopCnt || program?.maxCapacity || 10
      })
      setDateMode('single')
    }
    setSelectedDate(date)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingSchedule(null)
    setSelectedDate(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => {
      const updated = { ...prev, [name]: value }
      if (name === 'progId') {
        const program = programs.find(p => String(p.progId || p.programId) === String(value))
        if (program) {
          updated.maxCapacity = program.maxNopCnt || program.maxCapacity || 10
        }
      }
      return updated
    })
  }

  const handleSave = async () => {
    if (!formData.progId) {
      alert('프로그램을 선택해주세요.')
      return
    }

    try {
      const branchIdStr = String(branchId)
      if (editingSchedule) {
        const schdId = editingSchedule.schdId || editingSchedule.scheduleId
        // dateMode에 따라 날짜 설정
        if (dateMode === 'single') {
          const data = { 
            brchId: branchIdStr,
            progId: parseInt(formData.progId) || 0,
            usrId: String(formData.usrId || ''),
            strtDt: formData.scheduleDate,
            endDt: formData.scheduleDate,
            strtTm: (formData.startTime || '09:00') + ':00',
            endTm: (formData.endTime || '10:00') + ':00',
            maxNopCnt: parseInt(formData.maxCapacity) || 10,
            sttsCd: formData.sttsCd || 'OPEN',
            description: formData.description || null
          }
          await scheduleApi.update(branchIdStr, schdId, data)
        } else {
          // 기간 모드일 때는 시작일과 종료일을 다르게 설정
          const data = { 
            brchId: branchIdStr,
            progId: parseInt(formData.progId) || 0,
            usrId: String(formData.usrId || ''),
            strtDt: formData.startDate,
            endDt: formData.endDate,
            strtTm: (formData.startTime || '09:00') + ':00',
            endTm: (formData.endTime || '10:00') + ':00',
            maxNopCnt: parseInt(formData.maxCapacity) || 10,
            sttsCd: formData.sttsCd || 'OPEN',
            description: formData.description || null
          }
          await scheduleApi.update(branchIdStr, schdId, data)
        }
      } else {
        if (dateMode === 'single') {
          const data = { 
            brchId: branchIdStr,
            progId: parseInt(formData.progId) || 0,
            usrId: String(formData.usrId || ''),
            strtDt: formData.scheduleDate,
            endDt: formData.scheduleDate,
            strtTm: (formData.startTime || '09:00') + ':00',
            endTm: (formData.endTime || '10:00') + ':00',
            maxNopCnt: parseInt(formData.maxCapacity) || 10,
            sttsCd: formData.sttsCd || 'OPEN',
            description: formData.description || null
          }
          await scheduleApi.create(branchIdStr, data)
        } else {
          const start = new Date(formData.startDate)
          const end = new Date(formData.endDate)
          if (isNaN(start) || isNaN(end) || start > end) {
            alert('유효한 기간을 선택해주세요.')
            return
          }
          const creates = []
          for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
            const scheduleDate = format(d, 'yyyy-MM-dd')
            const data = { 
              brchId: branchIdStr,
              progId: parseInt(formData.progId) || 0,
              usrId: String(formData.usrId || ''),
              strtDt: scheduleDate,
              endDt: scheduleDate,
              strtTm: (formData.startTime || '09:00') + ':00',
              endTm: (formData.endTime || '10:00') + ':00',
              maxNopCnt: parseInt(formData.maxCapacity) || 10,
              sttsCd: formData.sttsCd || 'OPEN',
              description: formData.description || null
            }
            creates.push(scheduleApi.create(branchIdStr, data))
          }
          await Promise.all(creates)
        }
      }
      handleCloseModal()
      loadSchedules()
    } catch (error) {
      console.error('Failed to save:', error)
      alert(error.response?.data?.error || '저장에 실패했습니다.')
    }
  }

  const handleDelete = async (scheduleId) => {
    if (editingSchedule && dateMode === 'range') {
      // 기간 모드일 때: 기간 내 모든 스케줄 삭제
      if (!window.confirm(`${formData.startDate}부터 ${formData.endDate}까지의 모든 스케줄을 삭제하시겠습니까?`)) return
      try {
        const start = new Date(formData.startDate)
        const end = new Date(formData.endDate)
        
        // 기간 내 모든 스케줄 찾기
        const schedulesToDelete = schedules.filter(s => {
          const strtDt = s.strtDt || s.scheduleDate
          const endDt = s.endDt || s.scheduleDate
          
          const strtDate = new Date(strtDt)
          const endDate = new Date(endDt)
          
          // 스케줄 기간이 선택된 기간과 겹치는지 확인
          return strtDate <= end && endDate >= start
        })
        
        if (schedulesToDelete.length === 0) {
          alert('삭제할 스케줄이 없습니다.')
          return
        }
        
        // 모든 스케줄을 병렬로 삭제
        const deletePromises = schedulesToDelete.map(s => 
          scheduleApi.delete(String(branchId), s.schdId || s.scheduleId)
        )
        
        await Promise.all(deletePromises)
        alert(`${schedulesToDelete.length}개의 스케줄이 삭제되었습니다.`)
        handleCloseModal()
        loadSchedules()
      } catch (error) {
        console.error('Failed to delete schedules:', error)
        alert('삭제에 실패했습니다.')
      }
    } else {
      // 단일 스케줄 삭제
      if (!window.confirm('이 스케줄을 삭제하시겠습니까?')) return
      try {
        const schdId = scheduleId || editingSchedule?.schdId || editingSchedule?.scheduleId
        await scheduleApi.delete(String(branchId), schdId)
        handleCloseModal()
        loadSchedules()
      } catch (error) {
        console.error('Failed to delete:', error)
        alert('삭제에 실패했습니다.')
      }
    }
  }

  const getSchedulesForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return schedules.filter(s => (s.strtDt || s.scheduleDate) === dateStr)
  }

  // 한국 공휴일 이름 반환 함수
  const getKoreanHolidayName = (date) => {
    const month = date.getMonth() + 1 // 1-12
    const day = date.getDate()
    const year = date.getFullYear()
    
    // 고정 공휴일
    const fixedHolidays = {
      '1-1': '신정',
      '3-1': '삼일절',
      '5-5': '어린이날',
      '6-6': '현충일',
      '8-15': '광복절',
      '10-3': '개천절',
      '10-9': '한글날',
      '12-25': '크리스마스'
    }
    
    // 고정 공휴일 확인
    const key = `${month}-${day}`
    if (fixedHolidays[key]) {
      return fixedHolidays[key]
    }
    
    // 음력 공휴일 (매년 달라짐) - 2024-2025년 기준
    const lunarNewYear = {
      2024: [{ month: 2, day: 10, name: '설날' }],
      2025: [{ month: 1, day: 29, name: '설날' }]
    }
    
    const buddhaBirthday = {
      2024: [{ month: 5, day: 15, name: '부처님오신날' }],
      2025: [{ month: 5, day: 5, name: '부처님오신날' }]
    }
    
    const chuseok = {
      2024: [{ month: 9, day: 17, name: '추석' }],
      2025: [{ month: 10, day: 6, name: '추석' }]
    }
    
    // 해당 연도의 음력 공휴일 확인
    const yearHolidays = [
      ...(lunarNewYear[year] || []),
      ...(buddhaBirthday[year] || []),
      ...(chuseok[year] || [])
    ]
    
    const holiday = yearHolidays.find(h => h.month === month && h.day === day)
    if (holiday) {
      return holiday.name
    }
    
    return null
  }

  // 한국 공휴일 확인 함수
  const isKoreanHoliday = (date) => {
    return getKoreanHolidayName(date) !== null
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

  const today = format(new Date(), 'yyyy년 MM월 dd일 (EEE)', { locale: ko })

  // 현재 지점명 가져오기 (branch 상세 정보 또는 branches 목록에서)
  // 지점 변경 시 즉시 반영되도록 branches 목록을 우선 확인
  const currentBranchName = (branchId && branches.find(b => String(b.brch_id) === String(branchId))?.brch_nm) ||
    branch?.brch_nm || 
    ''

  return (
    <div className="p-4" style={{ 
      background: '#f8f9fa', 
      minHeight: 'calc(100vh - 80px)',
      padding: 'clamp(12px, 2vw, 24px)'
    }}>
      {/* 헤더 섹션 */}
      <div style={{ 
        marginBottom: 'clamp(16px, 3vw, 24px)',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 'clamp(12px, 2vw, 16px)',
        padding: 'clamp(16px, 3vw, 24px)',
        color: '#fff',
        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: 'clamp(12px, 2vw, 16px)'
        }}>
          <div style={{ flex: '1 1 auto', minWidth: '200px' }}>
            <h1 style={{ 
              margin: 0, 
              fontSize: 'clamp(20px, 4vw, 28px)', 
              fontWeight: 'bold',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              <span style={{ fontSize: 'clamp(24px, 5vw, 32px)' }}>📅</span>
              <span>스케줄 관리</span>
            </h1>
            <p style={{ 
              margin: 0, 
              opacity: 0.9, 
              fontSize: 'clamp(12px, 2vw, 14px)',
              wordBreak: 'break-word'
            }}>
              {currentBranchName || '지점을 선택해주세요'} - {viewMode === 'week' ? '주간' : '월간'} 스케줄
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            style={{
              padding: 'clamp(10px, 2vw, 12px) clamp(16px, 3vw, 24px)',
              background: '#fff',
              color: '#667eea',
              border: 'none',
              borderRadius: 'clamp(8px, 1.5vw, 12px)',
              fontSize: 'clamp(14px, 2.5vw, 16px)',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              whiteSpace: 'nowrap',
              flexShrink: 0
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
            <span style={{ fontSize: 'clamp(16px, 3vw, 20px)' }}>➕</span>
            <span className="button-text">새 스케줄 추가</span>
          </button>
        </div>
      </div>

      {/* 지점 선택 및 캘린더 컨트롤 */}
      <div className="content-box" style={{ 
        marginBottom: 'clamp(16px, 3vw, 20px)',
        padding: 'clamp(12px, 2vw, 16px)'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 'clamp(12px, 2vw, 16px)',
          flexWrap: 'wrap'
        }}>
          {/* 오늘 날짜 */}
          <div style={{ 
            padding: 'clamp(8px, 1.5vw, 10px) clamp(12px, 2vw, 16px)', 
            background: '#f8f9fa', 
            borderRadius: '6px',
            border: '1px solid #e0e0e0',
            fontSize: 'clamp(12px, 2vw, 14px)',
            color: '#333',
            fontWeight: '500',
            whiteSpace: 'nowrap',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            flexShrink: 0
          }}>
            📅 <span className="today-text">{today}</span>
          </div>
          
          {/* 지점 선택 */}
          <div style={{ 
            position: 'relative',
            minWidth: '200px',
            flex: '1 1 auto',
            maxWidth: '100%'
          }}>
            <select
              value={branchId ? String(branchId) : ''}
              onChange={handleBranchChange}
              onClick={handleSelectClick}
              onMouseUp={handleSelectMouseUp}
              style={{
                width: '100%',
                padding: '10px 16px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                background: '#fff',
                cursor: 'pointer',
                outline: 'none',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                paddingRight: '40px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#1a237e'
                e.target.style.boxShadow = '0 2px 6px rgba(26, 35, 126, 0.2)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#ddd'
                e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              {branches.length === 0 ? (
                <option value="">등록된 지점이 없습니다</option>
              ) : (
                branches.map(b => {
                  if (!b || !b.brch_id || !b.brch_nm) {
                    console.warn('Invalid branch data:', b)
                    return null
                  }
                  return (
                    <option key={b.brch_id} value={String(b.brch_id)}>
                      {b.brch_nm}
                    </option>
                  )
                }).filter(Boolean)
              )}
            </select>
            <style>{`
              select {
                scroll-behavior: smooth;
              }
              select option {
                padding: 10px 12px;
                font-size: 14px;
                line-height: 1.5;
              }
              select:focus {
                border-color: #1a237e !important;
              }
              select:hover {
                border-color: #999;
              }
            `}</style>
          </div>
        </div>
      </div>

      {/* 캘린더 컨트롤 영역 */}
      <div className="content-box" style={{ 
        marginBottom: 'clamp(16px, 3vw, 20px)', 
        padding: 'clamp(12px, 2vw, 16px)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'nowrap', 
          gap: 'clamp(12px, 2vw, 16px)',
          overflow: 'hidden'
        }}>
          {/* 왼쪽: 네비게이션 버튼 */}
          <div style={{ 
            display: 'flex', 
            gap: 'clamp(6px, 1vw, 8px)', 
            alignItems: 'center',
            flexWrap: 'nowrap',
            flex: '1 1 auto',
            flexShrink: 0
          }}>
            <button 
              className="btn-sm" 
              onClick={handlePrev}
              style={{
                padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 2vw, 16px)',
                fontSize: 'clamp(12px, 2vw, 14px)',
                borderRadius: '6px',
                border: '1px solid #ddd',
                background: '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#f8f9fa'
                e.target.style.borderColor = '#3498db'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#fff'
                e.target.style.borderColor = '#ddd'
              }}
            >
              <span className="nav-text">◀ 이전</span>
            </button>
            <button 
              className="btn-sm" 
              onClick={handleToday}
              style={{
                padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 2vw, 16px)',
                fontSize: 'clamp(12px, 2vw, 14px)',
                borderRadius: '6px',
                border: '1px solid #3498db',
                background: '#3498db',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => e.target.style.background = '#2980b9'}
              onMouseLeave={(e) => e.target.style.background = '#3498db'}
            >
              오늘
            </button>
            <button 
              className="btn-sm" 
              onClick={handleNext}
              style={{
                padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 2vw, 16px)',
                fontSize: 'clamp(12px, 2vw, 14px)',
                borderRadius: '6px',
                border: '1px solid #ddd',
                background: '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#f8f9fa'
                e.target.style.borderColor = '#3498db'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#fff'
                e.target.style.borderColor = '#ddd'
              }}
            >
              <span className="nav-text">다음 ▶</span>
            </button>
          </div>

          {/* 가운데: 현재 날짜 표시 */}
          <h2 style={{ 
            fontSize: 'clamp(16px, 3vw, 20px)', 
            fontWeight: '600', 
            color: '#1a237e',
            margin: 0,
            textAlign: 'center',
            flex: '1 1 auto',
            minWidth: '200px',
            padding: '0 clamp(8px, 1.5vw, 16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%'
          }}>
            {viewMode === 'month' 
              // [수정] 월간 보기 날짜 표시 형식 변경: 주간 보기 주차와 동일한 색상, 글씨 크기, 가운데 정렬로 표시
              ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%'
                  }}>
                    <span style={{ 
                      fontSize: 'clamp(20px, 4vw, 28px)', 
                      fontWeight: '700', 
                      color: '#667eea',
                      lineHeight: '1.2'
                    }}>
                      {format(startOfMonth(currentDate), 'yyyy년 M월', { locale: ko })}
                    </span>
                  </div>
                )
              // [수정] 주간 보기 날짜 표시 형식 변경: 주차를 앞에 크고 다른 색으로, 기간을 뒤에 작은 글씨로 괄호 안에 표시, 중앙 정렬
              : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    flexWrap: 'nowrap',
                    width: '100%'
                  }}>
                    <span style={{ 
                      fontSize: 'clamp(20px, 4vw, 28px)', 
                      fontWeight: '700', 
                      color: '#667eea',
                      lineHeight: '1.2'
                    }}>
                      {format(currentDate, 'yyyy년', { locale: ko })} {weekNumber}주차
                    </span>
                    <span style={{ 
                      fontSize: 'clamp(12px, 2vw, 14px)', 
                      fontWeight: '400', 
                      color: '#666',
                      lineHeight: '1.2'
                    }}>
                      ({format(weekStart, 'yyyy년 M월 d일', { locale: ko })} ~ {format(weekEnd, 'M월 d일', { locale: ko })})
                    </span>
                  </div>
                )}
          </h2>

          {/* 오른쪽: 보기 모드 버튼 */}
          <div style={{ 
            display: 'flex', 
            gap: 'clamp(6px, 1vw, 8px)',
            flexShrink: 0,
            marginLeft: 'auto'
          }}>
            <button 
              className={viewMode === 'week' ? 'btn-primary' : 'btn-sm'}
              onClick={() => setViewMode('week')}
              style={{
                padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 2vw, 16px)',
                fontSize: 'clamp(12px, 2vw, 14px)',
                borderRadius: '6px',
                border: '1px solid',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                ...(viewMode === 'week' 
                  ? { 
                      background: '#3498db', 
                      color: '#fff', 
                      borderColor: '#3498db' 
                    }
                  : { 
                      background: '#fff', 
                      color: '#333', 
                      borderColor: '#ddd' 
                    })
              }}
              onMouseEnter={(e) => {
                if (viewMode !== 'week') {
                  e.target.style.background = '#f8f9fa'
                  e.target.style.borderColor = '#3498db'
                }
              }}
              onMouseLeave={(e) => {
                if (viewMode !== 'week') {
                  e.target.style.background = '#fff'
                  e.target.style.borderColor = '#ddd'
                }
              }}
            >
              주간
            </button>
            <button 
              className={viewMode === 'month' ? 'btn-primary' : 'btn-sm'}
              onClick={() => setViewMode('month')}
              style={{
                padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 2vw, 16px)',
                fontSize: 'clamp(12px, 2vw, 14px)',
                borderRadius: '6px',
                border: '1px solid',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                ...(viewMode === 'month' 
                  ? { 
                      background: '#3498db', 
                      color: '#fff', 
                      borderColor: '#3498db' 
                    }
                  : { 
                      background: '#fff', 
                      color: '#333', 
                      borderColor: '#ddd' 
                    })
              }}
              onMouseEnter={(e) => {
                if (viewMode !== 'month') {
                  e.target.style.background = '#f8f9fa'
                  e.target.style.borderColor = '#3498db'
                }
              }}
              onMouseLeave={(e) => {
                if (viewMode !== 'month') {
                  e.target.style.background = '#fff'
                  e.target.style.borderColor = '#ddd'
                }
              }}
            >
              월간
            </button>
          </div>
        </div>
      </div>
      
      <div className="content-box" style={{ 
        overflowX: 'auto',
        padding: 0,
        marginBottom: 'clamp(16px, 3vw, 20px)',
        WebkitOverflowScrolling: 'touch'
      }}>
        <div className="calendar-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, minmax(120px, 1fr))', 
          gap: '1px', 
          background: '#ddd',
          minWidth: '840px'
        }}>
          {(viewMode === 'week' ? weekDays : monthDays).map((day, index) => (
            <div 
              key={index} 
              style={{ 
                background: isSameDay(day, new Date()) ? '#e3f2fd' : 'white',
                minHeight: 'clamp(150px, 25vw, 200px)',
                display: 'flex',
                flexDirection: 'column',
                opacity: viewMode === 'month' && !isSameMonth(day, currentDate) ? 0.45 : 1
              }}
            >
              <div style={{ 
                padding: 'clamp(8px, 1.5vw, 12px)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'clamp(6px, 1vw, 8px)', 
                borderBottom: '1px solid #eee',
                flexWrap: 'wrap'
              }}>
                <span style={{ 
                  fontSize: 'clamp(10px, 1.8vw, 12px)', 
                  color: '#666',
                  whiteSpace: 'nowrap'
                }}>
                  {format(day, 'EEE', { locale: ko })}
                </span>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px', 
                  flex: 1, 
                  minWidth: 0,
                  flexWrap: 'wrap'
                }}>
                  <span style={{ 
                    fontSize: 'clamp(14px, 2.5vw, 18px)', 
                    fontWeight: '600', 
                    color: (() => {
                      const dayOfWeek = getDay(day)
                      const isHoliday = isKoreanHoliday(day)
                      
                      // 일요일(0) 또는 공휴일: 빨간색
                      if (dayOfWeek === 0 || isHoliday) return '#e74c3c'
                      // 토요일(6): 파란색
                      if (dayOfWeek === 6) return '#3498db'
                      // 오늘: 파란색
                      if (isSameDay(day, new Date())) return '#3498db'
                      // 일반 날짜: 검은색
                      return '#333'
                    })()
                  }}>
                    {format(day, 'd')}
                  </span>
                  {(() => {
                    const holidayName = getKoreanHolidayName(day)
                    if (holidayName) {
                      return (
                        <span style={{ 
                          fontSize: 'clamp(8px, 1.2vw, 9px)', 
                          color: '#e74c3c',
                          fontWeight: '500',
                          whiteSpace: 'nowrap',
                          lineHeight: '18px'
                        }}>
                          {holidayName}
                        </span>
                      )
                    }
                    return null
                  })()}
                </div>
                <button 
                  onClick={() => handleOpenModal(null, day)}
                  style={{ 
                    marginLeft: 'auto', 
                    width: 'clamp(20px, 3vw, 24px)', 
                    height: 'clamp(20px, 3vw, 24px)', 
                    border: 'none', 
                    background: '#f0f0f0', 
                    color: '#666', 
                    borderRadius: '50%', 
                    cursor: 'pointer', 
                    fontSize: 'clamp(14px, 2.5vw, 16px)', 
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#667eea'
                    e.target.style.color = '#fff'
                    e.target.style.transform = 'scale(1.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#f0f0f0'
                    e.target.style.color = '#666'
                    e.target.style.transform = 'scale(1)'
                  }}
                >
                  +
                </button>
              </div>
              <div style={{ 
                flex: 1, 
                padding: 'clamp(6px, 1vw, 8px)', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 'clamp(4px, 0.8vw, 6px)', 
                overflowY: 'auto',
                minHeight: 0
              }}>
                {getSchedulesForDate(day).map(schedule => {
                  const program = allPrograms.find(p => String(p.progId || p.programId) === String(schedule.progId || schedule.programId))
                  const instructor = instructors.find(i => String(i.teacherId || i.instructorId) === String(schedule.usrId || schedule.instructorId))
                  const programName = program?.progNm || program?.programName || schedule.programName || '프로그램'
                  const instructorName = instructor?.teacherName || instructor?.instructorName || schedule.instructorName || ''
                  const currentCapacity = schedule.rsvCnt || schedule.currentCapacity || 0
                  const maxCapacity = schedule.maxNopCnt || schedule.maxCapacity || 10
                  
                  return (
                    <div 
                      key={schedule.schdId || schedule.scheduleId}
                      onClick={() => { setSelectedDate(day); handleOpenModal(schedule) }}
                      style={{ 
                        background: 'white',
                        border: '1px solid #ddd',
                        borderLeft: '3px solid #3498db',
                        borderRadius: '4px',
                        padding: 'clamp(6px, 1vw, 8px)',
                        cursor: 'pointer',
                        fontSize: 'clamp(10px, 1.8vw, 12px)',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateX(2px)'
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateX(0)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      <div style={{ 
                        fontSize: 'clamp(9px, 1.5vw, 11px)', 
                        color: '#666',
                        marginBottom: '4px'
                      }}>
                        {(schedule.strtTm || schedule.startTime)?.substring(0, 5)} - {(schedule.endTm || schedule.endTime)?.substring(0, 5)}
                      </div>
                      <div style={{ 
                        fontSize: 'clamp(11px, 2vw, 13px)', 
                        fontWeight: '500', 
                        margin: '4px 0',
                        wordBreak: 'break-word'
                      }}>
                        {programName}
                      </div>
                      <div style={{ 
                        fontSize: 'clamp(9px, 1.5vw, 11px)', 
                        color: '#666',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '4px'
                      }}>
                        {instructorName && (
                          <span>🏋️ {instructorName}</span>
                        )}
                        <span>👥 {currentCapacity}/{maxCapacity}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

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
            {/* 헤더 */}
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
                  {editingSchedule ? '✏️' : '➕'}
                </span>
                {editingSchedule ? '스케줄 수정' : '새 스케줄 추가'}
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

            {/* 폼 내용 */}
            <div style={{ display: 'grid', gap: '20px' }}>
              {/* 프로그램 선택 */}
              <div>
                <label style={{ 
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  프로그램 <span style={{ color: '#f5576c' }}>*</span>
                </label>
                <select 
                  name="progId"
                  value={formData.progId}
                  onChange={handleChange}
                  style={{ 
                    padding: '12px 16px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '12px',
                    width: '100%',
                    fontSize: '15px',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    outline: 'none',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 16px center',
                    paddingRight: '40px'
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
                  <option value="">프로그램을 선택하세요</option>
                  {programs.map(prog => (
                    <option key={prog.progId || prog.programId} value={prog.progId || prog.programId}>
                      {prog.progNm || prog.programName}
                    </option>
                  ))}
                </select>
              </div>

              {/* 강사 선택 */}
              <div>
                <label style={{ 
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  강사
                </label>
                <select 
                  name="usrId"
                  value={formData.usrId}
                  onChange={handleChange}
                  style={{ 
                    padding: '12px 16px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '12px',
                    width: '100%',
                    fontSize: '15px',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    outline: 'none',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 16px center',
                    paddingRight: '40px'
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
                  <option value="">강사를 선택하세요 (선택사항)</option>
                  {instructors.map(inst => (
                    <option key={inst.teacherId} value={inst.teacherId}>
                      {inst.teacherName}
                    </option>
                  ))}
                </select>
              </div>

              {/* 날짜 선택 */}
              <div>
                <label style={{ 
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  날짜 <span style={{ color: '#f5576c' }}>*</span>
                </label>
                
                {/* 날짜 모드 선택 */}
                <div style={{ 
                  display: 'flex', 
                  gap: '12px', 
                  marginBottom: '12px',
                  background: '#f8f9fa',
                  padding: '8px',
                  borderRadius: '12px'
                }}>
                  <label style={{ 
                    display: 'flex', 
                    gap: '8px', 
                    alignItems: 'center',
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    background: dateMode === 'single' ? '#667eea' : 'transparent',
                    color: dateMode === 'single' ? '#fff' : '#666'
                  }}>
                    <input 
                      type="radio" 
                      name="dateMode" 
                      value="single" 
                      checked={dateMode === 'single'} 
                      onChange={() => setDateMode('single')}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{ 
                      fontWeight: dateMode === 'single' ? '600' : '400',
                      fontSize: '14px'
                    }}>
                      단일 날짜
                    </span>
                  </label>
                  <label style={{ 
                    display: 'flex', 
                    gap: '8px', 
                    alignItems: 'center',
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    background: dateMode === 'range' ? '#667eea' : 'transparent',
                    color: dateMode === 'range' ? '#fff' : '#666'
                  }}>
                    <input 
                      type="radio" 
                      name="dateMode" 
                      value="range" 
                      checked={dateMode === 'range'} 
                      onChange={() => setDateMode('range')}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{ 
                      fontWeight: dateMode === 'range' ? '600' : '400',
                      fontSize: '14px'
                    }}>
                      기간
                    </span>
                  </label>
                </div>

                {/* 날짜 입력 */}
                {dateMode === 'single' ? (
                  <input
                    type="date"
                    name="scheduleDate"
                    value={formData.scheduleDate}
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
                ) : (
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      style={{ 
                        padding: '12px 16px',
                        border: '2px solid #e0e0e0',
                        borderRadius: '12px',
                        flex: 1,
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
                    <span style={{ fontSize: '18px', color: '#666', fontWeight: '600' }}>~</span>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      style={{ 
                        padding: '12px 16px',
                        border: '2px solid #e0e0e0',
                        borderRadius: '12px',
                        flex: 1,
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
                )}
              </div>

              {/* 시간 선택 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ 
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    시작 시간
                  </label>
                  <input 
                    type="time"
                    name="startTime"
                    value={formData.startTime}
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
                    종료 시간
                  </label>
                  <input 
                    type="time"
                    name="endTime"
                    value={formData.endTime}
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

              {/* 정원 */}
              <div>
                <label style={{ 
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  정원
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
            </div>

            {/* 버튼 */}
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
              {editingSchedule && (
                <button 
                  onClick={() => handleDelete()}
                  style={{
                    padding: '12px 24px',
                    background: '#dc3545',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#c82333'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#dc3545'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  🗑️ {dateMode === 'range' ? '기간 삭제' : '삭제'}
                </button>
              )}
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
                {editingSchedule ? '💾 수정하기' : '✨ 추가하기'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        /* 반응형 스타일 */
        @media (max-width: 768px) {
          .button-text {
            display: none;
          }
          .nav-text {
            display: none;
          }
          .today-text {
            display: none;
          }
        }
        
        @media (max-width: 480px) {
          .content-box {
            padding: 12px !important;
          }
        }
        
        /* 캘린더 그리드 반응형 */
        @media (max-width: 1200px) {
          .calendar-grid {
            min-width: 700px;
          }
        }
        
        @media (max-width: 768px) {
          .calendar-grid {
            min-width: 560px;
          }
        }
      `}</style>
    </div>
  )
}

export default ScheduleCalendar

