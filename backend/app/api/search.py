from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.models import Article
from app.api.articles import article_to_dict

router = APIRouter(prefix="/api")

@router.get("/search")
async def search(q: str = Query(..., min_length=2), db: AsyncSession = Depends(get_db)):
    stmt = select(Article).options(selectinload(Article.author), selectinload(Article.category))
    stmt = stmt.where(
        Article.status == "published",
        Article.title.ilike(f"%{q}%") | Article.content.ilike(f"%{q}%")
    ).limit(20)
    articles = (await db.scalars(stmt)).all()
    return [article_to_dict(a) for a in articles]
