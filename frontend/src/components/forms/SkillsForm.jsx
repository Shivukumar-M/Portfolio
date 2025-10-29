import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SkillsForm = ({ skillsData, setSkillsData }) => {
  const [skills, setSkills] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    level: 50,
    category: 'other',
    icon: 'fas fa-code',
    color: 'bg-blue-500',
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setSkills(skillsData);
  }, [skillsData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'level' ? parseInt(value) : value,
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
      
      let res;
      if (editingId) {
        res = await axios.put(`/api/skills/${editingId}`, formData, { headers });
        setSkills(prev => prev.map(skill => 
          skill._id === editingId ? res.data : skill
        ));
        setMessage('Skill updated successfully!');
      } else {
        res = await axios.post('/api/skills', formData, { headers });
        setSkills(prev => [...prev, res.data]);
        setMessage('Skill added successfully!');
      }
      
      setSkillsData(skills);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (skill) => {
    setFormData({
      name: skill.name,
      level: skill.level,
      category: skill.category,
      icon: skill.icon,
      color: skill.color,
    });
    setEditingId(skill._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.delete(`/api/skills/${id}`, { headers });
      setSkills(prev => prev.filter(skill => skill._id !== id));
      setSkillsData(skills.filter(skill => skill._id !== id));
      setMessage('Skill deleted successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      level: 50,
      category: 'other',
      icon: 'fas fa-code',
      color: 'bg-blue-500',
    });
    setEditingId(null);
  };

  const categories = ['frontend', 'backend', 'tools', 'other'];
  const colors = [
    { value: 'bg-blue-500', label: 'Blue' },
    { value: 'bg-green-500', label: 'Green' },
    { value: 'bg-red-500', label: 'Red' },
    { value: 'bg-yellow-500', label: 'Yellow' },
    { value: 'bg-purple-500', label: 'Purple' },
    { value: 'bg-pink-500', label: 'Pink' },
    { value: 'bg-indigo-500', label: 'Indigo' },
    { value: 'bg-cyan-500', label: 'Cyan' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Manage Skills</h2>
      
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">
            {editingId ? 'Edit Skill' : 'Add New Skill'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                Skill Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-white transition-colors duration-300"
                placeholder="e.g., JavaScript"
              />
            </div>
            
            <div>
              <label htmlFor="level" className="block text-sm font-medium text-slate-300 mb-2">
                Proficiency Level: {formData.level}%
              </label>
              <input
                type="range"
                id="level"
                name="level"
                min="0"
                max="100"
                value={formData.level}
                onChange={handleChange}
                className="w-full"
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-300 mb-2">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-white transition-colors duration-300"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="icon" className="block text-sm font-medium text-slate-300 mb-2">
                Icon Class (Font Awesome)
              </label>
              <input
                type="text"
                id="icon"
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-white transition-colors duration-300"
                placeholder="e.g., fab fa-react"
              />
            </div>
            
            <div>
              <label htmlFor="color" className="block text-sm font-medium text-slate-300 mb-2">
                Color
              </label>
              <select
                id="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-white transition-colors duration-300"
              >
                {colors.map(color => (
                  <option key={color.value} value={color.value}>
                    {color.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    {editingId ? 'Updating...' : 'Adding...'}
                  </span>
                ) : (
                  editingId ? 'Update Skill' : 'Add Skill'
                )}
              </button>
              
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
        
        {/* Skills List */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">Your Skills</h3>
          
          {skills.length === 0 ? (
            <p className="text-slate-400">No skills added yet.</p>
          ) : (
            <div className="space-y-4">
              {skills.map(skill => (
                <div key={skill._id} className="bg-slate-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-white font-medium">{skill.name}</h4>
                      <p className="text-slate-400 text-sm capitalize">{skill.category}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(skill)}
                        className="text-blue-400 hover:text-blue-300 transition-colors duration-300"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(skill._id)}
                        className="text-red-400 hover:text-red-300 transition-colors duration-300"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                  
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${skill.color}`}
                      style={{ width: `${skill.level}%` }}
                    ></div>
                  </div>
                  <p className="text-slate-400 text-sm mt-1">{skill.level}%</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillsForm;