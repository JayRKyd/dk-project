import React, { useState, useRef, useCallback } from 'react';
import { Upload, Camera, CheckCircle, AlertCircle, X, Eye, Trash2, RotateCcw } from 'lucide-react';
import { DocumentType, DOCUMENT_CONFIGS, verificationService } from '../../services/verificationService';

// Example images mapping
const EXAMPLE_IMAGES = {
  id_card: '/images/1.IDcard.png',
  selfie_with_id: '/images/2.-Lady-IDcard.png', 
  newspaper_photo: '/images/3.-Lady-Newspaper.png',
  upper_body_selfie: '/images/4.-Lady-selfie.png'
} as const;

// Step numbering for document types
const STEP_NUMBERS = {
  id_card: '1)',
  selfie_with_id: '2)',
  newspaper_photo: '3)',
  upper_body_selfie: '4)'
} as const;

interface DocumentUploadProps {
  documentType: DocumentType;
  onUploadComplete: (fileUrl: string, fileName: string) => void;
  onUploadError: (error: string) => void;
  existingDocument?: {
    id: string;
    file_url: string;
    file_name: string;
    verification_status: 'pending' | 'approved' | 'rejected';
    rejection_reason?: string;
  };
  disabled?: boolean;
}

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  isDragOver: boolean;
  previewUrl: string | null;
  showPreview: boolean;
  selectedFile: File | null;
}

export default function DocumentUpload({
  documentType,
  onUploadComplete,
  onUploadError,
  existingDocument,
  disabled = false
}: DocumentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    isDragOver: false,
    previewUrl: existingDocument?.file_url || null,
    showPreview: false,
    selectedFile: null
  });

  const config = DOCUMENT_CONFIGS[documentType];

  // Handle file selection (just store the file)
  const handleFileSelect = useCallback((file: File) => {
    if (disabled || uploadState.isUploading) return;

    setUploadState(prev => ({
      ...prev,
      selectedFile: file,
      error: null
    }));
  }, [disabled, uploadState.isUploading]);

  // Handle actual file upload
  const handleUploadFile = useCallback(async () => {
    if (!uploadState.selectedFile || disabled || uploadState.isUploading) return;

    setUploadState(prev => ({
      ...prev,
      isUploading: true,
      progress: 0,
      error: null
    }));

    try {
      // Upload the document
      const result = await verificationService.uploadDocument(
        uploadState.selectedFile,
        documentType,
        (progress) => {
          setUploadState(prev => ({ ...prev, progress }));
        }
      );

      if (result.success && result.fileUrl) {
        setUploadState(prev => ({
          ...prev,
          isUploading: false,
          progress: 100,
          previewUrl: result.fileUrl!,
          error: null,
          selectedFile: null
        }));
        
        onUploadComplete(result.fileUrl, result.document?.file_name || uploadState.selectedFile.name);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        progress: 0,
        error: errorMessage,
        previewUrl: null
      }));
      
      onUploadError(errorMessage);
    }
  }, [documentType, disabled, uploadState.isUploading, uploadState.selectedFile, onUploadComplete, onUploadError]);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !uploadState.isUploading) {
      setUploadState(prev => ({ ...prev, isDragOver: true }));
    }
  }, [disabled, uploadState.isUploading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setUploadState(prev => ({ ...prev, isDragOver: false }));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setUploadState(prev => ({ ...prev, isDragOver: false }));
    
    if (disabled || uploadState.isUploading) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [disabled, uploadState.isUploading, handleFileSelect]);

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Handle click to select file
  const handleUploadClick = useCallback(() => {
    if (!disabled && !uploadState.isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled, uploadState.isUploading]);

  // Handle delete document
  const handleDeleteDocument = useCallback(async () => {
    if (!existingDocument) return;

    try {
      const result = await verificationService.deleteDocument(existingDocument.id);
      if (result.success) {
        setUploadState(prev => ({
          ...prev,
          previewUrl: null,
          error: null
        }));
      } else {
        setUploadState(prev => ({
          ...prev,
          error: result.error || 'Failed to delete document'
        }));
      }
    } catch (error) {
      setUploadState(prev => ({
        ...prev,
        error: 'Failed to delete document'
      }));
    }
  }, [existingDocument]);

  // Get status color and icon
  const getStatusDisplay = () => {
    if (uploadState.isUploading) {
      return {
        color: 'text-pink-600',
        bgColor: 'bg-pink-50',
        borderColor: 'border-pink-200',
        icon: <Upload className="h-5 w-5 animate-spin" />,
        text: `Uploading... ${uploadState.progress}%`
      };
    }

    if (uploadState.error) {
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: <AlertCircle className="h-5 w-5" />,
        text: uploadState.error
      };
    }

    if (existingDocument) {
      switch (existingDocument.verification_status) {
        case 'approved':
          return {
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            icon: <CheckCircle className="h-5 w-5" />,
            text: 'Approved ✓'
          };
        case 'rejected':
          return {
            color: 'text-red-600',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            icon: <AlertCircle className="h-5 w-5" />,
            text: `Rejected: ${existingDocument.rejection_reason || 'Please re-upload'}`
          };
        case 'pending':
          return {
            color: 'text-pink-600',
            bgColor: 'bg-pink-50',
            borderColor: 'border-pink-200',
            icon: <Upload className="h-5 w-5" />,
            text: 'Under Review'
          };
      }
    }

    return {
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      icon: <Upload className="h-5 w-5" />,
      text: 'Ready to upload'
    };
  };

  const statusDisplay = getStatusDisplay();
  const hasDocument = uploadState.previewUrl || existingDocument;
  const canUpload = !disabled && !uploadState.isUploading && (!existingDocument || existingDocument.verification_status === 'rejected');

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Document Header */}
      <div className="flex items-start space-x-6">
        {/* Example Image */}
        <div className="flex-shrink-0">
          <img
            src={EXAMPLE_IMAGES[documentType]}
            alt={`${config.title} example`}
            className="w-32 h-32 object-cover rounded-lg border border-gray-200"
          />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {STEP_NUMBERS[documentType]} {config.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{config.description}</p>
          </div>

          {/* Status Display */}
          {(existingDocument || uploadState.error || uploadState.isUploading) && (
            <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-lg text-sm ${statusDisplay.bgColor} ${statusDisplay.color}`}>
              {statusDisplay.icon}
              <span>{statusDisplay.text}</span>
            </div>
          )}

          {/* File Selection and Upload */}
          <div className="space-y-3">
            {/* Selected File Display */}
            {uploadState.selectedFile && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700">
                  <strong>Selected:</strong> {uploadState.selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  Size: {(uploadState.selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}

            {/* Upload Progress */}
            {uploadState.isUploading && (
              <div className="space-y-2">
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadState.progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600">Uploading... {uploadState.progress}%</p>
              </div>
            )}

            {/* Uploaded File Preview */}
            {hasDocument && uploadState.previewUrl && (
              <div className="bg-green-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-green-800">
                      {existingDocument?.file_name || 'File uploaded successfully'}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setUploadState(prev => ({ ...prev, showPreview: true }))}
                      className="text-green-600 hover:text-green-800"
                      title="View full size"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {canUpload && (
                      <button
                        onClick={handleDeleteDocument}
                        className="text-red-600 hover:text-red-800"
                        title="Delete and re-upload"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {canUpload && (
              <div className="flex space-x-3">
                <button
                  onClick={handleUploadClick}
                  disabled={uploadState.isUploading}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Select file
                </button>
                
                <button
                  onClick={handleUploadFile}
                  disabled={!uploadState.selectedFile || uploadState.isUploading}
                  className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadState.isUploading ? 'Uploading...' : 'Upload now'}
                </button>
              </div>
            )}

            {/* Error Display */}
            {uploadState.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="text-red-800 text-sm">{uploadState.error}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden drag-and-drop area for convenience */}
      <div
        className={`
          mt-4 border-2 border-dashed rounded-lg p-4 text-center transition-all
          ${uploadState.isDragOver ? 'border-pink-400 bg-pink-50' : 'border-gray-200'}
          ${canUpload ? 'hover:bg-gray-50' : 'cursor-not-allowed'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={!canUpload}
        />
        
        <p className="text-sm text-gray-500">
          Or drag and drop your file here
        </p>
      </div>

      {/* Full Size Preview Modal */}
      {uploadState.showPreview && uploadState.previewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setUploadState(prev => ({ ...prev, showPreview: false }))}
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 z-10"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={uploadState.previewUrl}
              alt={`${config.title} full size`}
              className="max-w-full max-h-full rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
} 