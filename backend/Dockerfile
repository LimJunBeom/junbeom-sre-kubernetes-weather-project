FROM node:18-alpine

WORKDIR /app

# 패키지 파일 복사
COPY package*.json ./

# 프로덕션 의존성만 설치
RUN npm ci --omit=dev

# 소스 코드 복사
COPY . .

# 포트 노출
EXPOSE 8080

# 애플리케이션 시작
CMD ["npm", "start"]
