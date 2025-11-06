import React, { useState, useEffect } from 'react';
import { useAuth } from '../store/AuthContext.jsx';
import axios from 'axios';

const Hero = () => {
  const { isAuthenticated, user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  const roles = [
    'Full Stack Developer',
    'MERN Specialist',
    'Problem Solver',
    'Tech Enthusiast',
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      // Show default data first (so page never stays blank)
      setProfileData({
        profile: {
          name: 'Shivukumar M',
          title: 'Full Stack Developer',
          bio: 'Passionate about creating elegant solutions to complex problems. Specializing in modern web technologies with a focus on user experience and clean code.',
          photo: './images/github.jpg',
          social: {
            github: 'https://github.com/Shivukumar-M',
            linkedin: 'https://www.linkedin.com/in/shivu-kumar-a-m',
            twitter: '#',
          },
        },
      });

      try {
        if (isAuthenticated && user) {
          // Logged-in user's private profile
          const token = localStorage.getItem('token');
          const headers = { Authorization: `Bearer ${token}` };
          const res = await axios.get('/api/profile', { headers });
          if (res.data) setProfileData(res.data);
        } else {
          // Public or guest profile
          const res = await axios.get('http://localhost:5000/api/profile/public');
          if (res.data) setProfileData(res.data);
        }
      } catch (error) {
        console.warn('Using default profile — API unreachable or user not logged in.');
      }
    };

    fetchProfile();
  }, [isAuthenticated, user]);

  useEffect(() => {
    const handleType = () => {
      const i = loopNum % roles.length;
      const fullText = roles[i];

      setText(
        isDeleting
          ? fullText.substring(0, text.length - 1)
          : fullText.substring(0, text.length + 1)
      );

      setTypingSpeed(isDeleting ? 30 : 150);

      if (!isDeleting && text === fullText) {
        setTimeout(() => setIsDeleting(true), 1500);
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, typingSpeed]);

  if (!profileData) {
    return (
      <section id="home" className="min-h-screen flex items-center pt-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="loading mx-auto mb-4"></div>
            <p className="text-slate-400">Loading Profile...</p>
          </div>
        </div>
      </section>
    );
  }

  const { profile } = profileData;

  return (
    <section id="home" className="min-h-screen flex items-center pt-20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* LEFT CONTENT */}
          <div className="fade-in">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Hi, I'm <span className="gradient-text">{profile.name}</span>
            </h1>
            <h2 className="text-2xl md:text-3xl font-medium mb-6 text-slate-300">
              I'm a <span className="text-blue-400">{text}</span>
              <span className="animate-pulse">|</span>
            </h2>
            <p className="text-lg text-slate-400 mb-8 max-w-lg">{profile.bio}</p>

            <div className="flex flex-wrap gap-4 mb-8">
              <a href="#projects" className="btn-primary">
                View My Work
              </a>
              <a href="#contact" className="btn-secondary">
                Contact Me
              </a>
            </div>

            <div className="flex space-x-4">
              <a
                href={profile.social.github}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-300"
                aria-label="GitHub"
              >
                <i className="fab fa-github"></i>
              </a>
              <a
                href={profile.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-300"
                aria-label="LinkedIn"
              >
                <i className="fab fa-linkedin"></i>
              </a>
              <a
                href={profile.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-300"
                aria-label="Twitter"
              >
                <i className="fab fa-twitter"></i>
              </a>
            </div>
          </div>

          {/* RIGHT PROFILE IMAGE */}
          <div className="flex justify-center">
            <div className="relative floating">
              <div className="w-80 h-80 rounded-2xl overflow-hidden glow">
                <img
                  src={profile.photo}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-500 rounded-2xl flex items-center justify-center shadow-xl">
                <i className="fas fa-code text-white text-2xl"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
