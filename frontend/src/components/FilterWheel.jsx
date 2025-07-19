import React, { useState, useRef, useEffect } from 'react';
import './FilterWheel.css';

const FilterWheel = ({ filters, currentFilter, onFilterChange }) => {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastAngle, setLastAngle] = useState(0);
  const [momentum, setMomentum] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const wheelRef = useRef(null);
  const animationRef = useRef(null);

  const totalFilters = filters.length;
  const anglePerFilter = 360 / totalFilters;

  // Find current filter index
  const currentIndex = filters.findIndex(filter => filter.id === currentFilter.id);

  const getFilterPosition = (index) => {
    const angle = (index * anglePerFilter) + rotation;
    const radius = 200; // Wheel radius
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
    setMomentum(0);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const handleMove = (e) => {
    if (!isDragging) return;
    
    const currentAngle = getAngleFromEvent(e);
    let angleDiff = currentAngle - lastAngle;
    
    // Handle angle wraparound
    if (angleDiff > 180) angleDiff -= 360;
    if (angleDiff < -180) angleDiff += 360;
    
    setRotation(prev => prev + angleDiff);
    setMomentum(angleDiff);
    setLastAngle(currentAngle);
  };

  const handleEnd = () => {
    setIsDragging(false);
    
    // Apply momentum and snap to nearest filter
    const applyMomentum = () => {
      if (Math.abs(momentum) < 0.1) {
        snapToNearestFilter();
        return;
      }
      
      setRotation(prev => prev + momentum);
      setMomentum(prev => prev * 0.95); // Friction
      animationRef.current = requestAnimationFrame(applyMomentum);
    };
    
    if (Math.abs(momentum) > 1) {
      applyMomentum();
    } else {
      snapToNearestFilter();
    }
  };

  const snapToNearestFilter = () => {
    const normalizedRotation = ((rotation % 360) + 360) % 360;
    const nearestFilterIndex = Math.round(normalizedRotation / anglePerFilter) % totalFilters;
    const targetRotation = nearestFilterIndex * anglePerFilter;
    
    // Smooth animation to target
    const startRotation = rotation;
    const startTime = Date.now();
    const duration = 300;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      
      const newRotation = startRotation + (targetRotation - startRotation) * easeProgress;
      setRotation(newRotation);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Trigger filter change
        const selectedFilter = filters[nearestFilterIndex];
        if (selectedFilter && selectedFilter.id !== currentFilter.id) {
          onFilterChange(selectedFilter);
        }
      }
    };
    
    animate();
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term) {
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    const matchingFilter = filters.find(filter => 
      filter.name.toLowerCase().includes(term.toLowerCase()) ||
      filter.category.toLowerCase().includes(term.toLowerCase())
    );
    
    if (matchingFilter) {
      const targetIndex = filters.findIndex(filter => filter.id === matchingFilter.id);
      const targetRotation = targetIndex * anglePerFilter;
      
      // Animate to matching filter
      const startRotation = rotation;
      const startTime = Date.now();
      const duration = 500;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        const newRotation = startRotation + (targetRotation - startRotation) * easeProgress;
        setRotation(newRotation);
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          onFilterChange(matchingFilter);
          setIsSearching(false);
        }
      };
      
      animate();
    }
  };

  const handleKeyNavigation = (e) => {
    if (e.key === 'ArrowLeft') {
      const newIndex = (currentIndex - 1 + totalFilters) % totalFilters;
      onFilterChange(filters[newIndex]);
      setRotation(newIndex * anglePerFilter);
    } else if (e.key === 'ArrowRight') {
      const newIndex = (currentIndex + 1) % totalFilters;
      onFilterChange(filters[newIndex]);
      setRotation(newIndex * anglePerFilter);
    } else if (e.key === 'r' || e.key === 'R') {
      // Random filter
      const randomIndex = Math.floor(Math.random() * totalFilters);
      onFilterChange(filters[randomIndex]);
      setRotation(randomIndex * anglePerFilter);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyNavigation);
    return () => window.removeEventListener('keydown', handleKeyNavigation);
  }, [currentIndex, totalFilters]);

  // Auto-rotation when idle
  useEffect(() => {
    if (isDragging || isSearching) return;
    
    const autoRotate = () => {
      setRotation(prev => prev + 0.1); // Slow auto-rotation
      setTimeout(autoRotate, 100);
    };
    
    const timeout = setTimeout(autoRotate, 2000); // Start after 2 seconds of idle
    return () => clearTimeout(timeout);
  }, [isDragging, isSearching, rotation]);

  return (
    <div className="filter-wheel-container">
      {/* Search Interface */}
      <div className="filter-search">
        <div className="glass-panel">
          <input
            type="text"
            placeholder="Search filters..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
          <div className="search-icon">🔍</div>
        </div>
      </div>

      {/* Filter Wheel */}
      <div 
        className="filter-wheel"
        ref={wheelRef}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      >
        <div className="wheel-center">
          <div className="center-indicator">
            <div className="current-filter-name">
              {currentFilter.name}
            </div>
            <div className="filter-category">
              {currentFilter.category}
            </div>
          </div>
        </div>

        {filters.map((filter, index) => {
          const position = getFilterPosition(index);
          const isActive = filter.id === currentFilter.id;
          const distanceFromActive = Math.abs(((index - currentIndex + totalFilters) % totalFilters));
          const scale = isActive ? 1.5 : Math.max(0.6, 1 - (distanceFromActive / totalFilters) * 0.8);
          const opacity = isActive ? 1 : Math.max(0.4, 1 - (distanceFromActive / totalFilters) * 0.6);

          return (
            <div
              key={filter.id}
              className={`filter-item ${isActive ? 'active' : ''}`}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                opacity,
                zIndex: isActive ? 1000 : 100 - distanceFromActive
              }}
              onClick={() => onFilterChange(filter)}
            >
              <div className="filter-preview" style={{ 
                filter: filter.cssFilter,
                backgroundImage: `url(data:image/svg+xml,${encodeURIComponent(`
                  <svg width="60" height="60" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="checkerboard" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                        <rect x="0" y="0" width="5" height="5" fill="#333"/>
                        <rect x="5" y="5" width="5" height="5" fill="#333"/>
                        <rect x="5" y="0" width="5" height="5" fill="#666"/>
                        <rect x="0" y="5" width="5" height="5" fill="#666"/>
                      </pattern>
                    </defs>
                    <rect width="60" height="60" fill="url(#checkerboard)"/>
                  </svg>
                `)})`
              }}>
                <div className="filter-icon">{filter.icon}</div>
              </div>
              {isActive && (
                <div className="filter-name">{filter.name}</div>
              )}
            </div>
          );
        })}

        {/* Particle trail effect */}
        {isDragging && (
          <div className="particle-trail" style={{
            transform: `rotate(${rotation}deg)`
          }}>
            {[...Array(20)].map((_, i) => (
              <div 
                key={i} 
                className="particle" 
                style={{
                  transform: `rotate(${i * 18}deg) translateY(-200px)`,
                  animationDelay: `${i * 0.05}s`
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Navigation Hints */}
      <div className="wheel-navigation-hints">
        <div className="glass-panel">
          <div className="hint">← → Arrow keys to navigate</div>
          <div className="hint">Drag to spin • R for random</div>
        </div>
      </div>

      {/* Category Sections */}
      <div className="category-sections">
        {['vintage', 'digital', 'artistic', 'modern'].map((category, index) => (
          <div 
            key={category}
            className="category-section"
            style={{ 
              transform: `rotate(${index * 90}deg)`,
              '--category-color': `var(--${category}-color)`
            }}
            onClick={() => {
              const categoryFilter = filters.find(f => f.category === category);
              if (categoryFilter) {
                const targetIndex = filters.findIndex(f => f.id === categoryFilter.id);
                setRotation(targetIndex * anglePerFilter);
                onFilterChange(categoryFilter);
              }
            }}
          >
            <div className="category-label">{category.toUpperCase()}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterWheel;