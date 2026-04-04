const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

export interface RestaurantMapItem {
    place_id: string
    name: string
    rating: number | null
    reviews_count: number | null
    main_category: string | null
    latitude: number
    longitude: number
    featured_image: string | null
    address: string | null
}

export interface RestaurantDetail extends RestaurantMapItem {
    description: string | null
    phone: string | null
    website: string | null
    categories: string[]
    workday_timing: string | null
}

export interface ReviewItem {
    id: string | null
    reviewer_name: string | null
    rating: number | null
    content: string | null
    review_date: string | null
}

export interface ReviewsResponse {
    total: number
    items: ReviewItem[]
}

export interface MapBounds {
    min_lat: number
    max_lat: number
    min_lng: number
    max_lng: number
}

export const fetchMapRestaurants = async (bounds?: MapBounds): Promise<RestaurantMapItem[]> => {
    let url = `${API_BASE}/restaurants/map`
    if (bounds) {
        url += `?min_lat=${bounds.min_lat}&max_lat=${bounds.max_lat}&min_lng=${bounds.min_lng}&max_lng=${bounds.max_lng}`
    }
    const res = await fetch(url)
    if (!res.ok) throw new Error('Failed to fetch restaurants')
    return res.json()
}

export const fetchTopRestaurants = async (limit = 10): Promise<RestaurantMapItem[]> => {
    const res = await fetch(`${API_BASE}/restaurants/top?limit=${limit}`)
    if (!res.ok) throw new Error('Failed to fetch top restaurants')
    return res.json()
}

export const fetchNearbyRestaurants = async (lat: number, lng: number, limit = 200, radius_km = 3): Promise<RestaurantMapItem[]> => {
    const res = await fetch(`${API_BASE}/restaurants/nearby?lat=${lat}&lng=${lng}&radius_km=${radius_km}&limit=${limit}`)
    if (!res.ok) throw new Error('Failed to fetch nearby restaurants')
    return res.json()
}

export const fetchRestaurantDetail = async (placeId: string): Promise<RestaurantDetail> => {
    const res = await fetch(`${API_BASE}/restaurants/${placeId}`)
    if (!res.ok) throw new Error('Failed to fetch restaurant detail')
    return res.json()
}

export const fetchReviews = async (placeId: string, skip = 0, limit = 20): Promise<ReviewsResponse> => {
    const res = await fetch(`${API_BASE}/restaurants/${placeId}/reviews?skip=${skip}&limit=${limit}`)
    if (!res.ok) throw new Error('Failed to fetch reviews')
    return res.json()
}
