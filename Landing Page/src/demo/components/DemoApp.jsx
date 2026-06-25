import "./demo.css"
import { useEffect, useState } from "react"
import {
  LayoutDashboard,
  ShoppingCart,
  BarChart3,
  Activity,
  FileBarChart2,
  Settings,
  Plus,
  FileText,
  Calendar,
  Layers,
  ScanLine
} from "lucide-react"

import starterProducts from "../data/starterProducts"
import ProductCard from "./ProductCard"
import ProductForm from "./ProductForm"
import InventoryHeader from "./InventoryHeader"
import InventoryStats from "./InventoryStats"
import Dashboard from "./Dashboard"
import ActivityPage from "./Activity"
import Reports from "./Reports"
import SettingsPanel from "./SettingsPanel"
import BarcodeScanner from "./scanner/BarcodeScanner"

export default function DemoApp() {
  // Normalizer: strictly moves or isolates properties based on variant availability
  const normalizeProduct = (raw) => {
    if (!raw) return null
    const src = { ...raw }

    const id = src.id ?? src._id ?? Date.now()
    const rawVariants = Array.isArray(src.variants) ? src.variants : []
    const hasVariants = rawVariants.length > 0

    // 1. Process Variants if they exist
    const variants = rawVariants.map((v, idx) => {
      const packs = Number(v.packsReceived ?? v.packs ?? 0)
      const unitsPerPack = Number(v.unitsPerPack ?? v.units_per_pack ?? v.units ?? 0)
      const quantity = Number(v.quantity ?? v.totalUnitsStock ?? packs * unitsPerPack ?? 0)
      
      return {
        id: v.id ?? `${id}-v-${idx}`,
        formulationType: v.formulationType ?? v.type ?? v.formulation ?? "Variant",
        strength: v.strength ?? v.dosage ?? "",
        packsReceived: packs,
        unitsPerPack: unitsPerPack,
        quantity,
        costPrice: Number(v.costPrice ?? v.cost_price ?? 0),
        unitSellingPrice: Number(v.unitSellingPrice ?? v.sellingPrice ?? 0),
        bulkSellingPrice: Number(v.bulkSellingPrice ?? v.bulkSelling ?? 0),
        batchNo: v.batchNo ?? v.batch_no ?? "",
        expiryDate: v.expiryDate ?? v.expiry_date ?? "",
        nafdacNo: v.nafdacNo ?? v.nafdac_no ?? "",
        barcode: v.barcode ?? "",
        unitDispensingType: v.unitDispensingType ?? src.unitDispensingType ?? "unit",
        bulkPackagingType: v.bulkPackagingType ?? src.bulkPackagingType ?? "pack",
        customAttributes: v.customAttributes ?? {}
      }
    })

    // Calculate aggregated inventory values
    const stockFromVariants = variants.reduce((s, vv) => s + Number(vv.quantity || 0), 0)
    const stock = hasVariants ? stockFromVariants : Number(src.stock ?? src.quantity ?? 0)

    const firstVariant = variants[0]
    const price = Number(src.price ?? src.unitSellingPrice ?? firstVariant?.unitSellingPrice ?? 0)

    // 2. Structural Split Rule: Clean general fields if variants are actively tracking them
    return {
      id,
      name: src.name ?? src.productName ?? src.product_name ?? "Unnamed Product",
      genericName: src.genericName ?? src.generic_name ?? "",
      brandName: src.brandName ?? src.brand_name ?? "",
      targetAgeGroup: src.targetAgeGroup ?? "Both",
      category: src.category ?? "General",
      price,
      stock,
      reorderLevel: Number(src.reorderLevel ?? src.reorder_level ?? 5),
      notes: src.notes ?? "",
      variants,
      
      // Conditionally clear general tracking fields depending on if variants exist
      barcode: hasVariants ? "" : (src.barcode ?? firstVariant?.barcode ?? ""),
      costPrice: hasVariants ? 0 : Number(src.costPrice ?? src.cost_price ?? 0),
      bulkSellingPrice: hasVariants ? 0 : Number(src.bulkSellingPrice ?? 0),
      batchNo: hasVariants ? "" : (src.batchNo ?? src.batch_no ?? ""),
      nafdacNo: hasVariants ? "" : (src.nafdacNo ?? src.nafdac_no ?? ""),
      expiryDate: hasVariants ? "" : (src.expiryDate ?? src.expiry_date ?? ""),
      bulkPackagingType: hasVariants ? "" : (src.bulkPackagingType ?? "pack"),
      unitDispensingType: hasVariants ? "" : (src.unitDispensingType ?? "unit")
    }
  }

  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem("products")
    const base = saved ? JSON.parse(saved) : starterProducts
    return Array.isArray(base) ? base.map(normalizeProduct) : []
  })

  const [salesLog, setSalesLog] = useState(() => {
    const saved = localStorage.getItem("sales")
    return saved ? JSON.parse(saved) : []
  })

  const [search, setSearch] = useState("")
  const [inventoryFilter, setInventoryFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("dashboard")
  const [darkMode, setDarkMode] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [scannerCallback, setScannerCallback] = useState(null)

  const [productToSell, setProductToSell] = useState(null)
  const [sellQuantity, setSellQuantity] = useState(1)
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0)
  const [sellNote, setSellNote] = useState("")
  const [sellError, setSellError] = useState("")

  // Persist storage adjustments automatically
  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products))
  }, [products])

  useEffect(() => {
    localStorage.setItem("sales", JSON.stringify(salesLog))
  }, [salesLog])

  useEffect(() => {
    window.scrollTo(0, 0)
    const structuralScrollContainers = [".main", ".demo-layout", ".panel", ".products-wrapper"]
    structuralScrollContainers.forEach((selector) => {
      const container = document.querySelector(selector)
      if (container) container.scrollTop = 0
    })
  }, [activeTab])

  function initiateSellFlow(product, qty = 1, variantIdx = null) {
    const resolved = products.find(p => p.id === (product?.id ?? product)) || product
    setProductToSell(resolved)
    setSellQuantity(qty)
    setSelectedVariantIdx(variantIdx !== null ? variantIdx : 0)
    setSellNote("")
    setSellError("")
  }

  function handleBarcodeScanned(scannedCode) {
    if (!scannedCode) return
    const cleanScan = String(scannedCode).trim()

    let matchedProduct = null

    for (const p of products) {
      if (Array.isArray(p.variants)) {
        const vIdx = p.variants.findIndex(v => String(v.barcode || "").trim() === cleanScan)
        if (vIdx !== -1) {
          matchedProduct = p
          break
        }
      }
      if (String(p.barcode || "").trim() === cleanScan) {
        matchedProduct = p
        break
      }
    }

    if (matchedProduct) {
      setActiveTab("products")
      setInventoryFilter("all")
      setSearch(matchedProduct.name)
    } else {
      alert(`No product variant found matching barcode: "${scannedCode}"`)
    }
  }

  function addProduct(incomingProduct) {
    try {
      const incomingVariants = Array.isArray(incomingProduct.variants) ? incomingProduct.variants : []
      const hasVariants = incomingVariants.length > 0

      const synchronizedVariants = incomingVariants.map((v, i) => {
        const packs = Number(v.packsReceived ?? v.packs ?? 0)
        const units = Number(v.unitsPerPack ?? 0)
        return {
          id: v.id ?? `new-${Date.now()}-${i}`,
          formulationType: v.formulationType ?? v.type ?? "Variant",
          strength: v.strength ?? v.dosage ?? "",
          packsReceived: packs,
          unitsPerPack: units,
          quantity: Number(v.totalUnitsStock ?? v.quantity ?? packs * units),
          costPrice: Number(v.costPrice ?? 0),
          unitSellingPrice: Number(v.unitSellingPrice ?? v.sellingPrice ?? 0),
          bulkSellingPrice: Number(v.bulkSellingPrice ?? 0),
          batchNo: v.batchNo ?? "",
          expiryDate: v.expiryDate ?? "",
          nafdacNo: v.nafdacNo ?? "",
          barcode: v.barcode ?? "",
          bulkPackagingType: v.bulkPackagingType ?? "Carton",
          unitDispensingType: v.unitDispensingType ?? "Tablet",
          customAttributes: v.customAttributes ?? {}
        }
      })

      const absoluteCalculatedStock = incomingProduct.totalCalculatedStock !== undefined
        ? Number(incomingProduct.totalCalculatedStock)
        : (hasVariants 
            ? synchronizedVariants.reduce((sum, v) => sum + Number(v.quantity || 0), 0) 
            : Number(incomingProduct.stock ?? incomingProduct.quantity ?? 0))

      const primaryPrice = hasVariants 
        ? Number(synchronizedVariants[0]?.unitSellingPrice ?? 0) 
        : Number(incomingProduct.price ?? incomingProduct.unitSellingPrice ?? 0)

      const normalizedPayload = {
        id: Date.now(),
        name: incomingProduct.productName ?? incomingProduct.name ?? "Unnamed Product Item",
        genericName: incomingProduct.genericName ?? "",
        brandName: incomingProduct.brandName ?? "",
        targetAgeGroup: incomingProduct.targetAgeGroup ?? "Both",
        category: incomingProduct.category ?? "General / OTC",
        price: primaryPrice,
        stock: absoluteCalculatedStock,
        reorderLevel: Number(incomingProduct.reorderLevel ?? 5),
        notes: incomingProduct.notes ?? "",
        variants: synchronizedVariants,

        barcode: hasVariants ? "" : (incomingProduct.barcode ?? synchronizedVariants[0]?.barcode ?? ""),
        costPrice: hasVariants ? 0 : Number(incomingProduct.costPrice ?? 0),
        bulkSellingPrice: hasVariants ? 0 : Number(incomingProduct.bulkSellingPrice ?? 0),
        batchNo: hasVariants ? "" : (incomingProduct.batchNo ?? ""),
        nafdacNo: hasVariants ? "" : (incomingProduct.nafdacNo ?? ""),
        expiryDate: hasVariants ? "" : (incomingProduct.expiryDate ?? ""),
        bulkPackagingType: hasVariants ? "" : (incomingProduct.bulkPackagingType ?? "Pack"),
        unitDispensingType: hasVariants ? "" : (incomingProduct.unitDispensingType ?? "Unit")
      }

      const normalized = normalizeProduct(normalizedPayload)
      setProducts(prevProducts => [...prevProducts, normalized])
      setIsFormOpen(false)
    } catch (err) {
      console.error("Failed to add product:", err)
      alert("Failed to add product. See console for details.")
    }
  }

  function updateProduct(id, updatedProduct) {
    setProducts(products.map(item => (item.id === id ? normalizeProduct({ ...updatedProduct, id }) : item)))
  }

  function handleExecuteSale(e) {
    if (e) e.preventDefault()
    if (!productToSell) return

    const qty = Number(sellQuantity)
    if (!qty || qty <= 0) {
      setSellError("Please enter a valid quantity greater than 0.")
      return
    }

    const current = products.find(p => p.id === productToSell.id) || productToSell
    const hasVariants = Array.isArray(current.variants) && current.variants.length > 0

    let activeVariant = null
    if (hasVariants) {
      activeVariant = current.variants[selectedVariantIdx]
      if (!activeVariant || qty > Number(activeVariant.quantity || 0)) {
        setSellError(`Insufficient stock for selected variant/batch. Only ${activeVariant?.quantity || 0} units available.`)
        return
      }
    } else {
      if (qty > Number(current.stock || 0)) {
        setSellError(`Insufficient overall stock. Only ${current.stock || 0} units available.`)
        return
      }
    }

    const updatedProducts = products.map(item => {
      if (item.id === current.id) {
        const copy = { ...item }
        if (Array.isArray(copy.variants) && copy.variants.length > 0) {
          copy.variants = copy.variants.map((v, idx) =>
            idx === selectedVariantIdx ? { ...v, quantity: Math.max(0, Number(v.quantity || 0) - qty) } : v
          )
          copy.stock = copy.variants.reduce((s, vv) => s + Number(vv.quantity || 0), 0)
        } else {
          copy.stock = Math.max(0, Number(copy.stock || 0) - qty)
        }
        return normalizeProduct(copy)
      }
      return item
    })

    let saleDisplayName = current.name
    let itemPrice = Number(current.price ?? 0)
    
    const unitSellingPrice = hasVariants ? Number(activeVariant?.unitSellingPrice ?? 0) : Number(current.price ?? 0)
    const bulkSellingPrice = hasVariants ? Number(activeVariant?.bulkSellingPrice ?? 0) : Number(current.bulkSellingPrice ?? 0)
    const unitsPerPack = hasVariants ? Number(activeVariant?.unitsPerPack || 1) : 1

    if (hasVariants && activeVariant) {
      saleDisplayName += ` (${activeVariant.formulationType ?? ""}${activeVariant.strength ? ' - ' + activeVariant.strength : ''})`
      itemPrice = unitSellingPrice
    }

    const bulkQuantity = unitsPerPack > 1 ? Math.floor(qty / unitsPerPack) : 0
    const unitQuantity = unitsPerPack > 1 ? qty % unitsPerPack : qty

    setSalesLog([
      {
        id: Date.now(),
        productId: current.id,
        variantId: activeVariant ? activeVariant.id : null,
        name: saleDisplayName,
        quantity: qty,
        price: itemPrice,
        unitSellingPrice: unitSellingPrice,
        bulkSellingPrice: bulkSellingPrice,
        unitQuantity: unitQuantity,
        bulkQuantity: bulkQuantity,
        note: sellNote.trim() || "Regular Sale",
        date: new Date().toLocaleString()
      },
      ...salesLog
    ])

    setProducts(updatedProducts)
    setProductToSell(null)
  }

  function deleteProduct(id) {
    setProducts(products.filter(item => item.id !== id))
  }

  const filteredProducts = products.filter(item => {
    const matchesVariantSearch = Array.isArray(item.variants) && item.variants.some(v => 
      (v.batchNo || "").toLowerCase().includes(search.toLowerCase()) ||
      (v.nafdacNo || "").toLowerCase().includes(search.toLowerCase()) ||
      (v.barcode || "").includes(search)
    )

    const matchesSearch = (item.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.genericName || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.batchNo || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.nafdacNo || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.barcode || "").includes(search) ||
      matchesVariantSearch

    if (!matchesSearch) return false

    const stockCount = Number(item.stock || 0)
    const reorderLevel = Number(item.reorderLevel || 5)

    let checkExpiryDate = item.expiryDate
    if (Array.isArray(item.variants) && item.variants.length > 0) {
      checkExpiryDate = item.variants[0]?.expiryDate
    }

    let daysRemaining = Infinity
    if (checkExpiryDate && checkExpiryDate !== "N/A" && checkExpiryDate !== "") {
      const expiry = new Date(checkExpiryDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      expiry.setHours(0, 0, 0, 0)
      daysRemaining = Math.round((expiry - today) / (24 * 60 * 60 * 1000))
    }

    switch (inventoryFilter) {
      case "expired":
        return daysRemaining < 0
      case "expiringSoon":
        return daysRemaining >= 0 && daysRemaining <= 90
      case "lowStock":
        return stockCount > 0 && stockCount <= reorderLevel
      case "outOfStock":
        return stockCount === 0
      default:
        return true
    }
  })

  const contextualUnitPrice = productToSell
    ? (Array.isArray(productToSell.variants) && productToSell.variants.length > 0
        ? Number(productToSell.variants[selectedVariantIdx]?.unitSellingPrice ?? productToSell.price)
        : Number(productToSell.price ?? 0))
    : 0

  const contextualBulkPrice = productToSell
    ? (Array.isArray(productToSell.variants) && productToSell.variants.length > 0
        ? Number(productToSell.variants[selectedVariantIdx]?.bulkSellingPrice ?? 0)
        : Number(productToSell.bulkSellingPrice ?? 0))
    : 0

  const contextualBulkType = productToSell
    ? (Array.isArray(productToSell.variants) && productToSell.variants.length > 0
        ? productToSell.variants[selectedVariantIdx]?.bulkPackagingType
        : productToSell.bulkPackagingType || "Pack")
    : "Pack"

  const contextualDispensingType = productToSell
    ? (Array.isArray(productToSell.variants) && productToSell.variants.length > 0
        ? productToSell.variants[selectedVariantIdx]?.unitDispensingType
        : productToSell.unitDispensingType || "Unit")
    : "Unit"

  const contextualExpiryDate = productToSell
    ? (Array.isArray(productToSell.variants) && productToSell.variants.length > 0
        ? productToSell.variants[selectedVariantIdx]?.expiryDate
        : productToSell.expiryDate)
    : ""

  return (
    <div className={darkMode ? "demo-layout" : "demo-layout light-mode"}>
      <aside className="sidebar">
        {/* Brand Corrected to Tipia */}
        <h2 className="brand">Tipia</h2>
        <div className="nav">
          <button className={activeTab === "dashboard" ? "active" : ""} onClick={() => setActiveTab("dashboard")}>
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button className={activeTab === "products" ? "active" : ""} onClick={() => setActiveTab("products")}>
            <ShoppingCart size={18} /> Products
          </button>
          <button className={activeTab === "sales" ? "active" : ""} onClick={() => setActiveTab("sales")}>
            <BarChart3 size={18} /> Sales
          </button>
          <button className={activeTab === "activity" ? "active" : ""} onClick={() => setActiveTab("activity")}>
            <Activity size={18} /> Activity
          </button>
          <button className={activeTab === "reports" ? "active" : ""} onClick={() => setActiveTab("reports")}>
            <FileBarChart2 size={18} /> Reports
          </button>
          <button className={activeTab === "settings" ? "active" : ""} onClick={() => setActiveTab("settings")}>
            <Settings size={18} /> Settings
          </button>
        </div>
      </aside>

      <main className="main">
        <InventoryHeader darkMode={darkMode} />
        <InventoryStats products={products} />

        {activeTab === "dashboard" && <Dashboard products={products} salesLog={salesLog} />}

        {activeTab === "products" && (
          <>
            <div className="demo-controls">
              <input
                className="search-input"
                placeholder="Search by name, generic name, batch, NAFDAC, barcode..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <button 
                type="button" 
                className="scan-action-trigger" 
                onClick={() => setIsScannerOpen(true)}
                title="Scan box barcode"
              >
                <ScanLine size={18} />
              </button>

              <select
                className="status-select-filter"
                value={inventoryFilter}
                onChange={(e) => setInventoryFilter(e.target.value)}
              >
                <option value="all">All Inventory</option>
                <option value="expired">Expired Products</option>
                <option value="expiringSoon">Expiring Soon</option>
                <option value="lowStock">Low Stock Status</option>
                <option value="outOfStock">Out of Stock</option>
              </select>

              <button
                className="primary-btn create-btn"
                onClick={() => setIsFormOpen(true)}
              >
                <Plus size={16} /> Create Product
              </button>
            </div>

            <ProductForm
              isOpen={isFormOpen}
              onClose={() => setIsFormOpen(false)}
              addProduct={addProduct}
              onRequestScan={(cb) => { setScannerCallback(() => cb); setIsScannerOpen(true); }}
            />

            {isScannerOpen && (
              <BarcodeScanner
                onScanSuccess={(code) => {
                  try {
                    if (typeof scannerCallback === 'function') {
                      scannerCallback(code)
                      setScannerCallback(null)
                      setIsScannerOpen(false)
                    } else {
                      handleBarcodeScanned(code)
                      setIsScannerOpen(false)
                    }
                  } catch (err) {
                    console.error('Scanner callback error', err)
                    setScannerCallback(null)
                    setIsScannerOpen(false)
                  }
                }}
                onClose={() => { setIsScannerOpen(false); setScannerCallback(null); }}
              />
            )}

            <div className="products-wrapper">
              {filteredProducts.length === 0 ? (
                <div className="empty-state-message">No products match the selected filters.</div>
              ) : (
                filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    sellProduct={(qty, variantIdx) => initiateSellFlow(product, qty, variantIdx)}
                    deleteProduct={deleteProduct}
                    updateProduct={updateProduct}
                  />
                ))
              )}
            </div>
          </>
        )}

        {activeTab === "sales" && (
          <div className="panel">
            <h3>Sales History</h3>
            {salesLog.length === 0 ? (
              <p>No sales yet</p>
            ) : (
              salesLog.map(sale => (
                <div key={sale.id} className="sale-item">
                  <div className="sale-item-split">
                    <div>
                      <strong>{sale.name}</strong>
                      <p className="sale-qty-sub">Quantity: {sale.quantity}</p>
                      {sale.note && (
                        <p className="sale-note-sub"><FileText size={12} /> {sale.note}</p>
                      )}
                    </div>
                    <span className="revenue-text">₦{(Number(sale.price) * sale.quantity).toLocaleString()}</span>
                  </div>
                  <p className="sale-date-sub">{sale.date}</p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "activity" && <ActivityPage salesLog={salesLog} />}
        {activeTab === "reports" && <Reports products={products} salesLog={salesLog} />}
        {activeTab === "settings" && <SettingsPanel darkMode={darkMode} setDarkMode={setDarkMode} />}
      </main>

      {productToSell && (
        <div className="sale-modal-overlay" onClick={() => setProductToSell(null)}>
          <div className="sale-modal-container" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="sale-modal-close" onClick={() => setProductToSell(null)}>✕</button>
            <div className="sale-modal-header">
              <h2>Confirm Sale</h2>
              <p>Verify transaction details before stock deduction</p>
            </div>

            <form onSubmit={handleExecuteSale} className="sale-modal-form">
              <div className="sale-modal-content">
                <div className="sale-info-card sale-full-width">
                  <span>Product Name</span>
                  <strong>{productToSell.name}</strong>
                  {productToSell.genericName && productToSell.genericName !== "N/A" && (
                    <small className="meta-field-pill" style={{ marginTop: '4px', display: 'inline-block' }}>
                      Generic: {productToSell.genericName}
                    </small>
                  )}
                </div>

                <div className="sale-info-card">
                  <span>Unit Price ({contextualDispensingType})</span>
                  <strong>₦{contextualUnitPrice.toLocaleString()}</strong>
                  {contextualBulkPrice > 0 && (
                    <span className="cost-caption" style={{ color: '#2563eb' }}>
                      Bulk ({contextualBulkType}): ₦{contextualBulkPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="sale-info-card">
                  <span>Stock Available</span>
                  <strong className={Number(productToSell.stock) <= Number(productToSell.reorderLevel) ? "sale-stock-low" : "sale-stock-good"}>
                    {Array.isArray(productToSell.variants) && productToSell.variants.length > 0
                      ? `${productToSell.variants[selectedVariantIdx]?.quantity ?? 0} units`
                      : `${productToSell.stock ?? 0} units`}
                  </strong>
                </div>

                {contextualExpiryDate && (
                  <div className="sale-info-card sale-full-width variant-alert-container">
                    <span>Product Expiry Date</span>
                    <span className="expiry-display-text">
                      <Calendar size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                      {contextualExpiryDate}
                    </span>
                  </div>
                )}

                {Array.isArray(productToSell.variants) && productToSell.variants.length > 0 && (
                  <div className="sale-info-card sale-full-width">
                    <span><Layers size={14} /> Selected Variant Form</span>
                    <select
                      value={selectedVariantIdx}
                      onChange={(e) => {
                        setSelectedVariantIdx(Number(e.target.value))
                        setSellError("")
                      }}
                      className="sale-select"
                    >
                      {productToSell.variants.map((v, index) => (
                        <option key={v.id ?? index} value={index}>
                          {v.formulationType} ({v.strength}) — {v.quantity ?? 0} {v.unitDispensingType || "items"} available
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="sale-info-card">
                  <span>Quantity to Sell</span>
                  <input
                    type="number"
                    min="1"
                    required
                    value={sellQuantity}
                    onChange={(e) => {
                      setSellQuantity(Number(e.target.value))
                      setSellError("")
                    }}
                    className="sale-input"
                  />
                </div>

                <div className="sale-info-card">
                  <span>Transaction Notes</span>
                  <input
                    type="text"
                    value={sellNote}
                    placeholder="E.g., Customer batch tracking, discount, etc."
                    onChange={(e) => setSellNote(e.target.value)}
                    className="sale-input"
                  />
                </div>

                {sellError && <div className="sale-error-box">⚠️ {sellError}</div>}

                <div className="sale-total-card">
                  <span>Estimated Revenue</span>
                  <strong>₦{(Number(contextualUnitPrice) * (sellQuantity || 0)).toLocaleString()}</strong>
                </div>
              </div>

              <div className="sale-modal-footer">
                <button type="button" className="sale-cancel-btn" onClick={() => setProductToSell(null)}>Cancel</button>
                <button type="submit" className="sale-confirm-btn">Complete Sale</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}