import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import Sidebar from '../components/Sidebar.jsx'
import NoteEditor from '../components/NoteEditor.jsx'

export default function Main() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notes, setNotes] = useState([])
  const [search, setSearch] = useState('')
  const [editingNote, setEditingNote] = useState(null) // null closed, 'new', or a note object
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('is_trashed', false)
        .order('updated_at', { ascending: false })

      if (!error) setNotes(data)
      setLoading(false)
    }
    load()
  }, [])

  const filteredNotes = useMemo(() => {
    if (!search.trim()) return notes
    const q = search.toLowerCase()
    return notes.filter(
      (n) =>
        n.title?.toLowerCase().includes(q) ||
        n.body?.toLowerCase().includes(q)
    )
  }, [search, notes])

  function handleSaved(savedNote) {
    setNotes((prev) => {
      const exists = prev.some((n) => n.id === savedNote.id)
      const updated = exists
        ? prev.map((n) => (n.id === savedNote.id ? savedNote : n))
        : [savedNote, ...prev]
      return updated.sort(
        (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
      )
    })
  }

  function handleTrashed(noteId) {
    setNotes((prev) => prev.filter((n) => n.id !== noteId))
    setEditingNote(null)
  }

  return (
    <div className="h-screen flex bg-white dark:bg-gray-900">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
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
            All Notes
          </h1>

          <button
            onClick={() => setEditingNote('new')}
            className="text-gray-700 dark:text-gray-300 text-lg"
            aria-label="New note"
          >
            ✎
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search all notes"
            className="w-full text-sm bg-transparent focus:outline-none text-gray-700 dark:text-gray-300"
          />
        </div>

        {/* New note shortcut row */}
        <button
          onClick={() => setEditingNote('new')}
          className="text-left px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-medium text-sm"
        >
          New Note...
        </button>

        {/* Note list */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <p className="px-4 py-6 text-sm text-gray-400">Loading...</p>
          )}

          {!loading && filteredNotes.length === 0 && (
            <div className="h-full" />
          )}

          {filteredNotes.map((note) => (
            <button
              key={note.id}
              onClick={() => setEditingNote(note)}
              className="w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <div className="flex items-center gap-2">
                {note.mood_emoji && <span>{note.mood_emoji}</span>}
                <span className="font-semibold text-gray-900 dark:text-white truncate">
                  {note.title || 'Untitled'}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {note.body}
              </p>
            </button>
          ))}
        </div>
      </div>

      {editingNote !== null && (
        <NoteEditor
          note={editingNote === 'new' ? null : editingNote}
          userId={userId}
          onClose={() => setEditingNote(null)}
          onSaved={handleSaved}
          onTrashed={handleTrashed}
        />
      )}
    </div>
  )
}
