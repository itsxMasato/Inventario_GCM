import React, { useState, useMemo, useEffect } from 'react'
import data from '../lib/data'
import auth from '../lib/auth'
import AuditLog from '../components/AuditLog'
import PasswordAuthModal from '../components/PasswordAuthModal'
import { addAuditLog, exportToCSV, printData } from '../lib/auditLog'
import { exportToPowerBI } from '../lib/powerbiExport'
import { userHasPermission } from '../lib/permissions'
import { useNotification } from '../contexts/NotificationContext'

const initialPermissions = [
  'Ver Productos',
  'Crear/Editar Productos',
  'Ver Movimientos',
  'Crear/Editar Movimientos',
  'Administrar Usuarios',
  'Ver Reportes',
]

export default function Usuarios() {
  const notification = useNotification()
  const [tab, setTab] = useState('user')
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)

  // Users (local demo state)
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    identityNumber: '',
    passwordConfirm: '',
    roleId: '',
    status: 'active',
  })

  // Roles & permissions (local demo state)
  const [roles, setRoles] = useState([])

  const [editingUserId, setEditingUserId] = useState(null)

  const [newRole, setNewRole] = useState({ name: '', description: '', permissions: [] })

  const canManageUsers = userHasPermission('Administrar Usuarios')

  useEffect(() => {
    async function load() {
      const u = await data.getUsers()
      if (u && u.length) setUsers(u)
      const r = await data.getRoles()
      if (r && r.length) setRoles(r)
    }
    load()
  }, [])

  async function handleCreateUser(e) {
    e.preventDefault()
    if (!form.firstName || !form.email || !form.identityNumber) {
      notification.warning('Datos incompletos', 'Complete nombre, correo y número de identidad para continuar.')
      return
    }
    if (!form.roleId) {
      notification.warning('Rol obligatorio', 'Seleccione un rol para el usuario antes de continuar.')
      return
    }
    if (form.identityNumber.length < 4) {
      notification.warning('Número demasiado corto', 'El número de identidad debe tener al menos 4 caracteres.')
      return
    }
    if (form.identityNumber !== form.passwordConfirm) {
      notification.warning('Confirmación no coincide', 'El número de identidad y la confirmación deben ser iguales.')
      return
    }

    // generate username from name + last name, ensure uniqueness
    const base = `${form.firstName.trim().toLowerCase().replace(/\s+/g, '')}.${form.lastName.trim().toLowerCase().replace(/\s+/g, '')}`
    const existing = await data.getUsers()
    let username = base || `user${Date.now()}`
    let suffix = 1
    while (existing.find(u => u.username === username)) {
      username = `${base}${suffix}`
      suffix++
    }

    const initialPassword = form.identityNumber
    const nextId = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1
    const newUser = {
      id: nextId,
      username,
      password: initialPassword,
      firstName: form.firstName,
      lastName: form.lastName,
      identityNumber: form.identityNumber,
      email: form.email,
      roles: form.roleId ? [Number(form.roleId)] : [],
      status: form.status || 'active',
      forcePasswordReset: true,
      createdAt: new Date().toISOString(),
    }

    // persist via data layer
    await data.addUser(newUser)
    // update local state
    setUsers(prev => [...prev, newUser])

    // Registrar en bitácora
    addAuditLog('create_user', `Usuario creado: ${username} (${form.firstName} ${form.lastName})`)

    setForm({ firstName: '', lastName: '', email: '', identityNumber: '', passwordConfirm: '', roleId: '', status: 'active' })
    const ref = `USR-${Date.now().toString().slice(-6)}`
    notification.success(
      '¡Usuario Creado Exitosamente!',
      `Usuario: ${username}\nContraseña inicial: ${form.identityNumber}`,
      ref
    )
  }

  async function openEditUser(user) {
    setTab('user')
    setEditingUserId(user.id)
    setForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      identityNumber: user.identityNumber || '',
      passwordConfirm: user.identityNumber || '',
      roleId: user.roles && user.roles.length ? String(user.roles[0]) : '',
      status: user.status || 'active',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSaveEdit(e) {
    e.preventDefault()
    if (!editingUserId) {
      notification.warning('Usuario no seleccionado', 'Seleccione un usuario antes de guardar los cambios.')
      return
    }
    if (!form.firstName || !form.email) {
      notification.warning('Datos requeridos', 'Complete el nombre y el correo antes de guardar.')
      return
    }
    const orig = users.find(u => u.id === editingUserId)
    if (!orig) {
      notification.error('Usuario no encontrado', 'No fue posible localizar el usuario a actualizar.')
      return
    }

    const patch = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      identityNumber: form.identityNumber,
      roles: form.roleId ? [Number(form.roleId)] : [],
      status: form.status || 'active',
      updatedAt: new Date().toISOString(),
    }

    // persist
    await data.updateUser(orig.username, patch)
    setUsers(prev => prev.map(u => (u.id === editingUserId ? { ...u, ...patch } : u)))
    addAuditLog('update_user', `Usuario actualizado: ${orig.username}`)
    setEditingUserId(null)
    setForm({ firstName: '', lastName: '', email: '', identityNumber: '', passwordConfirm: '', roleId: '', status: 'active' })
    const ref = `USR-${Date.now().toString().slice(-6)}`
    notification.success('Usuario actualizado', `${orig.firstName} ${orig.lastName} se actualizó correctamente.`, ref)
  }

  async function handleToggleUserStatus(u) {
    const action = u.status === 'active' ? 'deshabilitar' : 'habilitar'
    notification.confirm(
      `¿${action.charAt(0).toUpperCase() + action.slice(1)} usuario?`,
      `${action.charAt(0).toUpperCase() + action.slice(1)} a ${u.firstName} ${u.lastName} (${u.username})`,
      async () => {
        const newStatus = u.status === 'active' ? 'inactive' : 'active'
        await data.updateUser(u.username, { status: newStatus })
        setUsers(prev => prev.map(x => (x.id === u.id ? { ...x, status: newStatus } : x)))
        addAuditLog(newStatus === 'inactive' ? 'disable_user' : 'enable_user', `${newStatus === 'inactive' ? 'Deshabilitado' : 'Habilitado'} usuario: ${u.username}`)
        const ref = `USR-${Date.now().toString().slice(-6)}`
        notification.success(
          `Usuario ${newStatus === 'inactive' ? 'Deshabilitado' : 'Habilitado'}`,
          `${u.firstName} ${u.lastName} ahora está ${newStatus === 'inactive' ? 'deshabilitado' : 'habilitado'}`,
          ref
        )
      }
    )
  }

  // role selection (single-select) handled via form.roleId

  function handleCreateRole(e) {
    e.preventDefault()
    if (!newRole.name) {
      notification.warning('Nombre de rol requerido', 'Ingrese un nombre para el nuevo rol.')
      return
    }
    const nextId = roles.length ? Math.max(...roles.map(r => r.id)) + 1 : 1
    setRoles(prev => [...prev, { id: nextId, ...newRole }])
    
    // Registrar en bitácora
    addAuditLog('create_role', `Rol creado: ${newRole.name}`)
    
    setNewRole({ name: '', description: '', permissions: [] })
    notification.success('Rol creado', `El rol ${newRole.name} se agregó correctamente.`)
  }

  function toggleRolePermission(roleId, perm) {
    setRoles(prev => prev.map(r => {
      if (r.id !== roleId) return r
      const has = r.permissions.includes(perm)
      return { ...r, permissions: has ? r.permissions.filter(p => p !== perm) : [...r.permissions, perm] }
    }))
  }

  const handleExport = () => {
    setIsAuthModalOpen(true)
    setPendingAction('export')
  }

  const handlePowerBI = () => {
    setIsAuthModalOpen(true)
    setPendingAction('powerbi')
  }

  const handlePrint = () => {
    setIsAuthModalOpen(true)
    setPendingAction('print')
  }

  const executeExport = () => {
    const csvData = users.map(u => {
      const userRole = roles.find(r => String(r.id) === String(u.roleId || (u.roles && u.roles[0]) || ''))
      return {
        ID: u.id,
        Usuario: u.username,
        Nombre: `${u.firstName} ${u.lastName}`,
        Email: u.email,
        'Número de Identidad': u.identityNumber || '-',
        Rol: userRole?.name || 'Sin asignar',
        Estado: u.status === 'active' ? 'Activo' : u.status === 'inactive' ? 'Inactivo' : 'Suspendido',
        'Fecha Creación': new Date(u.createdAt).toLocaleDateString('es-ES'),
        'Hora Creación': new Date(u.createdAt).toLocaleTimeString('es-ES'),
      }
    })
    exportToCSV(csvData, `usuarios_${new Date().toISOString().split('T')[0]}.csv`)
  }

  const executePrint = () => {
    const htmlContent = `
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Usuario</th>
            <th>Nombre Completo</th>
            <th>Email</th>
            <th>Cédula</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Fecha Creación</th>
          </tr>
        </thead>
        <tbody>
          ${users.map(u => {
            const userRole = roles.find(r => String(r.id) === String(u.roleId || (u.roles && u.roles[0]) || ''))
            return `
              <tr>
                <td>${u.id}</td>
                <td><strong>${u.username}</strong></td>
                <td>${u.firstName} ${u.lastName}</td>
                <td>${u.email}</td>
                <td>${u.identityNumber || '-'}</td>
                <td>${userRole?.name || 'Sin asignar'}</td>
                <td><span class="status ${u.status}">${u.status === 'active' ? 'Activo' : u.status === 'inactive' ? 'Inactivo' : 'Suspendido'}</span></td>
                <td>${new Date(u.createdAt).toLocaleDateString('es-ES')} ${new Date(u.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</td>
              </tr>
            `
          }).join('')}
        </tbody>
      </table>
    `
    printData(htmlContent, 'Reporte de Usuarios')
  }

  const handleAuthConfirm = async () => {
    if (pendingAction === 'export') {
      executeExport()
    } else if (pendingAction === 'print') {
      executePrint()
    } else if (pendingAction === 'powerbi') {
      executePowerBIExport()
    }
  }

  const executePowerBIExport = () => {
    const rows = users.map(u => {
      const userRole = roles.find(r => String(r.id) === String(u.roleId || (u.roles && u.roles[0]) || ''))
      return {
        id: u.id,
        username: u.username,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        identityNumber: u.identityNumber || '-',
        role: userRole?.name || 'Sin asignar',
        status: u.status,
        createdAt: u.createdAt,
      }
    })

    const ref = `PWR-${Date.now().toString().slice(-6)}`
    const meta = {
      company: 'Grupo Camaronero Milcien',
      reportType: 'Usuarios',
      generatedAt: new Date().toISOString(),
      totalRows: String(rows.length),
    }

    const filename = `usuarios_powerbi_${new Date().toISOString().split('T')[0]}.xlsx`
    try {
      exportToPowerBI({ data: rows, filename, meta })
      addAuditLog('export_powerbi', `Exportado a Power BI (Excel) ${filename}`)
      notification.success(
        '¡Exportación a Power BI Completada!',
        'El archivo Excel se ha descargado correctamente. Importalo en Power BI Desktop.',
        ref
      )
    } catch (err) {
      notification.error('Error en Exportación', 'No se pudo exportar a Power BI')
    }
  }

  const permissionOptions = useMemo(() => initialPermissions, [])

  return (
    <div>
      <div className="flex items-center justify-end mb-6">
        <div className="inline-flex rounded-2xl bg-white p-1 shadow-sm border border-slate-200" role="tablist">
          <button onClick={() => setTab('user')} className={`px-4 py-2 rounded-2xl ${tab === 'user' ? 'bg-corp-navy text-white' : 'text-slate-700'}`}>Crear usuario</button>
          <button onClick={() => setTab('list')} className={`px-4 py-2 rounded-2xl ${tab === 'list' ? 'bg-corp-navy text-white' : 'text-slate-700'}`}>Usuarios ({users.length})</button>
          <button onClick={() => setTab('roles')} className={`px-4 py-2 rounded-2xl ${tab === 'roles' ? 'bg-corp-navy text-white' : 'text-slate-700'}`}>Roles</button>
          <button onClick={() => setTab('audit')} className={`px-4 py-2 rounded-2xl ${tab === 'audit' ? 'bg-corp-navy text-white' : 'text-slate-700'}`}>Bitácora</button>
        </div>
      </div>

      {tab === 'user' && (
        canManageUsers ? (
        <form onSubmit={editingUserId ? handleSaveEdit : handleCreateUser} className="space-y-6 bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
          {/* Información Personal */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-corp-navy rounded-full"></div>
              <h3 className="text-lg font-semibold text-slate-900">Información Personal</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-3">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Nombre *</span>
                <input 
                  value={form.firstName} 
                  onChange={e => setForm({ ...form, firstName: e.target.value })} 
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-corp-navy focus:border-transparent transition" 
                  placeholder="Ej: Juan"
                  required 
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Apellidos *</span>
                <input 
                  value={form.lastName} 
                  onChange={e => setForm({ ...form, lastName: e.target.value })} 
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-corp-navy focus:border-transparent transition" 
                  placeholder="Ej: García López"
                  required 
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Correo Electrónico *</span>
                <input 
                  value={form.email} 
                  onChange={e => setForm({ ...form, email: e.target.value })} 
                  type="email" 
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-corp-navy focus:border-transparent transition" 
                  placeholder="usuario@example.com"
                  required 
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Teléfono</span>
                <input 
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-corp-navy focus:border-transparent transition" 
                  placeholder="Ej: +504 0000-0000"
                />
              </label>
            </div>
          </div>

          {/* Datos de Acceso */}
          <div className="border-t pt-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-shrimp-red rounded-full"></div>
              <h3 className="text-lg font-semibold text-slate-900">Datos de Acceso</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-3">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Usuario (Auto-generado)</span>
                <div className="relative">
                  <input 
                    value={form.firstName && form.lastName ? `${form.firstName.trim().toLowerCase().replace(/\s+/g, '')}.${form.lastName.trim().toLowerCase().replace(/\s+/g, '')}` : ''} 
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 bg-slate-50 text-slate-500" 
                    readOnly 
                  />
                  <div className="absolute right-3 top-2.5 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                    Auto
                  </div>
                </div>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">ID/Cédula (Contraseña inicial) *</span>
                <input 
                  value={form.identityNumber} 
                  onChange={e => setForm({ ...form, identityNumber: e.target.value })} 
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-corp-navy focus:border-transparent transition" 
                  placeholder="Ej: 1234567890"
                  required 
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Confirmar ID/Cédula *</span>
                <input 
                  value={form.passwordConfirm} 
                  onChange={e => setForm({ ...form, passwordConfirm: e.target.value })} 
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-corp-navy focus:border-transparent transition" 
                  placeholder="Confirmar ID/Cédula"
                  required 
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Estado de Cuenta</span>
                <select 
                  value={form.status || 'active'} 
                  onChange={e => setForm({ ...form, status: e.target.value })} 
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-corp-navy focus:border-transparent transition"
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                  <option value="suspended">Suspendido</option>
                </select>
              </label>
            </div>
          </div>

          {/* Asignación de Rol */}
          <div className="border-t pt-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-emerald-600 rounded-full"></div>
              <h3 className="text-lg font-semibold text-slate-900">Rol y Permisos</h3>
            </div>
            <div className="pl-3">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Seleccionar Rol *</span>
                <select 
                  value={form.roleId} 
                  onChange={e => setForm({ ...form, roleId: e.target.value })} 
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-corp-navy focus:border-transparent transition"
                >
                  <option value="">-- Seleccione un rol --</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </label>

              {form.roleId && (
                (() => {
                  const selected = roles.find(rr => String(rr.id) === String(form.roleId))
                  if (!selected) return null
                  return (
                    <div className="mt-4 p-4 border border-emerald-200 bg-emerald-50 rounded-lg">
                      <div className="font-semibold text-emerald-900 mb-1">{selected.name}</div>
                      <div className="text-sm text-emerald-700 mb-3">{selected.description}</div>
                      <div className="flex flex-wrap gap-2">
                        {selected.permissions.map(p => (
                          <span key={p} className="inline-block px-3 py-1 bg-emerald-200 text-emerald-900 text-xs font-medium rounded-full">
                            ✓ {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })()
              )}
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="border-t pt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setForm({ firstName: '', lastName: '', email: '', identityNumber: '', passwordConfirm: '', roleId: '', status: 'active' })
                setEditingUserId(null)
              }}
              className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition"
            >
              {editingUserId ? 'Cancelar edición' : 'Limpiar'}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-corp-navy text-white font-medium hover:bg-blue-900 transition shadow-sm"
            >
              {editingUserId ? 'Guardar cambios' : 'Crear Usuario'}
            </button>
          </div>
        </form>
        ) : (
          <div className="p-6 bg-white border border-gray-200 rounded-xl text-slate-600">No tienes permisos para crear o editar usuarios.</div>
        )
      )}

      {tab === 'roles' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Crear rol */}
            <form onSubmit={handleCreateRole} className="lg:col-span-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-fit">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nuevo rol
              </h3>
              <label className="space-y-2">
                <div className="text-sm font-medium text-slate-700">Nombre del rol</div>
                <input value={newRole.name} onChange={e => setNewRole({ ...newRole, name: e.target.value })} placeholder="ej: Jefe de Almacén" className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-corp-navy focus:ring-2 focus:ring-corp-navy/20 outline-none" required />
              </label>
              <label className="space-y-2 mt-4">
                <div className="text-sm font-medium text-slate-700">Descripción</div>
                <input value={newRole.description} onChange={e => setNewRole({ ...newRole, description: e.target.value })} placeholder="Breve descripción de este rol" className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-corp-navy focus:ring-2 focus:ring-corp-navy/20 outline-none" />
              </label>

              <div className="mt-4">
                <div className="text-sm font-medium text-slate-700 mb-3">Seleccionar permisos</div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {permissionOptions.map(p => (
                    <label key={p} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                      <input type="checkbox" checked={newRole.permissions.includes(p)} onChange={() => setNewRole(prev => ({ ...prev, permissions: prev.permissions.includes(p) ? prev.permissions.filter(x => x !== p) : [...prev.permissions, p] }))} className="w-4 h-4 rounded" />
                      <span className="text-sm text-slate-700">{p}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button type="button" onClick={() => setNewRole({ name: '', description: '', permissions: [] })} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50">Limpiar</button>
                <button type="submit" className="px-4 py-2 bg-corp-navy text-white rounded-lg hover:bg-slate-900">Crear</button>
              </div>
            </form>

            {/* Roles existentes */}
            <div className="lg:col-span-2">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 12H9m6 0a6 6 0 11-12 0 6 6 0 0112 0z" />
                </svg>
                Roles del sistema ({roles.length})
              </h3>
              {roles.length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 text-center">
                  <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-slate-500 text-sm">No hay roles creados aún</p>
                  <p className="text-slate-400 text-xs mt-1">Crea uno desde el formulario de la izquierda</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {roles.map(r => (
                    <div key={r.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-semibold text-slate-900">{r.name}</div>
                          <div className="text-sm text-slate-500 mt-1">{r.description || 'Sin descripción'}</div>
                        </div>
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                          {r.permissions.length} permisos
                        </span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <div className="grid grid-cols-2 gap-2">
                          {permissionOptions.map(p => (
                            <label key={p} className="flex items-center gap-2 p-2 rounded hover:bg-slate-50 cursor-pointer">
                              <input type="checkbox" checked={r.permissions.includes(p)} onChange={() => toggleRolePermission(r.id, p)} className="w-4 h-4 rounded accent-corp-navy" />
                              <span className="text-sm text-slate-600">{p}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'list' && (
        <div className="space-y-4">
          <div className="flex justify-end gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4H9a2 2 0 00-2 2v2a2 2 0 002 2h6a2 2 0 002-2v-2a2 2 0 00-2-2zm-6-4h.01M7 16h.01M17 16h.01M7 12h.01M17 12h.01" />
              </svg>
              Imprimir
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2 bg-corp-navy text-white rounded-lg hover:bg-slate-900 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Descargar CSV
            </button>
            <button
              onClick={handlePowerBI}
              className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M7 7V5a5 5 0 0110 0v2" />
              </svg>
              Exportar a Power BI (Excel)
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-slate-500">
                <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20a9 9 0 0118 0" />
                </svg>
                <p className="text-sm font-medium">No hay usuarios creados</p>
                <p className="text-xs text-slate-400 mt-1">Crea uno desde la pestaña "Crear usuario"</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Usuario</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Nombre Completo</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Cédula</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Rol</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Fecha Creación</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {users.map((u) => {
                    const userRole = roles.find(r => String(r.id) === String(u.roleId || (u.roles && u.roles[0]) || ''))
                    return (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-slate-600">
                          #{u.id}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-slate-900">{u.username}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {u.firstName} {u.lastName}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{u.email}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {u.identityNumber || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                            {userRole?.name || 'Sin asignar'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            u.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : u.status === 'inactive'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {u.status === 'active' ? 'Activo' : u.status === 'inactive' ? 'Inactivo' : 'Suspendido'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(u.createdAt).toLocaleDateString('es-ES')} {new Date(u.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                              {canManageUsers && (
                                <>
                                  <button type="button" onClick={() => openEditUser(u)} className="px-3 py-1 rounded-md text-sm bg-slate-100 hover:bg-slate-200">Editar</button>
                                  <button type="button" onClick={() => handleToggleUserStatus(u)} className={`px-3 py-1 rounded-md text-sm ${u.status === 'active' ? 'bg-yellow-100 hover:bg-yellow-200' : 'bg-emerald-100 hover:bg-emerald-200'}`}>
                                    {u.status === 'active' ? 'Deshabilitar' : 'Habilitar'}
                                  </button>
                                </>
                              )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {tab === 'audit' && (
        <AuditLog />
      )}

      <PasswordAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false)
          setPendingAction(null)
        }}
        onConfirm={handleAuthConfirm}
        action={pendingAction === 'export' ? 'exportar los datos' : 'imprimir los datos'}
      />
    </div>
  )
}
