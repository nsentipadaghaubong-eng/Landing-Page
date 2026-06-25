import { useEffect, useRef, useState } from "react"
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode"
import "./BarcodeScanner.css" // <-- Add this import statement here

export default function BarcodeScanner({ onScanSuccess, onClose }) {
  const scannerRef = useRef(null)
  const elementId = "html5-qrcode-scanner-region"
  const [scanMode, setScanMode] = useState("barcode")
  const [isCameraRunning, setIsCameraRunning] = useState(false)

  // Explicit helper to securely stop the camera track
  const stopCameraEngine = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop()
        setIsCameraRunning(false)
      } catch (err) {
        console.error("Failed to stop scanner cleanly:", err)
      }
    }
  }

  useEffect(() => {
    // 1. Core Format & Layout Specifications Mapping
    const isQR = scanMode === "qrcode"
    const qrboxConfig = isQR ? { width: 220, height: 220 } : { width: 280, height: 140 }
    const formatsConfig = isQR
      ? [Html5QrcodeSupportedFormats.QR_CODE]
      : [Html5QrcodeSupportedFormats.EAN_13, Html5QrcodeSupportedFormats.UPC_A]

    // 2. Initialize the programmatic instance ONLY once if it doesn't exist
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode(elementId)
    }

    const startCameraEngine = async () => {
      try {
        // If it's somehow already running a stream, kill it before changing configurations
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop()
        }

        // 3. Fire up the targeted video lens layout
        await scannerRef.current.start(
          { facingMode: "environment" }, // Prioritize real-world primary back lens
          {
            fps: 15,
            qrbox: qrboxConfig,
            formatsToSupport: formatsConfig
          },
          (decodedText) => {
            onScanSuccess(decodedText)
            stopCameraEngine().then(() => onClose())
          },
          () => {
            // Frame analysis catch
          }
        )
        setIsCameraRunning(true)
      } catch (err) {
        console.error("Camera startup failure context:", err)
      }
    }

    startCameraEngine()

    // 4. CLEANUP HOOK: Guaranteed execution to prevent stream duplication anomalies
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop()
          .catch((err) => console.log("Unmount pipeline catch:", err))
      }
    }
  }, [scanMode]) // Depend strictly on scanMode context changes

  const handleModeChange = async (e) => {
    const nextMode = e.target.value
    await stopCameraEngine()
    setScanMode(nextMode)
  }

  const handleManualClose = async () => {
    await stopCameraEngine()
    onClose()
  }

  return (
    <div className="scanner-modal-overlay">
      <div className="scanner-modal-container">
        <div className="scanner-modal-header">
          <h3>Scan Product Code</h3>
          <p>Align the code on the item container inside the targeting frame</p>
          
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <label htmlFor="lens-mode-select" style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>
              Target Lens Mode:
            </label>
            <select
              id="lens-mode-select"
              value={scanMode}
              onChange={handleModeChange}
              style={{
                padding: '6px 12px',
                fontSize: '13px',
                fontWeight: '600',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#0f172a',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="barcode">Linear Barcode (1D Retail Labels)</option>
              <option value="qrcode">QR Code Matrix (2D Squares)</option>
            </select>
          </div>
        </div>
        
        {/* Isolated single render block */}
        <div id={elementId} className="scanner-render-view" />
        
        <button
          type="button"
          onClick={handleManualClose}
          className="scanner-cancel-btn"
        >
          Close Scanner
        </button>
      </div>
    </div>
  )
}