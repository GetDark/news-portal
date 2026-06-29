'use client'
import { useEffect, useState } from 'react'
import AdminGuard from '@/components/AdminGuard'
import { api } from '@/lib/api'
import { getToken } from '@/lib/adminAuth'

interface Comment {
  id: number
  article_id: number
  author_name: string
  text: string
  is_approved: boolean
  created_at: string
}

type FilterTab = 'all' | 'pending' | 'approved'

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<FilterTab>('all')
  const [actionId, setActionId] = useState<number | null>(null)

  async function load() {
    const token = getToken()
    if (!token) return
    setLoading(true)
    try {
      const data = await api.admin.comments(token)
      setComments(data)
    } catch {
      setError('Ошибка загрузки комментариев')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleApprove(id: number) {
    const token = getToken()
    if (!token) return
    setActionId(id)
    try {
      await api.admin.moderateComment(id, true, token)
      setComments(prev => prev.map(c => c.id === id ? { ...c, is_approved: true } : c))
    } catch {
      alert('Ошибка при одобрении')
    } finally {
      setActionId(null)
    }
  }

  async function handleReject(id: number) {
    const token = getToken()
    if (!token) return
    setActionId(id)
    try {
      await api.admin.moderateComment(id, false, token)
      setComments(prev => prev.map(c => c.id === id ? { ...c, is_approved: false } : c))
    } catch {
      alert('Ошибка при отклонении')
    } finally {
      setActionId(null)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Удалить комментарий?')) return
    const token = getToken()
    if (!token) return
    setActionId(id)
    try {
      await api.admin.deleteComment(id, token)
      setComments(prev => prev.filter(c => c.id !== id))
    } catch {
      alert('Ошибка при удалении')
    } finally {
      setActionId(null)
    }
  }

  const filtered = comments.filter(c => {
    if (tab === 'pending') return !c.is_approved
    if (tab === 'approved') return c.is_approved
    return true
  })

  const pendingCount = comments.filter(c => !c.is_approved).length

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    } catch {
      return iso
    }
  }

  return (
    <AdminGuard>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Комментарии
            {pendingCount > 0 && (
              <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {pendingCount} на модерации
              </span>
            )}
          </h1>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
          {([
            { key: 'all', label: 'Все' },
            { key: 'pending', label: 'На модерации' },
            { key: 'approved', label: 'Одобренные' },
          ] as { key: FilterTab; label: string }[]).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                tab === t.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading && <p className="text-gray-500">Загрузка...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Автор</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статья</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Текст</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">Комментариев нет</td>
                  </tr>
                )}
                {filtered.map(comment => (
                  <tr key={comment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {comment.author_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      #{comment.article_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                      {comment.text.length > 100 ? comment.text.slice(0, 100) + '...' : comment.text}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {comment.is_approved ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Одобрен
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          На модерации
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {formatDate(comment.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      {!comment.is_approved && (
                        <button
                          onClick={() => handleApprove(comment.id)}
                          disabled={actionId === comment.id}
                          className="text-green-600 hover:text-green-800 text-sm font-medium disabled:opacity-50"
                        >
                          Одобрить
                        </button>
                      )}
                      {comment.is_approved && (
                        <button
                          onClick={() => handleReject(comment.id)}
                          disabled={actionId === comment.id}
                          className="text-yellow-600 hover:text-yellow-800 text-sm font-medium disabled:opacity-50"
                        >
                          Отклонить
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(comment.id)}
                        disabled={actionId === comment.id}
                        className="text-red-500 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                      >
                        {actionId === comment.id ? '...' : 'Удалить'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminGuard>
  )
}
