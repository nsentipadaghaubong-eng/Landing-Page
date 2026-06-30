import React from "react"
import { Link } from "react-router-dom"

function Footer() {
  return (
    <footer className="footer" style={{ borderTop: "1px solid #1e293b", padding: "40px 20px 20px 20px" }}>
      <div className="footer-container" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "24px" }}>
        
        {/* BRAND IDENTITY */}
        <div className="footer-brand" style={{ maxWidth: "400px" }}>
          <h3 style={{ color: "#addfff", marginBottom: "8px", fontWeight: "700" }}>Tipia</h3>
          <p style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.5" }}>
            Offline-first inventory management built for pharmacies and retail businesses. 
            Track your shelf stock and prevent losses seamlessly.
          </p>
        </div>

        {/* LOGICAL LEGAL & CONTACT LINKS */}
        <div className="footer-links" style={{ display: "flex", gap: "40px" }}>
          <div>
            <h4 style={{ color: "#f8fafc", fontSize: "14px", marginBottom: "12px" }}>Legal</h4>
            {/* ✅ Using Link components for instant client-side routing */}
            <Link to="/privacy" style={{ display: "block", color: "#64748b", fontSize: "14px", textDecoration: "none", marginBottom: "8px" }}>
              Privacy Policy
            </Link>
            <Link to="/terms" style={{ display: "block", color: "#64748b", fontSize: "14px", textDecoration: "none" }}>
              Terms of Service
            </Link>
          </div>

          <div>
            <h4 style={{ color: "#f8fafc", fontSize: "14px", marginBottom: "12px" }}>Support</h4>
            
            {/* Direct Phone Call */}
            <a href="tel:09012674911" style={{ display: "block", color: "#64748b", fontSize: "14px", textDecoration: "none", marginBottom: "12px" }}>
              📞 Call: 09012674911
            </a>

            {/* Click-to-Chat WhatsApp Support */}
            <a 
              href="https://wa.me/2348139671080?text=Hello%20Tipia%20Support%2C%20I%27m%20using%20the%20demo%20and%20had%20a%20question..." 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                color: "#10b981", 
                fontSize: "14px", 
                textDecoration: "none",
                fontWeight: "500"
              }}
            >
              💬 Chat on WhatsApp
            </a>
          </div>
        </div>

      </div>

      {/* FOOTER COPYRIGHT ASSIGNMENT */}
      <div className="footer-bottom" style={{ marginTop: "40px", paddingTop: "16px", borderTop: "1px solid #1e293b", textAlign: "center" }}>
        <p style={{ fontSize: "12px", color: "#64748b" }}>
          © {new Date().getFullYear()} Tipia. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default Footer