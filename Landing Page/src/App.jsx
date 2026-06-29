import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

import Hero from "./components/Hero"
import Features from "./components/Features"
import FAQ from "./components/FAQ"
import Waitlist from "./components/Waitlist"
import Footer from "./components/Footer"
import ProblemSection from "./components/ProblemSection"

//import UploadPage from "./pages/UploadPage"

// ✅ ADD THIS
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

        {/* UPLOAD PAGE (ADMIN / CMS) */}
        {/*<Route path="/upload" element={<UploadPage />} />*/}

        {/* ✅ DEMO PAGE (NEW) */}
        <Route path="/demo" element={<DemoApp />} />

      </Routes>
    </Router>
  )
}

export default App