import { useState } from "react"
import { 
  ArrowUpRight, 
  PlusCircle, 
  RefreshCw, 
  Trash2, 
  Search, 
  Filter,
  Calendar,
  Layers,
  Barcode
} from "lucide-react"

export default function ActivityPage({ salesLog = [] }) {
  const [search, setSearch] = useState("")
  const [actionFilter, setActionFilter] = useState("all")

  // Helper to extract a standardized date string for timeline grouping
  function getGroupDate(dateString) {
    if (!dateString) return "Unknown Date"
    
    try {
      const datePart = dateString.split(",")[0].trim()
      const logDate = new Date(datePart)
      const today = new Date()
      const yesterday = new Date()
      yesterday.setDate(today.getDate() - 1)

      if (logDate.toDateString() === today.toDateString()) return "Today"
      if (logDate.toDateString() === yesterday.toDateString()) return "Yesterday"
      
      return logDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    } catch {
      return dateString.split(",")[0] || dateString
    }
  }

  // Helper to configure specific styling based on action types
  function getActionMeta(actionType) {
    const type = (actionType || "SALE").toUpperCase()
    switch (type) {
      case "SALE":
        return {
          icon: <ArrowUpRight size={16} />,
          badgeClass: "badge-sale",
          label: "Sale",
          color: "#3b82f6"
        }
      case "CREATE":
      case "ADDED":
        return {
          icon: <PlusCircle size={16} />,
          badgeClass: "badge-create",
          label: "Product Registered",
          color: "#10b981"
        }
      case "RESTOCK":
        return {
          icon: <RefreshCw size={16} />,
          badgeClass: "badge-restock",
          label: "Restocked",
          color: "#8b5cf6"
        }
      case "DELETE":
        return {
          icon: <Trash2 size={16} />,
          badgeClass: "badge-delete",
          label: "Deleted",
          color: "#ef4444"
        }
      default:
        return {
          icon: <Layers size={16} />,
          badgeClass: "badge-generic",
          label: "System Log",
          color: "#64748b"
        }
    }
  }

  // Process and normalize raw log metadata entries
  const normalizedLogs = salesLog.map(item => {
    const action = item.action || "SALE"
    const quantity = item.quantity || 0
    const stockAfter = item.currentStock !== undefined ? item.currentStock : (item.stock || 0)
    const stockBefore = action === "SALE" ? stockAfter + quantity : 0

    return {
      ...item,
      action,
      quantity,
      stockBefore,
      stockAfter,
      displayTime: item.date ? item.date.split(",")[1]?.trim() || item.date : "Just now",
      groupKey: getGroupDate(item.date)
    }
  })

  // Filter pipeline engine
  const filteredLogs = normalizedLogs.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                          item.action.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = actionFilter === "all" || item.action.toUpperCase() === actionFilter.toUpperCase()
    return matchesSearch && matchesFilter
  })

  // Group items by date headings
  const groupedActivities = filteredLogs.reduce((groups, item) => {
    if (!groups[item.groupKey]) {
      groups[item.groupKey] = []
    }
    groups[item.groupKey].push(item)
    return groups
  }, {})

  return (
    <div className="activity-container">
      {/* FILTER CONTROL CONTROLLER ROW */}
      <div className="activity-toolbar">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search logs by item name or activity type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-wrapper">
          <Filter size={16} className="filter-icon" />
          <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
            <option value="all">All Operations</option>
            <option value="SALE">Sales Only</option>
            <option value="CREATE">Product Registrations</option>
          </select>
        </div>
      </div>

      {/* CORE TIMELINE DISPLAY INTERFACE PANEL */}
      <div className="panel activity-panel">
        <div className="activity-header">
          <h3>System Audit Trail</h3>
          <span className="count-badge">{filteredLogs.length} logs found</span>
        </div>

        {Object.keys(groupedActivities).length === 0 ? (
          <div className="empty-activity-state">
            <p>No operational logs found matching your selection criteria.</p>
          </div>
        ) : (
          <div className="timeline-wrapper">
            {Object.keys(groupedActivities).map(dateGroup => (
              <div key={dateGroup} className="timeline-group">
                <div className="timeline-group-title">
                  <Calendar size={14} />
                  <h4>{dateGroup}</h4>
                </div>

                <div className="timeline-items-list">
                  {groupedActivities[dateGroup].map(log => {
                    const meta = getActionMeta(log.action)
                    const isSale = log.action === "SALE"

                    return (
                      <div key={log.id} className="timeline-item-card">
                        <div className="timeline-left-node">
                          <div 
                            className={`timeline-icon-sphere ${meta.badgeClass}`}
                            style={{ backgroundColor: `${meta.color}15`, color: meta.color }}
                          >
                            {meta.icon}
                          </div>
                          <div className="timeline-tail-line"></div>
                        </div>

                        <div className="timeline-content-body">
                          <div className="timeline-content-top-row">
                            {/* Product name style configured here to explicitly override white layouts to blue */}
                            <span 
                              className="product-title-text"
                              style={{ 
                                color: "#2563eb", 
                                fontWeight: "600",
                                fontSize: "14px"
                              }}
                            >
                              {log.name}
                            </span>
                            <span className="log-timestamp-text">{log.displayTime}</span>
                          </div>

                          <div className="timeline-content-details-row">
                            <div className="action-tag" style={{ borderLeft: `3px solid ${meta.color}` }}>
                              <span style={{ color: meta.color, fontWeight: "bold", fontSize: "11px", textTransform: "uppercase" }}>
                                {meta.label}
                              </span>
                              <span className="action-quantity-descriptor">
                                {isSale 
                                  ? `Sold ${log.quantity} units to customer` 
                                  : `Registered ${log.quantity} units into inventory`
                                }
                              </span>
                            </div>

                            {/* CONDITIONAL TRACKER VIEW (STOCKS VS CODES) */}
                            {isSale ? (
                              <div className="stock-delta-tracker">
                                <span className="delta-pill">Stock: {log.stockBefore}</span>
                                <span className="delta-arrow">➔</span>
                                <span className="delta-pill highlighted-pill">{log.stockAfter}</span>
                              </div>
                            ) : (
                              <div style={{ display: "flex", gap: "8px", fontSize: "11px", color: "#64748b" }}>
                                {log.sku && <span>SKU: {log.sku}</span>}
                                {log.barcode && log.barcode !== "Not Available" && (
                                  <span style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                                    <Barcode size={12} /> {log.barcode}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}