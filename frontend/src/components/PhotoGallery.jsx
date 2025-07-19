import React, { useState } from 'react';
import './PhotoGallery.css';

const PhotoGallery = ({ photos, onClose, currentTemplate }) => {
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'template', 'single'
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [draggedPhoto, setDraggedPhoto] = useState(null);

  const handlePhotoSelect = (photo) => {
    setSelectedPhotos(prev => {
      const isSelected = prev.find(p => p.id === photo.id);
      if (isSelected) {
        return prev.filter(p => p.id !== photo.id);
      } else {
        return [...prev, photo];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedPhotos.length === photos.length) {
      setSelectedPhotos([]);
    } else {
      setSelectedPhotos([...photos]);
    }
  };

  const handleDelete = () => {
    if (selectedPhotos.length === 0) return;
    
    if (window.confirm(`Delete ${selectedPhotos.length} photo(s)?`)) {
      const updatedPhotos = photos.filter(
        photo => !selectedPhotos.find(selected => selected.id === photo.id)
      );
      
      // Update localStorage
      localStorage.setItem('photobooth-photos', JSON.stringify(updatedPhotos));
      
      setSelectedPhotos([]);
      window.location.reload(); // Simple way to refresh the gallery
    }
  };

  const handleDownload = () => {
    if (selectedPhotos.length === 0) return;

    selectedPhotos.forEach((photo, index) => {
      const link = document.createElement('a');
      link.href = photo.imageData;
      link.download = `photobooth-${photo.id}-${index + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const handleExportTemplate = () => {
    if (photos.length < currentTemplate.photoCount) {
      alert(`Need ${currentTemplate.photoCount} photos for this template`);
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size based on template
    canvas.width = currentTemplate.width || 800;
    canvas.height = currentTemplate.height || 1200;
    
    // Draw template background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // This would be where template rendering logic goes
    // For now, create a simple collage
    const photosToUse = photos.slice(0, currentTemplate.photoCount);
    const photoWidth = canvas.width / 2;
    const photoHeight = canvas.height / Math.ceil(photosToUse.length / 2);
    
    Promise.all(
      photosToUse.map((photo, index) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            const x = (index % 2) * photoWidth;
            const y = Math.floor(index / 2) * photoHeight;
            ctx.drawImage(img, x, y, photoWidth, photoHeight);
            resolve();
          };
          img.src = photo.imageData;
        });
      })
    ).then(() => {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.download = `photobooth-template-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const handleDragStart = (e, photo) => {
    setDraggedPhoto(photo);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetPhoto) => {
    e.preventDefault();
    if (!draggedPhoto || draggedPhoto.id === targetPhoto.id) return;

    // Reorder photos logic would go here
    setDraggedPhoto(null);
  };

  const renderPhotoGrid = () => (
    <div className="photo-grid">
      {photos.map((photo, index) => (
        <div
          key={photo.id}
          className={`photo-item ${selectedPhotos.find(p => p.id === photo.id) ? 'selected' : ''}`}
          onClick={() => handlePhotoSelect(photo)}
          onDoubleClick={() => {
            setCurrentPhotoIndex(index);
            setViewMode('single');
          }}
          draggable
          onDragStart={(e) => handleDragStart(e, photo)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, photo)}
        >
          <img src={photo.imageData} alt={`Photo ${photo.id}`} />
          <div className="photo-overlay">
            <div className="photo-info">
              <span className="photo-filter">{photo.filter.name}</span>
              <span className="photo-timestamp">
                {new Date(photo.timestamp).toLocaleString()}
              </span>
            </div>
            <div className="photo-actions">
              <button 
                className="action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentPhotoIndex(index);
                  setViewMode('single');
                }}
              >
                👁️
              </button>
              <button 
                className="action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  const link = document.createElement('a');
                  link.href = photo.imageData;
                  link.download = `photobooth-${photo.id}.jpg`;
                  link.click();
                }}
              >
                💾
              </button>
            </div>
          </div>
          <div className="selection-indicator">
            {selectedPhotos.find(p => p.id === photo.id) && '✓'}
          </div>
        </div>
      ))}
    </div>
  );

  const renderSinglePhoto = () => {
    const photo = photos[currentPhotoIndex];
    if (!photo) return null;

    return (
      <div className="single-photo-view">
        <div className="photo-navigation">
          <button 
            className="nav-btn"
            onClick={() => setCurrentPhotoIndex(Math.max(0, currentPhotoIndex - 1))}
            disabled={currentPhotoIndex === 0}
          >
            ← Previous
          </button>
          <span className="photo-counter">
            {currentPhotoIndex + 1} of {photos.length}
          </span>
          <button 
            className="nav-btn"
            onClick={() => setCurrentPhotoIndex(Math.min(photos.length - 1, currentPhotoIndex + 1))}
            disabled={currentPhotoIndex === photos.length - 1}
          >
            Next →
          </button>
        </div>
        
        <div className="single-photo-container">
          <img src={photo.imageData} alt={`Photo ${photo.id}`} />
        </div>
        
        <div className="photo-details">
          <div className="glass-panel">
            <h3>Photo Details</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Filter:</label>
                <span>{photo.filter.name}</span>
              </div>
              <div className="detail-item">
                <label>Category:</label>
                <span>{photo.filter.category}</span>
              </div>
              <div className="detail-item">
                <label>Captured:</label>
                <span>{new Date(photo.timestamp).toLocaleString()}</span>
              </div>
              <div className="detail-item">
                <label>Zoom:</label>
                <span>{photo.settings?.zoom || 1}x</span>
              </div>
              <div className="detail-item">
                <label>Exposure:</label>
                <span>{photo.settings?.exposure || 0} EV</span>
              </div>
              <div className="detail-item">
                <label>Focus:</label>
                <span>{photo.settings?.focusMode || 'auto'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTemplateView = () => (
    <div className="template-view">
      <div className="template-composition">
        <div className={`template-layout ${currentTemplate.className}`}>
          {photos.slice(0, currentTemplate.photoCount).map((photo, index) => (
            <div key={photo.id} className={`photo-slot slot-${index + 1}`}>
              <img src={photo.imageData} alt={`Photo ${index + 1}`} />
            </div>
          ))}
        </div>
      </div>
      
      <div className="template-info">
        <div className="glass-panel">
          <h3>{currentTemplate.name}</h3>
          <p>{currentTemplate.description}</p>
          <div className="template-stats">
            <span>Photos used: {Math.min(photos.length, currentTemplate.photoCount)}</span>
            <span>Template capacity: {currentTemplate.photoCount}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="photo-gallery-modal">
      <div className="modal-backdrop" onClick={onClose}></div>
      
      <div className="photo-gallery-content">
        <div className="gallery-header">
          <div className="header-left">
            <h2>Photo Gallery</h2>
            <span className="photo-count">{photos.length} photos</span>
          </div>
          
          <div className="header-center">
            <div className="view-mode-switcher">
              <button 
                className={`mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                🔲 Grid
              </button>
              <button 
                className={`mode-btn ${viewMode === 'template' ? 'active' : ''}`}
                onClick={() => setViewMode('template')}
              >
                🎨 Template
              </button>
              <button 
                className={`mode-btn ${viewMode === 'single' ? 'active' : ''}`}
                onClick={() => setViewMode('single')}
              >
                🖼️ Single
              </button>
            </div>
          </div>
          
          <div className="header-right">
            <button className="close-btn glass-btn" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        <div className="gallery-toolbar">
          <div className="selection-controls">
            <button 
              className="toolbar-btn"
              onClick={handleSelectAll}
            >
              {selectedPhotos.length === photos.length ? 'Deselect All' : 'Select All'}
            </button>
            <span className="selection-count">
              {selectedPhotos.length} selected
            </span>
          </div>
          
          <div className="action-controls">
            <button 
              className="toolbar-btn"
              onClick={handleDownload}
              disabled={selectedPhotos.length === 0}
            >
              💾 Download ({selectedPhotos.length})
            </button>
            <button 
              className="toolbar-btn"
              onClick={handleExportTemplate}
              disabled={photos.length < currentTemplate.photoCount}
            >
              📋 Export Template
            </button>
            <button 
              className="toolbar-btn danger"
              onClick={handleDelete}
              disabled={selectedPhotos.length === 0}
            >
              🗑️ Delete ({selectedPhotos.length})
            </button>
          </div>
        </div>

        <div className="gallery-body">
          {viewMode === 'grid' && renderPhotoGrid()}
          {viewMode === 'single' && renderSinglePhoto()}
          {viewMode === 'template' && renderTemplateView()}
          
          {photos.length === 0 && (
            <div className="empty-gallery">
              <div className="empty-state">
                <span className="empty-icon">📸</span>
                <h3>No Photos Yet</h3>
                <p>Start capturing photos to see them here!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoGallery;