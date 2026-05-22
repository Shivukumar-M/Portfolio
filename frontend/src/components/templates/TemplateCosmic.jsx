import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import ParticleCanvas from '../ParticleCanvas';
import { Reveal, TiltCard, MagneticBtn, TypeWriter, GlitchText, CustomInjector, FontLoader, useMouseParallax, useScrollParallax, ParallaxEl, SkillIcon } from './utils';

const PALETTES = {
  cosmic:  { primary:'#a855f7', accent:'#06b6d4', bg:'#0a0015', bar:'from-purple-500 to-cyan-400',  card:'bg-purple-950/30 border-purple-800/30',  tag:'bg-purple-900/50 text-purple-200', name:'from-purple-400 via-pink-400 to-cyan-400',   nav:'bg-[#0a0015]/80',  btn:'from-purple-600 to-cyan-500' },
  neon:    { primary:'#00ffe0', accent:'#ff00aa', bg:'#000510', bar:'from-cyan-400 to-pink-500',    card:'bg-cyan-950/30 border-cyan-700/20',       tag:'bg-cyan-900/50 text-cyan-200',   name:'from-cyan-300 via-teal-300 to-pink-400',     nav:'bg-[#000510]/80',  btn:'from-cyan-500 to-pink-500' },
  ocean:   { primary:'#0ea5e9', accent:'#06b6d4', bg:'#020b18', bar:'from-sky-400 to-teal-400',    card:'bg-sky-950/30 border-sky-800/30',         tag:'bg-sky-900/50 text-sky-200',     name:'from-sky-300 via-cyan-300 to-teal-400',      nav:'bg-[#020b18]/80',  btn:'from-sky-500 to-teal-500' },
  matrix:  { primary:'#00ff41', accent:'#00cc33', bg:'#000800', bar:'from-green-500 to-emerald-400',card:'bg-green-950/30 border-green-800/20',     tag:'bg-green-950/60 text-green-300', name:'from-green-400 via-emerald-300 to-lime-400',  nav:'bg-[#000800]/80',  btn:'from-green-600 to-emerald-500' },
  minimal: { primary:'#94a3b8', accent:'#64748b', bg:'#0f172a', bar:'from-slate-400 to-slate-300', card:'bg-slate-800/30 border-slate-700/30',     tag:'bg-slate-800/60 text-slate-400', name:'from-slate-200 via-slate-300 to-slate-400',  nav:'bg-[#0f172a]/80',  btn:'from-slate-600 to-slate-500' },
};

export default function TemplateCosmic({ data, config }) {
  const theme  = config?.animationTheme || 'cosmic';
  const p_     = PALETTES[theme] || PALETTES.cosmic;
  const colors = config?.colors || {};
  const primary  = colors.primary  || p_.primary;
  const accent   = colors.accent   || p_.accent;
  const bgColor  = colors.bg       || p_.bg;
  const speed    = config?.animationSpeed || 'normal';
  const sections = config?.sections || { about:true, skills:true, projects:true, contact:true };
  const font     = config?.font || 'Inter';

  const [filter, setFilter] = useState('all');
  const [copied, setCopied] = useState(false);
  const [navVis, setNavVis] = useState(true);
  const lastY = useRef(0);
  const mouse  = useMouseParallax();
  const scrollFast = useScrollParallax(0.08);
  const scrollSlow = useScrollParallax(0.04);

  useEffect(() => {
    const fn = () => { setNavVis(window.scrollY < lastY.current || window.scrollY < 60); lastY.current = window.scrollY; };
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const copyUrl = useCallback(() => { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); }, []);

  const p       = data.profile  || {};
  const skills  = data.skills   || [];
  const projs   = data.projects || [];
  const about   = data.about    || null;
  const contact = data.contact  || {};
  const username= data.username || '';

  const cats   = ['all', ...new Set(skills.map(s => s.category).filter(Boolean))];
  const visSk  = filter === 'all' ? skills : skills.filter(s => s.category === filter);
  const roles  = [p.title || 'Developer', 'Creative Coder', 'Problem Solver', 'Tech Enthusiast'];

  const bgGrad = `linear-gradient(to bottom, ${bgColor}, ${bgColor}cc, ${bgColor})`;

  return (
    <div style={{ background: bgGrad, fontFamily: font !== 'Inter' ? `'${font}', sans-serif` : undefined }} className="min-h-screen text-white relative overflow-x-hidden">
      <FontLoader font={font} />
      <CustomInjector css={config?.customCSS} js={config?.customJS} />
      <ParticleCanvas theme={theme} />

      {/* Nav */}
      <nav className={`fixed top-0 inset-x-0 z-50 backdrop-blur-xl border-b border-white/5 ${p_.nav} transition-transform duration-300`}
        style={{ transform: navVis ? 'translateY(0)' : 'translateY(-100%)' }}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="font-bold text-lg" style={{ background: `linear-gradient(90deg,${primary},${accent})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            @{username}
          </span>
          <div className="hidden md:flex gap-6 text-sm text-slate-400">
            {['about','skills','projects','contact'].filter(s => sections[s]).map(s => (
              <a key={s} href={`#${s}`} className="capitalize hover:text-white transition-colors">{s}</a>
            ))}
          </div>
          <button onClick={copyUrl} className="text-xs px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/30 transition-all">
            {copied ? '✓ Copied!' : '🔗 Share'}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex items-center pt-20 px-4 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <ParallaxEl mx={mouse.x} my={mouse.y} strength={-30} scrollOffset={-scrollFast}
            className="absolute top-1/4 left-1/4">
            <div className="w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: primary }} />
          </ParallaxEl>
          <ParallaxEl mx={mouse.x} my={mouse.y} strength={20} scrollOffset={-scrollSlow}
            className="absolute bottom-1/4 right-1/4">
            <div className="w-72 h-72 rounded-full blur-3xl opacity-10" style={{ background: accent }} />
          </ParallaxEl>
        </div>
        <div className="max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center relative z-10">
          <Reveal speed={speed}>
            <ParallaxEl mx={mouse.x} my={mouse.y} strength={6} scrollOffset={scrollFast * 0.5}>
              <div className="inline-block text-xs px-3 py-1 rounded-full mb-5 border border-white/10 text-slate-400">✦ Available for opportunities</div>
              <h1 className="text-5xl md:text-7xl font-black mb-4 leading-tight">
                Hi, I'm{' '}
                <GlitchText text={p.name || 'Developer'}
                  className="bg-clip-text text-transparent"
                  style={{ background: `linear-gradient(135deg,${primary},${accent})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }} />
              </h1>
              <h2 className="text-xl md:text-2xl mb-6 text-slate-300"><TypeWriter words={roles} /></h2>
              <p className="text-slate-400 text-lg mb-10 max-w-lg leading-relaxed">{p.bio}</p>
              <div className="flex flex-wrap gap-4 mb-8">
                <MagneticBtn href="#projects" className="px-7 py-3.5 rounded-xl font-semibold text-white shadow-lg"
                  style={{ background:`linear-gradient(135deg,${primary},${accent})`, boxShadow:`0 0 24px ${primary}44` }}>
                  View My Work ↓
                </MagneticBtn>
                <MagneticBtn href="#contact" className="px-7 py-3.5 rounded-xl font-semibold border border-white/10 text-white hover:bg-white/5 transition-colors">
                  Contact Me
                </MagneticBtn>
              </div>
              <div className="flex gap-3">
                {p.social?.github   && <MagneticBtn href={p.social.github}   className="w-11 h-11 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/30 transition-all"><i className="fab fa-github text-lg" /></MagneticBtn>}
                {p.social?.linkedin && <MagneticBtn href={p.social.linkedin} className="w-11 h-11 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/30 transition-all"><i className="fab fa-linkedin text-lg" /></MagneticBtn>}
              </div>
            </ParallaxEl>
          </Reveal>
          <Reveal speed={speed} delay={200}>
            <div className="flex justify-center">
              <ParallaxEl mx={mouse.x} my={mouse.y} strength={-14} scrollOffset={scrollFast * 0.3}>
                <div className="relative" style={{ animation: 'float 6s ease-in-out infinite' }}>
                  <div className="absolute inset-[-3px] rounded-3xl" style={{ background:`conic-gradient(${primary},${accent},${primary})`, animation:'spin 8s linear infinite' }}>
                    <div className="w-full h-full rounded-3xl" style={{ background: bgColor }} />
                  </div>
                  <img src={p.photo || 'https://via.placeholder.com/320'} alt={p.name}
                    className="relative w-72 h-72 md:w-80 md:h-80 object-cover rounded-3xl shadow-2xl"
                    style={{ boxShadow:`0 0 60px ${primary}44` }} />
                </div>
              </ParallaxEl>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Skills */}
      {sections.skills && skills.length > 0 && (
        <section id="skills" className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <Reveal speed={speed}>
              <div className="text-center mb-14">
                <h2 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent" style={{ backgroundImage:`linear-gradient(135deg,${primary},${accent})` }}>Skills</h2>
                <div className="mt-4 flex justify-center gap-2">
                  <div className="h-1 w-16 rounded-full" style={{ background: primary }} />
                  <div className="h-1 w-6 rounded-full opacity-40" style={{ background: accent }} />
                </div>
              </div>
            </Reveal>
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {cats.map(cat => (
                <button key={cat} onClick={() => setFilter(cat)}
                  className="px-5 py-2 rounded-full text-sm font-medium capitalize transition-all duration-300"
                  style={filter === cat ? { background:`linear-gradient(135deg,${primary},${accent})`, color:'#fff' } : { border:'1px solid rgba(255,255,255,0.1)', color:'#94a3b8' }}>
                  {cat}
                </button>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {visSk.map((sk, i) => (
                <Reveal key={sk._id || i} delay={i * 60} speed={speed}>
                  <div className={`rounded-xl p-4 ${p_.card} border`}>
                    <div className="flex items-center gap-2 mb-2">
                      <SkillIcon icon={sk.icon} size={22} />
                      <span className="text-sm font-semibold text-white flex-1 truncate">{sk.name}</span>
                      <span className="text-xs flex-shrink-0" style={{ color: primary }}>{sk.level}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${p_.bar} transition-all duration-1000`}
                        style={{ width:`${sk.level}%`, transitionDelay:`${i * 60 + 200}ms` }} />
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Projects */}
      {sections.projects && projs.length > 0 && (
        <section id="projects" className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <Reveal speed={speed}><div className="text-center mb-14">
              <h2 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent" style={{ backgroundImage:`linear-gradient(135deg,${primary},${accent})` }}>Projects</h2>
              <div className="mt-4 flex justify-center gap-2"><div className="h-1 w-16 rounded-full" style={{ background:primary }} /><div className="h-1 w-6 rounded-full opacity-40" style={{ background:accent }} /></div>
            </div></Reveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projs.map((proj, i) => (
                <Reveal key={proj._id || i} delay={i * 100} speed={speed}>
                  <TiltCard className="h-full">
                    <div className={`rounded-2xl border overflow-hidden ${p_.card} h-full flex flex-col`}>
                      <div className="h-44 overflow-hidden relative">
                        <img src={proj.image} alt={proj.title} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="text-lg font-bold text-white mb-2">{proj.title}</h3>
                        <p className="text-sm text-slate-400 mb-4 flex-1">{proj.description}</p>
                        {proj.technologies?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">{proj.technologies.map((t,j) => <span key={j} className={`text-xs px-2.5 py-1 rounded-full ${p_.tag}`}>{t}</span>)}</div>
                        )}
                        <div className="flex gap-3 pt-2 border-t border-white/5">
                          {proj.githubLink && proj.githubLink !== '#' && <MagneticBtn href={proj.githubLink} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"><i className="fab fa-github" /> Code</MagneticBtn>}
                          {proj.liveDemo  && proj.liveDemo  !== '#' && <MagneticBtn href={proj.liveDemo}  className="flex items-center gap-1.5 text-sm ml-auto transition-colors" style={{ color:accent }}><i className="fas fa-external-link-alt" /> Demo</MagneticBtn>}
                        </div>
                      </div>
                    </div>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      {sections.contact && (
        <section id="contact" className="py-24 px-4">
          <div className="max-w-xl mx-auto text-center">
            <Reveal speed={speed}><h2 className="text-4xl md:text-5xl font-black mb-12 bg-clip-text text-transparent" style={{ backgroundImage:`linear-gradient(135deg,${primary},${accent})` }}>Get In Touch</h2></Reveal>
            <TiltCard className={`p-10 rounded-3xl border ${p_.card}`} style={{ boxShadow:`0 0 60px ${primary}22` }}>
              <div className="space-y-4">
                {contact.email    && <a href={`mailto:${contact.email}`} className="flex items-center gap-4 p-4 rounded-2xl border border-white/5 hover:border-white/20 transition-all group"><div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background:`${primary}22` }}><i className="fas fa-envelope" style={{ color:primary }} /></div><div className="text-left"><p className="text-xs text-slate-500 uppercase tracking-widest">Email</p><p className="text-white">{contact.email}</p></div></a>}
                {contact.phone    && <div className="flex items-center gap-4 p-4 rounded-2xl border border-white/5"><div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background:`${accent}22` }}><i className="fas fa-phone" style={{ color:accent }} /></div><div className="text-left"><p className="text-xs text-slate-500 uppercase tracking-widest">Phone</p><p className="text-white">{contact.phone}</p></div></div>}
                {contact.location && <div className="flex items-center gap-4 p-4 rounded-2xl border border-white/5"><div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background:`${primary}22` }}><i className="fas fa-map-marker-alt" style={{ color:primary }} /></div><div className="text-left"><p className="text-xs text-slate-500 uppercase tracking-widest">Location</p><p className="text-white">{contact.location}</p></div></div>}
              </div>
            </TiltCard>
          </div>
        </section>
      )}

      <footer className="border-t border-white/5 py-8 text-center text-slate-500 text-sm">
        <p>Portfolio of <span className="text-white font-medium">{p.name || `@${username}`}</span> · <Link to="/" className="hover:text-white transition-colors" style={{ color:primary }}>Portfolio Builder</Link></p>
      </footer>
      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
