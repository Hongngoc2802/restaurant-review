from typing import Any
import secrets

from app.core.security import create_access_token
from app.core.config import settings
from app.features.users.document import User
from app.features.users.schemas import UserResponse
from app.features.auth.google_service import verify_google_id_token


def _make_token(user: User) -> dict[str, Any]:
    return {
        "access_token": create_access_token({"sub": str(user.id), "email": user.email}),
        "token_type": "bearer",
        "expires_in": settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    }


async def google_login_service(credential: str) -> dict[str, Any]:
    info = verify_google_id_token(credential)
    email = info.get("email")
    google_id = info.get("sub")
    full_name = info.get("name", "")
    avatar_url = info.get("picture")

    user = await User.find_one({"$or": [{"google_id": google_id}, {"email": email}]})
    if not user:
        user = User(
            full_name=full_name,
            email=email,
            google_id=google_id,
            avatar_url=avatar_url,
            username=email.split("@")[0] + "_" + secrets.token_hex(3),
            is_verified=True,
        )
        await user.insert()
    elif not user.google_id:
        user.google_id = google_id
        if not user.avatar_url:
            user.avatar_url = avatar_url
        await user.save()

    return {**_make_token(user), "user": UserResponse.from_document(user)}
