# Immich Metadata Editor Implementation Guide

## Project Overview 
This project creates a web-based metadata editor for Immich that lets users:
- Browse albums and assets
- View high-resolution images using OpenSeadragon
- Add annotations using Annotorious
- Edit and save metadata to XMP sidecar files

## Getting Started

### Prerequisites
- Node.js and npm installed
- Basic understanding of React and modern JavaScript
- Immich server running locally or remotely
- Your Immich API key (from Immich settings)

### Project Setup
1. Clone the repository:
```bash
git clone https://github.com/micahchoo/Jenga-Block-Archiving-Tools.git
cd "Immich Openseadragon Annotorious Metadata Editor"
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```
VITE_API_KEY=your_immich_api_key_here
```

## Component Structure

The application has three main sections:
1. Left Sidebar: Album/Asset browser
2. Center: Image viewer with annotation tools
3. Right Sidebar: Metadata editor

### Key Components

```
src/
├── components/
│   ├── AlbumList.jsx        # Left sidebar - Album and asset browsing
│   ├── ImageViewer.jsx      # Center - OpenSeadragon viewer with Annotorious
│   ├── MetadataSidebar.jsx  # Right sidebar - Metadata editing
│   ├── MetadataField.jsx    # Reusable metadata field component
│   └── MetadataSection.jsx  # Grouping component for metadata fields
├── services/
│   ├── metadataService.js   # Handle metadata fetching/updating
│   └── xmpService.js        # Handle XMP sidecar operations
```

## Implementation Steps

### 1. Album List Component (Left Sidebar)
- Start with `AlbumList.jsx`
- Load albums using Immich API `/api/albums`
- Display albums in a collapsible list
- When album selected, load and display its assets
- Enable asset selection to load in viewer

Key features to implement:
```jsx
// Example album loading
const loadAlbums = async () => {
  const response = await fetch('/api/albums', {
    headers: {
      'X-Api-Key': import.meta.env.VITE_API_KEY
    }
  });
  const albums = await response.json();
  setAlbums(albums);
};
```

### 2. Image Viewer Component (Center)
- Use OpenSeadragon for high-resolution image viewing
- Integrate Annotorious for annotation capabilities
- Handle loading selected assets
- Implement annotation tools

Key configuration:
```jsx
const osdOptions = {
  prefixUrl: "https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.0/images/",
  showNavigator: true,
  navigatorPosition: 'BOTTOM_RIGHT',
  // Additional OpenSeadragon options...
};
```

### 3. Metadata Sidebar Component (Right)
- Display editable and read-only metadata fields
- Group related metadata in collapsible sections
- Handle metadata updates
- Save changes to XMP sidecar

Structure metadata fields like:
```jsx
<MetadataSection title="Basic Info">
  <MetadataField
    label="Title"
    value={metadata.title}
    onChange={(value) => handleMetadataChange('title', value)}
  />
  {/* Additional fields... */}
</MetadataSection>
```

### 4. XMP Integration
- Create service to handle XMP sidecar operations
- Implement W3C Web Annotation format for annotations
- Save metadata changes to XMP
- Handle XMP reading/writing through Immich API

Example XMP structure:
```xml
<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF>
    <!-- Basic metadata -->
    <dc:title>Image Title</dc:title>
    <!-- Annotations in W3C format -->
    <anno:hasAnnotations>
      <!-- Annotation data -->
    </anno:hasAnnotations>
  </rdf:RDF>
</x:xmpmeta>
```

## Tips for Development

1. **State Management**
   - Use React's useState for component-level state
   - Consider useReducer for complex state logic
   - Keep state organized by component responsibility

2. **Error Handling**
   - Implement proper error boundaries
   - Show user-friendly error messages
   - Log errors for debugging

3. **Performance**
   - Implement pagination for large albums
   - Use debouncing for metadata saves
   - Lazy load components when possible

4. **Testing**
   - Test API integration
   - Verify metadata saving/loading
   - Check annotation creation/editing
   - Validate XMP format compliance

## Common Challenges

1. **CORS Issues**
   - Use the provided proxy server
   - Ensure proper headers in requests
   - Check server CORS configuration

2. **Image Loading**
   - Handle large image loading gracefully
   - Show loading states
   - Implement error recovery

3. **XMP Handling**
   - Validate XMP format
   - Preserve existing metadata
   - Handle concurrent edits

## Resources

- [Immich API Documentation](https://documentation.immich.app/docs/api)
- [OpenSeadragon Documentation](https://openseadragon.github.io/)
- [Annotorious React Documentation](https://annotorious.github.io/annotorious-react/)
- [W3C Web Annotation Data Model](https://www.w3.org/TR/annotation-model/)



# Plan: Metadata Sidebar & Annotation Storage

## A. Metadata Sidebar Implementation

### Phase 1: Basic Sidebar Structure
1. Create new sidebar component:
```javascript
// Components needed:
- MetadataSidebar.jsx (main container)
- MetadataField.jsx (reusable field component)
- MetadataSection.jsx (grouping component)
```

Testing milestone:
- [ ] Sidebar renders correctly
- [ ] Responsive layout works with OpenSeadragon viewer
- [ ] Basic show/hide functionality

### Phase 2: XMP Metadata Integration
1. Create XMP data fetching and parsing:
```javascript
// Services needed:
- xmpService.js (handling XMP read/write)
- metadataMapper.js (converting between formats)
```

2. Implement basic metadata display for core fields:
- Title
- Description
- Creator
- Creation Date
- Keywords/Tags

Testing milestone:
- [ ] XMP data successfully fetches via Immich API
- [ ] Data displays correctly in sidebar fields
- [ ] Basic field validation works

### Phase 3: Editable Fields
1. Implement field editing:
- Text fields
- Date fields
- Multi-value fields (tags)
- Dropdown fields

2. Add save functionality using Immich updateAsset endpoint

Testing milestone:
- [ ] Fields are editable with proper validation
- [ ] Changes save correctly to XMP via API
- [ ] UI provides feedback during save operations

## B. Annotation Storage in XMP

### Phase 1: W3C Annotation Format
1. Create annotation format converter:
```javascript
const convertToW3C = (annotation) => {
  return {
    "@context": "http://www.w3.org/ns/anno.jsonld",
    "type": "Annotation",
    "body": [{
      "type": "TextualBody",
      "value": annotation.body?.value || "",
      "purpose": "describing"
    }],
    "target": {
      "source": annotation.target.source,
      "selector": {
        "type": "FragmentSelector",
        "conformsTo": "http://www.w3.org/TR/media-frags/",
        "value": `xywh=${annotation.target.selector.geometry}`
      }
    }
  };
};
```

Testing milestone:
- [ ] Annotations correctly convert to W3C format
- [ ] Geometry calculations are accurate
- [ ] Format validates against W3C schema

### Phase 2: XMP Integration
1. Create XMP annotation section handler:
```javascript
// Handle reading/writing annotations in XMP
const updateAnnotationsInXMP = async (assetId, annotations) => {
  const w3cAnnotations = annotations.map(convertToW3C);
  // Merge with existing XMP data
  // Update via Immich API
};
```

2. Implement annotation persistence:
- Save on creation
- Save on modification
- Save on deletion

Testing milestone:
- [ ] Annotations save to XMP successfully
- [ ] Annotations load from XMP on viewer init
- [ ] Updates don't corrupt existing XMP data

### Phase 3: Annotation UI Enhancements
1. Add annotation metadata fields:
- Title
- Description
- Creator
- Date

2. Implement custom popup component with metadata fields

Testing milestone:
- [ ] Popup displays and edits annotation metadata
- [ ] Metadata saves with geometric data
- [ ] UI handles validation and errors

## Technical Considerations

1. XMP Structure:
```xml
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <!-- Existing metadata -->
    <rdf:Description rdf:about="">
      <!-- Basic metadata -->
    </rdf:Description>
    <!-- W3C Annotations -->
    <rdf:Description rdf:about="">
      <w3c:annotations>
        <!-- Annotation array -->
      </w3c:annotations>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
```

2. Error Handling:
- XMP parsing errors
- API communication errors
- Validation errors
- Concurrent edit conflicts

3. Performance Considerations:
- Debounce save operations
- Batch annotation updates
- Lazy load annotation data
- Cache XMP data

## Next Steps

1. Create MetadataSidebar.jsx component
2. Implement basic XMP service
3. Test integration with existing ImageViewer
4. Begin W3C annotation converter implementation

Would you like me to start implementing any specific component or service from this plan?
