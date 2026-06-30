import React, { useEffect } from "react"
import { Scale, AlertTriangle, FileText, Globe, ArrowLeft } from "lucide-react"

function Terms({ onBack }) {
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
          <Scale size={32} style={{ color: '#60a5fa' }} />
          <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0, color: '#ffffff' }}>Terms of Service</h1>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Last Updated: {lastUpdated} | Terms of Evaluation</p>
      </header>

      <article style={{ lineHeight: '1.7', fontSize: '16px', color: '#ffffff' }}>
        <p style={{ fontSize: '17px', marginBottom: '24px' }}>
          By accessing the <strong>Tipia Demo</strong> dashboard or logging your registration onto our product validation waitlist, you agree to comply with and be bound by the following Terms of Service.
        </p>

        <section style={{ marginBottom: '32px', background: '#1e293b', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', marginTop: 0, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} style={{ color: '#60a5fa' }} /> Important Note: Product Demo Evaluation
          </h2>
          <p style={{ margin: 0, fontSize: '15px', color: '#cbd5e1' }}>
            Tipia is currently in an active <strong>product validation and beta demonstration stage</strong>. It is provided explicitly for testing workflow usability, stock tracking utilities, and offline database synchronization patterns. It does not constitute a finalized commercial product offering.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', marginBottom: '12px' }}>
            1. Account Registration & Use Rules
          </h2>
          <p style={{ color: '#cbd5e1' }}>
            When registering your business on our platform waitlist or using temporary credentials to evaluate the analytics framework, you agree to supply authentic and current information. You are entirely responsible for tracking changes occurring on your local environment instances and safeguarding your validation dashboard session codes.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', marginBottom: '12px' }}>
            2. Intellectual Property Rights
          </h2>
          <p style={{ color: '#cbd5e1' }}>
            All custom code architectures, database synchronization patterns, design setups, user interfaces, layouts, logos, and visual markers containing the **Tipia** name and signature blue software styling are the exclusive property of the developer platform. You may not extract or reverse engineer the local state engine.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} style={{ color: '#f59e0b' }} /> 3. Limitation of Liability
          </h2>
          <p style={{ color: '#cbd5e1' }}>
            The software architecture is supplied to testing users completely on an <strong>"As-Is"</strong> and <strong>"As-Available"</strong> baseline. While our offline storage pipelines are designed to handle dropped connections safely, Tipia shall not be held liable for database sync delays, browser cache clearings, or minor data fluctuations taking place during your demo session.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={18} style={{ color: '#60a5fa' }} /> 4. Governing Law
          </h2>
          <p style={{ color: '#cbd5e1' }}>
            These evaluation terms, rules, and procedures are governed strictly by the laws of the <strong>Federal Republic of Nigeria</strong>. Any discussions or disputes arising from this evaluation environment will be handled directly through local developer channels.
          </p>
        </section>

        <footer style={{ marginTop: '48px', borderTop: '1px solid #334155', paddingTop: '24px', fontSize: '14px', color: '#94a3b8', textAlign: 'center' }}>
          <p>© 2026 Tipia. Terms of validation and system software testing.</p>
        </footer>
      </article>
    </div>
  )
}

export default Terms