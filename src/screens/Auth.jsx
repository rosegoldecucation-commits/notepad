import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'

export default function Auth() {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const isLogin = mode === 'login'

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Test-mode auth: no real SMS/Twilio needed. We keep the phone number
    // as what the user types and sees, but sign in/up under the hood using
    // Supabase's plain email/password auth with a fake email built from
    // the digits (e.g. 15145551234 -> 15145551234@notepad.app).
    const digitsOnly = phone.trim().replace(/[^0-9]/g, '')
    const fakeEmail = `${digitsOnly}@notepad.app`

    if (isLogin) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: fakeEmail,
        password,
      })
      setLoading(false)
      if (signInError) {
        setError(signInError.message)
        return
      }
      navigate('/notes')
    } else {
      const { error: signUpError } = await supabase.auth.signUp({
        email: fakeEmail,
        password,
      })
      setLoading(false)
      if (signUpError) {
        setError(signUpError.message)
        return
      }
      // New accounts always see the one-time Welcome screen first
      navigate('/welcome')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 px-6">
      <div className="w-full max-w-sm flex flex-col items-center">
        <img
          src="/logo.png"
          alt="Notepad logo"
          className="w-20 h-20 mb-6"
        />

        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          {isLogin ? 'Log in' : 'Create account'}
        </h1>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Please wait...' : 'Continue'}
          </button>
        </form>

        <button
          onClick={() => {
            setMode(isLogin ? 'signup' : 'login')
            setError('')
          }}
          className="mt-4 text-sm text-gray-500 dark:text-gray-400"
        >
          {isLogin ? (
            <>Don't have an account? <span className="text-blue-500">Create one</span></>
          ) : (
            <>Already have an account? <span className="text-blue-500">Log in</span></>
          )}
        </button>
      </div>
    </div>
  )
}
