import React, { useState, useRef, useEffect } from 'react';
import CameraView from './CameraView';
import FilterWheel from './FilterWheel';
import TemplateSelector from './TemplateSelector';
import PhotoGallery from './PhotoGallery';
import CameraControls from './CameraControls';
import { filters } from '../data/filters';
import { templates } from '../data/templates';
import './PhotoboothApp.css';

const PhotoboothApp = () => {
  const [currentFilter, setCurrentFilter] = useState(filters[0]);
  const [currentTemplate, setCurrentTemplate] = useState(templates[0]);
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showFilterWheel, setShowFilterWheel] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [cameraSettings, setCameraSettings] = useState({
    zoom: 1,
    exposure: 0,
    focusMode: 'auto',
    focusDistance: 50
  });

  const cameraRef = useRef(null);

  const handleCapturePhoto = (imageData) => {
    const newPhoto = {
      id: Date.now(),
      imageData,
      filter: currentFilter,
      template: currentTemplate,
      timestamp: new Date().toISOString(),
      settings: { ...cameraSettings }
    };
    
    setCapturedPhotos(prev => [newPhoto, ...prev]);
    
    // Save to localStorage
    const savedPhotos = JSON.parse(localStorage.getItem('photobooth-photos') || '[]');
    savedPhotos.unshift(newPhoto);
    localStorage.setItem('photobooth-photos', JSON.stringify(savedPhotos.slice(0, 100)));
  };

  const handleFilterChange = (filter) => {
    setCurrentFilter(filter);
  };

  const handleTemplateChange = (template) => {
    setCurrentTemplate(template);
    setShowTemplateSelector(false);
  };

  const handleCameraSettingChange = (setting, value) => {
    setCameraSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const getFilteredFilters = () => {
    let filtered = filters;
    
    if (activeCategory !== 'all') {
      filtered = filtered.filter(filter => filter.category === activeCategory);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(filter =>
        filter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        filter.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const categories = [
    { id: 'all', name: 'All Filters' },
    { id: 'vintage', name: 'Vintage' },
    { id: 'digital', name: 'Digital' },
    { id: 'artistic', name: 'Artistic' },
    { id: 'modern', name: 'Modern' }
  ];

  useEffect(() => {
    // Load saved photos
    const savedPhotos = JSON.parse(localStorage.getItem('photobooth-photos') || '[]');
    setCapturedPhotos(savedPhotos);
  }, []);

  return (
    <div className="photobooth-app">
      <div className="camera-section">
        {/* Header Bar */}
        <div className="header-bar">
          <h1 className="app-title">Professional Photobooth</h1>
          <div className="header-controls">
            <button 
              className="header-btn secondary"
              onClick={() => setShowFilterWheel(!showFilterWheel)}
            >
              {showFilterWheel ? 'Hide' : 'Show'} Filter Wheel
            </button>
            <button 
              className="header-btn"
              onClick={() => setShowGallery(true)}
            >
              Gallery ({capturedPhotos.length})
            </button>
          </div>
        </div>

        {/* Left Sidebar - Filter Controls */}
        <div className="filter-sidebar">
          <h3 className="filter-section-title">Filters</h3>
          
          {/* Filter Search */}
          <div className="filter-search">
            <input
              type="text"
              placeholder="Search filters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="filter-search-icon">🔍</span>
          </div>

          {/* Filter Categories */}
          <div className="filter-categories">
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Filter Grid */}
          <div className="filter-grid">
            {getFilteredFilters().slice(0, 20).map(filter => (
              <div
                key={filter.id}
                className={`filter-item ${currentFilter.id === filter.id ? 'active' : ''}`}
                onClick={() => handleFilterChange(filter)}
              >
                <div 
                  className="filter-preview"
                  style={{ filter: filter.cssFilter }}
                >
                  {filter.icon}
                </div>
                <div className="filter-name">{filter.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Camera Area */}
        <div className="camera-main">
          <CameraView
            ref={cameraRef}
            currentFilter={currentFilter}
            cameraSettings={cameraSettings}
            onCapture={handleCapturePhoto}
          />
          
          <div className="camera-overlay">
            <div className="current-filter-indicator">
              {currentFilter.icon} {currentFilter.name}
            </div>
            
            <div className="camera-settings-overlay">
              <div className="setting-badge">
                Zoom: {cameraSettings.zoom.toFixed(1)}x
              </div>
              <div className="setting-badge">
                EV: {cameraSettings.exposure > 0 ? '+' : ''}{cameraSettings.exposure.toFixed(1)}
              </div>
              <div className="setting-badge">
                Focus: {cameraSettings.focusMode}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Camera Controls */}
        <div className="controls-sidebar">
          <div className="control-section">
            <h4 className="control-title">Camera Settings</h4>
            
            {/* Zoom Control */}
            <div className="control-group">
              <div className="control-label">
                <span>Zoom</span>
                <span className="control-value">{cameraSettings.zoom.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                step="0.1"
                value={cameraSettings.zoom}
                onChange={(e) => handleCameraSettingChange('zoom', parseFloat(e.target.value))}
                className="control-slider"
              />
              <div className="button-group">
                {[1, 2, 4, 8].map(zoom => (
                  <button
                    key={zoom}
                    className={`control-btn ${cameraSettings.zoom === zoom ? 'active' : ''}`}
                    onClick={() => handleCameraSettingChange('zoom', zoom)}
                  >
                    {zoom}x
                  </button>
                ))}
              </div>
            </div>

            {/* Exposure Control */}
            <div className="control-group">
              <div className="control-label">
                <span>Exposure</span>
                <span className="control-value">
                  {cameraSettings.exposure > 0 ? '+' : ''}{cameraSettings.exposure.toFixed(1)} EV
                </span>
              </div>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.1"
                value={cameraSettings.exposure}
                onChange={(e) => handleCameraSettingChange('exposure', parseFloat(e.target.value))}
                className="control-slider"
              />
              <div className="button-group">
                {[-2, -1, 0, 1, 2].map(ev => (
                  <button
                    key={ev}
                    className={`control-btn ${cameraSettings.exposure === ev ? 'active' : ''}`}
                    onClick={() => handleCameraSettingChange('exposure', ev)}
                  >
                    {ev > 0 ? '+' : ''}{ev}
                  </button>
                ))}
              </div>
            </div>

            {/* Focus Control */}
            <div className="control-group">
              <div className="control-label">
                <span>Focus Mode</span>
                <span className="control-value">{cameraSettings.focusMode}</span>
              </div>
              <div className="button-group">
                <button
                  className={`control-btn ${cameraSettings.focusMode === 'auto' ? 'active' : ''}`}
                  onClick={() => handleCameraSettingChange('focusMode', 'auto')}
                >
                  Auto
                </button>
                <button
                  className={`control-btn ${cameraSettings.focusMode === 'manual' ? 'active' : ''}`}
                  onClick={() => handleCameraSettingChange('focusMode', 'manual')}
                >
                  Manual
                </button>
              </div>
              {cameraSettings.focusMode === 'manual' && (
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={cameraSettings.focusDistance}
                  onChange={(e) => handleCameraSettingChange('focusDistance', parseInt(e.target.value))}
                  className="control-slider"
                />
              )}
            </div>
          </div>

          <div className="control-section">
            <h4 className="control-title">Template</h4>
            <div 
              className="template-preview-mini"
              onClick={() => setShowTemplateSelector(true)}
            >
              {currentTemplate.name}
            </div>
          </div>

          <div className="control-section">
            <h4 className="control-title">Quick Actions</h4>
            <div className="button-group" style={{ flexDirection: 'column', gap: '8px' }}>
              <button 
                className="control-btn"
                onClick={() => {
                  handleCameraSettingChange('zoom', 1);
                  handleCameraSettingChange('exposure', 0);
                  handleCameraSettingChange('focusMode', 'auto');
                }}
              >
                Reset Settings
              </button>
              <button 
                className="control-btn"
                onClick={() => {
                  const randomFilter = filters[Math.floor(Math.random() * filters.length)];
                  handleFilterChange(randomFilter);
                }}
              >
                Random Filter
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="bottom-controls">
          <div className="capture-controls">
            <button 
              className="capture-button"
              onClick={() => cameraRef.current?.capturePhoto()}
              title="Capture Photo (Space)"
            />
            <div className="gallery-info">
              <div className="photo-count-badge">
                {capturedPhotos.length} Photos
              </div>
            </div>
          </div>

          <div className="action-buttons">
            <button 
              className="action-btn secondary"
              onClick={() => setShowTemplateSelector(true)}
            >
              Templates
            </button>
            <button 
              className="action-btn"
              onClick={() => setShowGallery(true)}
            >
              View Gallery
            </button>
          </div>
        </div>

        {/* Mobile Controls - Hidden on Desktop */}
        <div className="mobile-controls">
          <CameraControls
            settings={cameraSettings}
            onChange={handleCameraSettingChange}
            onCapture={() => cameraRef.current?.capturePhoto()}
            onTemplateSelect={() => setShowTemplateSelector(true)}
            onGalleryOpen={() => setShowGallery(true)}
            photoCount={capturedPhotos.length}
          />
        </div>
      </div>

      {/* Filter Wheel Modal */}
      {showFilterWheel && (
        <FilterWheel
          filters={filters}
          currentFilter={currentFilter}
          onFilterChange={handleFilterChange}
          onClose={() => setShowFilterWheel(false)}
        />
      )}

      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <TemplateSelector
          templates={templates}
          currentTemplate={currentTemplate}
          onTemplateSelect={handleTemplateChange}
          onClose={() => setShowTemplateSelector(false)}
          capturedPhotos={capturedPhotos}
        />
      )}

      {/* Photo Gallery Modal */}
      {showGallery && (
        <PhotoGallery
          photos={capturedPhotos}
          onClose={() => setShowGallery(false)}
          currentTemplate={currentTemplate}
        />
      )}
    </div>
  );
};

export default PhotoboothApp;