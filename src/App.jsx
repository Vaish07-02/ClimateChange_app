import { useCallback, useState } from 'react'
import styles from './App.module.css'
import CurrentWeather from './views/CurrentWeather.jsx'
import WeatherHistory from './views/WeatherHistory.jsx'
import AllFeatures from './views/AllFeatures.jsx'
import { addToHistory } from './utils/historyStorage.js'

const TABS = [
  { id: 'current', label: 'Current Weather' },
  { id: 'history', label: 'Weather History' },
  { id: 'all', label: 'All Features' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('current')
  const [selectedLocation, setSelectedLocation] = useState(null)

  const saveToHistory = useCallback((entry) => {
    if (entry?.lat != null && entry?.lon != null && entry?.name) addToHistory(entry)
  }, [])

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.logo}>ClimateShield App</h1>
        <nav className={styles.nav} aria-label="Main">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>
      <main className={styles.main}>
        {activeTab === 'current' && (
          <CurrentWeather onSelectLocation={setSelectedLocation} saveToHistory={saveToHistory} />
        )}
        {activeTab === 'history' && (
          <WeatherHistory
            selectedLocation={selectedLocation}
            onSelectLocation={setSelectedLocation}
            activeTab={activeTab}
          />
        )}
        {activeTab === 'all' && (
          <AllFeatures selectedLocation={selectedLocation} onSelectLocation={setSelectedLocation} />
        )}
      </main>
    </div>
  )
}

