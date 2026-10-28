import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Sparkles, MapPin, ArrowRight } from 'lucide-react';

const FEATURED_DESTINATIONS = [
  {
    city: 'Kyoto, Japan',
    tag: 'Culture & Zen',
    desc: 'Ancient wooden shrines, tranquil rock gardens, and bamboo groves.',
    price: '$180/day',
    bg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    emoji: '⛩️',
  },
  {
    city: 'Reykjavik, Iceland',
    tag: 'Adventure & Aurora',
    desc: 'Geothermal lagoons, cascading glacial falls, and volcanic landscapes.',
    price: '$260/day',
    bg: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
    emoji: '🌋',
  },
  {
    city: 'Amalfi Coast, Italy',
    tag: 'Coastal & Culinary',
    desc: 'Pastel cliffside villages, fresh seafood, and Mediterranean lemon groves.',
    price: '$290/day',
    bg: 'linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)',
    emoji: '🍋',
  },
  {
    city: 'Banff, Canada',
    tag: 'Alpine & Nature',
    desc: 'Glacial turquoise lakes, snowcapped Rockies, and scenic trails.',
    price: '$210/day',
    bg: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
    emoji: '🏔️',
  },
];

export default function ExplorePage() {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a' }}>
          Explore Curated Destinations
        </h1>
        <p style={{ fontSize: '0.9375rem', color: '#64748b' }}>
          Get inspired by popular seasonal routes crafted by the travel community
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {FEATURED_DESTINATIONS.map((dest) => (
          <motion.div
            key={dest.city}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.15 }}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                height: 120,
                background: dest.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
              }}
            >
              {dest.emoji}
            </div>

            <div style={{ padding: '1.25rem' }}>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  color: '#d96b4f',
                  letterSpacing: '0.05em',
                }}
              >
                {dest.tag}
              </span>
              <h3
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  marginTop: 2,
                  marginBottom: 6,
                }}
              >
                {dest.city}
              </h3>
              <p
                style={{
                  fontSize: '0.8125rem',
                  color: '#64748b',
                  lineHeight: 1.4,
                  marginBottom: '1rem',
                }}
              >
                {dest.desc}
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid #f1f5f9',
                }}
              >
                <span
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: '#059669',
                  }}
                >
                  {dest.price}
                </span>

                <button
                  onClick={() => navigate('/dashboard')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    background: 'transparent',
                    border: 'none',
                    color: '#d96b4f',
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                  }}
                >
                  Plan This <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
