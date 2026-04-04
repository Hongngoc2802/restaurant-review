from fastapi import APIRouter

from app.features.auth.schemas import TokenResponse, GoogleLoginRequest
from app.features.auth.service import google_login_service

router = APIRouter()

@router.post("/google", response_model=TokenResponse)
async def google_login(body: GoogleLoginRequest):
    return await google_login_service(body.credential)
