import { useState } from "react"

function UploadPage() {
  const [previewImage, setPreviewImage] = useState(null)
  const [previewVideo, setPreviewVideo] = useState(null)

  function handleImage(e) {
    const file = e.target.files[0]

    if (!file) return

    setPreviewImage(URL.createObjectURL(file))
  }

  function handleVideo(e) {
    const file = e.target.files[0]

    if (!file) return

    setPreviewVideo(URL.createObjectURL(file))
  }

  function handleUpload() {
    alert("Upload system not connected to backend yet 🚧")
  }

  return (
    <div className="upload-page">

      <h2>Media Upload Center</h2>

      <p className="upload-subtitle">
        Upload product images, dashboard previews,
        promotional videos, and website assets.
      </p>

      <div className="upload-box">

        {/* IMAGE */}
        <div className="upload-card">

          <h3>Upload Image</h3>

          <label className="file-button">

            Choose Image

            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
            />

          </label>

          {previewImage && (

            <div className="preview-wrapper">

              <img
                src={previewImage}
                alt="preview"
              />

            </div>

          )}

        </div>

        {/* VIDEO */}
        <div className="upload-card">

          <h3>Upload Video</h3>

          <label className="file-button">

            Choose Video

            <input
              type="file"
              accept="video/*"
              onChange={handleVideo}
            />

          </label>

          {previewVideo && (

            <div className="preview-wrapper">

              <video
                controls
                src={previewVideo}
              />

            </div>

          )}

        </div>

      </div>

      <button
        className="primary-btn upload-btn"
        onClick={handleUpload}
      >
        Upload To Website
      </button>

    </div>
  )
}

export default UploadPage