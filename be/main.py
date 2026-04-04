from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError

from app.core.exception_handlers import validation_exception_handler
from app.core.json_response import AppJSONResponse
from app.core.config import settings
from app.core.database import init_db, close_db

from app.features.users.document import User
from app.features.restaurants.document import Restaurant, RestaurantReview
from app.features.auth.router import router as auth_router
from app.features.restaurants.router import router as restaurants_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db([User, Restaurant, RestaurantReview])
    yield
    await close_db()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
    lifespan=lifespan,
    default_response_class=AppJSONResponse,
)

app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(restaurants_router, prefix="/api/v1/restaurants", tags=["Restaurants"])


@app.get("/health")
async def health_check():
    return {"status": "ok", "version": settings.APP_VERSION}
