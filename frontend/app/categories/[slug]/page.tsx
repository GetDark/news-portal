export const dynamic = 'force-dynamic'

import { api } from '@/lib/api'
import ArticleCard from '@/components/ArticleCard'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const cats = await api.categories.list()
  const cat = cats.find((c: any) => c.slug === params.slug)
  return { title: cat?.name || params.slug }
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const [cats, articles] = await Promise.all([api.categories.list(), api.categories.articles(params.slug)])
  const cat = cats.find((c: any) => c.slug === params.slug)
  return (
    <div>
      <h1 className="font-display font-bold text-3xl mb-2">{cat?.name}</h1>
      {cat?.description && <p className="text-gray-500 mb-8">{cat.description}</p>}
      <div className="grid md:grid-cols-3 gap-6">
        {articles.map((a: any) => <ArticleCard key={a.id} article={a} />)}
      </div>
    </div>
  )
}
