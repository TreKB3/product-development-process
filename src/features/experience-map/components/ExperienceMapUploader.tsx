import * as React from 'react';
import { useState, useCallback, useMemo } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store/store';
import { 
  Box, 
  Button, 
  Typography, 
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Alert,
  AlertTitle,
  useTheme
} from '@mui/material';
import { processAIAnalysis } from '../../../store/slices/experienceMapSlice';
import { 
  analyzeDocuments, 
  DocumentAnalysisResult, 
  ProgressCallback, 
  UploadProgressEvent 
} from '../../../api/ai/documentService';
import { 
  CloudUpload as CloudUploadIcon, 
  InsertDriveFile as FileIcon,
  Close as CloseIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

export interface ExperienceMapUploaderProps {
  projectId: string;
  onAnalysisComplete?: () => void;
}

const ExperienceMapUploader: React.FC<ExperienceMapUploaderProps> = ({ 
  projectId, 
  onAnalysisComplete 
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<{message: string; details?: string} | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  
  // Maximum file size in bytes (10MB)
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    // Handle file rejections (invalid type, size, etc.)
    if (fileRejections?.length > 0) {
      const rejectionReasons = fileRejections.flatMap(rejection => 
        rejection.errors.map(error => `${rejection.file.name}: ${error.message}`)
      );
      setError({
        message: 'Some files were rejected',
        details: rejectionReasons.join('\n')
      });
      return;
    }

    // Validate file sizes
    const oversizedFiles = acceptedFiles.filter(file => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      setError({
        message: 'Some files are too large',
        details: `The following files exceed the maximum size of ${MAX_FILE_SIZE / (1024 * 1024)}MB: ${
          oversizedFiles.map(f => f.name).join(', ')
        }`
      });
      return;
    }

    setFiles(prev => [...prev, ...acceptedFiles]);
    setError(null);
  }, [MAX_FILE_SIZE]);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setError(null); // Clear any previous errors when files are modified
  }, []);

  const handleUpload = useCallback(async () => {
    console.group('handleUpload');
    
    if (files.length === 0) {
      const errorMsg = 'Please select at least one file to upload';
      console.error(errorMsg);
      setError({
        message: errorMsg,
        details: ''
      });
      return;
    }

    console.log('Starting upload for files:', files.map(f => `${f.name} (${(f.size / 1024).toFixed(2)} KB)`));
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      console.log('Starting document analysis for files:', files.map(f => f.name));
      
      const result = await analyzeDocuments(
        files,
        (progress: UploadProgressEvent) => {
          console.log(`Upload progress: ${progress.progress}% - ${progress.file}`);
          setUploadProgress(progress.progress);
        }
      );

      console.log('Received analysis result from API:', JSON.stringify(result, null, 2));

      // Process the analysis result with Redux
      if (!result) {
        const errorMsg = 'No analysis results returned from the server';
        console.error(errorMsg);
        throw new Error(errorMsg);
      }

      // Validate the result structure
      if (!result.personas || !result.phases) {
        const errorDetails = {
          hasPersonas: !!result.personas,
          hasPhases: !!result.phases,
          result
        };
        console.error('Invalid analysis result format - missing required fields:', errorDetails);
        throw new Error('Invalid analysis result format: missing required fields');
      }

      // Ensure personas and phases are arrays
      const validatedResult = {
        ...result,
        personas: Array.isArray(result.personas) ? result.personas : [],
        phases: Array.isArray(result.phases) ? result.phases : [],
        requirements: Array.isArray(result.requirements) ? result.requirements : []
      };

      console.log('Dispatching processAIAnalysis with validated result:', {
        personasCount: validatedResult.personas.length,
        phasesCount: validatedResult.phases.length,
        requirementsCount: validatedResult.requirements.length,
        samplePersona: validatedResult.personas[0],
        samplePhase: validatedResult.phases[0]
      });
      
      // Log the validated result before dispatching
      console.log('Dispatching processAIAnalysis with:', {
        personas: `[${validatedResult.personas.length} personas]`,
        phases: `[${validatedResult.phases.length} phases]`,
        requirements: `[${validatedResult.requirements.length} requirements]`
      });
      
      try {
        console.log('Dispatching action...');
        const dispatchResult = await dispatch(processAIAnalysis(validatedResult)).unwrap();
        
        // Log the result without accessing potentially undefined properties
        console.log('Dispatch successful, result received with:', {
          hasPersonas: Array.isArray(dispatchResult.personas) ? `[${dispatchResult.personas.length} personas]` : 'No personas',
          hasPhases: Array.isArray(dispatchResult.phases) ? `[${dispatchResult.phases.length} phases]` : 'No phases',
          hasRequirements: Array.isArray(dispatchResult.requirements) ? `[${dispatchResult.requirements.length} requirements]` : 'No requirements'
        });
        
        // Show success message
        console.log('Analysis completed successfully');
        setError({ message: 'success' });
        
        // Close the dialog after a short delay
        const timer = setTimeout(() => {
          console.log('Calling onAnalysisComplete callback');
          if (onAnalysisComplete) {
            onAnalysisComplete();
          }
        }, 1500);

        // Cleanup timer on unmount
        return () => {
          console.log('Cleaning up upload timer');
          clearTimeout(timer);
        };
      } catch (dispatchError) {
        const errorMsg = `Error dispatching processAIAnalysis: ${dispatchError instanceof Error ? dispatchError.message : 'Unknown error'}`;
        console.error(errorMsg, dispatchError);
        throw new Error(`Failed to update experience map: ${errorMsg}`);
      }
    } catch (err) {
      console.error('Error analyzing documents:', err);
      setError({
        message: 'Failed to analyze documents',
        details: err instanceof Error ? err.message : 'An unknown error occurred'
      });
      throw err; // Re-throw to be caught by the outer catch
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      console.groupEnd();
    }
  }, [dispatch, files, onAnalysisComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt', '.md']
    },
    maxSize: MAX_FILE_SIZE,
    disabled: isUploading,
  });

  return (
    <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto', my: 4 }}>
      <Paper 
        variant="outlined" 
        sx={{ 
          p: 4, 
          border: `2px dashed ${theme.palette.divider}`,
          backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
          transition: 'background-color 0.2s ease-in-out',
        }}
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            textAlign: 'center',
            p: 2
          }}
        >
          <CloudUploadIcon 
            sx={{ 
              fontSize: 48, 
              color: 'text.secondary',
              mb: 2 
            }} 
          />
          <Typography variant="h6" gutterBottom>
            {isDragActive 
              ? 'Drop the files here...' 
              : 'Drag & drop files here, or click to select files'}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Supported formats: PDF, DOC, DOCX, TXT, MD
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            disabled={isUploading}
            onClick={(e) => {
              e.stopPropagation();
              const input = document.createElement('input');
              input.type = 'file';
              input.multiple = true;
              input.accept = '.pdf,.doc,.docx,.txt,.md';
              input.onchange = (e: Event) => {
                const target = e.target as HTMLInputElement;
                const files = Array.from(target.files || []);
                if (files.length > 0) {
                  onDrop(files, []);
                }
              };
              input.click();
            }}
            sx={{ mt: 1 }}
          >
            Select Files
          </Button>
        </Box>
      </Paper>

      {files.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Selected Files ({files.length}):
          </Typography>
          <List dense>
            {files.map((file, index) => (
              <ListItem 
                key={index}
                secondaryAction={
                  <IconButton 
                    edge="end" 
                    aria-label="remove"
                    onClick={() => removeFile(index)}
                    disabled={isUploading}
                  >
                    <CloseIcon />
                  </IconButton>
                }
              >
                <ListItemIcon>
                  <FileIcon />
                </ListItemIcon>
                <ListItemText 
                  primary={file.name} 
                  secondary={`${(file.size / 1024).toFixed(2)} KB`} 
                />
              </ListItem>
            ))}
          </List>

          {isUploading && (
            <Box sx={{ mt: 2, width: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Analyzing...
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {Math.round(uploadProgress)}%
                </Typography>
              </Box>
              <Box 
                sx={{
                  width: '100%',
                  height: 8,
                  backgroundColor: 'divider',
                  borderRadius: 4,
                  overflow: 'hidden'
                }}
              >
                <Box 
                  sx={{
                    width: `${uploadProgress}%`,
                    height: '100%',
                    backgroundColor: 'primary.main',
                    transition: 'width 0.3s ease-in-out'
                  }}
                />
              </Box>
            </Box>
          )}

          {error?.message === 'success' ? (
            <Alert severity="success" sx={{ mt: 2 }}>
              <AlertTitle>Success</AlertTitle>
              Analysis complete! Experience map has been updated.
            </Alert>
          ) : error ? (
            <Alert 
              severity="error" 
              sx={{ mt: 2 }}
              icon={<ErrorIcon />}
            >
              <AlertTitle>{error.message}</AlertTitle>
              {error.details && (
                <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                  {error.details}
                </Typography>
              )}
            </Alert>
          ) : null}

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="outlined" 
              onClick={() => setFiles([])}
              disabled={isUploading || files.length === 0}
              sx={{ mr: 1 }}
            >
              Clear All
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleUpload}
              disabled={isUploading || files.length === 0}
              startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isUploading ? 'Analyzing...' : 'Generate Experience Map'}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ExperienceMapUploader;
