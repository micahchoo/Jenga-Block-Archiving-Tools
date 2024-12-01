# Implementation Plan: Metadata Sidebar & Annotation Storage

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
