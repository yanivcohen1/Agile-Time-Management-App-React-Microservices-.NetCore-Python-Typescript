from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from app.auth import verify_password, create_access_token, get_current_user, get_password_hash
from app.models import User

router = APIRouter(prefix="/auth", tags=["auth"])

class Token(BaseModel):
    """Token response model."""
    access_token: str
    token_type: str
    role: str
    name: str

class RegisterRequest(BaseModel):
    email: str
    full_name: str
    password: str

@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await User.find_one(User.email == form_data.username)
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "name": user.full_name
    }

@router.post("/register", response_model=Token)
async def register_user(request: RegisterRequest):
    # Check if user already exists
    existing_user = await User.find_one(User.email == request.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # Create new user with role "user"
    hashed_password = get_password_hash(request.password)
    user = User(
        email=request.email,
        full_name=request.full_name,
        password_hash=hashed_password,
        role="user"
    )
    await user.insert()
    
    # Create access token
    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "name": user.full_name
    }

@router.get("/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/users", response_model=List[User])
async def read_users(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return await User.find_all().to_list()

