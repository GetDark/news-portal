from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.models import Article

router = APIRouter(prefix="/api")

@router.get("/rss")
async def rss_feed(db: AsyncSession = Depends(get_db)):
    articles = (await db.scalars(
        select(Article).where(Article.status == "published")
        .order_by(Article.published_at.desc()).limit(20)
    )).all()

    items = ""
    for a in articles:
        items += f"""
        <item>
            <title><![CDATA[{a.title}]]></title>
            <link>https://news.swiftstream.ru/articles/{a.slug}</link>
            <description><![CDATA[{a.excerpt or ""}]]></description>
            <pubDate>{a.published_at.strftime("%a, %d %b %Y %H:%M:%S +0000") if a.published_at else ""}</pubDate>
            <guid>https://news.swiftstream.ru/articles/{a.slug}</guid>
        </item>"""

    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>IT Новости — SwiftStream</title>
    <link>https://news.swiftstream.ru</link>
    <description>Последние новости IT и технологий</description>
    <language>ru</language>
    {items}
  </channel>
</rss>"""
    return Response(content=xml, media_type="application/rss+xml")
