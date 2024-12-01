import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Folder, Image as ImageIcon, Menu } from 'lucide-react';
import PropTypes from 'prop-types';

export function AlbumList({ onAssetSelect, selectedAssetId, apiKey }) {
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [albumAssets, setAlbumAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoadingAlbums, setIsLoadingAlbums] = useState(false);

  // Load albums on mount with debounce
  useEffect(() => {
    let mounted = true;

    const loadAlbums = async () => {
      // Prevent multiple simultaneous calls
      if (isLoadingAlbums) return;
      
      setIsLoadingAlbums(true);
      setLoading(true);
      
      try {
        const response = await fetch('/api/albums', {
          headers: {
            'X-Api-Key': apiKey,
            'Accept': 'application/json'
          },
          // Add cache control headers
          cache: 'force-cache'
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        if (mounted) {
          setAlbums(data);
        }
      } catch (error) {
        console.error('Error loading albums:', error);
        if (mounted) {
          setError('Failed to load albums');
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setIsLoadingAlbums(false);
        }
      }
    };

    loadAlbums();

    return () => {
      mounted = false;
    };
  }, [apiKey]); // Only depend on apiKey

  // Load album assets with debounce
  useEffect(() => {
    if (!selectedAlbum) return;

    let mounted = true;
    const controller = new AbortController();

    const loadAlbumAssets = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/albums/${selectedAlbum.id}`, {
          headers: {
            'X-Api-Key': apiKey,
            'Accept': 'application/json'
          },
          signal: controller.signal,
          cache: 'force-cache'
        });

        if (!response.ok) {
          throw new Error(`Failed to load album assets: ${response.status}`);
        }

        const data = await response.json();
        if (mounted) {
          // Filter out non-image assets and trashed/archived items
          const validAssets = (data.assets || []).filter(asset => 
            asset.type === 'IMAGE' && !asset.isTrashed && !asset.isArchived
          );
          setAlbumAssets(validAssets);
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          return; // Ignore abort errors
        }
        console.error('Error loading album assets:', err);
        if (mounted) {
          setError('Failed to load album assets');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadAlbumAssets();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [selectedAlbum, apiKey]);

  // Handle album selection
  const handleAlbumClick = (album) => {
    setSelectedAlbum(album);
    setAlbumAssets([]); // Clear current assets while loading new ones
  };

  return (
    
<div 
  className={`flex-none transition-all duration-300 bg-gray-800 border-r border-gray-700
    ${sidebarOpen ? 'w-64' : 'w-12'}`}
>
  <div className="flex h-full flex-col">
    {/* Sidebar Header */}
    <div className="flex items-center justify-center p-4 border-b border-gray-700">
      {sidebarOpen && <h2 className="text-lg font-semibold text-white">Albums</h2>}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)} 
        className={`text-gray-400 hover:text-white transition-all duration-300
          ${sidebarOpen ? '' : 'w-12 h-12 flex items-center justify-center'}`}
      >
        {sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
      </button>
    </div>

        {sidebarOpen && (
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Albums List */}
            <div className="flex-none p-4 overflow-y-auto">
              <h3 className="text-sm font-medium text-gray-400 uppercase mb-2">Albums</h3>
              {loading && !albums.length ? (
                <div className="text-gray-400">Loading albums...</div>
              ) : error ? (
                <div className="text-red-400">{error}</div>
              ) : (
                <div className="space-y-1">
                  {albums.map(album => (
                    <button
                      key={album.id}
                      onClick={() => handleAlbumClick(album)}
                      className={`w-full flex items-center p-2 rounded text-left 
                        ${selectedAlbum?.id === album.id ? 'bg-blue-600' : 'hover:bg-gray-800'}`}
                    >
                      <Folder size={16} className="mr-2 flex-shrink-0" />
                      <span className="text-white truncate">{album.albumName}</span>
                      <span className="ml-auto text-xs text-gray-400">
                        {album.assetCount}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Assets Grid */}
            {selectedAlbum && (
              <div className="flex-1 border-t border-gray-700 p-4 overflow-y-auto">
                <h3 className="text-sm font-medium text-gray-400 uppercase mb-2">
                  {selectedAlbum.albumName} Assets
                </h3>
                {loading ? (
                  <div className="text-gray-400">Loading assets...</div>
                ) : error ? (
                  <div className="text-red-400">{error}</div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {albumAssets.map(asset => (
                      <button
                        key={asset.id}
                        onClick={() => onAssetSelect(asset)}
                        className={`relative aspect-square rounded overflow-hidden
                          ${selectedAssetId === asset.id ? 'ring-2 ring-blue-500' : ''}`}
                      >
                        <img
                          src={`/api/assets/${asset.id}/thumbnail`}
                          alt={asset.originalFileName}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

AlbumList.propTypes = {
    onAssetSelect: PropTypes.func.isRequired,
    selectedAssetId: PropTypes.string,
    apiKey: PropTypes.string.isRequired
  };