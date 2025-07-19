import React, { useState, useRef, useEffect } from 'react';
import './FilterWheel.css';

const FilterWheel = ({ filters, currentFilter, onFilterChange, onClose }) => {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastAngle, setLastAngle] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showGrid, setShowGrid] = useState(false);
  const wheelRef = useRef(null);

  const totalFilters = filters.length;
  const anglePerFilter = 360 / totalFilters;

  const getFilterPosition = (index) => {
    const angle = (index * anglePerFilter) + rotation;
    const radius = 200; // Distance from center
    const x = Math.cos((angle - 90) * Math.PI / 180) * radius;
    const y = Math.sin((angle - 90) * Math.PI / 180) * radius;
    return { x, y, angle };
  };

  const getAngleFromEvent = (e) => {
    if (!wheelRef.current) return 0;
    
    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    
    return Math.atan2(deltaY, deltaX) * 180 / Math.PI;
  };

  const handleStart = (e) => {
    setIsDragging(true);
    setLastAngle(getAngleFromEvent(e));
  };

  const handleMove = (e) => {
    if (!isDragging) return;
    
    const currentAngle = getAngleFromEvent(e);
    let angleDiff = currentAngle - lastAngle;
    
    // Handle angle wraparound
    if (angleDiff > 180) angleDiff -= 360;
    if (angleDiff < -180) angleDiff += 360;
    
    setRotation(prev => prev + angleDiff);
    setLastAngle(currentAngle);
  };

  const handleEnd = () => {
    setIsDragging(false);
    snapToNearestFilter();
  };

  const snapToNearestFilter = () => {
    const normalizedRotation = ((rotation % 360) + 360) % 360;
    const nearestFilterIndex = Math.round(normalizedRotation / anglePerFilter) % totalFilters;
    const targetRotation = nearestFilterIndex * anglePerFilter;
    
    setRotation(targetRotation);
    
    const selectedFilter = filters[nearestFilterIndex];
    if (selectedFilter && selectedFilter.id !== currentFilter.id) {
      onFilterChange(selectedFilter);
    }
  };

  const rotateToFilter = (filterIndex) => {
    const targetRotation = filterIndex * anglePerFilter;
    setRotation(targetRotation);
    onFilterChange(filters[filterIndex]);
  };

  const spinWheel = () => {
    const randomSpins = 3 + Math.random() * 3; // 3-6 full rotations
    const randomFilter = Math.floor(Math.random() * totalFilters);
    const targetRotation = (randomSpins * 360) + (randomFilter * anglePerFilter);
    
    setRotation(targetRotation);
    
    setTimeout(() => {
      onFilterChange(filters[randomFilter]);
    }, 800);
  };

  const getFilteredFilters = () => {
    if (!searchTerm) return filters;
    
    return filters.filter(filter =>
      filter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      filter.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const currentIndex = filters.findIndex(filter => filter.id === currentFilter.id);

  return (
    <div className="filter-wheel-modal" onClick={onClose}>
      <div className="filter-wheel-content" onClick={(e) => e.stopPropagation()}>
        <div className="filter-wheel-header">
          <h2 className="filter-wheel-title">Filter Wheel</h2>
          <button className="close-wheel-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Search */}
        <div className="wheel-search">
          <input
            type="text"
            placeholder="Search filters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Wheel Controls */}
        <div className="wheel-controls">
          <button className="wheel-control-btn" onClick={spinWheel}>
            🎲 Random Spin
          </button>
          <button 
            className={`wheel-control-btn ${showGrid ? 'secondary' : ''}`}
            onClick={() => setShowGrid(!showGrid)}
          >
            {showGrid ? '🎡 Wheel View' : '🔲 Grid View'}
          </button>
          <button className="wheel-control-btn secondary" onClick={onClose}>
            ✓ Apply Filter
          </button>
        </div>

        {!showGrid ? (
          /* Circular Wheel View */
          <div className="circular-wheel-container">
            <div 
              className="circular-wheel"
              ref={wheelRef}
              style={{ transform: `rotate(${rotation}deg)` }}
              onMouseDown={handleStart}
              onMouseMove={handleMove}
              onMouseUp={handleEnd}
              onMouseLeave={handleEnd}
              onTouchStart={handleStart}
              onTouchMove={handleMove}
              onTouchEnd={handleEnd}
            >
              {filters.map((filter, index) => {
                const position = getFilterPosition(index);
                const isActive = filter.id === currentFilter.id;
                
                return (
                  <div
                    key={filter.id}
                    className={`wheel-filter-item ${isActive ? 'active' : ''}`}
                    style={{
                      transform: `translate(${position.x}px, ${position.y}px) rotate(${-rotation}deg)`,
                      left: '50%',
                      top: '50%',
                      marginLeft: '-30px',
                      marginTop: '-30px'
                    }}
                    onClick={() => rotateToFilter(index)}
                  >
                    <div className="wheel-filter-icon">{filter.icon}</div>
                    <div className="wheel-filter-name">{filter.name}</div>
                  </div>
                );
              })}
            </div>

            {/* Center Display */}
            <div className="wheel-center">
              <div className="current-filter-display">
                <div className="current-filter-icon">{currentFilter.icon}</div>
                <div className="current-filter-text">{currentFilter.name}</div>
                <div className="current-filter-category">{currentFilter.category}</div>
              </div>
            </div>

            {/* Category Indicators */}
            <div className="category-indicators">
              {['vintage', 'digital', 'artistic', 'modern'].map((category, index) => (
                <div
                  key={category}
                  className={`category-indicator ${category}`}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, -50%) rotate(${index * 90}deg) translateY(-225px) rotate(${-index * 90}deg)`
                  }}
                >
                  {category}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="filter-grid-view">
            <h3 className="filter-grid-title">All Filters</h3>
            <div className="filter-grid-container">
              {getFilteredFilters().map((filter) => (
                <div
                  key={filter.id}
                  className={`grid-filter-item ${currentFilter.id === filter.id ? 'active' : ''}`}
                  onClick={() => onFilterChange(filter)}
                >
                  <div 
                    className="grid-filter-preview"
                    style={{ filter: filter.cssFilter }}
                  >
                    {filter.icon}
                  </div>
                  <div className="grid-filter-name">{filter.name}</div>
                  <div className="grid-filter-category">{filter.category}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterWheel;