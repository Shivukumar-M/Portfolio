import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AboutForm = ({ aboutData, setAboutData }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeSection, setActiveSection] = useState('story');

  // Form states
  const [story, setStory] = useState({
    intro: '',
    skills: '',
    hobbies: ''
  });

  const [experiences, setExperiences] = useState([]);
  const [education, setEducation] = useState([]);

  const [newExperience, setNewExperience] = useState({
    title: '',
    company: '',
    period: '',
    description: '',
    current: false
  });

  const [newEducation, setNewEducation] = useState({
    degree: '',
    school: '',
    period: '',
    description: '',
    grade: ''
  });

  useEffect(() => {
    if (aboutData) {
      setStory(aboutData.story || { intro: '', skills: '', hobbies: '' });
      setExperiences(aboutData.experiences || []);
      setEducation(aboutData.education || []);
    }
  }, [aboutData]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.put('/api/about', {
        story,
        experiences,
        education
      }, { headers });

      if (response.data.success) {
        setAboutData(response.data.data);
        setMessage('About information saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error saving about data:', error);
      setMessage('Failed to save about information');
    } finally {
      setLoading(false);
    }
  };

  const addExperience = () => {
    if (newExperience.title && newExperience.company && newExperience.period) {
      setExperiences([...experiences, { ...newExperience }]);
      setNewExperience({
        title: '',
        company: '',
        period: '',
        description: '',
        current: false
      });
    }
  };

  const removeExperience = (index) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const addEducation = () => {
    if (newEducation.degree && newEducation.school && newEducation.period) {
      setEducation([...education, { ...newEducation }]);
      setNewEducation({
        degree: '',
        school: '',
        period: '',
        description: '',
        grade: ''
      });
    }
  };

  const removeEducation = (index) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const sections = [
    { id: 'story', name: 'My Story', icon: 'fas fa-book-open' },
    { id: 'experiences', name: 'Experiences', icon: 'fas fa-briefcase' },
    { id: 'education', name: 'Education', icon: 'fas fa-graduation-cap' }
  ];

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex space-x-2 mb-6">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 ${
              activeSection === section.id
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <i className={`${section.icon} mr-2`}></i>
            {section.name}
          </button>
        ))}
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('success') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {message}
        </div>
      )}

      {/* Story Section */}
      {activeSection === 'story' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Introduction
            </label>
            <textarea
              value={story.intro}
              onChange={(e) => setStory({ ...story, intro: e.target.value })}
              rows="4"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              placeholder="Tell us about yourself and your journey..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Skills & Expertise
            </label>
            <textarea
              value={story.skills}
              onChange={(e) => setStory({ ...story, skills: e.target.value })}
              rows="3"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              placeholder="Describe your skills and areas of expertise..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Hobbies & Interests
            </label>
            <textarea
              value={story.hobbies}
              onChange={(e) => setStory({ ...story, hobbies: e.target.value })}
              rows="3"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              placeholder="Share your hobbies and interests outside of work..."
            />
          </div>
        </div>
      )}

      {/* Experiences Section */}
      {activeSection === 'experiences' && (
        <div className="space-y-6">
          {/* Add New Experience */}
          <div className="bg-slate-700/50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-white mb-4">Add New Experience</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Job Title"
                value={newExperience.title}
                onChange={(e) => setNewExperience({ ...newExperience, title: e.target.value })}
                className="px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Company"
                value={newExperience.company}
                onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                className="px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Period (e.g., 2022 - Present)"
                value={newExperience.period}
                onChange={(e) => setNewExperience({ ...newExperience, period: e.target.value })}
                className="px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={newExperience.current}
                  onChange={(e) => setNewExperience({ ...newExperience, current: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-slate-300">Current Position</span>
              </div>
            </div>
            <textarea
              placeholder="Job Description"
              value={newExperience.description}
              onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
              rows="3"
              className="w-full mt-4 px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={addExperience}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Add Experience
            </button>
          </div>

          {/* Existing Experiences */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Your Experiences</h4>
            {experiences.map((exp, index) => (
              <div key={index} className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h5 className="font-semibold text-white">{exp.title}</h5>
                    <p className="text-slate-300">{exp.company}</p>
                  </div>
                  <div className="flex space-x-2">
                    <span className="text-sm bg-blue-500 text-white px-2 py-1 rounded">
                      {exp.period}
                    </span>
                    <button
                      onClick={() => removeExperience(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                <p className="text-slate-400 text-sm">{exp.description}</p>
                {exp.current && (
                  <span className="inline-block mt-2 text-xs bg-green-500 text-white px-2 py-1 rounded">
                    Current
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education Section */}
      {activeSection === 'education' && (
        <div className="space-y-6">
          {/* Add New Education */}
          <div className="bg-slate-700/50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-white mb-4">Add New Education</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Degree"
                value={newEducation.degree}
                onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                className="px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="School/University"
                value={newEducation.school}
                onChange={(e) => setNewEducation({ ...newEducation, school: e.target.value })}
                className="px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Period (e.g., 2015 - 2019)"
                value={newEducation.period}
                onChange={(e) => setNewEducation({ ...newEducation, period: e.target.value })}
                className="px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Grade (Optional)"
                value={newEducation.grade}
                onChange={(e) => setNewEducation({ ...newEducation, grade: e.target.value })}
                className="px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            <textarea
              placeholder="Description"
              value={newEducation.description}
              onChange={(e) => setNewEducation({ ...newEducation, description: e.target.value })}
              rows="3"
              className="w-full mt-4 px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={addEducation}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Add Education
            </button>
          </div>

          {/* Existing Education */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Your Education</h4>
            {education.map((edu, index) => (
              <div key={index} className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h5 className="font-semibold text-white">{edu.degree}</h5>
                    <p className="text-slate-300">{edu.school}</p>
                  </div>
                  <div className="flex space-x-2">
                    <span className="text-sm bg-purple-500 text-white px-2 py-1 rounded">
                      {edu.period}
                    </span>
                    <button
                      onClick={() => removeEducation(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                <p className="text-slate-400 text-sm">{edu.description}</p>
                {edu.grade && (
                  <div className="mt-2 text-sm text-slate-300">
                    <strong>Grade:</strong> {edu.grade}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t border-slate-700">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Saving...
            </>
          ) : (
            <>
              <i className="fas fa-save mr-2"></i>
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AboutForm;