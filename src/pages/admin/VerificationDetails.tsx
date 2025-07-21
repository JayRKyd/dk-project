import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getDocuments, VerificationDocument } from '../../services/documentService';
import { ImageViewer } from '../../components/ui/ImageViewer';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { getUserProfile, UserProfile } from '../../services/userVerificationService';

const formatDocumentType = (type: string): string => {
  const replacements: Record<string, string> = {
    'id_card': 'ID Card',
    'selfie_with_id': 'Selfie with ID',
    'newspaper_photo': 'Newspaper Photo',
    'upper_body_selfie': 'Upper Body Selfie',
    'license': 'License',
    'proof_of_address': 'Proof of Address',
    'owner_id': 'Owner ID'
  };
  return replacements[type] || type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export default function VerificationDetails() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<VerificationDocument[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<'client' | 'lady' | 'club' | null>(null);

  useEffect(() => {
    const loadVerificationDetails = async () => {
      if (!id) {
        setError('No user ID provided');
        setLoading(false);
        return;
      }

      try {
        // First get the user's profile
        const profile = await getUserProfile(id);
        if (!profile) {
          throw new Error('User not found');
        }
        setUserProfile(profile);
        setUserRole(profile.role);

        // Then get their documents
        const docs = await getDocuments(id, profile.role);
        setDocuments(docs);
        setLoading(false);
      } catch (error) {
        console.error('Error loading verification details:', error);
        setError(error instanceof Error ? error.message : 'Failed to load verification details');
        setLoading(false);
      }
    };

    loadVerificationDetails();
  }, [id]);

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (error || !userRole) {
    return (
      <AdminLayout>
        <div className="p-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error || 'Failed to determine user role'}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* User Profile Section */}
        {userProfile && (
          <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  {userProfile.username}
                </h2>
                <p className="text-gray-600">{userProfile.email}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="capitalize px-3 py-1 rounded-full text-sm font-medium bg-pink-100 text-pink-800">
                  {userProfile.role}
                </span>
                <span className="flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-100">
                  {getStatusIcon(userProfile.verification_status)}
                  <span className="capitalize">{userProfile.verification_status || 'Pending'}</span>
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Member Since:</span>{' '}
                {formatDate(userProfile.created_at)}
              </div>
              {userProfile.verification_submitted_at && (
                <div>
                  <span className="font-medium">Verification Submitted:</span>{' '}
                  {formatDate(userProfile.verification_submitted_at)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {formatDocumentType(doc.document_type)}
                  </h3>
                  <span className="flex items-center space-x-1 px-2 py-1 rounded-full text-sm font-medium bg-gray-100">
                    {getStatusIcon(doc.verification_status)}
                    <span className="capitalize">{doc.verification_status}</span>
                  </span>
                </div>
                <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
                  <ImageViewer
                    src={doc.file_url}
                    alt={formatDocumentType(doc.document_type)}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  <p>Uploaded: {formatDate(doc.created_at)}</p>
                  {doc.verified_at && (
                    <p>Verified: {formatDate(doc.verified_at)}</p>
                  )}
                  {doc.verification_notes && (
                    <p className="mt-2 text-gray-700">{doc.verification_notes}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {documents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No verification documents found
          </div>
        )}
      </div>
    </AdminLayout>
  );
} 