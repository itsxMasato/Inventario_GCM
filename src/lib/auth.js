// Simple auth utility prepared to be replaced by real API calls.
const DEMO_USERS_KEY = 'demo_users_v1'
const AUTH_USER_KEY = 'auth_user'
const AUTH_TOKEN_KEY = 'auth_token'
const API_URL = import.meta.env.VITE_API_URL

function useApi() {
  return !!API_URL
}

function seedDemoUsers() {
  if (localStorage.getItem(DEMO_USERS_KEY)) return
  const users = [
    { id: 1, username: 'admin', password: 'admin123', firstName: 'Admin', lastName: 'User', email: 'admin@example.com', roles: [1], status: 'active', forcePasswordReset: false, createdAt: new Date().toISOString() },
  ]
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users))
}

seedDemoUsers()

export async function login({ username, password }) {
  if (useApi()) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Credenciales inválidas')
    }

    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user))
    localStorage.setItem(AUTH_TOKEN_KEY, data.token)

    // Sincronizar roles desde API si está disponible
    try {
      const rolesResponse = await fetch(`${API_URL}/roles`)
      if (rolesResponse.ok) {
        const roles = await rolesResponse.json()
        localStorage.setItem('demo_roles_v1', JSON.stringify(roles))
      }
    } catch (err) {
      console.warn('No se pudieron sincronizar roles desde API:', err)
    }

    return { user: data.user, token: data.token }
  }

  // Simulate API delay
  await new Promise(r => setTimeout(r, 400))
  const users = JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || '[]')
  const user = users.find(u => u.username === username && u.password === password)
  if (!user) throw new Error('Credenciales inválidas')
  const token = btoa(`${user.username}:${Date.now()}`)
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
  localStorage.setItem(AUTH_TOKEN_KEY, token)
  return { user, token }
}

export function logout() {
  localStorage.removeItem(AUTH_USER_KEY)
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

export function getCurrentUser() {
  return JSON.parse(localStorage.getItem(AUTH_USER_KEY) || 'null')
}

export function getToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function isAuthenticated() {
  return !!getToken()
}

// Helper to allow future swap to real API endpoint
export async function apiFetch(path, opts = {}) {
  const token = getToken()
  const headers = opts.headers ? { ...opts.headers } : {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  const url = path.startsWith('http') ? path : API_URL ? `${API_URL}${path}` : path
  return fetch(url, { ...opts, headers })
}

export default { login, logout, getCurrentUser, getToken, isAuthenticated, apiFetch }
