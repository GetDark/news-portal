from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import os, aiofiles, uuid
from slugify import slugify

from app.core.database import get_db
from app.core.auth import get_current_admin, verify_password, hash_password, create_access_token
from app.models.models import Admin, Article, Category, Author, Comment

router = APIRouter(prefix="/api/admin")

# --- Auth ---
class LoginIn(BaseModel):
    username: str
    password: str

@router.post("/login")
async def login(data: LoginIn, db: AsyncSession = Depends(get_db)):
    admin = await db.scalar(select(Admin).where(Admin.username == data.username))
    if not admin or not verify_password(data.password, admin.password_hash):
        raise HTTPException(401, "Неверный логин или пароль")
    return {"access_token": create_access_token(admin.id), "token_type": "bearer"}

# --- Upload ---
@router.post("/upload")
async def upload_cover(file: UploadFile = File(...), admin=Depends(get_current_admin)):
    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(os.getenv("UPLOAD_DIR", "/app/uploads"), filename)
    async with aiofiles.open(path, "wb") as f:
        await f.write(await file.read())
    return {"url": f"/uploads/{filename}"}

# --- Articles ---
class ArticleIn(BaseModel):
    title: str
    content: Optional[str] = None
    excerpt: Optional[str] = None
    cover_url: Optional[str] = None
    author_id: Optional[int] = None
    category_id: Optional[int] = None
    status: str = "draft"
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None

@router.get("/articles")
async def admin_articles(db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    articles = (await db.scalars(select(Article).order_by(Article.created_at.desc()))).all()
    return [{"id": a.id, "title": a.title, "slug": a.slug, "status": a.status,
             "views": a.views, "created_at": a.created_at} for a in articles]

@router.post("/articles")
async def create_article(data: ArticleIn, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    slug = slugify(data.title)
    existing = await db.scalar(select(Article).where(Article.slug == slug))
    if existing:
        slug = f"{slug}-{uuid.uuid4().hex[:6]}"
    article = Article(**data.model_dump(), slug=slug,
                      published_at=datetime.utcnow() if data.status == "published" else None)
    db.add(article)
    await db.commit()
    await db.refresh(article)
    return {"id": article.id, "slug": article.slug}

@router.get("/articles/{article_id}")
async def get_admin_article(article_id: int, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    article = await db.get(Article, article_id)
    if not article:
        raise HTTPException(404)
    return {c.name: getattr(article, c.name) for c in Article.__table__.columns}

@router.put("/articles/{article_id}")
async def update_article(article_id: int, data: ArticleIn, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    article = await db.get(Article, article_id)
    if not article:
        raise HTTPException(404)
    for k, v in data.model_dump().items():
        setattr(article, k, v)
    if data.status == "published" and not article.published_at:
        article.published_at = datetime.utcnow()
    await db.commit()
    return {"ok": True}

@router.delete("/articles/{article_id}")
async def delete_article(article_id: int, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    article = await db.get(Article, article_id)
    if not article:
        raise HTTPException(404)
    await db.delete(article)
    await db.commit()
    return {"ok": True}

# --- Categories ---
class CategoryIn(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None

@router.get("/categories")
async def admin_categories(db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    cats = (await db.scalars(select(Category))).all()
    return [{"id": c.id, "name": c.name, "slug": c.slug} for c in cats]

@router.post("/categories")
async def create_category(data: CategoryIn, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    cat = Category(**data.model_dump())
    db.add(cat)
    await db.commit()
    await db.refresh(cat)
    return {"id": cat.id}

@router.put("/categories/{cat_id}")
async def update_category(cat_id: int, data: CategoryIn, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    cat = await db.get(Category, cat_id)
    if not cat:
        raise HTTPException(404)
    for k, v in data.model_dump().items():
        setattr(cat, k, v)
    await db.commit()
    return {"ok": True}

@router.delete("/categories/{cat_id}")
async def delete_category(cat_id: int, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    cat = await db.get(Category, cat_id)
    if not cat:
        raise HTTPException(404)
    await db.delete(cat)
    await db.commit()
    return {"ok": True}

# --- Authors ---
class AuthorIn(BaseModel):
    name: str
    bio: Optional[str] = None
    photo_url: Optional[str] = None

@router.get("/authors")
async def admin_authors(db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    authors = (await db.scalars(select(Author))).all()
    return [{"id": a.id, "name": a.name, "bio": a.bio, "photo_url": a.photo_url} for a in authors]

@router.post("/authors")
async def create_author(data: AuthorIn, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    author = Author(**data.model_dump())
    db.add(author)
    await db.commit()
    await db.refresh(author)
    return {"id": author.id}

@router.put("/authors/{author_id}")
async def update_author(author_id: int, data: AuthorIn, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    author = await db.get(Author, author_id)
    if not author:
        raise HTTPException(404)
    for k, v in data.model_dump().items():
        setattr(author, k, v)
    await db.commit()
    return {"ok": True}

@router.delete("/authors/{author_id}")
async def delete_author(author_id: int, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    author = await db.get(Author, author_id)
    if not author:
        raise HTTPException(404)
    await db.delete(author)
    await db.commit()
    return {"ok": True}

# --- Comments ---
@router.get("/comments")
async def admin_comments(db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    comments = (await db.scalars(select(Comment).order_by(Comment.created_at.desc()))).all()
    return [{"id": c.id, "article_id": c.article_id, "author_name": c.author_name,
             "text": c.text, "is_approved": c.is_approved, "created_at": c.created_at} for c in comments]

@router.put("/comments/{comment_id}")
async def moderate_comment(comment_id: int, body: dict, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    comment = await db.get(Comment, comment_id)
    if not comment:
        raise HTTPException(404)
    comment.is_approved = body.get("is_approved", False)
    await db.commit()
    return {"ok": True}

@router.delete("/comments/{comment_id}")
async def delete_comment(comment_id: int, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    comment = await db.get(Comment, comment_id)
    if not comment:
        raise HTTPException(404)
    await db.delete(comment)
    await db.commit()
    return {"ok": True}
