// Shared fetch wrapper for the Express API and small demo-mode storage helpers.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export async function api(path, { token, ...options } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.message || 'Something went wrong.')
  return payload
}

export function readLocal(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}

export function writeLocal(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}