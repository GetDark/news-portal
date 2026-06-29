import { api } from '@/lib/api'
import ArticleCard from '@/components/ArticleCard'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'

export const revalidate = 60

export default async function HomePage() {
  const [{ items: articles }, popular] = await Promise.all([
    api.articles.list('?limit=6'),
    api.articles.popular(),
  ])

  return (
    <div>
      {/* Hero */}
      {articles[0] && (
        <div className="mb-10 rounded-2xl overflow-hidden relative h-80 bg-gray-900">
          {articles[0].cover_url && (
            <img
              src={articles[0].cover_url}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-50"
            />
          )}
          <div className="relative p-8 flex flex-col justify-end h-full">
            <Link href={`/articles/${articles[0].slug}`}>
              <h1 className="text-white font-display font-bold text-3xl hover:text-blue-300 transition-colors">
                {articles[0].title}
              </h1>
            </Link>
            {articles[0].excerpt && (
              <p className="text-gray-300 mt-2 max-w-2xl">{articles[0].excerpt}</p>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-8">
        <div className="flex-1">
          <h2 className="font-display font-bold text-xl mb-6">Свежее</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {articles.slice(1).map(a => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
          <div className="mt-6">
            <Link href="/articles" className="text-accent font-medium hover:underline">
              Все статьи →
            </Link>
          </div>
        </div>
        <Sidebar popular={popular} />
      </div>
    </div>
  )
}
