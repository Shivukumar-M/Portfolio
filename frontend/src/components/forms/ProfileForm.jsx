import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProfileForm = ({ profileData, setProfileData }) => {
  const [formData, setFormData] = useState({
    name: '',
    photo: '',
    title: '',
    bio: '',
    github: '',
    linkedin: '',
    twitter: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData.profile?.name || '',
        photo: profileData.profile?.photo || '',
        title: profileData.profile?.title || '',
        bio: profileData.profile?.bio || '',
        github: profileData.profile?.social?.github || '',
        linkedin: profileData.profile?.social?.linkedin || '',
        twitter: profileData.profile?.social?.twitter || '',
      });
    }
  }, [profileData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const profile = {
        name: formData.name,
        photo: formData.photo,
        title: formData.title,
        bio: formData.bio,
        social: {
          github: formData.github,
          linkedin: formData.linkedin,
          twitter: formData.twitter,
        },
      };
      
      const res = await axios.put('/api/profile', { profile }, { headers });
      setProfileData(res.data);
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Edit Profile</h2>
      
      {message && (
        <div className="bg-green-900/20 border border-green-500/30 text-green-400 p-3 rounded-lg mb-6">
          {message}
        </div>
      )}
      
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-white transition-colors duration-300"
              placeholder="Your Name"
            />
          </div>
          
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
              Professional Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-white transition-colors duration-300"
              placeholder="Full Stack Developer"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="photo" className="block text-sm font-medium text-slate-300 mb-2">
            Profile Photo URL
          </label>
          <input
            type="text"
            id="photo"
            name="photo"
            value={formData.photo}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-white transition-colors duration-300"
            placeholder="https://example.com/your-photo.jpg"
          />
          {formData.photo && (
            <div className="mt-3">
              <img
                src={formData.photo}
                alt="Profile Preview"
                className="w-24 h-24 rounded-full object-cover"
              />
            </div>
          )}
        </div>
        
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-slate-300 mb-2">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-white resize-none transition-colors duration-300"
            placeholder="Tell us about yourself..."
          ></textarea>
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-white mb-4">Social Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="github" className="block text-sm font-medium text-slate-300 mb-2">
                GitHub
              </label>
              <input
                type="text"
                id="github"
                name="github"
                value={formData.github}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-white transition-colors duration-300"
                placeholder="https://github.com/username"
              />
            </div>
            
            <div>
              <label htmlFor="linkedin" className="block text-sm font-medium text-slate-300 mb-2">
                LinkedIn
              </label>
              <input
                type="text"
                id="linkedin"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-white transition-colors duration-300"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            
            <div>
              <label htmlFor="twitter" className="block text-sm font-medium text-slate-300 mb-2">
                Twitter
              </label>
              <input
                type="text"
                id="twitter"
                name="twitter"
                value={formData.twitter}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-white transition-colors duration-300"
                placeholder="https://twitter.com/username"
              />
            </div>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Saving...
            </span>
          ) : (
            'Save Profile'
          )}
        </button>
      </form>
    </div>
  );
};

export default ProfileForm;