FROM node:20-alpine AS build

WORKDIR /app

# 패키지 정보 복사 후 설치
COPY package*.json ./
RUN npm ci

# 소스 복사 후 빌드
COPY . .
RUN npm run build

# --- Nginx 이미지로 정적 파일 서빙 ---
FROM nginx:alpine

# 커스텀 nginx 설정 적용
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 빌드 결과물을 Nginx 기본 경로에 복사
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
