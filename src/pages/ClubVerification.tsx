import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, Shield, CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface VerificationFile {
  type: 'license' | 'registration' | 'taxId' | 'photo';
  file: File | null;
  status: 'pending' | 'uploading' | 'success' | 'error';
}

export default function ClubVerification() {
  const [files, setFiles] = useState<{ [key: string]: VerificationFile }>({
    license: { type: 'license', file: null, status: 'pending' },
    registration: { type: 'registration', file: null, status: 'pending' },
    taxId: { type: 'taxId', file: null, status: 'pending' },
    photo: { type: 'photo', file: null, status: 'pending' }
  });

  const handleFileChange = (type: 'license' | 'registration' | 'taxId' | 'photo', file: File) => {
    setFiles(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        file,
        status: 'pending'
      }
    }));
  };

  const handleUpload = (type: 'license' | 'registration' | 'taxId' | 'photo') => {
    if (!files[type].file) return;

    setFiles(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        status: 'uploading'
      }
    }));

    // Simulate upload
    setTimeout(() => {
      setFiles(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          status: 'success'
        }
      }));
    }, 1500);
  };

  const allFilesUploaded = Object.values(files).every(file => file.status === 'success');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Link
        to="/dashboard/club"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
      >
        <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
        <span>Back to Dashboard</span>
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Shield className="h-8 w-8 text-green-500" />
          <h1 className="text-2xl font-bold text-gray-900">Verify your Club</h1>
        </div>
        <p className="text-gray-600">
          Get verified to increase trust with your clients and earn more. Verified clubs receive on average 200% more visibility and bookings.
        </p>
      </div>

      {/* Requirements */}
      <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Requirements</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Business License</p>
              <p className="text-gray-600">Valid business license for adult entertainment</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Business Registration</p>
              <p className="text-gray-600">Official business registration documents</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Tax Registration</p>
              <p className="text-gray-600">Valid tax ID and registration</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Upload Verification Documents</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Business License */}
          <div className="space-y-4">
            <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
              <img
                src="https://raw.githubusercontent.com/stackblitz/stackblitz-images/main/business-license.png"
                alt="Business License example"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">1. Business License</h3>
              <p className="text-sm text-gray-600 mb-3">Upload your valid business license for adult entertainment</p>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => e.target.files?.[0] && handleFileChange('license', e.target.files[0])}
                  className="hidden"
                  id="license-upload"
                />
                <label
                  htmlFor="license-upload"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer"
                >
                  Select file
                </label>
                <button
                  onClick={() => handleUpload('license')}
                  disabled={!files.license.file || files.license.status === 'success'}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    files.license.status === 'success'
                      ? 'bg-green-500 text-white'
                      : files.license.file
                      ? 'bg-pink-500 text-white hover:bg-pink-600'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {files.license.status === 'success' ? (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      <span>Uploaded</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      <span>Upload</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Business Registration */}
          <div className="space-y-4">
            <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
              <img
                src="https://raw.githubusercontent.com/stackblitz/stackblitz-images/main/business-registration.png"
                alt="Business Registration example"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">2. Business Registration</h3>
              <p className="text-sm text-gray-600 mb-3">Upload your business registration documents</p>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => e.target.files?.[0] && handleFileChange('registration', e.target.files[0])}
                  className="hidden"
                  id="registration-upload"
                />
                <label
                  htmlFor="registration-upload"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer"
                >
                  Select file
                </label>
                <button
                  onClick={() => handleUpload('registration')}
                  disabled={!files.registration.file || files.registration.status === 'success'}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    files.registration.status === 'success'
                      ? 'bg-green-500 text-white'
                      : files.registration.file
                      ? 'bg-pink-500 text-white hover:bg-pink-600'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {files.registration.status === 'success' ? (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      <span>Uploaded</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      <span>Upload</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Tax ID */}
          <div className="space-y-4">
            <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
              <img
                src="https://raw.githubusercontent.com/stackblitz/stackblitz-images/main/tax-id.png"
                alt="Tax ID example"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">3. Tax Registration</h3>
              <p className="text-sm text-gray-600 mb-3">Upload your tax ID and registration documents</p>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => e.target.files?.[0] && handleFileChange('taxId', e.target.files[0])}
                  className="hidden"
                  id="taxId-upload"
                />
                <label
                  htmlFor="taxId-upload"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer"
                >
                  Select file
                </label>
                <button
                  onClick={() => handleUpload('taxId')}
                  disabled={!files.taxId.file || files.taxId.status === 'success'}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    files.taxId.status === 'success'
                      ? 'bg-green-500 text-white'
                      : files.taxId.file
                      ? 'bg-pink-500 text-white hover:bg-pink-600'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {files.taxId.status === 'success' ? (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      <span>Uploaded</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      <span>Upload</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Club Photo */}
          <div className="space-y-4">
            <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
              <img
                src="https://raw.githubusercontent.com/stackblitz/stackblitz-images/main/club-photo.png"
                alt="Club photo example"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">4. Club Photo</h3>
              <p className="text-sm text-gray-600 mb-3">A clear photo of your club's exterior or main entrance</p>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileChange('photo', e.target.files[0])}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer"
                >
                  Select file
                </label>
                <button
                  onClick={() => handleUpload('photo')}
                  disabled={!files.photo.file || files.photo.status === 'success'}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    files.photo.status === 'success'
                      ? 'bg-green-500 text-white'
                      : files.photo.file
                      ? 'bg-pink-500 text-white hover:bg-pink-600'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {files.photo.status === 'success' ? (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      <span>Uploaded</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      <span>Upload</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Section */}
        <div className="mt-8 pt-6 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-500 mt-1" />
              <div>
                <p className="font-medium text-gray-900">Verification Process</p>
                <p className="text-sm text-gray-600">
                  After uploading all required documents, our team will verify your club within 24-48 hours.
                </p>
              </div>
            </div>
            <button
              disabled={!allFilesUploaded}
              className={`px-6 py-2 rounded-lg font-medium ${
                allFilesUploaded
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Submit for Verification
            </button>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">How long does verification take?</h3>
            <p className="text-gray-600">
              Our team typically verifies clubs within 24-48 hours after receiving all required documents.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">What happens after verification?</h3>
            <p className="text-gray-600">
              Once verified, your club will display a verified badge, receive priority placement in search results, and gain access to premium features.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Are my documents secure?</h3>
            <p className="text-gray-600">
              Yes, all verification documents are encrypted and only accessible to our verification team. They are deleted after verification is complete.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">What if verification is rejected?</h3>
            <p className="text-gray-600">
              If your verification is rejected, we'll explain why and guide you through the process of submitting the correct documents.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}