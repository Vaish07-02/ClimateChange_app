const STORAGE_KEY = 'weather_app_history'
const MAX_ITEMS = 20

export function getHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const list = JSON.parse(raw)
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

export function addToHistory(entry) {
  const list = getHistory()
  const normalized = {
    lat: entry.lat,
    lon: entry.lon,
    name: entry.name,
    temp: entry.temp,
    description: entry.description,
    dt: entry.dt,
    date: entry.date,
  }
  const filtered = list.filter(
    (e) =>
      !(
        e.lat === normalized.lat &&
        e.lon === normalized.lon &&
        e.dt === normalized.dt &&
        e.date === normalized.date
      ),
  )
  filtered.unshift(normalized)
  const trimmed = filtered.slice(0, MAX_ITEMS)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  return trimmed
}

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY)
}

