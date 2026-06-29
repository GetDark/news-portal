'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getToken } from '@/lib/adminAuth'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    if (getToken()) {
      setAuthorized(true)
    } else {
      router.push('/admin')
    }
  }, [router])

  if (!authorized) return null

  return <>{children}</>
}
