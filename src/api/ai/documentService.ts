import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

export interface DocumentAnalysisResult {
  projectName: string;
  description: string;
  phases: Array<{
    name: string;
    description: string;
    order?: number;
  }>;
  personas: Array<{
    name: string;
    description: string;
    goals: string[];
    painPoints: string[];
  }>;
  requirements: string[];
  errors?: Array<{ error: string; details: string }>;
}

export interface UploadProgressEvent {
  loaded: number;
  total?: number;
  progress: number; // 0-100
  file: string;
}

export type ProgressCallback = (progress: UploadProgressEvent) => void;

export const analyzeDocuments = async (
  files: File[],
  onProgress?: ProgressCallback,
  signal?: AbortSignal
): Promise<DocumentAnalysisResult> => {
  const formData = new FormData();
  
  // Add files to form data
  files.forEach((file) => {
    formData.append('documents', file);
  });

  try {
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            progress: Math.min(90, progress), // Cap at 90% to leave room for processing
            file: 'Uploading...',
          });
        }
      },
      signal,
    };

    const response: AxiosResponse<DocumentAnalysisResult> = await axios.post(
      '/api/process-documents',
      formData,
      config
    );

    // Update progress to 100% when complete
    if (onProgress) {
      onProgress({
        loaded: 1,
        total: 1,
        progress: 100,
        file: 'Analysis complete',
      });
    }

    return response.data;
  } catch (error) {
    console.error('Error analyzing documents:', error);
    
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message;
      throw new Error(`Failed to analyze documents: ${message}`);
    }
    
    throw new Error('Failed to analyze documents. Please try again.');
  }
};

// Mock implementation for development
export const mockAnalyzeDocuments = (
  onProgress?: ProgressCallback
): Promise<DocumentAnalysisResult> => {
  return new Promise((resolve) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (onProgress) {
        onProgress({
          loaded: progress,
          total: 100,
          progress: Math.min(90, progress), // Cap at 90% for processing
          file: 'Simulating upload...',
        });
      }
      
      if (progress >= 90) {
        clearInterval(interval);
        setTimeout(() => {
          if (onProgress) {
            onProgress({
              loaded: 100,
              total: 100,
              progress: 100,
              file: 'Analysis complete',
            });
          }
          
          setTimeout(() => {
            resolve({
              projectName: 'Sample Project',
              description: 'This is a sample project generated from the uploaded documents.',
              phases: [
                {
                  name: 'Discovery',
                  description: 'Initial research and requirements gathering',
                  order: 1,
                },
                {
                  name: 'Design',
                  description: 'UI/UX and system design',
                  order: 2,
                },
              ],
              personas: [
                {
                  name: 'End User',
                  description: 'Primary user of the application',
                  goals: ['Ease of use', 'Efficiency'],
                  painPoints: ['Complex workflows', 'Slow performance'],
                },
              ],
              requirements: [
                'User authentication system',
                'Responsive design',
                'Data export functionality',
              ],
            });
          }, 300);
        }, 500);
      }
    }, 150);
  });
};
