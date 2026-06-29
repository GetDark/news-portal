import { api } from '@/lib/api'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import CategoryBadge from '@/components/CategoryBadge'
import CommentForm from '@/components/CommentForm'

export const revalidate = 60

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  try {
    const a = await api.articles.get(params.slug)
    return {
      title: a.seo_title || a.title,
      description: a.seo_description || a.excerpt,
      openGraph: {
        title: a.title,
        images: a.cover_url ? [a.cover_url] : [],
      },
    }
  } catch {
    return {}
  }
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  let article: any
  try {
    article = await api.articles.get(params.slug)
  } catch {
    notFound()
  }

  const comments = await api.articles.comments(params.slug).catch(() => [])

  return (
    <article className="max-w-3xl mx-auto">
      {article.category && <CategoryBadge name={article.category.name} />}
      <h1 className="font-display font-bold text-4xl mt-3 mb-4">{article.title}</h1>

      <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
        {article.author && (
          <span className="font-medium text-gray-700">{article.author.name}</span>
        )}
        {article.published_at && (
          <span>
            {new Date(article.published_at).toLocaleDateString('ru-RU', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        )}
        <span>{article.views} просмотров</span>
      </div>

      {article.cover_url && (
        <div className="relative aspect-video rounded-xl overflow-hidden mb-8">
          <Image src={article.cover_url} alt={article.title} fill className="object-cover" />
        </div>
      )}

      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: article.content || '' }}
      />

      <section className="mt-12 border-t pt-8">
        <h2 className="font-display font-bold text-2xl mb-6">
          Комментарии ({comments.length})
        </h2>
        {comments.map((c: any) => (
          <div key={c.id} className="mb-4 p-4 bg-gray-50 rounded-xl">
            <p className="font-semibold text-sm">{c.author_name}</p>
            <p className="text-sm mt-1">{c.text}</p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(c.created_at).toLocaleDateString('ru-RU')}
            </p>
          </div>
        ))}
        <div className="mt-6">
          <h3 className="font-bold mb-3">Оставить комментарий</h3>
          <CommentForm articleId={article.id} />
        </div>
      </section>
    </article>
  )
}
