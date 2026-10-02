import React, { useState } from 'react';
import { Settings, Save, CheckCircle2 } from 'lucide-react';

export default function AdminSettingsView({
  restaurant,
  onSaveSettings,
  isSaving
}) {
  const [formData, setFormData] = useState({
    name: restaurant?.name || 'The Royal Saffron & Grill',
    tagline: restaurant?.tagline || 'Authentic Flavors, Grand Culinary Tradition',
    logo: restaurant?.logo || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=160&auto=format&fit=crop&q=80',
    address: restaurant?.address || '42 Heritage Boulevard, Gourmet District',
    phone: restaurant?.phone || '+91 98765 43210',
    currency: restaurant?.currency || '₹',
    tax_rate: restaurant?.tax_rate || 5.0,
    online_payment_enabled: restaurant?.online_payment_enabled ? true : false
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '720px' }}>
      <div style={{
        background: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
        padding: '28px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Settings size={22} color="var(--primary)" />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Restaurant & System Settings</h3>
        </div>

        {savedSuccess && (
          <div style={{
            background: '#dcfce7',
            color: '#15803d',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.88rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px',
            border: '1px solid #86efac'
          }}>
            <CheckCircle2 size={18} />
            <span>Settings updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Restaurant Name */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '6px' }}>
              Restaurant Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
            />
          </div>

          {/* Tagline */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '6px' }}>
              Tagline
            </label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="input-field"
            />
          </div>

          {/* Logo URL */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '6px' }}>
              Logo Image URL
            </label>
            <input
              type="url"
              value={formData.logo}
              onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
              className="input-field"
            />
          </div>

          {/* Address & Phone */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '6px' }}>
                Restaurant Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '6px' }}>
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          {/* Currency & Tax Rate */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '6px' }}>
                Currency Symbol
              </label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '6px' }}>
                GST / Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.tax_rate}
                onChange={(e) => setFormData({ ...formData, tax_rate: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          {/* Payment Toggle */}
          <div style={{
            background: 'var(--bg-muted)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Enable Online Payments (UPI / Card)</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                When enabled, customers can choose to pay directly via UPI / Card or at counter.
              </div>
            </div>
            <input
              type="checkbox"
              checked={formData.online_payment_enabled}
              onChange={(e) => setFormData({ ...formData, online_payment_enabled: e.target.checked })}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: 700 }}
          >
            <Save size={18} />
            <span>Save Restaurant Settings</span>
          </button>
        </form>
      </div>
    </div>
  );
}
