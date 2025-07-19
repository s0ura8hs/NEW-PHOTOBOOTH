export const templates = [
  {
    id: 'classic-strip',
    name: 'Classic Photo Booth Strip',
    description: 'Traditional 4-photo vertical strip with minimal spacing',
    className: 'classic-strip',
    photoCount: 4,
    dimensions: '2" x 8"',
    width: 400,
    height: 1600,
    textAreas: [
      {
        className: 'bottom-text',
        placeholder: 'Date • Event Name'
      }
    ],
    decorativeElements: []
  },
  
  {
    id: 'scrapbook-grid',
    name: 'Scrapbook Style Grid',
    description: 'Playful 6-photo arrangement with colorful decorations',
    className: 'scrapbook-grid',
    photoCount: 6,
    dimensions: '8" x 10"',
    width: 800,
    height: 1000,
    textAreas: [
      {
        className: 'title-text',
        placeholder: 'Fun Times!'
      },
      {
        className: 'caption-text',
        placeholder: 'Caption here...'
      }
    ],
    decorativeElements: [
      {
        className: 'star-decoration',
        content: '⭐',
        style: { top: '10px', right: '10px' }
      },
      {
        className: 'heart-decoration',
        content: '💖',
        style: { bottom: '10px', left: '10px' }
      },
      {
        className: 'flower-decoration',
        content: '🌸',
        style: { top: '50%', left: '10px' }
      }
    ]
  },
  
  {
    id: 'magazine-collage',
    name: 'Magazine Collage',
    description: 'Professional layout with feature photo and accent images',
    className: 'magazine-collage',
    photoCount: 5,
    dimensions: '11" x 14"',
    width: 1100,
    height: 1400,
    textAreas: [
      {
        className: 'headline-text',
        placeholder: 'HEADLINE TEXT'
      },
      {
        className: 'subtitle-text',
        placeholder: 'Subtitle goes here'
      }
    ],
    decorativeElements: []
  },
  
  {
    id: 'polaroid-collection',
    name: 'Polaroid Collection',
    description: 'Scattered polaroid-style photos with natural rotation',
    className: 'polaroid-collection',
    photoCount: 4,
    dimensions: '10" x 8"',
    width: 1000,
    height: 800,
    textAreas: [
      {
        className: 'date-text',
        placeholder: 'Summer 2025'
      }
    ],
    decorativeElements: [
      {
        className: 'tape-decoration',
        content: '',
        style: { 
          background: 'rgba(255,255,255,0.8)',
          width: '60px',
          height: '20px',
          transform: 'rotate(-15deg)'
        }
      }
    ]
  },
  
  {
    id: 'birthday-celebration',
    name: 'Birthday Celebration',
    description: 'Festive layout with birthday-themed decorations',
    className: 'birthday-celebration',
    photoCount: 6,
    dimensions: '8" x 10"',
    width: 800,
    height: 1000,
    textAreas: [
      {
        className: 'birthday-title',
        placeholder: 'Happy Birthday!'
      },
      {
        className: 'birthday-date',
        placeholder: 'Date & Age'
      }
    ],
    decorativeElements: [
      {
        className: 'balloon-decoration',
        content: '🎈',
        style: { top: '20px', left: '20px' }
      },
      {
        className: 'cake-decoration',
        content: '🎂',
        style: { top: '20px', right: '20px' }
      },
      {
        className: 'confetti-decoration',
        content: '🎉',
        style: { bottom: '20px', left: '50%' }
      },
      {
        className: 'party-hat-decoration',
        content: '🎩',
        style: { bottom: '20px', right: '20px' }
      }
    ]
  },
  
  {
    id: 'wedding-formal',
    name: 'Wedding/Event Formal',
    description: 'Elegant layout perfect for weddings and formal events',
    className: 'wedding-formal',
    photoCount: 4,
    dimensions: '8" x 12"',
    width: 800,
    height: 1200,
    textAreas: [
      {
        className: 'event-title',
        placeholder: 'Wedding Day'
      },
      {
        className: 'couple-names',
        placeholder: 'Names'
      },
      {
        className: 'event-date',
        placeholder: 'Date & Venue'
      }
    ],
    decorativeElements: [
      {
        className: 'border-decoration',
        content: '',
        style: { 
          border: '2px solid #d4af37',
          position: 'absolute',
          top: '10px',
          left: '10px',
          right: '10px',
          bottom: '10px',
          pointerEvents: 'none'
        }
      }
    ]
  },
  
  {
    id: 'travel-memory',
    name: 'Travel Memory',
    description: 'Adventure-themed postcard style layout',
    className: 'travel-memory',
    photoCount: 5,
    dimensions: '10" x 8"',
    width: 1000,
    height: 800,
    textAreas: [
      {
        className: 'location-title',
        placeholder: 'DESTINATION'
      },
      {
        className: 'travel-date',
        placeholder: 'Date'
      },
      {
        className: 'travel-notes',
        placeholder: 'Travel notes...'
      }
    ],
    decorativeElements: [
      {
        className: 'compass-decoration',
        content: '🧭',
        style: { top: '20px', right: '20px' }
      },
      {
        className: 'map-decoration',
        content: '🗺️',
        style: { bottom: '20px', left: '20px' }
      },
      {
        className: 'stamp-decoration',
        content: '📮',
        style: { top: '50%', right: '50px' }
      }
    ]
  },
  
  {
    id: 'gradient-modern',
    name: 'Gradient Modern',
    description: 'Contemporary design with gradient backgrounds',
    className: 'gradient-modern',
    photoCount: 4,
    dimensions: '9" x 12"',
    width: 900,
    height: 1200,
    textAreas: [
      {
        className: 'modern-title',
        placeholder: 'MODERN'
      },
      {
        className: 'modern-subtitle',
        placeholder: 'Memories'
      }
    ],
    decorativeElements: [
      {
        className: 'gradient-overlay',
        content: '',
        style: { 
          background: 'linear-gradient(45deg, rgba(255,107,157,0.3), rgba(153,50,204,0.3))',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none'
        }
      }
    ]
  }
];