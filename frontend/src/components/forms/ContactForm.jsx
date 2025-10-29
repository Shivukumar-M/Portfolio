import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ContactForm = ({ contactData, setContactData }) => {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    location: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (contactData) {
      setFormData({
        email: contactData.email || '',
        phone: contactData.phone || '',
        location: contactData.location || '',
      });
    }
  }, [contactData]);

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
      
      const res = await axios.put('/api/contact', { contact: formData }, { headers });
      setContactData(res.data.contact);
      setMessage('Contact information updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Edit Contact Information</h2>
      
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
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-white transition-colors duration-300"
            placeholder="your.email@example.com"
          />
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-2">
            Phone
          </label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-white transition-colors duration-300"
            placeholder="+1 (123) 456-7890"
          />
        </div>
        
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-slate-300 mb-2">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-white transition-colors duration-300"
            placeholder="Your City, Country"
          />
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
            'Save Contact Information'
          )}
        </button>
      </form>
    </div>
  );
};

export default ContactForm;