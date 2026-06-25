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
          Stop Losing Money to Expired Drugs and Unrecorded Sales.
        </h1>

        {/* Focused Pharmacy Value Proposition (The Solution) */}
        <p className="subtext">
          Many pharmacy owners lose serious daily profits because drugs quietly expire on shelves, tablets get sold without records, and old computer software is too slow during rush hour. 
          <strong> Tipia</strong> gives you a super-fast mobile app that tracks every drug batch, helps you sell older stock first, and works perfectly even when there is no internet network.
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