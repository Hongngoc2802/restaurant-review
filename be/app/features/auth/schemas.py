from pydantic import BaseModel
from typing import Any


class GoogleLoginRequest(BaseModel):
    credential: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: Any  # Replaced with standard dict or UserResponse below
