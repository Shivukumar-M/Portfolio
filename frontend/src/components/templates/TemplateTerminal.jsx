import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Reveal, CustomInjector, FontLoader, useMouseParallax, useScrollParallax, ParallaxEl } from './utils';

function AsciiBar({ level, width = 20 }) {
  const filled = Math.round((level / 100) * width);
  return (
    <span className="font-mono text-sm">
      [<span style={{ color: '#00ff41' }}>{'█'.repeat(filled)}</span><span style={{ opacity: 0.2 }}>{'░'.repeat(width - filled)}</span>] {level}%
    </span>
  );
}

function TermLine({ prompt = false, command = '', children, delay = 0 }) {
  const [visible, setVisible] = useState(delay === 0);
  useEffect(() => {
    if (delay === 0) return;
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  if (!visible) return null;
  return (
    <div className="mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      {prompt && <span style={{ color: '#00ff41' }}>~/portfolio $ </span>}
      {command && <span style={{ color: '#fff' }}>{command}</span>}
      {children}
    </div>
  );
}

export default function TemplateTerminal({ data, config }) {
  const colors   = config?.colors   || {};
  const primary  = colors.primary   || '#00ff41';
  const accent   = colors.accent    || '#00d4ff';
  const bgColor  = colors.bg        || '#0a0a0a';
  const speed    = config?.animationSpeed || 'normal';
  const sections = config?.sections || { about:true, skills:true, projects:true, contact:true };
  const font     = config?.font || 'JetBrains Mono';

  const [typed, setTyped] = useState('');
  const target = `Hello, I'm ${data.profile?.name || 'Developer'}`;
  const timerRef = useRef(null);
  const mouse       = useMouseParallax();
  const scrollCode  = useScrollParallax(0.15);
  const scrollTerm  = useScrollParallax(0.05);

  useEffect(() => {
    let i = 0;
    timerRef.current = setInterval(() => {
      setTyped(target.slice(0, ++i));
      if (i >= target.length) clearInterval(timerRef.current);
    }, 60);
    return () => clearInterval(timerRef.current);
  }, [target]);

  const p       = data.profile  || {};
  const skills  = data.skills   || [];
  const projs   = data.projects || [];
  const about   = data.about    || null;
  const contact = data.contact  || {};
  const username= data.username || '';

  const scanline = `repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.15) 2px,rgba(0,0,0,.15) 4px)`;

  return (
    <div style={{ background: bgColor, fontFamily: `'${font}', 'JetBrains Mono', monospace`, color: primary }} className="min-h-screen relative overflow-x-hidden">
      <FontLoader font={font} />
      <CustomInjector css={config?.customCSS} js={config?.customJS} />

      {/* Scanlines */}
      <div className="pointer-events-none fixed inset-0 z-10" style={{ backgroundImage: scanline, opacity: 0.3 }} />

      {/* Floating background code fragments */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none" aria-hidden>
        {[
          { top:'8%',  left:'5%',  text:'const dev = require("./you");',        spd: 0.12 },
          { top:'22%', right:'4%', text:'git commit -m "feat: parallax"',        spd: 0.08 },
          { top:'45%', left:'2%',  text:'npm run build --production',            spd: 0.18 },
          { top:'65%', right:'6%', text:'SELECT * FROM skills WHERE level > 80', spd: 0.10 },
          { top:'80%', left:'8%',  text:'docker compose up --detach',            spd: 0.14 },
          { top:'35%', right:'2%', text:'export default function App() { ... }', spd: 0.06 },
        ].map((f, i) => (
          <div key={i} style={{
            position:'absolute', top:f.top, left:f.left, right:f.right,
            transform:`translateY(${-scrollCode * f.spd}px)`,
            transition:'transform 0.1s linear',
            color:`${primary}14`, fontSize:'11px', fontFamily:"'JetBrains Mono',monospace",
            whiteSpace:'nowrap',
          }}>
            {f.text}
          </div>
        ))}
      </div>

      {/* Top bar */}
      <div className="sticky top-0 z-50 border-b px-4 py-2 flex items-center justify-between" style={{ background: bgColor, borderColor: `${primary}33` }}>
        <span style={{ color: primary }}>● ● ●</span>
        <span className="text-sm" style={{ color: accent }}>portfolio@{username} — bash</span>
        <nav className="hidden md:flex gap-6 text-xs" style={{ color: `${primary}88` }}>
          {['skills','projects','contact'].filter(s => sections[s]).map(s => (
            <a key={s} href={`#${s}`} style={{ color:`${primary}88` }} className="hover:text-white transition-colors uppercase tracking-widest">{s}</a>
          ))}
        </nav>
      </div>

      {/* Hero / intro */}
      <section className="min-h-screen flex items-center px-6 md:px-12 pt-8 pb-16 relative z-10">
        <div className="max-w-4xl w-full">
          <ParallaxEl mx={mouse.x} my={mouse.y} strength={5} scrollOffset={scrollTerm * 0.3}>
            <TermLine prompt command="whoami" />
            <div className="ml-4 mb-4 text-2xl md:text-4xl font-bold" style={{ color: primary }}>
              {typed}<span className="animate-pulse">_</span>
            </div>
            <TermLine prompt command="cat about.txt" />
            <div className="ml-4 mb-4 text-sm leading-relaxed max-w-2xl" style={{ color: `${primary}cc` }}>
              {p.bio || 'No bio available.'}
            </div>
            <TermLine prompt command="echo $TITLE" />
            <div className="ml-4 mb-4" style={{ color: accent }}>{p.title || 'Full Stack Developer'}</div>
            <TermLine prompt command="ls -la ./links/" />
            <div className="ml-4 mb-6 flex flex-wrap gap-4 text-sm">
              {p.social?.github   && <a href={p.social.github}   target="_blank" rel="noreferrer" style={{ color: accent }} className="hover:underline">→ github/</a>}
              {p.social?.linkedin && <a href={p.social.linkedin} target="_blank" rel="noreferrer" style={{ color: accent }} className="hover:underline">→ linkedin/</a>}
            </div>
            <TermLine prompt command="scroll-down --section skills" />
            <div className="ml-4 text-xs" style={{ color: `${primary}55` }}>Output: ▼  {skills.length} skills found ·  {projs.length} projects found</div>
          </ParallaxEl>
        </div>
      </section>

      {/* Skills */}
      {sections.skills && skills.length > 0 && (
        <section id="skills" className="px-6 md:px-12 py-16">
          <Reveal speed={speed}>
            <TermLine prompt command="cat skills.json | pretty-print" />
            <div className="ml-4 mt-4 border rounded p-6 max-w-2xl" style={{ borderColor: `${primary}33`, background: `${primary}08` }}>
              <div className="text-xs mb-4" style={{ color: `${primary}55` }}># skills — sorted by proficiency</div>
              <div className="space-y-3">
                {skills.sort((a,b) => (b.level||0) - (a.level||0)).map((sk, i) => (
                  <Reveal key={sk._id || i} delay={i * 50} speed={speed}>
                    <div className="flex items-center gap-3">
                      <span className="w-24 text-xs truncate" style={{ color: accent }}>{sk.name}</span>
                      <AsciiBar level={sk.level || 80} />
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* Projects */}
      {sections.projects && projs.length > 0 && (
        <section id="projects" className="px-6 md:px-12 py-16">
          <Reveal speed={speed}>
            <TermLine prompt command="ls -la ./projects/" />
            <div className="ml-4 mt-4 space-y-4">
              {projs.map((proj, i) => (
                <Reveal key={proj._id || i} delay={i * 80} speed={speed}>
                  <div className="border rounded p-5" style={{ borderColor: `${primary}33`, background: `${primary}06` }}>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <span style={{ color: accent }} className="font-bold">{proj.title}/</span>
                        <span className="text-xs ml-3" style={{ color: `${primary}55` }}>— {new Date(proj.createdAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-4 text-xs">
                        {proj.githubLink && proj.githubLink !== '#' && <a href={proj.githubLink} target="_blank" rel="noreferrer" style={{ color: primary }} className="hover:underline">[git]</a>}
                        {proj.liveDemo   && proj.liveDemo   !== '#' && <a href={proj.liveDemo}   target="_blank" rel="noreferrer" style={{ color: accent  }} className="hover:underline">[live]</a>}
                      </div>
                    </div>
                    <p className="text-sm mb-3" style={{ color: `${primary}aa` }}>{proj.description}</p>
                    {proj.technologies?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {proj.technologies.map((t,j) => <span key={j} className="text-xs px-2 py-0.5 rounded border" style={{ color: accent, borderColor: `${accent}44` }}>{t}</span>)}
                      </div>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          </Reveal>
        </section>
      )}

      {/* Contact */}
      {sections.contact && (
        <section id="contact" className="px-6 md:px-12 py-16">
          <Reveal speed={speed}>
            <TermLine prompt command="cat contact.env" />
            <div className="ml-4 mt-4 border rounded p-6 max-w-md text-sm space-y-2" style={{ borderColor:`${primary}33`, background:`${primary}08` }}>
              {contact.email    && <div><span style={{ color:`${primary}66` }}>EMAIL=</span><a href={`mailto:${contact.email}`} style={{ color: accent }} className="hover:underline">"{contact.email}"</a></div>}
              {contact.phone    && <div><span style={{ color:`${primary}66` }}>PHONE=</span><span style={{ color: primary }}>"{contact.phone}"</span></div>}
              {contact.location && <div><span style={{ color:`${primary}66` }}>LOCATION=</span><span style={{ color: primary }}>"{contact.location}"</span></div>}
            </div>
          </Reveal>
        </section>
      )}

      <footer className="border-t px-6 py-6 text-xs text-center" style={{ borderColor:`${primary}22`, color:`${primary}44` }}>
        <TermLine><span style={{ color:`${primary}55` }}>[process exited] portfolio@{username} ~ </span><Link to="/" style={{ color:`${primary}66` }} className="hover:underline">built with Portfolio Builder</Link></TermLine>
      </footer>

      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
    </div>
  );
}
