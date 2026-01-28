from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import ssl

DATABASE_URL = (
    "postgresql+asyncpg://neondb_owner:npg_Wge7Yjlq5owZ"
    "@ep-frosty-meadow-aho4wo4u-pooler.c-3.us-east-1.aws.neon.tech"
    "/neondb"
)

ssl_context = ssl.create_default_context()

engine = create_async_engine(
    DATABASE_URL,
    echo=True,
    connect_args={
        "ssl": ssl_context
    }
)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
