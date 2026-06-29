'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { getToken, clearToken } from '@/lib/adminAuth'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const token = getToken()
    if (!token && pathname !== '/admin') {
      router.push('/admin')
    }
  }, [pathname, router])

  function handleLogout() {
    clearToken()
    router.push('/admin')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-gray-700">
          <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Панель управления
          </span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          <Link
            href="/admin/articles"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            Статьи
          </Link>
          <Link
            href="/admin/categories"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            Категории
          </Link>
          <Link
            href="/admin/authors"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            Авторы
          </Link>
          <Link
            href="/admin/comments"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            Комментарии
          </Link>
        </nav>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
          <h1 className="text-lg font-semibold text-gray-800">
            IT Новости — Панель управления
          </h1>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-600 hover:text-red-600 transition-colors px-3 py-1.5 rounded-md border border-gray-300 hover:border-red-300"
          >
            Выйти
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 bg-gray-50 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
