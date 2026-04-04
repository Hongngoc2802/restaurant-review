from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from google.auth import exceptions as google_exceptions
from typing import Any
import logging

from app.core.config import settings
from app.shared.exceptions import UnauthorizedException

logger = logging.getLogger(__name__)


def verify_google_id_token(credential: str) -> dict[str, Any]:
    if not settings.GOOGLE_CLIENT_ID:
        raise UnauthorizedException("GOOGLE_CLIENT_ID is not configured")
    try:
        payload = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )
        logger.info(f"[GOOGLE AUTH] OK — email={payload.get('email')}, sub={payload.get('sub')}")
        return payload
    except ValueError as e:
        print(f"[DEBUG GOOGLE AUTH] ValueError: {e}")
        raise UnauthorizedException(f"Invalid Google token: {e}")
    except google_exceptions.TransportError as e:
        print(f"[DEBUG GOOGLE AUTH] TransportError: {e}")
        raise UnauthorizedException("Could not authenticate with Google, try again later")
    except Exception as e:
        print(f"[DEBUG GOOGLE AUTH] Unexpected: {type(e).__name__}: {e}")
        raise UnauthorizedException("Google authentication error")
