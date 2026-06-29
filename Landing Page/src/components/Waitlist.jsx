// src/components/WaitlistForm.jsx
import { useState } from 'react';
import { submitToWaitlist } from '../services/api';

export default function WaitlistForm() {
  const [formData, setFormData] = useState({
    pharmacyName: '',
    email: '',
    address: '',
    faxNumber: '' // Honeypot field to block spam bots
  });
  
  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: null,
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Client-Side Integrity Boundary Check
    if (!formData.pharmacyName.trim() || !formData.email.trim() || !formData.address.trim()) {
      setStatus({ loading: false, success: false, error: 'Please fill out all available fields.', message: '' });
      return;
    }

    // 2. Honeypot Validation Strategy (Instant silent block if a bot completes hidden input)
    if (formData.faxNumber) {
      setStatus({ loading: false, success: false, error: 'Spam validation block triggered.', message: '' });
      return;
    }

    setStatus({ loading: true, success: false, error: null, message: '' });

    try {
      // 3. Dispatch data payload through the api.js service architecture
      const dataResponse = await submitToWaitlist(formData);
      
      setStatus({
        loading: false,
        success: true,
        error: null,
        message: dataResponse.message || 'Successfully registered on the waitlist!'
      });

      // Clear input buffers upon successful creation record commitment
      setFormData({ pharmacyName: '', email: '', address: '', faxNumber: '' });
    } catch (err) {
      // 4. Intelligently map custom backend error strings (e.g., Email duplicate conflicts) to UI
      setStatus({
        loading: false,
        success: false,
        error: err.message || 'The registration server could not be reached. Check your internet connection.',
        message: ''
      });
    }
  };

  return (
    <div id="waitlist" style={{ maxWidth: '460px', margin: '40px auto', padding: '24px', background: '#0f172a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', color: '#f8fafc', fontFamily: 'sans-serif', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)' }}>
      <h2 style={{ fontSize: '24px', marginBottom: '8px', color: '#38bdf8', fontWeight: '700', letterSpacing: '-0.025em' }}>Join the Tipia Waitlist</h2>
      <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' }}>Secure early dashboard access for your pharmacy management systems today.</p>

      {/* Alert Error Notification System Banner */}
      {status.error && (
        <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '6px', color: '#fca5a5', fontSize: '13px', marginBottom: '16px', fontWeight: '500' }}>
          {status.error}
        </div>
      )}

      {/* RENDER THE DEMO SUCCESS ACTION PANEL IF EVERYTHING IS OK */}
      {status.success ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid #10b981', borderRadius: '8px', color: '#a7f3d0', fontSize: '14px', fontWeight: '500', lineHeight: '1.6' }}>
            {status.message}
          </div>
          
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <p style={{ color: '#cbd5e1', fontSize: '14px', marginBottom: '16px' }}>
              Want to see Tipia in action right now? Experience our core inventory features instantly:
            </p>
            
            <a
              href="/demo"
              style={{ display: 'block', textDecoration: 'none', textAlign: 'center', padding: '14px', background: '#2563eb', color: '#ffffff', borderRadius: '6px', fontSize: '15px', fontWeight: '600', transition: 'all 0.2s ease', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }}
              onMouseOver={(e) => e.currentTarget.style.background = '#1d4ed8'}
              onMouseOut={(e) => e.currentTarget.style.background = '#2563eb'}
            >
              Try Free Demo →
            </a>
          </div>
        </div>
      ) : (
        /* OTHERWISE RENDER THE STANDARD INPUT COLLECTOR FORM */
        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Field 1: Pharmacy Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="pharmacyName" style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1' }}>Pharmacy Name</label>
            <input
              type="text"
              id="pharmacyName"
              name="pharmacyName"
              value={formData.pharmacyName}
              onChange={handleInputChange}
              placeholder="e.g., Your Pharmacy Name"
              disabled={status.loading}
              style={{ padding: '10px 12px', background: '#111827', border: '1px solid #334155', borderRadius: '6px', color: '#f8fafc', fontSize: '14px', outline: 'none' }}
            />
          </div>

          {/* Field 2: Email Address */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="email" style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1' }}>Business Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="contact@yourpharmacy.com"
              disabled={status.loading}
              style={{ padding: '10px 12px', background: '#111827', border: '1px solid #334155', borderRadius: '6px', color: '#f8fafc', fontSize: '14px', outline: 'none' }}
            />
          </div>

          {/* Field 3: Physical Address */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="address" style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1' }}>Premises/Physical Address</label>
            <textarea
              id="address"
              name="address"
              rows="3"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter the full street address, city, and state"
              disabled={status.loading}
              style={{ padding: '10px 12px', background: '#111827', border: '1px solid #334155', borderRadius: '6px', color: '#f8fafc', fontSize: '14px', outline: 'none', resize: 'none', fontFamily: 'sans-serif', lineHeight: '1.5' }}
            />
          </div>

          {/* HONEYPOT FIELD: Invisible to human users */}
          <div style={{ display: 'none' }}>
            <label htmlFor="faxNumber">Fax Number</label>
            <input
              type="text"
              id="faxNumber"
              name="faxNumber"
              value={formData.faxNumber}
              onChange={handleInputChange}
              tabIndex="-1"
              autoComplete="off"
            />
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={status.loading}
            style={{ padding: '12px', marginTop: '8px', background: status.loading ? '#1e293b' : '#2563eb', color: status.loading ? '#64748b' : '#ffffff', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: status.loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s ease', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)' }}
          >
            {status.loading ? 'Registering Pharmacy...' : 'Get Early Access'}
          </button>
        </form>
      )}
    </div>
  );
}