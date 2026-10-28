"""Trip management API routes."""
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.core.auth import get_required_user
from app.models.trip import Trip, ItineraryDay
from app.models.user import User
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/api/trips", tags=["trips"])


# --- Pydantic Schemas ---

class TripCreateRequest(BaseModel):
    destination: str
    start_date: str
    end_date: str
    num_travelers: int = 1
    travel_style: str = "balanced"
    budget_level: str = "moderate"
    budget_amount: Optional[float] = None
    currency: str = "USD"
    interests: list[str] = []
    accommodation_type: str = "hotel"
    transportation_mode: str = "mixed"
    special_requirements: Optional[str] = None


class TripUpdateRequest(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    cover_image: Optional[str] = None


class RegenerateDayRequest(BaseModel):
    feedback: str = ""


class ActivitySchema(BaseModel):
    name: str
    description: str = ""
    time: str = ""
    location: str = ""
    cost: float = 0
    category: str = "sightseeing"
    rating: float = 0


class MealSchema(BaseModel):
    type: str
    restaurant: str
    cuisine: str = ""
    price_range: float = 0
    description: str = ""
    location: str = ""


class AccommodationSchema(BaseModel):
    name: str
    type: str = "hotel"
    price_per_night: float = 0
    area: str = ""
    rating: float = 0


class TransportSchema(BaseModel):
    mode: str
    description: str = ""
    cost: float = 0


class ItineraryDayResponse(BaseModel):
    id: int
    day_number: int
    date: str
    theme: Optional[str]
    summary: Optional[str]
    activities: list
    meals: list
    accommodation: Optional[dict]
    transportation: list
    estimated_cost: Optional[float]
    tips: list

    class Config:
        from_attributes = True


class TripResponse(BaseModel):
    id: int
    title: str
    destination: str
    start_date: str
    end_date: str
    num_travelers: int
    travel_style: str
    budget_level: str
    budget_amount: Optional[float]
    currency: str
    interests: list
    accommodation_type: str
    transportation_mode: str
    special_requirements: Optional[str]
    status: str
    cover_image: Optional[str]
    estimated_cost: Optional[float]
    created_at: Optional[datetime] = None
    itinerary_days: list[ItineraryDayResponse] = []

    class Config:
        from_attributes = True


class TripListItem(BaseModel):
    id: int
    title: str
    destination: str
    start_date: str
    end_date: str
    num_travelers: int
    travel_style: str
    budget_level: str
    status: str
    cover_image: Optional[str]
    estimated_cost: Optional[float]
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- Routes ---

@router.get("/", response_model=list[TripListItem])
async def list_trips(
    status_filter: Optional[str] = Query(None, alias="status"),
    user: User = Depends(get_required_user),
    db: AsyncSession = Depends(get_db),
):
    """List all trips for the current user."""
    query = select(Trip).where(Trip.user_id == user.id).order_by(desc(Trip.updated_at))
    if status_filter:
        query = query.where(Trip.status == status_filter)
    result = await db.execute(query)
    trips = result.scalars().all()
    return [TripListItem.model_validate(t) for t in trips]


@router.post("/generate", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
async def generate_trip(
    req: TripCreateRequest,
    user: User = Depends(get_required_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate a new AI-powered trip itinerary."""
    trip_data = req.model_dump()

    # Generate itinerary using Gemini
    itinerary = await gemini_service.generate_itinerary(trip_data)

    # Create Trip record
    trip = Trip(
        user_id=user.id,
        title=itinerary.get("title", f"Trip to {req.destination}"),
        destination=req.destination,
        start_date=req.start_date,
        end_date=req.end_date,
        num_travelers=req.num_travelers,
        travel_style=req.travel_style,
        budget_level=req.budget_level,
        budget_amount=req.budget_amount,
        currency=req.currency,
        interests=req.interests,
        accommodation_type=req.accommodation_type,
        transportation_mode=req.transportation_mode,
        special_requirements=req.special_requirements,
        status="generated",
        estimated_cost=itinerary.get("estimated_total_cost"),
    )
    db.add(trip)
    await db.flush()

    # Create ItineraryDay records
    for day_data in itinerary.get("days", []):
        day = ItineraryDay(
            trip_id=trip.id,
            day_number=day_data.get("day_number", 1),
            date=day_data.get("date", req.start_date),
            theme=day_data.get("theme"),
            summary=day_data.get("summary"),
            activities=day_data.get("activities", []),
            meals=day_data.get("meals", []),
            accommodation=day_data.get("accommodation"),
            transportation=day_data.get("transportation", []),
            estimated_cost=day_data.get("estimated_cost"),
            tips=day_data.get("tips", []),
        )
        db.add(day)

    await db.commit()
    await db.refresh(trip)

    # Reload with relationships
    result = await db.execute(
        select(Trip).where(Trip.id == trip.id).options(selectinload(Trip.itinerary_days))
    )
    trip = result.scalar_one()

    return _trip_to_response(trip)


@router.get("/{trip_id}", response_model=TripResponse)
async def get_trip(
    trip_id: int,
    user: User = Depends(get_required_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific trip with full itinerary."""
    result = await db.execute(
        select(Trip)
        .where(Trip.id == trip_id, Trip.user_id == user.id)
        .options(selectinload(Trip.itinerary_days))
    )
    trip = result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    return _trip_to_response(trip)


@router.patch("/{trip_id}", response_model=TripResponse)
async def update_trip(
    trip_id: int,
    req: TripUpdateRequest,
    user: User = Depends(get_required_user),
    db: AsyncSession = Depends(get_db),
):
    """Update trip metadata (title, status, cover image)."""
    result = await db.execute(
        select(Trip)
        .where(Trip.id == trip_id, Trip.user_id == user.id)
        .options(selectinload(Trip.itinerary_days))
    )
    trip = result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    if req.title is not None:
        trip.title = req.title
    if req.status is not None:
        trip.status = req.status
    if req.cover_image is not None:
        trip.cover_image = req.cover_image

    await db.commit()
    await db.refresh(trip)
    return _trip_to_response(trip)


@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_trip(
    trip_id: int,
    user: User = Depends(get_required_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a trip and all its itinerary days."""
    result = await db.execute(
        select(Trip).where(Trip.id == trip_id, Trip.user_id == user.id)
    )
    trip = result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    await db.delete(trip)
    await db.commit()


@router.post("/{trip_id}/regenerate", response_model=TripResponse)
async def regenerate_trip(
    trip_id: int,
    user: User = Depends(get_required_user),
    db: AsyncSession = Depends(get_db),
):
    """Regenerate entire trip itinerary."""
    result = await db.execute(
        select(Trip)
        .where(Trip.id == trip_id, Trip.user_id == user.id)
        .options(selectinload(Trip.itinerary_days))
    )
    trip = result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    trip_data = {
        "destination": trip.destination,
        "start_date": trip.start_date,
        "end_date": trip.end_date,
        "num_travelers": trip.num_travelers,
        "travel_style": trip.travel_style,
        "budget_level": trip.budget_level,
        "budget_amount": trip.budget_amount,
        "currency": trip.currency,
        "interests": trip.interests or [],
        "accommodation_type": trip.accommodation_type,
        "transportation_mode": trip.transportation_mode,
        "special_requirements": trip.special_requirements,
    }

    itinerary = await gemini_service.generate_itinerary(trip_data)

    # Delete old days
    for day in trip.itinerary_days:
        await db.delete(day)

    # Create new days
    for day_data in itinerary.get("days", []):
        day = ItineraryDay(
            trip_id=trip.id,
            day_number=day_data.get("day_number", 1),
            date=day_data.get("date", trip.start_date),
            theme=day_data.get("theme"),
            summary=day_data.get("summary"),
            activities=day_data.get("activities", []),
            meals=day_data.get("meals", []),
            accommodation=day_data.get("accommodation"),
            transportation=day_data.get("transportation", []),
            estimated_cost=day_data.get("estimated_cost"),
            tips=day_data.get("tips", []),
        )
        db.add(day)

    trip.title = itinerary.get("title", trip.title)
    trip.estimated_cost = itinerary.get("estimated_total_cost")
    trip.status = "generated"

    await db.commit()

    # Reload
    result = await db.execute(
        select(Trip).where(Trip.id == trip.id).options(selectinload(Trip.itinerary_days))
    )
    trip = result.scalar_one()
    return _trip_to_response(trip)


@router.post("/{trip_id}/days/{day_number}/regenerate", response_model=ItineraryDayResponse)
async def regenerate_day(
    trip_id: int,
    day_number: int,
    req: RegenerateDayRequest,
    user: User = Depends(get_required_user),
    db: AsyncSession = Depends(get_db),
):
    """Regenerate a specific day of the itinerary."""
    result = await db.execute(
        select(Trip)
        .where(Trip.id == trip_id, Trip.user_id == user.id)
        .options(selectinload(Trip.itinerary_days))
    )
    trip = result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    # Find the day
    day = next((d for d in trip.itinerary_days if d.day_number == day_number), None)
    if not day:
        raise HTTPException(status_code=404, detail=f"Day {day_number} not found")

    trip_data = {
        "destination": trip.destination,
        "travel_style": trip.travel_style,
        "budget_level": trip.budget_level,
        "interests": trip.interests or [],
    }

    new_day_data = await gemini_service.regenerate_day(trip_data, day_number, req.feedback)

    # Update the day
    day.theme = new_day_data.get("theme", day.theme)
    day.summary = new_day_data.get("summary", day.summary)
    day.activities = new_day_data.get("activities", day.activities)
    day.meals = new_day_data.get("meals", day.meals)
    day.accommodation = new_day_data.get("accommodation", day.accommodation)
    day.transportation = new_day_data.get("transportation", day.transportation)
    day.estimated_cost = new_day_data.get("estimated_cost", day.estimated_cost)
    day.tips = new_day_data.get("tips", day.tips)

    await db.commit()
    await db.refresh(day)

    return ItineraryDayResponse.model_validate(day)


def _trip_to_response(trip: Trip) -> TripResponse:
    """Convert Trip model to response, sorting days by day_number."""
    days = sorted(trip.itinerary_days, key=lambda d: d.day_number)
    return TripResponse(
        id=trip.id,
        title=trip.title,
        destination=trip.destination,
        start_date=trip.start_date,
        end_date=trip.end_date,
        num_travelers=trip.num_travelers,
        travel_style=trip.travel_style,
        budget_level=trip.budget_level,
        budget_amount=trip.budget_amount,
        currency=trip.currency,
        interests=trip.interests or [],
        accommodation_type=trip.accommodation_type,
        transportation_mode=trip.transportation_mode,
        special_requirements=trip.special_requirements,
        status=trip.status,
        cover_image=trip.cover_image,
        estimated_cost=trip.estimated_cost,
        created_at=str(trip.created_at) if trip.created_at else "",
        itinerary_days=[ItineraryDayResponse.model_validate(d) for d in days],
    )
