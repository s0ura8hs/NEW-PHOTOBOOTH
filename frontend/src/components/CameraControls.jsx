import React, { useState } from 'react';
import './CameraControls.css';

const CameraControls = ({ 
  settings, 
  onChange, 
  onCapture, 
  onTemplateSelect, 
  onGalleryOpen,
  photoCount 
}) => {
  const [showControls, setShowControls] = useState(true);
  const [activeControl, setActiveControl] = useState(null);

  const handleZoomChange = (value) => {
    onChange('zoom', parseFloat(value));
  };

  const handleExposureChange = (value) => {
    onChange('exposure', parseFloat(value));
  };

  const handleFocusChange = (value) => {
    onChange('focusDistance', parseFloat(value));
  };

  const toggleFocusMode = () => {
    const newMode = settings.focusMode === 'auto' ? 'manual' : 'auto';
    onChange('focusMode', newMode);
  };

  const resetAllControls = () => {
    onChange('zoom', 1);
    onChange('exposure', 0);
    onChange('focusMode', 'auto');
    onChange('focusDistance', 50);
  };

  return (
    <div className={`camera-controls ${showControls ? 'visible' : 'hidden'}`}>
      {/* Toggle Controls Button */}
      <button 
        className="controls-toggle glass-btn"
        onClick={() => setShowControls(!showControls)}
        title={showControls ? 'Hide Controls' : 'Show Controls'}
      >
        {showControls ? '🔽' : '🔼'}
      </button>

      {showControls && (
        <>
          {/* Top Control Row */}
          <div className="control-row top-row">
            {/* Zoom Controls */}
            <div className={`control-group zoom-control ${activeControl === 'zoom' ? 'active' : ''}`}>
              <div className="glass-panel">
                <div className="control-header">
                  <span className="control-icon">🔍</span>
                  <span className="control-label">Zoom</span>
                  <span className="control-value">{settings.zoom.toFixed(1)}x</span>
                </div>
                <div className="zoom-slider-container">
                  <button 
                    className="zoom-btn"
                    onClick={() => handleZoomChange(Math.max(1, settings.zoom - 0.1))}
                    disabled={settings.zoom <= 1}
                  >
                    -
                  </button>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    step="0.1"
                    value={settings.zoom}
                    onChange={(e) => handleZoomChange(e.target.value)}
                    className="zoom-slider"
                    onFocus={() => setActiveControl('zoom')}
                    onBlur={() => setActiveControl(null)}
                  />
                  <button 
                    className="zoom-btn"
                    onClick={() => handleZoomChange(Math.min(8, settings.zoom + 0.1))}
                    disabled={settings.zoom >= 8}
                  >
                    +
                  </button>
                </div>
                <div className="zoom-presets">
                  {[1, 2, 4, 8].map(zoomLevel => (
                    <button
                      key={zoomLevel}
                      className={`preset-btn ${settings.zoom === zoomLevel ? 'active' : ''}`}
                      onClick={() => handleZoomChange(zoomLevel)}
                    >
                      {zoomLevel}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Camera Switch */}
            <div className="control-group camera-switch">
              <button className="glass-btn camera-switch-btn" title="Switch Camera">
                <span className="control-icon">🔄</span>
              </button>
            </div>

            {/* Settings */}
            <div className="control-group settings">
              <button 
                className="glass-btn settings-btn" 
                onClick={resetAllControls}
                title="Reset All Controls"
              >
                <span className="control-icon">⚙️</span>
              </button>
            </div>
          </div>

          {/* Right Panel - Exposure */}
          <div className={`control-panel right-panel ${activeControl === 'exposure' ? 'active' : ''}`}>
            <div className="glass-panel vertical">
              <div className="control-header vertical">
                <span className="control-icon">☀️</span>
                <span className="control-label">Exposure</span>
                <span className="control-value">
                  {settings.exposure > 0 ? '+' : ''}{settings.exposure.toFixed(1)} EV
                </span>
              </div>
              <div className="exposure-slider-container">
                <div className="exposure-scale">
                  {[-2, -1, 0, 1, 2].map(ev => (
                    <div 
                      key={ev} 
                      className={`scale-mark ${settings.exposure === ev ? 'active' : ''}`}
                      onClick={() => handleExposureChange(ev)}
                    >
                      {ev > 0 ? '+' : ''}{ev}
                    </div>
                  ))}
                </div>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={settings.exposure}
                  onChange={(e) => handleExposureChange(e.target.value)}
                  className="exposure-slider vertical-slider"
                  onFocus={() => setActiveControl('exposure')}
                  onBlur={() => setActiveControl(null)}
                  orient="vertical"
                />
                <div className="exposure-indicators">
                  <div className={`indicator ${settings.exposure > 1 ? 'warning' : ''}`}>
                    {settings.exposure > 1 ? '⚠️' : ''}
                  </div>
                  <div className={`indicator ${settings.exposure < -1 ? 'warning' : ''}`}>
                    {settings.exposure < -1 ? '⚠️' : ''}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Control Row */}
          <div className="control-row bottom-row">
            {/* Focus Controls */}
            <div className={`control-group focus-control ${activeControl === 'focus' ? 'active' : ''}`}>
              <div className="glass-panel">
                <div className="control-header">
                  <span className="control-icon">🎯</span>
                  <span className="control-label">Focus</span>
                  <button 
                    className={`focus-mode-btn ${settings.focusMode === 'auto' ? 'active' : ''}`}
                    onClick={toggleFocusMode}
                  >
                    {settings.focusMode === 'auto' ? 'AUTO' : 'MAN'}
                  </button>
                </div>
                {settings.focusMode === 'manual' && (
                  <div className="focus-slider-container">
                    <span className="focus-label">Near</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.focusDistance}
                      onChange={(e) => handleFocusChange(e.target.value)}
                      className="focus-slider"
                      onFocus={() => setActiveControl('focus')}
                      onBlur={() => setActiveControl(null)}
                    />
                    <span className="focus-label">Far</span>
                  </div>
                )}
                <div className="focus-distance">
                  {settings.focusMode === 'manual' && (
                    <span>{(settings.focusDistance / 100 * 10).toFixed(1)}m</span>
                  )}
                </div>
              </div>
            </div>

            {/* Capture Button */}
            <div className="control-group capture-group">
              <button 
                className="capture-btn glass-btn"
                onClick={onCapture}
                title="Capture Photo"
              >
                <div className="capture-ring">
                  <div className="capture-inner"></div>
                </div>
              </button>
            </div>

            {/* Gallery & Template */}
            <div className="control-group secondary-controls">
              <button 
                className="glass-btn template-btn"
                onClick={onTemplateSelect}
                title="Select Template"
              >
                <span className="control-icon">🎨</span>
              </button>
              <button 
                className="glass-btn gallery-btn"
                onClick={onGalleryOpen}
                title="Open Gallery"
              >
                <span className="control-icon">🖼️</span>
                {photoCount > 0 && (
                  <span className="photo-count">{photoCount}</span>
                )}
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <div className="glass-panel">
              <div className="action-hints">
                <span>Space: Capture</span>
                <span>R: Random Filter</span>
                <span>←→: Navigate Filters</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Keyboard Shortcuts Handler */}
      <div className="keyboard-handler" style={{ display: 'none' }}>
        {/* This handles keyboard events */}
      </div>
    </div>
  );
};

export default CameraControls;