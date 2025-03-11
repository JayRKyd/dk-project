import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, Shield, CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface VerificationFile {
  type: 'id' | 'selfieWithId' | 'newspaper' | 'photo';
  file: File | null;
  status: 'pending' | 'uploading' | 'success' | 'error';
}

export default function Verification() {
  const [files, setFiles] = useState<{ [key: string]: VerificationFile }>({
    id: { type: 'id', file: null, status: 'pending' },
    selfieWithId: { type: 'selfieWithId', file: null, status: 'pending' },
    newspaper: { type: 'newspaper', file: null, status: 'pending' },
    photo: { type: 'photo', file: null, status: 'pending' }
  });

  const handleFileChange = (type: 'id' | 'selfieWithId' | 'newspaper' | 'photo', file: File) => {
    setFiles(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        file,
        status: 'pending'
      }
    }));
  };

  const handleUpload = (type: 'id' | 'selfieWithId' | 'newspaper' | 'photo') => {
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
        to="/dashboard/lady"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
      >
        <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
        <span>Back to Dashboard</span>
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Shield className="h-8 w-8 text-green-500" />
          <h1 className="text-2xl font-bold text-gray-900">Verify your Account</h1>
        </div>
        <p className="text-gray-600">
          Get verified to increase trust with your clients and earn more. Verified profiles receive on average 175% more interest from clients.
        </p>
      </div>

      {/* Requirements */}
      <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Requirements</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Age Verification</p>
              <p className="text-gray-600">You must be between 18-21 years old</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Account Status</p>
              <p className="text-gray-600">Your account must be in good standing</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Clear Photos</p>
              <p className="text-gray-600">All verification photos must be clear and match your profile</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Upload Verification Photos</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ID Card */}
          <div className="space-y-4">
            <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
              <img
                src="https://raw.githubusercontent.com/stackblitz/stackblitz-images/main/id-card.png"
                alt="ID Card example"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">1. Photo of ID Card</h3>
              <p className="text-sm text-gray-600 mb-3">Upload a clear photo of your ID card, passport, or driver's license</p>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileChange('id', e.target.files[0])}
                  className="hidden"
                  id="id-upload"
                />
                <label
                  htmlFor="id-upload"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer"
                >
                  Select file
                </label>
                <button
                  onClick={() => handleUpload('id')}
                  disabled={!files.id.file || files.id.status === 'success'}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    files.id.status === 'success'
                      ? 'bg-green-500 text-white'
                      : files.id.file
                      ? 'bg-pink-500 text-white hover:bg-pink-600'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {files.id.status === 'success' ? (
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

          {/* Selfie with ID */}
          <div className="space-y-4">
            <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
              <img
                src="https://raw.githubusercontent.com/stackblitz/stackblitz-images/main/selfie-with-id.png"
                alt="Selfie with ID example"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">2. Selfie with ID Card</h3>
              <p className="text-sm text-gray-600 mb-3">Take a photo of yourself holding your ID card</p>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileChange('selfieWithId', e.target.files[0])}
                  className="hidden"
                  id="selfie-upload"
                />
                <label
                  htmlFor="selfie-upload"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer"
                >
                  Select file
                </label>
                <button
                  onClick={() => handleUpload('selfieWithId')}
                  disabled={!files.selfieWithId.file || files.selfieWithId.status === 'success'}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    files.selfieWithId.status === 'success'
                      ? 'bg-green-500 text-white'
                      : files.selfieWithId.file
                      ? 'bg-pink-500 text-white hover:bg-pink-600'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {files.selfieWithId.status === 'success' ? (
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

          {/* Newspaper Photo */}
          <div className="space-y-4">
            <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
              <img
                src="https://raw.githubusercontent.com/stackblitz/stackblitz-images/main/newspaper.png"
                alt="Newspaper example"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">3. Photo with Today's Newspaper</h3>
              <p className="text-sm text-gray-600 mb-3">Take a photo of yourself holding today's newspaper. The date must be clearly visible.</p>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileChange('newspaper', e.target.files[0])}
                  className="hidden"
                  id="newspaper-upload"
                />
                <label
                  htmlFor="newspaper-upload"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer"
                >
                  Select file
                </label>
                <button
                  onClick={() => handleUpload('newspaper')}
                  disabled={!files.newspaper.file || files.newspaper.status === 'success'}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    files.newspaper.status === 'success'
                      ? 'bg-green-500 text-white'
                      : files.newspaper.file
                      ? 'bg-pink-500 text-white hover:bg-pink-600'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {files.newspaper.status === 'success' ? (
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

          {/* Clear Photo */}
          <div className="space-y-4">
            <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
              <img
                src="https://raw.githubusercontent.com/stackblitz/stackblitz-images/main/clear-photo.png"
                alt="Clear photo example"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">4. Clear Photo</h3>
              <p className="text-sm text-gray-600 mb-3">A clear photo/selfie of you and upper body</p>
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
                  After uploading all required photos, our team will verify your account within 24 hours.
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
              Our team typically verifies accounts within 24 hours after receiving all required photos.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">What happens after verification?</h3>
            <p className="text-gray-600">
              Once verified, your profile will display a verified badge, and you'll have access to premium features.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Is my information secure?</h3>
            <p className="text-gray-600">
              Yes, all verification photos are encrypted and only accessible to our verification team. They are deleted after verification is complete.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">What if my verification is rejected?</h3>
            <p className="text-gray-600">
              If your verification is rejected, we'll explain why and you can try again with new photos that meet our requirements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}