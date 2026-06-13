import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../api';
import { User, Mail, Phone, Calendar, Edit2, Save, X, AlertCircle, CheckCircle } from 'lucide-react';

function Profile({ user, setUser }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    gender: '',
    date_of_birth: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await getProfile();
      setProfile(response.data);
      setFormData({
        full_name: response.data.full_name || '',
        phone: response.data.phone || '',
        gender: response.data.gender || '',
        date_of_birth: response.data.date_of_birth || ''
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await updateProfile(formData);
      const updatedProfile = await getProfile();
      setProfile(updatedProfile.data);
      
      // Update user in parent component
      const updatedUser = { ...user, full_name: formData.full_name };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData({
      full_name: profile.full_name || '',
      phone: profile.phone || '',
      gender: profile.gender || '',
      date_of_birth: profile.date_of_birth || ''
    });
    setMessage({ type: '', text: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account information</p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 rounded-lg p-4 flex items-start ${
            message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
            )}
            <span className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </span>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="card text-center">
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {profile.full_name || profile.username}
              </h2>
              <p className="text-gray-600 mb-4">{profile.email}</p>
              {profile.is_doctor && (
                <span className="inline-block px-4 py-2 bg-primary-100 text-primary-800 rounded-full text-sm font-semibold">
                  Medical Professional
                </span>
              )}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">Member since</p>
                <p className="font-semibold text-gray-900">
                  {new Date(profile.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="btn-primary flex items-center text-sm"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </button>
                )}
              </div>

              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="input-field"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input-field"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="input-field"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 btn-secondary flex items-center justify-center"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-start">
                    <User className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Username</p>
                      <p className="font-semibold text-gray-900">{profile.username}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold text-gray-900">{profile.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <User className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Full Name</p>
                      <p className="font-semibold text-gray-900">{profile.full_name || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-semibold text-gray-900">{profile.phone || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <User className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Gender</p>
                      <p className="font-semibold text-gray-900 capitalize">{profile.gender || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Date of Birth</p>
                      <p className="font-semibold text-gray-900">
                        {profile.date_of_birth 
                          ? new Date(profile.date_of_birth).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : 'Not provided'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Doctor Information */}
            {profile.is_doctor && (
              <div className="card mt-6 bg-primary-50 border-2 border-primary-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Medical Professional Information</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Specialization</p>
                    <p className="font-semibold text-gray-900">{profile.specialization || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">License Number</p>
                    <p className="font-semibold text-gray-900">{profile.license_number || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Account Security */}
            <div className="card mt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Account Security</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">Password</p>
                    <p className="text-sm text-gray-600">Last changed: Never</p>
                  </div>
                  <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                    Change
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-600">Not enabled</p>
                  </div>
                  <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                    Enable
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
