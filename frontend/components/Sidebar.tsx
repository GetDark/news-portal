import Link from 'next/link'
import type { Article } from '@/lib/types'

export default function Sidebar({ popular }: { popular: Article[] }) {
  return (
    <aside className="w-full md:w-72 shrink-0">
      <h3 className="font-display font-bold text-lg mb-4 border-b pb-2">Популярное</h3>
      <ol className="space-y-4">
        {popular.map((a, i) => (
          <li key={a.id} className="flex gap-3">
            <span className="font-display font-bold text-2xl text-gray-200 shrink-0 w-6">{i + 1}</span>
            <Link href={`/articles/${a.slug}`} className="text-sm font-medium hover:text-accent line-clamp-3">
              {a.title}
            </Link>
          </li>
        ))}
      </ol>
    </aside>
  )
}
