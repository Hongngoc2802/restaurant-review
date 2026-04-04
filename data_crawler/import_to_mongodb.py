"""
Import script: reads cleaned CSV files and upserts into MongoDB.
Run from project root: python data_crawler/import_to_mongodb.py
"""
import asyncio
import csv
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'be'))

from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'be', '.env'))

MONGO_URI = os.getenv('MONGODB_URL', 'mongodb://localhost:27017')
DB_NAME   = os.getenv('MONGODB_DB_NAME', 'restaurant_review')

OVERVIEW_CSV = os.path.join(os.path.dirname(__file__), 'all-task-7-overview-clean.csv')
REVIEWS_CSV  = os.path.join(os.path.dirname(__file__), 'all-task-7-featured-reviews-clean.csv')


def safe_float(val: str) -> float | None:
    try:
        v = val.strip().strip('"')
        return float(v) if v else None
    except (ValueError, AttributeError):
        return None


def safe_int(val: str) -> int | None:
    try:
        v = val.strip().strip('"')
        return int(v) if v else None
    except (ValueError, AttributeError):
        return None


def parse_categories(raw: str) -> list[str]:
    raw = raw.strip().strip('"')
    if not raw:
        return []
    return [c.strip() for c in raw.split(',') if c.strip()]


async def import_restaurants():
    from app.features.restaurants.document import Restaurant

    print(f"Reading {OVERVIEW_CSV} ...")
    total = upserted = skipped = 0

    with open(OVERVIEW_CSV, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            total += 1
            place_id = row.get('place_id', '').strip().strip('"')
            if not place_id:
                skipped += 1
                continue

            lat = safe_float(row.get('latitude', ''))
            lng = safe_float(row.get('longitude', ''))

            location = None
            if lat is not None and lng is not None:
                location = {"type": "Point", "coordinates": [lng, lat]}

            rating_str = row.get('rating', '').strip().strip('"')
            reviews_str = row.get('reviews', '').strip().strip('"')

            doc = Restaurant(
                place_id=place_id,
                name=row.get('name', '').strip().strip('"'),
                description=row.get('description', '').strip().strip('"') or None,
                rating=safe_float(rating_str),
                reviews_count=safe_int(reviews_str),
                address=row.get('address', '').strip().strip('"') or None,
                phone=row.get('phone', '').strip().strip('"') or None,
                website=row.get('website', '').strip().strip('"') or None,
                main_category=row.get('main_category', '').strip().strip('"') or None,
                categories=parse_categories(row.get('categories', '')),
                featured_image=row.get('featured_image', '').strip().strip('"') or None,
                workday_timing=row.get('workday_timing', '').strip().strip('"') or None,
                query=row.get('query', '').strip().strip('"') or None,
                location=location,
                latitude=lat,
                longitude=lng,
            )

            await Restaurant.find_one(Restaurant.place_id == place_id).upsert(
                {"$set": doc.model_dump(exclude={"id", "revision_id"})},
                on_insert=doc,
            )
            upserted += 1

            if upserted % 100 == 0:
                print(f"  restaurants: {upserted}/{total}")

    print(f"Restaurants done — total: {total}, upserted: {upserted}, skipped: {skipped}")


async def import_reviews():
    from app.features.restaurants.document import RestaurantReview

    if not os.path.exists(REVIEWS_CSV):
        print(f"Reviews CSV not found: {REVIEWS_CSV}, skipping.")
        return

    print(f"Reading {REVIEWS_CSV} ...")
    total = upserted = skipped = 0

    with open(REVIEWS_CSV, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        headers = reader.fieldnames or []
        print(f"  Columns: {headers}")

        for row in reader:
            total += 1
            place_id = (
                row.get('place_id') or row.get('place id') or ''
            ).strip().strip('"')

            if not place_id:
                skipped += 1
                continue

            reviewer = (row.get('reviewer_name') or row.get('name') or row.get('author') or '').strip().strip('"') or None
            rating   = safe_float(row.get('rating') or row.get('stars') or '')
            content  = (row.get('review_text') or row.get('content') or row.get('text') or row.get('review') or '').strip().strip('"') or None
            date     = (row.get('review_date') or row.get('date') or '').strip().strip('"') or None

            doc = RestaurantReview(
                place_id=place_id,
                reviewer_name=reviewer,
                rating=rating,
                content=content,
                review_date=date,
            )
            await doc.insert()
            upserted += 1

            if upserted % 500 == 0:
                print(f"  reviews: {upserted}/{total}")

    print(f"Reviews done — total: {total}, inserted: {upserted}, skipped: {skipped}")


async def main():
    client = AsyncIOMotorClient(MONGO_URI)
    from app.features.restaurants.document import Restaurant, RestaurantReview
    await init_beanie(database=client[DB_NAME], document_models=[Restaurant, RestaurantReview])

    await import_restaurants()
    await import_reviews()

    client.close()
    print("Import complete!")


if __name__ == '__main__':
    asyncio.run(main())
