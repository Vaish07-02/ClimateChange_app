import { useEffect, useState } from 'react'
import { getForecast, getForecastByCity, getOneCall } from '../api/weatherApi.js'
import SearchBar from '../components/SearchBar.jsx'
import WeatherIcon from '../components/WeatherIcon.jsx'
import styles from './AllFeatures.module.css'

export default function AllFeatures({ selectedLocation, onSelectLocation }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [oneCall, setOneCall] = useState(null)
  const [locationName, setLocationName] = useState('')

  async function searchAndLoad(q) {
    if (!q?.trim()) return
    setError(null)
    setForecast(null)
    setOneCall(null)
    setLoading(true)
    try {
      const fc = await getForecastByCity(q.trim())
      setForecast(fc)

      const la = fc?.city?.coord?.lat
      const lo = fc?.city?.coord?.lon
      const label = fc?.city?.country ? `${fc.city.name}, ${fc.city.country}` : fc?.city?.name || q.trim()
      setLocationName(label)

      if (la != null && lo != null) {
        onSelectLocation?.({ lat: la, lon: lo, name: label })
        try {
          const oc = await getOneCall(la, lo)
          setOneCall(oc)
        } catch {
          setOneCall(null)
        }
      }
    } catch (e) {
      setError(e.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedLocation?.lat == null || selectedLocation?.lon == null) return
    setLocationName(selectedLocation.name || 'Location')
    loadForCoords(selectedLocation.lat, selectedLocation.lon, selectedLocation.name)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLocation?.lat, selectedLocation?.lon])

  async function loadForCoords(lat, lon, name) {
    setError(null)
    setLoading(true)
    try {
      setLocationName(name || 'Selected location')
      const [forecastRes, oneCallRes] = await Promise.allSettled([getForecast(lat, lon), getOneCall(lat, lon)])
      if (forecastRes.status === 'fulfilled') setForecast(forecastRes.value)
      else setError(forecastRes.reason?.message || 'Forecast failed')
      if (oneCallRes.status === 'fulfilled') setOneCall(oneCallRes.value)
      else setOneCall(null)
    } finally {
      setLoading(false)
    }
  }

  const hasData = forecast || oneCall
  const current = oneCall?.current
  const hourly = oneCall?.hourly ?? []
  const daily = oneCall?.daily ?? []
  const minutely = oneCall?.minutely ?? []
  const alerts = oneCall?.alerts ?? []
  const forecastList = forecast?.list ?? []

  function formatTime(ts) {
    return new Date(ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  function formatDay(ts) {
    return new Date(ts * 1000).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>All Features</h1>
      <p className={styles.subtitle}>Forecast, hourly, daily, minutely precipitation, and alerts from the API.</p>

      <SearchBar onSearch={searchAndLoad} loading={loading} placeholder="Search city to load all data..." />

      {error && <p className={styles.error}>{error}</p>}

      {hasData && locationName && <p className={styles.locationLabel}>Location: {locationName}</p>}

      {current && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Current Weather Summary</h2>
          <div className={styles.currentRow}>
            <WeatherIcon icon={current.weather?.[0]?.icon} description={current.weather?.[0]?.description} size="lg" />
            <div>
              <span className={styles.bigTemp}>{Math.round(current.temp)}°C</span>
              <p className={styles.desc}>{current.weather?.[0]?.description}</p>
              <p>
                Feels like {Math.round(current.feels_like)}°C
              </p>
            </div>
          </div>
        </section>
      )}

      {current && (
        <section className={styles.dashboardSection}>
          <h2 className={styles.dashboardTitle}>Weather Metrics Dashboard</h2>
          <div className={styles.metricsGrid}>
            <div className={styles.metric}>
              <span className={styles.metricIcon}>💨</span>
              <span className={styles.metricLabel}>Wind Speed</span>
              <span className={styles.metricValue}>{current.wind_speed} m/s</span>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricIcon}>📊</span>
              <span className={styles.metricLabel}>Pressure</span>
              <span className={styles.metricValue}>{current.pressure} hPa</span>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricIcon}>🌡</span>
              <span className={styles.metricLabel}>Humidity</span>
              <span className={styles.metricValue}>{current.humidity}%</span>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricIcon}>👁</span>
              <span className={styles.metricLabel}>Visibility</span>
              <span className={styles.metricValue}>{(current.visibility / 1000).toFixed(1)} km</span>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricIcon}>🌅</span>
              <span className={styles.metricLabel}>Sunrise</span>
              <span className={styles.metricValue}>{formatTime(current.sunrise)}</span>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricIcon}>🌇</span>
              <span className={styles.metricLabel}>Sunset</span>
              <span className={styles.metricValue}>{formatTime(current.sunset)}</span>
            </div>
          </div>
        </section>
      )}

      {minutely.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Minutely (next hour)</h2>
          <div className={styles.minutelyStrip}>
            {minutely.slice(0, 12).map((m, i) => (
              <div key={i} className={styles.minutelyItem}>
                <span className={styles.minutelyTime}>{formatTime(m.dt)}</span>
                <span className={styles.minutelyVal}>{(m.precipitation ?? 0).toFixed(1)} mm</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {hourly.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Hourly</h2>
          <div className={styles.hourlyGrid}>
            {hourly.slice(0, 24).map((h, i) => (
              <div key={i} className={styles.hourlyCard}>
                <span className={styles.hourlyTime}>{formatTime(h.dt)}</span>
                <WeatherIcon icon={h.weather?.[0]?.icon} description={h.weather?.[0]?.description} size="sm" />
                <span className={styles.hourlyTemp}>{Math.round(h.temp)}°</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {(daily.length > 0 || forecastList.length > 0) && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Daily forecast</h2>
          <div className={styles.dailyList}>
            {(daily.length ? daily : forecastList.filter((_, i) => i % 8 === 0).slice(0, 5)).map((d, i) => {
              const day = formatDay(d.dt)
              const temp = d.temp?.day ?? d.main?.temp
              const min = d.temp?.min ?? d.main?.temp_min
              const max = d.temp?.max ?? d.main?.temp_max
              const icon = d.weather?.[0]?.icon
              return (
                <div key={i} className={styles.dailyRow}>
                  <span className={styles.dailyDay}>{day}</span>
                  {icon && <WeatherIcon icon={icon} size="sm" />}
                  <span>{temp != null ? Math.round(temp) : '—'}°</span>
                  <span className={styles.dailyRange}>{min != null && max != null ? `${Math.round(min)}° / ${Math.round(max)}°` : ''}</span>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {forecastList.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>5-day forecast (3h steps)</h2>
          <div className={styles.forecastList}>
            {forecastList.slice(0, 16).map((item, i) => (
              <div key={i} className={styles.forecastItem}>
                <span>
                  {formatDay(item.dt)} {formatTime(item.dt)}
                </span>
                <WeatherIcon icon={item.weather?.[0]?.icon} size="sm" />
                <span>{Math.round(item.main?.temp)}°C</span>
                <span className={styles.forecastDesc}>{item.weather?.[0]?.description}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {alerts.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Alerts</h2>
          <ul className={styles.alertsList}>
            {alerts.map((a, i) => (
              <li key={i} className={styles.alertItem}>
                <strong>{a.event}</strong> — {a.sender_name}
                <p className={styles.alertDesc}>{a.description}</p>
                <span className={styles.alertTime}>
                  {new Date(a.start * 1000).toLocaleString()} – {new Date(a.end * 1000).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!hasData && !loading && !error && <p className={styles.hint}>Search for a city to load forecast and more.</p>}
    </div>
  )
}

