from typing import Optional

from app.core.security import hash_password
from app.features.users.document import User
from app.shared.exceptions import ConflictException


async def get_user_by_email(email: str) -> Optional[User]:
    return await User.find_one(User.email == email)


async def create_user(data: dict) -> User:
    existing = await get_user_by_email(data["email"])
    if existing:
        raise ConflictException("Email already in use")

    user = User(
        full_name=data["full_name"],
        email=data["email"],
        password=hash_password(data["password"]),
        phone_number=data.get("phone_number"),
    )
    await user.insert()
    return user
