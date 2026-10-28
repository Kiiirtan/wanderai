"""Trip and Itinerary database models."""
from sqlalchemy import Column, Integer, String, DateTime, Float, Text, ForeignKey, JSON, func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    destination = Column(String(255), nullable=False)
    start_date = Column(String(20), nullable=False)  # ISO date string
    end_date = Column(String(20), nullable=False)
    num_travelers = Column(Integer, default=1)
    travel_style = Column(String(50), default="balanced")  # relaxed, balanced, packed
    budget_level = Column(String(50), default="moderate")  # budget, moderate, premium, luxury
    budget_amount = Column(Float, nullable=True)
    currency = Column(String(10), default="USD")
    interests = Column(JSON, default=list)  # ["food", "sightseeing", "adventure", ...]
    accommodation_type = Column(String(50), default="hotel")
    transportation_mode = Column(String(50), default="mixed")
    special_requirements = Column(Text, nullable=True)
    status = Column(String(20), default="draft")  # draft, generated, saved, archived
    cover_image = Column(String(500), nullable=True)
    estimated_cost = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    itinerary_days = relationship("ItineraryDay", back_populates="trip", cascade="all, delete-orphan")


class ItineraryDay(Base):
    __tablename__ = "itinerary_days"

    id = Column(Integer, primary_key=True, autoincrement=True)
    trip_id = Column(Integer, ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    day_number = Column(Integer, nullable=False)
    date = Column(String(20), nullable=False)
    theme = Column(String(255), nullable=True)  # e.g., "Cultural Exploration", "Beach Day"
    summary = Column(Text, nullable=True)
    activities = Column(JSON, default=list)  # List of activity objects
    meals = Column(JSON, default=list)  # List of meal recommendations
    accommodation = Column(JSON, nullable=True)  # Accommodation details
    transportation = Column(JSON, default=list)  # Transportation details
    estimated_cost = Column(Float, nullable=True)
    tips = Column(JSON, default=list)  # Travel tips for the day
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    trip = relationship("Trip", back_populates="itinerary_days")
