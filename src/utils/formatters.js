// src/utils/formatters.js

/**
 * Format a date (e.g., 2025-01-11) to "January 11, 2025"
 * @param {string|Date|null} date
 * @returns {string}
 */
export function formatDate(date) {
  if (!date) return '—'
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Compute age from a given date of birth
 * @param {string|Date|null} dob
 * @returns {number|string}
 */
export function calculateAge(dob) {
  if (!dob) return '—'
  const birthDate = new Date(dob)
  const today = new Date()

  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  const dayDiff = today.getDate() - birthDate.getDate()

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--
  }

  return age
}

/**
 * Format time difference to "1mo ago", "1h 27m ago", "36s ago", etc.
 * @param {string|Date|null} date
 * @returns {string}
 */
export function timeAgo(date) {
  if (!date) return '—'
  const now = new Date()
  const past = new Date(date)
  const seconds = Math.floor((now - past) / 1000)

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  }

  if (seconds < 60) {
    return `${seconds}s ago`
  } else if (seconds < 3600) {
    const mins = Math.floor(seconds / 60)
    return `${mins}m ago`
  } else if (seconds < 86400) {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    return mins > 0 ? `${hrs}h ${mins}m ago` : `${hrs}h ago`
  } else if (seconds < 2592000) {
    const days = Math.floor(seconds / 86400)
    return `${days}d ago`
  } else if (seconds < 31536000) {
    const months = Math.floor(seconds / 2592000)
    return `${months}mo ago`
  } else {
    const years = Math.floor(seconds / 31536000)
    return `${years}y ago`
  }
}
