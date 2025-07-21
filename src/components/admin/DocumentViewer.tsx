import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Download, Check, AlertCircle } from 'lucide-react';
import type { VerificationDocument } from '../../services/adminVerificationService';

interface DocumentViewerProps {
  document: VerificationDocument;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (documentId: string, notes?: string) => Promise<void>;
  onReject?: (documentId: string, reason: string, notes?: string) => Promise<void>;
}

const DOCUMENT_TYPE_LABELS = {
  id_card: 'ID Card Photo',
  selfie_with_id: 'Selfie with ID',
  newspaper_photo: 'Newspaper Photo',
  upper_body_selfie: 'Upper Body Selfie'
};

const REJECTION_REASONS = [
  'Blurry or unclear image',
  'Document not fully visible',
  'Poor lighting',
  'Invalid or expired document',
  'Person does not match ID',
  'Newspaper date not readable',
  'Document appears to be fake',
  'Wrong document type uploaded',
  'Other (specify in notes)'
];

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  isOpen,
  onClose,
  onApprove,
  onReject
}) => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  if (!isOpen) return null;

  const handleApprove = async () => {
    if (!onApprove) return;
    
    try {
      setProcessing(true);
      await onApprove(document.id, approvalNotes || undefined);
      setShowApprovalForm(false);
      setApprovalNotes('');
      onClose();
    } catch (error) {
      console.error('Error approving document:', error);
      alert('Error approving document. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!onReject || !rejectionReason) return;
    
    try {
      setProcessing(true);
      await onReject(document.id, rejectionReason, rejectionNotes || undefined);
      setShowRejectionForm(false);
      setRejectionReason('');
      setRejectionNotes('');
      onClose();
    } catch (error) {
      console.error('Error rejecting document:', error);
      alert('Error rejecting document. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {DOCUMENT_TYPE_LABELS[document.document_type]}
            </h2>
            <div className="flex items-center space-x-4 mt-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(document.verification_status)}`}>
                {document.verification_status.charAt(0).toUpperCase() + document.verification_status.slice(1)}
              </span>
              <span className="text-sm text-gray-500">
                Uploaded {new Date(document.uploaded_at).toLocaleDateString()}
              </span>
              <span className="text-sm text-gray-500">
                {formatFileSize(document.file_size)}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-200px)]">
          {/* Image Viewer */}
          <div className="flex-1 bg-gray-100 flex items-center justify-center p-4">
            <div className="relative">
              <img
                src={document.file_url}
                alt={DOCUMENT_TYPE_LABELS[document.document_type]}
                className="max-w-full max-h-full object-contain shadow-lg rounded"
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transition: 'transform 0.2s ease'
                }}
              />
            </div>
          </div>

          {/* Controls and Actions */}
          <div className="w-80 bg-white border-l p-6 overflow-y-auto">
            {/* Zoom Controls */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">View Controls</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Zoom</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setZoom(Math.max(25, zoom - 25))}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-medium w-12 text-center">{zoom}%</span>
                    <button
                      onClick={() => setZoom(Math.min(400, zoom + 25))}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Rotate</span>
                  <button
                    onClick={() => setRotation((rotation + 90) % 360)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Download</span>
                  <a
                    href={document.file_url}
                    download={document.file_name}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Document Info */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Document Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">File Name:</span>
                  <span className="text-gray-900 truncate ml-2">{document.file_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="text-gray-900">{document.mime_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Size:</span>
                  <span className="text-gray-900">{formatFileSize(document.file_size)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Uploaded:</span>
                  <span className="text-gray-900">{new Date(document.uploaded_at).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Previous Admin Notes */}
            {document.admin_notes && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Previous Notes</h3>
                <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                  {document.admin_notes}
                </div>
              </div>
            )}

            {/* Rejection Reason */}
            {document.rejection_reason && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Rejection Reason</h3>
                <div className="p-3 bg-red-50 rounded-lg text-sm text-red-700">
                  {document.rejection_reason}
                </div>
              </div>
            )}

            {/* Actions */}
            {document.verification_status === 'pending' && (onApprove || onReject) && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-900">Actions</h3>
                
                {!showApprovalForm && !showRejectionForm && (
                  <div className="space-y-2">
                    {onApprove && (
                      <button
                        onClick={() => setShowApprovalForm(true)}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <Check className="h-4 w-4" />
                        <span>Approve Document</span>
                      </button>
                    )}
                    {onReject && (
                      <button
                        onClick={() => setShowRejectionForm(true)}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <AlertCircle className="h-4 w-4" />
                        <span>Reject Document</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Approval Form */}
                {showApprovalForm && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Approval Notes (Optional)
                      </label>
                      <textarea
                        value={approvalNotes}
                        onChange={(e) => setApprovalNotes(e.target.value)}
                        placeholder="Add any notes about this approval..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        rows={3}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleApprove}
                        disabled={processing}
                        className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        {processing ? 'Approving...' : 'Confirm Approval'}
                      </button>
                      <button
                        onClick={() => setShowApprovalForm(false)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Rejection Form */}
                {showRejectionForm && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rejection Reason *
                      </label>
                      <select
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="">Select a reason...</option>
                        {REJECTION_REASONS.map(reason => (
                          <option key={reason} value={reason}>{reason}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Notes (Optional)
                      </label>
                      <textarea
                        value={rejectionNotes}
                        onChange={(e) => setRejectionNotes(e.target.value)}
                        placeholder="Provide additional details..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        rows={3}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleReject}
                        disabled={processing || !rejectionReason}
                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        {processing ? 'Rejecting...' : 'Confirm Rejection'}
                      </button>
                      <button
                        onClick={() => setShowRejectionForm(false)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 