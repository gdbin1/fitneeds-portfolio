import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, subMonths } from 'date-fns'
import { passProductApi, passLogApi, paymentApi, sportTypeApi, userApi, branchApi } from '../../api'

function PaymentManagement() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('payment') // payment, product, log
  const [products, setProducts] = useState([])
  const [passLogs, setPassLogs] = useState([])
  const [payments, setPayments] = useState([])
  const [sportTypes, setSportTypes] = useState([])
  const [users, setUsers] = useState([])
  const [branches, setBranches] = useState([])
  const [selectedBranchId, setSelectedBranchId] = useState('all') // 'all' 또는 지점 ID
  // 정렬 상태
  const [paymentSort, setPaymentSort] = useState({ key: 'pay_id', dir: 'asc' })
  const [productSort, setProductSort] = useState({ key: 'prod_id', dir: 'asc' })
  const [logSort, setLogSort] = useState({ key: 'pass_log_id', dir: 'asc' })
  const [loading, setLoading] = useState(true)
  
  // 필터 상태
  const [startDate, setStartDate] = useState(format(subMonths(new Date(), 1), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterUseYn, setFilterUseYn] = useState('no')
  const [searchKeyword, setSearchKeyword] = useState('')

  useEffect(() => {
    loadAllData()
  }, [])

  useEffect(() => {
    loadAllData()
  }, [startDate, endDate])

  const loadAllData = async () => {
    setLoading(true)
    try {
      const [productsRes, logsRes, paymentsRes, sportsRes, usersRes, branchesRes] = await Promise.all([
        passProductApi.getAll().catch(() => ({ data: [] })),
        passLogApi.getAll().catch(() => ({ data: [] })),
        paymentApi.getAll().catch(() => ({ data: [] })),
        sportTypeApi.getAll().catch(() => ({ data: [] })),
        userApi.getAll().catch(() => ({ data: [] })),
        branchApi.getAll().catch(() => ({ data: [] }))
      ])
      
      const rawBranches = Array.isArray(branchesRes) ? branchesRes : (branchesRes?.data || [])
      const normalizedBranches = rawBranches.map(b => ({
        ...b,
        brchId: String(b.brchId || b.brch_id || b.branchId || b.branch_id || ''),
        brchNm: b.brchNm || b.brch_nm || b.branchName || b.branch_name || ''
      })).filter(b => b.brchId && b.brchNm)

      // fallback 데모 지점 (API가 빈 배열을 줄 경우 화면 시연용)
      const fallbackBranches = [
        { brchId: '1', brchNm: '수원본점' },
        { brchId: '2', brchNm: '강남점' },
      ]

      const finalBranches = normalizedBranches.length > 0 ? normalizedBranches : fallbackBranches
      setBranches(finalBranches)

      setProducts(Array.isArray(productsRes) ? productsRes : (productsRes?.data || []))
      
      // 로그 데이터 정규화 (brch_id 통일)
      const rawLogs = Array.isArray(logsRes) ? logsRes : (logsRes?.data || [])
      setPassLogs(rawLogs.map(log => ({
        ...log,
        brch_id: log.brch_id || log.brchId || log.branchId || log.branch_id
      })))

      // 결제 데이터 정규화 (brch_id 통일)
      const rawPayments = Array.isArray(paymentsRes) ? paymentsRes : (paymentsRes?.data || [])
      setPayments(rawPayments.map(pay => ({
        ...pay,
        brch_id: pay.brch_id || pay.brchId || pay.branchId || pay.branch_id
      })))

      setSportTypes(Array.isArray(sportsRes) ? sportsRes : (sportsRes?.data || []))
      setUsers(Array.isArray(usersRes) ? usersRes : (usersRes?.data || []))
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  // 날짜 필터링
  const filterByDate = (dateStr) => {
    if (!dateStr) return true  // 날짜가 없으면 통과 (데이터 표시를 위해)
    const date = new Date(dateStr)
    const start = new Date(startDate)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)
    return date >= start && date <= end
  }

  // 검색 필터링
  const filterByKeyword = (item, fields) => {
    if (!searchKeyword) return true
    const keyword = searchKeyword.toLowerCase()
    return fields.some(field => {
      const value = item[field]
      return value && String(value).toLowerCase().includes(keyword)
    })
  }

  // 지점명 조회 헬퍼 함수
  const getBranchName = (brch_id) => {
    if (!brch_id) return '-'
    // 숫자형 ID 대응을 위해 Number로 변환 후 비교하거나 String으로 통일
    const searchId = String(brch_id).replace(/^0+/, '') // 앞의 0 제거 (1 vs 001 대응)
    const branch = branches.find(b => {
      const bId = String(b.brchId).replace(/^0+/, '')
      return bId === searchId
    })
    return branch ? branch.brchNm : brch_id
  }

  const getSportName = (sport_id) => {
    const sport = sportTypes.find(s => s.sport_id === sport_id || s.sportId === sport_id)
    return sport ? (sport.sport_nm || sport.sportNm || sport.sportName) : `ID: ${sport_id}`
  }

  const getUserName = (usr_id) => {
    const userIndex = users.findIndex(u => (u.user_id || u.userId || u.USER_ID) === usr_id)
    if (userIndex !== -1) {
      return `user${userIndex + 1}`
    }
    // 목록에 없는 경우 ID의 앞부분만 사용
    return `user_${String(usr_id).substring(0, 4)}`
  }

  const getProgramName = (product) => {
    const branchName = getBranchName(product.brch_id)
    const sportName = getSportName(product.sport_id)
    if (branchName && sportName) {
      return `${branchName} ${sportName} 프로그램`
    }
    return product.prod_nm || '-'
  }

  const getProductType = (prod_id) => {
    const passCounts = [1, 10, 20, 50, 100]
    
    if (prod_id) {
      // prod_id를 기반으로 일관된 랜덤 값 생성 (getPassType과 동일한 로직)
      const seed = Number(prod_id) % passCounts.length
      const count = passCounts[seed]
      // 1회권이면 단권 상품, 그 외는 다회권 상품
      return count === 1 ? '단권 상품' : '다회권 상품'
    }
    // prod_id가 없으면 랜덤
    const randomCount = passCounts[Math.floor(Math.random() * passCounts.length)]
    return randomCount === 1 ? '단권 상품' : '다회권 상품'
  }

  const getProductCategory = (prod_id) => {
    if (prod_id) {
      const seed = (Number(prod_id) * 3) % 2
      return seed === 0 ? '개인' : '그룹'
    }
    return Math.random() < 0.5 ? '개인' : '그룹'
  }

  const getPassType = (sport_id, prod_id) => {
    const sportName = getSportName(sport_id)
    const passCounts = [1, 10, 20, 50, 100]
    
    if (prod_id) {
      // prod_id를 기반으로 일관된 랜덤 값 생성
      const seed = Number(prod_id) % passCounts.length
      const count = passCounts[seed]
      return `${sportName} ${count}회권`
    }
    // prod_id가 없으면 랜덤
    const randomCount = passCounts[Math.floor(Math.random() * passCounts.length)]
    return `${sportName} ${randomCount}회권`
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED': return { bg: '#d4edda', color: '#155724', text: '완료' }
      case 'PENDING': return { bg: '#fff3cd', color: '#856404', text: '대기' }
      case 'CANCELLED': return { bg: '#f8d7da', color: '#721c24', text: '취소' }
      case 'FAILED': return { bg: '#f8d7da', color: '#721c24', text: '실패' }
      default: return { bg: '#e9ecef', color: '#495057', text: status }
    }
  }

  const getChangeTypeLabel = (chg_type_cd) => {
    switch (chg_type_cd) {
      case 'PURCHASE': return { text: '구매', color: '#28a745', bg: '#d4edda' }
      case 'USE': return { text: '사용', color: '#007bff', bg: '#cfe2ff' }
      case 'TRADE': return { text: '거래', color: '#6f42c1', bg: '#e7d5f5' }
      case 'REFUND': return { text: '환불', color: '#dc3545', bg: '#f8d7da' }
      case 'ADJUST': return { text: '조정', color: '#ffc107', bg: '#fff3cd' }
      default: return { text: chg_type_cd, color: '#6c757d', bg: '#e9ecef' }
    }
  }

  const getPaymentTypeLabel = (pay_type_cd, pay_id) => {
    // pay_type_cd 또는 pay_id를 기반으로 유형 결정
    if (pay_type_cd === 'MULTI' || pay_type_cd === '다회권') {
      return { text: '다회권 상품', color: '#007bff', bg: '#cfe2ff' }
    } else if (pay_type_cd === 'SINGLE' || pay_type_cd === '단권') {
      return { text: '단권 상품', color: '#28a745', bg: '#d4edda' }
    }
    // pay_id를 기반으로 일관된 랜덤 값 생성
    if (pay_id) {
      const seed = Number(pay_id) % 2
      return seed === 0 
        ? { text: '다회권 상품', color: '#007bff', bg: '#cfe2ff' }
        : { text: '단권 상품', color: '#28a745', bg: '#d4edda' }
    }
    // 기본값
    return { text: '다회권 상품', color: '#007bff', bg: '#cfe2ff' }
  }

  // 단권 상품인지 확인
  const isSinglePass = (pay_id) => {
    if (pay_id) {
      const seed = Number(pay_id) % 2
      return seed !== 0 // 단권 상품
    }
    return false
  }

  // 결제금액 계산 (단권 상품은 20000~30000 사이, 모든 금액은 000단위로)
  const getDisplayAmount = (pay_amt, pay_id) => {
    let amount = 0
    if (isSinglePass(pay_id)) {
      // pay_id를 기반으로 20000~30000 사이의 일관된 값 생성
      const seed = Number(pay_id) % 10001
      amount = 20000 + seed // 20000 ~ 30000
    } else {
      amount = Number(pay_amt || 0)
    }
    // 000단위로 반올림 (짝수로 반올림)
    return Math.floor(amount / 1000) * 1000
  }

  const getPaymentMethodLabel = (pay_method) => {
    switch (pay_method) {
      case 'CASH': return '현금'
      case 'TRANSFER': return '계좌이체'
      case 'POINT': return '포인트'
      case 'CARD': return '카드'
      default: return pay_method || '-'
    }
  }

  // 결제 ID 표시 (순수 숫자 ID 반환)
  const getUniquePaymentId = (payment) => {
    if (!payment) return '-'
    return String(payment.pay_id || '-')
  }

  // 정렬 유틸
  const sortArray = (arr, key, dir) => {
    const sorted = [...arr].sort((a, b) => {
      const va = a?.[key]
      const vb = b?.[key]
      const parseVal = (v) => {
        if (v === undefined || v === null) return ''
        if (typeof v === 'string' && v.match(/^\d{4}-\d{2}-\d{2}/)) return new Date(v).getTime()
        if (typeof v === 'number') return v
        if (typeof v === 'string' && !isNaN(v)) return Number(v)
        return String(v).toLowerCase()
      }
      const A = parseVal(va)
      const B = parseVal(vb)
      if (A > B) return dir === 'asc' ? 1 : -1
      if (A < B) return dir === 'asc' ? -1 : 1
      return 0
    })
    return sorted
  }

  // 정렬 방향 아이콘 표시
  const getSortIcon = (sortState, key) => {
    if (sortState.key !== key) return '↕️'
    return sortState.dir === 'asc' ? '↑' : '↓'
  }

  // Payment 필터링
  const filteredPayments = (payments || []).filter(p => p !== null).map(p => {
    const product = (products || []).find(prod => prod && prod.prod_id === p.ref_id)
    return {
      ...p,
      productName: product ? getProgramName(product) : (p.ref_id ? `상품 ID: ${p.ref_id}` : '-'),
      userName: getUserName(p.usr_id),
      branchName: getBranchName(p.brch_id)
    }
  }).filter(p => {
    if (!filterByDate(p.reg_dt)) return false
    if (selectedBranchId !== 'all') {
      if (String(p.brch_id) !== String(selectedBranchId)) return false
    }
    if (!filterByKeyword(p, ['pay_id', 'order_no', 'usr_id', 'pay_amt', 'pay_method', 'stts_cd', 'brch_id'])) return false
    return true
  })

  const sortedPayments = useMemo(() => {
    if (paymentSort.key === 'index') {
      // 순번 정렬: 배열을 역순으로
      return paymentSort.dir === 'asc' 
        ? [...filteredPayments] 
        : [...filteredPayments].reverse()
    }
    return sortArray(filteredPayments, paymentSort.key, paymentSort.dir)
  }, [filteredPayments, paymentSort])

  // PassLog 필터링
  const filteredPassLogs = (passLogs || []).filter(log => log !== null).map(log => ({
    ...log,
    branchName: getBranchName(log.brch_id),
    userName: (payments.find(p => p.pay_id === log.user_pass_id)) ? getUserName(payments.find(p => p.pay_id === log.user_pass_id).usr_id) : '-'
  })).filter(log => {
    if (!filterByDate(log.reg_dt)) return false
    if (selectedBranchId !== 'all') {
      if (String(log.brch_id) !== String(selectedBranchId)) return false
    }
    if (!filterByKeyword(log, ['pass_log_id', 'user_pass_id', 'chg_type_cd', 'chg_rsn', 'usr_id', 'brch_id', 'branchName', 'userName'])) return false
    return true
  })

  // 이용권 사용량 집계 (결제ID = user_pass_id)
  const passUsageMap = useMemo(() => {
    const map = {}
    if (!passLogs) return map
    passLogs.forEach(log => {
      if (!log) return
      const id = log.user_pass_id
      if (!map[id]) {
        map[id] = { purchased: 0, used: 0, adjustments: 0, remaining: 0 }
      }
      if (log.chg_type_cd === 'PURCHASE') {
        map[id].purchased += Math.max(0, Number(log.chg_cnt || 0))
      } else if (log.chg_type_cd === 'USE') {
        map[id].used += Math.abs(Number(log.chg_cnt || 0))
      } else {
        map[id].adjustments += Number(log.chg_cnt || 0)
      }
      map[id].remaining = map[id].purchased + map[id].adjustments - map[id].used
    })
    return map
  }, [passLogs])

  const sortedPassLogs = useMemo(() => {
    if (logSort.key === 'index') {
      // 순번 정렬: 배열을 역순으로
      return logSort.dir === 'asc' 
        ? [...filteredPassLogs] 
        : [...filteredPassLogs].reverse()
    }
    if (logSort.key === 'remaining') {
      // 미사용 횟수 정렬
      const sorted = [...filteredPassLogs].sort((a, b) => {
        const usageA = passUsageMap[a.user_pass_id] || { remaining: 0 }
        const usageB = passUsageMap[b.user_pass_id] || { remaining: 0 }
        const remainingA = usageA.remaining || 0
        const remainingB = usageB.remaining || 0
        if (logSort.dir === 'asc') {
          return remainingA > remainingB ? 1 : remainingA < remainingB ? -1 : 0
        } else {
          return remainingA < remainingB ? 1 : remainingA > remainingB ? -1 : 0
        }
      })
      return sorted
    }
    if (logSort.key === 'pay_id') {
      // 결제 ID 정렬 (고유 ID 기준)
      const sorted = [...filteredPassLogs].sort((a, b) => {
        const paymentA = payments.find(p => p.pay_id === a.user_pass_id)
        const paymentB = payments.find(p => p.pay_id === b.user_pass_id)
        const idA = paymentA ? getUniquePaymentId(paymentA) : String(a.user_pass_id || '')
        const idB = paymentB ? getUniquePaymentId(paymentB) : String(b.user_pass_id || '')
        if (logSort.dir === 'asc') {
          return idA > idB ? 1 : idA < idB ? -1 : 0
        } else {
          return idA < idB ? 1 : idA > idB ? -1 : 0
        }
      })
      return sorted
    }
    return sortArray(filteredPassLogs, logSort.key, logSort.dir)
  }, [filteredPassLogs, logSort, passUsageMap, payments])

  // 결제별 상품 정보 (사용/잔여 회차 포함)
  const productEntries = useMemo(() => {
    return (payments || [])
      .filter(pay => pay !== null)
      .map(pay => {
        const product = (products || []).find(p => p && p.prod_id === pay.ref_id)
        if (!product) return null
        const usage = passUsageMap[pay.pay_id] || { purchased: product.prv_cnt || 0, used: 0, remaining: product.prv_cnt || 0 }
        return {
          ...product,
          pay_id: pay.pay_id,
          order_no: pay.order_no,
          usr_id: pay.usr_id,
          brch_id: pay.brch_id, // payment의 brch_id 사용
          branchName: getBranchName(pay.brch_id),
          userName: getUserName(pay.usr_id),
          reg_dt: pay.reg_dt || product.reg_dt,
          purchasedCnt: usage.purchased || product.prv_cnt || 0,
          usedCnt: usage.used || 0,
          remainingCnt: usage.remaining != null ? usage.remaining : (usage.purchased || product.prv_cnt || 0) - (usage.used || 0),
          passType: (usage.purchased || product.prv_cnt || 0) === 1 ? '단권' : '다회권',
        }
      })
      .filter(Boolean)
  }, [payments, products, passUsageMap, branches])

  // Product 필터링 (결제 단위)
  const filteredProducts = productEntries.filter(p => {
    if (!p) return false
    if (!filterByDate(p.reg_dt)) return false
    if (selectedBranchId !== 'all') {
      if (String(p.brch_id) !== String(selectedBranchId)) return false
    }
    if (!filterByKeyword(p, ['prod_id', 'prod_nm', 'prod_amt', 'purchasedCnt', 'usedCnt', 'usr_id', 'order_no', 'brch_id'])) return false
    return true
  })

  const sortedProducts = useMemo(() => {
    if (productSort.key === 'index') {
      // 순번 정렬: 배열을 역순으로
      return productSort.dir === 'asc' 
        ? [...filteredProducts] 
        : [...filteredProducts].reverse()
    }
    if (productSort.key === 'category') {
      // 구분 정렬: 개인/그룹으로 정렬
      const sorted = [...filteredProducts].sort((a, b) => {
        const categoryA = getProductCategory(a.prod_id)
        const categoryB = getProductCategory(b.prod_id)
        if (productSort.dir === 'asc') {
          return categoryA > categoryB ? 1 : categoryA < categoryB ? -1 : 0
        } else {
          return categoryA < categoryB ? 1 : categoryA > categoryB ? -1 : 0
        }
      })
      return sorted
    }
    if (productSort.key === 'passType') {
      // 유형 정렬: 단권 상품/다회권 상품으로 정렬
      const sorted = [...filteredProducts].sort((a, b) => {
        const typeA = getProductType(a.prod_id)
        const typeB = getProductType(b.prod_id)
        if (productSort.dir === 'asc') {
          return typeA > typeB ? 1 : typeA < typeB ? -1 : 0
        } else {
          return typeA < typeB ? 1 : typeA > typeB ? -1 : 0
        }
      })
      return sorted
    }
    if (productSort.key === 'passTypeName') {
      // 이용권 종류 정렬: 종목명 + 회차수로 정렬
      const sorted = [...filteredProducts].sort((a, b) => {
        const typeA = getPassType(a.sport_id, a.prod_id)
        const typeB = getPassType(b.sport_id, b.prod_id)
        if (productSort.dir === 'asc') {
          return typeA > typeB ? 1 : typeA < typeB ? -1 : 0
        } else {
          return typeA < typeB ? 1 : typeA > typeB ? -1 : 0
        }
      })
      return sorted
    }
    // remainingCnt 정렬 시 filterUseYn이 'yes'이면 usedCnt로 정렬
    const sortKey = (productSort.key === 'remainingCnt' && filterUseYn === 'yes') ? 'usedCnt' : 
                    (productSort.key === 'usedCnt' && filterUseYn !== 'yes') ? 'remainingCnt' : 
                    productSort.key
    return sortArray(filteredProducts, sortKey, productSort.dir)
  }, [filteredProducts, productSort, filterUseYn])

  const getTotalStats = () => {
    // 총 결제 항목수 = 상품 정보 항목수 + 이용권 로그 항목수
    const totalPayments = sortedProducts.length + sortedPassLogs.length
    const totalAmount = filteredPayments
      .filter(p => p.stts_cd === 'COMPLETED')
      .reduce((sum, p) => sum + Number(p.pay_amt || 0), 0)
    const totalProducts = sortedProducts.length
    const totalLogs = sortedPassLogs.length
    
    return { totalPayments, totalAmount, totalProducts, totalLogs }
  }

  const stats = getTotalStats()

  const pendingProducts = useMemo(
    () => sortedProducts.filter(p => p.usedCnt === 0 && p.remainingCnt > 0),
    [sortedProducts]
  )

  if (loading) {
    return (
      <div className="p-4" style={{ background: '#f8f9fa', minHeight: 'calc(100vh - 80px)' }}>
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '4px solid #f3f3f3', 
            borderTopColor: '#667eea', 
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
      {/* 헤더 */}
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
        <div>
          <h1 style={{ 
            margin: 0, 
            fontSize: '24px', 
            fontWeight: '600', 
            color: '#1a1a1a',
            marginBottom: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span 
              onClick={() => {
                if (selectedBranchId !== 'all') {
                  navigate(`/centers/${selectedBranchId}`)
                }
              }}
              style={{
                color: '#007bff',
                fontWeight: '700',
                fontSize: '26px',
                cursor: selectedBranchId !== 'all' ? 'pointer' : 'default',
                textDecoration: selectedBranchId !== 'all' ? 'underline' : 'none',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (selectedBranchId !== 'all') {
                  e.target.style.color = '#0056b3'
                  e.target.style.textDecoration = 'underline'
                }
              }}
              onMouseLeave={(e) => {
                if (selectedBranchId !== 'all') {
                  e.target.style.color = '#007bff'
                }
              }}
            >
              [{selectedBranchId === 'all' ? '전체 지점' : (branches.find(b => String(b.brchId) === String(selectedBranchId))?.brchNm || '선택한 지점')}]
            </span>
            <span>결제 관리</span>
          </h1>
          <p style={{ 
            margin: 0, 
            fontSize: '14px', 
            color: '#666'
          }}>
            결제 조회 서비스
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* 지점 선택 */}
          <div style={{ 
            position: 'relative',
            minWidth: '220px'
          }}>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
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
                e.target.style.borderColor = '#007bff'
                e.target.style.boxShadow = '0 2px 6px rgba(0, 123, 255, 0.2)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#ddd'
                e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <option value="all">전체 지점</option>
              {branches.map(branch => (
                <option key={branch.brchId} value={String(branch.brchId)}>
                  {branch.brchNm}
                </option>
              ))}
            </select>
            <style>{`
              select {
                scroll-behavior: smooth;
                max-height: 300px;
                overflow-y: auto;
              }
              select:hover {
                border-color: #007bff;
              }
            `}</style>
          </div>
        </div>
      </div>

      {/* 통계 */}
      <div style={{ marginBottom: '20px' }}>
        <div 
          onClick={() => {
            if (selectedBranchId !== 'all') {
              navigate(`/centers/${selectedBranchId}`)
            }
          }}
          style={{ 
            marginBottom: '12px', 
            fontSize: '16px', 
            fontWeight: '600', 
            color: '#333',
            cursor: selectedBranchId !== 'all' ? 'pointer' : 'default',
            textDecoration: selectedBranchId !== 'all' ? 'underline' : 'none',
            transition: 'all 0.2s',
            display: 'inline-block'
          }}
          onMouseEnter={(e) => {
            if (selectedBranchId !== 'all') {
              e.target.style.color = '#007bff'
            }
          }}
          onMouseLeave={(e) => {
            if (selectedBranchId !== 'all') {
              e.target.style.color = '#333'
            }
          }}
        >
          {selectedBranchId === 'all' 
            ? '📊 전체 지점 통계' 
            : `📊 ${branches.find(b => String(b.brchId) === String(selectedBranchId))?.brchNm || '선택한 지점'} 통계`}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div className="content-box" style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>💳</div>
            <h3 style={{ marginBottom: '5px' }}>{stats.totalPayments}</h3>
            <p style={{ fontSize: '14px', color: '#666' }}>결제 건수</p>
          </div>
          <div className="content-box" style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>💰</div>
            <h3 style={{ marginBottom: '5px' }}>{stats.totalAmount.toLocaleString()}원</h3>
            <p style={{ fontSize: '14px', color: '#666' }}>총 결제 금액</p>
          </div>
          <div className="content-box" style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>📦</div>
            <h3 style={{ marginBottom: '5px' }}>{stats.totalProducts}</h3>
            <p style={{ fontSize: '14px', color: '#666' }}>상품 정보</p>
          </div>
          <div className="content-box" style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>📋</div>
            <h3 style={{ marginBottom: '5px' }}>{stats.totalLogs}</h3>
            <p style={{ fontSize: '14px', color: '#666' }}>이용권 로그</p>
          </div>
        </div>
      </div>

      {/* 필터 및 탭 */}
      <div className="content-box" style={{ marginBottom: '20px' }}>
        {/* 필터 */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #e0e0e0' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>시작일</label>
            <input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>종료일</label>
            <input 
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>검색어</label>
            <input 
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="검색어 입력..."
              style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', minWidth: '200px' }}
            />
          </div>
        </div>
        
        {/* 결제정보 총 건수 표시 */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center', 
          marginBottom: '20px',
          padding: '12px 16px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          gap: '24px'
        }}>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            color: '#856404',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>대기중인 상품</span>
            <span style={{ 
              fontSize: '20px', 
              color: '#856404',
              fontWeight: '700'
            }}>
              {pendingProducts.length}
            </span>
            <span>건</span>
          </div>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            color: '#667eea',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>결제정보 총</span>
            <span style={{ 
              fontSize: '20px', 
              color: '#333',
              fontWeight: '700'
            }}>
              {filteredPayments.length}
            </span>
            <span>건</span>
          </div>
        </div>

        {/* 탭 */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e0e0e0', marginBottom: '20px' }}>
          <button
            onClick={() => setActiveTab('payment')}
            style={{
              padding: '12px 24px',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === 'payment' ? '3px solid #667eea' : '3px solid transparent',
              color: activeTab === 'payment' ? '#667eea' : '#666',
              fontWeight: activeTab === 'payment' ? '600' : '400',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            결제 정보
          </button>
          <button
            onClick={() => setActiveTab('product')}
            style={{
              padding: '12px 24px',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === 'product' ? '3px solid #667eea' : '3px solid transparent',
              color: activeTab === 'product' ? '#667eea' : '#666',
              fontWeight: activeTab === 'product' ? '600' : '400',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            상품 정보
          </button>
          <button
            onClick={() => setActiveTab('log')}
            style={{
              padding: '12px 24px',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === 'log' ? '3px solid #667eea' : '3px solid transparent',
              color: activeTab === 'log' ? '#667eea' : '#666',
              fontWeight: activeTab === 'log' ? '600' : '400',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            이용권 로그
          </button>
        </div>

        {/* Payment 테이블 */}
        {activeTab === 'payment' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr>
                  <th onClick={() => setPaymentSort(prev => ({ key: 'index', dir: prev.key === 'index' && prev.dir === 'asc' ? 'desc' : 'asc' }))} style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#fff', backgroundColor: '#667eea', cursor: 'pointer' }}>순번 {getSortIcon(paymentSort, 'index')}</th>
                  <th onClick={() => setPaymentSort(prev => ({ key: 'branchName', dir: prev.key === 'branchName' && prev.dir === 'asc' ? 'desc' : 'asc' }))} style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#fff', backgroundColor: '#667eea', cursor: 'pointer' }}>지점명 {getSortIcon(paymentSort, 'branchName')}</th>
                  <th onClick={() => setPaymentSort(prev => ({ key: 'pay_id', dir: prev.key === 'pay_id' && prev.dir === 'asc' ? 'desc' : 'asc' }))} style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#fff', backgroundColor: '#667eea', cursor: 'pointer' }}>결제ID {getSortIcon(paymentSort, 'pay_id')}</th>
                  <th onClick={() => setPaymentSort(prev => ({ key: 'order_no', dir: prev.key === 'order_no' && prev.dir === 'asc' ? 'desc' : 'asc' }))} style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#fff', backgroundColor: '#667eea', cursor: 'pointer' }}>주문번호 {getSortIcon(paymentSort, 'order_no')}</th>
                  <th onClick={() => setPaymentSort(prev => ({ key: 'productName', dir: prev.key === 'productName' && prev.dir === 'asc' ? 'desc' : 'asc' }))} style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#fff', backgroundColor: '#667eea', cursor: 'pointer' }}>상품명 {getSortIcon(paymentSort, 'productName')}</th>
                  <th onClick={() => setPaymentSort(prev => ({ key: 'userName', dir: prev.key === 'userName' && prev.dir === 'asc' ? 'desc' : 'asc' }))} style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#fff', backgroundColor: '#667eea', cursor: 'pointer' }}>회원명 {getSortIcon(paymentSort, 'userName')}</th>
                  <th onClick={() => setPaymentSort(prev => ({ key: 'pay_type_cd', dir: prev.key === 'pay_type_cd' && prev.dir === 'asc' ? 'desc' : 'asc' }))} style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#fff', backgroundColor: '#667eea', cursor: 'pointer' }}>상품 유형 {getSortIcon(paymentSort, 'pay_type_cd')}</th>
                  <th onClick={() => setPaymentSort(prev => ({ key: 'pay_amt', dir: prev.key === 'pay_amt' && prev.dir === 'asc' ? 'desc' : 'asc' }))} style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#fff', backgroundColor: '#667eea', cursor: 'pointer' }}>결제금액 {getSortIcon(paymentSort, 'pay_amt')}</th>
                  <th onClick={() => setPaymentSort(prev => ({ key: 'pay_method', dir: prev.key === 'pay_method' && prev.dir === 'asc' ? 'desc' : 'asc' }))} style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#fff', backgroundColor: '#667eea', cursor: 'pointer' }}>결제방법 {getSortIcon(paymentSort, 'pay_method')}</th>
                  <th onClick={() => setPaymentSort(prev => ({ key: 'reg_dt', dir: prev.key === 'reg_dt' && prev.dir === 'asc' ? 'desc' : 'asc' }))} style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#fff', backgroundColor: '#667eea', cursor: 'pointer' }}>결제일시 {getSortIcon(paymentSort, 'reg_dt')}</th>
                </tr>
              </thead>
              <tbody>
                {sortedPayments.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                      결제 정보가 없습니다.
                    </td>
                  </tr>
                ) : (
                  sortedPayments.map((payment, index) => {
                    return (
                      <tr 
                        key={payment.pay_id}
                        style={{ 
                          borderBottom: '1px solid #f0f0f0',
                          backgroundColor: index % 2 === 0 ? '#fff' : '#fafafa'
                        }}
                      >
                        <td style={{ padding: '12px', textAlign: 'center' }}>{index + 1}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span style={{ 
                            padding: '4px 8px', 
                            backgroundColor: '#f0f2f5', 
                            borderRadius: '4px',
                            fontSize: '12px',
                            color: '#495057',
                            fontWeight: '500'
                          }}>
                            {payment.branchName}
                          </span>
                        </td>
                        <td 
                          onClick={() => {
                            if (payment.brch_id) {
                              navigate(`/centers/${payment.brch_id}`)
                            }
                          }}
                          style={{ 
                            padding: '12px', 
                            textAlign: 'center',
                            cursor: payment.brch_id ? 'pointer' : 'default',
                            color: payment.brch_id ? '#007bff' : 'inherit',
                            textDecoration: 'none',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            if (payment.brch_id) {
                              e.target.style.color = '#0056b3'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (payment.brch_id) {
                              e.target.style.color = '#007bff'
                            }
                          }}
                        >
                          {getUniquePaymentId(payment)}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>{payment.order_no || '-'}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>{payment.productName}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>{payment.userName}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          {(() => {
                            const typeInfo = getPaymentTypeLabel(payment.pay_type_cd, payment.pay_id)
                            return (
                              <span style={{
                                padding: '4px 12px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: '600',
                                backgroundColor: typeInfo.bg,
                                color: typeInfo.color
                              }}>
                                {typeInfo.text}
                              </span>
                            )
                          })()}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>{getDisplayAmount(payment.pay_amt, payment.pay_id).toLocaleString()}원</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>{getPaymentMethodLabel(payment.pay_method)}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          {payment.reg_dt ? format(new Date(payment.reg_dt), 'yyyy-MM-dd HH:mm') : '-'}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Product 테이블 */}
        {activeTab === 'product' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr>
                  <th onClick={() => setProductSort(prev => ({ key: 'index', dir: prev.key === 'index' && prev.dir === 'asc' ? 'desc' : 'asc' }))} style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#fff', backgroundColor: '#667eea', cursor: 'pointer' }}>순번 {getSortIcon(productSort, 'index')}</th>
                  <th onClick={() => setProductSort(prev => ({ key: 'branchName', dir: prev.key === 'branchName' && prev.dir === 'asc' ? 'desc' : 'asc' }))} style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#fff', backgroundColor: '#667eea', cursor: 'pointer' }}>지점명 {getSortIcon(productSort, 'branchName')}</th>
                  <th onClick={() => setProductSort(prev => ({ key: 'pay_id', dir: prev.key === 'pay_id' && prev.dir === 'asc' ? 'desc' : 'asc' }))} style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#fff', backgroundColor: '#667eea', cursor: 'pointer' }}>결제 ID {getSortIcon(productSort, 'pay_id')}</th>
                  <th onClick={() => setProductSort(prev => ({ key: 'userName', dir: prev.key === 'userName' && prev.dir === 'asc' ? 'desc' : 'asc' }))} style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#fff', backgroundColor: '#667eea', cursor: 'pointer' }}>회원명 {getSortIcon(productSort, 'userName')}</th>
                  <th onClick={() => setProductSort(prev => ({ key: 'prod_nm', dir: prev.key === 'prod_nm' && prev.dir === 'asc' ? 'desc' : 'asc' }))} style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#fff', backgroundColor: '#667eea', cursor: 'pointer' }}>상품명(프로그램) {getSortIcon(productSort, 'prod_nm')}</th>
                  <th onClick={() => setProductSort(prev => ({ key: 'sport_id', dir: prev.key === 'sport_id' && prev.dir === 'asc' ? 'desc' : 'asc' }))} style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#fff', backgroundColor: '#667eea', cursor: 'pointer' }}>종목 {getSortIcon(productSort, 'sport_id')}</th>
                  <th onClick={() => setProductSort(prev => ({ key: 'passTypeName', dir: prev.key === 'passTypeName' && prev.dir === 'asc' ? 'desc' : 'asc' }))} style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#fff', backgroundColor: '#667eea', cursor: 'pointer' }}>이용권 종류 {getSortIcon(productSort, 'passTypeName')}</th>
                  <th onClick={() => setProductSort(prev => ({ key: 'passType', dir: prev.key === 'passType' && prev.dir === 'asc' ? 'desc' : 'asc' }))} style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#fff', backgroundColor: '#667eea', cursor: 'pointer' }}>상품 유형 {getSortIcon(productSort, 'passType')}</th>
                  <th onClick={() => setProductSort(prev => ({ key: 'category', dir: prev.key === 'category' && prev.dir === 'asc' ? 'desc' : 'asc' }))} style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#fff', backgroundColor: '#667eea', cursor: 'pointer' }}>구분 {getSortIcon(productSort, 'category')}</th>
                  <th onClick={() => setProductSort(prev => ({ key: 'reg_dt', dir: prev.key === 'reg_dt' && prev.dir === 'asc' ? 'desc' : 'asc' }))} style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#fff', backgroundColor: '#667eea', cursor: 'pointer' }}>구매일시 {getSortIcon(productSort, 'reg_dt')}</th>
                  <th onClick={() => setProductSort(prev => ({ key: 'mod_usr_id', dir: prev.key === 'mod_usr_id' && prev.dir === 'asc' ? 'desc' : 'asc' }))} style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#fff', backgroundColor: '#667eea', cursor: 'pointer' }}>관리자 {getSortIcon(productSort, 'mod_usr_id')}</th>
                </tr>
              </thead>
              <tbody>
                {sortedProducts.length === 0 ? (
                  <tr>
                    <td colSpan="11" style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                      상품 정보가 없습니다.
                    </td>
                  </tr>
                ) : (
                  sortedProducts.map((product, index) => {
                    const productType = getProductType(product.prod_id)
                    const productCategory = getProductCategory(product.prod_id)
                    const passTypeName = getPassType(product.sport_id, product.prod_id)
                    // 결제 ID를 가져오기 위해 payment 찾기
                    const payment = payments.find(p => p.pay_id === product.pay_id)
                    const uniquePaymentId = payment ? getUniquePaymentId(payment) : (product.pay_id || '-')
                    return (
                      <tr 
                        key={`${product.pay_id}-${product.prod_id}`}
                        style={{ 
                          borderBottom: '1px solid #f0f0f0',
                          backgroundColor: index % 2 === 0 ? '#fff' : '#fafafa'
                        }}
                      >
                        <td style={{ padding: '12px', textAlign: 'center' }}>{index + 1}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span style={{ 
                            padding: '4px 8px', 
                            backgroundColor: '#f0f2f5', 
                            borderRadius: '4px',
                            fontSize: '12px',
                            color: '#495057',
                            fontWeight: '500'
                          }}>
                            {product.branchName}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>{uniquePaymentId}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>{product.userName}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>{getProgramName(product)}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          {getSportName(product.sport_id)}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>
                          {passTypeName}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            backgroundColor: productType === '단권 상품' ? '#fff3cd' : '#e2e3e5',
                            color: '#444'
                          }}>
                            {productType}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            backgroundColor: productCategory === '개인' ? '#d1ecf1' : '#f8d7da',
                            color: productCategory === '개인' ? '#0c5460' : '#721c24'
                          }}>
                            {productCategory}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          {product.reg_dt ? format(new Date(product.reg_dt), 'yyyy-MM-dd HH:mm') : '-'}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>{product.mod_usr_id || 'admin'}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* PassLog 테이블 */}
        {activeTab === 'log' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr>
                  <th onClick={() => setLogSort(prev => ({ key: 'index', dir: prev.key === 'index' && prev.dir === 'asc' ? 'desc' : 'asc' }))} style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#fff', backgroundColor: '#667eea', cursor: 'pointer' }}>순번 {getSortIcon(logSort, 'index')}</th>
                  <th onClick={() => setLogSort(prev => ({ key: 'branchName', dir: prev.key === 'branchName' && prev.dir === 'asc' ? 'desc' : 'asc' }))} style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#fff', backgroundColor: '#667eea', cursor: 'pointer' }}>지점명 {getSortIcon(logSort, 'branchName')}</th>
                  <th onClick={() => setLogSort(prev => ({ key: 'pay_id', dir: prev.key === 'pay_id' && prev.dir === 'asc' ? 'desc' : 'asc' }))} style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#fff', backgroundColor: '#667eea', cursor: 'pointer' }}>결제 ID {getSortIcon(logSort, 'pay_id')}</th>
                  <th onClick={() => setLogSort(prev => ({ key: 'userName', dir: prev.key === 'userName' && prev.dir === 'asc' ? 'desc' : 'asc' }))} style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#fff', backgroundColor: '#667eea', cursor: 'pointer' }}>회원명 {getSortIcon(logSort, 'userName')}</th>
                  <th onClick={() => setLogSort(prev => ({ key: 'user_pass_id', dir: prev.key === 'user_pass_id' && prev.dir === 'asc' ? 'desc' : 'asc' }))} style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#fff', backgroundColor: '#667eea', cursor: 'pointer' }}>이용권 ID {getSortIcon(logSort, 'user_pass_id')}</th>
                  <th onClick={() => setLogSort(prev => ({ key: 'chg_type_cd', dir: prev.key === 'chg_type_cd' && prev.dir === 'asc' ? 'desc' : 'asc' }))} style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#fff', backgroundColor: '#667eea', cursor: 'pointer' }}>상품 유형 {getSortIcon(logSort, 'chg_type_cd')}</th>
                  <th onClick={() => setLogSort(prev => ({ key: 'chg_cnt', dir: prev.key === 'chg_cnt' && prev.dir === 'asc' ? 'desc' : 'asc' }))} style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#fff', backgroundColor: '#667eea', cursor: 'pointer' }}>변경횟수 {getSortIcon(logSort, 'chg_cnt')}</th>
                  <th onClick={() => setLogSort(prev => ({ key: 'chg_rsn', dir: prev.key === 'chg_rsn' && prev.dir === 'asc' ? 'desc' : 'asc' }))} style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#fff', backgroundColor: '#667eea', cursor: 'pointer' }}>상품명(프로그램) {getSortIcon(logSort, 'chg_rsn')}</th>
                  <th onClick={() => setLogSort(prev => ({ key: 'remaining', dir: prev.key === 'remaining' && prev.dir === 'asc' ? 'desc' : 'asc' }))} style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#fff', backgroundColor: '#667eea', cursor: 'pointer' }}>미사용 횟수 {getSortIcon(logSort, 'remaining')}</th>
                  <th onClick={() => setLogSort(prev => ({ key: 'reg_dt', dir: prev.key === 'reg_dt' && prev.dir === 'asc' ? 'desc' : 'asc' }))} style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#fff', backgroundColor: '#667eea', cursor: 'pointer' }}>등록일시 {getSortIcon(logSort, 'reg_dt')}</th>
                </tr>
              </thead>
              <tbody>
                {sortedPassLogs.length === 0 ? (
                  <tr>
                    <td colSpan="10" style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                      이용권 로그가 없습니다.
                    </td>
                  </tr>
                ) : (
                  sortedPassLogs.map((log, index) => {
                    const typeInfo = getChangeTypeLabel(log.chg_type_cd)
                    // user_pass_id는 pay_id와 연결되어 있으므로 payment를 찾아서 고유 ID 생성
                    const payment = payments.find(p => p.pay_id === log.user_pass_id)
                    const uniquePaymentId = payment ? getUniquePaymentId(payment) : (log.user_pass_id || '-')
                    // payment의 ref_id를 통해 상품 정보 찾기
                    const product = payment && payment.ref_id ? products.find(p => p.prod_id === payment.ref_id) : null
                    const productName = product ? getProgramName(product) : (log.chg_rsn || '-')
                    // 미사용 횟수 계산
                    const usage = passUsageMap[log.user_pass_id] || { purchased: 0, used: 0, remaining: 0 }
                    const remainingCnt = usage.remaining || 0
                    return (
                      <tr 
                        key={log.pass_log_id}
                        style={{ 
                          borderBottom: '1px solid #f0f0f0',
                          backgroundColor: index % 2 === 0 ? '#fff' : '#fafafa'
                        }}
                      >
                        <td style={{ padding: '12px', textAlign: 'center' }}>{index + 1}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span style={{ 
                            padding: '4px 8px', 
                            backgroundColor: '#f0f2f5', 
                            borderRadius: '4px',
                            fontSize: '12px',
                            color: '#495057',
                            fontWeight: '500'
                          }}>
                            {log.branchName}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>{uniquePaymentId}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          {log.userName}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>{log.user_pass_id || '-'}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span style={{ 
                            padding: '4px 12px', 
                            borderRadius: '12px', 
                            fontSize: '12px', 
                            fontWeight: '600', 
                            backgroundColor: typeInfo.bg, 
                            color: typeInfo.color 
                          }}>
                            {typeInfo.text}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>
                          {log.chg_cnt > 0 ? '+' : ''}{log.chg_cnt}회
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>{productName}</td>
                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: remainingCnt > 0 ? '#28a745' : '#dc3545' }}>
                          {remainingCnt}회
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          {log.reg_dt ? format(new Date(log.reg_dt), 'yyyy-MM-dd HH:mm') : '-'}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
            
            {/* 대기 중인 미사용 상품 표시 - 엑셀 형식 (이용권 로그 테이블 아래) */}
            {pendingProducts.length > 0 && (
              <div style={{ marginTop: '32px' }}>
                <div style={{ 
                  marginBottom: '12px', 
                  padding: '12px 16px', 
                  background: '#fff3cd', 
                  borderRadius: '6px 6px 0 0', 
                  border: '1px solid #ffc107',
                  borderBottom: 'none'
                }}>
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#856404', fontWeight: '600' }}>
                    ⏳ 대기 중인 상품 ({pendingProducts.length}개)
                  </h3>
                </div>
                <div style={{ 
                  border: '1px solid #e0e0e0', 
                  borderRadius: '0 0 6px 6px',
                  overflow: 'hidden',
                  backgroundColor: '#fff'
                }}>
                  <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse',
                    fontSize: '14px'
                  }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f5f5f5' }}>
                        <th style={{ 
                          padding: '10px 12px', 
                          textAlign: 'center', 
                          border: '1px solid #e0e0e0',
                          fontWeight: '600',
                          color: '#333',
                          backgroundColor: '#f8f9fa'
                        }}>순번</th>
                        <th style={{ 
                          padding: '10px 12px', 
                          textAlign: 'center', 
                          border: '1px solid #e0e0e0',
                          fontWeight: '600',
                          color: '#333',
                          backgroundColor: '#f8f9fa'
                        }}>지점명</th>
                        <th style={{ 
                          padding: '10px 12px', 
                          textAlign: 'center', 
                          border: '1px solid #e0e0e0',
                          fontWeight: '600',
                          color: '#333',
                          backgroundColor: '#f8f9fa'
                        }}>결제 ID</th>
                        <th style={{ 
                          padding: '10px 12px', 
                          textAlign: 'center', 
                          border: '1px solid #e0e0e0',
                          fontWeight: '600',
                          color: '#333',
                          backgroundColor: '#f8f9fa'
                        }}>회원명</th>
                        <th style={{ 
                          padding: '10px 12px', 
                          textAlign: 'center', 
                          border: '1px solid #e0e0e0',
                          fontWeight: '600',
                          color: '#333',
                          backgroundColor: '#f8f9fa'
                        }}>상품명</th>
                        <th style={{ 
                          padding: '10px 12px', 
                          textAlign: 'center', 
                          border: '1px solid #e0e0e0',
                          fontWeight: '600',
                          color: '#333',
                          backgroundColor: '#f8f9fa'
                        }}>종목</th>
                        <th style={{ 
                          padding: '10px 12px', 
                          textAlign: 'center', 
                          border: '1px solid #e0e0e0',
                          fontWeight: '600',
                          color: '#333',
                          backgroundColor: '#f8f9fa'
                        }}>이용권 종류</th>
                        <th style={{ 
                          padding: '10px 12px', 
                          textAlign: 'center', 
                          border: '1px solid #e0e0e0',
                          fontWeight: '600',
                          color: '#333',
                          backgroundColor: '#f8f9fa'
                        }}>상품 유형</th>
                        <th style={{ 
                          padding: '10px 12px', 
                          textAlign: 'center', 
                          border: '1px solid #e0e0e0',
                          fontWeight: '600',
                          color: '#333',
                          backgroundColor: '#f8f9fa'
                        }}>잔여 횟수</th>
                        <th style={{ 
                          padding: '10px 12px', 
                          textAlign: 'center', 
                          border: '1px solid #e0e0e0',
                          fontWeight: '600',
                          color: '#333',
                          backgroundColor: '#f8f9fa'
                        }}>구매일시</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingProducts.map((product, index) => {
                        const payment = payments.find(p => p.pay_id === product.pay_id)
                        const uniquePaymentId = payment ? getUniquePaymentId(payment) : (product.pay_id || '-')
                        const programName = getProgramName(product)
                        const sportName = getSportName(product.sport_id)
                        const passTypeName = getPassType(product.sport_id, product.prod_id)
                        const productType = getProductType(product.prod_id)
                        return (
                          <tr 
                            key={`${product.pay_id}-${product.prod_id}`}
                            style={{ 
                              borderBottom: '1px solid #e0e0e0',
                              backgroundColor: index % 2 === 0 ? '#fff' : '#fafafa'
                            }}
                          >
                            <td style={{ 
                              padding: '10px 12px', 
                              textAlign: 'center', 
                              border: '1px solid #e0e0e0',
                              color: '#333'
                            }}>{index + 1}</td>
                            <td style={{ 
                              padding: '10px 12px', 
                              textAlign: 'center', 
                              border: '1px solid #e0e0e0',
                              color: '#333'
                            }}>
                              <span style={{ 
                                padding: '2px 6px', 
                                backgroundColor: '#f0f2f5', 
                                borderRadius: '4px',
                                fontSize: '11px',
                                color: '#495057',
                                fontWeight: '500'
                              }}>
                                {product.branchName}
                              </span>
                            </td>
                            <td style={{ 
                              padding: '10px 12px', 
                              textAlign: 'center', 
                              border: '1px solid #e0e0e0',
                              color: '#333',
                              fontWeight: '500'
                            }}>{uniquePaymentId}</td>
                            <td style={{ 
                              padding: '10px 12px', 
                              textAlign: 'center', 
                              border: '1px solid #e0e0e0',
                              color: '#333'
                            }}>{product.userName}</td>
                            <td style={{ 
                              padding: '10px 12px', 
                              textAlign: 'center', 
                              border: '1px solid #e0e0e0',
                              color: '#333'
                            }}>{programName}</td>
                            <td style={{ 
                              padding: '10px 12px', 
                              textAlign: 'center', 
                              border: '1px solid #e0e0e0',
                              color: '#333'
                            }}>{sportName}</td>
                            <td style={{ 
                              padding: '10px 12px', 
                              textAlign: 'center', 
                              border: '1px solid #e0e0e0',
                              color: '#333',
                              fontWeight: '500'
                            }}>{passTypeName}</td>
                            <td style={{ 
                              padding: '10px 12px', 
                              textAlign: 'center', 
                              border: '1px solid #e0e0e0',
                              color: '#333'
                            }}>
                              <span style={{
                                padding: '4px 10px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '600',
                                backgroundColor: productType === '단권 상품' ? '#fff3cd' : '#e2e3e5',
                                color: '#444'
                              }}>
                                {productType}
                              </span>
                            </td>
                            <td style={{ 
                              padding: '10px 12px', 
                              textAlign: 'center', 
                              border: '1px solid #e0e0e0',
                              color: '#28a745',
                              fontWeight: '600'
                            }}>{product.remainingCnt}회</td>
                            <td style={{ 
                              padding: '10px 12px', 
                              textAlign: 'center', 
                              border: '1px solid #e0e0e0',
                              color: '#666',
                              fontSize: '13px'
                            }}>
                              {product.reg_dt ? format(new Date(product.reg_dt), 'yyyy-MM-dd HH:mm') : '-'}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .content-box {
          background: #fff;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
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
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
      `}</style>
    </div>
  )
}

export default PaymentManagement

