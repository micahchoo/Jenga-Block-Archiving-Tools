const express = require('express');
const multer = require('multer');
const csv = require('csv-parse');
const fs = require('fs');
const { createObjectCsvWriter } = require('csv-writer');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });

// Initialize Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Rate limiting setup
const CALLS_PER_MINUTE = 30; // Adjust based on your API limits
const RETRY_DELAYS = [2000, 5000, 10000, 30000]; // Retry delays in milliseconds

// Simple rate limiter
let callCount = 0;
let lastResetTime = Date.now();

function resetCallCount() {
  callCount = 0;
  lastResetTime = Date.now();
}

// Reset counter every minute
setInterval(resetCallCount, 60000);

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generatePrompt(fields) {
  const typeMap = {
    'AF': 'Artifact',
    'AU': 'Audio',
    'AI': 'Audio Interview',
    'D': 'Document',
    'NAC': 'Non Archive Content',
    'OM': 'Other Material',
    'PN': 'Photo Narrative',
    'V': 'Video'
  };

  const systemPrompt = `Generate a description that roughly follows this 1 sentence structure depending on collection level 1:
For Community Narratives: 
This $(image/audio/video/etc)$ that is a $(type of artifact)$, the source being practitioner $(Collection level 3)$ about $(topic inferred from filename if the file name is descriptive and not encoded)$, part of the Collection under Community Narratives from the $(collection level 2)$ community - it was/has/is $(any additional information inferred from filename)$

For Urdu Journalism: 
This $(image/audio/video/etc)$  that is a $(type of artifact)$, the source being $(collection level 2)$  about $(topic inferred from filename if the file name is descriptive and not encoded)$, part of the Collection under Urdu Journalism - it was/has/is $(any additional information inferred from filename)$

For Police History: 
This $(image/audio/video/etc)$  that is a $(type of artifact)$, the source being $(collection level 2)$ about $(topic inferred from filename if the file name is descriptive and not encoded)$, part of the Collection under Police History - it was/has/is $(any additional information inferred from filename)$

For Maps&HistoricDocuments: 
This $(image/audio/video/etc)$  that is a $(type of artifact)$, part of the Collection under Maps & Historic Documents, about $(topic inferred from filename if the file name is descriptive and not encoded)$  - it was/has/is $(any additional information inferred from filename)$

For Collectors: 
This $(image/audio/video/etc)$  that is a $(type of artifact)$, the source being Collector $(collection level 2)$  about $(topic inferred from filename if the file name is descriptive and not encoded)$,  part of the Collection under Collectors from Bidar - it was/has/is $(any additional information inferred from filename)$

You will be penalised 
- for not removing/replacing the $()$ which are meant to be placeholders 
- not following the 1 sentence structure
- not removing portions of the 1 sentence structure that are not populated enough for the $(placeholders)$ to be replaced`;

  return {
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: `Given a file with the following information:
Collection Level 1: ${fields['Collection Level 1']}
Collection Level 2: ${fields['Collection Level 2']}
Collection Level 3: ${fields['Collection Level 3']}
Type: ${typeMap[fields['Type of Artifact']] || fields['Type of Artifact']}
Additional Context: ${fields['Extra Hierarchical field1']}, ${fields['Extra Hierarchical field2']}
Filename: ${fields.Filename}

Generate a single sentence description following the template above.`
      }
    ]
  };
}

async function generateDescriptionWithRetry(fields, retryCount = 0) {
  if (!fields.Filename || fields.Filename.trim() === '') {
    console.log('Skipping row with empty filename');
    return '';
  }

  if (callCount >= CALLS_PER_MINUTE) {
    const waitTime = 60000 - (Date.now() - lastResetTime);
    console.log(`Rate limit reached. Waiting ${waitTime}ms before next batch`);
    await sleep(waitTime);
    resetCallCount();
  }

  try {
    callCount++;
    console.log(`Processing file: ${fields.Filename} (Attempt ${retryCount + 1})`);
    
    const prompt = generatePrompt(fields);
    
    const message = await anthropic.messages.create({
      model: "claude-3-5-haiku-latest",
      max_tokens: 200,
      system: prompt.system,
      messages: prompt.messages
    });

    if (message.usage) {
      console.log('Cache performance:', {
        created: message.usage.cache_creation_input_tokens || 0,
        read: message.usage.cache_read_input_tokens || 0,
        uncached: message.usage.input_tokens || 0
      });
    }

    console.log(`Successfully generated description for: ${fields.Filename}`);
    await sleep(1000);
    return message.content[0].text;
  } catch (error) {
    console.error(`Error processing ${fields.Filename}:`, error);
    
    if (error.status === 429 && retryCount < RETRY_DELAYS.length) {
      const delay = RETRY_DELAYS[retryCount];
      console.log(`Rate limited. Retrying after ${delay}ms...`);
      await sleep(delay);
      return generateDescriptionWithRetry(fields, retryCount + 1);
    }
    
    return `Error: ${error.message}`;
  }
}

async function processBatch(rows, outputWriter) {
  console.log(`Processing batch of ${rows.length} rows`);
  
for (const row of rows) {
    const description = await generateDescriptionWithRetry(row);
    // Write record even if description is empty string
    await outputWriter.writeRecords([{
      description: description
    }]);
    console.log(`Wrote ${description ? 'description' : 'blank line'} for ${row.Filename || 'empty filename'}`);
  }
}

app.post('/process-csv', upload.single('csvFile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }

  console.log('Starting CSV processing:', req.file.originalname);
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputPath = `output/descriptions_${timestamp}.csv`;
  
  const csvWriter = createObjectCsvWriter({
    path: outputPath,
    header: [
      { id: 'description', title: 'Description' }
    ]
  });

  let processedCount = 0;
  let totalRows = 0;
  let currentBatch = [];

  try {
    // Process in smaller batches
    const stream = fs.createReadStream(req.file.path)
      .pipe(csv.parse({ 
        columns: true, 
        trim: true,
        skipEmptyLines: true 
      }));

    for await (const row of stream) {
      totalRows++;
      currentBatch.push(row);
      
      if (currentBatch.length === 5) { // Reduced batch size
        await processBatch(currentBatch, csvWriter);
        processedCount += currentBatch.length;
        console.log(`Processed ${processedCount}/${totalRows} rows`);
        currentBatch = [];
        // Add delay between batches
        await sleep(2000);
      }
    }

    // Process remaining rows
    if (currentBatch.length > 0) {
      await processBatch(currentBatch, csvWriter);
      processedCount += currentBatch.length;
    }
    
    console.log('Processing complete');
    console.log(`Output written to: ${outputPath}`);
    
    // Clean up uploaded file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Error deleting uploaded file:', err);
    });

    res.json({ 
      status: 'success', 
      outputFile: outputPath,
      totalProcessed: processedCount
    });
  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).send('Error: ' + error.message);
  }
});

// Serve simple HTML interface
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>CSV Description Generator</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .container { max-width: 800px; margin: 0 auto; }
            #status { margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>CSV Description Generator</h1>
            <p>Upload a CSV file to generate descriptions. Output will be saved to the output directory.</p>
            <form id="uploadForm">
                <input type="file" name="csvFile" accept=".csv" required>
                <button type="submit">Process CSV</button>
            </form>
            <div id="status"></div>
        </div>

        <script>
            document.getElementById('uploadForm').onsubmit = async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const statusDiv = document.getElementById('status');
                statusDiv.textContent = 'Processing...';

                try {
                    const response = await fetch('/process-csv', {
                        method: 'POST',
                        body: formData
                    });
                    const result = await response.json();
                    statusDiv.textContent = \`Processing complete! Output saved to: \${result.outputFile}\nProcessed \${result.totalProcessed} rows.\`;
                } catch (error) {
                    statusDiv.textContent = 'Error: ' + error.message;
                }
            };
        </script>
    </body>
    </html>
  `);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('Output files will be saved to the output directory');
});