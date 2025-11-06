const express = require('express');
const About = require('../models/About');
const auth = require('../middleware/auth');

const router = express.Router();

// Get about data (public route)
router.get('/public', async (req, res) => {
  try {
    return res.json({
      success: true,
      data: {
        story: {
          intro: "Hello! I'm Shivukumar M, a passionate full-stack developer with a love for creating elegant solutions to complex problems. My journey in web development began during my college years, and I've been honing my skills ever since.",
          skills: "I specialize in the MERN stack (MongoDB, Express, React, Node.js) and have experience working with various other technologies. I'm always eager to learn new things and take on challenging projects that push me to grow as a developer.",
          hobbies: "When I'm not coding, you can find me exploring new technologies, contributing to open-source projects, or enjoying a good cup of coffee while reading tech blogs."
        },
        experiences: [
          {
            title: 'Full Stack Developer',
            company: 'Tech Company',
            period: '2022 - Present',
            description: 'Developing and maintaining web applications using React, Node.js, and MongoDB.',
            current: true,
            order: 0
          },
          {
            title: 'Frontend Developer',
            company: 'Digital Agency',
            period: '2020 - 2022',
            description: 'Creating responsive and interactive user interfaces with modern JavaScript frameworks.',
            current: false,
            order: 1
          },
          {
            title: 'Junior Developer',
            company: 'Startup Inc.',
            period: '2019 - 2020',
            description: 'Assisted in the development of various web projects and gained experience in full-stack development.',
            current: false,
            order: 2
          }
        ],
        education: [
          {
            degree: 'Bachelor of Computer Science',
            school: 'University Name',
            period: '2015 - 2019',
            description: 'Graduated with honors, specializing in software engineering and web development.',
            order: 0
          }
        ],
        isDefault: true
      }
    });
  } catch (error) {
    console.error('Error fetching about data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch about data'
    });
  }
});

// Get user's about data (protected route)
router.get('/', auth, async (req, res) => {
  try {
    let aboutData = await About.findOne({ userId: req.user.id });

    if (!aboutData) {
      // Create initial about data for user
      aboutData = new About({
        userId: req.user.id,
        story: {
          intro: "Hello! I'm a passionate full-stack developer with a love for creating elegant solutions to complex problems.",
          skills: "I specialize in modern web technologies and enjoy building scalable applications.",
          hobbies: "When I'm not coding, I love learning new technologies and contributing to the developer community."
        },
        experiences: [],
        education: []
      });
      await aboutData.save();
    }

    res.json({
      success: true,
      data: aboutData
    });
  } catch (error) {
    console.error('Error fetching user about data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch about data'
    });
  }
});

// Update about data (protected route)
router.put('/', auth, async (req, res) => {
  try {
    const { story, experiences, education } = req.body;

    const aboutData = await About.findOneAndUpdate(
      { userId: req.user.id },
      {
        $set: {
          story,
          experiences,
          education
        }
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      data: aboutData,
      message: 'About data updated successfully'
    });
  } catch (error) {
    console.error('Error updating about data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update about data'
    });
  }
});

module.exports = router;