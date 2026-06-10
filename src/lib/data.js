const USERS_KEY = 'demo_users_v1'
const ROLES_KEY = 'demo_roles_v1'

const defaultRoles = [
  { id: 1, name: 'Administrador', description: 'Acceso total', permissions: ['products.read','products.write','movements.read','movements.write','users.manage','reports.export'] },
  { id: 2, name: 'Operador', description: 'Gestión de inventario', permissions: ['products.read','products.write','movements.read','movements.write'] },
  { id: 3, name: 'Analista', description: 'Solo lectura y reportes', permissions: ['products.read','movements.read','reports.export'] },
]

function useApi() {
  return !!import.meta.env.VITE_API_URL
}

export async function getUsers() {
  if (useApi()) {
    // future: fetch from API
    const res = await fetch(import.meta.env.VITE_API_URL + '/users')
    return res.json()
  }
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
}

export async function saveUsers(users) {
  if (useApi()) {
    // future: sync to API
    return fetch(import.meta.env.VITE_API_URL + '/users', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(users) })
  }
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export async function addUser(user) {
  const users = await getUsers()
  users.push(user)
  await saveUsers(users)
  return user
}

export async function updateUser(username, patch) {
  const users = await getUsers()
  const updated = users.map(u => u.username === username ? { ...u, ...patch } : u)
  await saveUsers(updated)
  return updated.find(u => u.username === username)
}

export async function getRoles() {
  if (useApi()) {
    const res = await fetch(import.meta.env.VITE_API_URL + '/roles')
    return res.json()
  }
  const stored = JSON.parse(localStorage.getItem(ROLES_KEY) || 'null')
  if (!stored) {
    localStorage.setItem(ROLES_KEY, JSON.stringify(defaultRoles))
    return defaultRoles
  }
  return stored
}

export async function saveRoles(roles) {
  if (useApi()) {
    return fetch(import.meta.env.VITE_API_URL + '/roles', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(roles) })
  }
  localStorage.setItem(ROLES_KEY, JSON.stringify(roles))
}

export async function addRole(role) {
  const roles = await getRoles()
  const nextId = roles.length ? Math.max(...roles.map(r => r.id)) + 1 : 1
  const newRole = { id: nextId, ...role }
  roles.push(newRole)
  await saveRoles(roles)
  return newRole
}

export default { getUsers, saveUsers, addUser, updateUser, getRoles, saveRoles, addRole }
