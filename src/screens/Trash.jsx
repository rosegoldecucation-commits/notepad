import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import Sidebar from '../components/Sidebar.jsx'

export default function Trash() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('is_trashed', true)
      .order('deleted_at', { ascending: false })
    if (!error) setNotes(data)
    setLoading(false)
  }

  async function handleRestore(noteId) {
    const { error } = await supabase
      .from('notes')
      .update({ is_trashed: false, deleted_at: null })
      .eq('id', noteId)
    if (!error) setNotes((prev) => prev.filter((n) => n.id !== noteId))
  }

  async function handleDeleteForever(noteId) {
    const confirmed = window.confirm(
      'Delete this note permanently? This cannot be undone.'
    )
    if (!confirmed) return
    const { error } = await supabase.from('notes').delete().eq('id', noteId)
    if (!error) setNotes((prev) => prev.filter((n) => n.id !== noteId))
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
            Trash
          </h1>
          <div className="w-6" />
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && (
            <p className="px-4 py-6 text-sm text-gray-400">Loading...</p>
          )}

          {!loading && notes.length === 0 && <div className="h-full" />}

          {notes.map((note) => (
            <div
              key={note.id}
              className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {note.mood_emoji && <span>{note.mood_emoji}</span>}
                  <span className="font-semibold text-gray-900 dark:text-white truncate">
                    {note.title || 'Untitled'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {note.body}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => handleRestore(note.id)}
                  className="text-sm text-blue-500"
                >
                  Restore
                </button>
                <button
                  onClick={() => handleDeleteForever(note.id)}
                  className="text-sm text-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
