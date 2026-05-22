const express = require('express');
const router = express.Router();
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Skill = require('../models/Skill');
const Project = require('../models/Project');
const PortfolioDownload = require('../models/PortfolioDownload');

// Shared handler for both GET and POST
async function handleDownload(req, res) {
  try {
    // Fetch user data
    const user = await User.findById(req.user.id);
    const skills = await Skill.find({ userId: req.user.id });
    const projects = await Project.find({ userId: req.user.id });

    // Create a temporary directory for the user's portfolio
    const tempDir = path.join(__dirname, '../temp', `portfolio_${user._id}`);
    fs.mkdirSync(path.join(__dirname, '../temp'), { recursive: true });
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    fs.mkdirSync(tempDir, { recursive: true });

    // Generate portfolio files with user data
    await generatePortfolioFiles(tempDir, user, skills, projects);

    // Create zip file in temp
    const zipFileName = `portfolio_${user._id}_${Date.now()}.zip`;
    const zipPath = path.join(__dirname, '../temp', zipFileName);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', async () => {
      // Save a permanent copy for admin access
      const saveName = user.profile?.name?.replace(/\s+/g, '_') || 'portfolio';
      const downloadFileName = `${saveName}_portfolio.zip`;
      const savesDir = path.join(__dirname, '../uploads/downloads');
      fs.mkdirSync(savesDir, { recursive: true });
      const savedZipPath = path.join(savesDir, `${user._id}_${Date.now()}.zip`);
      fs.copyFileSync(zipPath, savedZipPath);

      // Record in DB (don't block response)
      PortfolioDownload.create({
        userId:    user._id,
        userName:  user.profile?.name || '',
        userEmail: user.email || '',
        zipPath:   savedZipPath,
        fileName:  downloadFileName,
        fileSize:  fs.statSync(savedZipPath).size,
      }).catch(err => console.error('PortfolioDownload save error:', err));

      // Send the zip file to user
      res.download(zipPath, downloadFileName, () => {
        setTimeout(() => {
          fs.rmSync(tempDir, { recursive: true, force: true });
          fs.rmSync(zipPath, { force: true });
        }, 5000);
      });
    });

    archive.on('error', (err) => { throw err; });
    archive.pipe(output);
    archive.directory(tempDir, false);
    archive.finalize();

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Failed to generate portfolio download' });
  }
}

// Support both GET (legacy) and POST (Dashboard)
router.get('/', auth, handleDownload);
router.post('/', auth, handleDownload);

// Generate portfolio files with user data
async function generatePortfolioFiles(dir, user, skills, projects) {
  // Create directory structure
  const dirs = ['frontend/src/components', 'frontend/src/store', 'backend/models', 'backend/routes', 'backend/controllers', 'backend/config', 'backend/middleware'];
  dirs.forEach(d => fs.mkdirSync(path.join(dir, d), { recursive: true }));

  // Generate package.json files
  await generatePackageJson(dir, user);
  
  // Generate backend files
  await generateBackendFiles(dir, user, skills, projects);
  
  // Generate frontend files
  await generateFrontendFiles(dir, user, skills, projects);
  
  // Generate README
  await generateReadme(dir, user);
}

// Generate package.json files
async function generatePackageJson(dir, user) {
  const backendPackage = {
    name: `${user.profile.name.replace(/\s+/g, '-').toLowerCase()}-portfolio-backend`,
    version: "1.0.0",
    description: `Backend for ${user.profile.name}'s portfolio`,
    main: "server.js",
    scripts: {
      start: "node server.js",
      dev: "nodemon server.js"
    },
    dependencies: {
      express: "^5.1.0",
      mongoose: "^8.19.2",
      dotenv: "^17.2.3",
      cors: "^2.8.5",
      bcryptjs: "^3.0.2",
      jsonwebtoken: "^9.0.2"
    },
    devDependencies: {
      nodemon: "^3.1.10"
    }
  };

  const frontendPackage = {
    name: `${user.profile.name.replace(/\s+/g, '-').toLowerCase()}-portfolio-frontend`,
    private: true,
    version: "0.0.0",
    type: "module",
    scripts: {
      dev: "vite",
      build: "vite build",
      preview: "vite preview"
    },
    dependencies: {
      react: "^18.2.0",
      "react-dom": "^18.2.0",
      "react-router-dom": "^6.20.1",
      axios: "^1.6.2"
    },
    devDependencies: {
      "@vitejs/plugin-react": "^4.2.1",
      vite: "^5.0.8"
    }
  };

  fs.writeFileSync(path.join(dir, 'backend/package.json'), JSON.stringify(backendPackage, null, 2));
  fs.writeFileSync(path.join(dir, 'frontend/package.json'), JSON.stringify(frontendPackage, null, 2));
}

// Generate backend files
async function generateBackendFiles(dir, user, skills, projects) {
  // server.js
  const serverContent = `
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

connectDB();

// Import routes
const profileRoutes = require('./routes/profile');
const skillsRoutes = require('./routes/skills');
const projectsRoutes = require('./routes/projects');
const contactRoutes = require('./routes/contact');

// Routes
app.use('/api/profile', profileRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/contact', contactRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('${user.profile.name} Portfolio API is running...');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`;

  fs.writeFileSync(path.join(dir, 'backend/server.js'), serverContent);

  // .env
  const envContent = `
MONGO_URI=your_mongodb_atlas_connection_string_here
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here
`;

  fs.writeFileSync(path.join(dir, 'backend/.env'), envContent);

  // Generate models, routes, and other backend files...
  await generateBackendModels(dir, user, skills, projects);
  await generateBackendRoutes(dir, user, skills, projects);
}

// Generate frontend files
async function generateFrontendFiles(dir, user, skills, projects) {
  // index.html
  const indexHtml = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${user.profile.name} | ${user.profile.title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body class="bg-gray-950 text-gray-100 overflow-x-hidden">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`;

  fs.writeFileSync(path.join(dir, 'frontend/index.html'), indexHtml);

  // vite.config.js
  const viteConfig = `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
`;

  fs.writeFileSync(path.join(dir, 'frontend/vite.config.js'), viteConfig);

  // Generate React components with user data
  await generateReactComponents(dir, user, skills, projects);
}

// Generate React components
async function generateReactComponents(dir, user, skills, projects) {
  // main.jsx
  const mainJsx = `
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
`;

  fs.writeFileSync(path.join(dir, 'frontend/src/main.jsx'), mainJsx);

  // App.jsx
  const appJsx = `
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Footer from './components/Footer';

function App() {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="loading mx-auto mb-4"></div>
          <p className="text-slate-400">Loading Portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="blob absolute top-20 right-20 w-96 h-96"></div>
        <div className="blob absolute bottom-20 left-20 w-80 h-80" style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)' }}></div>
      </div>
      
      <div className="relative z-10">
        <Header />
        <main>
          <Hero />
          <About />
          <Skills />
          <Projects />
          <Contact />
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default App;
`;

  fs.writeFileSync(path.join(dir, 'frontend/src/App.jsx'), appJsx);

  // index.css
  const indexCss = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', sans-serif; }
.gradient-text { background: linear-gradient(135deg, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 12px 28px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: #fff; border-radius: 12px; font-weight: 600; text-decoration: none; transition: opacity 0.2s; }
.btn-primary:hover { opacity: 0.85; }
.btn-secondary { display: inline-flex; align-items: center; gap: 8px; padding: 12px 28px; border: 2px solid #3b82f6; color: #3b82f6; border-radius: 12px; font-weight: 600; text-decoration: none; transition: all 0.2s; }
.btn-secondary:hover { background: #3b82f6; color: #fff; }
.card-hover { transition: transform 0.2s, box-shadow 0.2s; }
.card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(59,130,246,0.15); }
.glow { box-shadow: 0 0 40px rgba(59,130,246,0.3); }
.floating { animation: float 3s ease-in-out infinite; }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
.fade-in { animation: fadeIn 0.8s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.loading { width: 40px; height: 40px; border: 3px solid #334155; border-top-color: #3b82f6; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.blob { border-radius: 50%; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); opacity: 0.07; filter: blur(60px); }
`;
  fs.writeFileSync(path.join(dir, 'frontend/src/index.css'), indexCss);

  // Generate components with user data
  await generateHeaderComponent(dir, user);
  await generateHeroComponent(dir, user);
  await generateAboutComponent(dir, user);
  await generateSkillsComponent(dir, skills);
  await generateProjectsComponent(dir, projects);
  await generateContactComponent(dir, user);
  await generateFooterComponent(dir, user);
}

// Generate Header component
async function generateHeaderComponent(dir, user) {
  const content = `
import React, { useState } from 'react';

const Header = () => {
  const [open, setOpen] = useState(false);
  const links = ['Home', 'About', 'Skills', 'Projects', 'Contact'];
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <span className="gradient-text font-bold text-xl">${user.profile.name?.split(' ')[0] || 'Portfolio'}</span>
        <nav className="hidden md:flex gap-8">
          {links.map(l => (
            <a key={l} href={\`#\${l.toLowerCase()}\`}
              className="text-slate-400 hover:text-white text-sm font-medium transition-colors">{l}</a>
          ))}
        </nav>
        <button onClick={() => setOpen(!open)} className="md:hidden text-slate-400 hover:text-white">
          <i className={\`fas \${open ? 'fa-times' : 'fa-bars'}\`}></i>
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800 px-4 py-4 flex flex-col gap-4">
          {links.map(l => (
            <a key={l} href={\`#\${l.toLowerCase()}\`} onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-white text-sm font-medium">{l}</a>
          ))}
        </div>
      )}
    </header>
  );
};
export default Header;
`;
  fs.writeFileSync(path.join(dir, 'frontend/src/components/Header.jsx'), content);
}

// Generate About component
async function generateAboutComponent(dir, user) {
  const content = `
import React from 'react';

const About = () => (
  <section id="about" className="py-20 px-4 bg-slate-800/50">
    <div className="container mx-auto max-w-6xl">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">About <span className="gradient-text">Me</span></h2>
      </div>
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-slate-300 text-lg leading-relaxed mb-6">${user.profile.bio || 'Passionate developer building modern web applications.'}</p>
          <div className="grid grid-cols-2 gap-4">
            {[['Role', '${user.profile.title || 'Developer'}'],['Location', 'India'],['Status', 'Open to work'],['Experience', '2+ years']].map(([k,v]) => (
              <div key={k} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">{k}</p>
                <p className="text-white font-medium text-sm">{v}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center">
          <div className="w-64 h-64 rounded-2xl overflow-hidden glow">
            <img src="${user.profile.photo || 'https://via.placeholder.com/256'}" alt="${user.profile.name}" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </div>
  </section>
);
export default About;
`;
  fs.writeFileSync(path.join(dir, 'frontend/src/components/About.jsx'), content);
}

// Generate Footer component
async function generateFooterComponent(dir, user) {
  const content = `
import React from 'react';

const Footer = () => (
  <footer className="bg-slate-900 border-t border-slate-800 py-8 px-4 text-center">
    <p className="text-slate-500 text-sm">
      © {new Date().getFullYear()} <span className="text-slate-300 font-medium">${user.profile.name}</span>. Built with React & Node.js.
    </p>
    <div className="flex justify-center gap-6 mt-4">
      {[['fab fa-github','${user.profile.social?.github || '#'}'],['fab fa-linkedin','${user.profile.social?.linkedin || '#'}']].map(([icon, href]) => (
        <a key={icon} href={href} target="_blank" rel="noopener noreferrer"
          className="text-slate-500 hover:text-white transition-colors">
          <i className={icon}></i>
        </a>
      ))}
    </div>
  </footer>
);
export default Footer;
`;
  fs.writeFileSync(path.join(dir, 'frontend/src/components/Footer.jsx'), content);
}

// Generate Hero component with user data
async function generateHeroComponent(dir, user) {
  const heroContent = `
import React, { useState, useEffect } from 'react';

const Hero = () => {
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  const roles = ${JSON.stringify(user.profile.title ? [user.profile.title] : ['Full Stack Developer', 'MERN Specialist', 'Problem Solver', 'Tech Enthusiast'])};

  useEffect(() => {
    const handleType = () => {
      const i = loopNum % roles.length;
      const fullText = roles[i];

      setText(isDeleting 
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

  return (
    <section id="home" className="min-h-screen flex items-center pt-20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="fade-in">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Hi, I'm <span className="gradient-text">${user.profile.name}</span>
            </h1>
            <h2 className="text-2xl md:text-3xl font-medium mb-6 text-slate-300">
              I'm a <span className="text-blue-400">{text}</span>
              <span className="animate-pulse">|</span>
            </h2>
            <p className="text-lg text-slate-400 mb-8 max-w-lg">
              ${user.profile.bio}
            </p>
            
            <div className="flex flex-wrap gap-4 mb-8">
              <a
                href="#projects"
                className="btn-primary"
              >
                View My Work
              </a>
              <a
                href="#contact"
                className="btn-secondary"
              >
                Contact Me
              </a>
            </div>

            <div className="flex space-x-4">
              <a
                href="${user.profile.social.github}"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-300"
                aria-label="GitHub"
              >
                <i className="fab fa-github"></i>
              </a>
              <a
                href="${user.profile.social.linkedin}"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-300"
                aria-label="LinkedIn"
              >
                <i className="fab fa-linkedin"></i>
              </a>
              <a
                href="${user.profile.social.twitter}"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-300"
                aria-label="Twitter"
              >
                <i className="fab fa-twitter"></i>
              </a>
            </div>
          </div>
          
          <div className="flex justify-center">
            <div className="relative floating">
              <div className="w-80 h-80 rounded-2xl overflow-hidden glow">
                <img
                  src="${user.profile.photo}"
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
`;

  fs.writeFileSync(path.join(dir, 'frontend/src/components/Hero.jsx'), heroContent);
}

// Generate Skills component with user data
async function generateSkillsComponent(dir, skills) {
  const skillsContent = `
import React, { useState } from 'react';

const Skills = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  
  const categories = ['all', 'frontend', 'backend', 'tools'];
  
  const skillsData = ${JSON.stringify(skills)};

  const displayedSkills = activeCategory === 'all' 
    ? skillsData 
    : skillsData.filter(skill => skill.category === activeCategory);

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
        
        <div className="flex justify-center mb-12">
          <div className="bg-slate-800 rounded-lg p-1 flex border border-slate-700">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={\`px-4 py-2 rounded-md capitalize transition-all duration-300 \${
                  activeCategory === category
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }\`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedSkills.map((skill, index) => (
            <div
              key={index}
              className="bg-slate-800 rounded-lg p-6 text-center card-hover border border-slate-700"
            >
              <div className={\`w-16 h-16 \${skill.color} rounded-full flex items-center justify-center mx-auto mb-4\`}>
                <i className={\`\${skill.icon} text-white text-2xl\`}></i>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">{skill.name}</h3>
              <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
                <div
                  className="h-2 rounded-full bg-blue-500"
                  style={{ width: \`\${skill.level}%\` }}
                ></div>
              </div>
              <span className="text-sm text-slate-400">{skill.level}%</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
`;

  fs.writeFileSync(path.join(dir, 'frontend/src/components/Skills.jsx'), skillsContent);
}

// Generate Projects component with user data
async function generateProjectsComponent(dir, projects) {
  const projectsContent = `
import React, { useState } from 'react';

const Projects = () => {
  const [filter, setFilter] = useState('all');
  
  const projectsData = ${JSON.stringify(projects)};

  const filteredProjects = filter === 'all' 
    ? projectsData 
    : projectsData.filter(project => project.technologies.includes(filter));

  const techFilters = ['all', 'React', 'Node.js', 'MongoDB', 'JavaScript'];

  return (
    <section id="projects" className="py-20 px-4 bg-slate-800/50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            My <span className="gradient-text">Projects</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Explore my recent work and personal projects
          </p>
        </div>
        
        <div className="flex justify-center mb-12">
          <div className="bg-slate-800 rounded-lg p-1 flex border border-slate-700">
            {techFilters.map((tech) => (
              <button
                key={tech}
                onClick={() => setFilter(tech)}
                className={\`px-4 py-2 rounded-md capitalize transition-all duration-300 \${
                  filter === tech
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }\`}
              >
                {tech}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <div
              key={project._id}
              className="bg-slate-800 rounded-lg overflow-hidden card-hover border border-slate-700"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-white">{project.title}</h3>
                <p className="text-slate-400 mb-4">{project.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.slice(0, 3).map((tech, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 3 && (
                    <span className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">
                      +{project.technologies.length - 3} more
                    </span>
                  )}
                </div>
                
                <div className="flex justify-between">
                  <a
                    href={project.githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-400 hover:text-blue-300 transition-colors duration-300"
                  >
                    <i className="fab fa-github mr-2"></i>
                    Code
                  </a>
                  <a
                    href={project.liveDemo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-400 hover:text-blue-300 transition-colors duration-300"
                  >
                    <i className="fas fa-external-link-alt mr-2"></i>
                    Live Demo
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
`;

  fs.writeFileSync(path.join(dir, 'frontend/src/components/Projects.jsx'), projectsContent);
}

// Generate Contact component
async function generateContactComponent(dir, user) {
  const contactContent = `
import React, { useState } from 'react';
import axios from 'axios';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await axios.post('/api/contact', formData);
      setStatus('sent');
      setFormData({ name: '', email: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="py-20 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Get In <span className="gradient-text">Touch</span>
          </h2>
          <p className="text-slate-400">
            Reach out at <a href="mailto:${user.profile.contact?.email || user.email}" className="text-blue-400">${user.profile.contact?.email || user.email}</a>
          </p>
        </div>
        <form onSubmit={handleSubmit} className="bg-slate-800 rounded-xl p-8 border border-slate-700 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
            <input type="text" required value={formData.name}
              onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <input type="email" required value={formData.email}
              onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Message</label>
            <textarea required rows={5} value={formData.message}
              onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none" />
          </div>
          <button type="submit" disabled={status === 'sending'}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-300 disabled:opacity-50">
            {status === 'sending' ? 'Sending…' : status === 'sent' ? 'Message Sent!' : 'Send Message'}
          </button>
          {status === 'error' && <p className="text-red-400 text-sm text-center">Failed to send. Please try again.</p>}
        </form>
      </div>
    </section>
  );
};

export default Contact;
`;
  fs.writeFileSync(path.join(dir, 'frontend/src/components/Contact.jsx'), contactContent);
}

// Generate backend models
async function generateBackendModels(dir, user, skills, projects) {
  const userModel = `
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, unique: true },
  profile: {
    name:    String,
    title:   String,
    bio:     String,
    photo:   String,
    contact: { email: String, phone: String, linkedin: String },
    social:  { github: String, linkedin: String, twitter: String },
  },
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', UserSchema);
`;

  const skillModel = `
const mongoose = require('mongoose');
const SkillSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:     { type: String, required: true },
  level:    { type: Number, default: 80 },
  category: { type: String, default: 'other' },
  icon:     String,
  color:    String,
}, { timestamps: true });
module.exports = mongoose.model('Skill', SkillSchema);
`;

  const projectModel = `
const mongoose = require('mongoose');
const ProjectSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:        { type: String, required: true },
  description:  String,
  technologies: [String],
  githubLink:   String,
  liveDemo:     String,
  image:        String,
}, { timestamps: true });
module.exports = mongoose.model('Project', ProjectSchema);
`;

  const contactModel = `
const mongoose = require('mongoose');
const ContactSchema = new mongoose.Schema({
  name:    { type: String, required: true },
  email:   { type: String, required: true },
  message: { type: String, required: true },
  read:    { type: Boolean, default: false },
}, { timestamps: true });
module.exports = mongoose.model('Contact', ContactSchema);
`;

  fs.writeFileSync(path.join(dir, 'backend/models/User.js'), userModel);
  fs.writeFileSync(path.join(dir, 'backend/models/Skill.js'), skillModel);
  fs.writeFileSync(path.join(dir, 'backend/models/Project.js'), projectModel);
  fs.writeFileSync(path.join(dir, 'backend/models/Contact.js'), contactModel);
}

// Generate backend routes
async function generateBackendRoutes(dir, user, skills, projects) {
  const profileRoute = `
const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/', async (req, res) => {
  try {
    const user = await User.findOne().select('-password');
    res.json(user?.profile || {});
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
`;

  const skillsRoute = `
const express = require('express');
const router = express.Router();
const Skill = require('../models/Skill');

router.get('/', async (req, res) => {
  try {
    const skills = await Skill.find({});
    res.json(skills);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
`;

  const projectsRoute = `
const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

router.get('/', async (req, res) => {
  try {
    const projects = await Project.find({});
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
`;

  const contactRoute = `
const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ message: 'All fields required' });
    const entry = await Contact.create({ name, email, message });
    res.status(201).json({ message: 'Message sent', id: entry._id });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
`;

  fs.writeFileSync(path.join(dir, 'backend/routes/profile.js'), profileRoute);
  fs.writeFileSync(path.join(dir, 'backend/routes/skills.js'), skillsRoute);
  fs.writeFileSync(path.join(dir, 'backend/routes/projects.js'), projectsRoute);
  fs.writeFileSync(path.join(dir, 'backend/routes/contact.js'), contactRoute);
}

// Generate README
async function generateReadme(dir, user) {
  const readmeContent = `# ${user.profile.name}'s Portfolio

A modern, responsive portfolio website built with the MERN stack.

## Features

- Personal profile with ${user.profile.title}
- Skills showcase with proficiency levels
- Projects portfolio with live demos
- Contact form
- Responsive design
- Modern UI with Tailwind CSS

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT

## Installation

### Backend Setup

1. Navigate to the backend directory:
   \`\`\`bash
   cd backend
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Create a \`.env\` file:
   \`\`\`
   MONGO_URI=your_mongodb_atlas_connection_string
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret
   \`\`\`

4. Start the backend server:
   \`\`\`bash
   npm run dev
   \`\`\`

### Frontend Setup

1. Navigate to the frontend directory:
   \`\`\`bash
   cd frontend
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Start the frontend development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Usage

1. Open your browser and navigate to \`http://localhost:5173\`
2. View the portfolio with ${user.profile.name}'s information
3. Explore skills, projects, and contact information

## Customization

To customize this portfolio for your own use:

1. Update the profile information in the components
2. Add your own projects to the projects data
3. Modify the skills to match your expertise
4. Update contact information

## License

This project is licensed under the MIT License.

---

Generated for ${user.profile.name} on ${new Date().toLocaleDateString()}
`;

  fs.writeFileSync(path.join(dir, 'README.md'), readmeContent);
}

module.exports = router;