import "./demo.css"
import { Boxes, Bell, Activity, Home } from "lucide-react"

function InventoryHeader({ darkMode }) {

  return (
    <div className={`inventory-header ${darkMode ? "dark" : "light"}`}>

      {/* LEFT */}
      <div className="inventory-header-left">

        <div className="inventory-title">

          <div className="inventory-icon">
            <Boxes size={22} />
          </div>

          <h1>Tipia Demo</h1>

        </div>

        <p>
          Track stock. Sell products. Detect shortages.
        </p>

      </div>

      {/* RIGHT */}
      <div className="inventory-header-right">

        {/* BACK TO LANDING PAGE BUTTON */}
        <a 
          href="/" 
          className="header-pill home-link-pill"
          style={{
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <Home size={16} />
          Back to Home
        </a>

        <div className="header-pill">
          <Activity size={16} />
          Live Inventory
        </div>

        <div className="header-pill warning">
          <Bell size={16} />
          Smart Alerts
        </div>

      </div>

    </div>
  )
}

export default InventoryHeader