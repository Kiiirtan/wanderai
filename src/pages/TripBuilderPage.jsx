import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  Calendar,
  Users,
  Wallet,
  Heart,
  Sparkles,
  Hotel,
  Car,
  MessageSquare,
  Compass,
  Loader,
} from 'lucide-react';
import api from '../api/client';

const INTERESTS = [
  { id: 'sightseeing', label: '🏛️ Sightseeing', },
  { id: 'food', label: '🍕 Food & Dining' },
  { id: 'adventure', label: '🧗 Adventure' },
  { id: 'culture', label: '🎭 Culture & History' },
  { id: 'nature', label: '🌿 Nature' },
  { id: 'shopping', label: '🛍️ Shopping' },
  { id: 'nightlife', label: '🌃 Nightlife' },
  { id: 'relaxation', label: '🧘 Relaxation' },
  { id: 'photography', label: '📸 Photography' },
  { id: 'art', label: '🎨 Art & Museums' },
  { id: 'beach', label: '🏖️ Beach' },
  { id: 'sports', label: '⚽ Sports' },
];

const TRAVEL_STYLES = [
  { value: 'relaxed', label: 'Relaxed', desc: 'Slow pace, lots of downtime' },
  { value: 'balanced', label: 'Balanced', desc: 'Mix of activities and rest' },
  { value: 'packed', label: 'Packed', desc: 'See everything possible' },
];

const BUDGET_LEVELS = [
  { value: 'budget', label: '💰 Budget', desc: 'Under $50/day' },
  { value: 'moderate', label: '💳 Moderate', desc: '$50-150/day' },
  { value: 'premium', label: '💎 Premium', desc: '$150-300/day' },
  { value: 'luxury', label: '👑 Luxury', desc: '$300+/day' },
];

export default function TripBuilderPage() {
  const navigate = useNavigate();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    destination: '',
    start_date: '',
    end_date: '',
    num_travelers: 1,
    travel_style: 'balanced',
    budget_level: 'moderate',
    budget_amount: '',
    currency: 'USD',
    interests: [],
    accommodation_type: 'hotel',
    transportation_mode: 'mixed',
    special_requirements: '',
  });

  const updateField = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const toggleInterest = (id) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter((i) => i !== id)
        : [...prev.interests, id],
    }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.destination.trim()) {
      setError('Please enter a destination');
      return;
    }
    if (!form.start_date || !form.end_date) {
      setError('Please select travel dates');
      return;
    }
    if (new Date(form.end_date) < new Date(form.start_date)) {
      setError('End date must be after start date');
      return;
    }

    setGenerating(true);
    try {
      const tripData = {
        ...form,
        budget_amount: form.budget_amount ? parseFloat(form.budget_amount) : null,
      };
      const trip = await api.generateTrip(tripData);
      navigate(`/trips/${trip.id}`);
    } catch (err) {
      setError(err.message || 'Failed to generate itinerary. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Sparkles size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8, color: 'var(--color-accent-primary-light)' }} />
            Plan Your Trip
          </h1>
          <p className="page-subtitle">Tell us about your dream trip and AI will create the perfect itinerary</p>
        </div>
      </div>

      <div className="page-body">
        <div className="builder-container">
          <form onSubmit={handleGenerate}>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: 'var(--radius-md)',
                  color: '#f87171',
                  fontSize: 'var(--font-size-sm)',
                  marginBottom: 'var(--space-6)',
                }}
              >
                {error}
              </motion.div>
            )}

            {/* Destination & Dates */}
            <motion.div
              className="builder-section glass-card"
              style={{ padding: 'var(--space-6)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="builder-section-title">
                <span className="section-icon"><MapPin size={16} /></span>
                Where & When
              </h3>
              <div className="builder-grid">
                <div className="form-group builder-grid-full">
                  <label className="form-label">Destination</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Paris, France"
                    value={form.destination}
                    onChange={updateField('destination')}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={form.start_date}
                    onChange={updateField('start_date')}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={form.end_date}
                    onChange={updateField('end_date')}
                    required
                  />
                </div>
              </div>
            </motion.div>

            {/* Travelers & Style */}
            <motion.div
              className="builder-section glass-card"
              style={{ padding: 'var(--space-6)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="builder-section-title">
                <span className="section-icon"><Users size={16} /></span>
                Travelers & Style
              </h3>
              <div className="builder-grid">
                <div className="form-group">
                  <label className="form-label">Number of Travelers</label>
                  <input
                    type="number"
                    className="form-input"
                    min="1"
                    max="20"
                    value={form.num_travelers}
                    onChange={updateField('num_travelers')}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Travel Style</label>
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    {TRAVEL_STYLES.map((style) => (
                      <button
                        key={style.value}
                        type="button"
                        className={`chip ${form.travel_style === style.value ? 'active' : ''}`}
                        onClick={() => setForm((prev) => ({ ...prev, travel_style: style.value }))}
                        title={style.desc}
                        style={{ flex: 1, justifyContent: 'center', padding: 'var(--space-2) var(--space-3)' }}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Budget */}
            <motion.div
              className="builder-section glass-card"
              style={{ padding: 'var(--space-6)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="builder-section-title">
                <span className="section-icon"><Wallet size={16} /></span>
                Budget
              </h3>
              <div className="builder-grid">
                <div className="form-group builder-grid-full">
                  <label className="form-label">Budget Level</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                    {BUDGET_LEVELS.map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        className={`chip ${form.budget_level === level.value ? 'active' : ''}`}
                        onClick={() => setForm((prev) => ({ ...prev, budget_level: level.value }))}
                        style={{ padding: 'var(--space-2) var(--space-4)' }}
                      >
                        {level.label}
                        <span style={{ fontSize: 'var(--font-size-xs)', opacity: 0.7, marginLeft: 4 }}>
                          {level.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Total Budget (Optional)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g., 2000"
                    value={form.budget_amount}
                    onChange={updateField('budget_amount')}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Currency</label>
                  <select
                    className="form-select"
                    value={form.currency}
                    onChange={updateField('currency')}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="AUD">AUD (A$)</option>
                    <option value="CAD">CAD (C$)</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Interests */}
            <motion.div
              className="builder-section glass-card"
              style={{ padding: 'var(--space-6)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="builder-section-title">
                <span className="section-icon"><Heart size={16} /></span>
                Interests
              </h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
                Select your interests to personalize your itinerary
              </p>
              <div className="interests-grid">
                {INTERESTS.map((interest) => (
                  <button
                    key={interest.id}
                    type="button"
                    className={`chip ${form.interests.includes(interest.id) ? 'active' : ''}`}
                    onClick={() => toggleInterest(interest.id)}
                    style={{ padding: 'var(--space-2) var(--space-4)' }}
                  >
                    {interest.label}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Accommodation & Transport */}
            <motion.div
              className="builder-section glass-card"
              style={{ padding: 'var(--space-6)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="builder-section-title">
                <span className="section-icon"><Hotel size={16} /></span>
                Accommodation & Transport
              </h3>
              <div className="builder-grid">
                <div className="form-group">
                  <label className="form-label">Accommodation Type</label>
                  <select
                    className="form-select"
                    value={form.accommodation_type}
                    onChange={updateField('accommodation_type')}
                  >
                    <option value="hostel">Hostel</option>
                    <option value="hotel">Hotel</option>
                    <option value="boutique">Boutique Hotel</option>
                    <option value="resort">Resort</option>
                    <option value="airbnb">Airbnb / Vacation Rental</option>
                    <option value="villa">Villa</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Transportation</label>
                  <select
                    className="form-select"
                    value={form.transportation_mode}
                    onChange={updateField('transportation_mode')}
                  >
                    <option value="mixed">Mixed (Public + Walking)</option>
                    <option value="public">Public Transport Only</option>
                    <option value="rental">Rental Car</option>
                    <option value="private">Private Driver</option>
                    <option value="walking">Walking / Cycling</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Special Requirements */}
            <motion.div
              className="builder-section glass-card"
              style={{ padding: 'var(--space-6)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h3 className="builder-section-title">
                <span className="section-icon"><MessageSquare size={16} /></span>
                Special Requirements
              </h3>
              <textarea
                className="form-textarea"
                placeholder="e.g., Vegetarian food options, wheelchair accessible venues, traveling with kids, avoid crowded places..."
                value={form.special_requirements}
                onChange={updateField('special_requirements')}
                rows={3}
              />
            </motion.div>

            {/* Generate Button */}
            <motion.div
              style={{ textAlign: 'center', padding: 'var(--space-4) 0 var(--space-8)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <button
                type="submit"
                className="btn btn-primary btn-lg btn-generate"
                disabled={generating}
                style={{
                  padding: 'var(--space-5) var(--space-12)',
                  fontSize: 'var(--font-size-lg)',
                  borderRadius: 'var(--radius-xl)',
                }}
              >
                {generating ? (
                  <>
                    <Loader size={20} className="loading-spinner" style={{ border: 'none', animation: 'spin 1s linear infinite' }} />
                    Generating Your Itinerary...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Generate AI Itinerary
                  </>
                )}
              </button>
              {generating && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  style={{
                    color: 'var(--color-text-muted)',
                    fontSize: 'var(--font-size-sm)',
                    marginTop: 'var(--space-4)',
                  }}
                >
                  ✨ Our AI is crafting the perfect itinerary for you. This may take a moment...
                </motion.p>
              )}
            </motion.div>
          </form>
        </div>
      </div>
    </>
  );
}
