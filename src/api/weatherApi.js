const BASE = 'https://api.openweathermap.org'

function getApiKey() {
  const key = import.meta.env.VITE_OPENWEATHER_API_KEY
  if (!key || key === 'your-api-key-here') {
    throw new Error('Missing or invalid API key. Add VITE_OPENWEATHER_API_KEY to .env')
  }
  return key
}

function buildParams(params) {
  const key = getApiKey()
  const search = new URLSearchParams({ ...params, appid: key, units: 'metric', lang: 'en' })
  return search.toString()
}

export async function getCurrentWeatherByCity(cityName) {
  const q = buildParams({ q: cityName })
  const res = await fetch(`${BASE}/data/2.5/weather?${q}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.message || `Current weather failed: ${res.status}`)
  }
  return res.json()
}

export async function getForecastByCity(cityName) {
  const q = buildParams({ q: cityName })
  const res = await fetch(`${BASE}/data/2.5/forecast?${q}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.message || `Forecast failed: ${res.status}`)
  }
  return res.json()
}

export async function getForecast(lat, lon) {
  const q = buildParams({ lat, lon })
  const res = await fetch(`${BASE}/data/2.5/forecast?${q}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.message || `Forecast failed: ${res.status}`)
  }
  return res.json()
}

export async function getOneCall(lat, lon) {
  const key = getApiKey()
  const url = `${BASE}/data/3.0/onecall?lat=${lat}&lon=${lon}&units=metric&lang=en&appid=${key}`
  const res = await fetch(url)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.message || `One Call failed: ${res.status}`)
  }
  return res.json()
}

export async function getDaySummary(lat, lon, dateYYYYMMDD) {
  const key = getApiKey()
  const url = `${BASE}/data/3.0/onecall/day_summary?lat=${lat}&lon=${lon}&date=${dateYYYYMMDD}&units=metric&lang=en&appid=${key}`
  const res = await fetch(url)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.message || `Day summary failed: ${res.status}`)
  }
  return res.json()
}

export function getWeatherIconUrl(iconCode) {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`
}

