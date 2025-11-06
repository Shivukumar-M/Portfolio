// import aboutRoutes from './routes/about.js';

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static images folder
app.use('/images', express.static(path.join(__dirname, 'images')));

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};
connectDB();

// Import routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const skillsRoutes = require('./routes/skills');
const projectsRoutes = require('./routes/projects');
const contactRoutes = require('./routes/contact');
const messagesRoutes = require('./routes/messages');
const aboutRoutes = require('./routes/about');


// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/about', aboutRoutes);


// ==========================
// 🧩 PUBLIC FALLBACK ROUTES
// ==========================

// Public profile
app.get('/api/profile/public', (req, res) => {
  res.json({
    profile: {
      name: 'Shivukumar',
      title: 'Full Stack Developer',
      bio: 'Passionate about creating elegant solutions to complex problems. Specializing in modern web technologies with a focus on user experience and clean code.',
      photo: '/images/github.jpg',
      social: {
        github: 'https://github.com/Shivukumar-M',
        linkedin: 'https://www.linkedin.com/in/shivu-kumar-a-m',
        twitter: '#',
      },
    },
  });
});

// Public skills (✅ FIXED)
app.get('/api/skills/public', (req, res) => {
  try {
    return res.json({
      skills: [
        'JavaScript',
        'React.js',
        'Node.js',
        'Express.js',
        'MongoDB',
        'TailwindCSS',
      ],
    });
  } catch (err) {
    console.error('Error in /api/skills/public:', err);
    return res.status(500).json({ error: 'Failed to load skills' });
  }
});

// Public projects (✅ FIXED — returns array)
app.get('/api/projects/public', (req, res) => {
  try {
    return res.json([
      {
        title: 'Shadow Surf',
        description: 'A secure proxy-based web browsing app built with Java.',
        github: 'https://github.com/Shivukumar-M/shadow-surf',
        liveDemo: '#',
        image: '/images/github.jpg',
      },
      {
        title: 'DreamCars',
        description: 'Car rental management web app built with PHP backend.',
        github: 'https://github.com/Shivukumar-M/DreamCars',
        liveDemo: '#',
        image: '/images/github.jpg',
      },
    ]);
  } catch (err) {
    console.error('Error in /api/projects/public:', err);
    return res.status(500).json({ error: 'Failed to load projects' });
  }
});

// Public contact
app.get('/api/contact/public', (req, res) => {
  res.json({
    contact: {
      email: 'sditprincipal@gmail.com',
      linkedin: 'https://www.linkedin.com/in/shivu-kumar-a-m',
      phone: '+91 8242254104',
    },
  });
});

// Default route
app.get('/', (req, res) => {
  res.send('✅ Portfolio API is running...');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
