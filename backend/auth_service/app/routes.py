from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.models import User
from app.auth import hash_password, verify_password, create_access_token
from app.schemas import RegisterRequest
from app.schemas import LoginRequest


router = APIRouter()

@router.post("/check")
def check():
    print("login endpoint check hehe")

@router.post("/register")
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar():
        raise HTTPException(400, "User exists")

    user = User(
        email=data.email,
        password_hash=hash_password(data.password)
    )
    db.add(user)
    await db.commit()
    return {"message": "User created"}


@router.post("/login")
async def login(
    data: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(401, "Invalid credentials")

    token = create_access_token({"sub": str(user.id)})
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True
    )

    return {"message": "Logged in"}
