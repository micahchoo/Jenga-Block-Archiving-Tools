// services/xmpService.js

// Helper to create W3C Annotation format
const createW3CAnnotation = (annotation, baseUrl) => {
    return {
      "@context": "http://www.w3.org/ns/anno.jsonld",
      "id": `${baseUrl}/annotation/${annotation.id}`,
      "type": "Annotation",
      "body": annotation.bodies,
      "target": {
        "source": baseUrl,
        "selector": {
          "type": "FragmentSelector",
          "conformsTo": "http://www.w3.org/TR/media-frags/",
          "value": `xywh=${annotation.target.selector.geometry.x},${
            annotation.target.selector.geometry.y},${
            annotation.target.selector.geometry.width},${
            annotation.target.selector.geometry.height}`
        }
      }
    };
  };
  
  // Convert metadata and annotations to XMP format
  const createXMPContent = (metadata, annotations, assetId) => {
    const baseUrl = `${window.location.origin}/assets/${assetId}`;
    
    const w3cAnnotations = annotations.map(anno => 
      createW3CAnnotation(anno, baseUrl)
    );
  
    // Create XMP template with your metadata fields
    return `<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>
  <x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="XMP Core 5.1.2">
    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
      <rdf:Description rdf:about=""
        xmlns:dc="http://purl.org/dc/elements/1.1/"
        xmlns:xmp="http://ns.adobe.com/xap/1.0/"
        xmlns:anno="http://www.w3.org/ns/anno.jsonld/">
        
        <!-- Basic Metadata -->
        <dc:title>${metadata.title || ''}</dc:title>
        <dc:description>${metadata.description || ''}</dc:description>
        <dc:creator>${metadata.creator || ''}</dc:creator>
        
        <!-- W3C Web Annotations -->
        <anno:hasAnnotations>
          ${w3cAnnotations.map(anno => `
            <rdf:li>
              <rdf:Description>
                <anno:id>${anno.id}</anno:id>
                <anno:body>${JSON.stringify(anno.body)}</anno:body>
                <anno:target>${JSON.stringify(anno.target)}</anno:target>
              </rdf:Description>
            </rdf:li>
          `).join('\n')}
        </anno:hasAnnotations>
        
      </rdf:Description>
    </rdf:RDF>
  </x:xmpmeta>
  <?xpacket end="w"?>`;
  };
  
  export const saveToXMP = async (assetId, metadata, annotations, apiKey) => {
    try {
      const xmpContent = createXMPContent(metadata, annotations, assetId);
      
      // Send XMP content to your server endpoint that will save it as a sidecar file
      const response = await fetch(`/api/assets/${assetId}/sidecar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/xml',
          'X-Api-Key': apiKey
        },
        body: xmpContent
      });
  
      if (!response.ok) {
        throw new Error(`Failed to save XMP sidecar: ${response.statusText}`);
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error saving XMP sidecar:', error);
      throw error;
    }
  };
  
  export const loadFromXMP = async (assetId, apiKey) => {
    try {
      const response = await fetch(`/api/assets/${assetId}/sidecar`, {
        headers: {
          'X-Api-Key': apiKey,
          'Accept': 'application/xml'
        }
      });
  
      if (!response.ok) {
        throw new Error(`Failed to load XMP sidecar: ${response.statusText}`);
      }
  
      const xmpContent = await response.text();
      // Parse XMP content back into metadata and annotations
      // Implementation needed based on your XMP structure
      
      return {
        metadata: {},  // Parsed metadata
        annotations: [] // Parsed annotations
      };
    } catch (error) {
      console.error('Error loading XMP sidecar:', error);
      throw error;
    }
  };