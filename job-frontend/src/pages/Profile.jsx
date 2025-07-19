import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/profileService';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaTrash, FaEye, FaEyeSlash, FaFilePdf, FaDownload, FaUpload, FaTimes, FaEdit, FaSave } from 'react-icons/fa';
import FileUpload from '../components/FileUpload';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    location: '',
    bio: ''
  });
  const [loading, setLoading] = useState(true);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUploading, setResumeUploading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileService.getProfile();
        setProfile(data.profile);
        setFormData({
          firstname: data.profile.firstname || '',
          lastname: data.profile.lastname || '',
          email: data.profile.email || '',
          phone: data.profile.phone || '',
          location: data.profile.location || '',
          bio: data.profile.bio || ''
        });
        if (data.profile.resume) {
          setResumeFile({
            name: data.profile.resume.name || 'Resume',
            url: `/api/profile/resume/download`,
            size: data.profile.resume.size
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await profileService.updateProfile(formData);
      setProfile({ ...profile, ...formData });
      setEditMode(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData({
      firstname: profile.firstname || '',
      lastname: profile.lastname || '',
      email: profile.email || '',
      phone: profile.phone || '',
      location: profile.location || '',
      bio: profile.bio || ''
    });
    setEditMode(false);
  };

  const handleResumeUpload = async (fileData) => {
    if (!fileData) {
      setResumeFile(null);
      return;
    }

    setResumeUploading(true);
    try {
      const response = await fetch(fileData.file);
      const blob = await response.blob();
      const file = new File([blob], fileData.fileName, { type: fileData.fileType });
      
      const result = await profileService.uploadResume(file);
      
      setResumeFile({
        name: fileData.fileName,
        url: `/api/profile/resume/download`,
        size: fileData.fileSize
      });
      
      setProfile(prev => ({ ...prev, resume: result.user.resume }));
      
      toast.success('Resume uploaded successfully');
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast.error('Failed to upload resume');
    } finally {
      setResumeUploading(false);
    }
  };

  const handleResumeDelete = async () => {
    try {
      await profileService.deleteResume();
      setResumeFile(null);
      setProfile(prev => ({ ...prev, resume: null }));
      toast.success('Resume deleted successfully');
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast.error('Failed to delete resume');
    }
  };

  const handleResumeDownload = () => {
    if (resumeFile?.url) {
      window.open(resumeFile.url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 animate-pulse dark:bg-gray-700 ">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto dark:bg-gray-800 dark:text-gray-200 p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-primary mb-8 dark:text-gray-200">Profile</h1>

      <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-md overflow-hidden dark:border dark:border-gray-700">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 px-6 py-8 dark:bg-gray-800">
          <div className="flex items-center justify-between text-white dark:text-gray-200">
            <div className="flex items-center space-x-4 dark:text-gray-200">
              <div className="w-16 h-16 bg-white dark:bg-gray-200 rounded-full flex items-center justify-center dark:text-gray-700">
                <FaUser className="text-2xl text-gray-600 dark:text-gray-700" />
              </div>
              <div className="text-white dark:text-gray-200">
                <h2 className="text-2xl font-bold dark:text-gray-200">{profile.firstname} {profile.lastname}</h2>
                <p className="text-blue-100 dark:text-blue-200 dark:text-gray-200">{profile.email}</p>
                <p className="text-blue-100 dark:text-blue-200 capitalize dark:text-gray-200">{profile.type?.toLowerCase()}</p>
              </div>
            </div>
            <button
              onClick={() => setEditMode(!editMode)}
              className="bg-white dark:bg-gray-500 text-blue-600 dark:text-blue-900 px-4 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors dark:hover:text-gray-200"
            >
              {editMode ? <FaTimes className="inline mr-1 dark:text-gray-200" /> : <FaEdit className="inline mr-1 dark:text-gray-200" />}
              {editMode ? 'Cancel' : 'Edit'}
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 dark:bg-gray-800 dark:text-gray-200">
          {editMode ? (
            <div className="space-y-6 dark:bg-gray-800 dark:text-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 dark:bg-gray-800 dark:text-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-secondary mb-2 dark:text-gray-300">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-primary rounded-md bg-white dark:bg-dark-accent text-gray-900 dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-blue-500 dark:placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-secondary mb-2 dark:text-gray-300">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-primary rounded-md bg-white dark:bg-dark-accent text-gray-900 dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-blue-500 dark:placeholder-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-secondary mb-2 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-primary rounded-md bg-white dark:bg-dark-accent text-gray-900 dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-blue-500 dark:placeholder-gray-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 dark:bg-gray-800 dark:text-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-secondary mb-2 dark:text-gray-300">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-primary rounded-md bg-white dark:bg-dark-accent text-gray-900 dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-blue-500 dark:placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-secondary mb-2 dark:text-gray-300">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-primary rounded-md bg-white dark:bg-dark-accent text-gray-900 dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-blue-500 dark:placeholder-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-secondary mb-2 dark:text-gray-300">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-primary rounded-md bg-white dark:bg-dark-accent text-gray-900 dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-gray-500 dark:text-gray-300"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-dark-secondary dark:text-gray-300">
                  Resume
                </label>
                <FileUpload
                  onFileUpload={handleResumeUpload}
                  acceptedFileTypes=".pdf,.doc,.docx"
                  maxSize={5 * 1024 * 1024}
                  placeholder="Upload your resume"
                  currentFile={resumeFile}
                  disabled={resumeUploading}
                />
              </div>

              <div className="flex justify-end space-x-3 dark:bg-gray-800 dark:text-gray-200">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors dark:hover:bg-gray-600 dark:border-gray-500 dark:text-gray-300"
                >
                  <FaTimes className="inline mr-1 dark:text-gray-300" /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50"
                >
                  <FaSave className="inline mr-1 dark:text-gray-300" /> Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 dark:bg-gray-800 dark:text-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 dark:bg-gray-800 dark:text-gray-200">
                <div className="flex items-center space-x-3 dark:text-gray-300">
                  <FaUser className="text-gray-500 dark:text-gray-300" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Name</p>
                    <p className="font-medium dark:text-gray-300">{profile.firstname} {profile.lastname}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 dark:text-gray-300">
                  <FaEnvelope className="text-gray-500 dark:text-gray-300" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Email</p>
                    <p className="font-medium dark:text-gray-300">{profile.email}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 dark:bg-gray-800 dark:text-gray-200">
                <div className="flex items-center space-x-3 dark:text-gray-300">
                  <FaPhone className="text-gray-500 dark:text-gray-300" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Phone</p>
                    <p className="font-medium dark:text-gray-300">{profile.phone || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 dark:text-gray-300">
                  <FaMapMarkerAlt className="text-gray-500 dark:text-gray-300" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Location</p>
                    <p className="font-medium dark:text-gray-300">{profile.location || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {profile.bio && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2 dark:text-gray-300">Bio</h3>
                  <p className="text-gray-700 dark:text-gray-300">{profile.bio}</p>
                </div>
              )}

              <div className="border-t pt-6 dark:border-gray-600">
                <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-gray-300">Resume</h3>
                {resumeFile ? (
                  <div className="bg-gray-50 rounded-lg p-4 dark:bg-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FaFilePdf className="text-red-500 text-xl" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-300">{resumeFile.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-300">
                            {resumeFile.size ? `${Math.round(resumeFile.size / 1024)}KB` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 dark:text-gray-300">
                        <button
                          onClick={handleResumeDownload}
                          className="p-2 text-blue-600 hover:text-blue-800 transition-colors dark:text-blue-400 dark:hover:text-blue-500"
                          title="Download Resume"
                        >
                          <FaDownload />
                        </button>
                        <button
                          onClick={handleResumeDelete}
                          className="p-2 text-red-600 hover:text-red-800 transition-colors dark:text-red-400 dark:hover:text-red-500"
                          title="Delete Resume"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 dark:bg-gray-700">
                    <FaUpload className="mx-auto text-gray-400 text-3xl mb-4 dark:text-gray-300" />
                    <p className="text-gray-500 mb-4 dark:text-gray-300">No resume uploaded yet</p>
                    <FileUpload
                      onFileUpload={handleResumeUpload}
                      acceptedFileTypes=".pdf,.doc,.docx"
                      maxSize={5 * 1024 * 1024}
                      placeholder="Upload your resume"
                      currentFile={null}
                      disabled={resumeUploading}
                    />
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Member since: {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
