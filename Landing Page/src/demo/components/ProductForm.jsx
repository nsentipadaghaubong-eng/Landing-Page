import React, { useState } from "react"
import { 
  Package, Tag, Layers3, DollarSign, Check, Plus, Trash2, 
  Calendar, ShieldCheck, Users, ToggleLeft, ToggleRight, ScanBarcode 
} from "lucide-react"
import "./ProductForm.css" 

function ProductForm({ isOpen, onClose, addProduct, onRequestScan }) {
  const initialProductState = {
    name: "",
    genericName: "",
    brandName: "",
    targetAgeGroup: "Both", // Options: Adult, Pediatric, Both
    category: "Analgesics",
    barcode: "" // Global barcode for non-variant items
  }

  const initialBaseFieldsState = {
    costPrice: "",
    unitSellingPrice: "",
    bulkSellingPrice: "", // Optional
    packsReceived: "",
    unitsPerPack: "",
    bulkPackagingType: "Carton", 
    unitDispensingType: "Tablet", 
    batchNo: "",
    expiryDate: "",
    nafdacNo: ""
  }

  const [product, setProduct] = useState(initialProductState)
  const [hasVariants, setHasVariants] = useState(false)
  const [baseFields, setBaseFields] = useState(initialBaseFieldsState)
  const [variants, setVariants] = useState([])

  const drugCategories = [
    "Analgesics",
    "Antibiotics",
    "Antimalarials",
    "Antihypertensives",
    "Antidiabetics",
    "Antihistamines",
    "Vitamins & Supplements",
    "Antifungals",
    "Cough Syrups / Expectorants",
    "Gastrointestinal Drugs",
    "General / OTC"
  ]

  const bulkPackagingOptions = ["Carton", "Box", "Pack", "Container", "Roll", "Case"]
  const unitDispensingOptions = ["Tablet", "Bottle", "Sachet", "Capsule", "Syrup", "Suspension", "Injection", "Ointment", "Drops", "Ampoule"]

  if (!isOpen) return null

  function handleClose() {
    setProduct(initialProductState)
    setBaseFields(initialBaseFieldsState)
    setVariants([])
    setHasVariants(false)
    onClose()
  }

  // Placeholder function to initiate hardware or camera scanning
  function handleTriggerScanner(targetIndex = null) {
    // Prefer parent-provided scanner handler (DemoApp BarcodeScanner) when available
    if (typeof onRequestScan === "function") {
      onRequestScan((scannedCode) => {
        if (!scannedCode) return
        if (targetIndex !== null) {
          handleVariantChange(targetIndex, "barcode", scannedCode)
        } else {
          setProduct({ ...product, barcode: scannedCode })
        }
      })
      return
    }

    // Fallback: simple prompt for environments without camera scanner
    const scannedCode = prompt("Scan or enter barcode:")
    if (!scannedCode) return

    if (targetIndex !== null) {
      handleVariantChange(targetIndex, "barcode", scannedCode)
    } else {
      setProduct({ ...product, barcode: scannedCode })
    }
  }

  function handleAddVariant() {
    setVariants([
      ...variants, 
      { 
        formulationType: "tablet", 
        strength: "",
        barcode: "", // Isolated variant barcode tracks here
        packsReceived: "", 
        unitsPerPack: "", 
        bulkPackagingType: "Carton",
        unitDispensingType: "Tablet",
        costPrice: "", 
        unitSellingPrice: "", 
        bulkSellingPrice: "", 
        batchNo: "", 
        expiryDate: "", 
        nafdacNo: "",
        customFields: []
      }
    ])
  }

  function handleRemoveVariant(index) {
    setVariants(variants.filter((_, i) => i !== index))
  }

  function handleVariantChange(index, field, value) {
    const updatedVariants = [...variants]
    updatedVariants[index][field] = value
    setVariants(updatedVariants)
  }

  function handleAddVariantCustomField(variantIndex) {
    const updatedVariants = [...variants]
    updatedVariants[variantIndex].customFields.push({ label: "", value: "" })
    setVariants(updatedVariants)
  }

  function handleRemoveVariantCustomField(variantIndex, fieldIndex) {
    const updatedVariants = [...variants]
    updatedVariants[variantIndex].customFields = updatedVariants[variantIndex].customFields.filter((_, i) => i !== fieldIndex)
    setVariants(updatedVariants)
  }

  function handleVariantCustomFieldChange(variantIndex, fieldIndex, keyOrValue, data) {
    const updatedVariants = [...variants]
    updatedVariants[variantIndex].customFields[fieldIndex][keyOrValue] = data
    setVariants(updatedVariants)
  }

  function submit(e) {
    if (e) e.preventDefault()
    
    if (!product.name) {
      alert("Please fill in the Product Name.")
      return
    }

    let compiledVariants = []

    if (hasVariants) {
      if (variants.length === 0) {
        alert("Please add at least one formulation variant or turn off variants toggle.")
        return
      }

      for (let i = 0; i < variants.length; i++) {
        if (!variants[i].strength || !variants[i].packsReceived || !variants[i].unitsPerPack || !variants[i].costPrice || !variants[i].unitSellingPrice) {
          alert(`Please fill out all required fields marked with * for Variant #${i + 1}`)
          return
        }
      }

      compiledVariants = variants.map(v => {
        const packs = Number(v.packsReceived || 0)
        const units = Number(v.unitsPerPack || 0)
        
        const parsedAttributes = {}
        v.customFields.forEach(cf => {
          if (cf.label.trim()) {
            const normalizedKey = cf.label.toLowerCase().trim().replace(/\s+/g, "_")
            parsedAttributes[normalizedKey] = cf.value
          }
        })

        return {
          formulationType: v.formulationType,
          strength: v.strength || "N/A",
          barcode: v.barcode || "",
          packsReceived: packs,
          unitsPerPack: units,
          totalUnitsStock: packs * units,
          bulkPackagingType: v.bulkPackagingType,
          unitDispensingType: v.unitDispensingType,
          defaultDispensingUnit: v.unitDispensingType.toLowerCase(), 
          costPrice: Number(v.costPrice || 0),
          sellingPrice: Number(v.unitSellingPrice || 0), 
          unitSellingPrice: Number(v.unitSellingPrice || 0),
          bulkSellingPrice: v.bulkSellingPrice ? Number(v.bulkSellingPrice) : 0,
          batchNo: v.batchNo || "",
          expiryDate: v.expiryDate || "",
          nafdacNo: v.nafdacNo || "",
          customAttributes: parsedAttributes
        }
      })
    } else {
      if (!baseFields.packsReceived || !baseFields.unitsPerPack || !baseFields.costPrice || !baseFields.unitSellingPrice) {
        alert("Please completely fill out the Inventory and Pricing metrics fields.")
        return
      }

      const packs = Number(baseFields.packsReceived || 0)
      const units = Number(baseFields.unitsPerPack || 0)

      compiledVariants = [
        {
          formulationType: "tablet",
          strength: "Regular",
          barcode: product.barcode || "",
          packsReceived: packs,
          unitsPerPack: units,
          totalUnitsStock: packs * units,
          bulkPackagingType: baseFields.bulkPackagingType,
          unitDispensingType: baseFields.unitDispensingType,
          defaultDispensingUnit: baseFields.unitDispensingType.toLowerCase(),
          costPrice: Number(baseFields.costPrice || 0),
          sellingPrice: Number(baseFields.unitSellingPrice || 0), 
          unitSellingPrice: Number(baseFields.unitSellingPrice || 0),
          bulkSellingPrice: baseFields.bulkSellingPrice ? Number(baseFields.bulkSellingPrice) : 0,
          batchNo: baseFields.batchNo || "",
          expiryDate: baseFields.expiryDate || "",
          nafdacNo: baseFields.nafdacNo || "",
          customAttributes: {}
        }
      ]
    }

    const aggregateTotalStock = compiledVariants.reduce((sum, v) => sum + v.totalUnitsStock, 0)

    addProduct({
      productName: product.name,
      genericName: product.genericName || "N/A",
      brandName: product.brandName || "N/A",
      targetAgeGroup: product.targetAgeGroup,
      category: product.category,
      // provide both explicit stock and totalCalculatedStock for DemoApp normalization
      stock: aggregateTotalStock,
      totalCalculatedStock: aggregateTotalStock,
      // primary price (used for display when variants exist or not)
      price: hasVariants ? (compiledVariants[0]?.unitSellingPrice ?? 0) : Number(baseFields.unitSellingPrice || 0),
      barcode: hasVariants ? "" : product.barcode || "",
      costPrice: hasVariants ? 0 : Number(baseFields.costPrice || 0),
      bulkSellingPrice: hasVariants ? 0 : Number(baseFields.bulkSellingPrice || 0),
      batchNo: hasVariants ? "" : baseFields.batchNo || "",
      expiryDate: hasVariants ? "" : baseFields.expiryDate || "",
      nafdacNo: hasVariants ? "" : baseFields.nafdacNo || "",
      bulkPackagingType: hasVariants ? "" : baseFields.bulkPackagingType || "",
      unitDispensingType: hasVariants ? "" : baseFields.unitDispensingType || "",
      variants: compiledVariants
    })
    
    handleClose()
  }

  const dynamicCalculatedStock = hasVariants
    ? variants.reduce((sum, v) => sum + (Number(v.packsReceived || 0) * Number(v.unitsPerPack || 0)), 0)
    : Number(baseFields.packsReceived || 0) * Number(baseFields.unitsPerPack || 0)

  return (
    <div className="product-modal-overlay" onClick={handleClose}>
      <div className="product-modal-card" onClick={(e) => e.stopPropagation()}>

        {/* TOP MODAL HEADER WITH DYNAMIC BARCODE SLOT */}
        <div className="modal-header-section">
          <div className="modal-header-title-group">
            <div className="modal-title-icon-frame">
              <Package size={18} />
            </div>
            <div>
              <h2>Register New Stock Item</h2>
              <p>Create unified clinical pharmaceutical profile</p>
            </div>
          </div>
          
          {/* Scan Barcode displays here ONLY when variants are disabled */}
          {!hasVariants && (
            <div className="modal-header-action-slot">
              <button 
                type="button" 
                className="barcode-scanner-action-btn"
                onClick={() => handleTriggerScanner(null)}
                title="Scan Product Barcode"
              >
                <ScanBarcode size={16} />
                <span>Scan SKU</span>
              </button>
              {product.barcode && (
                <span className="scanned-barcode-pill">{product.barcode}</span>
              )}
            </div>
          )}
        </div>

        {/* INPUT FORM CONTAINER */}
        <form onSubmit={submit} className="modal-form-body-wrapper">
          
          {/* SCROLLABLE VIEWPORT CONTENT */}
          <div className="modal-form-scrollable-viewport">
            
            {/* GLOBAL IDENTITY FIELDS */}
            <div className="form-dual-column-row">
              <div className="modal-input-group flex-1-5">
                <label><Package size={12} /> Product Name *</label>
                <input
                  type="text"
                  className="modal-form-input"
                  placeholder="e.g. Amoksiklav"
                  value={product.name}
                  onChange={(e) => setProduct({ ...product, name: e.target.value })}
                  required
                />
              </div>
              <div className="modal-input-group flex-1">
                <label><Tag size={12} /> Category</label>
                <select
                  className="modal-form-select"
                  value={product.category}
                  onChange={(e) => setProduct({ ...product, category: e.target.value })}
                >
                  {drugCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-dual-column-row">
              <div className="modal-input-group flex-1">
                <label><ShieldCheck size={12} /> Generic Name / Active Ingredient</label>
                <input
                  type="text"
                  className="modal-form-input"
                  placeholder="e.g. Co-amoxiclav"
                  value={product.genericName}
                  onChange={(e) => setProduct({ ...product, genericName: e.target.value })}
                />
              </div>
              <div className="modal-input-group flex-1">
                <label><Package size={12} /> Brand/Manufacturer Name</label>
                <input
                  type="text"
                  className="modal-form-input"
                  placeholder="e.g. Lek Pharmaceuticals"
                  value={product.brandName}
                  onChange={(e) => setProduct({ ...product, brandName: e.target.value })}
                />
              </div>
            </div>

            <div className="form-dual-column-row margin-bottom-medium">
              <div className="modal-input-group flex-1">
                <label><Users size={12} /> Target Patient Age Group</label>
                <select
                  className="modal-form-select"
                  value={product.targetAgeGroup}
                  onChange={(e) => setProduct({ ...product, targetAgeGroup: e.target.value })}
                >
                  <option value="Adult">Adult</option>
                  <option value="Pediatric">Pediatric</option>
                  <option value="Both">Both (General)</option>
                </select>
              </div>
            </div>

            {/* HAS VARIANTS TOGGLE INTERFACE */}
            <div className="toggle-container-row margin-bottom-medium">
              <span className="toggle-label-text">This product has multiple variants (e.g. different strengths, sizes)</span>
              <button 
                type="button" 
                className={`toggle-switch-btn ${hasVariants ? 'active' : ''}`}
                onClick={() => setHasVariants(!hasVariants)}
                aria-label="Toggle product variations"
              >
                {hasVariants ? <ToggleRight size={28} className="toggle-icon-active" /> : <ToggleLeft size={28} className="toggle-icon-inactive" />}
              </button>
            </div>

            {/* LIVE STOCK METRIC PREVIEW FOOTER COMPONENT */}
            <div className="form-dual-column-row margin-bottom-medium">
              <div className="live-stock-feedback-card-full">
                <span className="feedback-card-heading">
                  <Layers3 size={12} /> Live Computed Total Single Units Across Formulations
                </span>
                <div className="feedback-card-value">
                  {dynamicCalculatedStock} <span className="unit-label">Units total stock</span>
                </div>
              </div>
            </div>

            {/* CONDITIONAL RENDERING ARCHITECTURE BLOCK */}
            {!hasVariants ? (
              /* TOGGLE OFF LAYOUT: FLAT STOCK AND PRICING CONTAINER */
              <div className="base-stock-matrix-box">
                <div className="variants-matrix-header">
                  <div>
                    <h3>Pricing & Inventory Details</h3>
                    <p>Configure packaging structures and split pricing configurations</p>
                  </div>
                </div>
                
                <div className="variant-fields-grid padding-top-small">
                  <div className="modal-input-group">
                    <label>Bulk Supply Unit</label>
                    <select
                      className="modal-form-select"
                      value={baseFields.bulkPackagingType}
                      onChange={(e) => setBaseFields({ ...baseFields, bulkPackagingType: e.target.value })}
                    >
                      {bulkPackagingOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>

                  <div className="modal-input-group">
                    <label>Retail/Dispensing Unit</label>
                    <select
                      className="modal-form-select"
                      value={baseFields.unitDispensingType}
                      onChange={(e) => setBaseFields({ ...baseFields, unitDispensingType: e.target.value })}
                    >
                      {unitDispensingOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>

                  <div className="modal-input-group">
                    <label>{baseFields.bulkPackagingType}s Received *</label>
                    <input
                      type="number"
                      className="modal-form-input"
                      placeholder="0"
                      value={baseFields.packsReceived}
                      onChange={(e) => setBaseFields({ ...baseFields, packsReceived: e.target.value })}
                    />
                  </div>

                  <div className="modal-input-group">
                    <label>{baseFields.unitDispensingType}s per {baseFields.bulkPackagingType} *</label>
                    <input
                      type="number"
                      className="modal-form-input"
                      placeholder="0"
                      value={baseFields.unitsPerPack}
                      onChange={(e) => setBaseFields({ ...baseFields, unitsPerPack: e.target.value })}
                    />
                  </div>

                  <div className="modal-input-group">
                    <label><DollarSign size={11} /> Wholesale Cost Price *</label>
                    <input
                      type="number"
                      className="modal-form-input"
                      placeholder="0.00"
                      value={baseFields.costPrice}
                      onChange={(e) => setBaseFields({ ...baseFields, costPrice: e.target.value })}
                    />
                  </div>

                  <div className="modal-input-group">
                    <label><DollarSign size={11} /> Unit Selling Price ({baseFields.unitDispensingType}) *</label>
                    <input
                      type="number"
                      className="modal-form-input"
                      placeholder="Single item retail price"
                      value={baseFields.unitSellingPrice}
                      onChange={(e) => setBaseFields({ ...baseFields, unitSellingPrice: e.target.value })}
                    />
                  </div>

                  <div className="modal-input-group">
                    <label><DollarSign size={11} /> Bulk Selling Price ({baseFields.bulkPackagingType}) (Optional)</label>
                    <input
                      type="number"
                      className="modal-form-input"
                      placeholder="Leave blank if not sold in bulk packs"
                      value={baseFields.bulkSellingPrice}
                      onChange={(e) => setBaseFields({ ...baseFields, bulkSellingPrice: e.target.value })}
                    />
                  </div>

                  <div className="modal-input-group">
                    <label>Batch Number</label>
                    <input
                      type="text"
                      className="modal-form-input"
                      placeholder="e.g. BATCH-01"
                      value={baseFields.batchNo}
                      onChange={(e) => setBaseFields({ ...baseFields, batchNo: e.target.value })}
                    />
                  </div>

                  <div className="modal-input-group">
                    <label><Calendar size={11} /> Expiry Date</label>
                    <input
                      type="date"
                      className="modal-form-input"
                      value={baseFields.expiryDate}
                      onChange={(e) => setBaseFields({ ...baseFields, expiryDate: e.target.value })}
                    />
                  </div>

                  <div className="modal-input-group">
                    <label>NAFDAC Reg No.</label>
                    <input
                      type="text"
                      className="modal-form-input"
                      placeholder="e.g. 04-1234"
                      value={baseFields.nafdacNo}
                      onChange={(e) => setBaseFields({ ...baseFields, nafdacNo: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* TOGGLE ON LAYOUT: FORMULATION VARIANT MATRIX ENGINE */
              <div className="variants-matrix-outer-box">
                <div className="variants-matrix-header">
                  <div>
                    <h3>Formulation Variations Matrix</h3>
                    <p>Isolate separate strength potencies, batches, and packaging configurations</p>
                  </div>
                  <button type="button" onClick={handleAddVariant} className="matrix-add-row-btn">
                    <Plus size={12} /> Add Variant Row
                  </button>
                </div>

                {variants.length > 0 ? (
                  <div className="variant-cards-stack">
                    {variants.map((variant, index) => (
                      <div key={index} className="variant-card-item">
                        
                        <div className="variant-card-header">
                          <strong className="variant-card-title">Variant #{index + 1} Formulation Parameters</strong>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveVariant(index)} 
                            className="variant-card-remove-btn"
                            aria-label={`Remove row ${index + 1}`}
                          >
                            <Trash2 size={14} /> Remove Form
                          </button>
                        </div>

                        {/* NEW POSITION: Barcode Field contextual block situated directly above Formulation Base */}
                        <div className="variant-barcode-scanner-wrapper">
                          <div className="modal-input-group compact-barcode-field">
                            <label><ScanBarcode size={11} /> Variant Barcode / SKU</label>
                            <div className="barcode-input-action-combo">
                              <input
                                type="text"
                                className="modal-form-input"
                                placeholder="Scan or type barcode for this specific variation"
                                value={variant.barcode || ""}
                                onChange={(e) => handleVariantChange(index, "barcode", e.target.value)}
                              />
                              <button
                                type="button"
                                className="inline-scanner-trigger-btn"
                                onClick={() => handleTriggerScanner(index)}
                                title="Fire Scanner Engine"
                              >
                                <ScanBarcode size={14} />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="variant-fields-grid">
                          <div className="modal-input-group">
                            <label>Formulation Base</label>
                            <select
                              className="modal-form-select"
                              value={variant.formulationType}
                              onChange={(e) => handleVariantChange(index, "formulationType", e.target.value)}
                            >
                              <option value="tablet">Tablet Form</option>
                              <option value="syrup">Syrup Form</option>
                              <option value="capsule">Capsule Form</option>
                              <option value="suspension">Suspension Form</option>
                              <option value="injection">Injection Form</option>
                              <option value="ointment">Ointment / Cream</option>
                              <option value="drops">Drops Form</option>
                            </select>
                          </div>

                          <div className="modal-input-group">
                            <label>Strength / Potency *</label>
                            <input
                              type="text"
                              className="modal-form-input"
                              placeholder="e.g. 625mg or 250mg/5ml"
                              value={variant.strength}
                              onChange={(e) => handleVariantChange(index, "strength", e.target.value)}
                            />
                          </div>

                          <div className="modal-input-group">
                            <label>Bulk Supply Unit</label>
                            <select
                              className="modal-form-select"
                              value={variant.bulkPackagingType}
                              onChange={(e) => handleVariantChange(index, "bulkPackagingType", e.target.value)}
                            >
                              {bulkPackagingOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          </div>

                          <div className="modal-input-group">
                            <label>Retail/Dispensing Unit</label>
                            <select
                              className="modal-form-select"
                              value={variant.unitDispensingType}
                              onChange={(e) => handleVariantChange(index, "unitDispensingType", e.target.value)}
                            >
                              {unitDispensingOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          </div>

                          <div className="modal-input-group">
                            <label>{variant.bulkPackagingType}s Received *</label>
                            <input
                              type="number"
                              className="modal-form-input"
                              placeholder="0"
                              value={variant.packsReceived}
                              onChange={(e) => handleVariantChange(index, "packsReceived", e.target.value)}
                            />
                          </div>

                          <div className="modal-input-group">
                            <label>{variant.unitDispensingType}s per {variant.bulkPackagingType} *</label>
                            <input
                              type="number"
                              className="modal-form-input"
                              placeholder="0"
                              value={variant.unitsPerPack}
                              onChange={(e) => handleVariantChange(index, "unitsPerPack", e.target.value)}
                            />
                          </div>

                          <div className="variant-inline-calculated-row">
                            <span>Auto Calculated Single Items: </span>
                            <strong>{Number(variant.packsReceived || 0) * Number(variant.unitsPerPack || 0)} {variant.unitDispensingType}s</strong>
                          </div>

                          <div className="modal-input-group">
                            <label><DollarSign size={11} /> Wholesale Cost Price *</label>
                            <input
                              type="number"
                              className="modal-form-input"
                              placeholder="0.00"
                              value={variant.costPrice}
                              onChange={(e) => handleVariantChange(index, "costPrice", e.target.value)}
                            />
                          </div>

                          <div className="modal-input-group">
                            <label><DollarSign size={11} /> Unit Selling Price ({variant.unitDispensingType}) *</label>
                            <input
                              type="number"
                              className="modal-form-input"
                              placeholder="Single item retail price"
                              value={variant.unitSellingPrice}
                              onChange={(e) => handleVariantChange(index, "unitSellingPrice", e.target.value)}
                            />
                          </div>

                          <div className="modal-input-group">
                            <label><DollarSign size={11} /> Bulk Selling Price ({variant.bulkPackagingType}) (Optional)</label>
                            <input
                              type="number"
                              className="modal-form-input"
                              placeholder="Leave blank if optional"
                              value={variant.bulkSellingPrice}
                              onChange={(e) => handleVariantChange(index, "bulkSellingPrice", e.target.value)}
                            />
                          </div>

                          <div className="modal-input-group">
                            <label>Batch Number</label>
                            <input
                              type="text"
                              className="modal-form-input"
                              placeholder="e.g. AMX-T881"
                              value={variant.batchNo}
                              onChange={(e) => handleVariantChange(index, "batchNo", e.target.value)}
                            />
                          </div>

                          <div className="modal-input-group">
                            <label><Calendar size={11} /> Expiry Date</label>
                            <input
                              type="date"
                              className="modal-form-input"
                              value={variant.expiryDate}
                              onChange={(e) => handleVariantChange(index, "expiryDate", e.target.value)}
                            />
                          </div>

                          <div className="modal-input-group">
                            <label>NAFDAC Reg No.</label>
                            <input
                              type="text"
                              className="modal-form-input"
                              placeholder="e.g. B4-1092"
                              value={variant.nafdacNo}
                              onChange={(e) => handleVariantChange(index, "nafdacNo", e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="variant-nested-custom-fields-section">
                          <div className="variant-custom-fields-header">
                            <h4>Variant Custom Attributes</h4>
                            <button 
                              type="button" 
                              className="add-custom-attr-pill"
                              onClick={() => handleAddVariantCustomField(index)}
                            >
                              <Plus size={10} /> Add Attribute
                            </button>
                          </div>

                          {variant.customFields.map((cf, fieldIndex) => (
                            <div key={fieldIndex} className="variant-custom-field-inputs-row">
                              <input
                                type="text"
                                className="modal-form-input attribute-label-input"
                                placeholder="Label (e.g. Supplier)"
                                value={cf.label}
                                onChange={(e) => handleVariantCustomFieldChange(index, fieldIndex, "label", e.target.value)}
                                required
                              />
                              <input
                                type="text"
                                className="modal-form-input attribute-value-input"
                                placeholder="Value (e.g. Chi-Med)"
                                value={cf.value}
                                onChange={(e) => handleVariantCustomFieldChange(index, fieldIndex, "value", e.target.value)}
                                required
                              />
                              <button
                                type="button"
                                className="remove-attribute-btn"
                                onClick={() => handleRemoveVariantCustomField(index, fieldIndex)}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                        </div>

                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="matrix-empty-state-text">
                    No variations configured yet. Tap "Add Variant Row" to add item records.
                  </p>
                )}
              </div>
            )}

          </div>

          {/* FIXED MODAL ACTION FOOTER */}
          <div className="modal-fixed-action-footer">
            <button className="modal-footer-cancel-btn" onClick={handleClose} type="button">
              Cancel
            </button>
            <button 
              className="modal-footer-save-btn" 
              type="button"
              onClick={submit}
            >
              Save Product File
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}

export default ProductForm;