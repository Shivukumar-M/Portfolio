import React from 'react';

const About = () => {
  const experiences = [
    {
      title: 'Full Stack Developer',
      company: 'Tech Company',
      period: '2022 - Present',
      description: 'Developing and maintaining web applications using React, Node.js, and MongoDB.'
    },
    {
      title: 'Frontend Developer',
      company: 'Digital Agency',
      period: '2020 - 2022',
      description: 'Creating responsive and interactive user interfaces with modern JavaScript frameworks.'
    },
    {
      title: 'Junior Developer',
      company: 'Startup Inc.',
      period: '2019 - 2020',
      description: 'Assisted in the development of various web projects and gained experience in full-stack development.'
    }
  ];

  const education = [
    {
      degree: 'Bachelor of Computer Science',
      school: 'University Name',
      period: '2015 - 2019',
      description: 'Graduated with honors, specializing in software engineering and web development.'
    }
  ];

  return (
    <section id="about" className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            About <span className="gradient-text">Me</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Get to know more about my background, experience, and education
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-semibold mb-6 text-white">My Story</h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Hello! I'm Shivukumar M, a passionate full-stack developer with a love for creating 
              elegant solutions to complex problems. My journey in web development began during my 
              college years, and I've been honing my skills ever since.
            </p>
            <p className="text-gray-300 mb-6 leading-relaxed">
              I specialize in the MERN stack (MongoDB, Express, React, Node.js) and have experience 
              working with various other technologies. I'm always eager to learn new things and take on 
              challenging projects that push me to grow as a developer.
            </p>
            <p className="text-gray-300 leading-relaxed">
              When I'm not coding, you can find me exploring new technologies, contributing to open-source 
              projects, or enjoying a good cup of coffee while reading tech blogs.
            </p>
          </div>
          
          <div>
            <h3 className="text-2xl font-semibold mb-6 text-white">Experience</h3>
            <div className="space-y-6">
              {experiences.map((exp, index) => (
                <div key={index} className="bg-gray-900 rounded-lg p-6 card-hover">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-xl font-medium text-white">{exp.title}</h4>
                    <span className="text-sm text-indigo-400">{exp.period}</span>
                  </div>
                  <h5 className="text-gray-400 mb-2">{exp.company}</h5>
                  <p className="text-gray-300">{exp.description}</p>
                </div>
              ))}
            </div>
            
            <h3 className="text-2xl font-semibold mb-6 mt-10 text-white">Education</h3>
            <div className="space-y-6">
              {education.map((edu, index) => (
                <div key={index} className="bg-gray-900 rounded-lg p-6 card-hover">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-xl font-medium text-white">{edu.degree}</h4>
                    <span className="text-sm text-indigo-400">{edu.period}</span>
                  </div>
                  <h5 className="text-gray-400 mb-2">{edu.school}</h5>
                  <p className="text-gray-300">{edu.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;