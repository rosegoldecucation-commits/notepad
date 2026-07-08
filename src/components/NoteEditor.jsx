import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient.js'

const MOOD_EMOJIS = ['😊', '😢', '😡', '😴', '🤔', '🎉', '❤️', '😐']

export default function NoteEditor({ note, userId, onClose, onSaved, onTrashed }) {
  const [title, setTitle] = useState(note?.title || '')
  const [body, setBody] = useState(note?.body || '')
  const [moodEmoji, setMoodEmoji] = useState(note?.mood_emoji || null)
  const [noteId, setNoteId] = useState(note?.id || null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [saving, setSaving] = useState(false)
  const debounceRef = useRef(null)
  const isFirstRender = useRef(true)

  // Autosave: fires once the user stops typing (debounced)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      save()
    }, 800)
    return () => clearTimeout(debounceRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, body, moodEmoji])

  async function save() {
    // Don't create an empty note if the user typed nothing at all
    if (!noteId && !title.trim() && !body.trim()) return

    setSaving(true)

    if (noteId) {
      const { data, error } = await supabase
        .from('notes')
        .update({ title, body, mood_emoji: moodEmoji })
        .eq('id', noteId)
        .select()
        .single()
      setSaving(false)
      if (!error && data) onSaved(data)
    } else {
      const { data, error } = await supabase
        .from('notes')
        .insert({ user_id: userId, title, body, mood_emoji: moodEmoji })
        .select()
        .single()
      setSaving(false)
      if (!error && data) {
        setNoteId(data.id)
        onSaved(data)
      }
    }
  }

  async function handleClose() {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    await save()
    onClose()
  }

  async function handleTrash() {
    if (!noteId) {
      // Never saved, nothing to trash — just close
      onClose()
      return
    }
    const { error } = await supabase
      .from('notes')
      .update({ is_trashed: true, deleted_at: new Date().toISOString() })
      .eq('id', noteId)
    if (!error) {
      onTrashed(noteId)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg h-[80vh] md:h-[600px] bg-white dark:bg-gray-900 rounded-2xl shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={handleClose}
            className="text-gray-500 dark:text-gray-400 text-sm"
          >
            ← Back
          </button>

          <div className="flex items-center gap-3 relative">
            <button
              onClick={() => setShowEmojiPicker((v) => !v)}
              className="text-lg"
              aria-label="Set mood emoji"
            >
              {moodEmoji || '🙂'}
            </button>

            {showEmojiPicker && (
              <div className="absolute top-8 right-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-2 grid grid-cols-4 gap-1 z-10">
                {MOOD_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      setMoodEmoji(emoji)
                      setShowEmojiPicker(false)
                    }}
                    className="text-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={handleTrash}
              className="text-gray-500 dark:text-gray-400 text-sm"
              aria-label="Move to trash"
            >
              🗑
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col px-4 py-3 gap-2 overflow-y-auto">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="text-lg font-semibold text-gray-900 dark:text-white bg-transparent focus:outline-none"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Start writing..."
            className="flex-1 resize-none text-gray-800 dark:text-gray-200 bg-transparent focus:outline-none leading-relaxed"
          />
        </div>

        <div className="px-4 py-2 text-xs text-gray-400 border-t border-gray-100 dark:border-gray-800">
          {saving ? 'Saving...' : 'Saved'}
        </div>
      </div>
    </div>
  )
}
