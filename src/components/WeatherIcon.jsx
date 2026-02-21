import { getWeatherIconUrl } from '../api/weatherApi.js'
import styles from './WeatherIcon.module.css'

export default function WeatherIcon({ icon, description, size = 'md' }) {
  const code = icon || '01d'
  const alt = description || 'Weather'
  return <img src={getWeatherIconUrl(code)} alt={alt} className={`${styles.icon} ${styles[size]}`} />
}

