import React, { forwardRef, useRef } from 'react';
import { Upload, Trash2, ImagePlus, Link as LinkIcon, Maximize2, Minimize2 } from 'lucide-react';

const Page = forwardRef(({
  pageNumber,
  totalPages,
  imageData,
  onImageChange,
  onImageRemove,
  fitMode = 'cover',
  onToggleFitMode
}, ref) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onImageChange(pageNumber, event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onImageChange(pageNumber, event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleAddViaUrl = (e) => {
    e.stopPropagation();
    const url = window.prompt(`Enter image URL for Page ${pageNumber}:`);
    if (url && url.trim()) {
      onImageChange(pageNumber, url.trim());
    }
  };

  const preventFlip = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="page" ref={ref}>
      <div
        className="page-content"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {imageData ? (
          <div className="image-container">
            <img
              src={imageData}
              alt={`Page ${pageNumber}`}
              className={`page-image ${fitMode === 'contain' ? 'fit-contain' : 'fit-cover'}`}
            />
            <div
              className="image-overlay-controls"
              onMouseDown={preventFlip}
              onTouchStart={preventFlip}
              onClick={preventFlip}
            >
              <button
                className="icon-btn"
                onClick={(e) => { preventFlip(e); fileInputRef.current?.click(); }}
                title="Change Image"
              >
                <Upload size={16} />
              </button>
              <button
                className="icon-btn"
                onClick={(e) => { preventFlip(e); onToggleFitMode(pageNumber); }}
                title={fitMode === 'contain' ? "Fill Page (Cover)" : "Fit Entire Image (Contain)"}
              >
                {fitMode === 'contain' ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
              <button
                className="icon-btn danger"
                onClick={(e) => { preventFlip(e); onImageRemove(pageNumber); }}
                title="Remove Image"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="blank-page-upload">
            <div
              className="upload-box"
              onClick={(e) => { preventFlip(e); fileInputRef.current?.click(); }}
              onMouseDown={preventFlip}
              onTouchStart={preventFlip}
            >
              <div className="upload-icon-wrapper">
                <ImagePlus size={32} className="upload-icon" />
              </div>
              <p className="upload-title">Add Image</p>
              <p className="upload-subtitle">Click or drag & drop</p>
            </div>
            <button
              className="url-btn"
              onClick={handleAddViaUrl}
              onMouseDown={preventFlip}
              onTouchStart={preventFlip}
            >
              <LinkIcon size={13} /> URL
            </button>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          style={{ display: 'none' }}
        />

        <div className="page-footer">
          <span className="page-number">{pageNumber}</span>
        </div>
      </div>
    </div>
  );
});

Page.displayName = 'Page';

export default Page;
