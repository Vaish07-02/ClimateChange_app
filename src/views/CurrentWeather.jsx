import { useState, useEffect } from 'react'
import { getCurrentWeatherByCity, getForecastByCity } from '../api/weatherApi.js'
import SearchBar from '../components/SearchBar.jsx'
import WeatherIcon from '../components/WeatherIcon.jsx'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import styles from './CurrentWeather.module.css'

function useLiveTime() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

function formatTime(d) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function formatDate(d) {
  return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
}

function formatShortDay(ts) {
  return new Date(ts * 1000).toLocaleDateString([], { weekday: 'short' })
}

function formatHour(ts) {
  return new Date(ts * 1000).toLocaleTimeString([], { hour: 'numeric' })
}

function getBackgroundClass(main) {
  if (!main) return 'theme-default'
  const m = (main || '').toLowerCase()
  if (m.includes('thunder')) return 'theme-storm'
  if (m.includes('rain') || m.includes('drizzle')) return 'theme-rain'
  if (m.includes('snow')) return 'theme-snow'
  if (m.includes('cloud')) return 'theme-clouds'
  return 'theme-clear'
}

export default function CurrentWeather({ onSelectLocation, saveToHistory }) {
  const now = useLiveTime()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [current, setCurrent] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [cityName, setCityName] = useState('')

  const themeClass = getBackgroundClass(current?.weather?.[0]?.main)

  useEffect(() => {
    // Apply theme to body
    document.body.className = themeClass
    return () => {
      document.body.className = 'theme-default'
    }
  }, [themeClass])

  async function handleSearch(q) {
    setError(null)
    setCurrent(null)
    setForecast(null)
    setLoading(true)
    try {
      const [weather, fc] = await Promise.all([
        getCurrentWeatherByCity(q),
        getForecastByCity(q),
      ])
      setCurrent(weather)
      setForecast(fc)
      const label = weather?.sys?.country ? `${weather.name}, ${weather.sys.country}` : weather.name
      setCityName(label)
      const coords = { lat: weather.coord?.lat, lon: weather.coord?.lon, name: label }
      onSelectLocation?.(coords)
      saveToHistory?.({
        ...coords,
        temp: weather.main?.temp,
        description: weather.weather?.[0]?.description,
        dt: weather.dt,
      })
    } catch (e) {
      setError(e.message || 'Failed to fetch weather')
    } finally {
      setLoading(false)
    }
  }

  const w = current?.weather?.[0]
  const main = current?.main
  const wind = current?.wind
  const sys = current?.sys
  const list = forecast?.list ?? []

  const chartData24h = list.slice(0, 8).map((item) => ({
    time: formatHour(item.dt),
    temp: Math.round(item.main?.temp ?? 0),
    full: item,
  }))

  const dailyGroups = []
  for (let i = 0; i < list.length; i += 8) {
    const dayList = list.slice(i, i + 8)
    if (dayList.length === 0) break
    const first = dayList[0]
    const temps = dayList.map((x) => x.main?.temp).filter((t) => t != null)
    const min = temps.length ? Math.min(...temps) : null
    const max = temps.length ? Math.max(...temps) : null
    dailyGroups.push({
      dt: first.dt,
      day: formatShortDay(first.dt),
      min: min != null ? Math.round(min) : null,
      max: max != null ? Math.round(max) : null,
      icon: first.weather?.[0]?.icon,
      desc: first.weather?.[0]?.description,
    })
  }

  const sunriseTime = sys?.sunrise
    ? new Date(sys.sunrise * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : '—'
  const sunsetTime = sys?.sunset
    ? new Date(sys.sunset * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : '—'

  return (
    <div className={styles.page}>
      <SearchBar onSearch={handleSearch} loading={loading} placeholder="Search city..." />

      {error && <p className={styles.error}>{error}</p>}

      {current && (
        <>
          <header className={styles.topBar}>
            <span className={styles.locationLabel}>
              <span className={styles.pinIcon} aria-hidden>📍</span>
              {cityName || current.name}
            </span>
            <span className={styles.settingsIcon} aria-hidden>⚙️</span>
          </header>

          <div className={styles.hero}>
            <div className={styles.tempCircle}>
              <WeatherIcon icon={w?.icon} description={w?.description} size="lg" />
              <span className={styles.tempBig}>{Math.round(main?.temp ?? 0)}°</span>
              <span className={styles.feelsLike}>Feels like {Math.round(main?.feels_like ?? 0)}°</span>
            </div>
            <div className={styles.minMaxRow}>
              <span>Min {main?.temp_min != null ? Math.round(main.temp_min) : '—'}°</span>
              <span>Max {main?.temp_max != null ? Math.round(main.temp_max) : '—'}°</span>
            </div>
            <p className={styles.condition}>{w?.description}</p>
            <p className={styles.wind}>
              {wind?.speed ?? '—'} m/s {wind?.deg != null ? `(${wind.deg}°)` : ''}
            </p>
          </div>

          <div className={styles.clockCard}>
            <div className={styles.clock}>{formatTime(now)}</div>
            <div className={styles.date}>{formatDate(now)}</div>
          </div>

          <section className={styles.dashboard}>
            <h2 className={styles.dashboardTitle}>Dashboard</h2>
            <div className={styles.metricsGrid}>
              <div className={styles.metric}>
                <span className={styles.metricIcon}>💧</span>
                <span className={styles.metricLabel}>Precipitation</span>
                <span className={styles.metricValue}>—</span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricIcon}>💨</span>
                <span className={styles.metricLabel}>Wind</span>
                <span className={styles.metricValue}>{wind?.speed ?? '—'} m/s</span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricIcon}>📊</span>
                <span className={styles.metricLabel}>Pressure</span>
                <span className={styles.metricValue}>{main?.pressure ?? '—'} hPa</span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricIcon}>👁</span>
                <span className={styles.metricLabel}>Visibility</span>
                <span className={styles.metricValue}>
                  {current.visibility != null ? (current.visibility / 1000).toFixed(1) : '—'} km
                </span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricIcon}>🌡</span>
                <span className={styles.metricLabel}>Humidity</span>
                <span className={styles.metricValue}>{main?.humidity ?? '—'}%</span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricIcon}>🌅</span>
                <span className={styles.metricLabel}>Sunrise</span>
                <span className={styles.metricValue}>{sunriseTime}</span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricIcon}>🌇</span>
                <span className={styles.metricLabel}>Sunset</span>
                <span className={styles.metricValue}>{sunsetTime}</span>
              </div>
            </div>
          </section>

          {chartData24h.length > 0 && (
            <section className={styles.graphSection}>
              <h2 className={styles.graphTitle}>Temperature (next 24h)</h2>
              <div className={styles.graphWrap}>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={chartData24h} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                    <defs>
                      <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="rgba(255,255,255,0.8)" fontSize={11} tickLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.8)" fontSize={11} tickLine={false} width={28} />
                    <Tooltip
                      contentStyle={{ background: 'rgba(20,30,50,0.9)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8 }}
                      labelStyle={{ color: '#fff' }}
                      formatter={(value) => [`${value}°C`, 'Temp']}
                    />
                    <Area type="monotone" dataKey="temp" stroke="rgba(255,255,255,0.9)" strokeWidth={2} fill="url(#tempGrad)" />
                    <Line type="monotone" dataKey="temp" stroke="rgba(255,255,255,0.95)" strokeWidth={2} dot={{ fill: 'rgba(255,255,255,0.8)', r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          {dailyGroups.length > 0 && (
            <section className={styles.forecastStrip}>
              <h2 className={styles.stripTitle}>Daily forecast</h2>
              <div className={styles.dailyStrip}>
                {dailyGroups.slice(0, 5).map((day, i) => (
                  <div key={i} className={styles.dayCard}>
                    <span className={styles.dayName}>{day.day}</span>
                    {day.icon && <WeatherIcon icon={day.icon} size="sm" />}
                    <span className={styles.dayTemp}>{day.min != null && day.max != null ? `${day.min}° / ${day.max}°` : '—'}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {list.length > 0 && (
            <section className={styles.hourlyStrip}>
              <h2 className={styles.stripTitle}>Hourly</h2>
              <div className={styles.hourlyScroll}>
                {list.slice(0, 12).map((item, i) => (
                  <div key={i} className={styles.hourCard}>
                    <span className={styles.hourTime}>{formatHour(item.dt)}</span>
                    <WeatherIcon icon={item.weather?.[0]?.icon} size="sm" />
                    <span className={styles.hourTemp}>{Math.round(item.main?.temp ?? 0)}°</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {!current && !error && !loading && (
        <p className={styles.hint}>Search for a city to see current weather, clock, dashboard and forecast.</p>
      )}
    </div>
  )
}
