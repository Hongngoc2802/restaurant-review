from typing import Annotated, Optional
from pydantic import BeforeValidator
from app.core.datetime_utils import parse_date


def _validate_date_str(v: Optional[str]) -> Optional[str]:
    if v is None:
        return None
    parse_date(v)
    return v


DateStr = Annotated[Optional[str], BeforeValidator(_validate_date_str)]
