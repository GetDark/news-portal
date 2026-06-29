'use client'
import { useEffect, useState } from 'react'
import AdminGuard from '@/components/AdminGuard'
import { api } from '@/lib/api'
import { getToken } from '@/lib/adminAuth'

interface Author {
  id: number
  name: string
  bio?: string
  photo_url?: string
}

interface FormState {
  name: string
  bio: string
  photo_url: string
}

const emptyForm: FormState = { name: '', bio: '', photo_url: '' }

export default function AdminAuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // null = closed, 0 = create, N = edit id
  const [modalId, setModalId] = useState<number | null | 0>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  async function load() {
    const token = getToken()
    if (!token) return
    setLoading(true)
    try {
      const data = await api.admin.authors(token)
      setAuthors(data)
    } catch {
      setError('Ошибка загрузки авторов')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setForm(emptyForm)
    setModalId(0)
  }

  function openEdit(author: Author) {
    setForm({ name: author.name, bio: author.bio || '', photo_url: author.photo_url || '' })
    setModalId(author.id)
  }

  function closeModal() {
    setModalId(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const token = getToken()
    if (!token) return
    setSubmitting(true)
    const payload = {
      name: form.name,
      bio: form.bio || undefined,
      photo_url: form.photo_url || undefined,
    }
    try {
      if (modalId === 0) {
        await api.admin.createAuthor(payload, token)
      } else if (modalId !== null) {
        await api.admin.updateAuthor(modalId, payload, token)
      }
      closeModal()
      await load()
    } catch {
      alert('Ошибка при сохранении')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Удалить автора?')) return
    const token = getToken()
    if (!token) return
    try {
      await api.admin.deleteAuthor(id, token)
      await load()
    } catch {
      alert('Ошибка при удалении')
    }
  }

  return (
    <AdminGuard>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Авторы</h1>
          <button
            onClick={openCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Новый автор
          </button>
        </div>

        {loading && <p className="text-gray-500">Загрузка...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Фото</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Имя</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bio</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {authors.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400">Авторов нет</td>
                  </tr>
                )}
                {authors.map(author => (
                  <tr key={author.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {author.photo_url ? (
                        <img
                          src={author.photo_url}
                          alt={author.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-sm font-bold">
                          {author.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{author.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                      {author.bio ? (author.bio.length > 80 ? author.bio.slice(0, 80) + '...' : author.bio) : '—'}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openEdit(author)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Изменить
                      </button>
                      <button
                        onClick={() => handleDelete(author.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {modalId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                {modalId === 0 ? 'Новый автор' : 'Редактировать автора'}
              </h2>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600">Имя *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Иван Иванов"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600">Bio</label>
                  <textarea
                    rows={3}
                    value={form.bio}
                    onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Краткая биография..."
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600">URL фото</label>
                  <input
                    type="url"
                    value={form.photo_url}
                    onChange={e => setForm(f => ({ ...f, photo_url: e.target.value }))}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                  />
                  {form.photo_url && (
                    <img
                      src={form.photo_url}
                      alt="preview"
                      className="mt-2 w-16 h-16 rounded-full object-cover border border-gray-200"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  )}
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="text-gray-500 hover:text-gray-700 text-sm font-medium px-4 py-2"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Сохранение...' : 'Сохранить'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  )
}
