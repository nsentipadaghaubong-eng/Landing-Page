import React, { useState, useRef } from "react";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, X } from "lucide-react";
import * as XLSX from "xlsx";

function BulkImportModal({ isOpen, onClose, onImportSuccess }) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const [previewData, setPreviewData] = useState([]);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Process and normalize data rows from Excel/CSV
  const processFile = (file) => {
    setError("");
    setPreviewData([]);
    setFileName(file.name);

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target.result;
        // Reads binary string data across formats natively
        const workbook = XLSX.read(data, { type: "binary", cellDates: true });
        
        // Target the very first sheet inside the document
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert rows into a clean array of JSON objects
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        if (jsonData.length === 0) {
          setError("This file appears to be empty.");
          return;
        }

        // Validate headers map cleanly to inventory properties
        const lowerCaseHeaders = Object.keys(jsonData[0]).map(h => h.toLowerCase().trim());
        if (!lowerCaseHeaders.includes("name")) {
          setError("Missing required column: 'Name' is mandatory for inventory items.");
          return;
        }

        // Standardize properties for your OgaJara inventory shape
        const normalizedData = jsonData.map((row) => {
          // Find key variations dynamically case-insensitively
          const findVal = (keys) => {
            const match = Object.keys(row).find(k => keys.includes(k.toLowerCase().trim()));
            return match ? row[match] : "";
          };

          return {
            name: findVal(["name", "product name", "item"]),
            category: findVal(["category", "type"]),
            stock: Number(findVal(["stock", "quantity", "qty"])) || 0,
            price: Number(findVal(["price", "cost", "selling price"])) || 0,
            expiryDate: findVal(["expirydate", "expiry date", "expiry"]) || "N/A",
          };
        });

        setPreviewData(normalizedData);
      } catch (err) {
        setError("Failed to read file. Make sure it's a valid Excel or CSV file.");
        console.error(err);
      }
    };

    reader.readAsBinaryString(file);
  };

  // Drag and Drop Event Handling
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndProcess(droppedFile);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcess(e.target.files[0]);
    }
  };

  const validateAndProcess = (file) => {
    const validExtensions = [".csv", ".xlsx", ".xls"];
    const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

    if (validExtensions.includes(fileExtension)) {
      processFile(file);
    } else {
      setError("Unsupported file format. Please upload a valid .xlsx, .xls, or .csv spreadsheet.");
    }
  };

  const handleCommitImport = () => {
    if (previewData.length > 0) {
      onImportSuccess(previewData);
      setPreviewData([]);
      setFileName("");
      onClose();
    }
  };

  return (
    <div className="product-modal-overlay">
      <div className="product-modal-card" style={{ maxWidth: "600px" }}>
        
        {/* Header Block */}
        <div className="modal-header-section">
          <div className="modal-header-title-group">
            <div className="modal-title-icon-frame">
              <FileSpreadsheet style={{ width: "20px", height: "20px" }} />
            </div>
            <div>
              <h2>Bulk Import Inventory</h2>
              <p>Upload Excel or CSV formatted product files directly to your stock.</p>
            </div>
          </div>
          <button className="modal-close-corner-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Modal Core Content Body */}
        <div className="modal-form-body-wrapper">
          <div className="modal-form-scrollable-viewport">
            
            {/* Template Instructions Warning Note Box */}
            <div style={{ 
              backgroundColor: "var(--card-sub-bg)", 
              border: "1px dashed var(--border-color)", 
              borderRadius: "6px", 
              padding: "12px", 
              marginBottom: "16px" 
            }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-label)", display: "block", marginBottom: "4px" }}>
                EXPECTED SPREADSHEET HEADERS:
              </span>
              <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.5" }}>
                Ensure columns match: <strong style={{ color: "var(--text-main)" }}>Name</strong> (Required), <strong>Category</strong>, <strong>Stock</strong>, <strong>Price</strong>, and <strong>Expiry Date</strong> (YYYY-MM-DD format).
              </p>
            </div>

            {/* Drag & Drop File Upload Surface area zone */}
            {!previewData.length && (
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
                style={{
                  border: `2px dashed ${dragActive ? "var(--icon-frame-color)" : "var(--border-color)"}`,
                  backgroundColor: dragActive ? "var(--card-sub-bg)" : "var(--input-bg)",
                  borderRadius: "8px",
                  padding: "36px 20px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".csv, .xlsx, .xls" 
                  style={{ display: "none" }} 
                />
                <Upload size={32} style={{ color: dragActive ? "var(--icon-frame-color)" : "var(--text-muted)", marginBottom: "12px" }} />
                <p style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: 600, color: "var(--text-main)" }}>
                  Click to browse or drop your sheet here
                </p>
                <p style={{ margin: 0, fontSize: "11px", color: "var(--text-muted)" }}>
                  Supports Microsoft Excel (.xlsx, .xls) and standard text CSV files
                </p>
              </div>
            )}

            {/* Error Message banner */}
            {error && (
              <div style={{ display: "flex", gap: "8px", alignItems: "center", backgroundColor: "#fef2f2", border: "1px solid #fee2e2", padding: "10px 12px", borderRadius: "6px", marginTop: "12px" }}>
                <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: "12px", color: "#991b1b", fontWeight: 500 }}>{error}</span>
              </div>
            )}

            {/* File Processed Ready Success Matrix Area Preview Block */}
            {previewData.length > 0 && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", padding: "8px 12px", backgroundColor: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "6px" }}>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <CheckCircle2 size={16} color="#10b981" />
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-main)" }}>{fileName}</span>
                  </div>
                  <button 
                    onClick={() => { setPreviewData([]); setFileName(""); }}
                    style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "11px", fontWeight: 600 }}
                  >
                    Clear File
                  </button>
                </div>

                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-label)", display: "block", marginBottom: "6px" }}>
                  DATA PREVIEW ({previewData.length} Items Found):
                </span>
                
                {/* Micro preview grid viewport matrix panel container */}
                <div style={{ 
                  maxHeight: "180px", 
                  overflowY: "auto", 
                  border: "1px solid var(--border-color)", 
                  borderRadius: "6px",
                  backgroundColor: "var(--input-bg)"
                }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                    <thead>
                      <tr style={{ backgroundColor: "var(--card-sub-bg)", borderBottom: "1px solid var(--border-color)" }}>
                        <th style={{ padding: "8px" }}>Product Name</th>
                        <th style={{ padding: "8px" }}>Category</th>
                        <th style={{ padding: "8px", textAlign: "right" }}>Stock</th>
                        <th style={{ padding: "8px", textAlign: "right" }}>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.slice(0, 5).map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid var(--border-light)" }}>
                          <td style={{ padding: "8px", color: "var(--text-main)", fontWeight: 600 }}>{item.name || "—"}</td>
                          <td style={{ padding: "8px", color: "var(--text-muted)" }}>{item.category || "—"}</td>
                          <td style={{ padding: "8px", color: "var(--text-main)", textAlign: "right" }}>{item.stock}</td>
                          <td style={{ padding: "8px", color: "var(--text-main)", textAlign: "right" }}>₦{item.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {previewData.length > 5 && (
                    <div style={{ textAlign: "center", padding: "6px", fontSize: "11px", color: "var(--text-muted)", backgroundColor: "var(--card-sub-bg)" }}>
                      and {previewData.length - 5} more items...
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Centered Modal Action Footer (Inherits structural styles from core stylesheet) */}
        <div className="modal-fixed-action-footer">
          <button className="modal-footer-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="modal-footer-save-btn" 
            disabled={previewData.length === 0}
            onClick={handleCommitImport}
            style={{ opacity: previewData.length === 0 ? 0.5 : 1, cursor: previewData.length === 0 ? "not-allowed" : "pointer" }}
          >
            Import Products
          </button>
        </div>

      </div>
    </div>
  );
}

export default BulkImportModal;