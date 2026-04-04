from beanie import Document
from pymongo import IndexModel, ASCENDING
from pydantic import Field
from datetime import datetime
from typing import Optional

class User(Document):
    full_name: str
    email: str
    phone_number: Optional[str] = None
    password: Optional[str] = None
    role: str = "user"
    avatar_url: Optional[str] = None
    google_id: Optional[str] = None
    username: Optional[str] = None
    is_verified: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"
        indexes = [
            IndexModel([("email", ASCENDING)], unique=True),
            IndexModel([("google_id", ASCENDING)], unique=True, partialFilterExpression={"google_id": {"$exists": True}}),
            IndexModel([("username", ASCENDING)], unique=True, partialFilterExpression={"username": {"$exists": True}}),
        ]
