import {
  AlertTriangle,
  Boxes,
  CalendarRange,
  PackageCheck,
  TrendingUp
} from "lucide-react"
import { getExpiringSoonProducts, getExpiredProducts } from "../utils/expiryMetrics"

function Dashboard({ products, salesLog, onViewExpiringSoon, onViewExpired }) {
  const lowStockItems = products.filter(item => Number(item.stock || 0) < Number(item.reorderLevel || 5))

  const expiringSoonItems = getExpiringSoonProducts(products)
  const expiredItems = getExpiredProducts(products)

  const totalStock = products.reduce((acc, item) => acc + Number(item.stock || 0), 0)

  const totalSales = salesLog.reduce(
    (acc, sale) => acc + Number(sale.quantity || 0),
    0
  )

  return (
    <div className="dashboard-grid">
      {/* EXPIRING SOON */}
      <div className="panel dashboard-expiry-panel">
        <div className="panel-title">
          <CalendarRange size={18} className="expiry-panel-icon" />
          <h3>Expiring Soon</h3>
          {expiringSoonItems.length > 0 && (
            <span className="dashboard-expiry-count">{expiringSoonItems.length}</span>
          )}
        </div>

        {expiringSoonItems.length === 0 ? (
          <p className="dashboard-empty-note">No products expiring within the next 90 days.</p>
        ) : (
          <>
            <div className="dashboard-expiry-list">
              {expiringSoonItems.slice(0, 6).map(({ product, expiryDate, daysRemaining }) => (
                <div key={product.id} className="dashboard-expiry-item">
                  <div className="dashboard-expiry-item-main">
                    <span className="dashboard-expiry-name">{product.name}</span>
                    <span className="dashboard-expiry-date">{expiryDate}</span>
                  </div>
                  <span className={`dashboard-expiry-days ${daysRemaining <= 30 ? "critical" : ""}`}>
                    {daysRemaining}d left
                  </span>
                </div>
              ))}
            </div>
            {expiringSoonItems.length > 6 && (
              <p className="dashboard-expiry-more">
                +{expiringSoonItems.length - 6} more items nearing expiry
              </p>
            )}
            {onViewExpiringSoon && (
              <button type="button" className="dashboard-expiry-action" onClick={onViewExpiringSoon}>
                View all expiring products
              </button>
            )}
          </>
        )}
      </div>

      {/* LOW STOCK */}
      <div className="panel">
        <div className="panel-title">
          <AlertTriangle size={18} />
          <h3>Low Stock Alerts</h3>
        </div>

        {lowStockItems.length === 0 ? (
          <p className="dashboard-empty-note">All products are healthy</p>
        ) : (
          lowStockItems.map(item => (
            <div key={item.id} className="low-item">
              <span>{item.name}</span>
              <span className="danger">{item.stock} left</span>
            </div>
          ))
        )}
      </div>

      {/* EXPIRED (compact alert strip when present) */}
      {expiredItems.length > 0 && (
        <div className="panel dashboard-expired-panel">
          <div className="panel-title">
            <AlertTriangle size={18} className="expired-panel-icon" />
            <h3>Expired — Action Required</h3>
            <span className="dashboard-expired-count">{expiredItems.length}</span>
          </div>
          <div className="dashboard-expiry-list">
            {expiredItems.slice(0, 4).map(({ product, expiryDate }) => (
              <div key={product.id} className="dashboard-expiry-item expired">
                <div className="dashboard-expiry-item-main">
                  <span className="dashboard-expiry-name">{product.name}</span>
                  <span className="dashboard-expiry-date">Expired {expiryDate}</span>
                </div>
              </div>
            ))}
          </div>
          {onViewExpired && (
            <button type="button" className="dashboard-expiry-action expired" onClick={onViewExpired}>
              Review expired inventory
            </button>
          )}
        </div>
      )}

      {/* TOTAL PRODUCTS */}
      <div className="panel stat-panel">
        <PackageCheck size={22} />
        <p>Total Products</p>
        <h2>{products.length}</h2>
      </div>

      {/* TOTAL STOCK */}
      <div className="panel stat-panel">
        <Boxes size={22} />
        <p>Total Inventory</p>
        <h2>{totalStock}</h2>
      </div>

      {/* TOTAL SALES */}
      <div className="panel stat-panel">
        <TrendingUp size={22} />
        <p>Total Sales</p>
        <h2>{totalSales}</h2>
      </div>
    </div>
  )
}

export default Dashboard
