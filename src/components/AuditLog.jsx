import React, { useState, useEffect } from 'react'

export default function AuditLog() {
  const [logs, setLogs] = useState([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    try {
      const stored = localStorage.getItem('audit_logs') || '[]'
      const parsedLogs = JSON.parse(stored)
      setLogs(parsedLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)))
    } catch (err) {
      console.error('Error cargando bitácora:', err)
    }
  }, [])

  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true
    return log.action === filter
  })

  const getActionIcon = (action) => {
    switch (action) {
      case 'create_user':
        return <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
      case 'delete_user':
        return <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
      case 'update_user':
        return <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
      case 'export':
        return <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
      case 'print':
        return <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4H9a2 2 0 00-2 2v2a2 2 0 002 2h6a2 2 0 002-2v-2a2 2 0 00-2-2zm-6-4h.01M7 16h.01M17 16h.01M7 12h.01M17 12h.01" /></svg>
      case 'login':
        return <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
      default:
        return <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    }
  }

  const getActionLabel = (action) => {
    const labels = {
      'create_user': 'Crear usuario',
      'delete_user': 'Eliminar usuario',
      'update_user': 'Actualizar usuario',
      'export': 'Exportar datos',
      'print': 'Imprimir datos',
      'login': 'Iniciar sesión',
      'create_role': 'Crear rol',
      'update_role': 'Actualizar rol',
    }
    return labels[action] || action
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const actions = ['all', 'create_user', 'delete_user', 'update_user', 'export', 'print', 'login']

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {actions.map(action => (
          <button
            key={action}
            onClick={() => setFilter(action)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === action
                ? 'bg-corp-navy text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {action === 'all' ? 'Todos' : getActionLabel(action)}
          </button>
        ))}
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-slate-500">
            <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm font-medium">Sin eventos en la bitácora</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Acción</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Detalles</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Fecha/Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredLogs.map((log, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-slate-100 p-2">
                        {getActionIcon(log.action)}
                      </div>
                      <span className="text-sm font-medium text-slate-900">
                        {getActionLabel(log.action)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{log.user || 'Sistema'}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 max-w-md truncate">{log.details || '-'}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">{formatDate(log.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Stats */}
      {filteredLogs.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-600 font-medium">Total de eventos</p>
            <p className="text-2xl font-bold text-corp-navy mt-1">{filteredLogs.length}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-600 font-medium">Primer evento</p>
            <p className="text-sm font-medium text-slate-900 mt-1">
              {formatDate(filteredLogs[filteredLogs.length - 1].timestamp)}
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-600 font-medium">Último evento</p>
            <p className="text-sm font-medium text-slate-900 mt-1">
              {formatDate(filteredLogs[0].timestamp)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
