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

// Auto-create or promote the admin user from ADMIN_EMAIL / ADMIN_PASSWORD in .env
const ensureAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) return;

  try {
    const User = require('./models/User');
    let admin = await User.findOne({ $or: [{ email: adminEmail }, { username: 'superadmin' }] });

    if (!admin) {
      admin = await User.create({
        email: adminEmail,
        password: adminPassword,
        username: 'superadmin',
        isAdmin: true,
        isSuperAdmin: true,
        profile: { name: 'Super Admin' },
      });
      console.log(`✅ Super Admin account created: ${adminEmail}`);
    } else {
      const bcrypt = require('bcryptjs');
      let changed = false;

      // Always sync email to whatever is in .env
      if (admin.email !== adminEmail) { admin.email = adminEmail; changed = true; }

      // Re-hash and update password so .env is always the source of truth
      const passwordMatch = await bcrypt.compare(adminPassword, admin.password);
      if (!passwordMatch) {
        admin.password = adminPassword; // pre-save hook will hash it
        changed = true;
      }

      if (!admin.isAdmin)      { admin.isAdmin = true;      changed = true; }
      if (!admin.isSuperAdmin) { admin.isSuperAdmin = true; changed = true; }

      if (changed) { await admin.save(); console.log(`✅ Super Admin synced: ${adminEmail}`); }
      else         { console.log(`✅ Super Admin account ready: ${adminEmail}`); }
    }
  } catch (err) {
    console.error('⚠️  ensureAdmin error:', err.message);
  }
};

connectDB().then(ensureAdmin);

// Import routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const skillsRoutes = require('./routes/skills');
const projectsRoutes = require('./routes/projects');
const contactRoutes = require('./routes/contact');
const messagesRoutes = require('./routes/messages');
const aboutRoutes = require('./routes/about');
const publicPortfolioRoutes = require('./routes/publicPortfolio');
const experienceRoutes = require('./routes/experience');
const certificationsRoutes = require('./routes/certifications');
const testimonialsRoutes = require('./routes/testimonials');
const blogRoutes = require('./routes/blog');
const analyticsRoutes = require('./routes/analytics');
const aiRoutes = require('./routes/ai');
const adminRoutes = require('./routes/admin');
const downloadRoutes   = require('./routes/download');
const lighthouseRoutes = require('./routes/lighthouse');
const leadsRoutes      = require('./routes/leads');
const templateRoutes   = require('./routes/templates');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/u', publicPortfolioRoutes);
app.use('/api/experience', experienceRoutes);
app.use('/api/certifications', certificationsRoutes);
app.use('/api/testimonials', testimonialsRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/portfolio/download', downloadRoutes);
app.use('/api/lighthouse',         lighthouseRoutes);
app.use('/api/leads',              leadsRoutes);
app.use('/api/templates',          templateRoutes);

// Serve uploaded template zips (admin-only via routes, this just enables static fallback)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


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
