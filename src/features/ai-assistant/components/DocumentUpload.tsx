import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Button, Paper, List, ListItem, ListItemIcon, ListItemText, IconButton, CircularProgress } from '@mui/material';
import { CloudUpload, InsertDriveFile, Close } from '@mui/icons-material';

interface DocumentUploadProps {
  onFilesUploaded: (files: File[]) => void;
  isProcessing?: boolean;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onFilesUploaded, isProcessing = false }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
  }, []);

  const removeFile = (fileName: string) => {
    setFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
  };

  const handleUpload = () => {
    if (files.length > 0) {
      onFilesUploaded(files);
    }
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
    disabled: isProcessing,
  });

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
          cursor: isProcessing ? 'not-allowed' : 'pointer',
          opacity: isProcessing ? 0.7 : 1,
          mb: 3,
        }}
      >
        <input {...getInputProps()} />
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight={150}
        >
          {isProcessing ? (
            <>
              <CircularProgress size={40} sx={{ mb: 2 }} />
              <Typography align="center">Processing documents...</Typography>
            </>
          ) : (
            <>
              <CloudUpload fontSize="large" color="action" sx={{ mb: 2 }} />
              <Typography variant="h6" align="center" gutterBottom>
                {isDragActive ? 'Drop the files here' : 'Drag & drop files here'}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Supported formats: PDF, DOC, DOCX, TXT
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                or
              </Typography>
              <Button variant="contained" sx={{ mt: 2 }}>
                Select Files
              </Button>
            </>
          )}
        </Box>
      </Paper>


      {files.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Selected Files ({files.length})
          </Typography>
          <Paper variant="outlined">
            <List dense>
              {files.map((file) => (
                <ListItem
                  key={file.name}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="remove"
                      onClick={() => removeFile(file.name)}
                      disabled={isProcessing}
                    >
                      <Close />
                    </IconButton>
                  }
                >
                  <ListItemIcon>
                    <InsertDriveFile />
                  </ListItemIcon>
                  <ListItemText
                    primary={file.name}
                    secondary={`${(file.size / 1024).toFixed(1)} KB`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              disabled={isProcessing || files.length === 0}
              startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isProcessing ? 'Processing...' : 'Process Documents'}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default DocumentUpload;
