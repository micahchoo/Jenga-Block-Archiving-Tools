// Import required Node.js modules
import fetch from 'node-fetch';              // For making HTTP requests
import { promises as fs } from 'fs';         // For file system operations (async version)
import path from 'path';                     // For handling file paths
import { fileURLToPath } from 'url';         // For converting file URLs to paths

// Convert ESM module URL to file path (required for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Application configuration
const config = {
  baseUrl: 'http://localhost:3000',          // URL of the proxy server
  apiKey: 'zHMkwg86oQRLwoa2LCPD5Be2Yqv4es1TVZwWWpxRhAw',  // Immich API key
  assetId: '9afd7b3a-7236-4e43-82e9-0d9a1473db5b'         // Test image ID
};

/**
 * Fetches asset information from the Immich API
 * @param {string} assetId - The ID of the asset to fetch
 * @returns {Promise<Object>} The asset information
 * @throws {Error} If the API request fails
 */
async function getAssetInfo(assetId) {
  const response = await fetch(`${config.baseUrl}/api/assets/${assetId}`, {
    headers: {
      'Accept': 'application/json',
      'x-api-key': config.apiKey
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to get asset info: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Updates an asset's metadata to include an edit link
 * @param {string} assetId - The ID of the asset to update
 * @returns {Promise<Object>} The updated asset information
 * @throws {Error} If the update fails
 */
async function updateAssetMetadata(assetId) {
  console.log('\n✏️ Checking current metadata...');
  
  // Fetch the current state of the asset
  const asset = await getAssetInfo(assetId);
  const currentDescription = asset.exifInfo?.description || '';
  
  // Create the metadata edit link with special tags
  const metadataUrl = `http://localhost:3000/edit?id=${assetId}`;
  const metadataTag = `[Link to add metadata to this image]${metadataUrl}[/]`;
  
  // Skip update if metadata link already exists
  if (currentDescription.includes('[metadata-edit]')) {
    console.log('Metadata link already exists. Current description:', currentDescription);
    return asset;
  }

  // Preserve existing description when adding new link
  const newDescription = currentDescription ? 
    `${currentDescription}\n\n${metadataTag}` : // Add link on new line if description exists
    metadataTag;                                // Use just the link if no description

  console.log('Updating description to:', newDescription);

  // Send update request to the API
  const response = await fetch(`${config.baseUrl}/api/assets/${assetId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-api-key': config.apiKey
    },
    body: JSON.stringify({
      description: newDescription
    })
  });

  // Handle API errors
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update asset: ${response.status} ${response.statusText}\n${errorText}`);
  }

  // Parse and return the updated asset data
  const result = await response.json();
  console.log('Update successful! New description:', result.exifInfo.description);
  return result;
}

/**
 * Main function that runs the metadata update process
 * Handles errors and provides status feedback
 */
async function main() {
  try {
    console.log('🚀 Testing metadata update...');
    await updateAssetMetadata(config.assetId);
    console.log('\n✅ Test completed successfully!');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);  // Exit with error code if update fails
  }
}

// Start the script
main();