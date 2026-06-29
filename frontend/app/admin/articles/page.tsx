'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminGuard from '@/components/AdminGuard'
import { api } from '@/lib/api'
import { getToken } from '@/lib/adminAuth'

interface ArticleRow {
  id: number
  title: string
  slug: string
  status: string
  views: number
  category?: { name: string }
}

export default function AdminArticlesPage() {
  const router = useRouter()
  const [articles, setArticles] = useState<ArticleRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)

  useEffect(() => {
    const token = getToken()
    if (!token) return
    api.admin.articles(token)
      .then(data => setArticles(data))
      .catch(() => setError('Ошибка загрузки статей'))
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(id: number) {
    if (!confirm('Удалить статью?')) return
    const token = getToken()
    if (!token) return
    setDeleteId(id)
    try {
      await api.admin.deleteArticle(id, token)
      setArticles(prev => prev.filter(a => a.id !== id))
    } catch {
      alert('Ошибка при удалении')
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <AdminGuard>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Статьи</h1>
          <button
            onClick={() => router.push('/admin/articles/new')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Новая статья
          </button>
        </div>

        {loading && <p className="text-gray-500">Загрузка...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Заголовок</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Категория</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Просмотры</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {articles.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">Статей нет</td>
                  </tr>
                )}
                {articles.map(article => (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs truncate">{article.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{article.category?.name || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        article.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {article.status === 'published' ? 'Опубликовано' : 'Черновик'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{article.views}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => router.push(`/admin/articles/${article.id}`)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Изменить
                      </button>
                      <button
                        onClick={() => handleDelete(article.id)}
                        disabled={deleteId === article.id}
                        className="text-red-500 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                      >
                        {deleteId === article.id ? '...' : 'Удалить'}
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
