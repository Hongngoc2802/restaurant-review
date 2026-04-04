from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from app.features.restaurants.repository import (
    get_restaurants_for_map,
    get_restaurant_by_place_id,
    get_reviews_by_place_id,
    count_reviews,
    get_top_restaurants,
    get_nearby_restaurants,
)
from app.features.restaurants.schema import (
    RestaurantMapItem,
    RestaurantDetail,
    ReviewsResponse,
    ReviewItem,
)

router = APIRouter()


@router.get("/map", response_model=list[RestaurantMapItem])
async def list_restaurants_for_map(
    min_lat: Optional[float] = Query(None),
    max_lat: Optional[float] = Query(None),
    min_lng: Optional[float] = Query(None),
    max_lng: Optional[float] = Query(None),
):
    docs = await get_restaurants_for_map(
        min_lat=min_lat,
        max_lat=max_lat,
        min_lng=min_lng,
        max_lng=max_lng,
    )
    return [
        RestaurantMapItem(
            place_id=d.place_id,
            name=d.name,
            rating=d.rating,
            reviews_count=d.reviews_count,
            main_category=d.main_category,
            latitude=d.latitude,
            longitude=d.longitude,
            featured_image=d.featured_image,
            address=d.address,
        )
        for d in docs
    ]


@router.get("/top", response_model=list[RestaurantMapItem])
async def list_top_restaurants(limit: int = Query(10, ge=1, le=50)):
    docs = await get_top_restaurants(limit=limit)
    return [
        RestaurantMapItem(
            place_id=d.place_id,
            name=d.name,
            rating=d.rating,
            reviews_count=d.reviews_count,
            main_category=d.main_category,
            latitude=d.latitude,
            longitude=d.longitude,
            featured_image=d.featured_image,
            address=d.address,
        )
        for d in docs
    ]


@router.get("/nearby", response_model=list[RestaurantMapItem])
async def list_nearby_restaurants(
    lat: float = Query(...),
    lng: float = Query(...),
    radius_km: float = Query(3.0, ge=0.5, le=20),
    limit: int = Query(200, ge=1, le=500),
):
    docs = await get_nearby_restaurants(lat=lat, lng=lng, radius_km=radius_km, limit=limit)
    return [
        RestaurantMapItem(
            place_id=d.place_id,
            name=d.name,
            rating=d.rating,
            reviews_count=d.reviews_count,
            main_category=d.main_category,
            latitude=d.latitude,
            longitude=d.longitude,
            featured_image=d.featured_image,
            address=d.address,
        )
        for d in docs
    ]


@router.get("/{place_id}", response_model=RestaurantDetail)
async def get_restaurant(place_id: str):
    doc = await get_restaurant_by_place_id(place_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return RestaurantDetail(
        place_id=doc.place_id,
        name=doc.name,
        description=doc.description,
        rating=doc.rating,
        reviews_count=doc.reviews_count,
        address=doc.address,
        phone=doc.phone,
        website=doc.website,
        main_category=doc.main_category,
        categories=doc.categories,
        featured_image=doc.featured_image,
        workday_timing=doc.workday_timing,
        latitude=doc.latitude,
        longitude=doc.longitude,
    )


@router.get("/{place_id}/reviews", response_model=ReviewsResponse)
async def get_reviews(place_id: str, skip: int = Query(0, ge=0), limit: int = Query(20, ge=1, le=100)):
    total = await count_reviews(place_id)
    items = await get_reviews_by_place_id(place_id, skip=skip, limit=limit)
    return ReviewsResponse(
        total=total,
        items=[
            ReviewItem(
                id=str(item.id),
                reviewer_name=item.reviewer_name,
                rating=item.rating,
                content=item.content,
                review_date=item.review_date,
            )
            for item in items
        ],
    )
