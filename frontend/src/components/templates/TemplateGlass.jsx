import { Link } from 'react-router-dom';
import { Reveal, TiltCard, MagneticBtn, TypeWriter, CustomInjector, FontLoader, useMouseParallax, useScrollParallax, ParallaxEl, SkillIcon } from './utils';

export default function TemplateGlass({ data, config }) {
  const colors   = config?.colors || {};
  const primary  = colors.primary || '#8b5cf6';
  const accent   = colors.accent  || '#06b6d4';
  const bgColor  = colors.bg      || '#030712';
  const speed    = config?.animationSpeed || 'normal';
  const sections = config?.sections || { about:true, skills:true, projects:true, contact:true };
  const font     = config?.font || 'Space Grotesk';

  const mouse      = useMouseParallax();
  const scrollA    = useScrollParallax(0.06);
  const scrollB    = useScrollParallax(0.12);
  const scrollC    = useScrollParallax(0.04);

  const p       = data.profile  || {};
  const skills  = data.skills   || [];
  const projs   = data.projects || [];
  const about   = data.about    || null;
  const contact = data.contact  || {};
  const username= data.username || '';

  const glassCard = 'backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl';
  const roles = [p.title || 'Developer', 'Creative Builder', 'Problem Solver'];

  return (
    <div style={{ background: bgColor, fontFamily: font !== 'Space Grotesk' ? `'${font}', sans-serif` : "'Space Grotesk', sans-serif" }}
      className="min-h-screen text-white relative overflow-x-hidden">
      <FontLoader font={font} />
      <CustomInjector css={config?.customCSS} js={config?.customJS} />

      {/* Ambient orbs — parallax in background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <ParallaxEl mx={mouse.x} my={mouse.y} strength={-40} scrollOffset={-scrollA}
          className="absolute top-[-10%] left-[-10%]">
          <div className="w-[600px] h-[600px] rounded-full blur-[120px] opacity-20" style={{ background: primary }} />
        </ParallaxEl>
        <ParallaxEl mx={mouse.x} my={mouse.y} strength={28} scrollOffset={-scrollB}
          className="absolute bottom-[-10%] right-[-5%]">
          <div className="w-[500px] h-[500px] rounded-full blur-[100px] opacity-15" style={{ background: accent }} />
        </ParallaxEl>
        <ParallaxEl mx={mouse.x} my={mouse.y} strength={18} scrollOffset={-scrollC}
          className="absolute top-[40%] left-[40%]">
          <div className="w-[300px] h-[300px] rounded-full blur-[80px] opacity-10" style={{ background: `${primary}88` }} />
        </ParallaxEl>
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-2xl border-b border-white/5 bg-white/3">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-bold text-lg bg-clip-text text-transparent" style={{ backgroundImage:`linear-gradient(90deg,${primary},${accent})` }}>@{username}</span>
          <div className="hidden md:flex gap-8 text-sm text-white/50">
            {['skills','projects','contact'].filter(s => sections[s]).map(s => (
              <a key={s} href={`#${s}`} className="capitalize hover:text-white transition-colors">{s}</a>
            ))}
          </div>
          <a href={`mailto:${contact.email || '#'}`} className="text-xs px-4 py-2 rounded-full text-white/70 border border-white/10 hover:bg-white/10 transition-all backdrop-blur">
            Hire Me
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex items-center pt-10 px-6">
        <div className="max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-16 items-center">
          <Reveal speed={speed}>
            <ParallaxEl mx={mouse.x} my={mouse.y} strength={8} scrollOffset={scrollA * 0.4}>
              <div className="text-sm px-3 py-1 rounded-full border border-white/10 bg-white/5 inline-block mb-6 text-white/50">
                ✦ Open to work
              </div>
              <h1 className="text-5xl md:text-7xl font-black leading-tight mb-5">
                {p.name || 'Creative'}<br />
                <span className="bg-clip-text text-transparent" style={{ backgroundImage:`linear-gradient(135deg,${primary},${accent})` }}>Developer</span>
              </h1>
              <p className="text-white/50 text-xl mb-4"><TypeWriter words={roles} /></p>
              <p className="text-white/40 leading-relaxed mb-10 max-w-md">{p.bio}</p>
              <div className="flex gap-4 flex-wrap">
                <MagneticBtn href="#projects" className="px-8 py-3.5 rounded-2xl font-semibold text-white"
                  style={{ background:`linear-gradient(135deg,${primary},${accent})`, boxShadow:`0 8px 32px ${primary}33` }}>
                  View Work
                </MagneticBtn>
                <MagneticBtn href="#contact" className="px-8 py-3.5 rounded-2xl font-semibold border border-white/10 text-white/70 hover:bg-white/5 transition-all backdrop-blur">
                  Contact
                </MagneticBtn>
              </div>
            </ParallaxEl>
          </Reveal>

          <Reveal speed={speed} delay={200}>
            <div className="flex justify-center">
              <ParallaxEl mx={mouse.x} my={mouse.y} strength={-16} scrollOffset={scrollA * 0.25}>
                <div className="relative" style={{ animation:'glassFloat 7s ease-in-out infinite' }}>
                  <div className={`p-2 ${glassCard} shadow-2xl`} style={{ boxShadow:`0 32px 80px ${primary}33` }}>
                    <img src={p.photo || 'https://via.placeholder.com/320'} alt={p.name}
                      className="w-64 h-64 md:w-72 md:h-72 object-cover rounded-2xl" />
                  </div>
                  {/* Floating stat badges */}
                  <div className={`absolute -bottom-6 -left-8 px-5 py-3 ${glassCard} shadow-xl`}>
                    <p className="text-xs text-white/40 mb-1">Projects</p>
                    <p className="text-2xl font-black" style={{ color: primary }}>{projs.length}+</p>
                  </div>
                  <div className={`absolute -top-4 -right-6 px-5 py-3 ${glassCard} shadow-xl`}>
                    <p className="text-xs text-white/40 mb-1">Skills</p>
                    <p className="text-2xl font-black" style={{ color: accent }}>{skills.length}+</p>
                  </div>
                </div>
              </ParallaxEl>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Skills */}
      {sections.skills && skills.length > 0 && (
        <section id="skills" className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <Reveal speed={speed}><h2 className="text-4xl md:text-5xl font-black mb-14 text-center bg-clip-text text-transparent" style={{ backgroundImage:`linear-gradient(135deg,${primary},${accent})` }}>Skills</h2></Reveal>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {skills.map((sk, i) => (
                <Reveal key={sk._id || i} delay={i * 50} speed={speed}>
                  <div className={`${glassCard} p-5 text-center group hover:bg-white/10 transition-all duration-300 hover:scale-105 cursor-default`}
                    style={{ boxShadow:`0 0 0 1px ${primary}11` }}>
                    <div className="relative w-14 h-14 mx-auto mb-3">
                      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                        <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4" />
                        <circle cx="28" cy="28" r="22" fill="none" strokeWidth="4"
                          stroke={primary}
                          strokeDasharray={`${2 * Math.PI * 22}`}
                          strokeDashoffset={`${2 * Math.PI * 22 * (1 - (sk.level||80)/100)}`}
                          strokeLinecap="round"
                          style={{ transition:'stroke-dashoffset 1.2s ease', filter:`drop-shadow(0 0 6px ${primary}88)` }} />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center">
                        <SkillIcon icon={sk.icon} size={24} />
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-white/80">{sk.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: primary }}>{sk.level}%</p>
                    {sk.category && <p className="text-xs text-white/30 mt-0.5 capitalize">{sk.category}</p>}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Projects */}
      {sections.projects && projs.length > 0 && (
        <section id="projects" className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <Reveal speed={speed}><h2 className="text-4xl md:text-5xl font-black mb-14 text-center bg-clip-text text-transparent" style={{ backgroundImage:`linear-gradient(135deg,${primary},${accent})` }}>Projects</h2></Reveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projs.map((proj, i) => (
                <Reveal key={proj._id || i} delay={i * 90} speed={speed}>
                  <TiltCard className="h-full">
                    <div className={`${glassCard} h-full flex flex-col overflow-hidden group hover:bg-white/10 transition-all duration-300`}
                      style={{ boxShadow:`0 0 0 1px ${primary}11` }}>
                      <div className="h-44 overflow-hidden relative">
                        <img src={proj.image} alt={proj.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="text-lg font-bold mb-2">{proj.title}</h3>
                        <p className="text-sm text-white/50 flex-1 mb-4">{proj.description}</p>
                        {proj.technologies?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {proj.technologies.map((t,j) => <span key={j} className="text-xs px-2.5 py-1 rounded-full bg-white/8 border border-white/10 text-white/60">{t}</span>)}
                          </div>
                        )}
                        <div className="flex gap-3 pt-2 border-t border-white/5">
                          {proj.githubLink && proj.githubLink !== '#' && <a href={proj.githubLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors"><i className="fab fa-github" /> Code</a>}
                          {proj.liveDemo   && proj.liveDemo   !== '#' && <a href={proj.liveDemo}   target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm ml-auto" style={{ color: accent }}><i className="fas fa-external-link-alt" /> Live</a>}
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
        <section id="contact" className="py-24 px-6">
          <div className="max-w-lg mx-auto text-center">
            <Reveal speed={speed}>
              <h2 className="text-4xl md:text-5xl font-black mb-3 bg-clip-text text-transparent" style={{ backgroundImage:`linear-gradient(135deg,${primary},${accent})` }}>Say Hello</h2>
              <p className="text-white/40 mb-12">Let's create something amazing together</p>
              <div className={`${glassCard} p-8 text-left space-y-4`} style={{ boxShadow:`0 32px 80px ${primary}22` }}>
                {contact.email    && <a href={`mailto:${contact.email}`} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all group"><div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background:`${primary}22` }}><i className="fas fa-envelope" style={{ color:primary }} /></div><div><p className="text-xs text-white/30 uppercase tracking-widest">Email</p><p className="text-white/80">{contact.email}</p></div></a>}
                {contact.phone    && <div className="flex items-center gap-4 p-4 rounded-2xl"><div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background:`${accent}22` }}><i className="fas fa-phone" style={{ color:accent }} /></div><div><p className="text-xs text-white/30 uppercase tracking-widest">Phone</p><p className="text-white/80">{contact.phone}</p></div></div>}
                {contact.location && <div className="flex items-center gap-4 p-4 rounded-2xl"><div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background:`${primary}22` }}><i className="fas fa-map-marker-alt" style={{ color:primary }} /></div><div><p className="text-xs text-white/30 uppercase tracking-widest">Location</p><p className="text-white/80">{contact.location}</p></div></div>}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      <footer className="border-t border-white/5 py-8 text-center text-white/20 text-sm">
        <Link to="/" className="hover:text-white transition-colors">Built with Portfolio Builder</Link>
      </footer>

      <style>{`
        @keyframes glassFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}
      `}</style>
    </div>
  );
}
