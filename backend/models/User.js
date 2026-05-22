const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
  },
  animationTheme: {
    type: String,
    enum: ['cosmic', 'neon', 'ocean', 'matrix', 'minimal'],
    default: 'cosmic',
  },
  seoConfig: {
    title:       { type: String, default: '' },
    description: { type: String, default: '' },
  },
  sectionOrder: {
    type: [String],
    default: ['about', 'skills', 'projects', 'experience', 'certifications', 'testimonials', 'blog', 'contact'],
  },
  templateConfig: {
    templateId:     { type: String, enum: ['cosmic','terminal','glass','magazine','retro'], default: 'cosmic' },
    colors: {
      primary:      { type: String, default: '' },
      accent:       { type: String, default: '' },
      bg:           { type: String, default: '' },
    },
    font:           { type: String, default: 'Inter' },
    animationSpeed: { type: String, enum: ['none','slow','normal','fast'], default: 'normal' },
    customCSS:      { type: String, default: '' },
    customJS:       { type: String, default: '' },
    sections: {
      about:        { type: Boolean, default: true },
      skills:       { type: Boolean, default: true },
      projects:     { type: Boolean, default: true },
      contact:      { type: Boolean, default: true },
    },
  },
  profile: {
    name: {
      type: String,
      default: 'Your Name',
    },
    photo: {
      type: String,
      default: 'https://via.placeholder.com/400x400/1e293b/3b82f6?text=Your+Photo',
    },
    title: {
      type: String,
      default: 'Full Stack Developer',
    },
    bio: {
      type: String,
      default: 'Passionate about creating elegant solutions to complex problems. Specializing in modern web technologies with a focus on user experience and clean code.',
    },
    social: {
      github: {
        type: String,
        default: 'https://github.com/Shivukumar-M',
      },
      linkedin: {
        type: String,
        default: '#',
      },
      twitter: {
        type: String,
        default: '#',
      },
      leetcode: {
        type: String,
        default: '',
      },
    },
  },
  contact: {
    email: {
      type: String,
      default: 'your.email@example.com',
    },
    phone: {
      type: String,
      default: '+1 (123) 456-7890',
    },
    location: {
      type: String,
      default: 'Your City, Country',
    },
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isSuperAdmin: {
    type: Boolean,
    default: false,
  },
  loginCount: {
    type: Number,
    default: 0,
  },
  lastLogin: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', UserSchema);