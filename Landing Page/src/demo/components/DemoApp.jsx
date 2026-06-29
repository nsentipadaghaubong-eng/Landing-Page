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
import { resolveCheckoutMetrics, computeCheckoutTotals } from "../utils/checkoutMetrics"
import { isExpired, isExpiringSoon } from "../utils/expiryMetrics"

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

  function receiveSellTransaction(transactionPackage) {
    if (!transactionPackage?.id) return

    const resolved = products.find(p => p.id === transactionPackage.id) || transactionPackage

    setProductToSell({
      ...resolved,
      selectedVariantIdx: transactionPackage.selectedVariantIdx ?? 0,
      selectedOutflowMode: transactionPackage.selectedOutflowMode ?? "unit",
      sellQuantity: Number(transactionPackage.sellQuantity ?? 1),
      transactionNotes: transactionPackage.transactionNotes ?? "",
    })
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

  function handleExecuteSale() {
    if (!productToSell) return

    const variantIdx = productToSell.selectedVariantIdx ?? 0
    const mode = productToSell.selectedOutflowMode ?? "unit"
    const sellQty = Number(productToSell.sellQuantity ?? 0)
    const notes = (productToSell.transactionNotes ?? "").trim() || "Regular Sale"

    if (!sellQty || sellQty <= 0) {
      setSellError("Please enter a valid quantity greater than 0.")
      return
    }

    const current = products.find(p => p.id === productToSell.id) || productToSell
    const metrics = resolveCheckoutMetrics(current, variantIdx, mode)
    if (!metrics) return

    const { totalRevenue, totalUnitsToDeduct } = computeCheckoutTotals(metrics, sellQty)

    if (totalUnitsToDeduct > metrics.unitsAvailable) {
      setSellError(`Insufficient stock. Only ${metrics.unitsAvailable} units available.`)
      return
    }

    const updatedProducts = products.map(item => {
      if (item.id !== current.id) return item
      const copy = { ...item }

      if (metrics.hasVariants) {
        copy.variants = copy.variants.map((v, idx) =>
          idx === variantIdx
            ? { ...v, quantity: Math.max(0, Number(v.quantity || 0) - totalUnitsToDeduct) }
            : v
        )
        copy.stock = copy.variants.reduce((s, v) => s + Number(v.quantity || 0), 0)
      } else {
        copy.stock = Math.max(0, Number(copy.stock || 0) - totalUnitsToDeduct)
      }
      return normalizeProduct(copy)
    })

    let saleDisplayName = current.name
    const { source } = metrics
    if (metrics.hasVariants && source) {
      saleDisplayName += ` (${source.formulationType ?? ""}${source.strength ? " - " + source.strength : ""})`
    }

    setSalesLog(prev => [{
      id: Date.now(),
      productId: current.id,
      variantId: metrics.hasVariants ? source.id : null,
      name: saleDisplayName,
      quantity: totalUnitsToDeduct,
      sellQuantity: sellQty,
      outflowMode: mode,
      price: metrics.rate,
      total: totalRevenue,
      unitSellingPrice: metrics.unitPrice,
      bulkSellingPrice: metrics.bulkPrice,
      note: notes,
      date: new Date().toLocaleString(),
    }, ...prev])

    setProducts(updatedProducts)
    setProductToSell(null)
    setSellError("")
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

    switch (inventoryFilter) {
      case "expired":
        return isExpired(item)
      case "expiringSoon":
        return isExpiringSoon(item)
      case "lowStock":
        return stockCount > 0 && stockCount <= reorderLevel
      case "outOfStock":
        return stockCount === 0
      default:
        return true
    }
  })

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

        {activeTab === "dashboard" && (
          <Dashboard
            products={products}
            salesLog={salesLog}
            onViewExpiringSoon={() => {
              setActiveTab("products")
              setInventoryFilter("expiringSoon")
              setSearch("")
            }}
            onViewExpired={() => {
              setActiveTab("products")
              setInventoryFilter("expired")
              setSearch("")
            }}
          />
        )}

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
                    sellProduct={receiveSellTransaction}
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
                    <span className="revenue-text">₦{(sale.total ?? Number(sale.price) * sale.quantity).toLocaleString()}</span>
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
    <div 
      className="sale-modal-container sell-modal-sizing" 
      style={{ 
        maxWidth: '540px',
        width: '92%',
        margin: '0 auto',
        padding: '16px 12px',
        maxHeight: '90vh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }} 
      onClick={(e) => e.stopPropagation()}
    >
      

      {(() => {
        const liveProduct = products.find(p => p.id === productToSell.id) || productToSell
        const activeVariantIdx = productToSell.selectedVariantIdx ?? 0
        const currentMode = productToSell.selectedOutflowMode ?? "unit"
        const quantityToSell = Number(productToSell.sellQuantity ?? 1)
        const transactionNotes = productToSell.transactionNotes ?? ""

        const metrics = resolveCheckoutMetrics(liveProduct, activeVariantIdx, currentMode)
        if (!metrics) return null

        const { hasVariants, source, unitsPerPack, rate, unitsAvailable, packsAvailable, unitLabel, bulkLabel, isBulk } = metrics
        const { totalRevenue, totalUnitsToDeduct } = computeCheckoutTotals(metrics, quantityToSell)

        return (
          <div className="sale-modal-form" style={{ marginTop: '0', display: 'flex', flexDirection: 'column', height: '100%' }}>
            
            {/* Header with fluid layout handling down to 300px */}
            <div className="sale-modal-header" style={{ paddingBottom: '12px', paddingRight: '20px', borderBottom: '1px solid #e2e8f0' }}>
              <h2 style={{ 
                fontSize: 'clamp(14px, 4vw, 16px)', 
                fontWeight: '600', 
                color: '#0f172a', 
                margin: 0, 
                textAlign: 'left',
                lineHeight: '1.3',
                wordBreak: 'break-word'
              }}>
                DISPATCH SELECTION: {productToSell.name} {hasVariants && `(${source.formulationType || "Form"} ${source.strength || ""})`}
              </h2>
              <p style={{ 
                margin: '6px 0 0', 
                fontSize: 'clamp(9px, 3vw, 11px)', 
                color: '#4b5563', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em', 
                fontWeight: '700', 
                textAlign: 'left' 
              }}>
                Mode: {isBulk ? "WHOLESALE BULK PACKAGING" : "RETAIL UNIT DISPENSING"}
              </p>
            </div>

            {/* Scrollable body content layer with compact padding handling */}
            <div style={{ marginTop: '12px', flex: '1 1 auto', overflowY: 'visible' }}>
              <div className="sale-modal-content" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                {/* STRICT SWITCH DISPATCH CONDITIONAL VIEW */}
                {isBulk ? (
                  <>
                    {/* WHOLESALE BULK FOCUS LAYOUT */}
                    <div className="form-field-group" style={{ textAlign: 'left' }}>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px', color: '#64748b', fontWeight: '500' }}>
                        Bulk Reference Selling Price:
                      </label>
                      <div style={{ 
                        fontSize: '13px', 
                        color: '#0f172a', 
                        padding: '8px 10px', 
                        background: '#f1f5f9', 
                        borderRadius: '6px', 
                        border: '1px solid #e2e8f0',
                        lineHeight: '1.4',
                        wordBreak: 'break-word'
                      }}>
                        <strong>₦{rate.toLocaleString()}</strong> per Bulk {bulkLabel}
                        <span style={{ color: '#64748b', marginLeft: '4px', display: 'inline-block', fontSize: '11px' }}>
                          (Contains {unitsPerPack} {unitLabel}/{bulkLabel})
                        </span>
                      </div>
                    </div>

                    <div className="form-field-group" style={{ textAlign: 'left' }}>
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'flex-start', 
                        gap: '2px',
                        marginBottom: '4px' 
                      }}>
                        <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Fit Bulk Quantity to Sell:</label>
                        <span style={{ 
                          fontSize: '10px', 
                          color: '#2563eb', 
                          fontWeight: '600', 
                          padding: '2px 6px', 
                          background: '#eff6ff', 
                          borderRadius: '4px',
                          display: 'inline-block',
                          wordBreak: 'break-word'
                        }}>
                          Available Stock: {packsAvailable} {bulkLabel}s ({unitsAvailable} single units)
                        </span>
                      </div>
                      <input
                        type="number"
                        className="sale-input input-padding-compact"
                        value={quantityToSell}
                        disabled
                        style={{ fontSize: '13px', padding: '8px 10px', backgroundColor: '#f1f5f9', cursor: 'not-allowed', width: '100%', boxSizing: 'border-box' }}
                      />
                      <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '3px', display: 'block' }}>
                        * Input optimized for cartons/boxes
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    {/* RETAIL UNIT FOCUS LAYOUT */}
                    <div className="form-field-group" style={{ textAlign: 'left' }}>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px', color: '#64748b', fontWeight: '500' }}>
                        Unit Base Retail Price:
                      </label>
                      <div style={{ fontSize: '13px', color: '#0f172a', padding: '8px 10px', background: '#f1f5f9', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <strong>₦{rate.toLocaleString()}</strong> per {unitLabel}
                      </div>
                    </div>

                    <div className="form-field-group" style={{ textAlign: 'left' }}>
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'flex-start',
                        gap: '2px',
                        marginBottom: '4px' 
                      }}>
                        <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Fit Unit Quantity to Sell:</label>
                        <span style={{ 
                          fontSize: '10px', 
                          color: '#059669', 
                          fontWeight: '600', 
                          padding: '2px 6px', 
                          background: '#ecfdf5', 
                          borderRadius: '4px',
                          display: 'inline-block'
                        }}>
                          Available Stock: {unitsAvailable} {unitLabel}
                        </span>
                      </div>
                      <input
                        type="number"
                        className="sale-input input-padding-compact"
                        value={quantityToSell}
                        disabled
                        style={{ fontSize: '13px', padding: '8px 10px', backgroundColor: '#f1f5f9', cursor: 'not-allowed', width: '100%', boxSizing: 'border-box' }}
                      />
                      <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '3px', display: 'block' }}>
                        * Input optimized for pieces/tablets
                      </span>
                    </div>
                  </>
                )}

                {/* Transaction Remarks Field */}
                <div className="form-field-group" style={{ textAlign: 'left' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Transaction Internal Notes:</label>
                  <textarea
                    className="sale-input textarea-resizer"
                    rows={2}
                    value={transactionNotes || "No additional configuration tracking notes added..."}
                    disabled
                    style={{ minHeight: '44px', fontSize: '12px', padding: '6px 10px', backgroundColor: '#f1f5f9', cursor: 'not-allowed', width: '100%', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Variant Specific Batch Expiration Badge */}
                {source.expiryDate && (
                  <div style={{ 
                    marginTop: '2px', 
                    padding: '8px 10px', 
                    background: '#fef2f2', 
                    borderRadius: '6px', 
                    border: '1px solid #fee2e2', 
                    display: 'flex', 
                    alignItems: 'center', 
                    flexWrap: 'wrap',
                    gap: '4px', 
                    fontSize: '11px' 
                  }}>
                    <span style={{ color: '#991b1b', fontWeight: '500' }}>Batch Expiration Status:</span>
                    <strong style={{ color: '#dc2626' }}>🗓️ {source.expiryDate}</strong>
                  </div>
                )}

                {/* ESTIMATED TOTAL MODULE SECTION */}
                <div style={{ marginTop: '6px', padding: '10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#475569', fontWeight: '600' }}>ESTIMATED TOTAL:</span>
                    <strong style={{ fontSize: 'clamp(15px, 5vw, 18px)', color: '#0f172a', fontWeight: '700' }}>
                      ₦{totalRevenue.toLocaleString()}
                    </strong>
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px', lineHeight: '1.3' }}>
                    (Deducting {totalUnitsToDeduct} total single {unitLabel.toLowerCase()} from tracking)
                  </div>
                </div>

                {typeof sellError !== 'undefined' && sellError && (
                  <div className="sale-error-box" style={{ marginTop: '4px', fontSize: '12px' }}>⚠️ {sellError}</div>
                )}
              </div>

              {/* Action Buttons styled to match your card options safely handling narrow viewports */}
              <div 
                className="sale-modal-footer sell-footer-override" 
                style={{ 
                  marginTop: '16px', 
                  paddingTop: '12px', 
                  borderTop: '1px solid #e2e8f0', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <button 
                  type="button" 
                  className="sale-cancel-btn" 
                  style={{ 
                    margin: 0, 
                    padding: '8px 14px', 
                    fontSize: '12px',
                    flex: '1'
                  }} 
                  onClick={() => setProductToSell(null)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="sale-confirm-btn" 
                  style={{ 
                    margin: 0, 
                    padding: '8px 14px', 
                    fontSize: '12px',
                    flex: '2',
                    whiteSpace: 'nowrap'
                  }} 
                  onClick={handleExecuteSale}
                >
                  CONFIRM CHECKOUT
                </button>
              </div>
            </div>

          </div>
        );
      })()}
    </div>
  </div>
)}
          </div>
  )
}