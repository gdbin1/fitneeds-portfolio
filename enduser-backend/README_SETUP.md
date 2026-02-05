# 프로젝트 설정 가이드

## 스웨거 주소 http://localhost:8020/swagger-ui/index.html

## 1. 설정 파일 준비

### application.properties 생성
```bash
# application.properties.example 파일을 복사하여 실제 설정 파일 생성
cp src/main/resources/application.properties.example src/main/resources/application.properties
```

### 민감 정보 입력
`application.properties` 파일을 열어 아래 값들을 실제 값으로 변경하세요:

```properties
# 데이터베이스 계정 정보
spring.datasource.username=실제_DB_사용자명
spring.datasource.password=실제_DB_비밀번호

# JWT 시크릿 키 (랜덤한 긴 문자열)
jwt.secret=실제_JWT_시크릿_키

# API 서비스 키
onbid.api.service-key=실제_API_키
```

## 2. 보안 주의사항

⚠️ **절대 Git에 올리지 말아야 할 파일:**
- `application.properties` (실제 설정 파일)
- `application-dev.properties`
- `application-prod.properties`
- `wallet/` 폴더 (Oracle Wallet 파일)

✅ **Git에 올려도 되는 파일:**
- `application.properties.example` (예시 파일)

## 3. JWT 시크릿 키 생성 방법

온라인 생성기 사용:
- https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx
- 256bit 이상 권장

## 4. 환경 변수 사용 (권장)

더 안전한 방법은 환경 변수를 사용하는 것입니다:

```properties
spring.datasource.password=${DB_PASSWORD}
jwt.secret=${JWT_SECRET}
onbid.api.service-key=${ONBID_API_KEY}
```

IDE 실행 설정에서 환경 변수 추가:
```
DB_PASSWORD=실제비밀번호
JWT_SECRET=실제시크릿키
ONBID_API_KEY=실제API키
```
