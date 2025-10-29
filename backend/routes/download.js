const express = require('express');
const router = express.Router();
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Skill = require('../models/Skill');
const Project = require('../models/Project');

// Generate and download portfolio code
router.get('/', auth, async (req, res) => {
  try {
    // Fetch user data
    const user = await User.findById(req.user.id);
    const skills = await Skill.find({ userId: req.user.id });
    const projects = await Project.find({ userId: req.user.id });

    // Create a temporary directory for the user's portfolio
    const tempDir = path.join(__dirname, '../temp', `portfolio_${user._id}`);
    if (!fs.existsSync(path.join(__dirname, '../temp'))) {
      fs.mkdirSync(path.join(__dirname, '../temp'));
    }
    if (fs.existsSync(tempDir)) {
      // Clean up existing directory
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    fs.mkdirSync(tempDir, { recursive: true });

    // Generate portfolio files with user data
    await generatePortfolioFiles(tempDir, user, skills, projects);

    // Create zip file
    const zipPath = path.join(__dirname, '../temp', `portfolio_${user._id}.zip`);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      // Send the zip file
      res.download(zipPath, `portfolio_${user.profile.name.replace(/\s+/g, '_')}.zip`, (err) => {
        // Clean up after download
        setTimeout(() => {
          fs.rmSync(tempDir, { recursive: true, force: true });
          fs.rmSync(zipPath, { force: true });
        }, 5000);
      });
    });

    archive.on('error', (err) => {
      throw err;
    });

    archive.pipe(output);
    archive.directory(tempDir, false);
    archive.finalize();

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Failed to generate portfolio download' });
  }
});

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

  // Generate components with user data
  await generateHeroComponent(dir, user);
  await generateSkillsComponent(dir, skills);
  await generateProjectsComponent(dir, projects);
  await generateContactComponent(dir, user);
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