import React, { useState, useEffect } from "react"
import {
  Package,
  AlertTriangle,
  Trash2,
  Eye,
  ShoppingCart,
  Pencil,
  X,
  Layers,
  Calendar,
  Check,
  Clock,
  Tag,
  DollarSign,
  FileText,
  Plus,
  ToggleLeft,
  ToggleRight,
  Scan,
  ArrowRight
} from "lucide-react"
import "./ProductCard.css"
import BarcodeScanner from "./scanner/BarcodeScanner"
import { resolveCheckoutMetrics, computeCheckoutTotals } from "../utils/checkoutMetrics"

function ProductCard({ product, sellProduct, deleteProduct, updateProduct }) {
  const [showView, setShowView] = useState(false)
  const [showPreSaleConfig, setShowPreSaleConfig] = useState(false)
  const [showSellModal, setShowSellModal] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  
  // Point-of-Sale Configuration Hook States
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0)
  const [selectedOutflowMode, setSelectedOutflowMode] = useState("unit") // "unit" or "bulk"
  const [sellQuantity, setSellQuantity] = useState(1)
  const [transactionNotes, setTransactionNotes] = useState("")
  
  const [hasVariantsToggle, setHasVariantsToggle] = useState(false)

  // Hardware Scanner Control States
  const [showScanner, setShowScanner] = useState(false)
  const [activeScanTarget, setActiveScanTarget] = useState(null)

  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    genericName: "",
    brandName: "",
    targetAgeGroup: "Both",
    bulkPackagingType: "Box",
    unitDispensingType: "Tablet",
    packsReceived: "",
    unitsPerPack: "",
    costPrice: "",
    price: "",
    bulkSellingPrice: "",
    batchNo: "",
    expiryDate: "",
    nafdacNo: "",
    barcode: "", 
    variants: [],
    customFieldsArray: [],
    notes: "",
    stock: 0
  })

  useEffect(() => {
    if (!product) return

    const fieldsArray = product.customFields
      ? Object.entries(product.customFields).map(([key, value]) => ({
        label: key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
        value: value || ""
      }))
      : []

    const productHasVariants = !!(product.variants && product.variants.length > 0)
    setHasVariantsToggle(productHasVariants)

    setEditForm({
      ...product,
      name: product.name || "",
      category: product.category || "",
      genericName: product.genericName || "",
      brandName: product.brandName || "",
      targetAgeGroup: product.targetAgeGroup || "Both",
      bulkPackagingType: product.bulkPackagingType || "Box",
      unitDispensingType: product.unitDispensingType || "Tablet",
      packsReceived: product.packsReceived ?? "",
      unitsPerPack: product.unitsPerPack ?? "",
      costPrice: product.costPrice ?? "",
      price: product.price ?? "",
      bulkSellingPrice: product.bulkSellingPrice ?? "",
      batchNo: product.batchNo || "",
      expiryDate: product.expiryDate === "N/A" ? "" : product.expiryDate || "",
      nafdacNo: product.nafdacNo || "",
      barcode: product.barcode || "",
      variants: productHasVariants
        ? [...product.variants]
        : [{ formulationType: "Tablet Form", strength: "", packsReceived: "", unitsPerPack: "", quantity: 0, costPrice: "", unitSellingPrice: "", bulkSellingPrice: "", batchNo: "", expiryDate: "", nafdacNo: "", barcode: "" }],
      customFieldsArray: fieldsArray,
      notes: product.notes || "",
      stock: product.stock ?? 0
    })
  }, [product])

  const stockCount = Number(product.stock || 0)
  const isOutOfStock = stockCount === 0

  // VARIATION-AWARE EARLIEST EXPIRY FINDER & ALERTS ENGINE
  const getExpiryStatus = (prod) => {
    let targetDateString = ""

    // Check if product contains nested variation matrices
    if (prod.variants && prod.variants.length > 0) {
      let earliestTime = Infinity
      
      prod.variants.forEach(v => {
        if (v.expiryDate && v.expiryDate !== "N/A" && v.expiryDate.trim() !== "") {
          const parsingTime = new Date(v.expiryDate).getTime()
          // Identify the single variation that will expire first
          if (!isNaN(parsingTime) && parsingTime < earliestTime) {
            earliestTime = parsingTime
            targetDateString = v.expiryDate
          }
        }
      })
    } else {
      // Defer to single unified layout parameters if variants don't exist
      if (prod.expiryDate && prod.expiryDate !== "N/A" && prod.expiryDate.trim() !== "") {
        targetDateString = prod.expiryDate
      }
    }

    // Default fallback if no valid date configuration values exist anywhere
    if (!targetDateString) {
      return { 
        label: "No Expiry Set", 
        color: "#94a3b8", 
        bg: "transparent", 
        hasDate: false, 
        critical: false, 
        expired: false 
      }
    }

    const expiry = new Date(targetDateString)
    const today = new Date()
    
    // Normalize coordinates strictly to midnight bounds to clear timezone discrepancies
    today.setHours(0, 0, 0, 0)
    expiry.setHours(0, 0, 0, 0)

    const daysRemaining = Math.round((expiry - today) / (24 * 60 * 60 * 1000))

    if (daysRemaining < 0) {
      return { 
        label: "Expired", 
        color: "#ef4444", // Expired Red
        bg: "transparent", 
        hasDate: true, 
        critical: true, 
        expired: true 
      }
    } else if (daysRemaining <= 90) {
      return { 
        label: `Expiring Soon (${daysRemaining}d)`, 
        color: "#f97316", // Warning Orange
        bg: "transparent", 
        hasDate: true, 
        critical: true, 
        expired: false 
      }
    } else {
      return { 
        label: `Expiring in ${daysRemaining} days`, 
        color: "#22c55e", // Healthy Green
        bg: "transparent", 
        hasDate: true, 
        critical: false, 
        expired: false 
      }
    }
  }

  const expiryStatus = getExpiryStatus(product)
  const isLowStock = stockCount <= Number(product.reorderLevel || 5) && stockCount > 0
  const hasVariants = product.variants && product.variants.length > 0

  useEffect(() => {
    const isModalOpen = showView || showPreSaleConfig || showSellModal || showEdit || showScanner
    document.body.classList.toggle("modal-isolated-view", isModalOpen)
    return () => document.body.classList.remove("modal-isolated-view")
  }, [showView, showPreSaleConfig, showSellModal, showEdit, showScanner])

  const handleSellExecution = () => {
    const variantIdx = hasVariants ? selectedVariantIdx : 0
    const metrics = resolveCheckoutMetrics(product, variantIdx, selectedOutflowMode)
    if (!metrics) return

    const { totalUnitsToDeduct } = computeCheckoutTotals(metrics, sellQuantity)

    if (totalUnitsToDeduct > metrics.unitsAvailable) {
      alert(`Insufficient stock! Total requested: ${totalUnitsToDeduct} units. Only ${metrics.unitsAvailable} units available.`)
      return
    }

    sellProduct({
      ...product,
      variants: product.variants ? product.variants.map(v => ({ ...v })) : [],
      selectedVariantIdx: variantIdx,
      selectedOutflowMode,
      sellQuantity: Number(sellQuantity),
      transactionNotes,
    })

    setShowSellModal(false)
    setSelectedVariantIdx(0)
    setSellQuantity(1)
    setSelectedOutflowMode("unit")
    setTransactionNotes("")
  }
  const toggleVariantsConfiguration = () => {
    setHasVariantsToggle(prev => {
      const nextState = !prev
      setEditForm(prevForm => {
        let calculatedStock = prevForm.stock
        if (!nextState) {
          calculatedStock = Number(prevForm.packsReceived || 0) * Number(prevForm.unitsPerPack || 0)
        } else {
          calculatedStock = prevForm.variants.reduce((sum, v) => sum + (Number(v.packsReceived || 0) * Number(v.unitsPerPack || 0)), 0)
        }
        return { ...prevForm, stock: calculatedStock }
      })
      return nextState
    })
  }

  const handleSingleStockMathChange = (field, value) => {
    setEditForm(prev => {
      const updated = { ...prev, [field]: value }
      const packs = field === "packsReceived" ? Number(value || 0) : Number(updated.packsReceived || 0)
      const units = field === "unitsPerPack" ? Number(value || 0) : Number(updated.unitsPerPack || 0)
      updated.stock = packs * units
      return updated
    })
  }

  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...(editForm.variants || [])]
    updatedVariants[index] = { ...updatedVariants[index], [field]: value }

    if (field === "packsReceived" || field === "unitsPerPack") {
      const packs = Number(updatedVariants[index].packsReceived || 0)
      const units = Number(updatedVariants[index].unitsPerPack || 0)
      updatedVariants[index].quantity = packs * units
    }

    const newTotalStock = updatedVariants.reduce((sum, v) => sum + Number(v.quantity || 0), 0)
    setEditForm({ ...editForm, variants: updatedVariants, stock: newTotalStock })
  }

  const addVariantField = () => {
    setEditForm({
      ...editForm,
      variants: [
        ...(editForm.variants || []),
        { formulationType: "Tablet Form", strength: "", packsReceived: "", unitsPerPack: "", quantity: 0, costPrice: "", unitSellingPrice: "", bulkSellingPrice: "", batchNo: "", expiryDate: "", nafdacNo: "", barcode: "" }
      ]
    })
  }

  const removeVariantField = (index) => {
    const updatedVariants = (editForm.variants || []).filter((_, i) => i !== index)
    const newTotalStock = updatedVariants.reduce((sum, v) => sum + Number(v.quantity || 0), 0)
    setEditForm({ ...editForm, variants: updatedVariants, stock: newTotalStock })
  }

  const handleCustomFieldChange = (index, field, value) => {
    const updatedFields = [...(editForm.customFieldsArray || [])]
    updatedFields[index] = { ...updatedFields[index], [field]: value }
    setEditForm({ ...editForm, customFieldsArray: updatedFields })
  }

  const addCustomField = () => {
    setEditForm({
      ...editForm,
      customFieldsArray: [...(editForm.customFieldsArray || []), { label: "", value: "" }]
    })
  }

  const removeCustomField = (index) => {
    const updatedFields = (editForm.customFieldsArray || []).filter((_, i) => i !== index)
    setEditForm({ ...editForm, customFieldsArray: updatedFields })
  }

  const handleTriggerScanner = (targetIndex = null) => {
    setActiveScanTarget(targetIndex === null ? "global" : targetIndex)
    setShowScanner(true)
  }

  const handleHardwareScanSuccess = (scannedCode) => {
    if (activeScanTarget === "global") {
      setEditForm(prev => ({ ...prev, barcode: scannedCode }))
    } else if (typeof activeScanTarget === "number") {
      handleVariantChange(activeScanTarget, "barcode", scannedCode)
    }
    setShowScanner(false)
  }

  const handleEditSubmit = (e) => {
    e.preventDefault()
    if (!updateProduct) return

    const compiledCustomFields = {}
    if (editForm.customFieldsArray) {
      editForm.customFieldsArray.forEach((item) => {
        if (item.label.trim()) {
          const formattedKey = item.label.trim().toLowerCase().replace(/\s+/g, "_")
          compiledCustomFields[formattedKey] = item.value
        }
      })
    }

    const cleanPayload = {
      ...editForm,
      stock: Number(editForm.stock || 0),
      customFields: compiledCustomFields,
      packsReceived: editForm.packsReceived ? Number(editForm.packsReceived) : null,
      unitsPerPack: editForm.unitsPerPack ? Number(editForm.unitsPerPack) : null,
      costPrice: editForm.costPrice ? Number(editForm.costPrice) : null,
      price: Number(editForm.price || 0),
      bulkSellingPrice: editForm.bulkSellingPrice ? Number(editForm.bulkSellingPrice) : null,
      batchNo: editForm.batchNo || "N/A",
      expiryDate: editForm.expiryDate || "N/A",
      nafdacNo: editForm.nafdacNo || "N/A",
      barcode: editForm.barcode || "",
      variants: hasVariantsToggle ? editForm.variants.map(v => ({
        ...v,
        packsReceived: Number(v.packsReceived || 0),
        unitsPerPack: Number(v.unitsPerPack || 0),
        quantity: Number(v.quantity || 0),
        costPrice: v.costPrice ? Number(v.costPrice) : null,
        unitSellingPrice: Number(v.unitSellingPrice || 0),
        bulkSellingPrice: v.bulkSellingPrice ? Number(v.bulkSellingPrice) : null,
        expiryDate: v.expiryDate || "N/A",
        barcode: v.barcode || ""
      })) : []
    }

    delete cleanPayload.customFieldsArray
    updateProduct(product.id || product._id, cleanPayload)
    setShowEdit(false)
  }

  const checkoutMetrics = resolveCheckoutMetrics(product, selectedVariantIdx, selectedOutflowMode)
  const currentActiveTargetItem = checkoutMetrics?.source ?? product
  const currentUnitsPerPack = checkoutMetrics?.unitsPerPack ?? 1
  const unitsStockRemaining = checkoutMetrics?.unitsAvailable ?? stockCount
  const bulkPacksStockRemaining = checkoutMetrics?.packsAvailable ?? 0

  return (
    <>
      <div className={`product-row-card ${isOutOfStock ? "out-of-stock-row" : ""} ${expiryStatus.expired ? "expired-row-modifier" : ""}`}>
  
        {/* COLUMN 1: PRODUCT NAME */}
        <div className="product-col name-col">
          <div className="product-name">
            <Package size={16} className={expiryStatus.expired ? "sale-stock-low" : ""} />
            <div className="name-wrapper">
              <span className={`name-text ${expiryStatus.critical ? "text-critical" : ""}`}>
                {product.name}
              </span>
            </div>
          </div>
        </div>

        {/* COLUMN 2: PRICE */}
        <div className="product-col">
          ₦{Number(product.price || 0).toLocaleString()}
        </div>

        {/* COLUMN 3: QUANTITY */}
        <div className="product-col stock-count-text">
          {stockCount}
        </div>

        {/* COLUMN 4: DYNAMIC EARLIEST VARIANT EXPIRY BADGE */}
        <div className="product-col">
          <span 
            className="expiry-badge-inline" 
            style={{ 
              margin: 0, 
              display: 'inline-flex', 
              alignItems: 'center',
              color: expiryStatus.color,
              fontSize: '11px', // Adjusted size down slightly
              fontWeight: '600'
            }}
          >
            <Clock size={11} style={{ marginRight: '5px', stroke: expiryStatus.color }} />
            {expiryStatus.label}
          </span>
        </div>

        {/* COLUMN 5: STOCK STATUS BADGES */}
        <div className="product-col">
          {isOutOfStock ? (
            <div className="out-of-stock-badge">
              <X size={12} /> Out of Stock
            </div>
          ) : isLowStock ? (
            <div className="low-stock-badge">
              <AlertTriangle size={12} /> Low Stock
            </div>
          ) : (
            <div className="in-stock-badge">
              In Stock
            </div>
          )}
        </div>

        {/* COLUMN 6: ACTION ACTION BUTTON LAYOUT */}
        <div className="product-actions">
          <button className="view-btn" onClick={() => setShowView(true)}>
            <Eye size={15} /> View
          </button>

          <button className="edit-btn" onClick={() => setShowEdit(true)}>
            <Pencil size={14} /> Edit
          </button>

          <button
            className="sell-btn"
            onClick={() => {
              setSellQuantity(1)
              setTransactionNotes("")
              setSelectedVariantIdx(0)
              setSelectedOutflowMode("unit")
              
              const hasBulkOption = Number(product.bulkSellingPrice || 0) > 0 || Number(product.unitsPerPack || 1) > 1
              if (!hasVariants && !hasBulkOption) {
                setShowSellModal(true)
              } else {
                setShowPreSaleConfig(true)
              }
            }}
            disabled={isOutOfStock || expiryStatus.expired}
          >
            <ShoppingCart size={15} /> Sell
          </button>

          <button className="delete-btn icon-btn" onClick={() => deleteProduct(product.id || product._id)}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* SPECS VIEW MODAL */}
      {showView && (
        <div className="sale-modal-overlay view-modal-overlay" onClick={() => setShowView(false)}>
          <div className="sale-modal-container view-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="sale-modal-header">
              <h2>Product Specifications Portfolio</h2>
              <p>Auditing Master Definitions for: {product.name}</p>
            </div>
            <div className="sale-modal-form">
              <div className="sale-modal-content">
                <div className="sale-info-card">
                  <span><Package size={12} /> Product Name</span>
                  <strong>{product.name}</strong>
                </div>
                <div className="sale-info-card">
                  <span><Tag size={12} /> Category Matrix</span>
                  <strong>{product.category || "General / Unassigned"}</strong>
                </div>
                <div className="sale-info-card">
                  <span><FileText size={12} /> Generic Composition</span>
                  <strong>{product.genericName || "N/A"}</strong>
                </div>
                <div className="sale-info-card">
                  <span><DollarSign size={12} /> Retail Outflow Price</span>
                  <strong>₦{Number(product.price || 0).toLocaleString()}</strong>
                </div>
                <div className="sale-info-card">
                  <span><Layers size={12} /> Verified Stock Depth</span>
                  <strong>{stockCount} Global Units</strong>
                </div>
                <div className="sale-info-card">
                  <span><Calendar size={12} /> Expiry Timeline Baseline</span>
                  <strong style={{ color: expiryStatus.color }}>{product.expiryDate || "N/A Specified"}</strong>
                </div>
                <div className="sale-info-card sale-full-width">
                  <span className="section-subtitle-blue">Formulation Variants Settings</span>
                  {hasVariants ? (
                    <div className="view-variant-list">
                      {product.variants.map((v, i) => (
                        <div key={i} className="view-variant-row">
                          <div><small>Variant ID</small><strong>{v.id || "N/A"}</strong></div>
                          <div><small>Type/Formulation</small><strong>{v.formulationType || v.type || "N/A"}</strong></div>
                          <div><small>Strength/Dosage</small><strong>{v.strength || v.dosage || "N/A"}</strong></div>
                          <div><small>Variant Barcode</small><strong>{v.barcode || "N/A"}</strong></div>
                          <div><small>Qty Available</small><strong>{v.quantity ?? 0} units</strong></div>
                          <div><small>Bulk Packaging</small><strong>{v.bulkPackagingType || "N/A"}</strong></div>
                          <div><small>Dispensing Unit</small><strong>{v.unitDispensingType || "N/A"}</strong></div>
                          <div><small>Cost Price</small><strong>₦{Number(v.costPrice || 0).toLocaleString()}</strong></div>
                          <div><small>Unit Price</small><strong>₦{Number(v.unitSellingPrice || v.sellingPrice || 0).toLocaleString()}</strong></div>
                          <div><small>Bulk Price</small><strong>₦{Number(v.bulkSellingPrice || 0).toLocaleString()}</strong></div>
                          <div><small>Batch Number</small><strong>{v.batchNo || "N/A"}</strong></div>
                          <div><small>Expiry Date</small><strong>{v.expiryDate || "N/A"}</strong></div>
                          <div><small>NAFDAC #</small><strong>{v.nafdacNo || "N/A"}</strong></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="deactivated-notice">
                      Deactivated. Product behaves purely as a simple unified stock baseline tracking asset.
                    </div>
                  )}
                </div>
                <div className="sale-info-card sale-full-width">
                  <span><FileText size={12} /> Contextual Internal Notes</span>
                  <p className="notes-display-paragraph">
                    {product.notes || "No operational context logs registered for this product configuration."}
                  </p>
                </div>
              </div>
              <div className="sale-modal-footer">
                <button type="button" className="sale-cancel-btn btn-flex-center" onClick={() => setShowView(false)}>
                  Close Review Panel
                </button>
                <button type="button" className="sale-confirm-btn" onClick={() => { setShowView(false); setShowEdit(true); }}>
                  <Pencil size={14} /> Open Edit Sheet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEdit && (
        <div className="sale-modal-overlay" onClick={() => setShowEdit(false)}>
          <div className="sale-modal-container modal-scroll-container" onClick={(e) => e.stopPropagation()}>
            <div className="sale-modal-header">
              <h2>Modify Product File</h2>
              <p>Update clinical pharmaceutical profiles and stock parameters</p>
            </div>
            <form onSubmit={handleEditSubmit} className="sale-modal-form">
              <div className="sale-modal-content form-content-gap">
                <div className="form-section-card">
                  <h3 className="form-section-title">Product Identity Fields</h3>
                  <div className="form-grid-2col grid-margin-bottom">
                    <div className="form-field-group">
                      <label>Product Name *</label>
                      <input type="text" required className="sale-input input-padding-compact" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                    </div>
                    <div className="form-field-group">
                      <label>Category Matrix</label>
                      <select className="sale-select input-padding-compact" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}>
                        <option value="">Select Drug Class</option>
                        <option value="Analgesics">Analgesics</option>
                        <option value="Antibiotics">Antibiotics</option>
                        <option value="Antimalarials">Antimalarials</option>
                        <option value="Supplements">Supplements</option>
                        <option value="General">General / Over The Counter</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-grid-2col">
                    <div className="form-field-group">
                      <label>Generic Clinical Name</label>
                      <input type="text" className="sale-input input-padding-compact" value={editForm.genericName} onChange={(e) => setEditForm({ ...editForm, genericName: e.target.value })} />
                    </div>
                    <div className="form-field-group">
                      <label>Brand / Manufacturer Name</label>
                      <input type="text" className="sale-input input-padding-compact" value={editForm.brandName} onChange={(e) => setEditForm({ ...editForm, brandName: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-field-group top-margin-compact">
                    <label>Target Age Group</label>
                    <select className="sale-select input-padding-compact" value={editForm.targetAgeGroup} onChange={(e) => setEditForm({ ...editForm, targetAgeGroup: e.target.value })}>
                      <option value="Adult">Adult</option>
                      <option value="Pediatric">Pediatric</option>
                      <option value="Both">Both (General)</option>
                    </select>
                  </div>
                </div>

                <div className="form-section-card">
                  <h3 className="form-section-title">Packaging Configurations</h3>
                  <div className="form-grid-2col">
                    <div className="form-field-group">
                      <label>Bulk Supply Package Unit Type</label>
                      <select className="sale-select input-padding-compact" value={editForm.bulkPackagingType} onChange={(e) => setEditForm({ ...editForm, bulkPackagingType: e.target.value })}>
                        <option value="Box">Box</option>
                        <option value="Carton">Carton</option>
                        <option value="Pack">Pack</option>
                        <option value="Container">Container</option>
                      </select>
                    </div>
                    <div className="form-field-group">
                      <label>Retail Outflow Single Unit Type</label>
                      <select className="sale-select input-padding-compact" value={editForm.unitDispensingType} onChange={(e) => setEditForm({ ...editForm, unitDispensingType: e.target.value })}>
                        <option value="Tablet">Tablet</option>
                        <option value="Bottle">Bottle</option>
                        <option value="Sachet">Sachet</option>
                        <option value="Capsule">Capsule</option>
                        <option value="Tube">Tube</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="toggle-alert-banner">
                  <div>
                    <span className="toggle-banner-title">Inventory Tracker Toggle Configuration</span>
                    <span className="toggle-banner-desc">Switch between single generic tracking and batch variant grids</span>
                  </div>
                  <div className="toggle-banner-controls">
                    <div className="toggle-live-preview">
                      Total Stock: <strong>{editForm.stock}</strong> Single Units
                    </div>
                    <button type="button" onClick={toggleVariantsConfiguration} className={`toggle-switch-icon ${hasVariantsToggle ? "toggle-active" : "toggle-inactive"}`}>
                      {hasVariantsToggle ? <ToggleRight size={30} /> : <ToggleLeft size={30} />}
                    </button>
                  </div>
                </div>

                {!hasVariantsToggle ? (
                  <div className="flat-layout-grid">
                    <div className="form-field-group">
                      <label>Bulk {editForm.bulkPackagingType}s Received</label>
                      <input type="number" className="sale-input input-padding-compact" value={editForm.packsReceived} onChange={(e) => handleSingleStockMathChange("packsReceived", e.target.value)} />
                    </div>
                    <div className="form-field-group">
                      <label>{editForm.unitDispensingType}s Per Bulk {editForm.bulkPackagingType}</label>
                      <input type="number" className="sale-input input-padding-compact" value={editForm.unitsPerPack} onChange={(e) => handleSingleStockMathChange("unitsPerPack", e.target.value)} />
                    </div>
                    <div className="form-field-group">
                      <label>Bulk Cost Price (₦)</label>
                      <input type="number" step="any" className="sale-input input-padding-compact" value={editForm.costPrice} onChange={(e) => setEditForm({ ...editForm, costPrice: e.target.value })} />
                    </div>
                    <div className="form-field-group">
                      <label>Single Retail Selling Price (₦) *</label>
                      <input type="number" step="any" required className="sale-input input-padding-compact" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} />
                    </div>
                    <div className="form-field-group">
                      <label>Full Bulk Selling Price (₦ - Optional)</label>
                      <input type="number" step="any" className="sale-input input-padding-compact" value={editForm.bulkSellingPrice} onChange={(e) => setEditForm({ ...editForm, bulkSellingPrice: e.target.value })} />
                    </div>
                    <div className="form-field-group">
                      <label>Batch Line Identification Number</label>
                      <input type="text" className="sale-input input-padding-compact" value={editForm.batchNo} onChange={(e) => setEditForm({ ...editForm, batchNo: e.target.value })} />
                    </div>
                    <div className="form-field-group">
                      <label>Expiry Tracking Timeline</label>
                      <input type="date" className="sale-input input-padding-compact" value={editForm.expiryDate} onChange={(e) => setEditForm({ ...editForm, expiryDate: e.target.value })} />
                    </div>
                    <div className="form-field-group">
                      <label>NAFDAC Regulatory Stamp No</label>
                      <input type="text" className="sale-input input-padding-compact" value={editForm.nafdacNo} onChange={(e) => setEditForm({ ...editForm, nafdacNo: e.target.value })} />
                    </div>
                    <div className="form-field-group">
                      <label>Product Barcode / QR Code</label>
                      <div className="scanner-input-container">
                        <input type="text" className="sale-input input-padding-compact" value={editForm.barcode || ""} onChange={(e) => setEditForm({ ...editForm, barcode: e.target.value })} />
                        <button type="button" onClick={() => handleTriggerScanner(null)} className="scanner-trigger-action-btn">
                          <Scan size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="variant-matrix-box">
                    <div className="matrix-header-row">
                      <span className="matrix-title-blue">Formulations Variance List Block</span>
                      <button type="button" onClick={addVariantField} className="matrix-add-btn">
                        <Plus size={12} /> Create Variation Formulation Row
                      </button>
                    </div>

                    <div className="matrix-rows-stack">
                      {editForm.variants.map((variant, index) => (
                        <div key={index} className="matrix-item-card">
                          {editForm.variants.length > 1 && (
                            <button type="button" onClick={() => removeVariantField(index)} className="matrix-row-remove-btn">
                              <X size={14} />
                            </button>
                          )}

                          <div className="matrix-inner-row margin-bottom-compact">
                            <div className="matrix-input-group">
                              <label>Formulation Form</label>
                              <select className="sale-select variant-select-compact" value={variant.formulationType || "Tablet Form"} onChange={(e) => handleVariantChange(index, "formulationType", e.target.value)}>
                                <option value="Tablet Form">Tablet Form</option>
                                <option value="Syrup Form">Syrup Form</option>
                                <option value="Capsule Form">Capsule Form</option>
                                <option value="Suspension">Suspension</option>
                              </select>
                            </div>
                            <div className="matrix-input-group">
                              <label>Strength/Potency</label>
                              <input type="text" placeholder="500mg" className="sale-input variant-select-compact" value={variant.strength || ""} onChange={(e) => handleVariantChange(index, "strength", e.target.value)} />
                            </div>
                            <div className="matrix-input-group">
                              <label>Packs Count</label>
                              <input type="number" className="sale-input variant-select-compact" value={variant.packsReceived || ""} onChange={(e) => handleVariantChange(index, "packsReceived", e.target.value)} />
                            </div>
                            <div className="matrix-input-group">
                              <label>Units / Pack</label>
                              <input type="number" className="sale-input variant-select-compact" value={variant.unitsPerPack || ""} onChange={(e) => handleVariantChange(index, "unitsPerPack", e.target.value)} />
                            </div>
                          </div>

                          <div className="matrix-inner-row">
                            <div className="matrix-input-group">
                              <label>Cost Price (₦)</label>
                              <input type="number" className="sale-input variant-select-compact" value={variant.costPrice || ""} onChange={(e) => handleVariantChange(index, "costPrice", e.target.value)} />
                            </div>
                            <div className="matrix-input-group">
                              <label>Retail Price (₦) *</label>
                              <input type="number" required className="sale-input variant-select-compact" value={variant.unitSellingPrice || ""} onChange={(e) => handleVariantChange(index, "unitSellingPrice", e.target.value)} />
                            </div>
                            <div className="matrix-input-group">
                              <label>Bulk Selling Price (₦) (Optional)</label>
                              <input type="number" className="sale-input variant-select-compact" value={variant.bulkSellingPrice || ""} onChange={(e) => handleVariantChange(index, "bulkSellingPrice", e.target.value)} />
                            </div>
                            <div className="matrix-input-group">
                              <label>Variant Barcode / SKU</label>
                              <div className="scanner-input-container">
                                <input type="text" placeholder="615600004..." className="sale-input variant-select-compact" value={variant.barcode || ""} onChange={(e) => handleVariantChange(index, "barcode", e.target.value)} />
                                <button type="button" onClick={() => handleTriggerScanner(index)} className="scanner-trigger-action-btn" style={{ height: "34px" }}>
                                  <Scan size={14} />
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="matrix-inner-row">
                            <div className="matrix-input-group">
                              <label>Batch Number</label>
                              <input type="text" className="sale-input variant-select-compact" value={variant.batchNo || ""} onChange={(e) => handleVariantChange(index, "batchNo", e.target.value)} />
                            </div>
                            <div className="matrix-input-group">
                              <label><Calendar size={11} /> Expiry Date</label>
                              <input type="date" className="sale-input variant-select-compact" value={variant.expiryDate || ""} onChange={(e) => handleVariantChange(index, "expiryDate", e.target.value)} />
                            </div>
                            <div className="matrix-input-group">
                              <label>NAFDAC Reg No.</label>
                              <input type="text" className="sale-input variant-select-compact" value={variant.nafdacNo || ""} onChange={(e) => handleVariantChange(index, "nafdacNo", e.target.value)} />
                            </div>
                            <div className="matrix-calc-display">
                              <span className="calc-display-subtext">Calculated Units</span>
                              <strong className="calc-display-count">{variant.quantity || 0} items</strong>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="custom-fields-section">
                  <div className="custom-fields-header">
                    <span className="custom-fields-title">Custom Property Custom Metadata Tags</span>
                    <button type="button" onClick={addCustomField} className="custom-fields-add-btn">
                      <Plus size={12} /> Add Property Attribute Tag
                    </button>
                  </div>

                  <div className="custom-fields-stack">
                    {editForm.customFieldsArray.map((field, index) => (
                      <div key={index} className="custom-fields-row">
                        <input type="text" placeholder="Label Name (e.g., Storage Temp)" required className="sale-input custom-field-input" value={field.label || ""} onChange={(e) => handleCustomFieldChange(index, "label", e.target.value)} />
                        <input type="text" placeholder="Value Input Tag (e.g., Keep Cool)" required className="sale-input custom-field-input" value={field.value || ""} onChange={(e) => handleCustomFieldChange(index, "value", e.target.value)} />
                        <button type="button" onClick={() => removeCustomField(index)} className="custom-field-remove-icon">
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-field-group">
                  <label className="textarea-label-bold">Internal Log Context Logs / Operational Notes</label>
                  <textarea className="sale-input textarea-resizer" rows={2} value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} />
                </div>
              </div>

              <div className="sale-modal-footer">
                <button type="button" className="sale-cancel-btn" onClick={() => setShowEdit(false)}>
                  Cancel changes
                </button>
                <button type="submit" className="sale-confirm-btn">
                  <Check size={14} /> Save Product Alterations
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STEP 1: INTERMEDIATE PRE-SALE CONFIGURATION SCREEN OVERLAY */}
      {showPreSaleConfig && (
        <div className="sale-modal-overlay" onClick={() => setShowPreSaleConfig(false)}>
          <div className="sale-modal-container pre-sale-pop-up" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <button className="sale-modal-close" onClick={() => setShowPreSaleConfig(false)}>×</button>
            <div className="sale-modal-header">
              <h2>Configure Sale Context</h2>
              <p>Specify formulation layer and fulfillment parameters</p>
            </div>
            <div className="sale-modal-form" style={{ padding: '15px' }}>
              
              {hasVariants ? (
                <div className="form-field-group">
                  <label style={{ fontWeight: '500', marginBottom: '6px', fontSize: '13px', display: 'block' }}>Select Product Variant</label>
                  <select
                    className="sale-select input-padding-compact text-capitalize"
                    value={selectedVariantIdx}
                    onChange={(e) => setSelectedVariantIdx(Number(e.target.value))}
                  >
                    {product.variants?.map((v, i) => (
                      <option key={i} value={i} disabled={v.quantity <= 0}>
                        {v.formulationType} ({v.strength || "Base Form"}) — {v.quantity} units left
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '4px', marginBottom: '12px', fontSize: '13px', color: '#475569' }}>
                  Standard Unified Track (No custom variants defined).
                </div>
              )}

              <div className="form-field-group" style={{ marginTop: '14px' }}>
                <label style={{ fontWeight: '500', marginBottom: '6px', fontSize: '13px', display: 'block' }}>Select Selling Variant Mode</label>
                <select
                  className="sale-select input-padding-compact"
                  value={selectedOutflowMode}
                  onChange={(e) => setSelectedOutflowMode(e.target.value)}
                >
                  <option value="unit">Unit Selling ({hasVariants ? (product.variants[selectedVariantIdx]?.unitDispensingType || product.unitDispensingType || "Tablet") : (product.unitDispensingType || "Tablet")})</option>
                  <option value="bulk">Bulk Selling ({hasVariants ? (product.variants[selectedVariantIdx]?.bulkPackagingType || product.bulkPackagingType || "Pack") : (product.bulkPackagingType || "Pack")})</option>
                </select>
              </div>

              <div style={{ marginTop: '20px' }}>
                <button 
                  type="button" 
                  className="sale-confirm-btn btn-flex-center" 
                  style={{ width: '100%', gap: '8px', padding: '10px', justifyContent: 'center' }}
                  onClick={() => {
                    setShowPreSaleConfig(false)
                    setShowSellModal(true)
                  }}
                >
                  Proceed to Checkout <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: CONTEXT-CUSTOMIZED POINT OF SALE PANEL */}
      {showSellModal && (
        <div className="sale-modal-overlay" onClick={() => setShowSellModal(false)}>
          <div className="sale-modal-container sell-modal-sizing" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <button className="sale-modal-close" onClick={() => setShowSellModal(false)}>×</button>

            <div className="sale-modal-header" style={{ paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>
                DISPATCH SELECTION: {product.name} {hasVariants && `(${product.variants[selectedVariantIdx]?.formulationType} ${product.variants[selectedVariantIdx]?.strength || ""})`}
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>
                Mode: {selectedOutflowMode === "bulk" ? "WHOLESALE BULK PACKAGING" : "RETAIL UNIT DISPENSING"}
              </p>
            </div>

            <div className="sale-modal-form" style={{ marginTop: '15px' }}>
              <div className="sale-modal-content">
                
                {selectedOutflowMode === "bulk" ? (
                  <>
                    <div className="form-field-group">
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
                        Bulk Reference Selling Price:
                      </label>
                      <div style={{ fontSize: '14px', color: '#0f172a', padding: '10px 12px', background: '#f1f5f9', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <strong>
                          ₦{(() => {
                            const bulkPrice = checkoutMetrics?.bulkPrice ?? 0
                            const unitPrice = checkoutMetrics?.unitPrice ?? 0
                            const rate = checkoutMetrics?.rate ?? unitPrice
                            return bulkPrice > 0 ? rate.toLocaleString() : `${rate.toLocaleString()} (Derived)`
                          })()}
                        </strong> per Bulk {currentActiveTargetItem?.bulkPackagingType || product.bulkPackagingType || "Pack"}
                        <span style={{ color: '#64748b', marginLeft: '6px', fontSize: '12px' }}>
                          (Contains {currentUnitsPerPack} {currentActiveTargetItem?.unitDispensingType || product.unitDispensingType || "Units"}/Pack)
                        </span>
                      </div>
                    </div>

                    <div className="form-field-group" style={{ marginTop: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <label style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Fit Bulk Quantity to Sell:</label>
                        <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: '600', padding: '2px 6px', background: '#eff6ff', borderRadius: '4px' }}>
                          Available Stock: {bulkPacksStockRemaining} {currentActiveTargetItem?.bulkPackagingType || product.bulkPackagingType || "Packs"} ({unitsStockRemaining} single units)
                        </span>
                      </div>
                      <input
                        type="number"
                        min="1"
                        className="sale-input input-padding-compact"
                        placeholder="Enter pack quantity"
                        value={sellQuantity}
                        onChange={(e) => setSellQuantity(Number(e.target.value))}
                        style={{ fontSize: '14px' }}
                      />
                      <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px', display: 'block' }}>
                        * Input optimized for cartons/boxes
                      </span>
                    </div>

                    <div className="form-field-group" style={{ marginTop: '14px' }}>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Transaction Internal Notes:</label>
                      <textarea
                        className="sale-input textarea-resizer"
                        rows={2}
                        placeholder="Sold to your Pharmacy . ..."
                        value={transactionNotes}
                        onChange={(e) => setTransactionNotes(e.target.value)}
                        style={{ minHeight: '54px', fontSize: '13px', paddingTop: '8px', paddingBottom: '8px' }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-field-group">
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
                        Unit Base Retail Price:
                      </label>
                      <div style={{ fontSize: '14px', color: '#0f172a', padding: '10px 12px', background: '#f1f5f9', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <strong>₦{(checkoutMetrics?.unitPrice ?? 0).toLocaleString()}</strong> per {currentActiveTargetItem?.unitDispensingType || product.unitDispensingType || "Unit"}
                      </div>
                    </div>

                    <div className="form-field-group" style={{ marginTop: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <label style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Fit Unit Quantity to Sell:</label>
                        <span style={{ fontSize: '11px', color: '#059669', fontWeight: '600', padding: '2px 6px', background: '#ecfdf5', borderRadius: '4px' }}>
                          Available Stock: {unitsStockRemaining} {currentActiveTargetItem?.unitDispensingType || product.unitDispensingType || "Units"}
                        </span>
                      </div>
                      <input
                        type="number"
                        min="1"
                        className="sale-input input-padding-compact"
                        placeholder="Enter unit pieces count"
                        value={sellQuantity}
                        onChange={(e) => setSellQuantity(Number(e.target.value))}
                        style={{ fontSize: '14px' }}
                      />
                      <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px', display: 'block' }}>
                        * Input optimized for pieces/tablets
                      </span>
                    </div>

                    <div className="form-field-group" style={{ marginTop: '14px' }}>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Transaction Internal Notes:</label>
                      <textarea
                        className="sale-input textarea-resizer"
                        rows={2}
                        placeholder="Optional internal remarks or patient treatment log files..."
                        value={transactionNotes}
                        onChange={(e) => setTransactionNotes(e.target.value)}
                        style={{ minHeight: '54px', fontSize: '13px', paddingTop: '8px', paddingBottom: '8px' }}
                      />
                    </div>
                  </>
                )}

                {/* ESTIMATED TOTAL MODULE */}
                <div style={{ marginTop: '18px', padding: '12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#475569', fontWeight: '500' }}>ESTIMATED TOTAL:</span>
                    <strong style={{ fontSize: '18px', color: '#0f172a', fontWeight: '700' }}>
                      ₦{(computeCheckoutTotals(checkoutMetrics, sellQuantity).totalRevenue).toLocaleString()}
                    </strong>
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                    (Deducting {computeCheckoutTotals(checkoutMetrics, sellQuantity).totalUnitsToDeduct} total single units from tracking)
                  </div>
                </div>

              </div>

              <div className="sale-modal-footer sell-footer-override" style={{ marginTop: '18px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button 
                  type="button" 
                  className="sale-cancel-btn" 
                  style={{ margin: 0 }} 
                  onClick={() => { 
                    setShowSellModal(false); 
                    const hasBulkOption = Number(product.bulkSellingPrice || 0) > 0 || Number(product.unitsPerPack || 1) > 1;
                    if (!hasVariants && !hasBulkOption) {
                      // Stay closed
                    } else {
                      setShowPreSaleConfig(true); 
                    }
                  }}
                  disabled={!hasVariants && !(Number(product.bulkSellingPrice || 0) > 0 || Number(product.unitsPerPack || 1) > 1)}
                >
                  Back
                </button>
                <button type="button" className="sale-confirm-btn" style={{ margin: 0 }} onClick={handleSellExecution}>
                  CONFIRM CHECKOUT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HARDWARE OVERLAY TRIGGER */}
      {showScanner && (
        <BarcodeScanner 
          onScanSuccess={handleHardwareScanSuccess} 
          onClose={() => setShowScanner(false)} 
        />
      )}
    </>
  )
}



export default ProductCard