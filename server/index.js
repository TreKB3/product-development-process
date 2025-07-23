require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { OpenAI } = require('openai');

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

// Initialize OpenAI client with real API key or mock if not available
let openai;
const useMock = !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.startsWith('your_openai_api_key_here');

if (useMock) {
  console.log('⚠️  Running in MOCK MODE - Using simulated responses');
  console.log('⚠️  Running in MOCK MODE - Using simulated responses');
  openai = {
    chat: {
      completions: {
        create: async () => {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Return mock response
          return {
            choices: [{
              message: {
                content: JSON.stringify({
                  projectName: "Sample Project",
                  description: "This is a mock project generated for testing purposes.",
                  phases: [
                    { name: "Discovery", description: "Initial research and planning phase" },
                    { name: "Design", description: "UI/UX and system architecture design" },
                    { name: "Development", description: "Implementation of features" },
                    { name: "Testing", description: "Quality assurance and bug fixing" },
                    { name: "Deployment", description: "Release to production" }
                  ],
                  personas: [
                    {
                      name: "Project Manager",
                      description: "Oversees project execution and team coordination",
                      goals: ["Deliver on time", "Maintain team productivity"],
                      painPoints: ["Scope creep", "Communication gaps"]
                    },
                    {
                      name: "End User",
                      description: "Primary user of the application",
                      goals: ["Ease of use", "Reliable performance"],
                      painPoints: ["Complex interfaces", "Slow response times"]
                    }
                  ],
                  requirements: [
                    "User authentication system",
                    "Responsive design for all devices",
                    "Data export functionality",
                    "Role-based access control"
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
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log('🔑  Using OpenAI API with provided key');
  } catch (error) {
    console.error('❌  Failed to initialize OpenAI client:', error.message);
    console.log('⚠️  Falling back to MOCK MODE');
    // Fall back to mock mode if initialization fails
    openai = {
      chat: {
        completions: {
          create: async () => {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            return {
              choices: [{
                message: {
                  content: JSON.stringify({
                    projectName: "Sample Project (Mock Fallback)",
                    description: "This is a fallback mock response due to OpenAI initialization error.",
                    phases: [{ name: "Phase 1", description: "Initial phase" }],
                    personas: [],
                    requirements: []
                  }, null, 2)
                }
              }]
            };
          }
        }
      }
    };
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
  
  // Handle the upload with multer
  console.log('\n=== Multer upload starting ===');
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
}, async (req, res) => {
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
          // Read the file content
          const fileContent = fs.readFileSync(file.path, 'utf-8');
          
          // Process with OpenAI
          const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content: 'You are an AI assistant that helps analyze project documents and extract key information.',
              },
              {
                role: 'user',
                content: `Analyze the following document and extract key project information:
                \n${fileContent}\n\nReturn the information in JSON format with the following structure:
                {
                  "projectName": "string",
                  "description": "string",
                  "phases": [
                    { "name": "string", "description": "string" }
                  ],
                  "personas": [
                    { 
                      "name": "string", 
                      "description": "string",
                      "goals": ["string"],
                      "painPoints": ["string"] 
                    }
                  ],
                  "requirements": ["string"]
                }`,
              },
            ],
            temperature: 0.7,
          });

          // Clean up the uploaded file
          fs.unlinkSync(file.path);

          // Parse the AI response
          const content = completion.choices[0]?.message?.content;
          if (!content) {
            throw new Error('No content in AI response');
          }

          return JSON.parse(content);
        } catch (error) {
          console.error(`Error processing file ${file.originalname}:`, error);
          return {
            error: `Error processing ${file.originalname}`,
            details: error.message,
          };
        }
      })
    );

    // Combine results from all files
    const combinedResult = results.reduce(
      (acc, result) => {
        if (result.error) {
          acc.errors = acc.errors || [];
          acc.errors.push(result);
        } else {
          // Merge project details
          acc.projectName = result.projectName || acc.projectName;
          acc.description = result.description || acc.description;
          
          // Merge phases, personas, and requirements
          if (result.phases) acc.phases = [...(acc.phases || []), ...result.phases];
          if (result.personas) acc.personas = [...(acc.personas || []), ...result.personas];
          if (result.requirements) acc.requirements = [...(acc.requirements || []), ...result.requirements];
        }
        return acc;
      },
      { projectName: '', description: '', phases: [], personas: [], requirements: [] }
    );

    res.json(combinedResult);
  } catch (error) {
    console.error('Error processing documents:', error);
    res.status(500).json({
      error: 'Failed to process documents',
      details: error.message,
    });
  }
});

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
