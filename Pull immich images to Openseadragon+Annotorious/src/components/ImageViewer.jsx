import React, { useState, useEffect } from 'react';
import { 
  Annotorious, 
  OpenSeadragonAnnotator,
  OpenSeadragonViewer,
  W3CImageFormat 
} from '@annotorious/react';
import '@annotorious/react/annotorious-react.css';

const API_KEY = import.meta.env.VITE_API_KEY;

export function ImageViewer() {
  const [assetId, setAssetId] = useState(null);
  const [drawingEnabled, setDrawingEnabled] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  // Get asset ID from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
      setAssetId(id);
      console.log('Asset ID set to:', id);
    }
  }, []);

  // Load image when asset ID changes
  useEffect(() => {
    if (!assetId) return;

    const loadImage = async () => {
      try {
        const response = await fetch(`/api/assets/${assetId}/original`, {
          headers: {
            'X-Api-Key': API_KEY,
            'Accept': 'application/octet-stream'
          }
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
        console.log('Image loaded successfully');
      } catch (error) {
        console.error('Error loading image:', error);
      }
    };

    loadImage();
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [assetId]);

  // OpenSeadragon configuration
  const osdOptions = {
    prefixUrl: "https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.0/images/",
    tileSources: imageUrl ? {
      type: 'image',
      url: imageUrl
    } : null,
    showNavigator: true,
    navigatorPosition: 'BOTTOM_RIGHT',
    defaultZoomLevel: 1,
    minZoomLevel: 0.1,
    maxZoomLevel: 10,
    constrainDuringPan: true,
    visibilityRatio: 1,
    navigationControlAnchor: 'TOP_LEFT',
    homeFillsViewer: true,
    viewportMargins: {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0
    }
  };

  // Annotation style
  const annotationStyle = {
    fill: '#ff0000',
    fillOpacity: 0.25,
    stroke: '#ff0000'
  };

  const handleAnnotationCreated = (annotation) => {
    console.log('Annotation created:', annotation);
  };

  const handleAnnotationUpdated = (annotation, previous) => {
    console.log('Annotation updated:', annotation, 'Previous:', previous);
  };

  const handleAnnotationDeleted = (annotation) => {
    console.log('Annotation deleted:', annotation);
  };


  if (!assetId) return <div>No asset ID provided</div>;

  return (
    <div className="flex flex-col w-full h-full">
      {/* Toolbar */}
      <div className="flex items-center p-2 bg-gray-800 border-b border-gray-700">
        <button
          onClick={() => setDrawingEnabled(!drawingEnabled)}
          className={`px-4 py-2 rounded ${
            drawingEnabled ? 'bg-blue-500 text-white' : 'bg-gray-600 hover:bg-gray-500 text-white'
          }`}
        >
          {drawingEnabled ? 'Stop Drawing' : 'Start Drawing'}
        </button>
      </div>

      {/* Main Content */}
      <div className="relative flex-1 w-full overflow-hidden">
        <Annotorious>
          <OpenSeadragonAnnotator 
            adapter={W3CImageFormat(assetId)}
            drawingEnabled={drawingEnabled}
            tool="rectangle"
            style={{
              fill: '#ff0000',
              fillOpacity: 0.25,
              stroke: '#ff0000'
            }}
            onAnnotationCreated={handleAnnotationCreated}
            onAnnotationUpdated={handleAnnotationUpdated}
            onAnnotationDeleted={handleAnnotationDeleted}
          >
            {imageUrl && (
              <OpenSeadragonViewer 
                options={osdOptions}
                className="w-full h-full !absolute inset-0"
              />
            )}
          </OpenSeadragonAnnotator>
        </Annotorious>
      </div>
    </div>
  );
}
