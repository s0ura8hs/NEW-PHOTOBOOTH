import React, { useState } from 'react';
import './TemplateSelector.css';

const TemplateSelector = ({ 
  templates, 
  currentTemplate, 
  onTemplateSelect, 
  onClose, 
  capturedPhotos 
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState(currentTemplate);
  const [customization, setCustomization] = useState({
    backgroundColor: '#ffffff',
    borderColor: '#000000',
    borderWidth: 2,
    textColor: '#000000',
    fontSize: 16
  });

  const handleTemplateClick = (template) => {
    setSelectedTemplate(template);
  };

  const handleApplyTemplate = () => {
    onTemplateSelect({
      ...selectedTemplate,
      customization
    });
  };

  const renderTemplatePreview = (template, photos = []) => {
    const previewPhotos = photos.length > 0 ? photos : 
      Array(template.photoCount).fill(null).map((_, i) => ({
        id: `placeholder-${i}`,
        imageData: `data:image/svg+xml,${encodeURIComponent(`
          <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
            <rect width="200" height="200" fill="#f0f0f0"/>
            <text x="100" y="100" text-anchor="middle" dy=".3em" font-family="Arial" font-size="24" fill="#ccc">
              Photo ${i + 1}
            </text>
          </svg>
        `)}`
      }));

    return (
      <div 
        className={`template-preview ${template.className}`}
        style={{
          backgroundColor: customization.backgroundColor,
          border: `${customization.borderWidth}px solid ${customization.borderColor}`
        }}
      >
        {previewPhotos.slice(0, template.photoCount).map((photo, index) => (
          <div 
            key={photo.id || `slot-${index}`} 
            className={`photo-slot slot-${index + 1}`}
            style={{
              border: `1px solid ${customization.borderColor}`
            }}
          >
            <img 
              src={photo.imageData} 
              alt={`Photo ${index + 1}`}
              className="photo-image"
            />
          </div>
        ))}
        
        {template.textAreas && template.textAreas.map((textArea, index) => (
          <div
            key={`text-${index}`}
            className={`text-area ${textArea.className}`}
            style={{
              color: customization.textColor,
              fontSize: `${customization.fontSize}px`
            }}
          >
            {textArea.placeholder}
          </div>
        ))}

        {template.decorativeElements && template.decorativeElements.map((element, index) => (
          <div
            key={`decoration-${index}`}
            className={`decorative-element ${element.className}`}
            style={element.style}
          >
            {element.content}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="template-selector-modal">
      <div className="modal-backdrop" onClick={onClose}></div>
      
      <div className="template-selector-content">
        <div className="modal-header">
          <h2>Select Template</h2>
          <button className="close-btn glass-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="template-selector-body">
          {/* Template Gallery */}
          <div className="template-gallery">
            <div className="templates-grid">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`template-card ${selectedTemplate.id === template.id ? 'selected' : ''}`}
                  onClick={() => handleTemplateClick(template)}
                >
                  <div className="template-card-preview">
                    {renderTemplatePreview(template, capturedPhotos)}
                  </div>
                  <div className="template-card-info">
                    <h3>{template.name}</h3>
                    <p>{template.description}</p>
                    <div className="template-specs">
                      <span>📸 {template.photoCount} photos</span>
                      <span>📐 {template.dimensions}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customization Panel */}
          <div className="customization-panel">
            <div className="glass-panel">
              <h3>Customize Template</h3>
              
              <div className="customization-section">
                <h4>Colors</h4>
                <div className="color-controls">
                  <div className="color-control">
                    <label>Background</label>
                    <input
                      type="color"
                      value={customization.backgroundColor}
                      onChange={(e) => setCustomization(prev => ({
                        ...prev,
                        backgroundColor: e.target.value
                      }))}
                    />
                  </div>
                  <div className="color-control">
                    <label>Border</label>
                    <input
                      type="color"
                      value={customization.borderColor}
                      onChange={(e) => setCustomization(prev => ({
                        ...prev,
                        borderColor: e.target.value
                      }))}
                    />
                  </div>
                  <div className="color-control">
                    <label>Text</label>
                    <input
                      type="color"
                      value={customization.textColor}
                      onChange={(e) => setCustomization(prev => ({
                        ...prev,
                        textColor: e.target.value
                      }))}
                    />
                  </div>
                </div>
              </div>

              <div className="customization-section">
                <h4>Layout</h4>
                <div className="layout-controls">
                  <div className="control-group">
                    <label>Border Width</label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={customization.borderWidth}
                      onChange={(e) => setCustomization(prev => ({
                        ...prev,
                        borderWidth: parseInt(e.target.value)
                      }))}
                    />
                    <span>{customization.borderWidth}px</span>
                  </div>
                  <div className="control-group">
                    <label>Text Size</label>
                    <input
                      type="range"
                      min="10"
                      max="32"
                      value={customization.fontSize}
                      onChange={(e) => setCustomization(prev => ({
                        ...prev,
                        fontSize: parseInt(e.target.value)
                      }))}
                    />
                    <span>{customization.fontSize}px</span>
                  </div>
                </div>
              </div>

              <div className="customization-section">
                <h4>Presets</h4>
                <div className="preset-buttons">
                  <button 
                    className="preset-btn"
                    onClick={() => setCustomization({
                      backgroundColor: '#ffffff',
                      borderColor: '#000000',
                      borderWidth: 2,
                      textColor: '#000000',
                      fontSize: 16
                    })}
                  >
                    Classic
                  </button>
                  <button 
                    className="preset-btn"
                    onClick={() => setCustomization({
                      backgroundColor: '#f8f9fa',
                      borderColor: '#ff6b9d',
                      borderWidth: 3,
                      textColor: '#c44569',
                      fontSize: 18
                    })}
                  >
                    Pink
                  </button>
                  <button 
                    className="preset-btn"
                    onClick={() => setCustomization({
                      backgroundColor: '#2c3e50',
                      borderColor: '#f39c12',
                      borderWidth: 4,
                      textColor: '#f1c40f',
                      fontSize: 20
                    })}
                  >
                    Dark
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="live-preview">
            <div className="glass-panel">
              <h3>Preview</h3>
              <div className="preview-container">
                {renderTemplatePreview(selectedTemplate, capturedPhotos)}
              </div>
              <div className="preview-info">
                <p><strong>{selectedTemplate.name}</strong></p>
                <p>{selectedTemplate.description}</p>
                <p>Photos needed: {selectedTemplate.photoCount}</p>
                <p>Available photos: {capturedPhotos.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn-primary" 
            onClick={handleApplyTemplate}
            disabled={capturedPhotos.length < selectedTemplate.photoCount}
          >
            Apply Template
            {capturedPhotos.length < selectedTemplate.photoCount && (
              <span className="warning-text">
                (Need {selectedTemplate.photoCount - capturedPhotos.length} more photos)
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;