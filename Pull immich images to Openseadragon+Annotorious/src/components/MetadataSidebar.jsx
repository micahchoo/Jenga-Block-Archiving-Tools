import { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import MetadataSection from './MetadataSection';
import MetadataField from './MetadataField';
import PropTypes from 'prop-types';

export const MetadataSidebar = ({ metadata, onMetadataChange, onSave, loading, saving, error }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const getValue = (obj, key) => {
    if (!obj) return '';
    return obj[key] || '';
  };

  return (
    <div 
      className={`flex-none relative transition-all duration-300 
        bg-gray-900 border-l border-gray-700
        ${sidebarOpen ? 'w-80' : 'w-12'}`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute left-0 top-1/2 -translate-x-6 -translate-y-1/2
          bg-gray-900 p-2 border border-gray-700 border-r-0 rounded-l-md 
          hover:bg-gray-800 z-10"
      >
        {sidebarOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Sidebar Content */}
      {sidebarOpen && (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex-none p-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">Metadata</h2>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {loading ? (
              <div className="text-gray-400">Loading metadata...</div>
            ) : metadata ? (
              <>
                <MetadataSection title="Basic Info">
                  <MetadataField
                    label="Title"
                    value={getValue(metadata, 'title')}
                    onChange={(value) => onMetadataChange('title', value)}
                  />
                  <MetadataField
                    label="Description"
                    value={getValue(metadata, 'description')}
                    onChange={(value) => onMetadataChange('description', value)}
                    multiline
                  />
                  <MetadataField
                    label="File Type"
                    value={`${getValue(metadata, 'type')} (${getValue(metadata, 'mimeType')})`}
                    readonly
                  />
                  <MetadataField
                    label="File Size"
                    value={getValue(metadata, 'fileSize')}
                    readonly
                  />
                </MetadataSection>

                <MetadataSection title="Dates">
                  <MetadataField
                    label="Created"
                    value={getValue(metadata, 'dateCreated')}
                    type="datetime-local"
                    onChange={(value) => onMetadataChange('dateCreated', value)}
                  />
                  <MetadataField
                    label="Modified"
                    value={getValue(metadata, 'dateModified')}
                    type="datetime-local"
                    readonly
                  />
                </MetadataSection>

                <MetadataSection title="Location">
                  <MetadataField
                    label="City"
                    value={getValue(metadata.location, 'city')}
                    onChange={(value) => onMetadataChange('location.city', value)}
                  />
                  <MetadataField
                    label="State"
                    value={getValue(metadata.location, 'state')}
                    onChange={(value) => onMetadataChange('location.state', value)}
                  />
                  <MetadataField
                    label="Country"
                    value={getValue(metadata.location, 'country')}
                    onChange={(value) => onMetadataChange('location.country', value)}
                  />
                  <MetadataField
                    label="Coordinates"
                    value={getValue(metadata.location, 'coordinates')}
                    readonly
                  />
                </MetadataSection>

                <MetadataSection title="Camera Information">
                  <MetadataField
                    label="Make"
                    value={getValue(metadata.camera, 'make')}
                    readonly
                  />
                  <MetadataField
                    label="Model"
                    value={getValue(metadata.camera, 'model')}
                    readonly
                  />
                  <MetadataField
                    label="Lens"
                    value={getValue(metadata.camera, 'lens')}
                    readonly
                  />
                </MetadataSection>

                <MetadataSection title="Technical Details">
                  <MetadataField
                    label="Dimensions"
                    value={getValue(metadata.technical, 'dimensions')}
                    readonly
                  />
                  <MetadataField
                    label="Orientation"
                    value={getValue(metadata.technical, 'orientation')}
                    readonly
                  />
                  <MetadataField
                    label="Focal Length"
                    value={getValue(metadata.technical, 'focalLength')}
                    readonly
                  />
                  <MetadataField
                    label="ISO"
                    value={getValue(metadata.technical, 'iso')}
                    readonly
                  />
                  <MetadataField
                    label="Exposure Time"
                    value={getValue(metadata.technical, 'exposureTime')}
                    readonly
                  />
                  <MetadataField
                    label="F-Number"
                    value={getValue(metadata.technical, 'fNumber')}
                    readonly
                  />
                </MetadataSection>

                <MetadataSection title="Other">
                  <MetadataField
                    label="Rating"
                    value={metadata.rating.toString()}
                    type="number"
                    onChange={(value) => onMetadataChange('rating', value)}
                  />
                  <MetadataField
                    label="Tags"
                    value={(metadata.tags || []).join(', ')}
                    onChange={(value) => onMetadataChange('tags', value.split(',').map(t => t.trim()))}
                  />
                  <MetadataField
                    label="Time Zone"
                    value={getValue(metadata, 'timeZone')}
                    readonly
                  />
                </MetadataSection>
              </>
            ) : (
              <div className="text-gray-400">No metadata available</div>
            )}
          </div>

          {/* Footer with Save Button */}
          <div className="flex-none p-4 border-t border-gray-700">
            {error && (
              <div className="mb-2 text-sm text-red-500">
                {error}
              </div>
            )}
            <button
              onClick={onSave}
              disabled={saving}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 
                text-white rounded-md transition-colors disabled:opacity-50
                disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

MetadataSidebar.propTypes = {
  metadata: PropTypes.shape({
    title: PropTypes.string,
    type: PropTypes.string,
    mimeType: PropTypes.string,
    fileSize: PropTypes.string,
    dateCreated: PropTypes.string,
    dateModified: PropTypes.string,
    location: PropTypes.shape({
      city: PropTypes.string,
      state: PropTypes.string,
      country: PropTypes.string,
      coordinates: PropTypes.string
    }),
    camera: PropTypes.shape({
      make: PropTypes.string,
      model: PropTypes.string,
      lens: PropTypes.string
    }),
    technical: PropTypes.shape({
      dimensions: PropTypes.string,
      orientation: PropTypes.string,
      focalLength: PropTypes.string,
      iso: PropTypes.string,
      exposureTime: PropTypes.string,
      fNumber: PropTypes.string
    }),
    description: PropTypes.string,
    rating: PropTypes.number,
    tags: PropTypes.arrayOf(PropTypes.string),
    timeZone: PropTypes.string
  }),
  onMetadataChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  saving: PropTypes.bool,
  error: PropTypes.string
};