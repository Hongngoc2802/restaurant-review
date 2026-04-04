from app.features.restaurants.document import Restaurant, RestaurantReview
from typing import Optional


async def get_restaurants_for_map(
    min_lat: Optional[float] = None,
    max_lat: Optional[float] = None,
    min_lng: Optional[float] = None,
    max_lng: Optional[float] = None,
) -> list[Restaurant]:
    queries = [
        Restaurant.latitude != None,
        Restaurant.longitude != None,
    ]
    if min_lat is not None:
        queries.append(Restaurant.latitude >= min_lat)
    if max_lat is not None:
        queries.append(Restaurant.latitude <= max_lat)
    if min_lng is not None:
        queries.append(Restaurant.longitude >= min_lng)
    if max_lng is not None:
        queries.append(Restaurant.longitude <= max_lng)

    return await Restaurant.find(*queries).limit(500).to_list()


async def get_restaurant_by_place_id(place_id: str) -> Optional[Restaurant]:
    return await Restaurant.find_one(Restaurant.place_id == place_id)


async def get_reviews_by_place_id(place_id: str, skip: int = 0, limit: int = 20) -> list[RestaurantReview]:
    return await RestaurantReview.find(
        RestaurantReview.place_id == place_id
    ).skip(skip).limit(limit).to_list()


async def count_reviews(place_id: str) -> int:
    return await RestaurantReview.find(RestaurantReview.place_id == place_id).count()


async def get_top_restaurants(limit: int = 10) -> list[Restaurant]:
    return await Restaurant.find(
        Restaurant.rating != None,
        Restaurant.latitude != None,
        Restaurant.longitude != None,
    ).sort(-Restaurant.rating).limit(limit).to_list()


async def get_nearby_restaurants(
    lat: float,
    lng: float,
    radius_km: float = 3.0,
    limit: int = 10,
) -> list[Restaurant]:
    delta_lat = radius_km / 111.0
    delta_lng = radius_km / (111.0 * abs(max(0.01, lat)))
    return await Restaurant.find(
        Restaurant.latitude >= lat - delta_lat,
        Restaurant.latitude <= lat + delta_lat,
        Restaurant.longitude >= lng - delta_lng,
        Restaurant.longitude <= lng + delta_lng,
        Restaurant.latitude != None,
        Restaurant.longitude != None,
    ).sort(-Restaurant.rating).limit(limit).to_list()
