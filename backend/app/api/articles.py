from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.core.database import get_db
from app.models.models import Article, Author, Category

router = APIRouter(prefix="")

class ArticleOut(BaseModel):
    id: int
    title: str
    slug: str
    excerpt: Optional[str]
    cover_url: Optional[str]
    views: int
    published_at: Optional[datetime]
    author: Optional[dict]
    category: Optional[dict]
    model_config = {"from_attributes": True}

class ArticleDetailOut(ArticleOut):
    content: Optional[str]
    seo_title: Optional[str]
    seo_description: Optional[str]

def article_to_dict(a: Article) -> dict:
    return {
        "id": a.id, "title": a.title, "slug": a.slug,
        "excerpt": a.excerpt, "cover_url": a.cover_url, "views": a.views,
        "published_at": a.published_at,
        "author": {"id": a.author.id, "name": a.author.name, "photo_url": a.author.photo_url} if a.author else None,
        "category": {"id": a.category.id, "name": a.category.name, "slug": a.category.slug} if a.category else None,
    }

def article_detail_dict(a: Article) -> dict:
    d = article_to_dict(a)
    d.update({"content": a.content, "seo_title": a.seo_title, "seo_description": a.seo_description})
    return d

@router.get("/api/articles/popular")
async def popular_articles(db: AsyncSession = Depends(get_db)):
    q = select(Article).options(selectinload(Article.author), selectinload(Article.category))
    q = q.where(Article.status == "published").order_by(Article.views.desc()).limit(5)
    articles = (await db.scalars(q)).all()
    return [article_to_dict(a) for a in articles]

@router.get("/api/articles")
async def list_articles(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    category: Optional[str] = None,
    author: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
):
    q = select(Article).options(selectinload(Article.author), selectinload(Article.category))
    q = q.where(Article.status == "published")
    if category:
        q = q.join(Category).where(Category.slug == category)
    if author:
        q = q.where(Article.author_id == author)
    q = q.order_by(Article.published_at.desc())

    total = await db.scalar(select(func.count()).select_from(q.subquery()))
    articles = (await db.scalars(q.offset((page - 1) * limit).limit(limit))).all()
    return {"total": total, "page": page, "items": [article_to_dict(a) for a in articles]}

@router.get("/api/sitemap")
async def sitemap_data(db: AsyncSession = Depends(get_db)):
    articles = (await db.scalars(
        select(Article).where(Article.status == "published").order_by(Article.published_at.desc())
    )).all()
    return [{"slug": a.slug, "updated": a.updated_at} for a in articles]

@router.get("/api/articles/{slug}")
async def get_article(slug: str, db: AsyncSession = Depends(get_db)):
    q = select(Article).options(selectinload(Article.author), selectinload(Article.category)).where(Article.slug == slug)
    article = await db.scalar(q)
    if not article or article.status != "published":
        from fastapi import HTTPException
        raise HTTPException(404, "Статья не найдена")
    article.views += 1
    await db.commit()
    await db.refresh(article)
    return article_detail_dict(article)
