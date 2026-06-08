import React from 'react'
import { NavLink } from 'react-router-dom'

function NavItem({ to, children }){
  return (
    <NavLink to={to} className={({isActive}) => `flex items-center p-3 rounded-lg transition-colors ${isActive ? 'sidebar-item-active text-white' : 'text-white/80 hover:text-white hover:bg-white/10'}`}>
      {children}
    </NavLink>
  )
}

export default function Sidebar(){
  return (
    <aside className="w-64 bg-corp-navy text-white flex flex-col flex-shrink-0">
      <div className="p-6 border-b border-white/10">
        <h1 className="text-xl font-bold tracking-tight">Inventario</h1>
      </div>
      <nav className="flex-grow p-4 space-y-2">
        <NavItem to="/"> 
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span>Dashboard</span>
        </NavItem>
        <NavItem to="/productos"> 
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 7h18M3 12h18M3 17h18" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span>Productos</span>
        </NavItem>
        <NavItem to="/movimientos"> 
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span>Movimientos</span>
        </NavItem>
        <NavItem to="/reportes"> 
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 3h18v18H3z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span>Reportes</span>
        </NavItem>
      </nav>
      <div className="p-4 mt-auto">
        <div className="bg-white/5 rounded-lg p-4 text-xs text-white/60">© 2026 Inventario_GCM</div>
      </div>
    </aside>
  )
}
