'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SearchBar() {
  const [q, setQ] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (q.length < 2) return
    const t = setTimeout(() => router.push(`/articles?search=${encodeURIComponent(q)}`), 500)
    return () => clearTimeout(t)
  }, [q, router])

  return (
    <input
      value={q}
      onChange={e => setQ(e.target.value)}
      placeholder="Поиск..."
      className="border rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-accent/30"
    />
  )
}
