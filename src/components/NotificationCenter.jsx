import React, { useState, useEffect } from 'react'

export default function NotificationCenter({ isOpen, onClose, movements = [] }) {
  const [notifications, setNotifications] = useState([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (movements && movements.length > 0) {
      const notifs = movements.map(m => ({
        id: m.movementId || `notif-${Date.now()}-${Math.random()}`,
        type: m.type || (m.status === 'Entrada' ? 'entrada' : 'salida'),
        product: m.name,
        quantity: m.stock || m.cantidad || 0,
        user: m.user || m.entregadoA || 'Sistema',
        timestamp: m.date || new Date().toISOString(),
        status: m.status || 'completado',
        description: m.description,
      }))
      setNotifications(notifs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)))
    }
  }, [movements])

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'entrada') return n.type === 'entrada' || n.status === 'Entrada'
    if (filter === 'salida') return n.type === 'salida' || n.status === 'Salida'
    return true
  })

  const getTypeIcon = (type) => {
    if (type === 'entrada' || type?.includes('entrada')) {
      return (
        <div className="rounded-full bg-emerald-100 p-2">
          <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
      )
    }
    return (
      <div className="rounded-full bg-blue-100 p-2">
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8a4 4 0 01.88 7.903A5 5 0 1115.9 18H15a5 5 0 01-1-9.9M15 11l3 3m0 0l3-3m-3 3v-9" />
        </svg>
      </div>
    )
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Hace un momento'
    if (minutes < 60) return `Hace ${minutes} min`
    if (hours < 24) return `Hace ${hours}h`
    if (days < 7) return `Hace ${days}d`
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      )}
      <div
        className={`fixed right-0 top-0 z-50 h-screen w-96 max-w-full bg-white shadow-2xl transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-corp-navy">Notificaciones</h2>
              <p className="text-xs text-slate-500 mt-1">Historial de movimientos</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-2 border-b border-slate-200 px-4 py-3 bg-slate-50">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-corp-navy text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Todos ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('entrada')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filter === 'entrada'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Entradas
            </button>
            <button
              onClick={() => setFilter('salida')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filter === 'salida'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Salidas
            </button>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 px-4">
                <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-sm font-medium">Sin notificaciones</p>
                <p className="text-xs">Los movimientos aparecerán aquí</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {filteredNotifications.map(notif => (
                  <div key={notif.id} className="px-4 py-4 hover:bg-slate-50 transition-colors">
                    <div className="flex gap-3">
                      {getTypeIcon(notif.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-900 truncate">
                              {notif.product}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {notif.type === 'entrada' || notif.status === 'Entrada' ? (
                                <span className="text-emerald-600 font-medium">
                                  ✓ Entrada: {notif.quantity} unidades
                                </span>
                              ) : (
                                <span className="text-blue-600 font-medium">
                                  ✓ Salida: {notif.quantity} unidades
                                </span>
                              )}
                            </p>
                          </div>
                          <span className="text-xs text-slate-400 whitespace-nowrap">
                            {formatDate(notif.timestamp)}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>{notif.user}</span>
                        </div>
                        {notif.description && (
                          <p className="mt-2 text-xs text-slate-500 line-clamp-2">
                            {notif.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {filteredNotifications.length > 0 && (
            <div className="border-t border-slate-200 px-4 py-3 bg-slate-50">
              <button className="w-full px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
                Limpiar historial
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
