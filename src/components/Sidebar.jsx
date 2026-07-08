import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'

const navItems = [
  { path: '/notes', label: 'All Notes' },
  { path: '/trash', label: 'Trash' },
  { path: '/settings', label: 'Settings' },
]

export default function Sidebar({ open, onClose }) {
  const location = useLocation()

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const content = (
    <div className="h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      <nav className="flex-1 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`block px-5 py-3 text-sm ${
                isActive
                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-gray-200 dark:border-gray-800 py-2">
        <button
          onClick={handleLogout}
          className="w-full text-left px-5 py-3 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Log out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop: always visible, part of the layout flow */}
      <div className="hidden md:block">{content}</div>

      {/* Mobile: hamburger drawer with backdrop */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
          />
          <div className="absolute inset-y-0 left-0 z-50">{content}</div>
        </div>
      )}
    </>
  )
}
