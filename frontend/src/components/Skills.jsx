import React, { useState } from 'react';

const Skills = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  
  const categories = ['all', 'frontend', 'backend', 'tools'];
  
  const skills = {
    all: [
      { name: 'JavaScript', level: 90, icon: 'fab fa-js', color: 'bg-yellow-500' },
      { name: 'React', level: 85, icon: 'fab fa-react', color: 'bg-blue-500' },
      { name: 'Node.js', level: 80, icon: 'fab fa-node', color: 'bg-green-500' },
      { name: 'MongoDB', level: 75, icon: 'fas fa-database', color: 'bg-green-600' },
      { name: 'HTML/CSS', level: 90, icon: 'fab fa-html5', color: 'bg-orange-500' },
      { name: 'Git', level: 80, icon: 'fab fa-git-alt', color: 'bg-red-500' },
      { name: 'Express.js', level: 75, icon: 'fas fa-server', color: 'bg-gray-500' },
      { name: 'Tailwind CSS', level: 85, icon: 'fas fa-wind', color: 'bg-cyan-500' },
    ],
    frontend: [
      { name: 'React', level: 85, icon: 'fab fa-react', color: 'bg-blue-500' },
      { name: 'HTML/CSS', level: 90, icon: 'fab fa-html5', color: 'bg-orange-500' },
      { name: 'JavaScript', level: 90, icon: 'fab fa-js', color: 'bg-yellow-500' },
      { name: 'Tailwind CSS', level: 85, icon: 'fas fa-wind', color: 'bg-cyan-500' },
    ],
    backend: [
      { name: 'Node.js', level: 80, icon: 'fab fa-node', color: 'bg-green-500' },
      { name: 'MongoDB', level: 75, icon: 'fas fa-database', color: 'bg-green-600' },
      { name: 'Express.js', level: 75, icon: 'fas fa-server', color: 'bg-gray-500' },
    ],
    tools: [
      { name: 'Git', level: 80, icon: 'fab fa-git-alt', color: 'bg-red-500' },
      { name: 'VS Code', level: 90, icon: 'fas fa-code', color: 'bg-blue-600' },
      { name: 'Docker', level: 65, icon: 'fab fa-docker', color: 'bg-blue-400' },
    ]
  };

  const displayedSkills = activeCategory === 'all' 
    ? skills.all 
    : skills[activeCategory] || [];

  return (
    <section id="skills" className="py-20 px-4 bg-gray-900/50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            My <span className="gradient-text">Skills</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Technologies and tools I work with to bring ideas to life
          </p>
        </div>
        
        {/* Category Filter */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-800 rounded-lg p-1 flex">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-md capitalize transition-all duration-300 ${
                  activeCategory === category
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                    : 'text-gray-400 hover:text-white'
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
              key={index}
              className="bg-gray-800 rounded-lg p-6 text-center card-hover"
            >
              <div className={`w-16 h-16 ${skill.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <i className={`${skill.icon} text-white text-2xl`}></i>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">{skill.name}</h3>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"
                  style={{ width: `${skill.level}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-400">{skill.level}%</span>
            </div>
          ))}
        </div>
        
        {/* Additional Skills */}
        <div className="mt-16">
          <h3 className="text-2xl font-semibold mb-8 text-center text-white">Other Technologies</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {['TypeScript', 'Next.js', 'GraphQL', 'Redux', 'Jest', 'Webpack', 'Firebase', 'AWS', 'Figma'].map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 bg-gray-800 rounded-full text-gray-300 hover:bg-gray-700 transition-colors duration-300"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Skills;