import React, { useEffect } from "react"
import { Shield, Eye, Lock, Database, ArrowLeft } from "lucide-react"

function Privacy({ onBack }) {
  const lastUpdated = "June 2026"

  // ✅ Automatically scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="legal-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, sans-serif', color: '#ffffff' }}>
      
      {onBack && (
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '14px', marginBottom: '24px', fontWeight: '500' }}>
          <ArrowLeft size={16} /> Back to Application
        </button>
      )}

      <header style={{ marginBottom: '40px', borderBottom: '1px solid #334155', paddingBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <Shield size={32} style={{ color: '#60a5fa' }} />
          <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0, color: '#ffffff' }}>Privacy Policy</h1>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Last Updated: {lastUpdated} | Tipia Platform Beta</p>
      </header>

      <article style={{ lineHeight: '1.7', fontSize: '16px', color: '#ffffff' }}>
        <p style={{ fontSize: '17px', marginBottom: '24px' }}>
          Welcome to <strong>Tipia</strong>. We respect your privacy and are committed to protecting the data of your pharmacy or retail business. This Privacy Policy explains how we collect, use, and safeguard your information in compliance with the <strong>Nigeria Data Protection Act (NDPA)</strong>.
        </p>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Eye size={18} style={{ color: '#60a5fa' }} /> 1. Information We Collect
          </h2>
          <p style={{ color: '#cbd5e1' }}>While using the Tipia Demo interface or joining our validation waitlist, we may collect the following basic business profiles:</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '16px', color: '#cbd5e1' }}>
            <li><strong>Account & Waitlist Details:</strong> Full name, pharmacy business name, active phone number, and email address.</li>
            <li><strong>Operational Metadata:</strong> Local stock counts, drug names, pricing thresholds, and mock transaction logs processed inside your workspace demo session.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={18} style={{ color: '#60a5fa' }} /> 2. Data Architecture & Processing
          </h2>
          <p style={{ color: '#cbd5e1' }}>
            Tipia uses an <strong>offline-first synchronization architecture</strong>. Your raw inventory counts and checkout logs are initially captured and managed using a highly secure local client database structure before securely backing up to our cloud endpoints. 
          </p>
          <p style={{ color: '#cbd5e1' }}>We use this data exclusively to:</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '16px', color: '#cbd5e1' }}>
            <li>Validate systemic features, offline recovery pipelines, and UI modules with real pharmacy setups.</li>
            <li>Coordinate waitlist access queues and push vital build updates regarding platform performance.</li>
            <li>We do <strong>not</strong> sell, lease, or distribute your proprietary commercial transaction streams or pricing models to third-party data aggregators.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={18} style={{ color: '#60a5fa' }} /> 3. Information Security
          </h2>
          <p style={{ color: '#cbd5e1' }}>
            We implement industry-standard network protocols and localized encryption safeguards to keep your records protected. Since the software is operating in a validation environment, we strictly restrict internal access to any backend server resources.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', marginBottom: '12px' }}>
            4. Your Data Protection Rights
          </h2>
          <p style={{ color: '#cbd5e1' }}>
            In alignment with the NDPA framework, you retain full ownership rights over your operational details. At any single moment during this preview lifecycle, you can request full erasure or deletion of your recorded business profile and waitlist entries by contacting our developer channels.
          </p>
        </section>

        <footer style={{ marginTop: '48px', borderTop: '1px solid #334155', paddingTop: '24px', fontSize: '14px', color: '#94a3b8', textAlign: 'center' }}>
          <p>© 2026 Tipia. Built for local retail validation excellence.</p>
        </footer>
      </article>
    </div>
  )
}

export default Privacy