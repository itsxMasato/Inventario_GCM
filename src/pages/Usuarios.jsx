import React, { useState, useMemo, useEffect } from 'react'
import data from '../lib/data'
import auth from '../lib/auth'

const initialPermissions = [
  'products.read',
  'products.write',
  'movements.read',
  'movements.write',
  'users.manage',
  'reports.export',
]

export default function Usuarios() {
  const [tab, setTab] = useState('user')

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
  const [roles, setRoles] = useState([
    { id: 1, name: 'Administrador', description: 'Acceso total', permissions: initialPermissions.slice() },
    { id: 2, name: 'Operador', description: 'Gestión de inventario', permissions: ['products.read', 'products.write', 'movements.read', 'movements.write'] },
    { id: 3, name: 'Analista', description: 'Solo lectura y reportes', permissions: ['products.read', 'movements.read', 'reports.export'] },
  ])

  const [newRole, setNewRole] = useState({ name: '', description: '', permissions: [] })

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
    if (!form.firstName || !form.email || !form.identityNumber) return alert('Complete los campos obligatorios (nombre, correo, número de identidad)')
    if (!form.roleId) return alert('Seleccione un rol para el usuario')
    if (form.identityNumber.length < 4) return alert('Número de identidad muy corto')
    if (form.identityNumber !== form.passwordConfirm) return alert('El número de identidad y la confirmación no coinciden')

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

    setForm({ firstName: '', lastName: '', email: '', identityNumber: '', passwordConfirm: '', roleId: '', status: 'active' })
    alert(`Usuario creado. Nombre de usuario inicial: ${username}. Contraseña inicial: número de identidad.`)
  }

  // role selection (single-select) handled via form.roleId

  function handleCreateRole(e) {
    e.preventDefault()
    if (!newRole.name) return alert('Nombre de rol requerido')
    const nextId = roles.length ? Math.max(...roles.map(r => r.id)) + 1 : 1
    setRoles(prev => [...prev, { id: nextId, ...newRole }])
    setNewRole({ name: '', description: '', permissions: [] })
    alert('Rol creado (demo local)')
  }

  function toggleRolePermission(roleId, perm) {
    setRoles(prev => prev.map(r => {
      if (r.id !== roleId) return r
      const has = r.permissions.includes(perm)
      return { ...r, permissions: has ? r.permissions.filter(p => p !== perm) : [...r.permissions, perm] }
    }))
  }

  const permissionOptions = useMemo(() => initialPermissions, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-corp-navy">Usuarios</h2>
          <p className="text-sm text-slate-500">Crear y administrar usuarios y roles</p>
        </div>
        <div className="inline-flex rounded-2xl bg-white p-1 shadow-sm border border-slate-200" role="tablist">
          <button onClick={() => setTab('user')} className={`px-4 py-2 rounded-2xl ${tab === 'user' ? 'bg-corp-navy text-white' : 'text-slate-700'}`}>Crear usuario</button>
          <button onClick={() => setTab('roles')} className={`px-4 py-2 rounded-2xl ${tab === 'roles' ? 'bg-corp-navy text-white' : 'text-slate-700'}`}>Roles</button>
        </div>
        {/* logout moved to Sidebar */}
      </div>

      {tab === 'user' && (
        <form onSubmit={handleCreateUser} className="space-y-6 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1">
              <div className="text-sm text-slate-600">Nombre</div>
              <input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className="w-full rounded-2xl border px-4 py-2" required />
            </label>
            <label className="space-y-1">
              <div className="text-sm text-slate-600">Apellidos</div>
              <input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className="w-full rounded-2xl border px-4 py-2" />
            </label>
            <label className="space-y-1">
              <div className="text-sm text-slate-600">Correo</div>
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} type="email" className="w-full rounded-2xl border px-4 py-2" required />
            </label>
            <label className="space-y-1">
              <div className="text-sm text-slate-600">Teléfono</div>
              <input className="w-full rounded-2xl border px-4 py-2" />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1 md:col-span-1">
              <div className="text-sm text-slate-600">Nombre de usuario (generado)</div>
              <input value={form.firstName && form.lastName ? `${form.firstName.trim().toLowerCase().replace(/\s+/g, '')}.${form.lastName.trim().toLowerCase().replace(/\s+/g, '')}` : ''} className="w-full rounded-2xl border px-4 py-2 bg-slate-50" readOnly />
            </label>
            <label className="space-y-1">
              <div className="text-sm text-slate-600">Número de identidad (contraseña inicial)</div>
              <input value={form.identityNumber} onChange={e => setForm({ ...form, identityNumber: e.target.value })} className="w-full rounded-2xl border px-4 py-2" required />
            </label>
            <label className="space-y-1">
              <div className="text-sm text-slate-600">Confirmar número de identidad</div>
              <input value={form.passwordConfirm} onChange={e => setForm({ ...form, passwordConfirm: e.target.value })} className="w-full rounded-2xl border px-4 py-2" required />
            </label>
            <label className="space-y-1">
              <div className="text-sm text-slate-600">Estado de cuenta</div>
              <select value={form.status || 'active'} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full rounded-2xl border px-4 py-3">
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="suspended">Suspendido</option>
              </select>
            </label>
          </div>

          <div>
            <div className="text-sm text-slate-600 mb-2">Roles asignados</div>
            <div>
              <select value={form.roleId} onChange={e => setForm({ ...form, roleId: e.target.value })} className="w-full rounded-2xl border px-4 py-3">
                <option value="">Seleccione un rol</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>

              {form.roleId && (
                (() => {
                  const selected = roles.find(rr => String(rr.id) === String(form.roleId))
                  if (!selected) return null
                  return (
                    <div className="mt-3 p-3 border rounded-lg bg-slate-50">
                      <div className="font-medium">{selected.name}</div>
                      <div className="text-sm text-slate-500 mb-2">{selected.description}</div>
                      <div className="flex flex-wrap gap-2">
                        {selected.permissions.map(p => (
                          <span key={p} className="text-xs px-2 py-1 bg-white border rounded-md">{p}</span>
                        ))}
                      </div>
                    </div>
                  )
                })()
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setForm({ firstName: '', lastName: '', email: '', identityNumber: '', passwordConfirm: '', roleId: '', status: 'active' })} className="px-4 py-2 border rounded-2xl">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-corp-navy text-white rounded-2xl">Guardar usuario</button>
          </div>
        </form>
      )}

      {tab === 'roles' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <form onSubmit={handleCreateRole} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-4">Crear rol</h3>
              <label className="space-y-2">
                <div className="text-sm text-slate-600">Nombre</div>
                <input value={newRole.name} onChange={e => setNewRole({ ...newRole, name: e.target.value })} className="w-full rounded-2xl border px-4 py-2" required />
              </label>
              <label className="space-y-2 mt-3">
                <div className="text-sm text-slate-600">Descripción</div>
                <input value={newRole.description} onChange={e => setNewRole({ ...newRole, description: e.target.value })} className="w-full rounded-2xl border px-4 py-2" />
              </label>

              <div className="mt-4">
                <div className="text-sm text-slate-600 mb-2">Permisos</div>
                <div className="grid grid-cols-2 gap-2">
                  {permissionOptions.map(p => (
                    <label key={p} className="flex items-center gap-2">
                      <input type="checkbox" checked={newRole.permissions.includes(p)} onChange={() => setNewRole(prev => ({ ...prev, permissions: prev.permissions.includes(p) ? prev.permissions.filter(x => x !== p) : [...prev.permissions, p] }))} />
                      <div className="text-sm">{p}</div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setNewRole({ name: '', description: '', permissions: [] })} className="px-4 py-2 border rounded-2xl">Limpiar</button>
                <button type="submit" className="px-4 py-2 bg-corp-navy text-white rounded-2xl">Crear rol</button>
              </div>
            </form>

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-4">Roles existentes</h3>
              <div className="space-y-3">
                {roles.map(r => (
                  <div key={r.id} className="border p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{r.name}</div>
                        <div className="text-sm text-slate-500">{r.description}</div>
                      </div>
                      <div className="text-sm text-slate-500">{r.permissions.length} permisos</div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {permissionOptions.map(p => (
                        <label key={p} className="flex items-center gap-2">
                          <input type="checkbox" checked={r.permissions.includes(p)} onChange={() => toggleRolePermission(r.id, p)} />
                          <div className="text-sm">{p}</div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
