import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProjectsForm = ({ projectsData, setProjectsData }) => {
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    githubLink: '',
    liveDemo: '',
    technologies: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setProjects(projectsData);
  }, [projectsData]);

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
      
      const projectData = {
        ...formData,
        technologies: formData.technologies.split(',').map(tech => tech.trim()),
      };
      
      let res;
      if (editingId) {
        res = await axios.put(`/api/projects/${editingId}`, projectData, { headers });
        setProjects(prev => prev.map(project => 
          project._id === editingId ? res.data : project
        ));
        setMessage('Project updated successfully!');
      } else {
        res = await axios.post('/api/projects', projectData, { headers });
        setProjects(prev => [...prev, res.data]);
        setMessage('Project added successfully!');
      }
      
      setProjectsData(projects);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (project) => {
    setFormData({
      title: project.title,
      description: project.description,
      image: project.image,
      githubLink: project.githubLink,
      liveDemo: project.liveDemo,
      technologies: project.technologies.join(', '),
    });
    setEditingId(project._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.delete(`/api/projects/${id}`, { headers });
      setProjects(prev => prev.filter(project => project._id !== id));
      setProjectsData(projects.filter(project => project._id !== id));
      setMessage('Project deleted successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image: '',
      githubLink: '',
      liveDemo: '',
      technologies: '',
    });
    setEditingId(null);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Manage Projects</h2>
      
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
            {editingId ? 'Edit Project' : 'Add New Project'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
                Project Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-white transition-colors duration-300"
                placeholder="e.g., E-commerce Platform"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                required
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-white resize-none transition-colors duration-300"
                placeholder="Describe your project..."
              ></textarea>
            </div>
            
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-slate-300 mb-2">
                Image URL
              </label>
              <input
                type="text"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-white transition-colors duration-300"
                placeholder="https://example.com/project-image.jpg"
              />
              {formData.image && (
                <div className="mt-3">
                  <img
                    src={formData.image}
                    alt="Project Preview"
                    className="w-full h-32 object-cover rounded"
                  />
                </div>
              )}
            </div>
            
            <div>
              <label htmlFor="githubLink" className="block text-sm font-medium text-slate-300 mb-2">
                GitHub Repository URL
              </label>
              <input
                type="text"
                id="githubLink"
                name="githubLink"
                value={formData.githubLink}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-white transition-colors duration-300"
                placeholder="https://github.com/username/repo"
              />
            </div>
            
            <div>
              <label htmlFor="liveDemo" className="block text-sm font-medium text-slate-300 mb-2">
                Live Demo URL
              </label>
              <input
                type="text"
                id="liveDemo"
                name="liveDemo"
                value={formData.liveDemo}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-white transition-colors duration-300"
                placeholder="https://example.com"
              />
            </div>
            
            <div>
              <label htmlFor="technologies" className="block text-sm font-medium text-slate-300 mb-2">
                Technologies (comma-separated)
              </label>
              <input
                type="text"
                id="technologies"
                name="technologies"
                value={formData.technologies}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-white transition-colors duration-300"
                placeholder="React, Node.js, MongoDB"
              />
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
                  editingId ? 'Update Project' : 'Add Project'
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
        
        {/* Projects List */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">Your Projects</h3>
          
          {projects.length === 0 ? (
            <p className="text-slate-400">No projects added yet.</p>
          ) : (
            <div className="space-y-4">
              {projects.map(project => (
                <div key={project._id} className="bg-slate-700 rounded-lg overflow-hidden">
                  <div className="h-32 overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-white font-medium">{project.title}</h4>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(project)}
                          className="text-blue-400 hover:text-blue-300 transition-colors duration-300"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(project._id)}
                          className="text-red-400 hover:text-red-300 transition-colors duration-300"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-slate-400 text-sm mb-2 line-clamp-2">
                      {project.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-2">
                      {project.technologies.slice(0, 3).map((tech, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-slate-600 rounded text-xs text-slate-300"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 3 && (
                        <span className="px-2 py-1 bg-slate-600 rounded text-xs text-slate-300">
                          +{project.technologies.length - 3}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex space-x-4 text-sm">
                      <a
                        href={project.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors duration-300"
                      >
                        <i className="fab fa-github mr-1"></i>
                        Code
                      </a>
                      <a
                        href={project.liveDemo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors duration-300"
                      >
                        <i className="fas fa-external-link-alt mr-1"></i>
                        Demo
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectsForm;