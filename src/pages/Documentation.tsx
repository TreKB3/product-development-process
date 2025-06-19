import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper } from '@mui/material';

const Documentation: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Project Documentation
        </Typography>
        <Typography variant="body1" paragraph>
          Documentation for project {id} will be displayed here.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This is a placeholder for the project documentation page. You can add markdown support, 
          file uploads, or any other documentation features as needed.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Documentation;
