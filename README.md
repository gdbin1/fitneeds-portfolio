# fitneeds
Fitneeds project

/srv/fitneeds

  ├─ docker-compose.yml
  
  ├─ enduser-frontend/        # 사용자용 React (vite) + Nginx
  
  ├─ enduser-backend/         # 사용자용 Spring Boot
  
  ├─ admin-frontend/       # 관리자용 React (vite) + Nginx
  
  ├─ admin-backend/        # 관리자용 Spring Boot
  
----------------------------------------------
FitNeeds 🏋️
피트니스 센터 통합 관리 플랫폼

FitNeeds는 피트니스 센터의 체계적인 운영 관리를 위한 플랫폼으로, 관리자용 대시보드와 사용자용 애플리케이션을 제공합니다.

📋 프로젝트 개요
주요 구성
관리자 서비스: 피트니스 센터 운영진을 위한 관리 대시보드 (포트: 8021)
사용자 서비스: 일반 사용자가 이용하는 메인 플랫폼 (포트: 8020)
기본 기능
회원 관리 및 인증
스케줄 관리 및 수업 예약
이용권 거래 시스템
통계 및 분석 대시보드
👤 담당 기능: 커뮤니티 / FAQ / 공지사항
본인이 구현한 세 가지 핵심 기능에 대한 상세 설명입니다.

1️⃣ 커뮤니티 (Community)
🔹 사용자 입장 (enduser-frontend)
커뮤니티 목록 페이지 (CommunityUser.jsx)

📌 카테고리 필터링: 전체, 모집, 정보공유, 후기, 자유 카테고리로 실시간 필터링
🔍 검색 기능: 제목/내용 키워드 검색
📄 페이징: 페이지 번호별 게시글 목록 조회
👤 사용자별 게시글 조회: "내가 쓴 글", "내가 참여한 모집" 페이지 제공
게시글 작성/수정 (CommunityUserWrite.jsx)

✍️ 카테고리별 폼: 자유, 모집, 정보공유, 후기별 다양한 입력 필드
🎯 모집 전용 필드:
운동 종목 선택
모집 인원 설정
모집 종료일 선택 (오늘~30일 이내)
🔄 수정 모드: 쿼리 파라미터 ?edit={postId}로 수정 모드 활성화
✔️ 유효성 검증: 필수 필드 체크, 모집 게시글 종료일 필수 선택
게시글 상세 페이지 (CommunityUserDetail.jsx)

📖 게시글 조회: 제목, 내용, 작성자, 작성일, 조회수 표시
💬 댓글 시스템:
댓글 작성/수정/삭제 (작성자만 가능)
댓글 페이징 (10개 단위)
댓글 실시간 반영
🤝 모집 참여 기능 (모집 카테고리만):
모집 신청 / 취소 버튼
이미 참여한 경우 취소 버튼으로 변경
작성자는 참여 불가 검증
참여자 목록 조회
모집 인원 표시 (예: 2/4)
🔹 관리자 입장 (admin-frontend)
커뮤니티 관리 페이지 (AdminCommunityPage.jsx)

🔐 권한 체크: TEACHER 역할은 접근 불가 (권한 없음 메시지 표시)
🔍 고급 필터링:
카테고리별 필터 (모집, 자유, 후기, 정보공유, 개인정보동의)
노출 상태 필터 (전체, 보이기, 숨긴 글)
정렬 옵션 (최신순, 조회수순, 댓글수순)
키워드 검색
📊 게시글 목록 테이블:
ID, 카테고리, 제목, 작성자, 조회수, 노출 상태 표시
🔧 관리 기능:
노출/숨김: 사용자에게 보일지 말지 토글
삭제: 게시글 삭제 (댓글/참여자가 있으면 먼저 삭제해야 함)
커뮤니티 상세 관리 페이지 (AdminCommunityDetail.jsx)

📄 게시글 상세 조회: 전체 정보 표시
💬 댓글 관리:
댓글 목록 (10개 단위 페이징)
댓글별 노출/숨김 토글
댓글 삭제 기능
👥 모집 참여자 관리 (모집 카테고리만):
참여자 목록 조회
참여자 삭제 기능
참여 인원 및 상태 확인
2️⃣ FAQ (자주 묻는 질문)
🔹 사용자 입장 (enduser-frontend)
FAQ 조회 페이지 (FAQ.jsx)

📚 FAQ 목록: 관리자가 작성한 FAQ 목록 조회
📂 아코디언 UI: 질문 클릭 시 답변 확장/축소
📄 페이징: 10개 단위로 페이지 분할
🔢 번호 표시: 전체 리스트 기준 역순 번호 (최신순)
🏷️ 카테고리 표시: 이용안내, 결제/환불, 시설이용, 기타
레이아웃

CommunitySidebar와 함께 표시
반응형 디자인으로 모바일/데스크톱 모두 지원
🔹 관리자 입장 (admin-frontend)
FAQ 관리 페이지 (AdminFaqPage.jsx)

🔐 권한 체크: TEACHER, MANAGER 역할은 접근 불가
➕ FAQ 작성 폼:
카테고리 선택 (이용안내, 결제/환불, 시설이용, 기타)
질문 입력
답변 입력
기본값 자동 설정 (노출됨, isVisible: true)
📋 FAQ 목록 테이블:
ID, 카테고리, 질문, 노출 상태 표시
🔧 관리 기능:
✏️ 수정: 기존 FAQ 수정 (폼에 데이터 자동 로드)
🗑️ 삭제: FAQ 삭제
👁️ 노출/숨김: 사용자에게 보일지 말지 토글
📄 페이징: 페이지별 목록 관리
3️⃣ 공지사항 (Notice)
🔹 사용자 입장 (enduser-frontend)
공지사항 조회 페이지 (NoticeUserPage.jsx)

📰 공지사항 목록: 센터에서 작성한 모든 공지사항 표시
📌 상단 고정: 중요한 공지사항은 상단에 "📌" 아이콘으로 표시
🔍 검색 기능: 제목으로 키워드 검색
📄 페이징: 10개 단위로 페이지 분할
📅 표시 기간 관리:
"상시" 표시: 항상 보이는 공지
"2026.01.30" 표시: 특정 날짜까지만 표시
🔗 상세 조회: 공지 클릭 시 팝업으로 전문 표시
레이아웃

CommunitySidebar와 함께 표시
반응형 모달 팝업으로 상세 조회
🔹 관리자 입장 (admin-frontend)
공지사항 관리 페이지 (AdminNoticePage.jsx)

🔐 역할별 권한 처리:

TEACHER: 접근 불가 (권한 없음 메시지 표시)
ADMIN: 모든 공지사항 관리 가능
MANAGER: 본인 지점 공지만 관리 가능 (지점별 분리)
➕ 공지사항 작성 폼:

제목 입력
내용 입력 (HTML 에디터)
표시 기간 설정:
🔘 "상시 표시" 옵션: 항상 보이기
🔘 "기간 지정" 옵션: 특정 종료일까지만 표시
MANAGER인 경우: 자동으로 본인 지점으로 설정
ADMIN인 경우: 전사 공지 (지점 null) 또는 특정 지점 지정 가능
📋 공지사항 목록:

제목, 작성 날짜, 표시 기간, 노출 상태 표시
📌 상단 고정된 공지는 맨 위에 표시
🔧 관리 기능:

✏️ 수정: 기존 공지 수정
MANAGER가 작성한 공지 중 본인 지점 아닌 공지는 수정 불가 (경고 메시지)
기존 지점 정보 유지 (지점 변경 불가)
🗑️ 삭제: 공지사항 삭제
👁️ 노출/숨김: 사용자에게 보일지 말지 토글
📌 상단 고정/해제: 공지사항 상단 핵심 표시 토글
🔍 검색 및 필터:

제목 검색
⚡ 권한별 표시 처리:

ADMIN: 모든 공지 조회 및 관리
MANAGER: 본인 지점 공지 + 전사 공지만 보임 (UI에서도 필터링)
정렬: 📌 핵심 공지 우선, 그 다음 최신순
🏗️ 프로젝트 구조
fitneeds/
├── admin-backend/          # 관리자용 백엔드 (Spring Boot)
├── admin-frontend/         # 관리자용 프론트엔드 (React + Vite)
│   └── src/pages/
│       ├── Community/      # 커뮤니티 관리 페이지
│       ├── FAQ/           # FAQ 관리 페이지
│       └── Notice/        # 공지사항 관리 페이지
├── enduser-backend/        # 사용자용 백엔드 (Spring Boot)
├── enduser-frontend/       # 사용자용 프론트엔드 (React + Vite)
│   └── src/pages/
│       ├── Community/      # 커뮤니티 사용자 페이지
│       ├── FAQ/           # FAQ 조회 페이지
│       └── Notice/        # 공지사항 조회 페이지
├── docker-compose.yml      # Docker 오케스트레이션
└── mariadb.cnf            # MariaDB 설정
📦 주요 기능 모듈
1. 커뮤니티 (Community)
enduser-frontend/src/pages/Community/
게시판 및 댓글 시스템
사용자 프로필 및 팔로우 기능
실시간 피드 및 알림
커뮤니티 가이드라인 및 모더레이션
2. 이용권 관리 (Pass Management)
Pass Trade System - Spring Boot + JPA
이용권 판매글 등록 및 조회
거래 요청 및 완료 처리
결제 시스템 통합
관련 API:

POST /api/pass-trades/posts - 판매글 등록
GET /api/pass-trades/posts - 판매글 목록 조회
POST /api/pass-trades/{postId}/request - 거래 요청
POST /api/pass-trades/{postId}/complete - 거래 완료
3. 스케줄 및 예약 (Schedule & Reservation)
수업 스케줄 관리
예약 시스템
출석 관리
4. 통계 및 대시보드
회원 통계
수업 분석
매출 현황
5. 회원 관리 (Member Management)
회원 가입 및 인증
프로필 관리
권한 관리
🛠️ 기술 스택
백엔드
Framework: Spring Boot 3.x
ORM: JPA/Hibernate
Database: MariaDB
Build: Gradle
Containerization: Docker
프론트엔드
Framework: React 18+
Build Tool: Vite
Styling: CSS3
HTTP Client: Axios
State Management: 상태관리 솔루션
DevOps
Container Orchestration: Docker Compose
Database: MariaDB 11.x
Cloud Database: AWS RDS (선택 가능)
🚀 시작하기
필수 요구사항
Docker & Docker Compose
Java 17+
Node.js 18+
MariaDB 11+ (로컬 개발 시)
프로젝트 실행
Docker Compose를 사용한 실행
docker-compose up -d
접근 URL:

사용자 프론트엔드: http://localhost:8020
관리자 프론트엔드: http://localhost:8021
로컬 개발 환경
백엔드 (enduser-backend)

cd enduser-backend
./gradlew bootRun
프론트엔드 (enduser-frontend)

cd enduser-frontend
npm install
npm run dev
� 기술 스택
백엔드
Framework: Spring Boot 3.x
ORM: JPA/Hibernate
Database: MariaDB 11.x
Build: Gradle
프론트엔드
Framework: React 18+
Build Tool: Vite
Styling: CSS3
HTTP Client: Axios
DevOps
Containerization: Docker & Docker Compose
Database: MariaDB (로컬/AWS RDS 선택)
🚀 실행 방법
Docker Compose 실행
docker-compose up -d
접근 URL:

사용자 플랫폼: http://localhost:8020
관리자 대시보드: http://localhost:8021
🔐 권한 시스템 (Role-Based Access Control)
역할 정의
ADMIN: 전사 관리자 - 모든 기능 접근 가능
MANAGER: 지점 매니저 - 본인 지점 관련 기능만 접근 가능
TEACHER: 강사 - 일부 기능만 접근 가능
USER: 일반 사용자 - 사용자 기능만 접근
권한별 접근 제한 (담당 기능 기준)
기능	ADMIN	MANAGER	TEACHER	USER
커뮤니티 조회	✅	❌	❌	✅
커뮤니티 관리	✅	✅	❌	❌
FAQ 조회	✅	✅	✅	✅
FAQ 관리	✅	❌	❌	❌
공지사항 조회	✅	✅	✅	✅
공지사항 관리	✅	✅ (본인 지점)	❌	❌
📝 주요 API 엔드포인트 (담당 기능)
사용자 API (enduser)
커뮤니티
GET    /user/community              # 목록 조회 (페이징)
GET    /user/community/{postId}     # 상세 조회
POST   /user/community              # 게시글 작성
PUT    /user/community/{postId}     # 게시글 수정
DELETE /user/community/{postId}     # 게시글 삭제
POST   /user/community/{postId}/comments       # 댓글 작성
PUT    /user/community/{postId}/comments/{commentId}  # 댓글 수정
DELETE /user/community/{postId}/comments/{commentId}  # 댓글 삭제

모집 관련
POST   /user/community/{postId}/join            # 모집 신청
DELETE /user/community/{postId}/join            # 모집 취소
GET    /user/community/{postId}/join/check      # 참여 여부 확인
GET    /user/community/{postId}/join/users      # 참여자 목록

FAQ
GET    /user/faq                    # FAQ 목록 조회

공지사항
GET    /user/notice                 # 공지사항 목록 조회
GET    /user/notice/{postId}        # 공지사항 상세 조회
관리자 API (admin)
커뮤니티
GET    /admin/community             # 목록 조회 (필터링/페이징)
GET    /admin/community/{id}        # 상세 조회
PUT    /admin/community/{id}/visible          # 노출/숨김 토글
DELETE /admin/community/{id}                 # 삭제
GET    /admin/community/comments/{id}        # 댓글 목록
PUT    /admin/community/comments/{commentId}/visible  # 댓글 노출/숨김
DELETE /admin/community/comments/{commentId}         # 댓글 삭제
GET    /admin/community/{id}/recruit-users   # 모집 참여자 조회
DELETE /admin/community/recruit-users/{joinId}      # 참여자 삭제

FAQ
GET    /admin/faq                   # FAQ 목록 조회
POST   /admin/faq                   # FAQ 등록
PUT    /admin/faq/{id}              # FAQ 수정
DELETE /admin/faq/{id}              # FAQ 삭제
PUT    /admin/faq/{id}/visible      # 노출/숨김 토글

공지사항
GET    /admin/notice                # 공지사항 목록 조회
POST   /admin/notice                # 공지사항 등록
PUT    /admin/notice/{id}           # 공지사항 수정
DELETE /admin/notice/{id}           # 공지사항 삭제
PUT    /admin/notice/{id}/visible   # 노출/숨김 토글
PUT    /admin/notice/{id}/pin       # 상단 고정 토글
💡 구현 특징
1. 권한 기반 접근 제어 (RBAC)
localStorage.getItem("role")로 사용자 역할 확인
권한이 없는 경우 "권한이 없습니다" 메시지 표시 및 페이지 접근 차단
2. 지점별 관리 (Branch-based Management)
MANAGER는 본인 지점 공지만 관리 가능
ADMIN은 전사 공지 및 모든 지점 공지 관리 가능
UI에서 권한별 필터링으로 불필요한 데이터 숨김
3. 상태 관리
React useState 훅으로 로컬 상태 관리
필터링, 페이징, 검색 등의 상태 분리 관리
4. 비동기 처리
useEffect로 초기 데이터 로드
Axios api 모듈로 HTTP 요청 통일
에러 처리 및 로딩 상태 관리
5. 사용자 경험 개선
실시간 검색/필터링 (Community)
아코디언 UI (FAQ, Notice)
모달 팝업 (Notice 상세 조회)
확인 다이얼로그로 실수 방지
📚 참고 문서
관리자 가이드

사용자 백엔드 설정

📝 프로젝트 정보 이 프로젝트는 연세IT미래교육원 수강생들의 팀 프로젝트입니다.

개발 기간 2024년 11월 20일 ~ 2025년 1월 29일 팀원 및 역할 팀장 youngnam81-kim - 프로젝트 관리, 로그인/회원가입, 관리자 회원/관리자 관리 (풀스택) onwardjake - 배포/관리, 프로젝트 관리, 관리자 스포츠 기능 (풀스택) 팀원 huch99 - 유저 예약 관련 (풀스택) Elona52 - 유저 메인페이지/레이아웃 구조, 나의 운동 페이지(리뷰, 예약 등) (풀스택) gdbin1 - 유저/관리자 커뮤니티 관련 (풀스택) crist-17 - 유저 이용권 거래 (풀스택) kimmh74 - 관리자 지점 관리 (풀스택) parkote9212 - DB 설계, 관리자 예약/이용권/이용권상품/이용권거래 관리, 관리자 페이지 레이아웃 (풀스택) dnjsgur32-lang - 관리자 강사 관련 기능 (풀스택) 📊 주요 성과 회원 관리 시스템 구현 실시간 예약 시스템 구축 이용권 및 이용권 거래 시스템 구현 커뮤니티 기능 구현 관리자 대시보드 및 관리 기능 구축 Docker 기반 배포 환경 구축 AWS 클라우드 배포 완료 📞 문의 프로젝트에 대한 문의사항은 이슈를 생성해주세요.
