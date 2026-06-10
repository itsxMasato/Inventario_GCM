import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Productos from './pages/Productos'
import Movimientos from './pages/Movimientos'
import HistorialProducto from './pages/HistorialProducto'
import Reportes from './pages/Reportes'
import Usuarios from './pages/Usuarios'
import Login from './pages/Login'
import WelcomeScreen from './pages/WelcomeScreen'
import ChangePassword from './pages/ChangePassword'
import Layout from './components/Layout'
import auth from './lib/auth'
import ProtectedRoute from './components/ProtectedRoute'
import { SidebarProvider } from './contexts/SidebarContext'

export default function App(){
  const isAuthed = auth.isAuthenticated()

  return (
    <SidebarProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/welcome" element={<WelcomeScreen />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/movimientos" element={<Movimientos />} />
          <Route path="/movimientos/:id" element={<HistorialProducto />} />
          <Route path="/reportes" element={<Reportes />} />
        </Route>

        <Route path="*" element={<Navigate to={auth.isAuthenticated() ? '/' : '/login'} replace />} />
      </Routes>
    </SidebarProvider>
  )
}
