import { useState, useEffect } from 'react';
import { 
  Annotorious, 
  OpenSeadragonAnnotator,
  OpenSeadragonViewer,
  W3CImageFormat 
} from '@annotorious/react';
import { ChevronRight, ChevronLeft, Save, Image as ImageIcon, Folder } from 'lucide-react';
import { MetadataSidebar } from './MetadataSidebar';
import { fetchAssetMetadata } from '../services/metadataService';
import { saveToXMP, loadFromXMP } from '../services/xmpService';
import '@annotorious/react/annotorious-react.css';
import { AlbumList } from './AlbumList';

const API_KEY = import.meta.env.VITE_API_KEY;

export function ImageViewer() {
  // Existing state
  const [assetId, setAssetId] = useState(null);
  const [drawingEnabled, setDrawingEnabled] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [metadataSidebarOpen, setMetadataSidebarOpen] = useState(true);
  
  // New state for album management
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [albumAssets, setAlbumAssets] = useState([]);
  const [albumSidebarOpen, setAlbumSidebarOpen] = useState(true);
  const [annotations, setAnnotations] = useState([]);
  const [saving, setSaving] = useState(false);

  // Load albums on mount
  useEffect(() => {
    const loadAlbums = async () => {
      try {
        const response = await fetch('/api/albums', {
          headers: {
            'X-Api-Key': API_KEY,
            'Accept': 'application/json'
          }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setAlbums(data);
      } catch (error) {
        console.error('Error loading albums:', error);
      }
    };
    loadAlbums();
  }, []);

  // Load album assets when album is selected
  useEffect(() => {
    if (!selectedAlbum) return;

    const loadAlbumAssets = async () => {
      try {
        const response = await fetch(`/api/albums/${selectedAlbum.id}`, {
          headers: {
            'X-Api-Key': API_KEY,
            'Accept': 'application/json'
          }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setAlbumAssets(data.assets || []);
      } catch (error) {
        console.error('Error loading album assets:', error);
      }
    };

    loadAlbumAssets();
  }, [selectedAlbum]);

  // Existing asset loading logic with added annotation loading
  useEffect(() => {
    if (!assetId) return;
    let currentUrl = null;

    const loadAsset = async () => {
      setLoading(true);
      try {
        // Load image
        const response = await fetch(`/api/assets/${assetId}/original`, {
          headers: {
            'X-Api-Key': API_KEY,
            'Accept': 'image/*'
          }
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const blob = await response.blob();
        currentUrl = URL.createObjectURL(blob);
        setImageUrl(currentUrl);

        // Load metadata and annotations
        const [metadataData, xmpData] = await Promise.all([
          fetchAssetMetadata(assetId, API_KEY),
          loadFromXMP(assetId, API_KEY)
        ]);

        setMetadata(metadataData);
        setAnnotations(xmpData.annotations || []);
      } catch (error) {
        console.error('Error loading asset:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAsset();

    return () => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
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
    homeFillsViewer: true
  };

  // Handler functions
  const handleMetadataChange = async (field, value) => {
    try {
      setMetadata(prev => ({
        ...prev,
        [field]: value
      }));
    } catch (error) {
      console.error('Error updating metadata:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveToXMP(assetId, metadata, annotations, API_KEY);
    } catch (error) {
      console.error('Error saving changes:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAnnotationCreated = (annotation) => {
    setAnnotations(prev => [...prev, annotation]);
  };

  const handleAnnotationUpdated = (annotation, previous) => {
    setAnnotations(prev => prev.map(a => a.id === previous.id ? annotation : a));
  };

  const handleAnnotationDeleted = (annotation) => {
    setAnnotations(prev => prev.filter(a => a.id !== annotation.id));
  };

  return (
    <div className="flex h-full w-full relative">
      {/* Album Sidebar */}
      <AlbumList 
        onAssetSelect={(asset) => setAssetId(asset.id)}
        selectedAssetId={assetId}
        apiKey={API_KEY}
      />

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0" 
        style={{ 
          marginRight: metadataSidebarOpen ? '320px' : '48px'
        }}
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between p-2 bg-gray-800 border-b border-gray-700">
          <button
            onClick={() => setDrawingEnabled(!drawingEnabled)}
            className={`px-4 py-2 rounded ${
              drawingEnabled ? 'bg-blue-500 text-white' : 'bg-gray-600 hover:bg-gray-500 text-white'
            }`}
          >
            {drawingEnabled ? 'Stop Drawing' : 'Start Drawing'}
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded flex items-center"
          >
            <Save className="mr-2" size={16} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Viewer Container */}
        <div className="flex-grow relative min-h-0">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
              <span className="text-white">Loading...</span>
            </div>
          ) : (
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
                annotations={annotations}
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
          )}
        </div>
      </div>

      {/* Metadata Sidebar */}
      <MetadataSidebar 
        metadata={metadata} 
        onMetadataChange={handleMetadataChange}
        loading={loading}
        isOpen={metadataSidebarOpen}
        onToggle={setMetadataSidebarOpen}
      />
    </div>
  );
}
