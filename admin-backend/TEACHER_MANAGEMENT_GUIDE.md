# 🎯 강사 관리 기능 개발 가이드

## 📌 개발 목표
**Admin Backend에서 강사(Teacher) 관리 기능 구현**
- sportTypes 패키지 구조를 참고하여 일관된 코드 스타일 유지
- JPA + Spring Data JPA 기반 구현

---

## 🛠️ 기술 스택

### Backend Framework
- **Spring Boot**: 3.5.7
- **Java**: 21 (OpenJDK)
- **Build Tool**: Gradle

### Database
- **DBMS**: MariaDB (Local: localhost:3306, AWS RDS 지원)
- **Database Name**: fitneedsdb
- **Character Set**: UTF-8 (utf8mb4_unicode_ci)
- **Connection Pool**: HikariCP
  - Max Pool Size: 10
  - Min Idle: 5
  - Connection Timeout: 30s


#### application.properties 설정 (이미 적용됨)
```properties
spring.datasource.driver-class-name=org.mariadb.jdbc.Driver
spring.datasource.url=jdbc:mariadb://localhost:3306/fitneedsdb?useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Seoul
spring.datasource.username=root
spring.datasource.password=1234
spring.jpa.hibernate.ddl-auto=update
```

### ORM & Persistence
- **JPA/Hibernate**: Spring Data JPA
  - Dialect: MariaDBDialect
  - DDL Auto: update
  - Show SQL: true
- **MyBatis**: 3.0.5 (일부 복잡한 쿼리용)
  - Mapper Location: classpath:/mapper/**/*.xml
  - Camel Case 자동 변환: true

### Security & Authentication
- **Spring Security**: JWT 기반 인증
- **JWT Library**: JJWT 0.11.5
- **Password Encoding**: BCryptPasswordEncoder (권장)

### Utilities
- **Lombok**: 코드 간소화 (Getter, Builder, NoArgsConstructor 등)
- **P6Spy**: SQL 로깅 및 디버깅 (1.9.0)
- **Spring AOP**: 로깅 및 트랜잭션 관리
- **Swagger/OpenAPI**: API 문서화 (springdoc-openapi 2.5.0)

### Development Tools
- **Spring DevTools**: 자동 재시작
- **Logging**: SLF4J + Logback
  - SQL Binding 로그: trace level
  - MyBatis 로그: DEBUG level

---

## 🗂️ DB 테이블 구조

### 핵심 테이블 (5개)

#### 1. USERS_ADMIN (기본 정보)
```sql
CREATE TABLE USERS_ADMIN (
    user_id      VARCHAR(50)  NOT NULL COMMENT '사용자 고유 ID',
    user_name    VARCHAR(100) NOT NULL COMMENT '사용자 이름',
    email        VARCHAR(255) NOT NULL UNIQUE COMMENT '사용자 이메일',
    password     VARCHAR(255) NOT NULL COMMENT '암호화된 비밀번호',
    phone_number VARCHAR(20)  NULL     COMMENT '전화번호',
    role         VARCHAR(50)  NOT NULL DEFAULT 'USER' COMMENT '권한(ADMIN, MANAGER, TEACHER)',
    brch_id      BIGINT       NULL     COMMENT '지점ID',
    is_active    TINYINT(1)   NOT NULL DEFAULT 1 COMMENT '활성화 여부',
    agree_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '개인정보 동의 시각',
    PRIMARY KEY (user_id)
);
```

#### 2. TEACHER_PROFILE (강사 프로필)
```sql
CREATE TABLE TEACHER_PROFILE (
    user_id         VARCHAR(50)  NOT NULL COMMENT '강사ID',
    brch_id         BIGINT       NOT NULL COMMENT '지점ID',
    stts_cd         VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE' COMMENT '상태코드(ACTIVE/RETIRED)',
    hire_dt         DATE         NOT NULL COMMENT '입사일',
    leave_dt        DATE         NULL     COMMENT '퇴사일',
    leave_rsn       VARCHAR(255) NULL     COMMENT '퇴사사유',
    intro           VARCHAR(255) NULL     COMMENT '소개',
    profile_img_url VARCHAR(500) NULL     COMMENT '이미지URL',
    reg_dt          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록일시',
    upd_dt          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '수정일시',
    upd_user_id     VARCHAR(50)  NULL     COMMENT '수정자ID',
    PRIMARY KEY (user_id)
);
```

#### 3. TEACHER_SPORT (담당 종목)
```sql
CREATE TABLE TEACHER_SPORT (
    user_id  VARCHAR(50) NOT NULL COMMENT '강사ID',
    sport_id BIGINT      NOT NULL COMMENT '운동종목ID',
    main_yn  TINYINT(1)  NOT NULL DEFAULT 0 COMMENT '대표종목여부',
    sort_no  INT         NOT NULL DEFAULT 1 COMMENT '표시순서',
    reg_dt   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록일시',
    upd_dt   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '수정일시',
    PRIMARY KEY (user_id, sport_id)
);
```

#### 4. TEACHER_CERTIFICATE (자격증)
```sql
CREATE TABLE TEACHER_CERTIFICATE (
    cert_id     BIGINT AUTO_INCREMENT NOT NULL COMMENT '자격증ID',
    user_id     VARCHAR(50)  NOT NULL COMMENT '강사ID',
    cert_nm     VARCHAR(255) NOT NULL COMMENT '자격증명',
    issuer      VARCHAR(255) NULL     COMMENT '발급기관',
    acq_dt      DATE         NULL     COMMENT '취득일',
    cert_no     VARCHAR(100) NULL     COMMENT '자격증번호',
    reg_dt      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록일시',
    upd_dt      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '수정일시',
    upd_user_id VARCHAR(50)  NULL     COMMENT '수정자ID',
    PRIMARY KEY (cert_id)
);
```

#### 5. TEACHER_CAREER (경력)
```sql
CREATE TABLE TEACHER_CAREER (
    career_id   BIGINT AUTO_INCREMENT NOT NULL COMMENT '경력ID',
    user_id     VARCHAR(50)  NOT NULL COMMENT '강사ID',
    org_nm      VARCHAR(255) NOT NULL COMMENT '기관명',
    role_nm     VARCHAR(255) NULL     COMMENT '역할',
    strt_dt     DATE         NOT NULL COMMENT '시작일',
    end_dt      DATE         NULL     COMMENT '종료일',
    reg_dt      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록일시',
    upd_dt      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '수정일시',
    upd_user_id VARCHAR(50)  NULL     COMMENT '수정자ID',
    PRIMARY KEY (career_id)
);
```

---

## 📦 패키지 구조 (sportTypes 참고)

```
com.project.app.teacher/
├── controller/
│   └── TeacherController.java          # REST API 엔드포인트
├── service/
│   └── TeacherService.java             # 비즈니스 로직
├── repository/
│   ├── TeacherProfileRepository.java   # JpaRepository 상속
│   ├── TeacherSportRepository.java
│   ├── TeacherCertificateRepository.java
│   └── TeacherCareerRepository.java
├── entity/
│   ├── TeacherProfile.java             # @Entity, @Table
│   ├── TeacherSport.java
│   ├── TeacherCertificate.java
│   └── TeacherCareer.java
└── dto/
    └── TeacherDto.java                 # record 기반 DTO (CreateReq, UpdateReq, Resp)
```

### sportTypes 패키지와의 일관성
- **Entity**: `@Entity`, `@Table`, Lombok `@Getter`, `@Builder`, `@PrePersist`, `@PreUpdate` 사용
- **DTO**: Java record 기반 (CreateReq, UpdateReq, Resp)
- **Service**: `@Service`, `@RequiredArgsConstructor`, `@Transactional` 사용
- **Controller**: `@RestController`, `@RequestMapping`, `@Valid` 검증
- **Repository**: `JpaRepository<Entity, ID>` 상속

---

## 🎯 구현 기능 명세

### 1. 강사 목록 조회
```
GET /api/teachers
- 전체 강사 목록 조회 (ACTIVE 상태만)
- 필터링: branchId, sportId, status
- 페이징 지원 (선택)
```

### 2. 강사 상세 조회
```
GET /api/teachers/{userId}
- 기본 정보 (TEACHER_PROFILE)
- 담당 종목 목록 (TEACHER_SPORT)
- 자격증 목록 (TEACHER_CERTIFICATE)
- 경력 목록 (TEACHER_CAREER)
```

### 3. 강사 등록
```
POST /api/teachers/new
- USERS_ADMIN (role='TEACHER') 생성
- TEACHER_PROFILE 생성
- TEACHER_SPORT 등록 (다중)
- TEACHER_CERTIFICATE 등록 (다중, 선택)
- TEACHER_CAREER 등록 (다중, 선택)
- @Transactional 필수
```

### 4. 강사 정보 수정
```
PUT /api/teachers/{userId}
- 프로필 수정
- 담당 종목 수정
- 자격증/경력 추가/삭제
```

### 5. 강사 퇴직 처리
```
PATCH /api/teachers/{userId}/retire
- stts_cd = 'RETIRED'
- leave_dt, leave_rsn 설정
- is_active = 0
- 물리적 삭제 없음 (데이터 보관)
```

---

## 💻 코드 구현 예시 (sportTypes 스타일)

### Entity 예시
```java
@Entity
@Table(name = "TEACHER_PROFILE")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class TeacherProfile {
    
    @Id
    @Column(name = "user_id")
    private String userId;
    
    @Column(name = "brch_id", nullable = false)
    private Long branchId;
    
    @Column(name = "stts_cd", nullable = false, length = 20)
    private String statusCode;
    
    @Column(name = "hire_dt", nullable = false)
    private LocalDate hireDate;
    
    @Column(name = "leave_dt")
    private LocalDate leaveDate;
    
    @Column(name = "leave_rsn", length = 255)
    private String leaveReason;
    
    @Column(name = "intro", length = 255)
    private String intro;
    
    @Column(name = "profile_img_url", length = 500)
    private String profileImgUrl;
    
    @Column(name = "reg_dt", nullable = false)
    private LocalDateTime regDt;
    
    @Column(name = "upd_dt", nullable = false)
    private LocalDateTime updDt;
    
    @Column(name = "upd_user_id", length = 50)
    private String updUserId;
    
    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.regDt = now;
        this.updDt = now;
        if (this.statusCode == null) {
            this.statusCode = "ACTIVE";
        }
    }
    
    @PreUpdate
    void onUpdate() {
        this.updDt = LocalDateTime.now();
    }
    
    public void update(String intro, String profileImgUrl) {
        this.intro = intro;
        this.profileImgUrl = profileImgUrl;
    }
    
    public void retire(LocalDate leaveDate, String leaveReason, String updUserId) {
        this.statusCode = "RETIRED";
        this.leaveDate = leaveDate;
        this.leaveReason = leaveReason;
        this.updUserId = updUserId;
    }
}
```

### DTO 예시 (record 기반)
```java
public class TeacherDto {
    
    public record CreateReq(
        @NotBlank @Size(max = 50) String userId,
        @NotBlank @Size(max = 100) String userName,
        @NotBlank @Email String email,
        @NotBlank String password,
        @Size(max = 20) String phoneNumber,
        @NotNull Long branchId,
        @NotNull LocalDate hireDate,
        @Size(max = 255) String intro,
        List<SportReq> sports,
        List<CertificateReq> certificates,
        List<CareerReq> careers
    ) {}
    
    public record UpdateReq(
        @Size(max = 255) String intro,
        @Size(max = 500) String profileImgUrl,
        List<SportReq> sports
    ) {}
    
    public record RetireReq(
        @NotNull LocalDate leaveDate,
        @NotBlank @Size(max = 255) String leaveReason,
        @NotBlank String updaterId
    ) {}
    
    public record Resp(
        String userId,
        String userName,
        String email,
        Long branchId,
        String statusCode,
        LocalDate hireDate,
        LocalDate leaveDate,
        String intro,
        String profileImgUrl,
        List<SportResp> sports,
        List<CertificateResp> certificates,
        List<CareerResp> careers,
        LocalDateTime regDt,
        LocalDateTime updDt
    ) {}
    
    public record SportReq(
        @NotNull Long sportId,
        Boolean mainYn,
        Integer sortNo
    ) {}
    
    public record CertificateReq(
        @NotBlank String certName,
        String issuer,
        LocalDate acquireDate,
        String certNo
    ) {}
    
    public record CareerReq(
        @NotBlank String orgName,
        String roleName,
        @NotNull LocalDate startDate,
        LocalDate endDate
    ) {}
    
    // Response용 내부 record들
    public record SportResp(Long sportId, String sportName, Boolean mainYn, Integer sortNo) {}
    public record CertificateResp(Long certId, String certName, String issuer, LocalDate acquireDate) {}
    public record CareerResp(Long careerId, String orgName, String roleName, LocalDate startDate, LocalDate endDate) {}
}
```

### Repository 예시
```java
public interface TeacherProfileRepository extends JpaRepository<TeacherProfile, String> {
    List<TeacherProfile> findByBranchIdAndStatusCode(Long branchId, String statusCode);
    List<TeacherProfile> findByStatusCode(String statusCode);
}

public interface TeacherSportRepository extends JpaRepository<TeacherSport, TeacherSportId> {
    List<TeacherSport> findByUserId(String userId);
    void deleteByUserId(String userId);
}
```

### Service 예시
```java
@Service
@RequiredArgsConstructor
public class TeacherService {
    
    private final TeacherProfileRepository profileRepo;
    private final TeacherSportRepository sportRepo;
    private final TeacherCertificateRepository certRepo;
    private final TeacherCareerRepository careerRepo;
    private final UserAdminRepository userAdminRepo;
    
    @Transactional(readOnly = true)
    public List<TeacherDto.Resp> list() {
        List<TeacherProfile> profiles = profileRepo.findByStatusCode("ACTIVE");
        return profiles.stream()
            .map(this::toResp)
            .toList();
    }
    
    @Transactional(readOnly = true)
    public TeacherDto.Resp getDetail(String userId) {
        TeacherProfile profile = profileRepo.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("Teacher not found: " + userId));
        return toResp(profile);
    }
    
    @Transactional
    public TeacherDto.Resp create(TeacherDto.CreateReq req) {
        // 1. USERS_ADMIN 생성
        UserAdmin userAdmin = UserAdmin.builder()
            .userId(req.userId())
            .userName(req.userName())
            .email(req.email())
            .password(req.password()) // 실제로는 암호화 필요
            .phoneNumber(req.phoneNumber())
            .role("TEACHER")
            .branchId(req.branchId())
            .isActive(true)
            .build();
        userAdminRepo.save(userAdmin);
        
        // 2. TEACHER_PROFILE 생성
        TeacherProfile profile = TeacherProfile.builder()
            .userId(req.userId())
            .branchId(req.branchId())
            .hireDate(req.hireDate())
            .intro(req.intro())
            .build();
        profileRepo.save(profile);
        
        // 3. TEACHER_SPORT 생성
        if (req.sports() != null) {
            req.sports().forEach(sport -> {
                TeacherSport ts = TeacherSport.builder()
                    .userId(req.userId())
                    .sportId(sport.sportId())
                    .mainYn(sport.mainYn() != null ? sport.mainYn() : false)
                    .sortNo(sport.sortNo() != null ? sport.sortNo() : 1)
                    .build();
                sportRepo.save(ts);
            });
        }
        
        // 4. TEACHER_CERTIFICATE 생성 (선택)
        if (req.certificates() != null) {
            req.certificates().forEach(cert -> {
                TeacherCertificate tc = TeacherCertificate.builder()
                    .userId(req.userId())
                    .certName(cert.certName())
                    .issuer(cert.issuer())
                    .acquireDate(cert.acquireDate())
                    .certNo(cert.certNo())
                    .build();
                certRepo.save(tc);
            });
        }
        
        // 5. TEACHER_CAREER 생성 (선택)
        if (req.careers() != null) {
            req.careers().forEach(career -> {
                TeacherCareer tc = TeacherCareer.builder()
                    .userId(req.userId())
                    .orgName(career.orgName())
                    .roleName(career.roleName())
                    .startDate(career.startDate())
                    .endDate(career.endDate())
                    .build();
                careerRepo.save(tc);
            });
        }
        
        return toResp(profile);
    }
    
    @Transactional
    public TeacherDto.Resp update(String userId, TeacherDto.UpdateReq req) {
        TeacherProfile profile = profileRepo.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("Teacher not found: " + userId));
        
        profile.update(req.intro(), req.profileImgUrl());
        
        // 담당 종목 업데이트 (기존 삭제 후 재등록)
        if (req.sports() != null) {
            sportRepo.deleteByUserId(userId);
            req.sports().forEach(sport -> {
                TeacherSport ts = TeacherSport.builder()
                    .userId(userId)
                    .sportId(sport.sportId())
                    .mainYn(sport.mainYn() != null ? sport.mainYn() : false)
                    .sortNo(sport.sortNo() != null ? sport.sortNo() : 1)
                    .build();
                sportRepo.save(ts);
            });
        }
        
        return toResp(profile);
    }
    
    @Transactional
    public void retire(String userId, TeacherDto.RetireReq req) {
        TeacherProfile profile = profileRepo.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("Teacher not found: " + userId));
        
        // 정산 확인 로직 추가 필요
        // 스케줄 확인 로직 추가 필요
        
        profile.retire(req.leaveDate(), req.leaveReason(), req.updaterId());
        
        // USERS_ADMIN is_active = 0
        UserAdmin userAdmin = userAdminRepo.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("UserAdmin not found: " + userId));
        userAdmin.deactivate();
    }
    
    private TeacherDto.Resp toResp(TeacherProfile profile) {
        // 담당 종목 조회
        List<TeacherSport> sports = sportRepo.findByUserId(profile.getUserId());
        List<TeacherDto.SportResp> sportResps = sports.stream()
            .map(s -> new TeacherDto.SportResp(s.getSportId(), null, s.getMainYn(), s.getSortNo()))
            .toList();
        
        // 자격증 조회
        List<TeacherCertificate> certs = certRepo.findByUserId(profile.getUserId());
        List<TeacherDto.CertificateResp> certResps = certs.stream()
            .map(c -> new TeacherDto.CertificateResp(c.getCertId(), c.getCertName(), c.getIssuer(), c.getAcquireDate()))
            .toList();
        
        // 경력 조회
        List<TeacherCareer> careers = careerRepo.findByUserId(profile.getUserId());
        List<TeacherDto.CareerResp> careerResps = careers.stream()
            .map(c -> new TeacherDto.CareerResp(c.getCareerId(), c.getOrgName(), c.getRoleName(), c.getStartDate(), c.getEndDate()))
            .toList();
        
        return new TeacherDto.Resp(
            profile.getUserId(),
            null, // userName은 UserAdmin에서 조회 필요
            null, // email은 UserAdmin에서 조회 필요
            profile.getBranchId(),
            profile.getStatusCode(),
            profile.getHireDate(),
            profile.getLeaveDate(),
            profile.getIntro(),
            profile.getProfileImgUrl(),
            sportResps,
            certResps,
            careerResps,
            profile.getRegDt(),
            profile.getUpdDt()
        );
    }
}
```

### Controller 예시
```java
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/teachers")
public class TeacherController {
    
    private final TeacherService teacherService;
    
    @GetMapping
    public ResponseEntity<List<TeacherDto.Resp>> list() {
        try {
            List<TeacherDto.Resp> result = teacherService.list();
            log.info("Successfully retrieved {} teachers", result.size());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error retrieving teachers", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/{userId}")
    public ResponseEntity<TeacherDto.Resp> getDetail(@PathVariable String userId) {
        try {
            TeacherDto.Resp result = teacherService.getDetail(userId);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error retrieving teacher detail", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping("/new")
    public ResponseEntity<TeacherDto.Resp> create(@RequestBody @Valid TeacherDto.CreateReq req) {
        try {
            TeacherDto.Resp result = teacherService.create(req);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (Exception e) {
            log.error("Error creating teacher", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PutMapping("/{userId}")
    public ResponseEntity<TeacherDto.Resp> update(
        @PathVariable String userId,
        @RequestBody @Valid TeacherDto.UpdateReq req
    ) {
        try {
            TeacherDto.Resp result = teacherService.update(userId, req);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error updating teacher", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PatchMapping("/{userId}/retire")
    public ResponseEntity<Void> retire(
        @PathVariable String userId,
        @RequestBody @Valid TeacherDto.RetireReq req
    ) {
        try {
            teacherService.retire(userId, req);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error retiring teacher", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
```

---

## ⚠️ 주의사항

### 1. 트랜잭션 관리
- 강사 등록 시 여러 테이블 동시 INSERT → `@Transactional` 필수
- 실패 시 전체 롤백 처리

### 2. 외래키 제약
- USERS_ADMIN의 role='TEACHER'인 경우만 프로필 생성
- branchId 존재 여부 확인 필수

### 3. 데이터 보관 정책
- 물리적 삭제(DELETE) 금지
- 상태 변경(stts_cd = 'RETIRED')으로 처리
- 퇴직 강사 데이터는 정산/이력 관리 목적으로 영구 보관

### 4. 퇴직 처리 전 확인사항
- 미정산 내역 확인 (TEACHER_SETTLEMENT)
- 미래 스케줄 확인 (SCHEDULE)
- 진행 예정 스케줄이 있으면 퇴직 불가 또는 재배정

### 5. 권한 관리
- ADMIN 관리
- MANAGER: 자기 지점 강사만 관리
- TEACHER: 본인 정보만 조회/수정

---

## 🚀 개발 순서

1. **Entity 작성** (TeacherProfile, TeacherSport, TeacherCertificate, TeacherCareer)
2. **Repository 작성** (JpaRepository 상속)
3. **DTO 작성** (record 기반)
4. **Service 작성** (비즈니스 로직)
5. **Controller 작성** (REST API)
6. **테스트 작성** (단위/통합)

---

## 📚 참고 자료

- **sportTypes 패키지**: 코드 스타일 및 구조 참고
- **create_table.sql**: 전체 DB 스키마
- **enduser-backend/PassTradeService**: 트랜잭션 처리 패턴
- **userAdmin 패키지**: UserAdmin Entity 참고

---

## 📝 추가 구현 고려사항

### 복합키 Entity (TeacherSport)
```java
@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeacherSportId implements Serializable {
    private String userId;
    private Long sportId;
}

@Entity
@Table(name = "TEACHER_SPORT")
@IdClass(TeacherSportId.class)
public class TeacherSport {
    @Id
    @Column(name = "user_id")
    private String userId;
    
    @Id
    @Column(name = "sport_id")
    private Long sportId;
    
    // ... 나머지 필드
}
```

### 페이징 처리
```java
@Transactional(readOnly = true)
public Page<TeacherDto.Resp> list(Pageable pageable) {
    Page<TeacherProfile> profiles = profileRepo.findByStatusCode("ACTIVE", pageable);
    return profiles.map(this::toResp);
}
```

### 필터링 쿼리
```java
public interface TeacherProfileRepository extends JpaRepository<TeacherProfile, String> {
    @Query("SELECT tp FROM TeacherProfile tp " +
           "WHERE (:branchId IS NULL OR tp.branchId = :branchId) " +
           "AND (:statusCode IS NULL OR tp.statusCode = :statusCode)")
    List<TeacherProfile> findByFilters(
        @Param("branchId") Long branchId,
        @Param("statusCode") String statusCode
    );
}
```
