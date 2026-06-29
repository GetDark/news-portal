from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
from app.core.database import get_db
from app.models.models import Comment, Article

router = APIRouter(prefix="/api")

class CommentIn(BaseModel):
    article_id: int
    author_name: str
    author_email: Optional[str] = None
    text: str

@router.post("/comments")
async def post_comment(data: CommentIn, db: AsyncSession = Depends(get_db)):
    article = await db.get(Article, data.article_id)
    if not article or article.status != "published":
        raise HTTPException(404, "Статья не найдена")
    comment = Comment(**data.model_dump(), is_approved=False)
    db.add(comment)
    await db.commit()
    return {"ok": True, "message": "Комментарий отправлен на модерацию"}

@router.get("/articles/{slug}/comments")
async def article_comments(slug: str, db: AsyncSession = Depends(get_db)):
    article = await db.scalar(select(Article).where(Article.slug == slug))
    if not article:
        raise HTTPException(404)
    comments = (await db.scalars(
        select(Comment).where(Comment.article_id == article.id, Comment.is_approved == True)
        .order_by(Comment.created_at)
    )).all()
    return [{"id": c.id, "author_name": c.author_name, "text": c.text, "created_at": c.created_at} for c in comments]
