import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageViewerProps {
  src: string;
  alt: string;
  className?: string;
  maxRetries?: number;
  retryDelay?: number;
  onError?: (error: Error) => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  src,
  alt,
  className = '',
  maxRetries = 3,
  retryDelay = 1000,
  onError
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setRetryCount(0);
  }, [src]);

  const handleLoad = () => {
    setLoading(false);
    setError(null);
  };

  const handleError = () => {
    if (retryCount < maxRetries) {
      // Retry loading with exponential backoff
      const timeout = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        const img = new Image();
        img.src = src;
      }, retryDelay * Math.pow(2, retryCount));

      return () => clearTimeout(timeout);
    } else {
      const error = new Error(`Failed to load image after ${maxRetries} attempts`);
      setError(error);
      setLoading(false);
      if (onError) {
        onError(error);
      }
    }
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setRetryCount(0);
    const img = new Image();
    img.src = src;
  };

  const toggleZoom = () => {
    setZoomed(!zoomed);
  };

  return (
    <div className="relative group">
      {/* Loading Spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
          <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
          {retryCount > 0 && (
            <span className="ml-2 text-sm text-gray-600">
              Retry {retryCount}/{maxRetries}...
            </span>
          )}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50">
          <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
          <p className="text-sm text-red-600 mb-2">Failed to load image</p>
          <button
            onClick={handleRetry}
            className="flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Retry
          </button>
        </div>
      )}

      {/* Image */}
      <div className={`relative ${zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}>
        <img
          src={src}
          alt={alt}
          className={`
            w-full h-full object-contain rounded-lg transition-transform duration-200
            ${zoomed ? 'scale-150' : 'scale-100'}
            ${className}
          `}
          onLoad={handleLoad}
          onError={handleError}
          onClick={toggleZoom}
        />

        {/* Zoom Button */}
        <button
          onClick={toggleZoom}
          className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {zoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}; 