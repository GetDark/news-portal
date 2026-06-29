from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.models import Category, Article
from app.api.articles import article_to_dict

router = APIRouter(prefix="")

@router.get("/api/categories")
async def list_categories(db: AsyncSession = Depends(get_db)):
    cats = (await db.scalars(select(Category))).all()
    return [{"id": c.id, "name": c.name, "slug": c.slug, "description": c.description} for c in cats]

@router.get("/api/categories/{slug}/articles")
async def category_articles(slug: str, db: AsyncSession = Depends(get_db)):
    q = select(Article).options(selectinload(Article.author), selectinload(Article.category))
    q = q.join(Category).where(Category.slug == slug, Article.status == "published")
    q = q.order_by(Article.published_at.desc())
    articles = (await db.scalars(q)).all()
    return [article_to_dict(a) for a in articles]
