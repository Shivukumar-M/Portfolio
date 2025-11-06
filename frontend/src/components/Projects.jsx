import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../store/AuthContext.jsx';

const Projects = () => {
  const { isAuthenticated, user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Default (public) projects
  const defaultProjects = [
    {
      _id: 'p1',
      title: 'Blog Platform',
      description:
        'A modern blogging platform built with Django, Tailwind CSS, and JavaScript. Allows users to create, edit, and publish blog posts with a beautiful responsive UI.',
      image: '/images/blog.png',
      githubLink: 'https://github.com/Shivukumar-M/blog-platform',
      liveDemo: 'https://blog-demo.vercel.app',
      technologies: ['Django', 'Tailwind CSS', 'JavaScript', 'HTML'],
    },
    {
      _id: 'p2',
      title: 'Gemini AI Bot',
      description:
        'An intelligent chatbot powered by Python Flask and Gemini API, featuring natural language understanding and a responsive Tailwind UI.',
      image: '/images/ai.png',
      githubLink: 'https://github.com/Shivukumar-M/gemini-ai-bot',
      liveDemo: 'https://gemini-bot-demo.vercel.app',
      technologies: ['Python', 'Flask', 'Tailwind CSS', 'JavaScript'],
    },
    {
      _id: 'p3',
      title: 'Portfolio Website',
      description:
        'A personal portfolio built with the MERN stack to showcase projects, skills, and contact information with a smooth UI and admin panel.',
      image: '/images/portfolio.png',
      githubLink: 'https://github.com/Shivukumar-M/mern-portfolio',
      liveDemo: 'https://portfolio-demo.vercel.app',
      technologies: ['MongoDB', 'Express', 'React', 'Node.js'],
    },
  ];

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        if (isAuthenticated && user) {
          // Authenticated user's projects
          const token = localStorage.getItem('token');
          const headers = { Authorization: `Bearer ${token}` };
          const res = await axios.get('/api/projects', { headers });
          setProjects(res.data);
        } else {
          // Public/default projects
          const res = await axios.get('http://localhost:5000/api/projects/public');
          setProjects(res.data.length ? res.data : defaultProjects);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        setProjects(defaultProjects);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [isAuthenticated, user]);

  const filteredProjects =
    filter === 'all'
      ? projects
      : projects.filter((project) =>
          project.technologies.some(
            (tech) => tech.toLowerCase() === filter.toLowerCase()
          )
        );

  const techFilters = ['all', 'React', 'Node.js', 'Python', 'Django', 'Tailwind CSS', 'JavaScript'];

  if (loading) {
    return (
      <section id="projects" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="loading mx-auto mb-4"></div>
          <p className="text-slate-400">Loading Projects...</p>
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

        {/* Filter Buttons */}
        <div className="flex justify-center mb-12">
          <div className="bg-slate-800 rounded-lg p-1 flex border border-slate-700 flex-wrap justify-center">
            {techFilters.map((tech) => (
              <button
                key={tech}
                onClick={() => setFilter(tech)}
                className={`px-4 py-2 m-1 rounded-md capitalize transition-all duration-300 ${
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
            <p>No projects found matching: {filter}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <div
                key={project._id || project.title}
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
                  <h3 className="text-xl font-semibold mb-2 text-white">
                    {project.title}
                  </h3>
                  <p className="text-slate-400 mb-4">{project.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.map((tech, i) => (
                      <span
                        key={`${project._id}-${tech}-${i}`}
                        className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between">
                    <a
                      href={project.githubLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-400 hover:text-blue-300 transition-colors duration-300"
                    >
                      <i className="fab fa-github mr-2"></i> Code
                    </a>
                    <a
                      href={project.liveDemo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-400 hover:text-blue-300 transition-colors duration-300"
                    >
                      <i className="fas fa-external-link-alt mr-2"></i> Live Demo
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
