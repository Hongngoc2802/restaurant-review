from typing import Optional
from pydantic import BaseModel


class RestaurantMapItem(BaseModel):
    place_id: str
    name: str
    rating: Optional[float] = None
    reviews_count: Optional[int] = None
    main_category: Optional[str] = None
    latitude: float
    longitude: float
    featured_image: Optional[str] = None
    address: Optional[str] = None


class RestaurantDetail(BaseModel):
    place_id: str
    name: str
    description: Optional[str] = None
    rating: Optional[float] = None
    reviews_count: Optional[int] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    main_category: Optional[str] = None
    categories: list[str] = []
    featured_image: Optional[str] = None
    workday_timing: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class ReviewItem(BaseModel):
    id: Optional[str] = None
    reviewer_name: Optional[str] = None
    rating: Optional[float] = None
    content: Optional[str] = None
    review_date: Optional[str] = None


class ReviewsResponse(BaseModel):
    total: int
    items: list[ReviewItem]
