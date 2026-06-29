'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminGuard from '@/components/AdminGuard'
import TipTapEditor from '@/components/TipTapEditor'
import { api } from '@/lib/api'
import { getToken } from '@/lib/adminAuth'
import { Category, Author } from '@/lib/types'

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export default function NewArticlePage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [authors, setAuthors] = useState<Author[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    cover_url: '',
    category_id: '',
    author_id: '',
    status: 'draft',
    seo_title: '',
    seo_description: '',
    content: '',
  })

  useEffect(() => {
    const token = getToken()
    if (!token) return
    Promise.all([
      api.admin.categories(token),
      api.admin.authors(token),
    ]).then(([cats, auths]) => {
      setCategories(cats)
      setAuthors(auths)
    })
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm(prev => {
      const updated = { ...prev, [name]: value }
      if (name === 'title') updated.slug = slugify(value)
      return updated
    })
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const token = getToken()
    if (!token) return
    setUploading(true)
    try {
      const result = await api.admin.uploadImage(file, token)
      setForm(prev => ({ ...prev, cover_url: result.url || result.filename || '' }))
    } catch {
      alert('Ошибка загрузки изображения')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const token = getToken()
    if (!token) return
    setSubmitting(true)
    setError('')
    try {
      await api.admin.createArticle({
        ...form,
        category_id: form.category_id ? Number(form.category_id) : null,
        author_id: form.author_id ? Number(form.author_id) : null,
      }, token)
      router.push('/admin/articles')
    } catch {
      setError('Ошибка при создании статьи')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AdminGuard>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Новая статья</h1>
          <button onClick={() => router.push('/admin/articles')} className="text-sm text-gray-500 hover:text-gray-700">
            ← Назад
          </button>
        </div>

        {error && <p className="mb-4 text-red-500 text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Заголовок *</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input
                name="slug"
                value={form.slug}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Анонс</label>
              <textarea
                name="excerpt"
                value={form.excerpt}
                onChange={handleChange}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">— Выберите —</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Автор</label>
              <select
                name="author_id"
                value={form.author_id}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">— Выберите —</option>
                {authors.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Черновик</option>
                <option value="published">Опубликовано</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Обложка</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {uploading && <p className="text-xs text-gray-400 mt-1">Загрузка...</p>}
              {form.cover_url && <p className="text-xs text-green-600 mt-1 truncate">{form.cover_url}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SEO заголовок</label>
              <input
                name="seo_title"
                value={form.seo_title}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">SEO описание</label>
              <textarea
                name="seo_description"
                value={form.seo_description}
                onChange={handleChange}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Содержимое</label>
            <TipTapEditor
              content={form.content}
              onChange={html => setForm(prev => ({ ...prev, content: html }))}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push('/admin/articles')}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Сохранение...' : 'Создать статью'}
            </button>
          </div>
        </form>
      </div>
    </AdminGuard>
  )
}
