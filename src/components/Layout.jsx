import React from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { Outlet } from 'react-router-dom'
import { useSidebar } from '../contexts/SidebarContext'

export default function Layout() {
  const { isOpen } = useSidebar()
  
  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900">
      <Sidebar />
      <main className={`flex-grow flex flex-col min-w-0 overflow-hidden bg-slate-50 transition-all duration-300 ease-in-out ${isOpen ? 'ml-0' : 'ml-0'}`}>
        <Topbar />
        <div className="px-6 md:px-8 lg:px-12 py-8 w-full">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
