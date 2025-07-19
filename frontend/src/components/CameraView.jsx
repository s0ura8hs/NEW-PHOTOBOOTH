import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import './CameraView.css';

const CameraView = forwardRef(({ currentFilter, cameraSettings, onCapture }, ref) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [devices, setDevices] = useState([]);
  const [currentDeviceId, setCurrentDeviceId] = useState(null);
  const [flashEffect, setFlashEffect] = useState(false);

  useImperativeHandle(ref, () => ({
    capturePhoto,
    switchCamera
  }));

  const initializeCamera = async (deviceId = null) => {
    try {
      setIsLoading(true);
      setError(null);

      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          frameRate: { ideal: 30 },
          facingMode: !deviceId ? 'user' : undefined,
          deviceId: deviceId ? { exact: deviceId } : undefined
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setIsLoading(false);
        };
      }

      // Get available devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
      
      if (!deviceId && videoDevices.length > 0) {
        setCurrentDeviceId(videoDevices[0].deviceId);
      }

    } catch (err) {
      console.error('Camera access error:', err);
      setError(err.name === 'NotAllowedError' 
        ? 'Camera access denied. Please allow camera permissions.' 
        : 'Camera not available. Please check your device.');
      setIsLoading(false);
    }
  };

  const switchCamera = async () => {
    if (devices.length <= 1) return;
    
    const currentIndex = devices.findIndex(device => device.deviceId === currentDeviceId);
    const nextIndex = (currentIndex + 1) % devices.length;
    const nextDevice = devices[nextIndex];
    
    setCurrentDeviceId(nextDevice.deviceId);
    await initializeCamera(nextDevice.deviceId);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas dimensions to video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Save the context state
    ctx.save();
    
    // Apply camera settings transformations
    const zoom = cameraSettings.zoom;
    const exposure = cameraSettings.exposure;
    
    // Apply zoom (scale and translate to keep center)
    if (zoom > 1) {
      const scale = zoom;
      const offsetX = (canvas.width * (scale - 1)) / 2;
      const offsetY = (canvas.height * (scale - 1)) / 2;
      
      ctx.scale(scale, scale);
      ctx.translate(-offsetX / scale, -offsetY / scale);
    }

    // Apply exposure (brightness adjustment)
    const brightness = 1 + (exposure * 0.3); // -2 to +2 EV becomes 0.4 to 1.6 brightness
    ctx.filter = `brightness(${brightness})`;

    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Restore context state
    ctx.restore();

    // Apply additional filter effects
    applyFilterToCanvas(ctx, canvas.width, canvas.height, currentFilter);

    // Convert to image data
    const imageData = canvas.toDataURL('image/jpeg', 0.95);
    
    // Flash effect
    setFlashEffect(true);
    setTimeout(() => setFlashEffect(false), 200);
    
    onCapture(imageData);
  };

  const applyFilterToCanvas = (ctx, width, height, filter) => {
    if (!filter || filter.id === 'original') return;

    // Get image data for pixel manipulation
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Apply filter based on type
    switch (filter.category) {
      case 'vintage':
        applyVintageFilter(data, filter);
        break;
      case 'digital':
        applyDigitalFilter(data, filter);
        break;
      case 'artistic':
        applyArtisticFilter(data, filter);
        break;
      case 'modern':
        applyModernFilter(data, filter);
        break;
      default:
        break;
    }

    // Put the modified image data back
    ctx.putImageData(imageData, 0, 0);
  };

  const applyVintageFilter = (data, filter) => {
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Different vintage effects based on filter ID
      switch (filter.id) {
        case 'kodak':
          // Warm, enhanced reds
          r = Math.min(255, r * 1.2);
          g = Math.min(255, g * 1.1);
          b = Math.min(255, b * 0.9);
          break;
        case '90s':
          // High saturation, slight green tint
          const avg = (r + g + b) / 3;
          r = avg + (r - avg) * 1.3;
          g = avg + (g - avg) * 1.4;
          b = avg + (b - avg) * 1.2;
          break;
        case 'vhs':
          // Reduced contrast, color bleeding
          r = r * 0.8 + 40;
          g = g * 0.8 + 30;
          b = b * 0.8 + 50;
          break;
        default:
          // Generic vintage: warm, slightly desaturated
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          r = gray * 0.4 + r * 0.6 + 20;
          g = gray * 0.4 + g * 0.6 + 10;
          b = gray * 0.4 + b * 0.6;
          break;
      }

      data[i] = Math.max(0, Math.min(255, r));
      data[i + 1] = Math.max(0, Math.min(255, g));
      data[i + 2] = Math.max(0, Math.min(255, b));
    }
  };

  const applyDigitalFilter = (data, filter) => {
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      switch (filter.id) {
        case '4s':
          // iPhone 4S style: cooler tones
          r = r * 0.9;
          g = g * 1.0;
          b = b * 1.1;
          break;
        case 'dv':
          // Digital video artifacts
          r = Math.floor(r / 16) * 16;
          g = Math.floor(g / 16) * 16;
          b = Math.floor(b / 16) * 16;
          break;
        default:
          // Generic digital processing
          const contrast = 1.2;
          r = ((r - 128) * contrast) + 128;
          g = ((g - 128) * contrast) + 128;
          b = ((b - 128) * contrast) + 128;
          break;
      }

      data[i] = Math.max(0, Math.min(255, r));
      data[i + 1] = Math.max(0, Math.min(255, g));
      data[i + 2] = Math.max(0, Math.min(255, b));
    }
  };

  const applyArtisticFilter = (data, filter) => {
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      switch (filter.id) {
        case 'chill':
          // Lifted blacks, reduced saturation
          const avg = (r + g + b) / 3;
          r = avg * 0.3 + r * 0.7 + 20;
          g = avg * 0.3 + g * 0.7 + 20;
          b = avg * 0.3 + b * 0.7 + 20;
          break;
        case 'golden':
          // Golden hour warmth
          r = Math.min(255, r * 1.3);
          g = Math.min(255, g * 1.2);
          b = b * 0.8;
          break;
        default:
          // Generic artistic enhancement
          const saturation = 1.5;
          const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
          r = luminance + saturation * (r - luminance);
          g = luminance + saturation * (g - luminance);
          b = luminance + saturation * (b - luminance);
          break;
      }

      data[i] = Math.max(0, Math.min(255, r));
      data[i + 1] = Math.max(0, Math.min(255, g));
      data[i + 2] = Math.max(0, Math.min(255, b));
    }
  };

  const applyModernFilter = (data, filter) => {
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      switch (filter.id) {
        case 'coquette-pink':
          // Soft pink tones
          r = Math.min(255, r * 1.1 + 15);
          g = Math.min(255, g * 1.0 + 5);
          b = Math.min(255, b * 1.1 + 10);
          break;
        case 'dark-academia':
          // Desaturated browns
          const sepia = (r * 0.393) + (g * 0.769) + (b * 0.189);
          r = Math.min(255, sepia * 0.8);
          g = Math.min(255, sepia * 0.7);
          b = Math.min(255, sepia * 0.6);
          break;
        default:
          // Generic modern enhancement
          r = r * 1.1;
          g = g * 1.1;
          b = b * 1.1;
          break;
      }

      data[i] = Math.max(0, Math.min(255, r));
      data[i + 1] = Math.max(0, Math.min(255, g));
      data[i + 2] = Math.max(0, Math.min(255, b));
    }
  };

  // Apply real-time settings to video element
  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      const zoom = cameraSettings.zoom;
      const exposure = cameraSettings.exposure;
      
      // Apply zoom transform
      video.style.transform = zoom > 1 ? `scale(${zoom})` : 'scale(1)';
      
      // Apply exposure as brightness filter
      const brightness = 1 + (exposure * 0.3);
      const filterStr = currentFilter && currentFilter.cssFilter ? 
        `${currentFilter.cssFilter} brightness(${brightness})` : 
        `brightness(${brightness})`;
      
      video.style.filter = filterStr;
    }
  }, [cameraSettings, currentFilter]);

  useEffect(() => {
    initializeCamera();

    // Handle keyboard shortcuts
    const handleKeyPress = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        capturePhoto();
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  return (
    <div className="camera-view">
      <div className="camera-container">
        {isLoading && (
          <div className="camera-loading">
            <div className="loading-spinner"></div>
            <p className="loading-text">Accessing camera...</p>
          </div>
        )}
        
        {error && (
          <div className="camera-error">
            <div className="error-icon">📷</div>
            <p className="error-message">{error}</p>
            <button onClick={() => initializeCamera()} className="retry-button">
              Retry
            </button>
          </div>
        )}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="camera-video"
        />

        <canvas
          ref={canvasRef}
          className="capture-canvas"
        />

        {/* Camera switch button */}
        {devices.length > 1 && !isLoading && !error && (
          <button 
            className="camera-switch-btn"
            onClick={switchCamera}
            title="Switch Camera"
          >
            🔄
          </button>
        )}

        {/* Flash overlay */}
        {flashEffect && <div className="flash-overlay"></div>}

        {/* Filter name overlay */}
        {!isLoading && !error && (
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
        )}
      </div>
    </div>
  );
});

export default CameraView;