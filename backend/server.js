import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 8080;

// CORS 설정
app.use(cors());
app.use(express.json());

// OpenWeather API 키 확인
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
if (!OPENWEATHER_API_KEY) {
    console.error('OPENWEATHER_API_KEY environment variable is required');
    process.exit(1);
}

// 헬스체크 엔드포인트
app.get('/api/health', (req, res) => {
    res.json({ ok: true });
});

// 날씨 조회 엔드포인트
app.get('/api/weather', async (req, res) => {
    try {
        const { city } = req.query;

        // 도시명이 없으면 에러 반환
        if (!city) {
            return res.status(400).json({
                error: 'City parameter is required'
            });
        }

        // OpenWeather API 호출
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API_KEY}&units=metric`;

        const response = await fetch(url);

        if (!response.ok) {
            // OpenWeather API 에러 처리
            if (response.status === 404) {
                return res.status(404).json({
                    error: 'City not found'
                });
            }
            return res.status(response.status).json({
                error: 'Weather service error'
            });
        }

        const data = await response.json();

        // 응답 데이터 구성
        const weatherData = {
            city: data.name,
            tempC: Math.round(data.main.temp * 10) / 10, // 소수점 첫째자리까지
            conditions: data.weather[0].description
        };

        res.json(weatherData);

    } catch (error) {
        console.error('Weather API error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`Weather backend server running on port ${PORT}`);
});
