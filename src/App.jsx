import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { supabase } from './lib/supabaseClient.js'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Auth from './screens/Auth.jsx'
import Welcome from './screens/Welcome.jsx'
import Main from './screens/Main.jsx'
import Trash from './screens/Trash.jsx'
import Settings from './screens/Settings.jsx'

export default function App() {
  // Apply the user's saved theme once on app load, no matter which
  // screen they land on first (fixes dark mode only working from Settings)
  useEffect(() => {
    async function applyTheme() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('theme')
        .eq('id', user.id)
        .single()

      if (data?.theme) {
        document.documentElement.classList.toggle('dark', data.theme === 'dark')
      }
    }
    applyTheme()
  }, [])

  return (
    <Routes>
      <Route path="/" element={<Auth />} />
      <Route path="/welcome" element={<Welcome />} />
      <Route
        path="/notes"
        element={
          <ProtectedRoute>
            <Main />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trash"
        element={
          <ProtectedRoute>
            <Trash />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
