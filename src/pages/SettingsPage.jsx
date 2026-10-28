import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Bell, Shield, Key } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.full_name || 'Traveler');
  const [email] = useState(user?.email || 'traveler@wanderai.com');
  const [currency, setCurrency] = useState('USD');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a' }}>
          Settings
        </h1>
        <p style={{ fontSize: '0.9375rem', color: '#64748b' }}>
          Manage your account preferences and itinerary defaults
        </p>
      </div>

      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 20,
          padding: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)',
        }}
      >
        <form onSubmit={handleSave}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="field-label">Full Name</label>
            <input
              type="text"
              className="text-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="field-label">Email Address</label>
            <input
              type="email"
              className="text-input"
              value={email}
              disabled
              style={{ background: '#f8fafc', color: '#94a3b8' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="field-label">Preferred Currency</label>
            <select
              className="select-input"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
              <option value="AUD">AUD (A$)</option>
              <option value="CAD">CAD (C$)</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
            {saved && (
              <span style={{ fontSize: '0.8125rem', color: '#059669', fontWeight: 600 }}>
                Preferences updated!
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
