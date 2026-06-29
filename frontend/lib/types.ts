export interface Author {
  id: number
  name: string
  bio?: string
  photo_url?: string
}

export interface Category {
  id: number
  name: string
  slug: string
  description?: string
}

export interface Article {
  id: number
  title: string
  slug: string
  excerpt?: string
  cover_url?: string
  views: number
  published_at?: string
  author?: Author
  category?: Category
}

export interface ArticleDetail extends Article {
  content?: string
  seo_title?: string
  seo_description?: string
}

export interface Comment {
  id: number
  author_name: string
  text: string
  created_at: string
}

export interface ArticlesResponse {
  total: number
  page: number
  items: Article[]
}
