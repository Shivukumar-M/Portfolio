import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../store/AuthContext.jsx';

const Skills = () => {
  const { isAuthenticated, user } = useAuth();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = ['all', 'frontend', 'backend', 'tools'];

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        if (isAuthenticated && user) {
          const token = localStorage.getItem('token');
          const headers = { Authorization: `Bearer ${token}` };
          const res = await axios.get('/api/skills', { headers });
          setSkills(res.data);
        } else {
          const res = await axios.get('http://localhost:5000/api/skills/public');
          setSkills(res.data);
        }
      } catch (error) {
        console.error('Error fetching skills:', error);
        setSkills([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, [isAuthenticated, user]);

  const displayedSkills =
    activeCategory === 'all'
      ? skills
      : skills.filter((skill) => skill.category === activeCategory);

  if (loading) {
    return (
      <section id="skills" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <p className="text-slate-400">Loading Skills...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="skills" className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            My <span className="gradient-text">Skills</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Technologies and tools I work with to bring ideas to life
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center mb-12">
          <div className="bg-slate-800 rounded-lg p-1 flex border border-slate-700">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-md capitalize transition-all duration-300 ${
                  activeCategory === category
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Skills Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedSkills.map((skill, index) => (
            <div
              key={skill._id || `${skill.name}-${index}`}
              className="bg-slate-800 rounded-lg p-6 text-center card-hover border border-slate-700"
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-slate-700 overflow-hidden">
                {skill.icon?.includes('/images/') ? (
                  <img
                    src={skill.icon}
                    alt={skill.name}
                    className="w-12 h-12 object-contain"
                  />
                ) : (
                  <i
                    className={`${skill.icon || 'fas fa-cogs'} text-white text-2xl`}
                  ></i>
                )}
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                {skill.name}
              </h3>
              <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
                <div
                  className="h-2 rounded-full bg-blue-500"
                  style={{
                    width: `${skill.level || 80}%`,
                  }}
                ></div>
              </div>
              <span className="text-sm text-slate-400">
                {skill.level ? `${skill.level}%` : 'Skill'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
