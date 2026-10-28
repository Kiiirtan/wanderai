import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, PlusCircle, Trash2, ArrowRight } from 'lucide-react';
import api from '../api/client';

export default function TripsListPage({ defaultFilter = 'all' }) {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(defaultFilter);

  useEffect(() => {
    loadTrips();
  }, [filter]);

  const loadTrips = async () => {
    setLoading(true);
    try {
      const data = await api.listTrips(filter === 'all' ? undefined : filter);
      setTrips(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, tripId) => {
    e.stopPropagation();
    if (!confirm('Delete this trip? This cannot be undone.')) return;
    try {
      await api.deleteTrip(tripId);
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
    } catch (err) {
      console.error(err);
    }
  };

  const filters = [
    { value: 'all', label: 'All Itineraries' },
    { value: 'saved', label: 'Saved' },
    { value: 'generated', label: 'Generated' },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a' }}>
            Itineraries
          </h1>
          <p style={{ fontSize: '0.9375rem', color: '#64748b' }}>
            View and manage your personalized travel itineraries
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => navigate('/dashboard')}
        >
          <PlusCircle size={16} /> New Itinerary
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '2rem' }}>
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            style={{
              padding: '6px 16px',
              borderRadius: 9999,
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid',
              borderColor: filter === f.value ? '#d96b4f' : '#e2e8f0',
              background: filter === f.value ? '#fbeee9' : '#ffffff',
              color: filter === f.value ? '#c04e33' : '#475569',
              transition: 'all 0.15s ease',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid of trips */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
          Loading itineraries...
        </div>
      ) : trips.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {trips.map((trip) => (
            <motion.div
              key={trip.id}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.15 }}
              onClick={() => navigate(`/trips/${trip.id}`)}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 16,
                padding: '1.25rem',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: 9999,
                      background:
                        trip.status === 'saved' ? '#ecfdf5' : '#f1f5f9',
                      color:
                        trip.status === 'saved' ? '#065f46' : '#475569',
                    }}
                  >
                    {trip.status === 'saved' ? 'Saved' : 'Generated'}
                  </span>

                  <button
                    onClick={(e) => handleDelete(e, trip.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: 4,
                    }}
                    title="Delete Itinerary"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <h3
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    marginBottom: 6,
                  }}
                >
                  {trip.title || trip.destination}
                </h3>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '0.8125rem',
                    color: '#64748b',
                    marginBottom: 4,
                  }}
                >
                  <MapPin size={14} color="#d96b4f" />
                  <span>{trip.destination}</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '0.8125rem',
                    color: '#64748b',
                  }}
                >
                  <Calendar size={14} />
                  <span>
                    {trip.start_date} – {trip.end_date}
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '1.25rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid #f1f5f9',
                }}
              >
                <span
                  style={{
                    fontSize: '0.9375rem',
                    fontWeight: 700,
                    color: '#059669',
                  }}
                >
                  ${(trip.estimated_cost || 0).toLocaleString()}
                </span>

                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: '0.8125rem',
                    color: '#d96b4f',
                    fontWeight: 600,
                  }}
                >
                  View Details <ArrowRight size={14} />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 16,
            padding: '3.5rem 1.5rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              color: '#94a3b8',
            }}
          >
            <MapPin size={24} />
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
            No Itineraries Found
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem' }}>
            Ready to plan your next journey? Create your first personalized AI itinerary.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/dashboard')}
          >
            Plan a Trip
          </button>
        </div>
      )}
    </div>
  );
}
