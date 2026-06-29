'use client'
import { useRouter, useSearchParams } from 'next/navigation'

export default function Pagination({ page, total, limit }: { page: number; total: number; limit: number }) {
  const router = useRouter()
  const params = useSearchParams()
  const totalPages = Math.ceil(total / limit)
  if (totalPages <= 1) return null

  const go = (p: number) => {
    const sp = new URLSearchParams(params.toString())
    sp.set('page', String(p))
    router.push(`?${sp}`)
  }

  return (
    <div className="flex gap-2 justify-center mt-8">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
        <button
          key={p}
          onClick={() => go(p)}
          className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-accent text-white' : 'border hover:border-accent hover:text-accent'}`}
        >
          {p}
        </button>
      ))}
    </div>
  )
}
