import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'

export default function Welcome() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleContinue() {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Stamp has_seen_welcome so this screen never shows again for this user
      await supabase
        .from('profiles')
        .update({ has_seen_welcome: true })
        .eq('id', user.id)
    }

    setLoading(false)
    navigate('/notes')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 px-6">
      <div className="w-full max-w-sm flex flex-col items-center text-center">
        <img
          src="/logo.png"
          alt="Notepad logo"
          className="w-20 h-20 mb-6"
        />

        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">
          Welcome to Notepad
        </h1>

        <button
          onClick={handleContinue}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Please wait...' : 'Continue'}
        </button>
      </div>
    </div>
  )
}
