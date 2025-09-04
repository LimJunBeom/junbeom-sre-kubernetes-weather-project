import { useState } from 'react'

function App() {
    const [city, setCity] = useState('')
    const [weather, setWeather] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // API 베이스 URL 설정 (환경변수 또는 기본값)
    const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:30082'

    const fetchWeather = async () => {
        if (!city.trim()) {
            setError('Please enter a city name')
            return
        }

        setLoading(true)
        setError('')
        setWeather(null)

        try {
            const response = await fetch(`${API_BASE}/api/weather?city=${encodeURIComponent(city.trim())}`)

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to fetch weather data')
            }

            const data = await response.json()
            setWeather(data)
        } catch (err) {
            setError(err.message || 'An error occurred while fetching weather data')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        fetchWeather()
    }

    return (
        <div className="container">
            <div className="weather-app">
                <h1 className="title">Weather App</h1>

                <form onSubmit={handleSubmit} className="search-form">
                    <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Enter city name..."
                        className="search-input"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        className="search-button"
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : 'Get Weather'}
                    </button>
                </form>

                {error && (
                    <div className="error">
                        {error}
                    </div>
                )}

                {loading && (
                    <div className="loading">
                        Fetching weather data...
                    </div>
                )}

                {weather && (
                    <div className="weather-card">
                        <h2 className="city-name">{weather.city}</h2>
                        <div className="temperature">{weather.tempC}°C</div>
                        <div className="conditions">{weather.conditions}</div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default App
