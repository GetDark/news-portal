export const dynamic = 'force-dynamic'

export async function GET() {
  const backendUrl = process.env.BACKEND_URL || 'http://backend:8000'
  try {
    const res = await fetch(`${backendUrl}/api/rss`)
    const xml = await res.text()
    return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml' } })
  } catch {
    return new Response('<?xml version="1.0"?><rss version="2.0"><channel></channel></rss>', {
      headers: { 'Content-Type': 'application/rss+xml' },
    })
  }
}
