import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext.jsx';
import { useTheme } from '../store/ThemeContext.jsx';
import ProfileForm from './forms/ProfileForm';
import SkillsForm from './forms/SkillsForm';
import ProjectsForm from './forms/ProjectsForm';
import ContactForm from './forms/ContactForm';
import DownloadStatus from './DownloadStatus';
import AboutForm from './forms/AboutForm';
import MessagesInbox from './MessagesInbox';
import TemplateCustomizer from './TemplateCustomizer';
import ExperienceForm from './forms/ExperienceForm';
import CertificationsForm from './forms/CertificationsForm';
import BlogForm from './forms/BlogForm';
import AnalyticsWidget from './AnalyticsWidget';
import ResumePDF from './ResumePDF';
import QRCodeCard from './QRCodeCard';
import GitHubStats from './GitHubStats';
import LeetCodeStats from './LeetCodeStats';
import AIBioSuggestion from './AIBioSuggestion';
import LighthouseAudit from './LighthouseAudit';
// import SEOGenerator from './SEOGenerator'; // reserved for future admin use
import ActivityHeatmap from './ActivityHeatmap';
import LeadsInbox from './LeadsInbox';
import SectionReorder from './SectionReorder';

import axios from 'axios';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState(null);
  const [aboutData, setAboutData] = useState(null);
  const [skillsData, setSkillsData] = useState([]);
  const [projectsData, setProjectsData] = useState([]);
  const [contactData, setContactData] = useState(null);
  const [messagesData, setMessagesData] = useState([]);
  const [experienceData, setExperienceData] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState({ show: false, message: '', type: 'success' });

  const isAdmin = user?.isAdmin;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const requests = [
          axios.get('/api/profile', { headers }),
          axios.get('/api/about', { headers }),
          axios.get('/api/skills', { headers }),
          axios.get('/api/projects', { headers }),
          axios.get('/api/contact', { headers }),
          axios.get('/api/experience', { headers }),
          axios.get('/api/certifications', { headers }),
        ];

        // Only fetch messages for admin users
        if (isAdmin) {
          requests.push(axios.get('/api/messages', { headers }));
        }

        const results = await Promise.all(requests);
        const [profileRes, aboutRes, skillsRes, projectsRes, contactRes, expRes, certRes, msgRes] = results;

        setProfileData(profileRes.data);
        setAboutData(aboutRes.data);
        setSkillsData(skillsRes.data);
        setProjectsData(projectsRes.data);
        setContactData(contactRes.data);
        setExperienceData(expRes.data);
        setCertifications(certRes.data);
        if (msgRes) setMessagesData(msgRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchUserData();
  }, [isAdmin]);

  const handleLogout = () => { logout(); navigate('/'); };

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadStatus({ show: true, message: 'Preparing your portfolio code...', type: 'success' });
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/portfolio/download', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: profileData, skills: skillsData, projects: projectsData, contact: contactData }),
      });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${profileData?.profile?.name?.replace(/\s+/g, '_') || 'portfolio'}_portfolio_code.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setDownloadStatus({ show: true, message: 'Portfolio code downloaded successfully!', type: 'success' });
    } catch (error) {
      setDownloadStatus({ show: true, message: 'Failed to download. Please try again.', type: 'error' });
    } finally {
      setDownloading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('photo', file);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post('/api/profile/upload-photo', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setProfileData(prev => ({ ...prev, profile: { ...prev?.profile, photo: data.photoUrl } }));
    } catch (err) {
      console.error('Photo upload failed:', err);
    }
  };

  const unreadCount = messagesData.filter(m => !m.read).length;

  // Core tabs for all users
  const coreTabs = [
    { id: 'profile',        name: 'Profile',       icon: 'fas fa-user' },
    { id: 'about',          name: 'About',          icon: 'fas fa-user-circle' },
    { id: 'experience',     name: 'Experience',     icon: 'fas fa-briefcase' },
    { id: 'skills',         name: 'Skills',         icon: 'fas fa-code' },
    { id: 'projects',       name: 'Projects',       icon: 'fas fa-folder' },
    { id: 'certifications', name: 'Certifications', icon: 'fas fa-certificate' },
    { id: 'contact',        name: 'Contact',        icon: 'fas fa-envelope' },
    { id: 'analytics',      name: 'Analytics',      icon: 'fas fa-chart-bar' },
    { id: 'heatmap',        name: 'Activity',       icon: 'fas fa-fire' },
    { id: 'design',         name: 'Design',         icon: 'fas fa-magic' },
    { id: 'reorder',        name: 'Sections',       icon: 'fas fa-sort' },
    // { id: 'seo',         name: 'SEO',            icon: 'fas fa-search' }, // future admin feature
    { id: 'lighthouse',     name: 'Performance',    icon: 'fas fa-tachometer-alt' },
    { id: 'tools',          name: 'Tools',          icon: 'fas fa-tools' },
  ];

  // Admin-only tabs
  const adminTabs = isAdmin ? [
    { id: 'messages', name: 'Messages',   icon: 'fas fa-inbox',    badge: unreadCount },
    { id: 'leads',    name: 'Hire Leads', icon: 'fas fa-user-tie' },
    { id: 'blog',     name: 'Blog',       icon: 'fas fa-pen-nib'  },
  ] : [];

  const tabs = [...coreTabs, ...adminTabs];

  const tabDesc = {
    profile:        'Manage your personal information and bio',
    about:          'Edit your story, experience and education',
    experience:     'Add work experience and education timeline',
    skills:         'Add and organize your technical skills',
    projects:       'Showcase your portfolio projects with case studies',
    certifications: 'Add certifications and badges',
    contact:        'Update your contact information',
    analytics:      'Track your portfolio views and traffic',
    heatmap:        'GitHub-style activity heatmap for your contributions',
    design:         'Pick template · customize colors, fonts & animations',
    reorder:        'Drag and drop to reorder portfolio sections',
    // seo:          'AI-generated SEO title and meta description',
    lighthouse:     'Google PageSpeed performance audit',
    tools:          'QR code · Resume PDF · GitHub & LeetCode stats',
    messages:       `${unreadCount} unread · ${messagesData.length} total`,
    leads:          'Hire Me requests from your public portfolio',
    blog:           'Write and publish blog posts (admin only)',
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Username banner */}
      {profileData && !profileData.username && !bannerDismissed && (
        <div className="bg-gradient-to-r from-blue-900/80 to-purple-900/80 border-b border-blue-700/50 px-4 py-3">
          <div className="container mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xl">🔗</span>
              <p className="text-white text-sm">
                <span className="font-semibold">Set your public portfolio URL!</span>{' '}
                Go to{' '}
                <button onClick={() => setActiveTab('profile')}
                  className="text-blue-300 hover:text-blue-200 underline underline-offset-2 font-medium">
                  Profile → scroll down
                </button>
                {' '}to pick your username.
              </p>
            </div>
            <button onClick={() => setBannerDismissed(true)}
              className="text-slate-400 hover:text-white transition-colors flex-shrink-0">
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      )}

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

            <div className="flex items-center space-x-3">
              <button onClick={toggleTheme}
                className="w-10 h-10 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 hover:text-white transition-colors flex items-center justify-center"
                title={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}>
                <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
              </button>

              {isAdmin && (
                <Link to="/admin"
                  className="w-10 h-10 bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition-colors flex items-center justify-center relative group"
                  title="Admin Panel">
                  <i className="fas fa-shield-alt"></i>
                  <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Admin Panel
                  </div>
                </Link>
              )}

              {profileData?.username && (
                <div className="relative group">
                  <button
                    onClick={() => navigator.clipboard.writeText(`${window.location.origin}/u/${profileData.username}`)}
                    className="w-10 h-10 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors flex items-center justify-center"
                    title="Copy portfolio URL">
                    <i className="fas fa-share-alt"></i>
                  </button>
                  <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Copy Portfolio URL
                  </div>
                </div>
              )}

              <Link to={profileData?.username ? `/u/${profileData.username}` : '/'}
                className="w-10 h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center relative group"
                target={profileData?.username ? '_blank' : undefined}
                rel={profileData?.username ? 'noopener noreferrer' : undefined}>
                <i className="fas fa-eye"></i>
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  View Live Portfolio
                </div>
              </Link>

              <button onClick={handleLogout}
                className="w-10 h-10 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 hover:text-white transition-colors flex items-center justify-center relative group"
                title="Logout">
                <i className="fas fa-sign-out-alt"></i>
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Logout
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      <DownloadStatus
        show={downloadStatus.show}
        message={downloadStatus.message}
        type={downloadStatus.type}
        onClose={() => setDownloadStatus({ show: false, message: '', type: 'success' })}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
              <div className="text-center mb-6">
                <div className="relative inline-block mb-3">
                  <img
                    src={profileData?.profile?.photo || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'}
                    alt="Profile"
                    className="w-20 h-20 rounded-full block border-4 border-blue-500 shadow-lg object-cover"
                  />
                  <label
                    htmlFor="sidebar-photo-upload"
                    className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 hover:bg-blue-500 rounded-full border-2 border-slate-800 flex items-center justify-center cursor-pointer transition-colors shadow-lg z-10"
                    title="Change profile photo"
                  >
                    <i className="fas fa-camera text-white text-xs"></i>
                  </label>
                  <input
                    id="sidebar-photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </div>
                <h2 className="text-base font-semibold text-white">{profileData?.profile?.name || 'Your Name'}</h2>
                <p className="text-slate-400 text-xs">{profileData?.profile?.title || 'Your Title'}</p>
                {isAdmin && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-amber-600/20 text-amber-400 text-xs rounded-full border border-amber-600/30">
                    Admin
                  </span>
                )}
              </div>

              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'text-slate-300 hover:bg-slate-700'
                    }`}>
                    <i className={`${tab.icon} w-4 text-center text-xs`}></i>
                    <span className="font-medium">{tab.name}</span>
                    {tab.badge > 0 && (
                      <span className="ml-auto bg-blue-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>

              <div className="mt-5 pt-5 border-t border-slate-700 space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Skills:</span>
                  <span className="text-white font-semibold bg-blue-500 px-2 py-0.5 rounded-full text-xs">{skillsData.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Projects:</span>
                  <span className="text-white font-semibold bg-green-500 px-2 py-0.5 rounded-full text-xs">{projectsData.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Experience:</span>
                  <span className="text-white font-semibold bg-purple-500 px-2 py-0.5 rounded-full text-xs">{experienceData.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Certs:</span>
                  <span className="text-white font-semibold bg-yellow-600 px-2 py-0.5 rounded-full text-xs">{certifications.length}</span>
                </div>
              </div>
            </div>

            {/* Download card */}
            <div className="mt-4 bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-xl p-4 border border-green-500/30">
              <div className="text-center">
                <i className="fas fa-download text-green-400 text-xl mb-2 block"></i>
                <h3 className="text-white font-semibold text-sm mb-1">Download Code</h3>
                <button onClick={handleDownload} disabled={downloading}
                  className="w-full bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-semibold text-sm flex items-center justify-center">
                  {downloading
                    ? <><i className="fas fa-spinner fa-spin mr-2"></i>Preparing…</>
                    : <><i className="fas fa-download mr-2"></i>Download ZIP</>}
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg overflow-hidden">
              {/* Tab Header */}
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 border-b border-slate-600">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center">
                    <i className={`fas ${tabs.find(t => t.id === activeTab)?.icon} text-white text-sm`}></i>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      {tabs.find(t => t.id === activeTab)?.name}
                    </h2>
                    <p className="text-slate-400 text-xs">{tabDesc[activeTab]}</p>
                  </div>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <ProfileForm profileData={profileData} setProfileData={setProfileData} />
                    <AIBioSuggestion
                      profileData={profileData}
                      skillsData={skillsData}
                      onApply={(bio) => setProfileData(prev => ({
                        ...prev,
                        profile: { ...prev?.profile, bio }
                      }))}
                    />
                  </div>
                )}
                {activeTab === 'about'          && <AboutForm aboutData={aboutData} setAboutData={setAboutData} />}
                {activeTab === 'experience'     && <ExperienceForm />}
                {activeTab === 'skills'         && <SkillsForm skillsData={skillsData} setSkillsData={setSkillsData} />}
                {activeTab === 'projects'       && <ProjectsForm projectsData={projectsData} setProjectsData={setProjectsData} />}
                {activeTab === 'certifications' && <CertificationsForm />}
                {activeTab === 'contact'        && <ContactForm contactData={contactData} setContactData={setContactData} />}
                {activeTab === 'analytics'      && <AnalyticsWidget />}
                {activeTab === 'heatmap'        && <ActivityHeatmap />}
                {activeTab === 'design'         && <TemplateCustomizer profileData={profileData} />}
                {activeTab === 'reorder'        && <SectionReorder profileData={profileData} />}
                {/* {activeTab === 'seo'         && <SEOGenerator profileData={profileData} />} */}
                {activeTab === 'lighthouse'     && <LighthouseAudit profileData={profileData} />}

                {activeTab === 'tools' && (
                  <div className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <QRCodeCard username={profileData?.username} />
                      <ResumePDF
                        profileData={profileData}
                        skillsData={skillsData}
                        projectsData={projectsData}
                        experienceData={experienceData}
                        certifications={certifications}
                      />
                    </div>
                    <GitHubStats username={profileData?.profile?.social?.github} />
                    <LeetCodeStats username={profileData?.profile?.social?.leetcode} />
                  </div>
                )}

                {/* Admin-only tabs */}
                {activeTab === 'messages' && isAdmin && (
                  <MessagesInbox messagesData={messagesData} setMessagesData={setMessagesData} />
                )}
                {activeTab === 'leads' && isAdmin && (
                  <LeadsInbox />
                )}
                {activeTab === 'blog' && isAdmin && (
                  <BlogForm />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
