import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import auth from '../lib/auth'
import data from '../lib/data'

export default function ChangePassword(){
  const navigate = useNavigate()
  const user = auth.getCurrentUser()
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!user) {
    navigate('/login')
    return null
  }

  async function handleSubmit(e){
    e.preventDefault()
    setError('')
    if (newPassword.length < 6) return setError('La contraseña debe tener al menos 6 caracteres')
    if (newPassword !== confirm) return setError('Las contraseñas no coinciden')
    setLoading(true)
    try {
      // update demo users in localStorage
      await data.updateUser(user.username, { password: newPassword, forcePasswordReset: false })
      // update auth stored user
      const updatedUser = { ...user, password: newPassword, forcePasswordReset: false }
      localStorage.setItem('auth_user', JSON.stringify(updatedUser))

      alert('Contraseña actualizada correctamente')
      navigate('/')
    } catch (err) {
      setError('Error al actualizar contraseña')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-xl p-8">
        <h2 className="text-xl font-semibold text-corp-navy mb-4">Cambiar contraseña</h2>
        <p className="text-sm text-slate-500 mb-4">Por seguridad debes cambiar la contraseña asignada al iniciar sesión por primera vez.</p>
        {error && <div className="text-sm text-rose-600 mb-2">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <div className="text-sm text-slate-600 mb-1">Nueva contraseña</div>
            <input value={newPassword} onChange={e => setNewPassword(e.target.value)} type="password" className="w-full rounded-lg border px-4 py-3" required />
          </label>
          <label className="block">
            <div className="text-sm text-slate-600 mb-1">Confirmar contraseña</div>
            <input value={confirm} onChange={e => setConfirm(e.target.value)} type="password" className="w-full rounded-lg border px-4 py-3" required />
          </label>
          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="px-4 py-2 bg-corp-navy text-white rounded-2xl">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  )
}
