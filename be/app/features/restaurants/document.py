from datetime import datetime
from typing import Optional
from beanie import Document, Indexed
from pydantic import Field
from pymongo import IndexModel, GEOSPHERE, ASCENDING


class GeoPoint(dict):
    pass


class Restaurant(Document):
    place_id: Indexed(str, unique=True)
    name: str
    description: Optional[str] = None
    rating: Optional[float] = None
    reviews_count: Optional[int] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    main_category: Optional[str] = None
    categories: list[str] = Field(default_factory=list)
    featured_image: Optional[str] = None
    workday_timing: Optional[str] = None
    query: Optional[str] = None
    location: Optional[dict] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "restaurants"
        indexes = [
            IndexModel([("place_id", ASCENDING)], unique=True),
            IndexModel([("location", GEOSPHERE)]),
            IndexModel([("rating", ASCENDING)]),
        ]


class RestaurantReview(Document):
    place_id: str
    reviewer_name: Optional[str] = None
    rating: Optional[float] = None
    content: Optional[str] = None
    review_date: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "restaurant_reviews"
        indexes = [
            IndexModel([("place_id", ASCENDING)]),
            IndexModel([("rating", ASCENDING)]),
        ]
