import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext.jsx';
import ProfileForm from './forms/ProfileForm';
import SkillsForm from './forms/SkillsForm';
import ProjectsForm from './forms/ProjectsForm';
import ContactForm from './forms/ContactForm';
import DownloadStatus from './DownloadStatus';
import AboutForm from './forms/AboutForm';

import axios from 'axios';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState(null);
  const [aboutData, setAboutData] = useState(null);
  const [skillsData, setSkillsData] = useState([]);
  const [projectsData, setProjectsData] = useState([]);
  const [contactData, setContactData] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  useEffect(() => {
    // Fetch user data
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        // Fetch profile data
        const profileRes = await axios.get('/api/profile', { headers });
        setProfileData(profileRes.data);

        // Fetch about data
        const aboutRes = await axios.get('/api/about', { headers });
        setAboutData(aboutRes.data);
        
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
      const token = localStorage.getItem('token');
      
      // Show preparing message
      setDownloadStatus({
        show: true,
        message: 'Preparing your portfolio code...',
        type: 'success'
      });

      // Make API call to generate and download portfolio
      const response = await fetch('/api/portfolio/download', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile: profileData,
          skills: skillsData,
          projects: projectsData,
          contact: contactData
        })
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      // Get the blob data
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename
      const userName = profileData?.profile?.name?.replace(/\s+/g, '_') || 'portfolio';
      link.download = `${userName}_portfolio_code.zip`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Show success message
      setDownloadStatus({
        show: true,
        message: 'Portfolio code downloaded successfully!',
        type: 'success'
      });

    } catch (error) {
      console.error('Download error:', error);
      setDownloadStatus({
        show: true,
        message: 'Failed to download portfolio code. Please try again.',
        type: 'error'
      });
    } finally {
      setDownloading(false);
      
      // Auto-hide success message after 5 seconds
      if (downloadStatus.type === 'success') {
        setTimeout(() => {
          setDownloadStatus({ show: false, message: '', type: 'success' });
        }, 5000);
      }
    }
  };

  const closeDownloadStatus = () => {
    setDownloadStatus({ show: false, message: '', type: 'success' });
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: 'fas fa-user' },
    { id: 'about', name: 'About', icon: 'fas fa-user-circle' }, 
    { id: 'skills', name: 'Skills', icon: 'fas fa-code' },
    { id: 'projects', name: 'Projects', icon: 'fas fa-folder' },
    { id: 'contact', name: 'Contact', icon: 'fas fa-envelope' },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <i className="fas fa-code text-white text-lg"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Portfolio Dashboard</h1>
                <p className="text-slate-400 text-sm">Welcome back, {user?.name || 'User'}!</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Download Button - Icon Only */}
             
              
              <Link 
                to="/" 
                className="w-12 h-12 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center relative group"
                title="View Live Portfolio"
              >
                <i className="fas fa-eye"></i>
                
                {/* Tooltip */}
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
                  View Live Portfolio
                </div>
              </Link>
              
              <button
                onClick={handleLogout}
                className="w-12 h-12 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 hover:text-white transition-colors duration-300 flex items-center justify-center relative group"
                title="Logout"
              >
                <i className="fas fa-sign-out-alt"></i>
                
                {/* Tooltip */}
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
                  Logout
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Download Status Notification */}
      <DownloadStatus 
        show={downloadStatus.show}
        message={downloadStatus.message}
        type={downloadStatus.type}
        onClose={closeDownloadStatus}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
              {/* User Profile */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <img
                    src={profileData?.profile?.photo || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'}
                    alt="Profile"
                    className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-blue-500 shadow-lg"
                  />
                  <div className="absolute bottom-4 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-slate-800 shadow-lg"></div>
                </div>
                <h2 className="text-lg font-semibold text-white">
                  {profileData?.profile?.name || 'Your Name'}
                </h2>
                <p className="text-slate-400 text-sm">
                  {profileData?.profile?.title || 'Your Title'}
                </p>
                <div className="mt-2 text-xs text-green-400 flex items-center justify-center">
                  <i className="fas fa-circle text-green-400 mr-1 animate-pulse"></i>
                  Online & Active
                </div>
              </div>
              
              {/* Navigation Tabs */}
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105'
                        : 'text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <i className={`${tab.icon} w-5 text-center`}></i>
                    <span className="font-medium">{tab.name}</span>
                    {activeTab === tab.id && (
                      <i className="fas fa-chevron-right ml-auto text-sm"></i>
                    )}
                  </button>
                ))}
              </nav>
              
              {/* Stats */}
              <div className="mt-6 pt-6 border-t border-slate-700">
                <h3 className="text-sm font-semibold text-slate-400 mb-3">PORTFOLIO STATS</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Skills Added:</span>
                    <span className="text-white font-semibold bg-blue-500 px-2 py-1 rounded-full text-xs">
                      {skillsData.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Projects Live:</span>
                    <span className="text-white font-semibold bg-green-500 px-2 py-1 rounded-full text-xs">
                      {projectsData.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Last Updated:</span>
                    <span className="text-white text-xs">
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Download Card */}
            <div className="mt-6 bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-xl p-6 border border-green-500/30">
              <div className="text-center">
                <i className="fas fa-download text-green-400 text-2xl mb-3"></i>
                <h3 className="text-white font-semibold mb-2">Ready to Download</h3>
                <p className="text-slate-300 text-sm mb-4">
                  Get your complete portfolio source code with all customizations.
                </p>
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center"
                >
                  {downloading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Preparing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-download mr-2"></i>
                      Download Now
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg overflow-hidden">
              {/* Tab Header */}
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 border-b border-slate-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                      <i className={`fas ${tabs.find(tab => tab.id === activeTab)?.icon} text-white`}></i>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {tabs.find(tab => tab.id === activeTab)?.name} Management
                      </h2>
                      <p className="text-slate-400 text-sm">
                        {activeTab === 'profile' && 'Manage your personal information and bio'}
                        {activeTab === 'skills' && 'Add and organize your technical skills'}
                        {activeTab === 'projects' && 'Showcase your portfolio projects'}
                        {activeTab === 'contact' && 'Update your contact information'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-400 bg-slate-700 px-3 py-1 rounded-full">
                      Auto-save enabled
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

                {activeTab === 'about' && (
                  <AboutForm 
                    aboutData={aboutData} 
                    setAboutData={setAboutData} 
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
            
            {/* Quick Actions Panel */}
            <div className="mt-6 bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <i className="fas fa-bolt text-yellow-400 mr-2"></i>
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="p-4 bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-600/30 rounded-lg hover:from-green-600/30 hover:to-emerald-600/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <i className="fas fa-download text-green-400 text-xl mb-2 group-hover:scale-110 transition-transform"></i>
                  <p className="text-white text-sm font-semibold">Download Code</p>
                  <p className="text-slate-400 text-xs">Get complete source code</p>
                </button>
                
                <Link
                  to="/"
                  className="p-4 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-600/30 rounded-lg hover:from-blue-600/30 hover:to-indigo-600/30 transition-all duration-300 block group"
                >
                  <i className="fas fa-eye text-blue-400 text-xl mb-2 group-hover:scale-110 transition-transform"></i>
                  <p className="text-white text-sm font-semibold">Live Preview</p>
                  <p className="text-slate-400 text-xs">See your portfolio live</p>
                </Link>
                
                <button
                  onClick={() => window.location.reload()}
                  className="p-4 bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-600/30 rounded-lg hover:from-purple-600/30 hover:to-pink-600/30 transition-all duration-300 group"
                >
                  <i className="fas fa-sync-alt text-purple-400 text-xl mb-2 group-hover:rotate-180 transition-transform"></i>
                  <p className="text-white text-sm font-semibold">Refresh Data</p>
                  <p className="text-slate-400 text-xs">Sync latest changes</p>
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