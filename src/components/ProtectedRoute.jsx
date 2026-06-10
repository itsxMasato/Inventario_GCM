import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import auth from '../lib/auth'
import Layout from './Layout'

export default function ProtectedRoute() {
  const isAuthed = auth.isAuthenticated()
  if (!isAuthed) return <Navigate to="/login" replace />
  return <Layout />
}
