import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../store/AuthContext.jsx';

const About = () => {
  const { isAuthenticated } = useAuth();
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Default data in case API fails
  const defaultAboutData = {
    story: {
      intro: "Hello! I'm Shivukumar M, a passionate full-stack developer with a love for creating elegant solutions to complex problems. My journey in web development began during my college years, and I've been honing my skills ever since.",
      skills: "I specialize in the MERN stack (MongoDB, Express, React, Node.js) and have experience working with various other technologies. I'm always eager to learn new things and take on challenging projects that push me to grow as a developer.",
      hobbies: "When I'm not coding, you can find me exploring new technologies, contributing to open-source projects, or enjoying a good cup of coffee while reading tech blogs."
    },
    experiences: [
      {
        title: 'Full Stack Developer',
        company: 'Tech Company',
        period: '2022 - Present',
        description: 'Developing and maintaining web applications using React, Node.js, and MongoDB.',
        current: true
      },
      {
        title: 'Frontend Developer',
        company: 'Digital Agency',
        period: '2020 - 2022',
        description: 'Creating responsive and interactive user interfaces with modern JavaScript frameworks.',
        current: false
      },
      {
        title: 'Junior Developer',
        company: 'Startup Inc.',
        period: '2019 - 2020',
        description: 'Assisted in the development of various web projects and gained experience in full-stack development.',
        current: false
      }
    ],
    education: [
      {
        degree: 'Bachelor of Computer Science',
        school: 'University Name',
        period: '2015 - 2019',
        description: 'Graduated with honors, specializing in software engineering and web development.'
      }
    ]
  };

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        setLoading(true);
        let response;

        if (isAuthenticated) {
          // Fetch user's about data if authenticated
          const token = localStorage.getItem('token');
          const headers = { Authorization: `Bearer ${token}` };
          response = await axios.get('/api/about', { headers });
        } else {
          // Fetch public about data
          response = await axios.get('/api/about/public');
        }

        if (response.data.success) {
          setAboutData(response.data.data);
        } else {
          // Use default data if API response is not successful
          setAboutData(defaultAboutData);
        }
      } catch (error) {
        console.error('Error fetching about data:', error);
        // Use default data if API fails
        setAboutData(defaultAboutData);
      } finally {
        setLoading(false);
      }
    };

    fetchAboutData();
  }, [isAuthenticated]);

  if (loading) {
    return (
      <section id="about" className="py-20 px-4 bg-slate-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-slate-400 mt-4">Loading about information...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!aboutData) {
    return (
      <section id="about" className="py-20 px-4 bg-slate-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-slate-400">Unable to load about information.</p>
          </div>
        </div>
      </section>
    );
  }

  const { story, experiences, education } = aboutData;

  return (
    <section id="about" className="py-20 px-4 bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            About <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Me</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Get to know more about my background, experience, and education
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12 animate-slide-up">
          {/* Story Section */}
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700/50 shadow-lg">
              <h3 className="text-2xl font-semibold mb-6 text-white flex items-center">
                <i className="fas fa-book-open text-blue-400 mr-3"></i>
                My Story
              </h3>
              <div className="space-y-4">
                <p className="text-slate-300 leading-relaxed text-lg">
                  {story.intro}
                </p>
                <p className="text-slate-300 leading-relaxed text-lg">
                  {story.skills}
                </p>
                <p className="text-slate-300 leading-relaxed text-lg">
                  {story.hobbies}
                </p>
              </div>
            </div>
          </div>
          
          {/* Experience & Education Section */}
          <div className="space-y-8">
            {/* Experience */}
            <div>
              <h3 className="text-2xl font-semibold mb-6 text-white flex items-center">
                <i className="fas fa-briefcase text-green-400 mr-3"></i>
                Experience
              </h3>
              <div className="space-y-4">
                {experiences && experiences.length > 0 ? (
                  experiences.map((exp, index) => (
                    <div 
                      key={index} 
                      className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 shadow-lg hover:border-blue-500/30 transition-all duration-300 group"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                            {exp.title}
                          </h4>
                          <h5 className="text-slate-400 text-lg mt-1">{exp.company}</h5>
                        </div>
                        <span className="text-sm bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full font-medium">
                          {exp.period}
                        </span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{exp.description}</p>
                      {exp.current && (
                        <span className="inline-block mt-3 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30">
                          Current Position
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 text-center">
                    <p className="text-slate-400">No experience information available.</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Education */}
            <div>
              <h3 className="text-2xl font-semibold mb-6 text-white flex items-center">
                <i className="fas fa-graduation-cap text-purple-400 mr-3"></i>
                Education
              </h3>
              <div className="space-y-4">
                {education && education.length > 0 ? (
                  education.map((edu, index) => (
                    <div 
                      key={index} 
                      className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 shadow-lg hover:border-purple-500/30 transition-all duration-300 group"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-xl font-semibold text-white group-hover:text-purple-400 transition-colors">
                            {edu.degree}
                          </h4>
                          <h5 className="text-slate-400 text-lg mt-1">{edu.school}</h5>
                        </div>
                        <span className="text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full font-medium">
                          {edu.period}
                        </span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{edu.description}</p>
                      {edu.grade && (
                        <div className="mt-3 text-sm text-slate-400">
                          <strong>Grade:</strong> {edu.grade}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 text-center">
                    <p className="text-slate-400">No education information available.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        
      </div>
    </section>
  );
};

export default About;