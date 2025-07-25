import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  IconButton, 
  CircularProgress,
  LinearProgress,
  Alert,
  AlertTitle,
  Collapse,
  Tooltip,
  Switch,
  FormControlLabel,
  Divider
} from '@mui/material';
import { 
  CloudUpload, 
  InsertDriveFile, 
  Close, 
  CheckCircle, 
  Error as ErrorIcon,
  Cancel as CancelIcon,
  HelpOutline as HelpOutlineIcon
} from '@mui/icons-material';
import { AppDispatch, RootState } from '../../../store/store';
import { 
  processDocuments, 
  clearAIState, 
  cancelProcessing,
  setMockMode
} from '../../../store/slices/aiSlice';

interface DocumentUploadProps {
  onAnalysisComplete?: (result: any) => void;
  onFilesChange?: (files: File[]) => void;
  disabled?: boolean;
  useMock?: boolean; // For development/testing
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ 
  onAnalysisComplete, 
  onFilesChange,
  disabled = false,
  useMock = false
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    isProcessing, 
    progress, 
    error, 
    uploadedFiles, 
    currentFile,
    isMock
  } = useSelector((state: RootState) => state.ai);
  
  const [localFiles, setLocalFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Initialize mock mode if specified
  useEffect(() => {
    if (useMock && !isMock) {
      dispatch(setMockMode(true));
    }
  }, [dispatch, useMock, isMock]);

  // Sync with Redux
  useEffect(() => {
    if (uploadedFiles.length > 0) {
      setLocalFiles(uploadedFiles);
    }
  }, [uploadedFiles]);

  // Notify parent of file changes
  useEffect(() => {
    if (onFilesChange) {
      onFilesChange(localFiles);
    }
  }, [localFiles, onFilesChange]);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    // Handle file rejections (e.g., wrong file type, too large)
    if (fileRejections.length > 0) {
      const rejection = fileRejections[0];
      const errorMessage = rejection.errors[0].code === 'file-too-large'
        ? 'File is too large. Maximum size is 10MB.'
        : 'Invalid file type. Please upload PDF, DOC, DOCX, or TXT files.';
      
      dispatch(clearAIState());
      return;
    }

    const newFiles = [...localFiles, ...acceptedFiles];
    setLocalFiles(newFiles);
    dispatch(clearAIState());
  }, [dispatch, localFiles]);

  const removeFile = (fileName: string) => {
    const newFiles = localFiles.filter(file => file.name !== fileName);
    setLocalFiles(newFiles);
    if (newFiles.length === 0) {
      dispatch(clearAIState());
    }
  };

  const handleProcess = async () => {
    if (localFiles.length === 0) return;
    
    setShowSuccess(false);
    
    try {
      const resultAction = await dispatch(processDocuments({ 
        files: localFiles,
        useMock: useMock || isMock
      }));
      
      if (processDocuments.fulfilled.match(resultAction)) {
        setShowSuccess(true);
        if (onAnalysisComplete) {
          onAnalysisComplete(resultAction.payload);
        }
      }
    } catch (err) {
      console.error('Error processing documents:', err);
    }
  };

  const handleCancel = () => {
    dispatch(cancelProcessing());
  };

  const handleToggleMock = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setMockMode(event.target.checked));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDropAccepted: () => setIsDragging(false),
    disabled: disabled || isProcessing,
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true,
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper
        {...getRootProps()}
        variant="outlined"
        sx={{
          p: 4,
          border: '2px dashed',
          borderColor: isDragging ? 'primary.main' : 'divider',
          backgroundColor: isDragging ? 'action.hover' : 'background.paper',
          transition: 'all 0.2s ease-in-out',
          cursor: disabled || isProcessing ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.7 : 1,
          '&:hover': {
            borderColor: disabled ? 'divider' : 'primary.main',
            backgroundColor: disabled ? 'background.paper' : 'action.hover',
          },
        }}
      >
        <input 
          {...getInputProps()} 
          id="document-upload-input"
          name="document-upload"
          data-testid="document-upload-input"
        />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          {isProcessing ? (
            <CircularProgress size={48} />
          ) : (
            <CloudUpload fontSize="large" color={isDragging ? 'primary' : disabled ? 'disabled' : 'action'} />
          )}
          <Typography variant="h6" component="div" color={disabled ? 'text.disabled' : 'text.primary'}>
            {isProcessing 
              ? 'Processing documents...' 
              : isDragging 
                ? 'Drop the files here' 
                : 'Drag & drop files here, or click to select'}
          </Typography>
          <Typography variant="body2" color={disabled ? 'text.disabled' : 'text.secondary'}>
            Supported formats: PDF, DOC, DOCX, TXT (Max 10MB)
          </Typography>
        </Box>
      </Paper>

      {/* Progress Bar */}
      {isProcessing && (
        <Box sx={{ width: '100%', mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Analyzing documents...
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {Math.round(progress || 0)}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={progress || 0} 
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
      )}

      {/* Error Alert */}
      {error && (
        <Collapse in={!!error}>
          <Alert 
            severity="error" 
            sx={{ mt: 2 }}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => dispatch(clearAIState())}
              >
                <Close fontSize="inherit" />
              </IconButton>
            }
          >
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        </Collapse>
      )}

      {/* Success Alert */}
      <Collapse in={showSuccess}>
        <Alert 
          severity="success" 
          sx={{ mt: 2 }}
          icon={<CheckCircle fontSize="inherit" />}
          onClose={() => setShowSuccess(false)}
        >
          <AlertTitle>Analysis Complete</AlertTitle>
          Documents have been successfully analyzed. Review the results below.
        </Alert>
      </Collapse>

      {/* File List */}
      {localFiles.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1">
              Selected Files ({localFiles.length}):
            </Typography>
            {process.env.NODE_ENV === 'development' && (
              <Tooltip 
                title={isMock 
                  ? 'Using mock data for testing. Toggle to connect to real API.' 
                  : 'Using real API. Toggle to use mock data for testing.'}
                placement="left"
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={isMock}
                      onChange={handleToggleMock}
                      disabled={isProcessing}
                      size="small"
                      color="primary"
                    />
                  }
                  label={
                    <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ mr: 0.5 }}>
                        {isMock ? 'Mock Mode' : 'API Mode'}
                      </Typography>
                      <HelpOutlineIcon 
                        fontSize="small" 
                        color="action" 
                        sx={{ cursor: 'help' }}
                        onMouseEnter={() => setShowHelp(true)}
                        onMouseLeave={() => setShowHelp(false)}
                      />
                    </Box>
                  }
                  labelPlacement="start"
                />
              </Tooltip>
            )}
          </Box>
          
          {/* Help tooltip for mock mode */}
          <Collapse in={showHelp}>
            <Alert 
              severity="info" 
              icon={false}
              sx={{ 
                mb: 2, 
                py: 0.5,
                '& .MuiAlert-message': { 
                  padding: '4px 0',
                  '& p': { margin: 0 }
                } 
              }}
            >
              <Typography variant="caption">
                Mock mode uses simulated responses for testing without calling the actual API.
                Toggle off to connect to the real document processing service.
              </Typography>
            </Alert>
          </Collapse>
          
          <Paper variant="outlined" sx={{ maxHeight: 200, overflow: 'auto' }}>
            <List dense>
              {localFiles.map((file: File, index: number) => (
                <React.Fragment key={`${file.name}-${index}`}>
                  <ListItem
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label="remove"
                        onClick={() => removeFile(file.name)}
                        disabled={disabled || isProcessing}
                        size="small"
                        sx={{ ml: 1 }}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    }
                    sx={{
                      '&:hover': { bgcolor: 'action.hover' },
                      borderRadius: 1,
                      pr: 6,
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <InsertDriveFile 
                        color={disabled ? 'disabled' : 'primary'} 
                        fontSize="small" 
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography 
                          variant="body2" 
                          noWrap 
                          title={file.name}
                          sx={{ 
                            maxWidth: 300,
                            textOverflow: 'ellipsis',
                            overflow: 'hidden'
                          }}
                        >
                          {file.name}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {formatFileSize(file.size)}
                          {isProcessing && currentFile === file.name && ' • Processing...'}
                        </Typography>
                      }
                      sx={{ my: 0 }}
                    />
                  </ListItem>
                  {index < localFiles.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
          
          {/* Action Buttons */}
          <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            {isProcessing ? (
              <Button
                variant="outlined"
                color="error"
                onClick={handleCancel}
                startIcon={<CancelIcon />}
                disabled={!isProcessing}
              >
                Cancel
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleProcess}
                disabled={disabled || localFiles.length === 0 || isProcessing}
                startIcon={
                  isProcessing ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <CloudUpload />
                  )
                }
                sx={{ minWidth: 150 }}
              >
                {isProcessing ? 'Processing...' : 'Process Documents'}
              </Button>
            )}
          </Box>
        </Box>
      )}
      
      {!localFiles.length && !isProcessing && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No files selected. Drag and drop files above or click to browse.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default DocumentUpload;
