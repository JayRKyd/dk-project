import React, { useState, useRef, useCallback } from 'react';
import { Upload, CheckCircle, AlertCircle, X, Eye, Trash2, Camera } from 'lucide-react';

interface ClientDocumentUploadProps {
  documentType: string;
  title: string;
  description: string;
  exampleImage?: string;
  onUpload: (file: File) => void;
  onDelete: () => void;
  uploading: boolean;
  existingDocument?: {
    id: string;
    file_name: string;
    verification_status: 'pending' | 'approved' | 'rejected';
    verification_notes?: string;
  };
  maxSize: number;
  acceptedTypes: string[];
}

export default function ClientDocumentUpload({
  documentType,
  title,
  description,
  exampleImage,
  onUpload,
  onDelete,
  uploading,
  existingDocument,
  maxSize,
  acceptedTypes
}: ClientDocumentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    setError(null);

    // Validate file size
    if (file.size > maxSize) {
      setError(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`);
      return;
    }

    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      setError('Only JPEG and PNG images are allowed');
      return;
    }

    setSelectedFile(file);
  }, [maxSize, acceptedTypes]);

  // Handle file upload
  const handleUpload = useCallback(() => {
    if (selectedFile) {
      onUpload(selectedFile);
      setSelectedFile(null);
    }
  }, [selectedFile, onUpload]);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!uploading) {
      setIsDragOver(true);
    }
  }, [uploading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (uploading) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [uploading, handleFileSelect]);

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Handle click to select file
  const handleSelectClick = useCallback(() => {
    if (!uploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [uploading]);

  // Get status display
  const getStatusDisplay = () => {
    if (uploading) {
      return {
        color: 'text-pink-600',
        bgColor: 'bg-pink-50',
        borderColor: 'border-pink-200',
        icon: <Upload className="h-5 w-5 animate-spin" />,
        text: 'Uploading...'
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
            text: 'Approved'
          };
        case 'rejected':
          return {
            color: 'text-red-600',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            icon: <AlertCircle className="h-5 w-5" />,
            text: 'Rejected'
          };
        default:
          return {
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-200',
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
      text: 'Not uploaded'
    };
  };

  const status = getStatusDisplay();

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 text-sm mb-4">{description}</p>
          
          {/* Status */}
          <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${status.bgColor} ${status.color} ${status.borderColor} border`}>
            {status.icon}
            <span>{status.text}</span>
          </div>
        </div>

        {/* Example Image */}
        {exampleImage && (
          <div className="ml-6 flex-shrink-0">
            <div className="w-24 h-32 bg-gray-100 rounded-lg overflow-hidden">
              <img 
                src={exampleImage} 
                alt={`Example ${title}`}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-xs text-gray-500 text-center mt-1">Example</p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Rejection Reason */}
      {existingDocument?.verification_status === 'rejected' && existingDocument.verification_notes && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
              <p className="text-sm text-red-700">{existingDocument.verification_notes}</p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          isDragOver
            ? 'border-pink-300 bg-pink-50'
            : uploading
            ? 'border-gray-200 bg-gray-50'
            : 'border-gray-300 hover:border-pink-300 hover:bg-pink-50 cursor-pointer'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!uploading && !selectedFile ? handleSelectClick : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={uploading}
        />

        <div className="text-center">
          {selectedFile ? (
            // File selected, show preview and upload button
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <Camera className="h-8 w-8 text-pink-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-center space-x-3">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload now</span>
                </button>
                
                <button
                  onClick={() => setSelectedFile(null)}
                  disabled={uploading}
                  className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : existingDocument ? (
            // Document already uploaded
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{existingDocument.file_name}</p>
                  <p className="text-xs text-gray-500">Document uploaded</p>
                </div>
              </div>
              
              <div className="flex items-center justify-center space-x-3">
                <button
                  onClick={handleSelectClick}
                  disabled={uploading}
                  className="text-pink-500 hover:text-pink-600 disabled:opacity-50 flex items-center space-x-1"
                >
                  <Upload className="h-4 w-4" />
                  <span>Replace</span>
                </button>
                
                <button
                  onClick={onDelete}
                  disabled={uploading}
                  className="text-red-500 hover:text-red-600 disabled:opacity-50 flex items-center space-x-1"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ) : (
            // No file selected, show upload prompt
            <div className="space-y-4">
              <Upload className="h-12 w-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-gray-900 font-medium">Click to select file or drag and drop</p>
                <p className="text-gray-500 text-sm mt-1">
                  JPEG, PNG up to {Math.round(maxSize / (1024 * 1024))}MB
                </p>
              </div>
              
              <button
                onClick={handleSelectClick}
                disabled={uploading}
                className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Select file
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 