import React from "react";
import { NavLink } from "react-router-dom";
import auth from '../lib/auth'
import { useSidebar } from '../contexts/SidebarContext'

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors ${isActive ? "sidebar-item-active text-white" : "text-white/80 hover:text-white hover:bg-white/10"}`
      }
    >
      {children}
    </NavLink>
  );
}

export default function Sidebar() {
  const { isOpen } = useSidebar()
  
  return (
    <aside className={`w-72 bg-corp-navy text-white flex flex-col shrink-0 shadow-xl min-h-screen transition-all duration-300 ease-in-out overflow-hidden ${
      isOpen ? 'opacity-100 translate-x-0 visible' : 'opacity-0 -translate-x-full absolute'
    }`}>
      <div className="px-8 py-7 border-b border-white/10">
        <h1 className="text-2xl font-semibold tracking-tight">Inventario GCM</h1>
        <p className="mt-1 text-sm text-white/70">Gestión de Inventario</p>
      </div>
      <nav className="px-6 py-5 space-y-2">
        <NavItem to="/">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Dashboard</span>
        </NavItem>
        <NavItem to="/productos">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7h18v10H3z" />
            <path d="M3 7l9 5 9-5" />
          </svg>
          <span>Productos</span>
        </NavItem>
        <NavItem to="/usuarios">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z" />
            <path d="M4 21v-1c0-2.209 3.582-4 8-4s8 1.791 8 4v1" />
          </svg>
          <span>Usuarios</span>
        </NavItem>
        <NavItem to="/movimientos">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 17l10-10" />
            <path d="M7 7h10v10" />
          </svg>
          <span>Movimientos</span>
        </NavItem>
        <NavItem to="/reportes">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19h16" />
            <path d="M8 15v4" />
            <path d="M12 11v8" />
            <path d="M16 7v12" />
          </svg>
          <span>Reportes</span>
        </NavItem>
      </nav>
      <div className="p-6 mt-auto">
        <div className="mb-4">
          <button onClick={() => { auth.logout(); window.location.href = '/login' }} className="w-full flex items-center justify-center gap-2 bg-shrimp-red hover:bg-red-600 transition-colors text-white py-3 rounded-xl font-semibold">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 16l4-4m0 0l-4-4m4 4H7" /><path d="M7 8v8" /></svg>
            Cerrar sesión
          </button>
        </div>
      </div>
    </aside>
  );
}
