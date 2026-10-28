import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Users,
  DollarSign,
  MapPin,
  Clock,
  Star,
  Utensils,
  Hotel,
  Bus,
  Lightbulb,
  RefreshCw,
  Save,
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit3,
  Compass,
  Sparkles,
} from 'lucide-react';
import api from '../api/client';

export default function ItineraryViewPage() {
  const params = useParams();
  const tripId = params.tripId || params.id;
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedDays, setExpandedDays] = useState({});
  const [regenerating, setRegenerating] = useState(false);
  const [regeneratingDay, setRegeneratingDay] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTrip();
  }, [tripId]);

  const loadTrip = async () => {
    try {
      const data = await api.getTrip(tripId);
      setTrip(data);
      // Expand first day by default
      if (data.itinerary_days?.length > 0) {
        setExpandedDays({ [data.itinerary_days[0].day_number]: true });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (dayNum) => {
    setExpandedDays((prev) => ({ ...prev, [dayNum]: !prev[dayNum] }));
  };

  const expandAll = () => {
    const all = {};
    trip.itinerary_days.forEach((d) => (all[d.day_number] = true));
    setExpandedDays(all);
  };

  const collapseAll = () => setExpandedDays({});

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateTrip(tripId, { status: 'saved' });
      setTrip((prev) => ({ ...prev, status: 'saved' }));
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerate = async () => {
    if (!confirm('Regenerate the entire itinerary? This will replace all current days.')) return;
    setRegenerating(true);
    try {
      const data = await api.regenerateTrip(tripId);
      setTrip(data);
    } catch (err) {
      console.error(err);
    } finally {
      setRegenerating(false);
    }
  };

  const handleRegenerateDay = async (dayNumber) => {
    setRegeneratingDay(dayNumber);
    try {
      const newDay = await api.regenerateDay(tripId, dayNumber);
      setTrip((prev) => ({
        ...prev,
        itinerary_days: prev.itinerary_days.map((d) =>
          d.day_number === dayNumber ? { ...d, ...newDay } : d
        ),
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setRegeneratingDay(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this trip permanently?')) return;
    try {
      await api.deleteTrip(tripId);
      navigate('/trips');
    } catch (err) {
      console.error(err);
    }
  };

  const getCurrencySymbol = (currency) => {
    const symbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥', AUD: 'A$', CAD: 'C$' };
    return symbols[currency] || currency;
  };

  if (loading) {
    return (
      <div className="loading-page" style={{ minHeight: '80vh' }}>
        <div className="loading-spinner lg" />
        <div className="loading-text">Loading your itinerary...</div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="empty-state" style={{ minHeight: '80vh' }}>
        <h3>Trip not found</h3>
        <button className="btn btn-primary" onClick={() => navigate('/trips')}>
          Back to Trips
        </button>
      </div>
    );
  }

  const curr = getCurrencySymbol(trip.currency);
  const days = trip.itinerary_days || [];

  return (
    <>
      {/* Header */}
      <div className="itinerary-header">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate(-1)}
          style={{ marginBottom: 'var(--space-4)' }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <motion.h1
          className="itinerary-title"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {trip.title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-base)', maxWidth: 600 }}
        >
          {trip.destination}
        </motion.p>

        <div className="itinerary-meta">
          <div className="itinerary-meta-item">
            <Calendar size={16} />
            {trip.start_date} → {trip.end_date}
          </div>
          <div className="itinerary-meta-item">
            <Users size={16} />
            {trip.num_travelers} traveler{trip.num_travelers > 1 ? 's' : ''}
          </div>
          <div className="itinerary-meta-item">
            <DollarSign size={16} />
            {trip.estimated_cost
              ? `${curr}${trip.estimated_cost.toLocaleString()} estimated`
              : trip.budget_level}
          </div>
          <div className="itinerary-meta-item">
            <Compass size={16} />
            {trip.travel_style} pace
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
          marginTop: 'var(--space-6)',
        }}>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleSave}
            disabled={saving || trip.status === 'saved'}
          >
            {saving ? <span className="loading-spinner" /> : <Save size={14} />}
            {trip.status === 'saved' ? 'Saved ✓' : 'Save Trip'}
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleRegenerate}
            disabled={regenerating}
          >
            {regenerating ? <span className="loading-spinner" /> : <RefreshCw size={14} />}
            Regenerate All
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={expandAll}
          >
            Expand All
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={collapseAll}
          >
            Collapse All
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={handleDelete}
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      {/* Day Timeline */}
      <div className="day-timeline">
        {days.length === 0 ? (
          <div className="empty-state">
            <p>No itinerary days generated yet.</p>
            <button className="btn btn-primary" onClick={handleRegenerate}>
              <Sparkles size={18} /> Generate Itinerary
            </button>
          </div>
        ) : (
          days.map((day, index) => (
            <motion.div
              key={day.id || day.day_number}
              className="day-card glass-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {/* Day Header */}
              <div
                className="day-card-header"
                onClick={() => toggleDay(day.day_number)}
              >
                <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div className="day-number-badge">{day.day_number}</div>
                  <div className="day-info">
                    <div className="day-theme">{day.theme || `Day ${day.day_number}`}</div>
                    <div className="day-date">{day.date}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                  {day.estimated_cost && (
                    <span className="day-cost">{curr}{day.estimated_cost}</span>
                  )}
                  <button
                    className="btn btn-ghost btn-icon btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRegenerateDay(day.day_number);
                    }}
                    disabled={regeneratingDay === day.day_number}
                    title="Regenerate this day"
                  >
                    {regeneratingDay === day.day_number ? (
                      <span className="loading-spinner" />
                    ) : (
                      <RefreshCw size={14} />
                    )}
                  </button>
                  {expandedDays[day.day_number] ? (
                    <ChevronUp size={20} style={{ color: 'var(--color-text-muted)' }} />
                  ) : (
                    <ChevronDown size={20} style={{ color: 'var(--color-text-muted)' }} />
                  )}
                </div>
              </div>

              {/* Day Content - Expandable */}
              <AnimatePresence>
                {expandedDays[day.day_number] && (
                  <motion.div
                    className="day-content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ overflow: 'hidden' }}
                  >
                    {/* Summary */}
                    {day.summary && (
                      <p style={{
                        color: 'var(--color-text-secondary)',
                        fontSize: 'var(--font-size-sm)',
                        marginBottom: 'var(--space-6)',
                        padding: 'var(--space-3) var(--space-4)',
                        background: 'var(--color-bg-glass)',
                        borderRadius: 'var(--radius-md)',
                        borderLeft: '3px solid var(--color-accent-primary)',
                      }}>
                        {day.summary}
                      </p>
                    )}

                    {/* Activities */}
                    {day.activities?.length > 0 && (
                      <div style={{ marginBottom: 'var(--space-6)' }}>
                        <div className="section-title-sm">
                          <MapPin size={14} /> Activities
                        </div>
                        <div className="activity-list">
                          {day.activities.map((activity, ai) => (
                            <div key={ai} className="activity-card">
                              <div className="activity-time">
                                <Clock size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                                {activity.time}
                              </div>
                              <div className="activity-details">
                                <div className="activity-name">{activity.name}</div>
                                <div className="activity-description">{activity.description}</div>
                                <div className="activity-meta">
                                  {activity.location && (
                                    <span className="activity-meta-item">
                                      <MapPin size={11} /> {activity.location}
                                    </span>
                                  )}
                                  {activity.cost > 0 && (
                                    <span className="activity-meta-item" style={{ color: 'var(--color-accent-success)' }}>
                                      <DollarSign size={11} /> {curr}{activity.cost}
                                    </span>
                                  )}
                                  {activity.rating > 0 && (
                                    <span className="activity-meta-item" style={{ color: 'var(--color-accent-tertiary)' }}>
                                      <Star size={11} /> {activity.rating}
                                    </span>
                                  )}
                                  {activity.category && (
                                    <span className="badge badge-primary" style={{ fontSize: '10px' }}>
                                      {activity.category}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Meals */}
                    {day.meals?.length > 0 && (
                      <div style={{ marginBottom: 'var(--space-6)' }}>
                        <div className="section-title-sm">
                          <Utensils size={14} /> Dining
                        </div>
                        <div className="meals-grid">
                          {day.meals.map((meal, mi) => (
                            <div key={mi} className="meal-card">
                              <div className="meal-type">
                                {meal.type === 'breakfast' ? '☀️' : meal.type === 'lunch' ? '🌤️' : '🌙'}{' '}
                                {meal.type}
                              </div>
                              <div className="meal-restaurant">{meal.restaurant}</div>
                              <div className="meal-cuisine">{meal.cuisine}</div>
                              {meal.description && (
                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
                                  {meal.description}
                                </p>
                              )}
                              {meal.price_range > 0 && (
                                <div className="meal-price">{curr}{meal.price_range}/person</div>
                              )}
                              {meal.location && (
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <MapPin size={10} /> {meal.location}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Accommodation */}
                    {day.accommodation && (
                      <div style={{ marginBottom: 'var(--space-6)' }}>
                        <div className="section-title-sm">
                          <Hotel size={14} /> Accommodation
                        </div>
                        <div className="activity-card">
                          <div style={{ flex: 1 }}>
                            <div className="activity-name">{day.accommodation.name}</div>
                            <div className="activity-meta" style={{ marginTop: 'var(--space-2)' }}>
                              {day.accommodation.area && (
                                <span className="activity-meta-item">
                                  <MapPin size={11} /> {day.accommodation.area}
                                </span>
                              )}
                              {day.accommodation.price_per_night > 0 && (
                                <span className="activity-meta-item" style={{ color: 'var(--color-accent-success)' }}>
                                  <DollarSign size={11} /> {curr}{day.accommodation.price_per_night}/night
                                </span>
                              )}
                              {day.accommodation.rating > 0 && (
                                <span className="activity-meta-item" style={{ color: 'var(--color-accent-tertiary)' }}>
                                  <Star size={11} /> {day.accommodation.rating}
                                </span>
                              )}
                              <span className="badge badge-primary" style={{ fontSize: '10px' }}>
                                {day.accommodation.type}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Transportation */}
                    {day.transportation?.length > 0 && (
                      <div style={{ marginBottom: 'var(--space-6)' }}>
                        <div className="section-title-sm">
                          <Bus size={14} /> Transportation
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                          {day.transportation.map((t, ti) => (
                            <div
                              key={ti}
                              style={{
                                padding: 'var(--space-3) var(--space-4)',
                                background: 'var(--color-bg-glass)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: 'var(--font-size-sm)',
                              }}
                            >
                              <strong style={{ color: 'var(--color-accent-secondary)' }}>{t.mode}</strong>
                              {' — '}{t.description}
                              {t.cost > 0 && (
                                <span style={{ color: 'var(--color-accent-success)', marginLeft: 8 }}>
                                  {curr}{t.cost}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tips */}
                    {day.tips?.length > 0 && (
                      <div>
                        <div className="section-title-sm">
                          <Lightbulb size={14} /> Pro Tips
                        </div>
                        <div className="tips-list">
                          {day.tips.map((tip, ti) => (
                            <div key={ti} className="tip-item">
                              💡 {tip}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>
    </>
  );
}
