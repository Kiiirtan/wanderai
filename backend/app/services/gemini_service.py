"""Gemini AI service for generating travel itineraries."""
import json
import re
from datetime import datetime, timedelta
from typing import Optional
import google.generativeai as genai
from app.core.config import settings


class GeminiService:
    """Service for interacting with Google Gemini API to generate itineraries."""

    def __init__(self):
        self._model = None

    def _get_model(self):
        if self._model is None:
            if not settings.GEMINI_API_KEY:
                return None
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self._model = genai.GenerativeModel(settings.GEMINI_MODEL)
        return self._model

    def _build_prompt(self, trip_data: dict) -> str:
        """Build a detailed prompt for itinerary generation."""
        start = trip_data.get("start_date", "")
        end = trip_data.get("end_date", "")
        destination = trip_data.get("destination", "Unknown")
        num_travelers = trip_data.get("num_travelers", 1)
        travel_style = trip_data.get("travel_style", "balanced")
        budget_level = trip_data.get("budget_level", "moderate")
        budget_amount = trip_data.get("budget_amount")
        currency = trip_data.get("currency", "USD")
        interests = trip_data.get("interests", [])
        accommodation_type = trip_data.get("accommodation_type", "hotel")
        transportation_mode = trip_data.get("transportation_mode", "mixed")
        special_requirements = trip_data.get("special_requirements", "")

        # Calculate number of days
        try:
            start_dt = datetime.strptime(start, "%Y-%m-%d")
            end_dt = datetime.strptime(end, "%Y-%m-%d")
            num_days = (end_dt - start_dt).days + 1
        except (ValueError, TypeError):
            num_days = 3

        interests_str = ", ".join(interests) if interests else "general sightseeing"
        budget_str = f"{budget_amount} {currency}" if budget_amount else f"{budget_level} budget"

        traveler_desc = {
            1: "a solo traveler",
            2: "a couple (2 travelers)",
        }.get(num_travelers, f"a group of {num_travelers} travelers")

        prompt = f"""You are an expert travel planner AI. Generate a detailed, personalized {num_days}-day travel itinerary for {destination}.

## Trip Details
- **Travelers**: {traveler_desc}
- **Dates**: {start} to {end} ({num_days} days)
- **Travel Style**: {travel_style} (pacing preference)
- **Budget**: {budget_str}
- **Interests**: {interests_str}
- **Accommodation Preference**: {accommodation_type}
- **Transportation**: {transportation_mode}
{f'- **Special Requirements**: {special_requirements}' if special_requirements else ''}

## Instructions
Create a comprehensive day-by-day itinerary. For each day, provide:

1. **Theme**: A catchy theme for the day (e.g., "Historical Heart of Rome")
2. **Summary**: A 1-2 sentence overview of the day
3. **Activities**: 3-5 activities with:
   - name: Activity name
   - description: Brief description (1-2 sentences)
   - time: Suggested time slot (e.g., "09:00 - 11:00")
   - location: Specific location/address
   - cost: Estimated cost per person in {currency}
   - category: One of [sightseeing, adventure, culture, nature, shopping, entertainment, relaxation]
   - rating: Popularity rating out of 5
4. **Meals**: 2-3 meal recommendations with:
   - type: breakfast/lunch/dinner
   - restaurant: Restaurant name
   - cuisine: Type of cuisine
   - price_range: Estimated cost per person in {currency}
   - description: Brief description
   - location: Area/address
5. **Accommodation**: (for each night) with:
   - name: Hotel/accommodation name
   - type: {accommodation_type}
   - price_per_night: Estimated price in {currency}
   - area: Location/neighborhood
   - rating: Rating out of 5
6. **Transportation**: Getting around that day with:
   - mode: Type of transport
   - description: Route/details
   - cost: Estimated cost in {currency}
7. **Tips**: 2-3 practical travel tips specific to that day's activities
8. **Estimated Daily Cost**: Total estimated cost for the day per person in {currency}

## Output Format
Return ONLY valid JSON (no markdown, no code blocks) in this exact structure:
{{
  "title": "Trip title",
  "estimated_total_cost": number,
  "currency": "{currency}",
  "summary": "Overall trip summary",
  "days": [
    {{
      "day_number": 1,
      "date": "{start}",
      "theme": "Day Theme",
      "summary": "Day summary",
      "activities": [
        {{
          "name": "Activity Name",
          "description": "Description",
          "time": "09:00 - 11:00",
          "location": "Location",
          "cost": 0,
          "category": "sightseeing",
          "rating": 4.5
        }}
      ],
      "meals": [
        {{
          "type": "breakfast",
          "restaurant": "Restaurant Name",
          "cuisine": "Cuisine Type",
          "price_range": 15,
          "description": "Description",
          "location": "Location"
        }}
      ],
      "accommodation": {{
        "name": "Hotel Name",
        "type": "{accommodation_type}",
        "price_per_night": 100,
        "area": "Neighborhood",
        "rating": 4.0
      }},
      "transportation": [
        {{
          "mode": "metro",
          "description": "Route details",
          "cost": 5
        }}
      ],
      "tips": ["Tip 1", "Tip 2"],
      "estimated_cost": 200
    }}
  ]
}}

Make recommendations realistic, specific (use real place names), and tailored to the traveler's preferences. Ensure the itinerary flows logically with reasonable travel times between locations."""

        return prompt

    async def generate_itinerary(self, trip_data: dict) -> dict:
        """Generate an itinerary using Gemini AI."""
        model = self._get_model()

        if model is None:
            # Return mock data when no API key is configured
            return self._generate_mock_itinerary(trip_data)

        prompt = self._build_prompt(trip_data)

        try:
            response = model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    temperature=0.7,
                    top_p=0.9,
                    max_output_tokens=8192,
                    response_mime_type="application/json",
                ),
            )

            # Parse the JSON response
            text = response.text.strip()
            # Remove markdown code block markers if present
            text = re.sub(r'^```(?:json)?\s*', '', text)
            text = re.sub(r'\s*```$', '', text)

            itinerary = json.loads(text)
            return itinerary

        except Exception as e:
            print(f"Gemini API error: {e}")
            # Fall back to mock data on error
            return self._generate_mock_itinerary(trip_data)

    async def regenerate_day(self, trip_data: dict, day_number: int, feedback: str = "") -> dict:
        """Regenerate a specific day of the itinerary."""
        model = self._get_model()

        prompt = f"""Regenerate ONLY day {day_number} of a trip to {trip_data.get('destination', 'Unknown')}.

Trip context:
- Travel style: {trip_data.get('travel_style', 'balanced')}
- Budget: {trip_data.get('budget_level', 'moderate')}
- Interests: {', '.join(trip_data.get('interests', ['sightseeing']))}
{f'- User feedback: {feedback}' if feedback else ''}

Return ONLY valid JSON for a single day object with the same structure as before (activities, meals, accommodation, transportation, tips, estimated_cost)."""

        if model is None:
            mock = self._generate_mock_itinerary(trip_data)
            if mock.get("days"):
                return mock["days"][0]
            return {}

        try:
            response = model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    temperature=0.8,
                    max_output_tokens=4096,
                    response_mime_type="application/json",
                ),
            )
            text = response.text.strip()
            text = re.sub(r'^```(?:json)?\s*', '', text)
            text = re.sub(r'\s*```$', '', text)
            return json.loads(text)
        except Exception as e:
            print(f"Gemini API error on day regeneration: {e}")
            mock = self._generate_mock_itinerary(trip_data)
            return mock["days"][0] if mock.get("days") else {}

    def _generate_mock_itinerary(self, trip_data: dict) -> dict:
        """Generate a realistic mock itinerary for demo/development."""
        destination = trip_data.get("destination", "Paris, France")
        start = trip_data.get("start_date", "2025-03-15")
        end = trip_data.get("end_date", "2025-03-17")
        currency = trip_data.get("currency", "USD")
        budget_level = trip_data.get("budget_level", "moderate")
        interests = trip_data.get("interests", ["sightseeing", "food"])

        try:
            start_dt = datetime.strptime(start, "%Y-%m-%d")
            end_dt = datetime.strptime(end, "%Y-%m-%d")
            num_days = (end_dt - start_dt).days + 1
        except (ValueError, TypeError):
            start_dt = datetime.now()
            num_days = 3

        # Destination-specific mock data
        mock_destinations = {
            "paris": {
                "title": f"Enchanting {num_days}-Day Paris Adventure",
                "days_data": [
                    {
                        "theme": "Iconic Paris Landmarks",
                        "summary": "Discover the most iconic sights of Paris, from the Eiffel Tower to the Champs-Élysées.",
                        "activities": [
                            {"name": "Eiffel Tower Visit", "description": "Ascend the iconic iron lattice tower for panoramic views of Paris. Book skip-the-line tickets.", "time": "09:00 - 11:30", "location": "Champ de Mars, 5 Avenue Anatole France", "cost": 26, "category": "sightseeing", "rating": 4.8},
                            {"name": "Seine River Cruise", "description": "Glide along the Seine past Notre-Dame, the Louvre, and historic bridges.", "time": "12:00 - 13:30", "location": "Bateaux Mouches, Pont de l'Alma", "cost": 15, "category": "sightseeing", "rating": 4.6},
                            {"name": "Arc de Triomphe & Champs-Élysées", "description": "Walk the famous avenue and climb to the top of the Arc for stunning city views.", "time": "15:00 - 17:00", "location": "Place Charles de Gaulle", "cost": 13, "category": "sightseeing", "rating": 4.5},
                            {"name": "Montmartre & Sacré-Cœur", "description": "Explore the bohemian hilltop neighborhood and visit the stunning white basilica.", "time": "17:30 - 19:30", "location": "35 Rue du Chevalier de la Barre, 18th arr.", "cost": 0, "category": "culture", "rating": 4.7},
                        ],
                        "meals": [
                            {"type": "breakfast", "restaurant": "Café de Flore", "cuisine": "French Café", "price_range": 18, "description": "Legendary Left Bank café serving perfect croissants and café crème since 1887.", "location": "172 Boulevard Saint-Germain"},
                            {"type": "lunch", "restaurant": "Le Petit Cler", "cuisine": "French Bistro", "price_range": 22, "description": "Charming bistro on Rue Cler with excellent croque-monsieur and seasonal salads.", "location": "29 Rue Cler, 7th arr."},
                            {"type": "dinner", "restaurant": "Le Bouillon Chartier", "cuisine": "Traditional French", "price_range": 25, "description": "Historic Belle Époque restaurant serving classic French fare at remarkably fair prices.", "location": "7 Rue du Faubourg Montmartre"},
                        ],
                        "accommodation": {"name": "Hôtel Le Marais", "type": "hotel", "price_per_night": 145, "area": "Le Marais, 4th Arrondissement", "rating": 4.3},
                        "transportation": [
                            {"mode": "Metro", "description": "Paris Metro Day Pass - unlimited travel on all zones", "cost": 13},
                            {"mode": "Walking", "description": "Most central attractions are walkable from each other", "cost": 0},
                        ],
                        "tips": ["Buy metro tickets in a carnet (book of 10) for savings", "Visit Sacré-Cœur at sunset for the best views and atmosphere", "Book Eiffel Tower tickets online 2+ months in advance"],
                        "estimated_cost": 277,
                    },
                    {
                        "theme": "Art, Culture & Hidden Gems",
                        "summary": "Immerse yourself in world-class art at the Louvre and discover charming Parisian neighborhoods.",
                        "activities": [
                            {"name": "Louvre Museum", "description": "Explore the world's largest art museum. See the Mona Lisa, Venus de Milo, and Winged Victory.", "time": "09:00 - 13:00", "location": "Rue de Rivoli, 1st arr.", "cost": 22, "category": "culture", "rating": 4.9},
                            {"name": "Tuileries Garden Stroll", "description": "Relax in the elegant formal gardens between the Louvre and Place de la Concorde.", "time": "13:30 - 14:30", "location": "Jardin des Tuileries", "cost": 0, "category": "nature", "rating": 4.4},
                            {"name": "Le Marais Walking Tour", "description": "Wander through medieval streets, visit Place des Vosges, and browse vintage boutiques.", "time": "15:30 - 17:30", "location": "Le Marais, 3rd-4th arr.", "cost": 0, "category": "culture", "rating": 4.6},
                            {"name": "Sunset at Pont Alexandre III", "description": "Watch the golden sunset from Paris's most ornate bridge with Eiffel Tower views.", "time": "18:30 - 19:30", "location": "Pont Alexandre III", "cost": 0, "category": "sightseeing", "rating": 4.7},
                        ],
                        "meals": [
                            {"type": "breakfast", "restaurant": "Du Pain et des Idées", "cuisine": "French Bakery", "price_range": 12, "description": "Artisan bakery famous for its pain des amis and escargot pastries.", "location": "34 Rue Yves Toudic, 10th arr."},
                            {"type": "lunch", "restaurant": "L'As du Fallafel", "cuisine": "Middle Eastern", "price_range": 14, "description": "The best falafel in Paris, crispy and fresh with all the toppings. Always a queue!", "location": "34 Rue des Rosiers, Le Marais"},
                            {"type": "dinner", "restaurant": "Chez Janou", "cuisine": "Provençal French", "price_range": 35, "description": "Beloved bistro known for its 80+ pastis selection and legendary chocolate mousse.", "location": "2 Rue Roger Verlomme, 3rd arr."},
                        ],
                        "accommodation": {"name": "Hôtel Le Marais", "type": "hotel", "price_per_night": 145, "area": "Le Marais, 4th Arrondissement", "rating": 4.3},
                        "transportation": [
                            {"mode": "Metro", "description": "Metro Line 1 (Louvre-Rivoli) and walking through central neighborhoods", "cost": 4},
                            {"mode": "Walking", "description": "Le Marais, Tuileries, and bridges are best explored on foot", "cost": 0},
                        ],
                        "tips": ["Enter the Louvre via the Porte des Lions entrance to skip the pyramid queue", "Le Marais shops are open on Sundays unlike most of Paris", "The Louvre is free on the first Saturday evening of each month"],
                        "estimated_cost": 232,
                    },
                    {
                        "theme": "Versailles & Parisian Farewell",
                        "summary": "Day trip to the magnificent Palace of Versailles, followed by a memorable Parisian evening.",
                        "activities": [
                            {"name": "Palace of Versailles", "description": "Tour the opulent Hall of Mirrors, Royal Apartments, and the stunning formal gardens.", "time": "09:00 - 14:00", "location": "Place d'Armes, 78000 Versailles", "cost": 21, "category": "culture", "rating": 4.8},
                            {"name": "Versailles Gardens", "description": "Stroll through 800 hectares of immaculate gardens, fountains, and Marie Antoinette's hamlet.", "time": "14:00 - 15:30", "location": "Gardens of Versailles", "cost": 0, "category": "nature", "rating": 4.7},
                            {"name": "Latin Quarter Exploration", "description": "Back in Paris, explore the intellectual heart with bookshops, cafés, and the Panthéon.", "time": "17:00 - 19:00", "location": "5th Arrondissement", "cost": 0, "category": "culture", "rating": 4.4},
                            {"name": "Eiffel Tower Sparkling Night View", "description": "Watch the tower sparkle on the hour from Trocadéro – a magical farewell to Paris.", "time": "21:00 - 22:00", "location": "Place du Trocadéro", "cost": 0, "category": "sightseeing", "rating": 4.9},
                        ],
                        "meals": [
                            {"type": "breakfast", "restaurant": "Boulangerie Poilâne", "cuisine": "French Bakery", "price_range": 10, "description": "Legendary sourdough bread and apple tarts from Paris's most famous bakery.", "location": "8 Rue du Cherche-Midi, 6th arr."},
                            {"type": "lunch", "restaurant": "La Flottille", "cuisine": "French Brasserie", "price_range": 28, "description": "Elegant lakeside dining in the Grand Canal area of Versailles gardens.", "location": "Parc du Château de Versailles"},
                            {"type": "dinner", "restaurant": "Le Comptoir du Panthéon", "cuisine": "Modern French", "price_range": 38, "description": "Sophisticated Latin Quarter restaurant with seasonal menus and excellent wine list.", "location": "5 Rue Soufflot, 5th arr."},
                        ],
                        "accommodation": {"name": "Hôtel Le Marais", "type": "hotel", "price_per_night": 145, "area": "Le Marais, 4th Arrondissement", "rating": 4.3},
                        "transportation": [
                            {"mode": "RER C Train", "description": "RER C from central Paris to Versailles-Château Rive Gauche (40 min)", "cost": 8},
                            {"mode": "Metro", "description": "Evening metro to Trocadéro for Eiffel Tower views", "cost": 4},
                        ],
                        "tips": ["Arrive at Versailles right at opening (9 AM) to beat the crowds", "Download the free Versailles app for a self-guided audio tour", "The RER C runs frequently - buy a round-trip ticket at any metro station"],
                        "estimated_cost": 254,
                    },
                ],
            },
        }

        # Try to match destination, default to a generic version
        dest_lower = destination.lower()
        matched = None
        for key in mock_destinations:
            if key in dest_lower:
                matched = mock_destinations[key]
                break

        if matched is None:
            # Generate generic itinerary for any destination
            matched = self._generate_generic_mock(destination, num_days, currency, interests)

        days = []
        for i in range(num_days):
            day_data = matched["days_data"][i % len(matched["days_data"])].copy()
            day_data["day_number"] = i + 1
            day_data["date"] = (start_dt + timedelta(days=i)).strftime("%Y-%m-%d")
            days.append(day_data)

        total_cost = sum(d.get("estimated_cost", 200) for d in days)

        return {
            "title": matched.get("title", f"Amazing {num_days}-Day {destination} Trip"),
            "estimated_total_cost": total_cost,
            "currency": currency,
            "summary": f"A carefully curated {num_days}-day journey through {destination} combining the best attractions, local dining, and unique experiences tailored to your preferences.",
            "days": days,
        }

    def _generate_generic_mock(self, destination: str, num_days: int, currency: str, interests: list) -> dict:
        """Generate generic mock data for any destination."""
        base_activities = [
            {"name": f"Historic City Center Tour", "description": f"Explore the historic heart of {destination} with its iconic landmarks and architecture.", "time": "09:00 - 11:30", "location": f"Old Town, {destination}", "cost": 15, "category": "sightseeing", "rating": 4.6},
            {"name": f"Local Food Market Visit", "description": f"Browse the vibrant local market, sample street food, and experience authentic flavors.", "time": "12:00 - 13:30", "location": f"Central Market, {destination}", "cost": 20, "category": "culture", "rating": 4.5},
            {"name": f"Museum & Gallery Quarter", "description": f"Visit the top-rated museums showcasing {destination}'s rich art and history.", "time": "14:30 - 17:00", "location": f"Museum District, {destination}", "cost": 18, "category": "culture", "rating": 4.7},
            {"name": f"Scenic Viewpoint & Sunset", "description": f"Head to the best viewpoint for stunning panoramic views of {destination} at golden hour.", "time": "17:30 - 19:00", "location": f"Panoramic Point, {destination}", "cost": 0, "category": "nature", "rating": 4.8},
        ]

        days_data = []
        themes = [
            "Arrival & City Discovery", "Cultural Deep Dive", "Nature & Adventure",
            "Hidden Gems & Local Life", "Art & Architecture", "Coastal Escape",
            "Mountain Excursion", "Farewell & Shopping"
        ]

        for i in range(max(num_days, 3)):
            theme = themes[i % len(themes)]
            days_data.append({
                "theme": theme,
                "summary": f"Day {i + 1} in {destination}: {theme.lower()} with curated activities and local dining.",
                "activities": base_activities,
                "meals": [
                    {"type": "breakfast", "restaurant": f"Café Morning Glory", "cuisine": "Local/International", "price_range": 12, "description": f"Popular breakfast spot in {destination} with fresh local ingredients.", "location": f"Central {destination}"},
                    {"type": "lunch", "restaurant": f"The Local Kitchen", "cuisine": "Regional Cuisine", "price_range": 20, "description": f"Authentic regional flavors in a charming setting.", "location": f"Downtown {destination}"},
                    {"type": "dinner", "restaurant": f"Sunset Terrace", "cuisine": "Contemporary Local", "price_range": 35, "description": f"Upscale dining with views and seasonal local menu.", "location": f"Waterfront, {destination}"},
                ],
                "accommodation": {"name": f"Grand Hotel {destination}", "type": "hotel", "price_per_night": 120, "area": f"City Center, {destination}", "rating": 4.2},
                "transportation": [
                    {"mode": "Public Transit", "description": f"Day pass for {destination}'s public transportation network", "cost": 10},
                    {"mode": "Walking", "description": "Central areas are best explored on foot", "cost": 0},
                ],
                "tips": [
                    f"Download offline maps of {destination} before your trip",
                    "Learn a few basic phrases in the local language",
                    "Keep copies of important documents in your hotel safe",
                ],
                "estimated_cost": 250,
            })

        return {
            "title": f"Unforgettable {num_days}-Day {destination} Journey",
            "days_data": days_data,
        }


# Singleton instance
gemini_service = GeminiService()
