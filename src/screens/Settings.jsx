import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import Sidebar from '../components/Sidebar.jsx'

export default function Settings() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [theme, setTheme] = useState('light')
  const [userId, setUserId] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Single source of truth: read the theme that's actually applied to
    // the page right now (set once at app load in App.jsx), instead of
    // fetching it again here — fetching it twice is what caused the
    // toggle to sometimes show the wrong on/off position.
    const isDark = document.documentElement.classList.contains('dark')
    setTheme(isDark ? 'dark' : 'light')

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id)
    })
  }, [])

  async function handleThemeToggle() {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')

    if (userId) {
      await supabase
        .from('profiles')
        .update({ theme: newTheme })
        .eq('id', userId)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      'Delete your account? All your notes will be permanently removed. This cannot be undone.'
    )
    if (!confirmed || !userId) return

    // Client-side cleanup: remove the user's notes and profile row.
    // Note: fully deleting the auth.users entry itself requires a
    // Supabase Edge Function calling the admin API with the service
    // role key — the anon key used here can't do that. This is a
    // known limitation to revisit before this goes to real production.
    await supabase.from('notes').delete().eq('user_id', userId)
    await supabase.from('profiles').delete().eq('id', userId)
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <div className="h-screen flex bg-white dark:bg-gray-900">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-gray-700 dark:text-gray-300 text-xl"
            aria-label="Open menu"
          >
            ☰
          </button>
          <div className="hidden md:block w-6" />
          <h1 className="text-base font-semibold text-gray-900 dark:text-white">
            Settings
          </h1>
          <div className="w-6" />
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 max-w-sm">
          <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Dark mode
            </span>
            <button
              onClick={handleThemeToggle}
              role="switch"
              aria-checked={theme === 'dark'}
              className={`w-11 h-6 shrink-0 rounded-full transition-colors relative ${
                theme === 'dark' ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="text-left px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 text-sm text-gray-700 dark:text-gray-300"
          >
            Log out
          </button>

          <button
            onClick={handleDeleteAccount}
            className="text-left px-4 py-3 rounded-xl border border-red-200 dark:border-red-900 text-sm text-red-500"
          >
            Delete account
          </button>
        </div>
      </div>
    </div>
  )
}
