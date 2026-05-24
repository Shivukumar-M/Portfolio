import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/AuthContext.jsx';
import { ThemeProvider } from './store/ThemeContext.jsx';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import About from './components/About.jsx';
import Skills from './components/Skills.jsx';
import Projects from './components/Projects.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';
import Login from './components/Login.jsx';
import Dashboard from './components/Dashboard.jsx';
import PublicPortfolio from './components/PublicPortfolio.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import ProjectDetail from './components/ProjectDetail.jsx';

// ─── Spinner used by route guards while auth loads ────────────────────────────
const AuthLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-night-sky">
    <div className="text-center">
      <div className="loading mx-auto mb-4"></div>
      <p className="text-slate-400 text-sm">Checking authentication…</p>
    </div>
  </div>
);

// ─── Requires login. Redirects to /login if not authenticated ─────────────────
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <AuthLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

// ─── Requires login AND isAdmin. Non-admins go to /dashboard ─────────────────
const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) return <AuthLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user?.isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

// ─── Already logged-in users are redirected away from /login ─────────────────
const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) return <AuthLoader />;
  if (isAuthenticated) return <Navigate to={user?.isAdmin ? '/admin' : '/dashboard'} replace />;
  return children;
};

function App() {
  const [loading, setLoading] = useState(true);
  const cursorRef = useRef(null);
  const followerRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const cursor = cursorRef.current;
    const follower = followerRef.current;
    if (!cursor || !follower) return;
    const move = (e) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
      follower.style.left = `${e.clientX}px`;
      follower.style.top = `${e.clientY}px`;
    };
    const enter = () => { cursor.style.transform = 'translate(-50%,-50%) scale(1.6)'; };
    const leave = () => { cursor.style.transform = 'translate(-50%,-50%) scale(1)'; };
    document.addEventListener('mousemove', move);
    document.querySelectorAll('a, button').forEach((el) => {
      el.addEventListener('mouseenter', enter);
      el.addEventListener('mouseleave', leave);
    });
    return () => {
      document.removeEventListener('mousemove', move);
    };
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-night-sky">
        <div className="text-center">
          <div className="loading mx-auto mb-4"></div>
          <p className="text-slate-400">Loading Portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          {/* Custom cursor */}
          <div ref={cursorRef} className="custom-cursor" />
          <div ref={followerRef} className="cursor-follower" />

          <div className="min-h-screen bg-night-sky relative">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
              <div className="blob absolute top-20 right-20 w-96 h-96" style={{ opacity: 0.04 }} />
              <div className="blob absolute bottom-20 left-20 w-80 h-80"
                style={{ background: 'radial-gradient(circle, rgba(74,43,17,0.3), transparent 70%)', filter: 'blur(80px)', opacity: 0.8 }} />
            </div>

            <div className="relative z-10">
              <Routes>
                {/* Guest-only: already logged in r  are bounced away */}
                <Route path="/login" element={
                  <GuestRoute><Login /></GuestRoute>
                } />

                {/* Any authenticated user */}
                <Route path="/dashboard" element={
                  <ProtectedRoute><Dashboard /></ProtectedRoute>
                } />

                {/* Admin only */}
                <Route path="/admin" element={
                  <AdminRoute><AdminDashboard /></AdminRoute>
                } />

                {/* Public */}
                <Route path="/u/:username" element={<PublicPortfolio />} />
                <Route path="/projects/:id" element={<ProjectDetail />} />
                <Route path="/" element={
                  <>
                    <Header />
                    <main>
                      <Hero />
                      <About />
                      <Skills />
                      <Projects />
                      <Contact />
                    </main>
                    <Footer />
                  </>
                } />
              </Routes>
            </div>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
