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

  // Primero chequear permisos devueltos por backend (más prioritario)
  if (Array.isArray(user.rolePermissions) && user.rolePermissions.includes(permission)) {
    console.debug(`[PERM] Usuario ${user.username} tiene permiso '${permission}' vía rolePermissions`)
    return true
  }

  // Fallback a roles locales para modo demo
  const roles = getRolesSync()
  const userRoleIds = user.roles || []
  
  for (const rId of userRoleIds) {
    const r = roles.find(x => String(x.id) === String(rId))
    if (r && Array.isArray(r.permissions) && r.permissions.includes(permission)) {
      console.debug(`[PERM] Usuario ${user.username} tiene permiso '${permission}' vía roles locales`)
      return true
    }
  }

  console.debug(`[PERM] Usuario ${user.username} NO tiene permiso '${permission}'`)
  return false
}

export function userHasRole(roleName) {
  const user = getCurrentUser()
  if (!user) return false
  
  // Chequear roleName devuelto por backend (más directo)
  if (user.roleName === roleName) {
    console.debug(`[ROLE] Usuario ${user.username} tiene rol '${roleName}' (backend)`)
    return true
  }

  // Fallback a roles locales
  const roles = getRolesSync()
  const userRoleIds = user.roles || []
  const hasRole = roles.some(r => userRoleIds.includes(r.id) && r.name === roleName)
  
  if (hasRole) {
    console.debug(`[ROLE] Usuario ${user.username} tiene rol '${roleName}' (local)`)
  }
  return hasRole
}
