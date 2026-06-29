'use client'
import { useState } from 'react'

export default function CommentForm({ articleId }: { articleId: number }) {
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8006'}/api/comments`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ article_id: articleId, author_name: name, text }),
        }
      )
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <p className="text-green-600 font-medium">
        Спасибо! Комментарий отправлен на модерацию.
      </p>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Ваше имя"
        required
        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
      />
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Комментарий..."
        required
        rows={4}
        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors"
      >
        {loading ? 'Отправка...' : 'Отправить'}
      </button>
    </form>
  )
}
