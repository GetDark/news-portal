import { NextResponse } from 'next/server'

export async function GET() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://backend:8000'}/api/rss`)
  const xml = await res.text()
  return new NextResponse(xml, { headers: { 'Content-Type': 'application/rss+xml' } })
}
