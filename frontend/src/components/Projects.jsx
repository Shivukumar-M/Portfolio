import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../store/AuthContext.jsx';

const Projects = () => {
  const { isAuthenticated, user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        if (isAuthenticated && user) {
          // Fetch logged-in user's projects
          const token = localStorage.getItem('token');
          const headers = { Authorization: `Bearer ${token}` };
          const res = await axios.get('/api/projects', { headers });
          setProjects(res.data);
        } else {
          // Fetch default/public projects
          const res = await axios.get('/api/projects/public');
          setProjects(res.data);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching projects:', error);
        // Set default projects if fetch fails
        setProjects([
          {
            _id: '1',
            title: 'E-commerce Platform',
            description: 'A full-stack e-commerce platform with user authentication, payment processing, and admin dashboard.',
            image: 'https://via.placeholder.com/600x400/1e293b/3b82f6?text=E-commerce+Platform',
            githubLink: 'https://github.com/Shivukumar-M/ecommerce-platform',
            liveDemo: 'https://ecommerce-demo.vercel.app',
            technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
          },
          {
            _id: '2',
            title: 'Task Management App',
            description: 'A collaborative task management application with real-time updates and team collaboration features.',
            image: 'https://via.placeholder.com/600x400/1e293b/3b82f6?text=Task+Management',
            githubLink: 'https://github.com/Shivukumar-M/task-manager',
            liveDemo: 'https://task-manager-demo.vercel.app',
            technologies: ['React', 'Node.js', 'Express', 'Socket.io'],
          },
          {
            _id: '3',
            title: 'Weather Dashboard',
            description: 'A responsive weather dashboard that displays current weather and forecasts for multiple locations.',
            image: 'https://via.placeholder.com/600x400/1e293b/3b82f6?text=Weather+Dashboard',
            githubLink: 'https://github.com/Shivukumar-M/weather-dashboard',
            liveDemo: 'https://weather-dashboard-demo.vercel.app',
            technologies: ['React', 'API Integration', 'Chart.js', 'Tailwind CSS'],
          },
        ]);
        setLoading(false);
      }
    };

    fetchProjects();
  }, [isAuthenticated, user]);

  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(project => project.technologies.includes(filter));

  const techFilters = ['all', 'React', 'Node.js', 'MongoDB', 'JavaScript'];

  if (loading) {
    return (
      <section id="projects" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <div className="loading mx-auto mb-4"></div>
            <p className="text-slate-400">Loading Projects...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="py-20 px-4 bg-slate-800/50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            My <span className="gradient-text">Projects</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Explore my recent work and personal projects
          </p>
        </div>
        
        {/* Filter Tags */}
        <div className="flex justify-center mb-12">
          <div className="bg-slate-800 rounded-lg p-1 flex border border-slate-700">
            {techFilters.map((tech) => (
              <button
                key={tech}
                onClick={() => setFilter(tech)}
                className={`px-4 py-2 rounded-md capitalize transition-all duration-300 ${
                  filter === tech
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tech}
              </button>
            ))}
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="text-center text-slate-400 py-12">
            <p>No projects found matching filter: {filter}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <div
                key={project._id}
                className="bg-slate-800 rounded-lg overflow-hidden card-hover border border-slate-700"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-white">{project.title}</h3>
                  <p className="text-slate-400 mb-4">{project.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.slice(0, 3).map((tech, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 3 && (
                      <span className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">
                        +{project.technologies.length - 3} more
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between">
                    <a
                      href={project.githubLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-400 hover:text-blue-300 transition-colors duration-300"
                    >
                      <i className="fab fa-github mr-2"></i>
                      Code
                    </a>
                    <a
                      href={project.liveDemo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-400 hover:text-blue-300 transition-colors duration-300"
                    >
                      <i className="fas fa-external-link-alt mr-2"></i>
                      Live Demo
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Projects;