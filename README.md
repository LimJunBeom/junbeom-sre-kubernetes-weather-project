# Kubernetes Weather App

로컬 무료 환경에서 동작하는 Kubernetes Weather App입니다.

## 프로젝트 개요

프론트는 React로 도시 입력 후 날씨를 표시하고, 백엔드는 Node.js로 OpenWeather API를 호출합니다.
두 서비스는 Kubernetes에 각각 Deployment와 Service로 배포하며, NodePort로 브라우저에서 접근합니다.
Docker Hub는 사용하지 않고 Minikube의 로컬 도커 데몬에 이미지를 빌드해 바로 배포합니다.

## 기술 스택

- **프론트엔드**: React + Vite
- **백엔드**: Node.js + Express
- **인프라**: Docker, Kubernetes, Minikube
- **외부 API**: OpenWeather (Current Weather Data, API Key 필요)

## 요구사항

- 프론트에서 도시를 입력하면 백엔드의 `/api/weather?city=Seoul`로 요청을 보냅니다.
- 백엔드는 OpenWeather API를 호출해서 도시명, 섭씨 온도, 날씨 설명을 JSON으로 반환합니다.
- CORS 허용.
- Kubernetes에서 프론트와 백엔드를 각각 NodePort로 노출합니다.
  - 백엔드 NodePort 30080
  - 프론트 NodePort 30081
- OpenWeather API 키는 Kubernetes Secret으로 주입합니다.
- Minikube의 도커 데몬을 사용해 로컬에서 이미지 빌드 후 바로 배포합니다.

## 폴더 구조

```
junbeom-sre-kubernetes-weather-project/
├── README.md
├── .gitignore
├── backend/
│   ├── package.json
│   ├── server.js
│   └── Dockerfile
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── Dockerfile
└── k8s/
    ├── backend-deploy.yaml
    ├── backend-svc.yaml
    ├── frontend-deploy.yaml
    ├── frontend-svc.yaml
    └── secret-openweather.yaml.example
```

## 로컬 실행 가이드 (Minikube 기준)

### 1. Minikube 시작 후 도커 데몬 바인딩

```bash
minikube start
eval $(minikube docker-env)
```

### 2. 백엔드 이미지 빌드

```bash
docker build -t weather-backend:1.0 ./backend
```

### 3. 프론트엔드 이미지 빌드

빌드 타임에 API 주소를 주입합니다. NodePort 30080 백엔드로 맞춥니다.

```bash
MINIKUBE_IP=$(minikube ip)
docker build \
  --build-arg VITE_API_BASE="http://$MINIKUBE_IP:30080" \
  -t weather-frontend:1.0 ./frontend
```

### 4. 시크릿 생성

예시 파일을 실제 값으로 수정한 뒤 적용합니다.

```bash
# secret-openweather.yaml.example 파일에서 YOUR_OPENWEATHER_API_KEY를 실제 API 키로 변경
kubectl apply -f k8s/secret-openweather.yaml.example
```

### 5. 매니페스트 적용

```bash
kubectl apply -f k8s/backend-deploy.yaml
kubectl apply -f k8s/backend-svc.yaml
kubectl apply -f k8s/frontend-deploy.yaml
kubectl apply -f k8s/frontend-svc.yaml
```

### 6. 상태 확인

```bash
kubectl get pods -o wide
kubectl get svc
```

### 7. 접속

```bash
minikube ip
# 예: 192.168.49.2 라면 프론트는
# http://192.168.49.2:30081
```

## 동작 확인

### 헬스체크

```bash
curl http://$(minikube ip):30080/api/health
# {"ok":true}
```

### 날씨 조회

```bash
curl "http://$(minikube ip):30080/api/weather?city=Toronto"
```

## 트러블슈팅 팁

### ImagePullBackOff
Minikube 도커 데몬에 빌드 안 됐을 가능성
```bash
eval $(minikube docker-env) 후 다시 docker build
```

### 프론트에서 네트워크 에러
빌드시 넣은 VITE_API_BASE와 현재 NodePort 또는 IP가 불일치
프론트 이미지를 새로 빌드

### 401 또는 403
OpenWeather API 키 문제
시크릿 값 확인 후 백엔드 배포 롤아웃 재시작
```bash
kubectl rollout restart deploy/weather-backend
```

## 확장 아이디어

- Ingress 컨트롤러로 도메인 라우팅
- HPA로 백엔드 오토스케일 테스트
- 프론트의 API 베이스를 Nginx 환경변수로 런타임 주입