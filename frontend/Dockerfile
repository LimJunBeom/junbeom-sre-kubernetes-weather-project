# 빌드 스테이지
FROM node:18-alpine AS builder

WORKDIR /app

# 패키지 파일 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci

# 소스 코드 복사
COPY . .

# 빌드 시 API 베이스 URL을 받아서 환경변수로 설정
ARG VITE_API_BASE
ENV VITE_API_BASE=$VITE_API_BASE

# 빌드 실행
RUN npm run build

# 프로덕션 스테이지
FROM nginx:alpine

# nginx 설정 복사 (기본 설정 사용)
COPY --from=builder /app/dist /usr/share/nginx/html

# 포트 노출
EXPOSE 80

# nginx 시작
CMD ["nginx", "-g", "daemon off;"]
