require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const fsp = require('fs').promises;
const { OpenAI } = require('openai');
const pdf = require('pdf-parse');
const fileType = require('file-type');

// Initialize Express app first
const app = express();
const PORT = process.env.PORT || 5001;

// Configure CORS with permissive settings for development
const corsOptions = {
  origin: true, // Reflect the request origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Apply CORS with the above options
app.use(cors(corsOptions));

// Log all requests
app.use((req, res, next) => {
  console.log(`\n=== New Request ===`);
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling preflight request');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
    return res.status(200).end();
  }
  
  next();
});

// Body parser middleware - must be before any route that needs to read the body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log the request body after parsing (moved after body parsers)
app.use((req, res, next) => {
  // Only log for non-multipart requests (multipart/form-data is handled by multer)
  if (req.headers['content-type'] && !req.headers['content-type'].startsWith('multipart/form-data')) {
    if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
      console.log('Parsed request body:', JSON.stringify(req.body, null, 2));
    }
  }
  next();
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  console.log('File filter processing file:', file);
  // Accept all files for now
  cb(null, true);
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Error handling for file uploads
const handleUpload = (req, res, next) => {
  upload.array('files')(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      console.error('Multer error:', err);
      return res.status(400).json({ error: 'File upload error', details: err.message });
    } else if (err) {
      // An unknown error occurred
      console.error('Unknown upload error:', err);
      return res.status(500).json({ error: 'Internal server error', details: err.message });
    }
    // If we got here, the upload was successful
    next();
  });
};

// Helper function to extract text from PDF
async function extractTextFromPdf(filePath) {
  try {
    const dataBuffer = await fsp.readFile(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

// Helper function to split text into chunks
function chunkText(text, maxChunkSize = 4000) {
  const chunks = [];
  let currentChunk = '';
  const sentences = text.split(/(?<=[.!?]\s)/);
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += sentence;
    }
  }
  
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

// Initialize OpenAI client with real API key or mock if not available
let openai;
const useMock = !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.startsWith('your_openai_api_key_here');

if (useMock) {
  console.log('⚠️  Using mock implementation (no API key provided)');
  openai = {
    chat: {
      completions: {
        create: async () => {
          return {
            choices: [{
              message: {
                content: JSON.stringify({
                  projectName: 'Mock Project',
                  description: 'This is a mock project generated for testing purposes.',
                  phases: [
                    { name: 'Phase 1', description: 'Initial setup and planning' },
                    { name: 'Phase 2', description: 'Development and implementation' },
                    { name: 'Phase 3', description: 'Testing and deployment' }
                  ],
                  personas: [
                    {
                      name: 'End User',
                      description: 'Primary user of the application',
                      goals: ['Ease of use', 'Efficiency', 'Reliability'],
                      painPoints: ['Complex interfaces', 'Slow performance', 'Bugs and errors']
                    }
                  ],
                  requirements: [
                    'User authentication system',
                    'Responsive design for all devices',
                    'Data visualization capabilities',
                    'Export functionality',
                    'User settings and preferences'
                  ]
                }, null, 2)
              }
            }]
          };
        }
      }
    }
  };
} else {
  try {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    console.log('🔑  Using OpenAI API with provided key');
  } catch (error) {
    console.error('❌  Error initializing OpenAI client:', error);
    process.exit(1);
  }
}

// Health check endpoint with better error handling
app.get('/api/health', (req, res) => {
  try {
    console.log('Health check endpoint called');
    const healthCheck = {
      status: 'ok',
      message: 'AI Assistant API is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      openai: !!openai ? 'initialized' : 'not initialized',
      mockMode: useMock,
      nodeEnv: process.env.NODE_ENV || 'development',
      port: SERVER_PORT
    };
    console.log('Health check response:', healthCheck);
    res.json(healthCheck);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// File upload and process endpoint
app.post('/api/process-documents', (req, res, next) => {
  console.log('\n=== Starting upload request ===');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.originalUrl);
  console.log('Content-Type header:', req.headers['content-type']);
  console.log('Request headers:', JSON.stringify(req.headers, null, 2));
  
  // Log request body for non-multipart requests
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  } else {
    console.log('No request body or empty body');
  }
  
  // Handle the upload with multer - support both 'files' and 'documents' field names
  console.log('\n=== Multer upload starting ===');
  const uploadHandler = (req, res, next) => {
    // First try 'files' field
    const uploadMiddleware = upload.array('files');
    
    uploadMiddleware(req, res, function(err) {
      if (err) {
        // If 'files' field fails, try 'documents' field
        if (err.code === 'LIMIT_UNEXPECTED_FILE' && err.field === 'files') {
          console.log('No files in "files" field, trying "documents" field');
          const docsUpload = upload.array('documents');
          return docsUpload(req, res, function(docsErr) {
            if (docsErr) {
              handleUploadError(docsErr, res);
            } else {
              next();
            }
          });
        }
        handleUploadError(err, res);
      } else {
        next();
      }
    });
  };
  
  // Helper function to handle upload errors
  const handleUploadError = (err, res) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return res.status(400).json({ error: 'File upload error', details: err.message });
    } else if (err) {
      console.error('Unknown upload error:', err);
      return res.status(500).json({ error: 'Internal server error', details: err.message });
    }
  };
  
  // Execute the upload handler
  uploadHandler(req, res, next);
});

// Add the document processing endpoint
app.post('/process-documents', upload.array('documents'), async (req, res) => {
  console.log('\n=== New File Upload Request ===');
  console.log('Method:', req.method);
  console.log('URL:', req.originalUrl);
  console.log('Content-Type:', req.headers['content-type']);
  
  if (req.fileValidationError) {
    console.error('File validation error:', req.fileValidationError);
    return res.status(400).json({ error: req.fileValidationError });
  }
  
  try {
    console.log('Uploaded files:', req.files);
    
    if (!req.files || req.files.length === 0) {
      console.error('No files in request');
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Process each file with OpenAI
    const results = await Promise.all(
      req.files.map(async (file) => {
        try {
          let fileContent = '';
          const fileExt = path.extname(file.originalname).toLowerCase();
          
          // Handle different file types
          if (fileExt === '.pdf') {
            console.log(`Processing PDF file: ${file.originalname}`);
            fileContent = await extractTextFromPdf(file.path);
          } else if (['.txt', '.md', '.markdown'].includes(fileExt)) {
            console.log(`Processing text file: ${file.originalname}`);
            fileContent = await fsp.readFile(file.path, 'utf-8');
          } else {
            throw new Error(`Unsupported file type: ${fileExt}. Please upload a PDF or text file.`);
          }
          
          // Clean up the uploaded file regardless of success/failure
          await fsp.unlink(file.path);
          
          console.log(`Extracted ${fileContent.length} characters from ${file.originalname}`);
          
          // Check if the content is too large and needs chunking
          const estimatedTokens = Math.ceil(fileContent.length / 4);
          const maxTokens = 7000; // Conservative buffer for the prompt
          
          if (estimatedTokens > maxTokens) {
            console.log(`Document is large (${estimatedTokens} tokens), splitting into chunks...`);
            const chunks = chunkText(fileContent, 3000); // Smaller chunks for better processing
            console.log(`Split document into ${chunks.length} chunks`);
            
            // Process each chunk and combine results
            const chunkResults = [];
            
            for (let i = 0; i < chunks.length; i++) {
              const chunk = chunks[i];
              console.log(`Processing chunk ${i + 1}/${chunks.length} (${chunk.length} chars)`);
              
              const result = await processDocumentChunk(
                chunk, 
                i === 0, // First chunk gets full processing
                i > 0    // Subsequent chunks only add new information
              );
              
              if (result) {
                chunkResults.push(result);
              }
            }
            
            // Combine results from all chunks
            return combineChunkResults(chunkResults);
          } else {
            // Process as a single chunk
            return await processDocumentChunk(fileContent, true, false);
          }
          
        } catch (error) {
          // Clean up the uploaded file in case of error
          if (fs.existsSync(file.path)) {
            await fsp.unlink(file.path).catch(console.error);
          }
          
          console.error(`Error processing file ${file.originalname}:`, error);
          return {
            projectName: '',
            description: `Error: ${error.message}`,
            phases: [],
            personas: [],
            requirements: []
          };
        }
      })
    );
    
    // Combine results from all files
    const combinedResult = combineChunkResults(results);
    
    // Send the combined result
    res.json(combinedResult);
    
  } catch (error) {
    console.error('Error processing documents:', error);
    res.status(500).json({ 
      error: 'Failed to process documents',
      details: error.message 
    });
  }
});

// Process a single document chunk with OpenAI
async function processDocumentChunk(content, isFirstChunk, isContinuation) {
  const prompt = isFirstChunk 
    ? `Analyze the following document and extract key project information.
       Be concise and focus on the most important details.
       
       Document content:
       ${content}
       
       Return the information in JSON format with the following structure:
       {
         "projectName": "string (brief project name)",
         "description": "string (1-2 paragraph summary)",
         "phases": [
           { 
             "name": "string (phase name)", 
             "description": "string (1-2 sentences)" 
           }
         ],
         "personas": [
           { 
             "name": "string (persona name)", 
             "description": "string (1-2 sentences)",
             "goals": ["string (bullet points)"],
             "painPoints": ["string (bullet points)"] 
           }
         ],
         "requirements": ["string (key requirements, one per item)"]
       }
       
       Important: Only return valid JSON. Do not include any other text.`
    : `The following is another section of the same document. Extract any additional information that should be added to the project analysis.
       
       Additional content:
       ${content}
       
       Return only a JSON object with any new or updated information in the same format as before.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant that helps analyze project documents and extract key information. ' +
                   'Focus on extracting the most important information and be concise in your responses.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });
    
    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in AI response');
    }
    
    // Extract JSON from the response
    let jsonContent = content.trim();
    const jsonMatch = content.match(/```(?:json)?\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      jsonContent = jsonMatch[1];
    }
    
    // Clean up the content
    jsonContent = jsonContent
      .replace(/^```json\n?|```$/g, '')
      .replace(/^\s*[\r\n]+|\s*[\r\n]+$/g, '')
      .replace(/^[^{]*([\s\S]*\})[^}]*$/, '$1');
    
    console.log('Parsed JSON content from chunk');
    return JSON.parse(jsonContent);
    
  } catch (error) {
    console.error('Error processing document chunk:', error);
    throw error;
  }
}

// Combine results from multiple chunks
function combineChunkResults(chunkResults) {
  if (!chunkResults || chunkResults.length === 0) {
    return {
      projectName: '',
      description: '',
      phases: [],
      personas: [],
      requirements: []
    };
  }
  
  // Start with the first result
  const combined = { ...chunkResults[0] };
  
  // Merge additional results
  for (let i = 1; i < chunkResults.length; i++) {
    const result = chunkResults[i];
    
    // Update project name if not set
    if (!combined.projectName && result.projectName) {
      combined.projectName = result.projectName;
    }
    
    // Append descriptions
    if (result.description) {
      if (!combined.description) {
        combined.description = result.description;
      } else if (!combined.description.includes(result.description)) {
        combined.description += '\n\n' + result.description;
      }
    }
    
    // Merge phases
    if (result.phases && result.phases.length > 0) {
      const existingPhases = new Set(combined.phases.map(p => p.name.toLowerCase()));
      for (const phase of result.phases) {
        if (!existingPhases.has(phase.name.toLowerCase())) {
          combined.phases.push(phase);
          existingPhases.add(phase.name.toLowerCase());
        }
      }
    }
    
    // Merge personas
    if (result.personas && result.personas.length > 0) {
      const existingPersonas = new Map(combined.personas.map(p => [p.name.toLowerCase(), p]));
      for (const persona of result.personas) {
        const key = persona.name.toLowerCase();
        if (existingPersonas.has(key)) {
          // Merge with existing persona
          const existing = existingPersonas.get(key);
          existing.description = existing.description || persona.description;
          
          // Merge goals
          if (persona.goals) {
            const goalSet = new Set([
              ...(existing.goals || []).map(g => g.toLowerCase()),
              ...(persona.goals || []).map(g => g.toLowerCase())
            ]);
            existing.goals = Array.from(goalSet);
          }
          
          // Merge pain points
          if (persona.painPoints) {
            const painPointSet = new Set([
              ...(existing.painPoints || []).map(p => p.toLowerCase()),
              ...(persona.painPoints || []).map(p => p.toLowerCase())
            ]);
            existing.painPoints = Array.from(painPointSet);
          }
        } else {
          // Add new persona
          combined.personas.push({ ...persona });
          existingPersonas.set(key, persona);
        }
      }
    }
    
    // Merge requirements
    if (result.requirements && result.requirements.length > 0) {
      const reqSet = new Set([
        ...(combined.requirements || []).map(r => r.toLowerCase()),
        ...(result.requirements || []).map(r => r.toLowerCase())
      ]);
      combined.requirements = Array.from(reqSet);
    }
  }
  
  return combined;
}
// Error handling middleware with detailed logging
app.use((err, req, res, next) => {
  console.error('\n=== ERROR ===');
  console.error('Error:', err);
  console.error('Stack:', err.stack);
  console.error('Request URL:', req.originalUrl);
  console.error('Request Method:', req.method);
  console.error('Request Headers:', JSON.stringify(req.headers, null, 2));
  console.error('Request Body:', req.body ? JSON.stringify(req.body, null, 2) : 'No body');
  console.error('Request Query:', JSON.stringify(req.query, null, 2));
  console.error('Request Params:', JSON.stringify(req.params, null, 2));
  
  // Check for specific error types
  if (err.name === 'TypeError' && err.message.includes('Cannot convert undefined or null to object')) {
    console.error('TypeError detected - likely trying to access a property on undefined/null');
  }
  
  // Send error response
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      name: err.name,
      details: err.toString()
    })
  });
});

// Start the server on a different port to avoid conflicts
const SERVER_PORT = 5001; // Changed from 5000 to 5001
app.listen(SERVER_PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${SERVER_PORT}`);
});

module.exports = app;
