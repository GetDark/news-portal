import { MetadataRoute } from 'next'
import { api } from '@/lib/api'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await api.sitemap().catch(() => [])
  const base = 'https://news.swiftstream.ru'
  const statics: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date() },
    { url: `${base}/articles`, lastModified: new Date() },
    { url: `${base}/about`, lastModified: new Date() },
    { url: `${base}/contacts`, lastModified: new Date() },
  ]
  const dynamic: MetadataRoute.Sitemap = articles.map((a: any) => ({
    url: `${base}/articles/${a.slug}`,
    lastModified: new Date(a.updated),
  }))
  return [...statics, ...dynamic]
}
