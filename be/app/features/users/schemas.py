from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    phone_number: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    full_name: str
    email: str
    phone_number: Optional[str] = None
    role: str
    avatar_url: Optional[str] = None
    google_id: Optional[str] = None
    username: Optional[str] = None
    is_verified: bool
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_document(cls, user) -> "UserResponse":
        return cls(
            id=str(user.id),
            full_name=user.full_name,
            email=user.email,
            phone_number=user.phone_number,
            role=user.role,
            avatar_url=user.avatar_url,
            google_id=user.google_id,
            username=user.username,
            is_verified=user.is_verified,
            created_at=user.created_at,
            updated_at=user.updated_at,
        )
