import { useState, useRef, useEffect } from 'react';
import { Camera, Upload } from 'lucide-react';
import "../../../styles/profileSetting/UploadPhoto.css";

const UploadPhoto = ({ isOpen, onClose, onUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [cropRect, setCropRect] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const cropStartRef = useRef(null);
  const isDraggingRef = useRef(false);

  // Sync ref with state for use inside event listeners
  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  // Global mouse/touch listeners for crop drag
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingRef.current || !cropStartRef.current || !containerRef.current) return;
      if (e.cancelable) e.preventDefault();
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const y = Math.max(0, Math.min(clientY - rect.top, rect.height));
      const start = cropStartRef.current;
      setCropRect({
        x: Math.min(start.x, x),
        y: Math.min(start.y, y),
        w: Math.abs(x - start.x),
        h: Math.abs(y - start.y),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      isDraggingRef.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove, { passive: false });
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, []); // runs once on mount, uses refs to stay current

  // All hooks are above this point — safe early return
  if (!isOpen) return null;

  const reset = () => {
    setSelectedFile(null);
    setImageSrc(null);
    setCropRect(null);
    setIsDragging(false);
    cropStartRef.current = null;
    isDraggingRef.current = false;
  };

  const handleClose = () => { reset(); onClose(); };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.match('image.*')) { alert('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('File size must be less than 5MB'); return; }
    setSelectedFile(file);
    setCropRect(null);
    cropStartRef.current = null;
    const reader = new FileReader();
    reader.onloadend = () => setImageSrc(reader.result);
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const pos = {
      x: Math.max(0, Math.min(clientX - rect.left, rect.width)),
      y: Math.max(0, Math.min(clientY - rect.top, rect.height)),
    };
    cropStartRef.current = pos;
    setCropRect(null);
    setIsDragging(true);
    isDraggingRef.current = true;
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    if (cropRect && cropRect.w > 5 && cropRect.h > 5 && imageRef.current && containerRef.current) {
      const img = imageRef.current;
      const containerRect = containerRef.current.getBoundingClientRect();
      const imgOffsetX = (containerRect.width - img.width) / 2;
      const imgOffsetY = (containerRect.height - img.height) / 2;
      const scaleX = img.naturalWidth / img.width;
      const scaleY = img.naturalHeight / img.height;
      const sx = Math.max(0, (cropRect.x - imgOffsetX) * scaleX);
      const sy = Math.max(0, (cropRect.y - imgOffsetY) * scaleY);
      const sw = Math.min(cropRect.w * scaleX, img.naturalWidth - sx);
      const sh = Math.min(cropRect.h * scaleY, img.naturalHeight - sy);

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, sw);
      canvas.height = Math.max(1, sh);
      canvas.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
      canvas.toBlob((blob) => {
        if (blob) {
          onUpload(new File([blob], selectedFile.name, { type: 'image/jpeg' }));
          reset();
        }
      }, 'image/jpeg', 0.92);
    } else {
      onUpload(selectedFile);
      reset();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="upload-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Change Profile Photo</h3>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>

        <div className="modal-body">
          {imageSrc ? (
            <>
              <p className="crop-hint" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                Drag on the image to crop, or upload as-is
              </p>
              <div
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
                style={{
                  position: 'relative',
                  cursor: 'crosshair',
                  userSelect: 'none',
                  width: '100%',
                  maxHeight: '260px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#000',
                  borderRadius: '0.5rem',
                  overflow: 'hidden',
                }}
              >
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Preview"
                  draggable={false}
                  style={{ maxWidth: '100%', maxHeight: '260px', display: 'block', pointerEvents: 'none' }}
                />
                {cropRect && cropRect.w > 2 && cropRect.h > 2 && (
                  <div style={{
                    position: 'absolute',
                    left: cropRect.x,
                    top: cropRect.y,
                    width: cropRect.w,
                    height: cropRect.h,
                    border: '2px solid #fff',
                    boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
                    boxSizing: 'border-box',
                    pointerEvents: 'none',
                  }}>
                    {[1,2].map(i => (
                      <div key={`v${i}`} style={{ position:'absolute', left:`${i*33.33}%`, top:0, width:1, height:'100%', background:'rgba(255,255,255,0.35)' }} />
                    ))}
                    {[1,2].map(i => (
                      <div key={`h${i}`} style={{ position:'absolute', top:`${i*33.33}%`, left:0, height:1, width:'100%', background:'rgba(255,255,255,0.35)' }} />
                    ))}
                  </div>
                )}
              </div>
              <label htmlFor="file-upload" className="btn-browse">
                Choose Different Image
              </label>
            </>
          ) : (
            <div className="upload-area" onClick={() => document.getElementById('file-upload').click()}>
              <div className="upload-icon">
                <Camera size={40} strokeWidth={1.5} />
              </div>
              <p>Click to browse or drag and drop</p>
              <p className="upload-hint">PNG, JPG, GIF up to 5MB</p>
            </div>
          )}

          <input
            type="file"
            id="file-upload"
            accept="image/*"
            onChange={handleFileSelect}
            className="file-input"
          />

          {!imageSrc && (
            <label htmlFor="file-upload" className="btn-browse">Choose Image</label>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={handleClose}>Cancel</button>
          <button className="btn-primary" onClick={handleUpload} disabled={!selectedFile}>
            <Upload size={14} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
            {cropRect && cropRect.w > 5 ? 'Crop & Upload' : 'Upload Photo'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadPhoto;