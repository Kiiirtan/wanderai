# WanderAI Frontend UI & Design System Specification

> **Document Version**: 1.0.0  
> **Application**: WanderAI – Personalized AI Travel Itinerary Planner  
> **Tech Stack**: React 19, Vite 8, Vanilla CSS Design System, Framer Motion, Lucide Icons, @fontsource/inter  
> **Theme**: Premium Deep Ocean Dark Mode with Glassmorphism & Aurora Gradients  

---

## 1. Executive Visual & Architectural Overview

The **WanderAI** frontend is engineered as a modern, high-aesthetic SaaS web application designed to eliminate travel decision fatigue. The interface employs a cohesive **Deep Ocean** dark-mode visual hierarchy accentuated by:
- **Glassmorphism**: Translucent card backdrops (`rgba(255, 255, 255, 0.03)` to `0.06`) backed by high-def `backdrop-filter: blur(16px)` and delicate luminous borders.
- **Dynamic Background Atmosphere**: Multi-point radial glowing ambient lights (indigo, cyan, and purple) cast across a fixed viewport canvas.
- **Vibrant Accent Gradients**: Tailored linear gradients for primary actions, badges, and typography titles (`--gradient-primary`, `--gradient-aurora`, `--gradient-card`).
- **Interactive Micro-Animations**: Smooth physics-based transitions via **Framer Motion**, pulse-glow generation buttons, and hover elevations (-4px card lift with glow shadows).

---

## 2. Design Tokens & Design System (`src/index.css`)

The core styling is governed by a CSS custom-properties token system defined in `:root`.

### 2.1 Color Palette

| Category | Token | Hex / Value | Usage & Visual Role |
| :--- | :--- | :--- | :--- |
| **Canvas** | `--color-bg-primary` | `#0a0e1a` | Deepest dark navy base background |
| **Surfaces** | `--color-bg-secondary` | `#111827` | Sidebar, dropdowns, and deep card containers |
| **Surfaces** | `--color-bg-tertiary` | `#1a2235` | Secondary panels and elevated elements |
| **Glass** | `--color-bg-glass` | `rgba(255, 255, 255, 0.03)` | Standard translucent card/chip surface |
| **Glass Hover**| `--color-bg-glass-hover`| `rgba(255, 255, 255, 0.06)` | Hovered cards and interactive elements |
| **Inputs** | `--color-bg-input` | `rgba(255, 255, 255, 0.05)` | Text fields, selectors, textareas |
| **Primary Accent**| `--color-accent-primary`| `#6366f1` | Indigo – primary brand anchor |
| **Primary Light**| `--color-accent-primary-light`| `#818cf8` | Active links, button highlights, icons |
| **Secondary Accent**| `--color-accent-secondary`| `#06b6d4` | Vibrant cyan – secondary gradient anchor |
| **Warning / Amber**| `--color-accent-tertiary` | `#f59e0b` | Warm amber – budget metrics, tips, warnings |
| **Success** | `--color-accent-success`| `#10b981` | Emerald green – costs, saved badges |
| **Danger** | `--color-accent-danger` | `#ef4444` | Red – delete actions, error badges |

### 2.2 Gradients

- **`--gradient-primary`**: `linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)` (Indigo to Cyan)
- **`--gradient-aurora`**: `linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #06b6d4 100%)` (Indigo to Purple to Cyan)
- **`--gradient-card`**: `linear-gradient(145deg, rgba(99,102,241,0.08) 0%, rgba(6,182,212,0.04) 100%)`
- **`--gradient-warm`**: `linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)`

### 2.3 Typography Scale (Inter Font Family)

Font loaded via `@fontsource/inter` across weights **400 (Regular)**, **500 (Medium)**, **600 (Semi-Bold)**, **700 (Bold)**, and **800 (Extra-Bold)**.

- `--font-size-xs`: `0.75rem` (12px) – Timestamps, badges, metadata chips
- `--font-size-sm`: `0.875rem` (14px) – Standard UI labels, body descriptions, subtext
- `--font-size-base`: `1.0rem` (16px) – Inputs, standard paragraphs
- `--font-size-lg`: `1.125rem` (18px) – Section headers, card titles
- `--font-size-xl`: `1.25rem` (20px) – Modal titles, trip destinations
- `--font-size-2xl`: `1.5rem` (24px) – Page subtitles, stat values
- `--font-size-3xl`: `1.875rem` (30px) – Standard page titles
- `--font-size-4xl`: `2.25rem` (36px) – Itinerary hero header banner

### 2.4 Shadows & Elevation

- `--shadow-sm`: `0 1px 2px rgba(0, 0, 0, 0.3)`
- `--shadow-md`: `0 4px 12px rgba(0, 0, 0, 0.4)`
- `--shadow-lg`: `0 8px 32px rgba(0, 0, 0, 0.5)`
- `--shadow-xl`: `0 16px 48px rgba(0, 0, 0, 0.6)`
- `--shadow-glow`: `0 0 20px rgba(99, 102, 241, 0.15)`
- `--shadow-glow-lg`: `0 0 40px rgba(99, 102, 241, 0.2)`

---

## 3. Global Application Shell & Layout (`AppLayout.jsx`)

All protected dashboard screens are housed within a unified dual-pane layout:

```
+-------------------------------------------------------------------------------+
| [Mobile Header - <=1024px] [Hamburger Menu Button]                           |
+-------------------+-----------------------------------------------------------+
| SIDEBAR (260px)   | MAIN CONTENT AREA                                         |
|                   |                                                           |
| [Compass] WanderAI| Page Header: [Page Title]  [Page Subtitle]   [Action Btn] |
|                   |                                                           |
| - Dashboard       | --------------------------------------------------------- |
| - Plan a Trip     | Page Body Container:                                      |
| - My Trips        |                                                           |
|                   |   [Animated Router View via Framer Motion]                |
|                   |   (DashboardPage / TripBuilderPage / TripsListPage / ...) |
|                   |                                                           |
| [User Profile]    |                                                           |
| [Sign Out Button] |                                                           |
+-------------------+-----------------------------------------------------------+
```

### 3.1 Sidebar Navigation
- **Branding**: Gradient logo square with white Lucide `Compass` icon, followed by glowing "WanderAI" title.
- **Nav Links**:
  - `Dashboard` (`/dashboard` with `LayoutDashboard` icon)
  - `Plan a Trip` (`/trips/new` with `PlusCircle` icon)
  - `My Trips` (`/trips` with `Map` icon)
  - **Active State Indicator**: Luminous left vertical pill gradient bar + indigo tinted background (`rgba(99, 102, 241, 0.1)`).
- **User Profile Pill**:
  - Circular avatar with initials rendered over `--gradient-primary`.
  - User Full Name (bold) + Email address (muted small font).
  - Quick `Sign Out` button with `LogOut` icon.

### 3.2 Mobile Drawer & Responsiveness
- On viewports `<= 1024px`, the sidebar translates off-screen (`translateX(-100%)`).
- Floating top-left hamburger button (`Menu` / `X` toggle) slides in the sidebar with a semi-transparent dimmed overlay (`.sidebar-overlay`).
- Main content automatically expands to 100% width.

---

## 4. Page-by-Page Deep Dive

### 4.1 Authentication Screens (`LoginPage.jsx` & `RegisterPage.jsx`)

- **Centered Glass Card**: Constrained to `max-width: 440px`, centered vertically and horizontally on full viewport height.
- **Header**: Circular gradient icon with `Compass`, brand title "WanderAI", and clean contextual subtitle ("Welcome back! Please sign in" / "Create your account to start planning").
- **Interactive Form**:
  - `Full Name` (Register only)
  - `Username`
  - `Email Address`
  - `Password`
  - Floating focus ring (`border-color: #6366f1`, `box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15)`).
- **Feedback & Validation**: Inline error banners with alert styling if authentication fails.
- **Submit Action**: Full-width gradient button with spinner indicator during API dispatch.

---

### 4.2 Dashboard Overview (`DashboardPage.jsx`)

The default landing page providing travelers with an instant snapshot of their activity:

1. **Header Banner**:
   - Title: "Welcome back, {User.name}! ✈️"
   - Subtitle: "Here's an overview of your travel plans and recommendations"
   - Primary Action: `+ Plan New Trip` CTA button linking directly to the trip builder.

2. **KPI Stats Grid** (4 Metric Cards):
   - **Total Trips**: `Map` icon, indigo accent pill, count of all generated & saved trips.
   - **Days Planned**: `Calendar` icon, cyan accent pill, sum of total duration days across all trips.
   - **Estimated Budget**: `DollarSign` icon, amber accent pill, aggregate total estimated expenses.
   - **Active Itineraries**: `Sparkles` icon, emerald accent pill, active trips ready for exploration.

3. **Recent Trips Shelf**:
   - If trips exist: Displays up to 4 recent trips formatted as rich interactive cards.
   - Each card features:
     - **Cover Canvas**: Dynamic destination emoji watermark (e.g. 🗼 Paris, 🗾 Tokyo, 🏛️ Rome, 🌴 Bali, 🗽 New York) over card gradient.
     - **Status Badge**: `Saved` (green), `Generated` (indigo), or `Draft` (amber).
     - **Destination & Date range**: Formatted with calendar icon.
     - **Bottom Row**: Estimated total budget + arrow link button.
   - If no trips exist: Displays a warm **Empty State** with illustrated compass card and prompt to create their first itinerary.

---

### 4.3 Smart Trip Builder (`TripBuilderPage.jsx`)

An intelligent multi-step form built into a single focused 800px column:

1. **Destination & Dates Section**:
   - Destination input with auto-formatting and `MapPin` icon.
   - Start Date & End Date date-pickers with validation ensuring start precedes end.

2. **Group Size & Travel Style**:
   - Number of travelers counter (1 traveler = Solo, 2 = Couple, 3+ = Group).
   - **Style Selector Cards** (3 interactive segmented cards):
     - `Relaxed`: "Slow pace, lots of downtime"
     - `Balanced`: "Mix of activities and rest" (Default)
     - `Packed`: "See everything possible"

3. **Budget & Currency Selection**:
   - **Budget Tier Chips**:
     - `💰 Budget` (Under $50/day)
     - `💳 Moderate` ($50–150/day)
     - `💎 Premium` ($150–300/day)
     - `👑 Luxury` ($300+/day)
   - Custom Budget input field + Currency selector dropdown (`USD`, `EUR`, `GBP`, `JPY`, `CAD`, `AUD`, `INR`).

4. **Interests & Travel Vibes** (Multi-Select Chip Matrix):
   - 12 selectable chips with emoji cues:
     - 🏛️ Sightseeing, 🍕 Food & Dining, 🧗 Adventure, 🎭 Culture & History, 🌿 Nature, 🛍️ Shopping, 🌃 Nightlife, 🧘 Relaxation, 📸 Photography, 🎨 Art & Museums, 🏖️ Beach, ⚽ Sports.
   - Active state toggles glowing purple-indigo border with soft fill.

5. **Accommodations & Logistics**:
   - Stay preference selector: Hotel, Boutique Hotel, Resort, Airbnb/Apartment, Hostel.
   - Transit preference selector: Public Transit / Metro, Walking, Rental Car, Ride Share, Mixed.

6. **Special Requirements & Notes**:
   - Textarea for dietary preferences (vegan, halal, gluten-free), accessibility needs, or pace restrictions.

7. **The AI Generation CTA (`btn-generate`)**:
   - Prominently styled gradient button featuring an animated infinite **`pulse-glow`** effect.
   - When clicked: Transforms into a loading state displaying a spinning loader and animated status text ("Generating custom day-by-day plan...").

---

### 4.4 My Trips Directory (`TripsListPage.jsx`)

A comprehensive management catalog for all created trips:

- **Filter Bar**: Quick-toggle filter chips:
  - `All Trips`
  - `Generated`
  - `Saved`
  - `Drafts`
- **Responsive Card Grid**: Auto-fill columns (min `340px`).
- **Card Actions**:
  - Full card clickable to view the itinerary.
  - Hover reveals a dedicated **Trash / Delete** button (`btn-danger btn-icon`) that opens a confirmation alert and removes the trip with instant state update.

---

### 4.5 Interactive Itinerary Detail View (`ItineraryViewPage.jsx`)

The centerpiece of the application where AI-generated travel plans come alive:

#### A. Hero Header Banner
- Gradient aurora typography title: e.g. *"Unforgettable 3-Day Tokyo, Japan Journey"*.
- **Trip Meta Badges**:
  - 📍 Destination
  - 📅 Date span & duration (e.g. "Nov 1 – Nov 3 • 3 Days")
  - 👥 Group size
  - 🏷️ Travel pace
  - 💳 Estimated budget
- **Action Toolbar**:
  - `Expand All` / `Collapse All` toggle buttons.
  - `Save Itinerary` button (updates status to 'Saved' with emerald badge feedback).
  - `Regenerate Entire Trip` button with confirmation alert.
  - `Delete Trip` button.

#### B. Daily Accordion Cards (`day-card`)
Each day in the journey is encapsulated in an interactive card:
- **Card Header**:
  - Large square gradient badge with Day Number (e.g. `1`, `2`, `3`).
  - Day theme title (e.g., *"Historical Foundations & Traditional Markets"*).
  - Calendar date subtitle.
  - Estimated cost pill for the day.
  - Quick action: "Regenerate Day" (`RefreshCw` icon) to prompt AI revision for only that specific day without changing the rest of the trip.
  - Collapse / Expand chevron indicator.

#### C. Day Content Breakdown (When Expanded)
1. **Activities Timeline (`activity-list`)**:
   - Time tag (e.g. `09:00 AM`, `02:00 PM`, `06:30 PM`).
   - Activity Name & deep descriptive paragraph.
   - Location tag with map pin.
   - Estimated cost.
   - Activity category badge (Sightseeing, Culture, Adventure).
2. **Curated Dining Shelf (`meals-grid`)**:
   - 3 cards per day for Breakfast, Lunch, and Dinner.
   - Restaurant recommendation name.
   - Cuisine classification (e.g., "Authentic Ramen", "Rooftop Bistro").
   - Estimated price per person.
3. **Accommodation Information**:
   - Hotel/Stay name, neighborhood location, star rating, and nightly rate.
4. **Transit & Logistics Guide**:
   - Recommended transit route (metro line, walking distance, bus transfer) and estimated fare.
5. **Local Travel Tips (`tips-list`)**:
   - Amber-accented callout blocks containing pro tips (e.g., "Book tickets online 24h in advance", "Wear comfortable walking shoes").

---

## 5. Responsive Breakpoint Behavior

| Breakpoint | Target Devices | Layout Adaptations |
| :--- | :--- | :--- |
| **> 1024px** | Desktops & Large Laptops | Fixed 260px left sidebar, 2-column trip builder, 3-column trip card grid. |
| **768px – 1024px**| Tablets & Small Laptops | Sidebar collapses into mobile overlay drawer with hamburger button; main content expands to 100vw. |
| **480px – 768px** | Phablets & Large Phones | Trip builder forms stack into single full-width inputs; trip cards render 1 column; activity cards stack time and details vertically. |
| **< 480px** | Mobile Phones | Stat grid stacks to 1 column; modal cards scale padding down to `var(--space-4)`; page titles scale to `1.5rem`. |

---

## 6. Frontend File Architecture

```
Project SW/
├── index.html                   # HTML entry point with meta SEO & root mount
├── vite.config.js               # Vite config with React plugin & backend API proxy
├── src/
│   ├── main.jsx                 # Application bootstrapping with BrowserRouter & Fonts
│   ├── App.jsx                  # Route definitions and ProtectedRoute guards
│   ├── index.css                # Master 1300+ line Vanilla CSS Design System
│   ├── api/
│   │   └── client.js            # Unified Fetch client handling JWT tokens & API calls
│   ├── context/
│   │   └── AuthContext.jsx      # Global React Context for user state & session persistence
│   ├── components/
│   │   └── AppLayout.jsx        # Responsive dual-pane layout with sidebar & drawer
│   └── pages/
│       ├── LoginPage.jsx        # Auth login card
│       ├── RegisterPage.jsx     # Auth signup card
│       ├── DashboardPage.jsx    # Metrics, KPIs & recent trips dashboard
│       ├── TripBuilderPage.jsx  # Multi-preference AI trip builder wizard
│       ├── TripsListPage.jsx    # Filterable catalog of user's saved/generated trips
│       └── ItineraryViewPage.jsx# Interactive day-by-day itinerary inspector
```

---

## 7. Interaction Summary

| User Action | Target Component | Frontend Reaction | Backend API Route |
| :--- | :--- | :--- | :--- |
| Register Account | `RegisterPage.jsx` | Stores JWT token, updates `AuthContext`, transitions to `/dashboard` | `POST /api/auth/register` |
| Sign In | `LoginPage.jsx` | Validates credentials, saves token, transitions to `/dashboard` | `POST /api/auth/login` |
| Plan Trip | `TripBuilderPage.jsx` | Shows loading spinner on glowing button, generates itinerary, transitions to `/trips/:id` | `POST /api/trips/generate` |
| Filter Trips | `TripsListPage.jsx` | Instant re-query and animated re-render of trip grid | `GET /api/trips/?status=...` |
| Delete Trip | `TripsListPage.jsx` / `ItineraryViewPage.jsx` | Confirmation modal, removes card from state or redirects | `DELETE /api/trips/:id` |
| Toggle Day Card | `ItineraryViewPage.jsx` | Expands or collapses timeline, meals, and logistics with smooth animation | Local State |
| Save Trip | `ItineraryViewPage.jsx` | Changes badge to emerald "Saved" | `PATCH /api/trips/:id` |
| Regenerate Day | `ItineraryViewPage.jsx` | Shows spinning icon on that day, replaces activities/meals while leaving other days intact | `POST /api/trips/:id/days/:day/regenerate` |
| Regenerate Trip | `ItineraryViewPage.jsx` | Confirms action, recalculates complete itinerary, and updates view | `POST /api/trips/:id/regenerate` |
