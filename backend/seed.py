import asyncio
from datetime import datetime, timedelta
from app.core.database import engine, Base, SessionLocal
from app.core.auth import hash_password
from app.models.models import Admin, Author, Category, Tag, Article, ArticleTag, Comment

ARTICLES = [
    ("ChatGPT-5 установил новый рекорд на бенчмарках", "ai", 0,
     "OpenAI выпустила GPT-5, который превзошёл все предыдущие модели на стандартных тестах рассуждения и кода.",
     "<p>OpenAI официально анонсировала ChatGPT-5...</p><p>Модель показала результаты на 23% выше GPT-4 на бенчмарке MMLU.</p>"),
    ("Rust обгоняет C++ в новом исследовании производительности", "open-source", 1,
     "Университет Мюнхена провёл масштабное сравнение Rust и C++ на задачах системного программирования.",
     "<p>Результаты исследования удивили многих разработчиков...</p><p>Rust показал на 12% лучшую пропускную способность в многопоточных сценариях.</p>"),
    ("YC Batch W26: 10 стартапов которые изменят рынок", "startups", 2,
     "Y Combinator объявил финалистов зимнего набора 2026 — среди них три AI-стартапа из России.",
     "<p>Y Combinator W26 стал рекордным по числу заявок...</p>"),
    ("Критическая уязвимость в OpenSSL: что делать прямо сейчас", "cybersecurity", 0,
     "В OpenSSL 3.x обнаружена уязвимость CVE-2026-1234, позволяющая удалённое выполнение кода. Патч уже доступен.",
     "<p>Команда безопасности OpenSSL выпустила экстренное обновление...</p><p>Уязвимость затрагивает версии 3.0–3.3.</p>"),
    ("Next.js 15: что нового в главном React-фреймворке", "open-source", 1,
     "Vercel выпустила Next.js 15 с улучшенным App Router, новым компилятором и поддержкой React 19.",
     "<p>Next.js 15 — это самый большой релиз за последние два года...</p>"),
    ("Как стартап из Казани привлёк $2M без единого питча", "startups", 2,
     "История Devboard.io — инструмента для командного code review, который вырос с 0 до 50k пользователей за 8 месяцев.",
     "<p>Никита Соколов и его команда никогда не выступали на Demo Day...</p>"),
    ("Google DeepMind решила задачу сворачивания РНК", "ai", 0,
     "AlphaFold 3 распространяется на РНК-структуры, открывая новые возможности для разработки лекарств.",
     "<p>DeepMind продолжает расширять возможности AlphaFold...</p>"),
    ("Phishing 2.0: атаки с использованием голосового клонирования", "cybersecurity", 0,
     "Группа Lazarus использует синтезированные голоса топ-менеджеров для обхода корпоративных проверок.",
     "<p>Новая волна атак использует AI-клонирование голоса...</p>"),
    ("PostgreSQL 17: партиционирование стало в 3 раза быстрее", "open-source", 1,
     "Команда PostgreSQL представила версию 17 с революционными улучшениями планировщика запросов.",
     "<p>PostgreSQL 17 прошёл публичное бета-тестирование и официально выпущен...</p>"),
    ("Венчурный рынок России 2026: итоги первого полугодия", "startups", 2,
     "Аналитики насчитали 127 сделок на $340M — рекорд за последние 4 года.",
     "<p>Несмотря на макроэкономические сложности, венчурный рынок показал рост...</p>"),
]

CATEGORIES = [
    ("AI", "ai", "Искусственный интеллект, нейросети, LLM"),
    ("Open Source", "open-source", "Открытое ПО, фреймворки, инструменты"),
    ("Стартапы", "startups", "Венчур, продукты, истории основателей"),
    ("Кибербезопасность", "cybersecurity", "Уязвимости, защита, инциденты"),
]

AUTHORS = [
    ("Алексей Петров", "Tech-журналист, 8 лет в IT-медиа. Специализируется на AI и облачных технологиях.",
     "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop"),
    ("Мария Соколова", "Разработчик-евангелист. Open source контрибьютор, спикер конференций.",
     "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop"),
    ("Дмитрий Крылов", "Аналитик венчурного рынка, ex-сотрудник ФРИИ.",
     "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop"),
]

COVERS = [
    "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=450&fit=crop",
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=450&fit=crop",
    "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=450&fit=crop",
    "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=450&fit=crop",
    "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&h=450&fit=crop",
]


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with SessionLocal() as db:
        from sqlalchemy import select
        existing = await db.scalar(select(Admin).where(Admin.username == "admin"))
        if existing:
            print("Already seeded")
            return

        admin = Admin(username="admin", password_hash=hash_password("admin123"))
        db.add(admin)

        cats = {}
        for name, slug, desc in CATEGORIES:
            c = Category(name=name, slug=slug, description=desc)
            db.add(c)
            cats[slug] = c
        await db.flush()

        authors = []
        for name, bio, photo in AUTHORS:
            a = Author(name=name, bio=bio, photo_url=photo)
            db.add(a)
            authors.append(a)
        await db.flush()

        for i, (title, cat_slug, author_idx, excerpt, content) in enumerate(ARTICLES):
            from slugify import slugify
            article = Article(
                title=title,
                slug=slugify(title),
                excerpt=excerpt,
                content=content,
                cover_url=COVERS[i % len(COVERS)],
                author_id=authors[author_idx].id,
                category_id=cats[cat_slug].id,
                status="published",
                views=int(100 + i * 37 + (i % 3) * 150),
                published_at=datetime.utcnow() - timedelta(days=i * 2),
            )
            db.add(article)
        await db.flush()

        from sqlalchemy import select as sel
        articles = (await db.scalars(sel(Article))).all()
        comments_data = [
            (articles[0].id, "Иван К.", "Наконец-то! Ждал GPT-5 целый год."),
            (articles[0].id, "techfan_ru", "Интересно, как это повлияет на рынок труда разработчиков."),
            (articles[3].id, "sysadmin99", "Уже обновился. Спасибо за оперативное оповещение!"),
            (articles[4].id, "frontend_dev", "Next.js 15 просто огонь, особенно новый компилятор."),
            (articles[8].id, "dba_pro", "PostgreSQL 17 действительно быстрее. Проверил на своих запросах."),
        ]
        for article_id, name, text in comments_data:
            db.add(Comment(article_id=article_id, author_name=name, text=text, is_approved=True))

        await db.commit()
        print("Seed complete: admin/admin123, 4 categories, 3 authors, 10 articles, 5 comments")


asyncio.run(seed())
