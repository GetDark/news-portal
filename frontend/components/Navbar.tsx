'use client'
import Link from 'next/link'
import SearchBar from './SearchBar'

const CATEGORIES = [
  { name: 'AI', slug: 'ai' },
  { name: 'Open Source', slug: 'open-source' },
  { name: 'Стартапы', slug: 'startups' },
  { name: 'Кибербезопасность', slug: 'cybersecurity' },
]

export default function Navbar() {
  return (
    <header className="border-b sticky top-0 bg-white z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="font-display font-bold text-xl text-accent">IT Новости</Link>
          <nav className="hidden md:flex gap-6 text-sm font-medium">
            {CATEGORIES.map(c => (
              <Link key={c.slug} href={`/categories/${c.slug}`} className="hover:text-accent transition-colors">{c.name}</Link>
            ))}
          </nav>
          <SearchBar />
        </div>
      </div>
    </header>
  )
}
