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
  useTheme,
  Alert,
  AlertTitle
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
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  
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
    if (files.length === 0) {
      setError({
        message: 'Please select at least one file to upload',
        details: ''
      });
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      if (files.length === 0) {
        throw new Error('No files selected for upload');
      }

      const result = await analyzeDocuments(
        files,
        (progress: { progress: number }) => {
          setUploadProgress(progress.progress);
        }
      );

      // Process the analysis result with Redux
      if (!result) {
        throw new Error('No analysis results returned from the server');
      }

      // Validate the result structure
      if (!result.personas || !result.phases) {
        throw new Error('Invalid analysis result format');
      }

      dispatch(processAIAnalysis(result));
      
      // Show success message
      setError({ message: 'success' });
      
      // Close the dialog after a short delay
      const timer = setTimeout(() => {
        if (onAnalysisComplete) {
          onAnalysisComplete();
        }
      }, 1500);

      // Cleanup timer on unmount
      return () => clearTimeout(timer);
    } catch (err) {
      console.error('Error analyzing documents:', err);
      setError({
        message: 'Failed to analyze documents',
        details: err instanceof Error ? err.message : 'An unknown error occurred'
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
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
