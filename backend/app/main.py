from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.database import engine, Base
from app.api import articles, categories, authors, comments, search, rss, admin

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(title="News API", lifespan=lifespan)

origins = os.getenv("ALLOWED_ORIGINS", "https://news.swiftstream.ru").split(",")
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

app.mount("/uploads", StaticFiles(directory=os.getenv("UPLOAD_DIR", "/app/uploads")), name="uploads")

app.include_router(articles.router)
app.include_router(categories.router)
app.include_router(authors.router)
app.include_router(comments.router)
app.include_router(search.router)
app.include_router(rss.router)
app.include_router(admin.router)

@app.get("/api/health")
async def health():
    return {"status": "ok"}
