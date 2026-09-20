import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children, roles }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    // Carry the page the person was trying to reach along with the redirect,
    // so Login.jsx can send them straight back here (e.g. mid-booking)
    // instead of dropping them on the homepage after they sign in.
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}`, fromState: location.state }} />
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }
  return children
}