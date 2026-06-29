export const dynamic = 'force-dynamic'

import { api } from '@/lib/api'
import ArticleCard from '@/components/ArticleCard'
import Pagination from '@/components/Pagination'
import { Suspense } from 'react'

export const revalidate = 60
export const metadata = { title: 'Все статьи' }

async function ArticlesList({
  page,
  category,
  search,
}: {
  page: number
  category?: string
  search?: string
}) {
  let items: any[] = []
  let total = 0

  if (search) {
    items = await api.search(search)
    total = items.length
  } else {
    const params = `?page=${page}&limit=9${category ? `&category=${category}` : ''}`
    const data = await api.articles.list(params)
    items = data.items
    total = data.total
  }

  return (
    <>
      <div className="grid md:grid-cols-3 gap-6">
        {items.map((a: any) => (
          <ArticleCard key={a.id} article={a} />
        ))}
      </div>
      {!search && (
        <Suspense>
          <Pagination page={page} total={total} limit={9} />
        </Suspense>
      )}
    </>
  )
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: { page?: string; category?: string; search?: string }
}) {
  const page = Number(searchParams.page || 1)

  return (
    <div>
      <h1 className="font-display font-bold text-3xl mb-8">
        {searchParams.search ? `Поиск: «${searchParams.search}»` : 'Все статьи'}
      </h1>
      <Suspense
        fallback={
          <div className="grid md:grid-cols-3 gap-6">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
              ))}
          </div>
        }
      >
        <ArticlesList page={page} category={searchParams.category} search={searchParams.search} />
      </Suspense>
    </div>
  )
}
