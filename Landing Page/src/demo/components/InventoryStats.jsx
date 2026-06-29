import React from "react"
import { Boxes, AlertTriangle, CalendarRange } from "lucide-react"
import { getExpiringSoonProducts } from "../utils/expiryMetrics"

function InventoryStats({ products }) {
  const totalProducts = products.length
  const lowStock = products.filter(item => Number(item.stock || 0) < Number(item.reorderLevel || 5)).length
  const expiringSoonItems = getExpiringSoonProducts(products)
  const criticalExpiryCount = expiringSoonItems.length

  return (
    <div className="cards">
      <div className="card">
        <Boxes className="icon blue" />
        <h3>{totalProducts}</h3>
        <p>Products</p>
      </div>

      <div className="card">
        <AlertTriangle className="icon red" />
        <h3>{lowStock}</h3>
        <p>Low Stock</p>
      </div>

      <div className={`card card-expiry-stat ${criticalExpiryCount > 0 ? "card-expiry-stat--alert" : ""}`}>
        <CalendarRange className="icon expiry-stat-icon" />
        <h3>{criticalExpiryCount}</h3>
        <p>Expiring Soon</p>
        <div className="card-expiry-stat-accent" />
      </div>
    </div>
  )
}

export default InventoryStats
