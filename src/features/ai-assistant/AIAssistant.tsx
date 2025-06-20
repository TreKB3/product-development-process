import React, { useState, useCallback } from 'react';
import { Box, Typography, Stepper, Step, StepLabel, Button, Paper, Alert, CircularProgress } from '@mui/material';
import DocumentUpload from './components/DocumentUpload';

interface AIAssistantProps {
  onProjectGenerated: (projectData: any) => void;
  onCancel: () => void;
}

const steps = ['Upload Documents', 'Review AI Analysis', 'Configure Project'];

const AIAssistant: React.FC<AIAssistantProps> = ({ onProjectGenerated, onCancel }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Navigation handlers
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleNext = useCallback(() => {
    setActiveStep((prevStep) => prevStep + 1);
  }, []);

  // File and analysis handlers
  const handleFilesUploaded = useCallback((uploadedFiles: File[]) => {
    console.log('Files uploaded for processing:', uploadedFiles);
    // Files are now processed through Redux in DocumentUpload
    // The actual processing will be handled by the Redux action
  }, []);

  const handleAnalysisComplete = useCallback((result: any) => {
    console.log('Analysis complete:', result);
    // The result should already be in the correct format from the Redux slice
    setAnalysisResult(result);
    handleNext();
  }, [handleNext]);

  const handleGenerateProject = useCallback(() => {
    if (analysisResult) {
      onProjectGenerated(analysisResult);
    }
  }, [analysisResult, onProjectGenerated]);

  // Mock data to be removed when backend is implemented
  const mockAnalysis = {
    projectName: 'AI-Generated Project',
    description: 'This project was generated based on the uploaded documents.',
    phases: [
      { name: 'Discovery', description: 'Initial research and requirements gathering' },
      { name: 'Design', description: 'UI/UX and system design' },
      { name: 'Development', description: 'Implementation and coding' },
      { name: 'Testing', description: 'Quality assurance and testing' },
      { name: 'Deployment', description: 'Release and deployment' },
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
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <DocumentUpload
            onFilesChange={handleFilesUploaded}
            onAnalysisComplete={handleAnalysisComplete}
            disabled={isProcessing}
          />
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              AI Analysis Results
            </Typography>
            {analysisResult ? (
              <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Project: {analysisResult.projectName}
                </Typography>
                <Typography variant="body1" paragraph>
                  {analysisResult.description}
                </Typography>
                
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Proposed Phases
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 3 }}>
                  {analysisResult.phases.map((phase: any, index: number) => (
                    <li key={index}>
                      <strong>{phase.name}:</strong> {phase.description}
                    </li>
                  ))}
                </Box>

                <Typography variant="h6" gutterBottom>
                  Identified Personas
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 3 }}>
                  {analysisResult.personas.map((persona: any, index: number) => (
                    <li key={index}>
                      <strong>{persona.name}:</strong> {persona.description}
                      <Box component="ul" sx={{ pl: 2 }}>
                        <li><strong>Goals:</strong> {persona.goals.join(', ')}</li>
                        <li><strong>Pain Points:</strong> {persona.painPoints.join(', ')}</li>
                      </Box>
                    </li>
                  ))}
                </Box>

                <Typography variant="h6" gutterBottom>
                  Key Requirements
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  {analysisResult.requirements.map((req: string, index: number) => (
                    <li key={index}>{req}</li>
                  ))}
                </Box>
              </Paper>
            ) : (
              <CircularProgress />
            )}
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Project Configuration
            </Typography>
            <Typography paragraph>
              Review and adjust the generated project settings before creating your project.
            </Typography>
            {/* In a real app, this would include form fields to edit the project details */}
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 4 }}>
        {renderStepContent(activeStep)}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2 }}>
        <Button
          onClick={activeStep === 0 ? onCancel : handleBack}
          disabled={isProcessing}
        >
          {activeStep === 0 ? 'Cancel' : 'Back'}
        </Button>
        
        <Box>
          {activeStep === steps.length - 1 ? (
            <Button 
              variant="contained" 
              onClick={handleGenerateProject}
              disabled={isProcessing}
            >
              Create Project
            </Button>
          ) : (
            <Button 
              variant="contained" 
              onClick={handleNext}
              disabled={isProcessing || (activeStep === 0 && files.length === 0)}
            >
              Next
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default AIAssistant;
