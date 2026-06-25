import React from "react"
import { Boxes, AlertTriangle, CalendarRange } from "lucide-react"

function InventoryStats({ products }) {
  const totalProducts = products.length

  // 1. Calculate standard low stock parameters
  const lowStock = products.filter((item) => Number(item.stock || 0) < 5).length

  // 2. Scan and calculate ONLY expiring soon items (Strictly within the next 0 to 90 days)
  const criticalExpiryCount = products.filter((item) => {
    if (!item.expiryDate || item.expiryDate === "N/A") return false

    const expiry = new Date(item.expiryDate)
    const today = new Date()

    // Clear time factors for accurate day calculations
    today.setHours(0, 0, 0, 0)
    expiry.setHours(0, 0, 0, 0)

    const msPerDay = 24 * 60 * 60 * 1000
    const daysRemaining = Math.round((expiry - today) / msPerDay)

    // MUST be 0 or greater (not expired yet) AND less than or equal to 90 days
    return daysRemaining >= 0 && daysRemaining <= 90
  }).length

  return (
    <div className="cards">
      {/* STANDARD PRODUCT CARD */}
      <div className="card">
        <Boxes className="icon blue" />
        <h3>{totalProducts}</h3>
        <p>Products</p>
      </div>

      {/* STANDARD LOW STOCK CARD */}
      <div className="card">
        <AlertTriangle className="icon red" />
        <h3>{lowStock}</h3>
        <p>Low Stock</p>
      </div>

      {/* NEW: DYNAMIC CLINICAL EXPIRY MONITOR (INLINE STYLED) */}
      <div 
        className="card" 
        style={{
          border: "1px solid #FFEDD5",
          background: "linear-gradient(135deg, #FFFBEB 0%, #FFFAFE5 100%)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <CalendarRange 
          className="icon" 
          style={{ 
            color: "#D97706",
            backgroundColor: "#FEF3C7",
            padding: "8px",
            borderRadius: "8px",
            width: "36px",
            height: "36px"
          }} 
        />

        <h3 style={{ color: "var(--text-main)", margin: "12px 0 4px 0", fontSize: "24px", fontWeight: 800 }}>
  {criticalExpiryCount}
</h3>

<p style={{ color: "var(--text-muted)", margin: 0, fontSize: "14px", fontWeight: 500 }}>
  Expiring Soon
</p>

        {/* Accent warning strip at the bottom edge of the card */}
        <div 
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: "4px",
            backgroundColor: criticalExpiryCount > 0 ? "#EF4444" : "#F59E0B"
          }}
        />
      </div>
    </div>
  )
}

export default InventoryStats