import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`/api/projects/${id}`);
        setProject(res.data);
      } catch {
        setError('Project not found.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="loading"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4">
        <p className="text-red-400 text-lg">{error || 'Project not found.'}</p>
        <Link to="/" className="text-blue-400 hover:underline">← Back home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Hero banner */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 max-w-4xl mx-auto">
          <Link to="/" className="text-slate-400 hover:text-white text-sm mb-4 inline-flex items-center gap-2 transition-colors">
            <i className="fas fa-arrow-left" /> Back
          </Link>
          <h1 className="text-3xl md:text-5xl font-black mt-2">{project.title}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Meta row */}
        <div className="flex flex-wrap gap-3 mb-8">
          {project.technologies?.map((t, i) => (
            <span key={i} className="px-3 py-1 bg-blue-900/40 border border-blue-700/30 text-blue-300 rounded-full text-sm">
              {t}
            </span>
          ))}
        </div>

        {/* Links */}
        <div className="flex gap-4 mb-10">
          {project.githubLink && project.githubLink !== '#' && (
            <a href={project.githubLink} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 border border-slate-600 rounded-lg hover:border-slate-400 transition-colors text-sm font-medium">
              <i className="fab fa-github" /> View on GitHub
            </a>
          )}
          {project.liveDemo && project.liveDemo !== '#' && (
            <a href={project.liveDemo} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors text-sm font-medium">
              <i className="fas fa-external-link-alt" /> Live Demo
            </a>
          )}
        </div>

        {/* Short description */}
        <p className="text-slate-300 text-lg leading-relaxed mb-10 border-l-4 border-blue-500 pl-5">
          {project.description}
        </p>

        {/* Markdown case study */}
        {project.content ? (
          <div className="prose prose-invert prose-lg max-w-none
            prose-headings:text-white prose-headings:font-bold
            prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
            prose-p:text-slate-300 prose-p:leading-relaxed
            prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
            prose-code:text-green-300 prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
            prose-pre:bg-slate-800 prose-pre:border prose-pre:border-slate-700
            prose-blockquote:border-blue-500 prose-blockquote:text-slate-400
            prose-strong:text-white
            prose-li:text-slate-300
            prose-hr:border-slate-700">
            <ReactMarkdown>{project.content}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-slate-500 italic">No case study written yet.</p>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
