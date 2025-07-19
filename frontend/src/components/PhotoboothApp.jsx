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
    localStorage.setItem('photobooth-photos', JSON.stringify(savedPhotos.slice(0, 100))); // Keep last 100
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

  useEffect(() => {
    // Load saved photos
    const savedPhotos = JSON.parse(localStorage.getItem('photobooth-photos') || '[]');
    setCapturedPhotos(savedPhotos);
  }, []);

  return (
    <div className="photobooth-app">
      {/* Background with animated gradient */}
      <div className="animated-background"></div>
      
      {/* Main Camera View */}
      <div className="camera-section">
        <CameraView
          ref={cameraRef}
          currentFilter={currentFilter}
          cameraSettings={cameraSettings}
          onCapture={handleCapturePhoto}
        />
        
        {/* Camera Controls Overlay */}
        <CameraControls
          settings={cameraSettings}
          onChange={handleCameraSettingChange}
          onCapture={() => cameraRef.current?.capturePhoto()}
          onTemplateSelect={() => setShowTemplateSelector(true)}
          onGalleryOpen={() => setShowGallery(true)}
          photoCount={capturedPhotos.length}
        />
      </div>

      {/* Filter Wheel */}
      <div className="filter-wheel-section">
        <FilterWheel
          filters={filters}
          currentFilter={currentFilter}
          onFilterChange={handleFilterChange}
        />
      </div>

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

      {/* Template Preview (when photos exist) */}
      {capturedPhotos.length > 0 && !showGallery && !showTemplateSelector && (
        <div className="template-preview">
          <div className="glass-panel">
            <h3>Template Preview</h3>
            <div className="mini-template">
              {/* Render mini template preview */}
              <div className={`template-layout-mini ${currentTemplate.className}`}>
                {capturedPhotos.slice(0, currentTemplate.photoCount).map((photo, index) => (
                  <div key={photo.id} className={`photo-slot-mini slot-${index + 1}`}>
                    <img src={photo.imageData} alt={`Photo ${index + 1}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoboothApp;