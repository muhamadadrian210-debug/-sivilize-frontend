import React, { useState, useEffect } from 'react';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData({
        name: parsedUser.name || '',
        company: parsedUser.company || '',
        phone: parsedUser.phone || ''
      });
    }
  }, []);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(data.data.user));
        setUser(data.data.user);
        setEditMode(false);
        setMessage('Profile updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.message || 'Update failed');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
      console.error('Update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/auth';
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">User Profile</h2>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Success Message */}
        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
            {message}
          </div>
        )}

        {/* User Info */}
        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{user.name}</h3>
              <p className="text-gray-600">{user.email}</p>
              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mt-1">
                {user.role || 'User'}
              </span>
            </div>
          </div>

          {/* Form Section */}
          {editMode ? (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="PT. Construction"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="+62 812-3456-7890"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Company</p>
                  <p className="font-semibold text-gray-900">
                    {user.company || 'Not specified'}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold text-gray-900">
                    {user.phone || 'Not specified'}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p className="font-semibold text-gray-900">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID') : 'Unknown'}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Account Type</p>
                  <p className="font-semibold text-gray-900 capitalize">
                    {user.role || 'User'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEditMode(true)}
                className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
              >
                Edit Profile
              </button>
            </div>
          )}

          {/* Statistics */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">0</p>
                <p className="text-sm text-gray-600">Projects Created</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">0</p>
                <p className="text-sm text-gray-600">RAB Calculations</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-purple-600">Free</p>
                <p className="text-sm text-gray-600">Current Plan</p>
              </div>
            </div>
          </div>

          {/* Upgrade Banner */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 rounded-lg text-white">
            <h3 className="text-lg font-semibold mb-2">Upgrade to Premium</h3>
            <p className="text-sm mb-4">
              Get unlimited projects, cloud storage, advanced templates, and priority support.
            </p>
            <button className="bg-white text-orange-500 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
