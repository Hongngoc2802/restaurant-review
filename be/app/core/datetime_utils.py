from datetime import datetime, date

DATE_FORMAT = "%d/%m/%Y"
DATETIME_FORMAT = "%d/%m/%Y %H:%M"


def parse_date(value: str) -> date:
    try:
        return datetime.strptime(value, DATE_FORMAT).date()
    except ValueError as e:
        raise ValueError(f"Invalid date format. Expected dd/MM/yyyy, got: {value}") from e


def parse_datetime(value: str) -> datetime:
    try:
        return datetime.strptime(value, DATETIME_FORMAT)
    except ValueError as e:
        raise ValueError(f"Invalid datetime format. Expected dd/MM/yyyy HH:mm, got: {value}") from e


def format_date(value: date | datetime | None) -> str | None:
    if value is None:
        return None
    return value.strftime(DATE_FORMAT)


def format_datetime(value: datetime | None) -> str | None:
    if value is None:
        return None
    return value.strftime(DATETIME_FORMAT)
