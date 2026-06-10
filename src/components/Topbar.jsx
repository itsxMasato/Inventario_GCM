import React, { useMemo, useState } from 'react'
import { useLocation, matchPath } from 'react-router-dom'
import { useSidebar } from '../contexts/SidebarContext'

const routeTitles = [
  { path: '/movimientos/:id', title: 'Historial del Producto' },
  { path: '/movimientos', title: 'Movimientos' },
  { path: '/usuarios', title: 'Usuarios' },
  { path: '/productos', title: 'Productos' },
  { path: '/reportes', title: 'Reportes' },
  { path: '/', title: 'Dashboard' },
]

function useRouteTitle() {
  const location = useLocation()

  return useMemo(() => {
    const route = routeTitles.find((routeItem) =>
      matchPath({ path: routeItem.path, end: true }, location.pathname),
    )
    return route ? route.title : 'Inventario'
  }, [location.pathname])
}

export default function Topbar() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    return today.toISOString().slice(0, 10)
  })
  const title = useRouteTitle()
  const { toggle } = useSidebar()
  

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between shadow-sm" data-purpose="top-navigation">
      <div className="flex items-center gap-4">
        <button onClick={toggle} className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="Toggle sidebar">
          <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h2 className="text-2xl font-semibold text-corp-navy">{title}</h2>
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative rounded-2xl bg-slate-100 border border-slate-200 shadow-sm">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-full rounded-2xl bg-slate-100 px-4 py-2 pr-12 text-sm text-slate-700 outline-none transition focus:border-corp-navy focus:ring-2 focus:ring-corp-navy/20"
            aria-label="Seleccionar fecha"
          />
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <button className="relative inline-flex items-center justify-center rounded-2xl p-2 text-slate-500 hover:text-shrimp-red transition-colors" data-purpose="notifications" aria-label="notifications">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
          </svg>
          <span className="absolute top-2 right-2 w-2 h-2 bg-shrimp-red rounded-full border-2 border-white"></span>
        </button>
        
      </div>
    </header>
  )
}
