export const dynamic = 'force-dynamic'

import { api } from '@/lib/api'
import ArticleCard from '@/components/ArticleCard'
import Image from 'next/image'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const authors = await api.authors.list()
  const author = authors.find((a: any) => a.id === Number(params.id))
  return { title: author?.name || `Автор #${params.id}` }
}

export default async function AuthorPage({ params }: { params: { id: string } }) {
  const [authors, articles] = await Promise.all([api.authors.list(), api.authors.articles(Number(params.id))])
  const author = authors.find((a: any) => a.id === Number(params.id))
  return (
    <div>
      <div className="flex items-center gap-6 mb-10">
        {author?.photo_url && (
          <Image src={author.photo_url} alt={author.name} width={80} height={80} className="rounded-full object-cover" />
        )}
        <div>
          <h1 className="font-display font-bold text-3xl">{author?.name}</h1>
          {author?.bio && <p className="text-gray-500 mt-1">{author.bio}</p>}
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {articles.map((a: any) => <ArticleCard key={a.id} article={a} />)}
      </div>
    </div>
  )
}
