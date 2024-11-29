const API_KEY = 'zHMkwg86oQRLwoa2LCPD5Be2Yqv4es1TVZwWWpxRhAw';

async function initAnnotator() {
    // Get asset ID from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const assetId = urlParams.get('id');

    if (!assetId) {
        console.error('No asset ID provided in the URL.');
        return;
    }

    try {
        // Fetch the image blob from the server
        const imageResponse = await fetch(`http://localhost:3000/api/assets/${assetId}/original`, {
            headers: {
                'Accept': 'application/octet-stream',
                'x-api-key': API_KEY
            }
        });

        if (!imageResponse.ok) {
            throw new Error(`Failed to fetch image. HTTP Status: ${imageResponse.status}`);
        }

        const blob = await imageResponse.blob();
        const imageUrl = URL.createObjectURL(blob);

        // Initialize OpenSeadragon viewer
        const viewer = OpenSeadragon({
            id: "openseadragon",
            prefixUrl: "https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.0/images/",
            tileSources: {
                type: 'image',
                url: imageUrl,
                buildPyramid: true
            }
        });

        // Initialize annotator using the UMD global
        const anno = AnnotoriousOSD.createOSDAnnotator(viewer, {
            drawingEnabled: true,
            style: { fill: '#ff0000', fillOpacity: 0.25 }
        });

        // Load existing annotations, if available
        try {
            const metadataResponse = await fetch(`http://localhost:3000/api/assets/${assetId}/metadata`, {
                headers: {
                    'Accept': 'application/json',
                    'x-api-key': API_KEY
                }
            });

            if (metadataResponse.ok) {
                const metadata = await metadataResponse.json();
                if (metadata.annotations && Array.isArray(metadata.annotations)) {
                    anno.setAnnotations(metadata.annotations);
                } else {
                    console.warn('No annotations found in metadata or format is invalid.');
                }
            } else {
                console.warn(`Metadata fetch failed. HTTP Status: ${metadataResponse.status}`);
            }
        } catch (error) {
            console.warn('Error loading annotations:', error.message);
        }

        // Set up event handlers
        anno.on('createAnnotation', annotation => {
            console.log('Annotation created:', annotation);
            saveAnnotations(assetId, anno);
        });

        anno.on('updateAnnotation', (updated, previous) => {
            console.log('Annotation updated:', updated, 'Previous:', previous);
            saveAnnotations(assetId, anno);
        });

        anno.on('deleteAnnotation', annotation => {
            console.log('Annotation deleted:', annotation);
            saveAnnotations(assetId, anno);
        });

        anno.on('selectionChanged', annotations => {
            console.log('Selected annotations:', annotations);
        });

        anno.on('mouseEnterAnnotation', annotation => {
            console.log('Mouse entered annotation:', annotation);
        });

        anno.on('mouseLeaveAnnotation', annotation => {
            console.log('Mouse left annotation:', annotation);
        });

        anno.on('clickAnnotation', (annotation, originalEvent) => {
            console.log('Clicked annotation:', annotation);
        });

        // Clean up resources on viewer destroy
        viewer.addHandler('destroy', () => {
            anno.destroy();
            URL.revokeObjectURL(imageUrl);
            console.log('Viewer destroyed and resources cleaned up.');
        });

    } catch (error) {
        console.error('Error initializing annotator:', error.message);
    }
}

async function saveAnnotations(assetId, anno) {
    try {
        const annotations = anno.getAnnotations();

        const response = await fetch(`http://localhost:3000/api/assets/${assetId}/metadata`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY
            },
            body: JSON.stringify({ annotations })
        });

        if (!response.ok) {
            throw new Error(`Failed to save annotations. HTTP Status: ${response.status}`);
        } else {
            console.log('Annotations successfully saved.');
        }
    } catch (error) {
        console.error('Error saving annotations:', error.message);
    }
}

// Initialize the annotator when the page is fully loaded
window.onload = initAnnotator;
