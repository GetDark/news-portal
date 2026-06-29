'use client'
import { useEffect, useState } from 'react'
import AdminGuard from '@/components/AdminGuard'
import { api } from '@/lib/api'
import { getToken } from '@/lib/adminAuth'

interface Category {
  id: number
  name: string
  slug: string
  description?: string
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Create form
  const [createName, setCreateName] = useState('')
  const [createSlug, setCreateSlug] = useState('')
  const [createDesc, setCreateDesc] = useState('')
  const [creating, setCreating] = useState(false)

  // Edit state
  const [editId, setEditId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editSlug, setEditSlug] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    const token = getToken()
    if (!token) return
    setLoading(true)
    try {
      const data = await api.admin.categories(token)
      setCategories(data)
    } catch {
      setError('Ошибка загрузки категорий')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const token = getToken()
    if (!token) return
    setCreating(true)
    try {
      await api.admin.createCategory({ name: createName, slug: createSlug, description: createDesc || undefined }, token)
      setCreateName('')
      setCreateSlug('')
      setCreateDesc('')
      await load()
    } catch {
      alert('Ошибка при создании')
    } finally {
      setCreating(false)
    }
  }

  function startEdit(cat: Category) {
    setEditId(cat.id)
    setEditName(cat.name)
    setEditSlug(cat.slug)
    setEditDesc(cat.description || '')
  }

  function cancelEdit() {
    setEditId(null)
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (editId === null) return
    const token = getToken()
    if (!token) return
    setSaving(true)
    try {
      await api.admin.updateCategory(editId, { name: editName, slug: editSlug, description: editDesc || undefined }, token)
      setEditId(null)
      await load()
    } catch {
      alert('Ошибка при сохранении')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Удалить категорию?')) return
    const token = getToken()
    if (!token) return
    try {
      await api.admin.deleteCategory(id, token)
      await load()
    } catch {
      alert('Ошибка при удалении')
    }
  }

  return (
    <AdminGuard>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Категории</h1>

        {/* Create form */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Новая категория</h2>
          <form onSubmit={handleCreate} className="flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Название</label>
              <input
                type="text"
                required
                value={createName}
                onChange={e => { setCreateName(e.target.value); setCreateSlug(slugify(e.target.value)) }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Политика"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Slug</label>
              <input
                type="text"
                required
                value={createSlug}
                onChange={e => setCreateSlug(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="politika"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Описание</label>
              <input
                type="text"
                value={createDesc}
                onChange={e => setCreateDesc(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Необязательно"
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {creating ? 'Создание...' : '+ Создать'}
            </button>
          </form>
        </div>

        {loading && <p className="text-gray-500">Загрузка...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Описание</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400">Категорий нет</td>
                  </tr>
                )}
                {categories.map(cat => (
                  editId === cat.id ? (
                    <tr key={cat.id} className="bg-blue-50">
                      <td colSpan={4} className="px-6 py-4">
                        <form onSubmit={handleUpdate} className="flex flex-wrap gap-3 items-end">
                          <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-500">Название</label>
                            <input
                              type="text"
                              required
                              value={editName}
                              onChange={e => setEditName(e.target.value)}
                              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-500">Slug</label>
                            <input
                              type="text"
                              required
                              value={editSlug}
                              onChange={e => setEditSlug(e.target.value)}
                              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-500">Описание</label>
                            <input
                              type="text"
                              value={editDesc}
                              onChange={e => setEditDesc(e.target.value)}
                              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={saving}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            {saving ? 'Сохранение...' : 'Сохранить'}
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="text-gray-500 hover:text-gray-700 px-4 py-2 text-sm font-medium"
                          >
                            Отмена
                          </button>
                        </form>
                      </td>
                    </tr>
                  ) : (
                    <tr key={cat.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{cat.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-mono">{cat.slug}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{cat.description || '—'}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => startEdit(cat)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Изменить
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          Удалить
                        </button>
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminGuard>
  )
}
