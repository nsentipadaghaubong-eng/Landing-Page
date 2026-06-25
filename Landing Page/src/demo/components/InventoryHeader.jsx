import "./demo.css"
import { Boxes, Bell, Activity } from "lucide-react"

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