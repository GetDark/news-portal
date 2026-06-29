import Link from 'next/link'
import Image from 'next/image'
import CategoryBadge from './CategoryBadge'
import type { Article } from '@/lib/types'

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      {article.cover_url && (
        <div className="relative aspect-video">
          <Image src={article.cover_url} alt={article.title} fill className="object-cover" />
        </div>
      )}
      <div className="p-4">
        {article.category && <CategoryBadge name={article.category.name} />}
        <Link href={`/articles/${article.slug}`}>
          <h2 className="font-display font-bold text-lg mt-2 hover:text-accent transition-colors line-clamp-2">
            {article.title}
          </h2>
        </Link>
        {article.excerpt && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{article.excerpt}</p>}
        <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
          {article.author && <span>{article.author.name}</span>}
          {article.published_at && <span>{new Date(article.published_at).toLocaleDateString('ru-RU')}</span>}
          <span>{article.views} просмотров</span>
        </div>
      </div>
    </article>
  )
}
