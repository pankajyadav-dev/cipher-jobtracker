import React, { useState } from 'react';
import { FaCloudUploadAlt, FaFile, FaTimes, FaSpinner } from 'react-icons/fa';

const FileUpload = ({ 
  onFileUpload, 
  acceptedFileTypes = '.pdf,.doc,.docx', 
  maxSize = 5 * 1024 * 1024, 
  placeholder = 'Upload your resume (PDF, DOC, DOCX)',
  currentFile = null,
  disabled = false
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    setError(null);
    
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const allowedExtensions = acceptedFileTypes.split(',').map(ext => ext.trim().replace('.', ''));
    
    if (!allowedExtensions.includes(fileExtension)) {
      setError(`Invalid file type. Please upload: ${acceptedFileTypes}`);
      return;
    }

    if (file.size > maxSize) {
      setError(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`);
      return;
    }

    setUploading(true);
    
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        onFileUpload({
          file: base64String,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        });
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to upload file. Please try again.');
      setUploading(false);
    }
  };

  const removeFile = () => {
    onFileUpload(null);
  };

  return (
    <div className="w-full">
      {currentFile ? (
        <div className="border-2 border-dashed border-gray-300 dark:border-dark-primary rounded-lg p-6 text-center bg-gray-50 dark:bg-dark-accent">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <FaFile className="text-blue-500 dark:text-blue-400 text-2xl" />
            <span className="text-gray-700 dark:text-dark-secondary font-medium">{currentFile.name || 'Uploaded file'}</span>
          </div>
          <div className="flex items-center justify-center space-x-4">
            <span className="text-sm text-gray-500 dark:text-dark-muted">
              {currentFile.size ? `${Math.round(currentFile.size / 1024)}KB` : ''}
            </span>
            <button
              onClick={removeFile}
              className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
              disabled={disabled}
            >
              <FaTimes />
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive 
              ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-dark-primary hover:border-gray-400 dark:hover:border-gray-500'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept={acceptedFileTypes}
            onChange={handleChange}
            disabled={disabled || uploading}
            className="hidden"
            id="fileInput"
          />
          
          <label htmlFor="fileInput" className="cursor-pointer">
            <div className="flex flex-col items-center space-y-2">
              {uploading ? (
                <FaSpinner className="animate-spin text-blue-500 dark:text-blue-400 text-3xl" />
              ) : (
                <FaCloudUploadAlt className="text-gray-400 dark:text-gray-500 text-3xl" />
              )}
              
              <div className="text-gray-600 dark:text-dark-secondary">
                <p className="font-medium">{uploading ? 'Uploading...' : placeholder}</p>
                <p className="text-sm text-gray-500 dark:text-dark-muted">
                  Drag and drop or click to browse
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Max size: {Math.round(maxSize / (1024 * 1024))}MB
                </p>
              </div>
            </div>
          </label>
        </div>
      )}
      
      {error && (
        <div className="mt-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
