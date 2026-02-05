import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format, subMonths } from 'date-fns'
import { passProductApi, passLogApi, sportTypeApi, branchApi } from '../../api'

function MembershipPayments() {
  const { branchId: urlBranchId } = useParams()
  const navigate = useNavigate()
  const [branches, setBranches] = useState([])
  const [selectedBranchId, setSelectedBranchId] = useState(urlBranchId ? Number(urlBranchId) : null)
  const [selectedBranch, setSelectedBranch] = useState(null)
  const [products, setProducts] = useState([])
  const [sportTypes, setSportTypes] = useState([])
  const [passLogs, setPassLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState(format(subMonths(new Date(), 1), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [selectedSportId, setSelectedSportId] = useState('all')
  const [selectedProductId, setSelectedProductId] = useState('all')

  useEffect(() => {
    loadBranches()
    loadSportTypes()
  }, [])

  useEffect(() => {
    if (selectedBranchId) {
      loadProducts()
      loadPassLogs()
    }
  }, [selectedBranchId, startDate, endDate, selectedSportId, selectedProductId])

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
    } finally {
      setLoading(false)
    }
  }

  const loadSportTypes = async () => {
    try {
      const response = await sportTypeApi.getAll()
      setSportTypes(response.data || [])
    } catch (error) {
      console.error('Failed to load sport types:', error)
      setSportTypes([])
    }
  }

  const loadProducts = async () => {
    try {
      const response = await passProductApi.getAll()
      const allProducts = response.data || []
      setProducts(allProducts)
    } catch (error) {
      console.error('Failed to load products:', error)
      setProducts([])
    }
  }

  const loadPassLogs = async () => {
    try {
      const response = await passLogApi.getAll()
      const allLogs = response.data || []
      // 날짜 필터링
      let filtered = allLogs.filter(log => {
        const regDate = log.regDt ? new Date(log.regDt) : null
        if (!regDate) return false
        const start = new Date(startDate)
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        return regDate >= start && regDate <= end
      })

      // 상품 ID로 필터링 (pass_log의 chg_rsn에서 상품명 추출하거나, payment 테이블과 조인 필요)
      // 여기서는 간단하게 chg_rsn에 상품명이 포함되어 있다고 가정
      if (selectedProductId !== 'all') {
        const product = products.find(p => p.prodId === Number(selectedProductId))
        if (product) {
          filtered = filtered.filter(log => 
            log.chgRsn && log.chgRsn.includes(product.prodNm)
          )
        }
      }

      setPassLogs(filtered)
    } catch (error) {
      console.error('Failed to load pass logs:', error)
      setPassLogs([])
    }
  }

  const handleBranchChange = (e) => {
    const branchId = Number(e.target.value)
    const branch = branches.find(b => b.branchId === branchId)
    setSelectedBranchId(branchId)
    setSelectedBranch(branch)
    navigate(`/centers/${branchId}/membership-payments`, { replace: true })
  }

  // 스포츠별로 상품 그룹화
  const getProductsBySport = () => {
    const grouped = {}
    products.forEach(product => {
      const sportId = product.sportId
      if (!grouped[sportId]) {
        grouped[sportId] = []
      }
      grouped[sportId].push(product)
    })
    return grouped
  }

  // 상품별 판매 통계
  const getProductStats = (productId) => {
    const product = products.find(p => p.prodId === productId)
    if (!product) return { totalSales: 0, totalCount: 0 }
    
    // pass_log에서 해당 상품 관련 로그 찾기
    const relatedLogs = passLogs.filter(log => 
      log.chgRsn && log.chgRsn.includes(product.prodNm) && log.chgTypeCd === 'PURCHASE'
    )
    
    const totalCount = relatedLogs.length
    const totalSales = totalCount * product.prodAmt
    
    return { totalSales, totalCount }
  }

  // 스포츠별 총 판매 통계
  const getSportStats = (sportId) => {
    const sportProducts = products.filter(p => p.sportId === sportId)
    let totalSales = 0
    let totalCount = 0
    
    sportProducts.forEach(product => {
      const stats = getProductStats(product.prodId)
      totalSales += stats.totalSales
      totalCount += stats.totalCount
    })
    
    return { totalSales, totalCount }
  }

  const getChangeTypeLabel = (chgTypeCd) => {
    switch (chgTypeCd) {
      case 'PURCHASE': return { text: '구매', color: '#28a745', bg: '#d4edda' }
      case 'USE': return { text: '사용', color: '#007bff', bg: '#cfe2ff' }
      case 'REFUND': return { text: '환불', color: '#dc3545', bg: '#f8d7da' }
      case 'ADJUST': return { text: '조정', color: '#ffc107', bg: '#fff3cd' }
      default: return { text: chgTypeCd, color: '#6c757d', bg: '#e9ecef' }
    }
  }

  const getSportName = (sportId) => {
    const sport = sportTypes.find(s => s.sportId === sportId)
    return sport ? (sport.sportNm || sport.sportName) : `스포츠 ID: ${sportId}`
  }

  const filteredProducts = selectedSportId === 'all' 
    ? products 
    : products.filter(p => p.sportId === Number(selectedSportId))

  if (loading && branches.length === 0) {
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

  const productsBySport = getProductsBySport()

  return (
    <div className="p-4" style={{ background: '#f8f9fa', minHeight: 'calc(100vh - 80px)' }}>
      {/* 헤더 */}
      <div style={{ 
        marginBottom: '24px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        padding: '24px',
        color: '#fff',
        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '32px' }}>📦</span>
            이용권 상품 판매 및 이력
          </h1>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
            {selectedBranch?.branchName || '지점을 선택해주세요'} - 상품별 판매 현황 및 이용권 이력 조회
          </p>
        </div>
      </div>

      {/* 지점 선택 */}
      <div className="content-box" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '16px', fontWeight: '600', color: '#333', minWidth: '80px' }}>
            🏢 지점:
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
              cursor: 'pointer'
            }}
          >
            {branches.map(branch => (
              <option key={branch.branchId} value={branch.branchId}>
                {branch.branchName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 필터 */}
      <div className="content-box" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
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
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>스포츠 종목</label>
            <select 
              value={selectedSportId}
              onChange={(e) => {
                setSelectedSportId(e.target.value)
                setSelectedProductId('all')
              }}
              style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', minWidth: '150px' }}
            >
              <option value="all">전체</option>
              {sportTypes.map(sport => (
                <option key={sport.sportId} value={sport.sportId}>
                  {sport.sportNm || sport.sportName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>상품</label>
            <select 
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', minWidth: '200px' }}
            >
              <option value="all">전체</option>
              {filteredProducts.map(product => (
                <option key={product.prodId} value={product.prodId}>
                  {product.prodNm}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 스포츠별 상품 판매 현황 */}
      <div className="content-box" style={{ marginBottom: '20px' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: '600' }}>스포츠별 상품 판매 현황</h2>
        {Object.keys(productsBySport).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
            <p>등록된 상품이 없습니다.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {Object.entries(productsBySport)
              .filter(([sportId]) => selectedSportId === 'all' || sportId === selectedSportId)
              .map(([sportId, sportProducts]) => {
                const sportStats = getSportStats(Number(sportId))
                return (
                  <div key={sportId} style={{ border: '2px solid #e0e0e0', borderRadius: '12px', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#333' }}>
                        {getSportName(Number(sportId))}
                      </h3>
                      <div style={{ display: 'flex', gap: '20px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '12px', color: '#666' }}>총 판매 건수</div>
                          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#667eea' }}>
                            {sportStats.totalCount}건
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '12px', color: '#666' }}>총 판매 금액</div>
                          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>
                            {sportStats.totalSales.toLocaleString()}원
                          </div>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                      {sportProducts
                        .filter(p => selectedProductId === 'all' || p.prodId === Number(selectedProductId))
                        .map(product => {
                          const stats = getProductStats(product.prodId)
                          return (
                            <div
                              key={product.prodId}
                              style={{
                                border: '1px solid #e0e0e0',
                                borderRadius: '8px',
                                padding: '16px',
                                backgroundColor: '#fafafa'
                              }}
                            >
                              <div style={{ marginBottom: '8px' }}>
                                <strong style={{ fontSize: '16px', color: '#333' }}>{product.prodNm}</strong>
                              </div>
                              <div style={{ marginBottom: '4px', fontSize: '14px', color: '#666' }}>
                                금액: {product.prodAmt?.toLocaleString()}원
                              </div>
                              <div style={{ marginBottom: '8px', fontSize: '14px', color: '#666' }}>
                                제공 횟수: {product.prvCnt}회
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e0e0e0' }}>
                                <div>
                                  <div style={{ fontSize: '11px', color: '#666' }}>판매 건수</div>
                                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#667eea' }}>
                                    {stats.totalCount}건
                                  </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <div style={{ fontSize: '11px', color: '#666' }}>판매 금액</div>
                                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#28a745' }}>
                                    {stats.totalSales.toLocaleString()}원
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </div>

      {/* 이용권 이력 */}
      <div className="content-box">
        <h2 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: '600' }}>이용권 이력</h2>
        {passLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <h3>이용권 이력이 없습니다</h3>
            <p>선택한 기간에 이용권 이력이 없습니다.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr>
                  <th style={{ padding: '16px 12px', textAlign: 'center', fontWeight: '700', color: '#fff', backgroundColor: '#667eea' }}>일시</th>
                  <th style={{ padding: '16px 12px', textAlign: 'center', fontWeight: '700', color: '#fff', backgroundColor: '#667eea' }}>이용권ID</th>
                  <th style={{ padding: '16px 12px', textAlign: 'center', fontWeight: '700', color: '#fff', backgroundColor: '#667eea' }}>변경유형</th>
                  <th style={{ padding: '16px 12px', textAlign: 'center', fontWeight: '700', color: '#fff', backgroundColor: '#667eea' }}>변경횟수</th>
                  <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: '700', color: '#fff', backgroundColor: '#667eea' }}>사유</th>
                  <th style={{ padding: '16px 12px', textAlign: 'center', fontWeight: '700', color: '#fff', backgroundColor: '#667eea' }}>처리자</th>
                </tr>
              </thead>
              <tbody>
                {passLogs.map((log, index) => {
                  const typeInfo = getChangeTypeLabel(log.chgTypeCd)
                  return (
                    <tr 
                      key={log.passLogId}
                      style={{ 
                        borderBottom: '1px solid #f0f0f0',
                        backgroundColor: index % 2 === 0 ? '#fff' : '#fafafa'
                      }}
                    >
                      <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                        {log.regDt ? format(new Date(log.regDt), 'yyyy-MM-dd HH:mm') : '-'}
                      </td>
                      <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                        {log.userPassId || '-'}
                      </td>
                      <td style={{ padding: '16px 12px', textAlign: 'center' }}>
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
                      <td style={{ padding: '16px 12px', textAlign: 'center', fontWeight: '600' }}>
                        {log.chgCnt > 0 ? '+' : ''}{log.chgCnt}회
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        {log.chgRsn || '-'}
                      </td>
                      <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                        {log.pocsUsrId || '-'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
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
      `}</style>
    </div>
  )
}

export default MembershipPayments

