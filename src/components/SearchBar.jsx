import { useState } from 'react'
import styles from './SearchBar.module.css'

export default function SearchBar({ onSearch, loading, placeholder = 'Search city...' }) {
  const [query, setQuery] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const q = query.trim()
    if (q) onSearch(q)
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        type="text"
        className={styles.input}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        disabled={loading}
        aria-label="City name"
      />
      <button type="submit" className={styles.button} disabled={loading}>
        {loading ? '…' : 'Search'}
      </button>
    </form>
  )
}

