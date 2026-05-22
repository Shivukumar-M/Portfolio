import { useState } from 'react';
import jsPDF from 'jspdf';

export default function ResumePDF({ profileData, skillsData, projectsData, experienceData, certifications }) {
  const [generating, setGenerating] = useState(false);

  const generate = async () => {
    setGenerating(true);
    try {
      const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      const W = 210, M = 20;
      let y = 20;

      const profile = profileData?.profile || {};
      const name = profile.name || 'Your Name';
      const title = profile.title || 'Developer';
      const bio = profile.bio || '';
      const contact = profileData?.contact || {};

      // Header
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, W, 45, 'F');
      doc.setTextColor(248, 250, 252);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text(name, M, 18);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(148, 163, 184);
      doc.text(title, M, 27);

      // Contact line
      const contactLine = [contact.email, contact.phone, contact.location].filter(Boolean).join('  |  ');
      doc.setFontSize(9);
      doc.text(contactLine, M, 36);

      y = 55;
      doc.setTextColor(15, 23, 42);

      const sectionHeader = (label) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(59, 130, 246);
        doc.text(label.toUpperCase(), M, y);
        doc.setDrawColor(59, 130, 246);
        doc.line(M, y + 2, W - M, y + 2);
        y += 10;
        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
      };

      const checkPage = () => {
        if (y > 270) { doc.addPage(); y = 20; }
      };

      // Summary
      if (bio) {
        sectionHeader('Summary');
        const lines = doc.splitTextToSize(bio, W - 2 * M);
        doc.text(lines, M, y);
        y += lines.length * 5 + 6;
        checkPage();
      }

      // Experience
      const work = (experienceData || []).filter(e => e.type === 'work');
      if (work.length > 0) {
        sectionHeader('Experience');
        work.forEach(e => {
          checkPage();
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.text(e.title, M, y);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(100, 116, 139);
          const period = `${e.startDate} — ${e.current ? 'Present' : e.endDate}`;
          doc.text(`${e.organization}  ·  ${period}`, M, y + 5);
          doc.setTextColor(15, 23, 42);
          y += 10;
          if (e.description) {
            const lines = doc.splitTextToSize(e.description, W - 2 * M);
            doc.text(lines, M, y);
            y += lines.length * 4 + 4;
          }
          y += 2;
          checkPage();
        });
      }

      // Education
      const edu = (experienceData || []).filter(e => e.type === 'education');
      if (edu.length > 0) {
        sectionHeader('Education');
        edu.forEach(e => {
          checkPage();
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.text(e.title, M, y);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(100, 116, 139);
          doc.text(`${e.organization}  ·  ${e.startDate} — ${e.current ? 'Present' : e.endDate}`, M, y + 5);
          doc.setTextColor(15, 23, 42);
          y += 12;
        });
      }

      // Skills
      if (skillsData?.length > 0) {
        sectionHeader('Skills');
        const skillNames = skillsData.map(s => s.name || s).filter(Boolean).join('  ·  ');
        const lines = doc.splitTextToSize(skillNames, W - 2 * M);
        doc.text(lines, M, y);
        y += lines.length * 5 + 6;
        checkPage();
      }

      // Projects
      if (projectsData?.length > 0) {
        sectionHeader('Projects');
        projectsData.slice(0, 4).forEach(p => {
          checkPage();
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.text(p.title, M, y);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          const desc = doc.splitTextToSize(p.description || '', W - 2 * M);
          doc.setTextColor(71, 85, 105);
          doc.text(desc, M, y + 5);
          doc.setTextColor(15, 23, 42);
          y += desc.length * 4 + 10;
        });
      }

      // Certifications
      if (certifications?.length > 0) {
        sectionHeader('Certifications');
        certifications.forEach(c => {
          checkPage();
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.text(c.title, M, y);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(100, 116, 139);
          doc.text(`${c.issuer}  ·  ${c.issueDate}`, M, y + 5);
          doc.setTextColor(15, 23, 42);
          y += 12;
        });
      }

      doc.save(`${name.replace(/\s+/g, '_')}_Resume.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
    }
    setGenerating(false);
  };

  return (
    <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-6 text-center">
      <i className="fas fa-file-pdf text-purple-400 text-3xl mb-3 block"></i>
      <h3 className="text-white font-semibold mb-2">Resume PDF Export</h3>
      <p className="text-slate-400 text-sm mb-4">
        Auto-generates a professional resume from your profile, experience, skills, projects and certifications.
      </p>
      <button
        onClick={generate}
        disabled={generating}
        className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 font-medium text-sm flex items-center gap-2 mx-auto"
      >
        {generating ? <><i className="fas fa-spinner fa-spin"></i> Generating…</> : <><i className="fas fa-download"></i> Download Resume PDF</>}
      </button>
    </div>
  );
}
