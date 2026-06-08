import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Productos from './pages/Productos'
import Movimientos from './pages/Movimientos'
import Reportes from './pages/Reportes'
import Sidebar from './components/Sidebar'

export default function App(){
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-grow flex flex-col min-w-0 overflow-hidden">
        {/* BEGIN: TopHeader */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between" data-purpose="top-navigation">
          <h2 className="text-2xl font-bold text-corp-navy">Dashboard</h2>
          <div className="flex items-center space-x-6">
            {/* Date Picker */}
            <div className="relative">
              <div className="flex items-center border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-600 bg-gray-50">
                <span className="mr-4">01 / 01 / 2023</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>
            </div>
            {/* Notification Bell */}
            <button className="relative p-2 text-gray-500 hover:text-shrimp-red transition-colors" data-purpose="notifications" aria-label="notifications">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
              <span className="absolute top-2 right-2 w-2 h-2 bg-shrimp-red rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>
        {/* END: TopHeader */}

        {/* BEGIN: Dashboard Content */}
        <div className="p-8 space-y-8 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/movimientos" element={<Movimientos />} />
            <Route path="/reportes" element={<Reportes />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </div>
        {/* END: Dashboard Content */}
      </main>
    </div>
  )
}
