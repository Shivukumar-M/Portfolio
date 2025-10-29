import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext.jsx';
import ProfileForm from './forms/ProfileForm';
import SkillsForm from './forms/SkillsForm';
import ProjectsForm from './forms/ProjectsForm';
import ContactForm from './forms/ContactForm';
import axios from 'axios';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState(null);
  const [skillsData, setSkillsData] = useState([]);
  const [projectsData, setProjectsData] = useState([]);
  const [contactData, setContactData] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [showDownloadSuccess, setShowDownloadSuccess] = useState(false);

  useEffect(() => {
    // Fetch user data
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        // Fetch profile data
        const profileRes = await axios.get('/api/profile', { headers });
        setProfileData(profileRes.data);
        
        // Fetch skills data
        const skillsRes = await axios.get('/api/skills', { headers });
        setSkillsData(skillsRes.data);
        
        // Fetch projects data
        const projectsRes = await axios.get('/api/projects', { headers });
        setProjectsData(projectsRes.data);
        
        // Fetch contact data
        const contactRes = await axios.get('/api/contact', { headers });
        setContactData(contactRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // Create a temporary link element to trigger the download
      const token = localStorage.getItem('token');
      const link = document.createElement('a');
      link.href = `/api/download`;
      link.target = '_blank';
      link.download = `${profileData?.profile?.name?.replace(/\s+/g, '_') || 'portfolio'}_code.zip`;
      
      // Add authorization header for the download
      fetch('/api/download', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => {
        if (response.ok) {
          return response.blob();
        }
        throw new Error('Download failed');
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        setShowDownloadSuccess(true);
        setTimeout(() => setShowDownloadSuccess(false), 3000);
      })
      .catch(error => {
        console.error('Download error:', error);
        alert('Failed to download portfolio code. Please try again.');
      })
      .finally(() => {
        setDownloading(false);
      });
    } catch (error) {
      console.error('Download error:', error);
      setDownloading(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: 'fas fa-user' },
    { id: 'skills', name: 'Skills', icon: 'fas fa-code' },
    { id: 'projects', name: 'Projects', icon: 'fas fa-folder' },
    { id: 'contact', name: 'Contact', icon: 'fas fa-envelope' },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <h1 className="text-xl font-bold text-white">Portfolio Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-300 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Preparing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-download mr-2"></i>
                    Download Code
                  </>
                )}
              </button>
              <Link to="/" className="text-slate-300 hover:text-white transition-colors duration-300">
                <i className="fas fa-eye mr-2"></i>
                View Portfolio
              </Link>
              <button
                onClick={handleLogout}
                className="text-slate-300 hover:text-white transition-colors duration-300"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Download Success Notification */}
      {showDownloadSuccess && (
        <div className="fixed top-20 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-pulse">
          <i className="fas fa-check-circle"></i>
          <span>Portfolio code downloaded successfully!</span>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <img
                    src={profileData?.profile?.photo || 'https://via.placeholder.com/150x150/1e293b/3b82f6?text=Your+Photo'}
                    alt="Profile"
                    className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-blue-500"
                  />
                  <div className="absolute bottom-4 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-slate-800"></div>
                </div>
                <h2 className="text-lg font-semibold text-white">
                  {profileData?.profile?.name || 'Your Name'}
                </h2>
                <p className="text-slate-400 text-sm">
                  {profileData?.profile?.title || 'Your Title'}
                </p>
                <div className="mt-2 text-xs text-green-400">
                  <i className="fas fa-circle text-green-400 mr-1"></i>
                  Online
                </div>
              </div>
              
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                        : 'text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <i className={tab.icon}></i>
                    <span>{tab.name}</span>
                    {activeTab === tab.id && (
                      <i className="fas fa-chevron-right ml-auto"></i>
                    )}
                  </button>
                ))}
              </nav>
              
              <div className="mt-6 pt-6 border-t border-slate-700">
                <div className="text-xs text-slate-400 space-y-2">
                  <div className="flex justify-between">
                    <span>Skills:</span>
                    <span className="text-white">{skillsData.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Projects:</span>
                    <span className="text-white">{projectsData.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Updated:</span>
                    <span className="text-white">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
              {/* Tab Header */}
              <div className="bg-slate-700 px-6 py-4 border-b border-slate-600">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white flex items-center">
                    <i className={`fas ${tabs.find(tab => tab.id === activeTab)?.icon} mr-3`}></i>
                    {tabs.find(tab => tab.id === activeTab)?.name} Management
                  </h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-400">
                      {activeTab === 'profile' && 'Personal Information'}
                      {activeTab === 'skills' && 'Technical Skills'}
                      {activeTab === 'projects' && 'Portfolio Projects'}
                      {activeTab === 'contact' && 'Contact Details'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'profile' && (
                  <ProfileForm 
                    profileData={profileData} 
                    setProfileData={setProfileData} 
                  />
                )}
                
                {activeTab === 'skills' && (
                  <SkillsForm 
                    skillsData={skillsData} 
                    setSkillsData={setSkillsData} 
                  />
                )}
                
                {activeTab === 'projects' && (
                  <ProjectsForm 
                    projectsData={projectsData} 
                    setProjectsData={setProjectsData} 
                  />
                )}
                
                {activeTab === 'contact' && (
                  <ContactForm 
                    contactData={contactData} 
                    setContactData={setContactData} 
                  />
                )}
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="mt-6 bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="p-4 bg-green-600/20 border border-green-600/30 rounded-lg hover:bg-green-600/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fas fa-download text-green-400 text-xl mb-2"></i>
                  <p className="text-white text-sm">Download Code</p>
                  <p className="text-slate-400 text-xs">Get your portfolio source code</p>
                </button>
                
                <Link
                  to="/"
                  className="p-4 bg-blue-600/20 border border-blue-600/30 rounded-lg hover:bg-blue-600/30 transition-all duration-300 block"
                >
                  <i className="fas fa-eye text-blue-400 text-xl mb-2"></i>
                  <p className="text-white text-sm">Preview Portfolio</p>
                  <p className="text-slate-400 text-xs">See how it looks live</p>
                </Link>
                
                <button
                  onClick={() => {
                    // Refresh data
                    window.location.reload();
                  }}
                  className="p-4 bg-purple-600/20 border border-purple-600/30 rounded-lg hover:bg-purple-600/30 transition-all duration-300"
                >
                  <i className="fas fa-sync-alt text-purple-400 text-xl mb-2"></i>
                  <p className="text-white text-sm">Refresh Data</p>
                  <p className="text-slate-400 text-xs">Update all sections</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;