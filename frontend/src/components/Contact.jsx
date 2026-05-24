import React, { useState, useEffect } from 'react';
import { useAuth } from '../store/AuthContext.jsx';
import axios from 'axios';

const ContactInfoItem = ({ icon, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: 8,
        background: '#18181b',
        border: '1px solid #27272a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <i className={icon} style={{ color: '#00ff88', fontSize: '0.8rem' }} />
    </div>
    <div>
      <p style={{ margin: '0 0 0.125rem', fontSize: '0.75rem', color: '#71717a', fontFamily: 'Inter, sans-serif' }}>{label}</p>
      <p style={{ margin: 0, fontSize: '0.875rem', color: '#d4d4d8', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{value}</p>
    </div>
  </div>
);

const inputStyle = {
  width: '100%',
  padding: '0.5625rem 0.75rem',
  background: 'transparent',
  border: '1px solid #27272a',
  borderRadius: 8,
  fontFamily: 'Inter, sans-serif',
  fontSize: '0.875rem',
  color: '#fafafa',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
};

const focusInput = (e) => {
  e.target.style.borderColor = '#00ff88';
  e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.15)';
};
const blurInput = (e) => {
  e.target.style.borderColor = '#27272a';
  e.target.style.boxShadow = 'none';
};

const Contact = () => {
  const { isAuthenticated, user } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [contactData, setContactData] = useState(null);

  useEffect(() => {
    const fetchContact = async () => {
      try {
        if (isAuthenticated && user) {
          const token = localStorage.getItem('token');
          const res = await axios.get('/api/contact', { headers: { Authorization: `Bearer ${token}` } });
          setContactData(res.data);
        } else {
          setContactData({
            email: 'shivukumarlearn7@gmail.com',
            phone: '+91 98765 43210',
            location: 'Bengaluru, Karnataka, India',
          });
        }
      } catch {
        setContactData({
          email: 'shivukumarlearn7@gmail.com',
          phone: '+91 98765 43210',
          location: 'Bengaluru, Karnataka, India',
        });
      }
    };
    fetchContact();
  }, [isAuthenticated, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.post('/api/messages', { ...formData, userId: user?._id || 'public' });
      setSubmitStatus({ success: true, message: response.data.message });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setSubmitStatus({
        success: false,
        message: error.response?.data?.message || 'Failed to send message. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus(null), 5000);
    }
  };

  if (!contactData) {
    return (
      <section id="contact" style={{ padding: '5rem 1.5rem', background: '#09090b' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <div className="loading" style={{ margin: '0 auto' }} />
        </div>
      </section>
    );
  }

  return (
    <section id="contact" style={{ padding: '5rem 1.5rem', background: '#09090b' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Heading */}
        <div style={{ marginBottom: '3rem' }}>
          <p className="eyebrow" style={{ marginBottom: '0.625rem' }}>Contact</p>
          <h2
            style={{
              margin: '0 0 0.75rem',
              fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
              fontWeight: 600,
              color: '#fafafa',
              letterSpacing: '-0.022em',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Get in <span className="gradient-text">touch</span>
          </h2>
          <p style={{ margin: 0, fontSize: '0.9375rem', color: '#71717a', maxWidth: '38rem', lineHeight: 1.7 }}>
            Feel free to reach out for opportunities, collaborations, or just to say hello.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            alignItems: 'start',
          }}
        >
          {/* Contact info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 600, color: '#fafafa', letterSpacing: '-0.01em' }}>
                Let's connect
              </h3>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#71717a', lineHeight: 1.7 }}>
                I'm always open to new projects and interesting conversations.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <ContactInfoItem icon="fas fa-envelope" label="Email" value={contactData.email} />
              <ContactInfoItem icon="fas fa-phone" label="Phone" value={contactData.phone} />
              <ContactInfoItem icon="fas fa-location-dot" label="Location" value={contactData.location} />
            </div>

            {/* Social row */}
            <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #27272a' }}>
              {[
                { icon: 'fab fa-github', href: 'https://github.com/Shivukumar-M', label: 'GitHub' },
                { icon: 'fab fa-linkedin', href: 'https://www.linkedin.com/in/shivu-kumar-a-m', label: 'LinkedIn' },
              ].map(({ icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  style={{
                    width: 36,
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8,
                    background: '#18181b',
                    border: '1px solid #27272a',
                    color: '#71717a',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    transition: 'color 0.15s ease, border-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#00ff88'; e.currentTarget.style.borderColor = 'rgba(0,255,136,0.4)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#71717a'; e.currentTarget.style.borderColor = '#27272a'; }}
                >
                  <i className={icon} />
                </a>
              ))}
            </div>
          </div>

          {/* Contact form */}
          <div
            style={{
              background: '#18181b',
              border: '1px solid #27272a',
              borderRadius: 14,
              padding: '1.5rem',
            }}
          >
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* Name + Email row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#d4d4d8' }}>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Shivu Kumar"
                    style={inputStyle}
                    onFocus={focusInput}
                    onBlur={blurInput}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#d4d4d8' }}>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                    style={inputStyle}
                    onFocus={focusInput}
                    onBlur={blurInput}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#d4d4d8' }}>Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="Project inquiry"
                  style={inputStyle}
                  onFocus={focusInput}
                  onBlur={blurInput}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#d4d4d8' }}>Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="Tell me about your project…"
                  style={{ ...inputStyle, height: 'auto', resize: 'vertical', padding: '0.625rem 0.75rem' }}
                  onFocus={focusInput}
                  onBlur={blurInput}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  width: '100%',
                  height: '2.375rem',
                  background: '#00ff88',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.75 : 1,
                  transition: 'opacity 0.15s ease',
                }}
              >
                {isSubmitting ? (
                  <>
                    <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    Sending…
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane" style={{ fontSize: '0.8rem' }} />
                    Send message
                  </>
                )}
              </button>

              {submitStatus && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.625rem',
                    padding: '0.75rem',
                    borderRadius: 8,
                    background: submitStatus.success ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                    border: `1px solid ${submitStatus.success ? 'rgba(0,255,136,0.25)' : 'rgba(239,68,68,0.25)'}`,
                  }}
                >
                  <i
                    className={`fas ${submitStatus.success ? 'fa-circle-check' : 'fa-circle-exclamation'}`}
                    style={{ color: submitStatus.success ? '#00ff88' : '#ef4444', fontSize: '0.8rem', marginTop: 2 }}
                  />
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: submitStatus.success ? '#6ee7b7' : '#fca5a5' }}>
                    {submitStatus.message}
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
