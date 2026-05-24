import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Upload } from 'lucide-react';
import "../../../styles/profileSetting/UploadPhoto.css";

const UploadPhoto = ({ isOpen, onClose, onUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [cropStart, setCropStart] = useState(null);
  const [cropRect, setCropRect] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const imageRef = useRef(null);
  const containerRef = useRef(null);

  const reset = useCallback(() => {
    setSelectedFile(null);
    setImageSrc(null);
    setCropStart(null);
    setCropRect(null);
    setIsDragging(false);
  }, []);

  const getRelativePos = useCallback((e) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: Math.max(0, Math.min(clientX - rect.left, rect.width)),
      y: Math.max(0, Math.min(clientY - rect.top, rect.height)),
    };
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!isDragging || !cropStart) return;
    e.preventDefault();
    const pos = getRelativePos(e);
    setCropRect({
      x: Math.min(cropStart.x, pos.x),
      y: Math.min(cropStart.y, pos.y),
      w: Math.abs(pos.x - cropStart.x),
      h: Math.abs(pos.y - cropStart.y),
    });
  }, [isDragging, cropStart, getRelativePos]);

  const onMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onMouseMove, { passive: false });
      window.addEventListener('touchend', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onMouseMove);
      window.removeEventListener('touchend', onMouseUp);
    };
  }, [isDragging, onMouseMove, onMouseUp]);

  // Early return AFTER all hooks
  if (!isOpen) return null;

  const handleClose = () => { reset(); onClose(); };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.match('image.*')) { alert('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('File size must be less than 5MB'); return; }
    setSelectedFile(file);
    setCropRect(null);
    const reader = new FileReader();
    reader.onloadend = () => setImageSrc(reader.result);
    reader.readAsDataURL(file);
  };

  const onMouseDown = (e) => {
    e.preventDefault();
    const pos = getRelativePos(e);
    setCropStart(pos);
    setCropRect(null);
    setIsDragging(true);
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    if (cropRect && cropRect.w > 5 && cropRect.h > 5 && imageRef.current && containerRef.current) {
      const img = imageRef.current;
      const containerRect = containerRef.current.getBoundingClientRect();
      const displayW = img.width;
      const displayH = img.height;
      const naturalW = img.naturalWidth;
      const naturalH = img.naturalHeight;

      const imgOffsetX = (containerRect.width - displayW) / 2;
      const imgOffsetY = (containerRect.height - displayH) / 2;

      const scaleX = naturalW / displayW;
      const scaleY = naturalH / displayH;

      const sx = Math.max(0, (cropRect.x - imgOffsetX) * scaleX);
      const sy = Math.max(0, (cropRect.y - imgOffsetY) * scaleY);
      const sw = Math.min(cropRect.w * scaleX, naturalW - sx);
      const sh = Math.min(cropRect.h * scaleY, naturalH - sy);

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, sw);
      canvas.height = Math.max(1, sh);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
      canvas.toBlob((blob) => {
        if (blob) {
          const croppedFile = new File([blob], selectedFile.name, { type: 'image/jpeg' });
          onUpload(croppedFile);
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
              <p className="crop-hint">Drag to select a crop area, or upload as-is</p>
              <div
                className="crop-zone"
                ref={containerRef}
                onMouseDown={onMouseDown}
                onTouchStart={onMouseDown}
                style={{
                  userSelect: 'none',
                  position: 'relative',
                  cursor: 'crosshair',
                  overflow: 'hidden',
                  width: '100%',
                  maxHeight: '260px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#000',
                  borderRadius: '0.5rem',
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
                  <>
                    <div style={{
                      position: 'absolute',
                      left: cropRect.x,
                      top: cropRect.y,
                      width: cropRect.w,
                      height: cropRect.h,
                      border: '2px solid #fff',
                      boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)',
                      pointerEvents: 'none',
                      boxSizing: 'border-box',
                    }} />
                    <div style={{ position: 'absolute', left: cropRect.x, top: cropRect.y, width: cropRect.w, height: cropRect.h, pointerEvents: 'none' }}>
                      {[1, 2].map(i => (
                        <div key={`v${i}`} style={{ position: 'absolute', left: `${i * 33.33}%`, top: 0, width: 1, height: '100%', background: 'rgba(255,255,255,0.4)' }} />
                      ))}
                      {[1, 2].map(i => (
                        <div key={`h${i}`} style={{ position: 'absolute', top: `${i * 33.33}%`, left: 0, height: 1, width: '100%', background: 'rgba(255,255,255,0.4)' }} />
                      ))}
                    </div>
                  </>
                )}
              </div>
              <label htmlFor="file-upload" className="btn-browse" style={{ marginTop: '0.25rem' }}>
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
            <label htmlFor="file-upload" className="btn-browse">
              Choose Image
            </label>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={handleClose}>Cancel</button>
          <button
            className="btn-primary"
            onClick={handleUpload}
            disabled={!selectedFile}
          >
            <Upload size={14} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
            {cropRect && cropRect.w > 5 ? 'Crop & Upload' : 'Upload Photo'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadPhoto;