import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

import Hero from "./components/Hero"
import Features from "./components/Features"
import FAQ from "./components/FAQ"
import Waitlist from "./components/Waitlist"
import Footer from "./components/Footer"
import ProblemSection from "./components/ProblemSection"

// ✅ Import your legal pages
import Privacy from "./demo/pages/Privacy"
import Terms from "./demo/pages/Terms"

// ✅ DEMO PAGE
import DemoApp from "./demo/components/DemoApp"

function HomePage() {
  return (
    <>
      <Hero />
      <ProblemSection />
      <Features />
      <FAQ />
      <Waitlist />
      <Footer />
    </>
  )
}

function App() {
  return (
    <Router>
      <Routes>

        {/* LANDING PAGE */}
        <Route path="/" element={<HomePage />} />

        {/* ✅ LEGAL ROUTES */}
        <Route path="/privacy" element={<Privacy onBack={() => window.location.href = "/"} />} />
        <Route path="/terms" element={<Terms onBack={() => window.location.href = "/"} />} />

        {/* ✅ DEMO PAGE */}
        <Route path="/demo" element={<DemoApp />} />

      </Routes>
    </Router>
  )
}

export default App