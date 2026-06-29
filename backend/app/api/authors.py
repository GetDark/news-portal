from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.models import Author, Article
from app.api.articles import article_to_dict

router = APIRouter(prefix="")

@router.get("/api/authors")
async def list_authors(db: AsyncSession = Depends(get_db)):
    authors = (await db.scalars(select(Author))).all()
    return [{"id": a.id, "name": a.name, "bio": a.bio, "photo_url": a.photo_url} for a in authors]

@router.get("/api/authors/{author_id}/articles")
async def author_articles(author_id: int, db: AsyncSession = Depends(get_db)):
    q = select(Article).options(selectinload(Article.author), selectinload(Article.category))
    q = q.where(Article.author_id == author_id, Article.status == "published")
    q = q.order_by(Article.published_at.desc())
    articles = (await db.scalars(q)).all()
    return [article_to_dict(a) for a in articles]
