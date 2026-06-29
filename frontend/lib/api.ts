const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8006'

async function apiFetch<T>(path: string, options?: RequestInit & { next?: { revalidate?: number } }): Promise<T> {
  const res = await fetch(`${API}${path}`, options)
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

export const api = {
  articles: {
    list: (params = '') => apiFetch<{ total: number; page: number; items: any[] }>(`/api/articles${params}`, { next: { revalidate: 60 } }),
    popular: () => apiFetch<any[]>('/api/articles/popular', { next: { revalidate: 60 } }),
    get: (slug: string) => apiFetch<any>(`/api/articles/${slug}`, { next: { revalidate: 60 } }),
    comments: (slug: string) => apiFetch<any[]>(`/api/articles/${slug}/comments`, { next: { revalidate: 30 } }),
  },
  categories: {
    list: () => apiFetch<any[]>('/api/categories', { next: { revalidate: 300 } }),
    articles: (slug: string) => apiFetch<any[]>(`/api/categories/${slug}/articles`, { next: { revalidate: 60 } }),
  },
  authors: {
    list: () => apiFetch<any[]>('/api/authors', { next: { revalidate: 300 } }),
    articles: (id: number) => apiFetch<any[]>(`/api/authors/${id}/articles`, { next: { revalidate: 60 } }),
  },
  search: (q: string) => fetch(`${API}/api/search?q=${encodeURIComponent(q)}`).then(r => r.json()),
  sitemap: () => apiFetch<any[]>('/api/sitemap'),

  admin: {
    login: (username: string, password: string) =>
      fetch(`${API}/api/admin/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) }).then(r => r.json()),
    articles: (token: string) => apiFetch<any[]>('/api/admin/articles', { headers: { Authorization: `Bearer ${token}` } }),
    getArticle: (id: number, token: string) => apiFetch<any>(`/api/admin/articles/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
    createArticle: (data: any, token: string) => fetch(`${API}/api/admin/articles`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(data) }).then(r => r.json()),
    updateArticle: (id: number, data: any, token: string) => fetch(`${API}/api/admin/articles/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(data) }).then(r => r.json()),
    deleteArticle: (id: number, token: string) => fetch(`${API}/api/admin/articles/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    uploadImage: (file: File, token: string) => { const fd = new FormData(); fd.append('file', file); return fetch(`${API}/api/admin/upload`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd }).then(r => r.json()) },
    categories: (token: string) => apiFetch<any[]>('/api/admin/categories', { headers: { Authorization: `Bearer ${token}` } }),
    createCategory: (data: any, token: string) => fetch(`${API}/api/admin/categories`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(data) }).then(r => r.json()),
    updateCategory: (id: number, data: any, token: string) => fetch(`${API}/api/admin/categories/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(data) }).then(r => r.json()),
    deleteCategory: (id: number, token: string) => fetch(`${API}/api/admin/categories/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    authors: (token: string) => apiFetch<any[]>('/api/admin/authors', { headers: { Authorization: `Bearer ${token}` } }),
    createAuthor: (data: any, token: string) => fetch(`${API}/api/admin/authors`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(data) }).then(r => r.json()),
    updateAuthor: (id: number, data: any, token: string) => fetch(`${API}/api/admin/authors/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(data) }).then(r => r.json()),
    deleteAuthor: (id: number, token: string) => fetch(`${API}/api/admin/authors/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    comments: (token: string) => apiFetch<any[]>('/api/admin/comments', { headers: { Authorization: `Bearer ${token}` } }),
    moderateComment: (id: number, approved: boolean, token: string) => fetch(`${API}/api/admin/comments/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ is_approved: approved }) }).then(r => r.json()),
    deleteComment: (id: number, token: string) => fetch(`${API}/api/admin/comments/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
  }
}
