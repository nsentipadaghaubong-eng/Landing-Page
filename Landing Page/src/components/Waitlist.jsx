import { useState } from "react"

function Waitlist() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()

    if (!email) return

    setLoading(true)
    setStatus("")

    try {
      const res = await fetch("http://localhost:5000/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      })

      const data = await res.json()

      setStatus(data.message)
      setEmail("")
    } catch (error) {
      setStatus("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="section" id="waitlist">

      <h2>Get Early Access</h2>

      <p className="waitlist-subtext">
        Join businesses already preparing to eliminate inventory errors before launch.
        Be among the first to access real-time inventory control tools.
      </p>

      <div className="waitlist-benefits">
        <p>✔ Early access to the full system</p>
        <p>✔ Priority onboarding for your business</p>
        <p>✔ Free during early access phase</p>
      </div>

      <form className="waitlist" onSubmit={handleSubmit}>
        <div className="waitlist-box">

          <input
            type="email"
            placeholder="Work email address (recommended)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />

          <button
            type="submit"
            className="primary-btn"
            disabled={loading}
          >
            {loading ? "Securing access..." : "Request Early Access"}
          </button>

        </div>
      </form>

      {status && (
        <p className={`status ${status.includes("Success") ? "success" : ""}`}>
          {status}
        </p>
      )}

      <p className="trust trust-centered">
  No credit card required • Limited early access spots
</p>
    </section>
  )
}

export default Waitlist