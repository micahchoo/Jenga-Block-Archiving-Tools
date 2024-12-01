// services/metadataService.js
const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  try {
    // Convert to local date-time format for input[type="datetime-local"]
    const date = new Date(dateStr);
    return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
  } catch (e) {
    console.error('Error formatting date:', e);
    return dateStr;
  }
};

export const fetchAssetMetadata = async (assetId, apiKey) => {
  try {
    console.log('Fetching metadata for asset:', assetId);
    
    const response = await fetch(`/api/assets/${assetId}`, {
      headers: {
        'X-Api-Key': apiKey,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Parsed metadata:', data);

    // Transform the data into a more user-friendly format
    const metadata = {
      // File Information
      title: data.originalFileName || '',
      type: data.type || '',
      mimeType: data.originalMimeType || '',
      fileSize: data.exifInfo?.fileSizeInByte 
        ? `${(data.exifInfo.fileSizeInByte / 1024 / 1024).toFixed(2)} MB` 
        : '',

      // Dates
      dateCreated: formatDateTime(data.exifInfo?.dateTimeOriginal || data.fileCreatedAt),
      dateModified: formatDateTime(data.exifInfo?.modifyDate || data.fileModifiedAt),
      
      // Location
      location: {
        city: data.exifInfo?.city || '',
        state: data.exifInfo?.state || '',
        country: data.exifInfo?.country || '',
        coordinates: data.exifInfo?.latitude 
          ? `${data.exifInfo.latitude}, ${data.exifInfo.longitude}` 
          : ''
      },

      // Camera Info
      camera: {
        make: data.exifInfo?.make || '',
        model: data.exifInfo?.model || '',
        lens: data.exifInfo?.lensModel || ''
      },

      // Technical Details
      technical: {
        dimensions: data.exifInfo ? 
          `${data.exifInfo.exifImageWidth} × ${data.exifInfo.exifImageHeight}` : '',
        orientation: data.exifInfo?.orientation || '',
        focalLength: data.exifInfo?.focalLength ? `${data.exifInfo.focalLength}mm` : '',
        iso: data.exifInfo?.iso || '',
        exposureTime: data.exifInfo?.exposureTime || '',
        fNumber: data.exifInfo?.fNumber ? `f/${data.exifInfo.fNumber}` : ''
      },

      // Other Metadata
      description: data.exifInfo?.description || '',
      rating: data.exifInfo?.rating || 0,
      tags: data.tags || [],
      timeZone: data.exifInfo?.timeZone || '',
      checksum: data.checksum || '',
      
      // Flags
      isArchived: data.isArchived || false,
      isFavorite: data.isFavorite || false,
      hasMetadata: data.hasMetadata || false
    };

    console.log('Processed metadata:', metadata);
    return metadata;
  } catch (error) {
    console.error('Error fetching metadata:', error);
    throw error;
  }
};