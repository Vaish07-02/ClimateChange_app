import { useEffect, useState } from 'react'
import { getCurrentWeatherByCity, getDaySummary } from '../api/weatherApi.js'
import { clearHistory, getHistory } from '../utils/historyStorage.js'
import styles from './WeatherHistory.module.css'

export default function WeatherHistory({ onSelectLocation, activeTab }) {
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [subscriptionRequired, setSubscriptionRequired] = useState(false)
  const [historyData, setHistoryData] = useState(null)
  const [historyDate, setHistoryDate] = useState('')
  const [historyCity, setHistoryCity] = useState('')

  useEffect(() => {
    if (activeTab === 'history') setRecent(getHistory())
  }, [activeTab])

  useEffect(() => {
    setRecent(getHistory())
  }, [])

  async function fetchHistoricalWeather() {
    if (!historyCity.trim() || !historyDate) {
      setError('Enter a city and select a date.')
      return
    }
    setError(null)
    setSubscriptionRequired(false)
    setHistoryData(null)
    setLoading(true)
    try {
      const current = await getCurrentWeatherByCity(historyCity.trim())
      const lat = current?.coord?.lat
      const lon = current?.coord?.lon
      if (lat == null || lon == null) throw new Error('Could not resolve coordinates for that city.')

      const data = await getDaySummary(lat, lon, historyDate)
      setHistoryData(data)
      setSubscriptionRequired(false)
    } catch (e) {
      const msg = e.message || 'Failed to load historical weather'
      if (msg.toLowerCase().includes('subscription') || msg.toLowerCase().includes('one call')) {
        setSubscriptionRequired(true)
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  function handleClearHistory() {
    clearHistory()
    setRecent([])
  }

  const hasRecent = recent.length > 0
  const temp = historyData?.temperature

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Weather History</h1>

      <section className={styles.section}>
        <div className={styles.sectionHeaderRow}>
          <h2 className={styles.sectionTitle}>Recent views</h2>
          <button type="button" className={styles.refreshBtn} onClick={() => setRecent(getHistory())}>
            ↻ Refresh
          </button>
        </div>

        {hasRecent ? (
          <>
            <ul className={styles.list}>
              {recent.map((entry, i) => (
                <li key={i} className={styles.listItem}>
                  <button
                    type="button"
                    className={styles.historyButton}
                    onClick={() => onSelectLocation?.({ lat: entry.lat, lon: entry.lon, name: entry.name })}
                  >
                    <span className={styles.historyName}>{entry.name}</span>
                    {entry.temp != null && <span className={styles.historyTemp}>{Math.round(entry.temp)}°C</span>}
                    {entry.description && <span className={styles.historyDesc}>{entry.description}</span>}
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" className={styles.clearBtn} onClick={handleClearHistory}>
              Clear history
            </button>
          </>
        ) : (
          <p className={styles.muted}>Search for weather in Current Weather to build your history.</p>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Historical weather by date</h2>
        <p className={styles.muted}>
          Requires OpenWeatherMap One Call API 3.0 subscription. Data from 1979 until 1.5 years ahead.
        </p>

        <div className={styles.formRow}>
          <input
            type="text"
            className={styles.input}
            value={historyCity}
            onChange={(e) => setHistoryCity(e.target.value)}
            placeholder="City name"
            disabled={loading}
          />
          <input
            type="date"
            className={styles.input}
            value={historyDate}
            onChange={(e) => setHistoryDate(e.target.value)}
            disabled={loading}
          />
          <button type="button" className={styles.button} onClick={fetchHistoricalWeather} disabled={loading}>
            {loading ? 'Loading…' : 'Get history'}
          </button>
        </div>

        {error && <p className={styles.error}>{error}</p>}
        {subscriptionRequired && (
          <div className={styles.subscriptionMessage}>
            Historical weather by date requires an OpenWeatherMap One Call API 3.0 subscription.
          </div>
        )}

        {historyData && (
          <div className={styles.historyCard}>
            <h3>{historyData.date}</h3>
            {temp && (
              <div className={styles.tempGrid}>
                <span>Min: {temp.min != null ? Math.round(temp.min) : '—'}°C</span>
                <span>Max: {temp.max != null ? Math.round(temp.max) : '—'}°C</span>
                <span>Morning: {temp.morning != null ? Math.round(temp.morning) : '—'}°C</span>
                <span>Afternoon: {temp.afternoon != null ? Math.round(temp.afternoon) : '—'}°C</span>
                <span>Evening: {temp.evening != null ? Math.round(temp.evening) : '—'}°C</span>
                <span>Night: {temp.night != null ? Math.round(temp.night) : '—'}°C</span>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}

