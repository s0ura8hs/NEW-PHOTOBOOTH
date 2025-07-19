import React, { useState, useRef, useCallback } from 'react';
import './CustomTemplateCreator.css';

const CustomTemplateCreator = ({ capturedPhotos, onSave, onClose }) => {
  const [templateName, setTemplateName] = useState('');
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 1000 });
  const [photoSlots, setPhotoSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [draggedPhoto, setDraggedPhoto] = useState(null);
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [borderColor, setBorderColor] = useState('#000000');
  const [borderWidth, setBorderWidth] = useState(2);
  
  const canvasRef = useRef(null);
  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0 });

  // Add a new photo slot
  const addPhotoSlot = (x = 100, y = 100) => {
    const newSlot = {
      id: Date.now(),
      x: x,
      y: y,
      width: 150,
      height: 150,
      rotation: 0,
      photoId: null,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: '#e2e8f0'
    };
    setPhotoSlots([...photoSlots, newSlot]);
    setSelectedSlot(newSlot.id);
    setIsAddingSlot(false);
  };

  // Handle canvas click to add slot
  const handleCanvasClick = (e) => {
    if (!isAddingSlot) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    addPhotoSlot(x - 75, y - 75); // Center the slot on click
  };

  // Delete selected slot
  const deleteSelectedSlot = () => {
    if (!selectedSlot) return;
    setPhotoSlots(photoSlots.filter(slot => slot.id !== selectedSlot));
    setSelectedSlot(null);
  };

  // Update slot properties
  const updateSlot = (slotId, updates) => {
    setPhotoSlots(photoSlots.map(slot => 
      slot.id === slotId ? { ...slot, ...updates } : slot
    ));
  };

  // Handle mouse down on slot
  const handleSlotMouseDown = (e, slotId) => {
    e.preventDefault();
    e.stopPropagation();
    
    setSelectedSlot(slotId);
    
    const rect = canvasRef.current.getBoundingClientRect();
    dragRef.current = {
      isDragging: true,
      startX: e.clientX - rect.left,
      startY: e.clientY - rect.top,
      slotId: slotId
    };
  };

  // Handle mouse move for dragging
  const handleMouseMove = useCallback((e) => {
    if (!dragRef.current.isDragging) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    const deltaX = currentX - dragRef.current.startX;
    const deltaY = currentY - dragRef.current.startY;
    
    const slot = photoSlots.find(s => s.id === dragRef.current.slotId);
    if (slot) {
      updateSlot(slot.id, {
        x: Math.max(0, Math.min(canvasSize.width - slot.width, slot.x + deltaX)),
        y: Math.max(0, Math.min(canvasSize.height - slot.height, slot.y + deltaY))
      });
    }
    
    dragRef.current.startX = currentX;
    dragRef.current.startY = currentY;
  }, [photoSlots, canvasSize]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    dragRef.current.isDragging = false;
  }, []);

  // Set up mouse event listeners
  React.useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Assign photo to slot
  const assignPhotoToSlot = (slotId, photoId) => {
    updateSlot(slotId, { photoId });
  };

  // Handle photo drag start
  const handlePhotoDragStart = (e, photo) => {
    setDraggedPhoto(photo);
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Handle slot drop
  const handleSlotDrop = (e, slotId) => {
    e.preventDefault();
    if (draggedPhoto) {
      assignPhotoToSlot(slotId, draggedPhoto.id);
      setDraggedPhoto(null);
    }
  };

  // Handle slot drag over
  const handleSlotDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // Generate template preview
  const generatePreview = () => {
    const canvas = document.createElement('canvas');
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    const ctx = canvas.getContext('2d');

    // Draw background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw photo slots
    photoSlots.forEach(slot => {
      const photo = capturedPhotos.find(p => p.id === slot.photoId);
      
      ctx.save();
      
      // Apply transformations
      ctx.translate(slot.x + slot.width / 2, slot.y + slot.height / 2);
      ctx.rotate((slot.rotation * Math.PI) / 180);
      
      // Draw border
      ctx.fillStyle = slot.borderColor;
      ctx.fillRect(-slot.width / 2 - slot.borderWidth, -slot.height / 2 - slot.borderWidth, 
                   slot.width + slot.borderWidth * 2, slot.height + slot.borderWidth * 2);
      
      if (photo) {
        // Draw photo
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, -slot.width / 2, -slot.height / 2, slot.width, slot.height);
        };
        img.src = photo.imageData;
      } else {
        // Draw placeholder
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(-slot.width / 2, -slot.height / 2, slot.width, slot.height);
        
        ctx.fillStyle = '#999';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Photo', 0, 0);
      }
      
      ctx.restore();
    });

    return canvas.toDataURL('image/jpeg', 0.95);
  };

  // Save template
  const handleSave = () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }
    
    if (photoSlots.length === 0) {
      alert('Please add at least one photo slot');
      return;
    }

    const template = {
      id: `custom-${Date.now()}`,
      name: templateName,
      description: `Custom template with ${photoSlots.length} photos`,
      className: 'custom-template',
      photoCount: photoSlots.length,
      dimensions: `${canvasSize.width}x${canvasSize.height}`,
      width: canvasSize.width,
      height: canvasSize.height,
      isCustom: true,
      slots: photoSlots,
      backgroundColor,
      borderColor,
      borderWidth,
      preview: generatePreview()
    };

    onSave(template);
  };

  const selectedSlotData = photoSlots.find(slot => slot.id === selectedSlot);

  return (
    <div className="custom-template-creator">
      <div className="creator-backdrop" onClick={onClose}></div>
      
      <div className="creator-content" onClick={(e) => e.stopPropagation()}>
        <div className="creator-header">
          <h2>Custom Template Creator</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="creator-body">
          {/* Left Panel - Tools */}
          <div className="creator-tools">
            <div className="tool-section">
              <h3>Template Settings</h3>
              <div className="form-group">
                <label>Template Name</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="My Custom Template"
                />
              </div>
              
              <div className="form-group">
                <label>Canvas Size</label>
                <div className="size-inputs">
                  <input
                    type="number"
                    value={canvasSize.width}
                    onChange={(e) => setCanvasSize(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                    placeholder="Width"
                  />
                  <span>×</span>
                  <input
                    type="number"
                    value={canvasSize.height}
                    onChange={(e) => setCanvasSize(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                    placeholder="Height"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Background Color</label>
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                />
              </div>
            </div>

            <div className="tool-section">
              <h3>Photo Slots</h3>
              <button 
                className={`tool-btn ${isAddingSlot ? 'active' : ''}`}
                onClick={() => setIsAddingSlot(!isAddingSlot)}
              >
                {isAddingSlot ? 'Click Canvas to Add' : '+ Add Photo Slot'}
              </button>
              
              {selectedSlot && (
                <button className="tool-btn danger" onClick={deleteSelectedSlot}>
                  🗑️ Delete Selected
                </button>
              )}
              
              <div className="slots-list">
                <h4>Slots ({photoSlots.length})</h4>
                {photoSlots.map((slot, index) => (
                  <div
                    key={slot.id}
                    className={`slot-item ${selectedSlot === slot.id ? 'selected' : ''}`}
                    onClick={() => setSelectedSlot(slot.id)}
                  >
                    <span>Slot {index + 1}</span>
                    {slot.photoId && <span className="has-photo">📸</span>}
                  </div>
                ))}
              </div>
            </div>

            {selectedSlotData && (
              <div className="tool-section">
                <h3>Slot Properties</h3>
                <div className="form-group">
                  <label>Width</label>
                  <input
                    type="number"
                    value={selectedSlotData.width}
                    onChange={(e) => updateSlot(selectedSlot, { width: parseInt(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Height</label>
                  <input
                    type="number"
                    value={selectedSlotData.height}
                    onChange={(e) => updateSlot(selectedSlot, { height: parseInt(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Rotation (degrees)</label>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={selectedSlotData.rotation}
                    onChange={(e) => updateSlot(selectedSlot, { rotation: parseInt(e.target.value) })}
                  />
                  <span>{selectedSlotData.rotation}°</span>
                </div>
                <div className="form-group">
                  <label>Border Radius</label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={selectedSlotData.borderRadius}
                    onChange={(e) => updateSlot(selectedSlot, { borderRadius: parseInt(e.target.value) })}
                  />
                  <span>{selectedSlotData.borderRadius}px</span>
                </div>
              </div>
            )}
          </div>

          {/* Center Panel - Canvas */}
          <div className="creator-canvas-area">
            <div className="canvas-container">
              <div
                ref={canvasRef}
                className="design-canvas"
                style={{
                  width: canvasSize.width / 2,
                  height: canvasSize.height / 2,
                  backgroundColor,
                  cursor: isAddingSlot ? 'crosshair' : 'default'
                }}
                onClick={handleCanvasClick}
              >
                {photoSlots.map(slot => {
                  const photo = capturedPhotos.find(p => p.id === slot.photoId);
                  return (
                    <div
                      key={slot.id}
                      className={`photo-slot-designer ${selectedSlot === slot.id ? 'selected' : ''}`}
                      style={{
                        left: slot.x / 2,
                        top: slot.y / 2,
                        width: slot.width / 2,
                        height: slot.height / 2,
                        transform: `rotate(${slot.rotation}deg)`,
                        borderRadius: slot.borderRadius / 2,
                        border: `${slot.borderWidth}px solid ${slot.borderColor}`,
                        backgroundImage: photo ? `url(${photo.imageData})` : 'none',
                        backgroundColor: photo ? 'transparent' : '#f0f0f0'
                      }}
                      onMouseDown={(e) => handleSlotMouseDown(e, slot.id)}
                      onDrop={(e) => handleSlotDrop(e, slot.id)}
                      onDragOver={handleSlotDragOver}
                    >
                      {!photo && (
                        <div className="slot-placeholder">
                          <span>📸</span>
                          <span>Photo {photoSlots.indexOf(slot) + 1}</span>
                        </div>
                      )}
                      {selectedSlot === slot.id && (
                        <div className="slot-handles">
                          <div className="resize-handle top-left"></div>
                          <div className="resize-handle top-right"></div>
                          <div className="resize-handle bottom-left"></div>
                          <div className="resize-handle bottom-right"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="canvas-info">
                <span>Canvas: {canvasSize.width} × {canvasSize.height}px</span>
                <span>Scale: 50%</span>
              </div>
            </div>
          </div>

          {/* Right Panel - Photos */}
          <div className="creator-photos">
            <h3>Available Photos ({capturedPhotos.length})</h3>
            <div className="photos-grid">
              {capturedPhotos.map(photo => (
                <div
                  key={photo.id}
                  className="photo-item-creator"
                  draggable
                  onDragStart={(e) => handlePhotoDragStart(e, photo)}
                >
                  <img src={photo.imageData} alt={`Photo ${photo.id}`} />
                  <div className="photo-info">
                    <span>{photo.filter.name}</span>
                    <span>{new Date(photo.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
            
            {capturedPhotos.length === 0 && (
              <div className="no-photos">
                <p>No photos available</p>
                <p>Capture some photos first!</p>
              </div>
            )}
          </div>
        </div>

        <div className="creator-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSave}>
            Save Template
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomTemplateCreator;