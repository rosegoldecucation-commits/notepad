import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'

export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState('checking') // checking | authed | guest

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setStatus(session ? 'authed' : 'guest')
    })
  }, [])

  if (status === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    )
  }

  if (status === 'guest') {
    return <Navigate to="/" replace />
  }

  return children
}
