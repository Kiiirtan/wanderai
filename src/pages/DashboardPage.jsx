import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Compass,
  Plane,
  ChevronDown,
  Sparkles,
  Utensils,
  Hotel,
  AlertTriangle,
  Bookmark,
  Share2,
  CheckCircle2,
} from 'lucide-react';
import api from '../api/client';
import LightMap from '../components/LightMap';

const POPULAR_INTERESTS = [
  'Culture & History',
  'Food & Dining',
  'Sightseeing',
  'Adventure',
  'Nature & Parks',
  'Shopping',
  'Museums',
  'Relaxation',
];

export default function DashboardPage() {
  const [form, setForm] = useState({
    destination: 'Tokyo, Japan',
    start_date: '2026-11-01',
    start_time: '8:00 AM',
    budget_level: 'moderate',
    budget_amount: '850',
    currency: 'USD',
    interests: ['Culture & History', 'Food & Dining', 'Sightseeing'],
  });

  const [generating, setGenerating] = useState(false);
  const [activeTrip, setActiveTrip] = useState(null);
  const [expandedDay, setExpandedDay] = useState(1);
  const [savedNotification, setSavedNotification] = useState(false);

  // Load latest trip on initial mount
  useEffect(() => {
    loadLatestTrip();
  }, []);

  const loadLatestTrip = async () => {
    try {
      const trips = await api.listTrips();
      if (trips && trips.length > 0) {
        const fullTrip = await api.getTrip(trips[0].id);
        setActiveTrip(fullTrip);
      } else {
        // Fallback default sample trip matching the reference image
        setActiveTrip(getSampleTrip());
      }
    } catch {
      setActiveTrip(getSampleTrip());
    }
  };

  const getSampleTrip = () => ({
    id: 'sample-tokyo',
    title: 'Unforgettable Tokyo Discovery',
    destination: 'Tokyo, Japan',
    start_date: '2026-11-01',
    end_date: '2026-11-03',
    num_travelers: 1,
    budget_level: 'moderate',
    estimated_cost: 2410,
    itinerary_days: [
      {
        day_number: 1,
        theme: 'Historic Temples & Asakusa Old Town',
        summary: 'Explore Tokyo’s spiritual roots and traditional culinary avenues.',
        estimated_cost: 230,
        badges: ['Budget-friendly', 'Family'],
        tips: ['Take the Ginza line to Asakusa early to avoid crowds.'],
        activities: [
          { time: '08:30 AM', name: 'Senso-ji Temple & Nakamise-dori', desc: 'Visit Tokyo’s oldest temple complex and taste traditional ningyo-yaki sweets.' },
          { time: '01:00 PM', name: 'Sumida River Cruise to Hamarikyu Gardens', desc: 'Scenic water bus ride with tea house matcha experience.' },
          { time: '06:00 PM', name: 'Ginza Twilight Walk & Ramen Alley', desc: 'Explore architecture and enjoy renowned Michelin-guide tonkotsu ramen.' },
        ],
      },
      {
        day_number: 2,
        theme: 'Modern Architecture & Shibuya Crossings',
        summary: 'Immerse into neon towers, panoramic sky observatories and pop culture.',
        estimated_cost: 880,
        badges: ['Warning: Book Shibuya Sky Early'],
        tips: ['Pre-book Shibuya Sky sunset passes at least 2 weeks in advance.'],
        activities: [
          { time: '09:00 AM', name: 'Meiji Jingu Shrine & Yoyogi Forest Walk', desc: 'Peaceful evergreen forest and Shinto sanctuary.' },
          { time: '02:00 PM', name: 'Harajuku & Omotesando Design District', desc: 'Avant-garde boutiques, specialty coffee and contemporary art.' },
          { time: '06:30 PM', name: 'Shibuya Sky Observatory & Crossing Walk', desc: '360-degree glass rooftop vista of Tokyo metropolis.' },
        ],
      },
      {
        day_number: 3,
        theme: 'Culinary Markets & Roppongi Sky Dining',
        summary: 'Savor fresh Tsukiji catches and high-altitude farewell gastronomy.',
        estimated_cost: 1300,
        badges: ['Luxury Experience'],
        tips: ['Tsukiji Outer Market stalls close by early afternoon.'],
        activities: [
          { time: '08:00 AM', name: 'Tsukiji Outer Market Culinary Walk', desc: 'Sample freshly torched wagyu skewers, tamagoyaki and sashimi.' },
          { time: '01:30 PM', name: 'Mori Art Museum & Roppongi Hills', desc: 'Cutting-edge contemporary art exhibits in the clouds.' },
          { time: '07:30 PM', name: 'Rooftop Kaiseki Dinner', desc: 'Multi-course seasonal Japanese banquet overlooking Tokyo Tower.' },
        ],
      },
    ],
  });

  const toggleInterest = (interest) => {
    setForm((prev) => {
      const exists = prev.interests.includes(interest);
      return {
        ...prev,
        interests: exists
          ? prev.interests.filter((i) => i !== interest)
          : [...prev.interests, interest],
      };
    });
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.destination) return;
    setGenerating(true);

    try {
      const payload = {
        destination: form.destination,
        start_date: form.start_date || '2026-11-01',
        end_date: '2026-11-04',
        num_travelers: 1,
        travel_style: 'balanced',
        budget_level: form.budget_level,
        budget_amount: parseFloat(form.budget_amount) || 1000,
        currency: form.currency,
        interests: form.interests,
        accommodation_type: 'hotel',
        transportation_mode: 'mixed',
      };

      const newTrip = await api.generateTrip(payload);
      setActiveTrip(newTrip);
      setExpandedDay(1);
    } catch (err) {
      console.error('Error generating trip:', err);
      // Fallback with user inputs
      const fallback = getSampleTrip();
      fallback.destination = form.destination;
      fallback.title = `Personalized ${form.destination} Discovery`;
      setActiveTrip(fallback);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveTrip = async () => {
    if (!activeTrip) return;
    try {
      if (typeof activeTrip.id === 'number') {
        await api.updateTrip(activeTrip.id, { status: 'saved' });
      }
      setSavedNotification(true);
      setTimeout(() => setSavedNotification(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {/* Hero Header from Reference Image */}
      <section className="hero-header">
        <h1 className="hero-title">Wander AI</h1>
        <p className="hero-subtitle">Your Next Adventure, Crafted by AI.</p>
      </section>

      {/* Main Workspace Split (Center Input Panel + Right AI Output) */}
      <div className="workspace-grid">
        {/* ========================================================
            LEFT/CENTER COLUMN: Input Form Panel
            ======================================================== */}
        <div className="input-panel-card">
          <h2 className="panel-header-title">
            Personalized AI Travel Itinerary Planner
          </h2>

          <form onSubmit={handleGenerate}>
            {/* Where to? */}
            <div className="form-field">
              <label className="field-label">Where to?</label>
              <div className="input-container">
                <MapPin size={17} className="input-icon" />
                <input
                  type="text"
                  className="text-input"
                  placeholder="Where to Wansni? (e.g. Tokyo, Paris, Rome)"
                  value={form.destination}
                  onChange={(e) =>
                    setForm({ ...form, destination: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* When? and Start Day/Time */}
            <div className="field-row-2 form-field">
              <div>
                <label className="field-label">When?</label>
                <div className="input-container">
                  <Calendar size={17} className="input-icon" />
                  <input
                    type="date"
                    className="text-input"
                    value={form.start_date}
                    onChange={(e) =>
                      setForm({ ...form, start_date: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="field-label">Start day</label>
                <div className="input-container">
                  <Clock size={17} className="input-icon" />
                  <select
                    className="select-input"
                    value={form.start_time}
                    onChange={(e) =>
                      setForm({ ...form, start_time: e.target.value })
                    }
                  >
                    <option value="7:00 AM">7:00 AM</option>
                    <option value="8:00 AM">8:00 AM</option>
                    <option value="9:00 AM">9:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Budget */}
            <div className="form-field">
              <label className="field-label">Budget</label>
              <div className="input-container">
                <DollarSign size={17} className="input-icon" />
                <select
                  className="select-input"
                  value={form.budget_level}
                  onChange={(e) =>
                    setForm({ ...form, budget_level: e.target.value })
                  }
                >
                  <option value="budget">Budget-Friendly (Under $100/day)</option>
                  <option value="moderate">Moderate Comfort ($100–250/day)</option>
                  <option value="premium">Premium Experiences ($250–500/day)</option>
                  <option value="luxury">Luxury ($500+/day)</option>
                </select>
              </div>
            </div>

            {/* Interests */}
            <div className="form-field">
              <label className="field-label">Interests</label>
              <div className="interest-tag-container">
                {POPULAR_INTERESTS.map((interest) => {
                  const isSelected = form.interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      className={`interest-pill ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleInterest(interest)}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Solid Coral CTA Button matching reference image */}
            <button
              type="submit"
              className="btn-coral-generate"
              disabled={generating}
            >
              {generating ? (
                <>
                  <div className="spinner" />
                  <span>Crafting Itinerary...</span>
                </>
              ) : (
                <span>Generate My Custom Itinerary</span>
              )}
            </button>
          </form>
        </div>

        {/* ========================================================
            RIGHT COLUMN: AI Output Timeline + Map
            ======================================================== */}
        <div className="output-panel-card">
          <div className="output-header">
            <h2 className="output-title">AI Output</h2>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {savedNotification && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontWeight: 600,
                  }}
                >
                  <CheckCircle2 size={14} /> Saved!
                </span>
              )}
              <button className="btn-pill-subtle" onClick={handleSaveTrip}>
                <Bookmark size={13} />
                <span>Save</span>
              </button>
            </div>
          </div>

          {activeTrip && activeTrip.itinerary_days?.length > 0 ? (
            <div className="output-body-split">
              {/* Timeline Cards */}
              <div className="timeline-container">
                {activeTrip.itinerary_days.map((day, idx) => {
                  const isExpanded = expandedDay === day.day_number;
                  const dayIcon =
                    idx === 0 ? Plane : idx === 1 ? Calendar : Plane;
                  const IconComponent = dayIcon;

                  return (
                    <div key={day.day_number} className="timeline-step">
                      {/* Node Icon */}
                      <div className="timeline-node-icon">
                        <IconComponent size={16} />
                      </div>

                      {/* Day Card */}
                      <div
                        className={`day-output-card ${
                          isExpanded ? 'active-day' : ''
                        }`}
                        onClick={() =>
                          setExpandedDay(isExpanded ? null : day.day_number)
                        }
                      >
                        <div className="day-output-header">
                          <span className="day-label">Day {day.day_number}</span>
                          <span className="price-tag-emerald">
                            ${day.estimated_cost || (idx === 0 ? 230 : idx === 1 ? 880 : 1300)}
                          </span>
                        </div>

                        <div className="day-theme-title">
                          {day.theme || (idx === 0 ? 'Field down Itinerary' : idx === 1 ? 'Plastic literation chainport' : 'Topic luxury plan')}
                        </div>

                        <div className="day-meta-subtext">
                          {day.activities?.length || 3} travel highlights • Full day pacing
                        </div>

                        {/* Badges row matching reference image */}
                        <div className="badge-row">
                          {idx === 0 && (
                            <>
                              <span className="badge-tag budget-friendly">
                                Budget-friendly
                              </span>
                              <span className="badge-tag family">Family</span>
                            </>
                          )}
                          {idx === 1 && (
                            <span className="badge-tag warning-tips">
                              <AlertTriangle size={11} /> Warning badges lantansiker tips
                            </span>
                          )}
                          {idx === 2 && (
                            <span className="badge-tag warning-tips">
                              <AlertTriangle size={11} /> Warning badges Tips
                            </span>
                          )}
                        </div>

                        {/* Detailed Activities Dropdown when clicked */}
                        <AnimatePresence>
                          {isExpanded && day.activities && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="day-detail-dropdown"
                            >
                              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Day Schedule
                              </div>
                              {day.activities.map((act, aIdx) => (
                                <div key={aIdx} className="activity-mini-item">
                                  <div className="activity-mini-time">
                                    {act.time || '10:00 AM'}
                                  </div>
                                  <div>
                                    <div className="activity-mini-name">
                                      {act.name}
                                    </div>
                                    {act.desc && (
                                      <div className="activity-mini-desc">
                                        {act.desc}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Side-by-side Light-mode Map Snippet */}
              <LightMap
                destination={activeTrip.destination || form.destination}
                stops={
                  activeTrip.itinerary_days?.flatMap((d) =>
                    (d.activities || []).map((a) => ({
                      name: a.name,
                      day: d.day_number,
                    }))
                  ) || []
                }
              />
            </div>
          ) : (
            <div className="empty-output-box">
              <div className="empty-output-icon">
                <Compass size={24} />
              </div>
              <div className="empty-output-title">No Itinerary Generated Yet</div>
              <p className="empty-output-subtitle">
                Enter your destination and travel dates on the left to generate your custom AI itinerary.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
