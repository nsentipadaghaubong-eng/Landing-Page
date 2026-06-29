import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Boxes } from "lucide-react"

function Hero() {
  const [scrollY, setScrollY] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  function scrollToWaitlist() {
    const section = document.getElementById("waitlist")
    if (section) {
      section.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section className="hero">
      <div className="hero-content">

        {/* Dynamic Contextual Badge */}
        <p className="badge">
          <span className="badge-icon">
            <Boxes size={16} />
          </span>
          Easy batch and expiry tracking made for Nigerian retail pharmacies
        </p>

        {/* High-Intent Problem Statement (The Hook) */}
        <h1>
          Stop Losing Profits. Run Your Pharmacy with Confidence.
        </h1>

        {/* Focused Pharmacy Value Proposition (The Solution) */}
        <p className="subtext">
         Discover how Tipia helps you manage your pharmacy from your mobile phone. 
         Track every drug batch, reduce expired stock losses, 
         record every sale with confidence, and serve customers faster from one simple app.
        </p>

        {/* Clear Call-To-Actions */}
        <div className="buttons">
          <button className="primary-btn" onClick={scrollToWaitlist}>
            Join the Waitlist
          </button>

          <button
            className="secondary-btn"
            onClick={() => navigate("/demo")}
          >
            Try Free Demo
          </button>
        </div>

        {/* Localized Authority Statement */}
        <p className="trust">
          Built for local pharmacies • Works completely offline • QR code ready • Zero setup fees
        </p>

      </div>
    </section>
  )
}

export default Hero