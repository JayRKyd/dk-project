import React, { useState } from 'react';
import { VerificationDocument } from '../../services/documentService';
import { ImageViewer } from '../ui/ImageViewer';
import { AlertCircle, Loader2 } from 'lucide-react';

interface VerificationDocumentViewerProps {
  documents: VerificationDocument[];
  onApprove: (documentId: string) => void;
  onReject: (documentId: string, reason: string) => void;
  actionInProgress?: string | null;
}

export const VerificationDocumentViewer: React.FC<VerificationDocumentViewerProps> = ({
  documents,
  onApprove,
  onReject,
  actionInProgress
}) => {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const getDocumentTitle = (type: string) => {
    const titles: Record<string, string> = {
      id_card: 'ID Card',
      selfie_with_id: 'Selfie with ID',
      newspaper_photo: 'Newspaper Photo',
      upper_body_selfie: 'Upper Body Selfie',
      license: 'Business License',
      proof_of_address: 'Proof of Address',
      owner_id: 'Owner ID'
    };
    return titles[type] || type;
  };

  const handleImageError = (docId: string, error: Error) => {
    console.error(`Error loading image for document ${docId}:`, error);
    setImageErrors(prev => ({ ...prev, [docId]: true }));
  };

  const handleReject = (docId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      onReject(docId, reason);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((doc) => (
        <div key={doc.id} className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold mb-2">{getDocumentTitle(doc.document_type)}</h3>
          
          {/* Document Image */}
          <div className="relative aspect-video mb-4">
            <ImageViewer
              src={doc.file_url}
              alt={getDocumentTitle(doc.document_type)}
              onError={(error) => handleImageError(doc.id, error)}
            />
            {imageErrors[doc.id] && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 rounded-lg">
                <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                <p className="text-sm text-red-600">Image unavailable</p>
              </div>
            )}
          </div>

          {/* Document Status */}
          <div className="mb-4">
            <span className={`px-2 py-1 rounded text-sm font-medium ${
              doc.verification_status === 'approved' ? 'bg-green-100 text-green-800' :
              doc.verification_status === 'rejected' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {doc.verification_status.charAt(0).toUpperCase() + doc.verification_status.slice(1)}
            </span>
          </div>

          {/* Document Details */}
          <div className="text-sm text-gray-600 mb-4">
            <p>Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}</p>
            {doc.verified_at && (
              <p>Verified: {new Date(doc.verified_at).toLocaleDateString()}</p>
            )}
            {doc.rejection_reason && (
              <p className="text-red-600">Reason: {doc.rejection_reason}</p>
            )}
            {doc.admin_notes && (
              <p className="italic">Notes: {doc.admin_notes}</p>
            )}
          </div>

          {/* Action Buttons */}
          {doc.verification_status === 'pending' && (
            <div className="flex gap-2">
              <button
                onClick={() => onApprove(doc.id)}
                className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={imageErrors[doc.id] || actionInProgress === doc.id}
              >
                {actionInProgress === doc.id ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Processing...
                  </div>
                ) : (
                  'Approve'
                )}
              </button>
              <button
                onClick={() => handleReject(doc.id)}
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={imageErrors[doc.id] || actionInProgress === doc.id}
              >
                {actionInProgress === doc.id ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Processing...
                  </div>
                ) : (
                  'Reject'
                )}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}; 