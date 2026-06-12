import data from './data'

// Synchronous helpers reading from localStorage for the demo
export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('auth_user') || 'null')
  } catch (err) {
    return null
  }
}

export function getRolesSync() {
  try {
    return JSON.parse(localStorage.getItem('demo_roles_v1') || localStorage.getItem('demo_roles') || 'null') || []
  } catch (err) {
    return []
  }
}

export function userHasPermission(permission) {
  const user = getCurrentUser()
  if (!user) return false
  const roles = getRolesSync()
  const userRoleIds = user.roles || []
  for (const rId of userRoleIds) {
    const r = roles.find(x => String(x.id) === String(rId))
    if (r && Array.isArray(r.permissions) && r.permissions.includes(permission)) return true
  }
  return false
}

export function userHasRole(roleName) {
  const user = getCurrentUser()
  if (!user) return false
  const roles = getRolesSync()
  const userRoleIds = user.roles || []
  return roles.some(r => userRoleIds.includes(r.id) && r.name === roleName)
}
