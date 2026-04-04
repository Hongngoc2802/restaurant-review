import json
from datetime import datetime, date
from fastapi.responses import JSONResponse

from app.core.datetime_utils import DATE_FORMAT, DATETIME_FORMAT


class _AppEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.strftime(DATETIME_FORMAT)
        if isinstance(obj, date):
            return obj.strftime(DATE_FORMAT)
        return super().default(obj)


class AppJSONResponse(JSONResponse):
    def render(self, content) -> bytes:
        return json.dumps(content, cls=_AppEncoder, ensure_ascii=False, allow_nan=False).encode("utf-8")
