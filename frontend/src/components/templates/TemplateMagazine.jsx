import { Link } from 'react-router-dom';
import { Reveal, TiltCard, CustomInjector, FontLoader, useMouseParallax, useScrollParallax, ParallaxEl, SkillIcon } from './utils';

export default function TemplateMagazine({ data, config }) {
  const colors   = config?.colors || {};
  const primary  = colors.primary || '#f97316';
  const accent   = colors.accent  || '#fbbf24';
  const bgColor  = colors.bg      || '#09090b';
  const speed    = config?.animationSpeed || 'normal';
  const sections = config?.sections || { about:true, skills:true, projects:true, contact:true };
  const font     = config?.font || 'Playfair Display';

  const mouse     = useMouseParallax();
  const scrollNum = useScrollParallax(0.25);
  const scrollImg = useScrollParallax(0.12);

  const p       = data.profile  || {};
  const skills  = data.skills   || [];
  const projs   = data.projects || [];
  const about   = data.about    || null;
  const contact = data.contact  || {};
  const username= data.username || '';

  return (
    <div style={{ background: bgColor, fontFamily: `'${font}', Georgia, serif`, color: '#f4f4f5' }}
      className="min-h-screen overflow-x-hidden">
      <FontLoader font={font} />
      <CustomInjector css={config?.customCSS} js={config?.customJS} />

      {/* Nav bar — editorial strip */}
      <nav className="sticky top-0 z-50 border-b border-white/10" style={{ background: bgColor }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-bold text-xs tracking-[0.3em] uppercase" style={{ color: primary }}>Portfolio</span>
            <span className="w-px h-4 bg-white/20" />
            <span className="text-sm text-white/50 tracking-widest uppercase">{username}</span>
          </div>
          <div className="hidden md:flex gap-8 text-xs tracking-widest uppercase text-white/40">
            {['skills','projects','contact'].filter(s => sections[s]).map(s => (
              <a key={s} href={`#${s}`} className="hover:text-white transition-colors">{s}</a>
            ))}
          </div>
          {contact.email && (
            <a href={`mailto:${contact.email}`} className="text-xs tracking-widest uppercase px-4 py-2 border border-white/20 hover:border-white/60 transition-all"
              style={{ color: primary }}>Contact</a>
          )}
        </div>
      </nav>

      {/* Hero — full viewport editorial */}
      <section className="min-h-screen flex flex-col justify-end px-6 md:px-12 pb-16 pt-24 relative overflow-hidden">
        {/* Big faded issue number — floats slower than content on scroll */}
        <ParallaxEl scrollOffset={-scrollNum} mx={mouse.x} my={mouse.y} strength={12}
          className="absolute top-12 right-8 md:right-16 select-none pointer-events-none">
          <div className="text-[200px] md:text-[320px] font-black leading-none"
            style={{ color: `${primary}08`, fontFamily: `'${font}', serif` }}>01</div>
        </ParallaxEl>

        <Reveal speed={speed}>
          <ParallaxEl mx={mouse.x} my={mouse.y} strength={5} scrollOffset={scrollNum * 0.1}>
            {/* Thin horizontal rule */}
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1" style={{ background:`linear-gradient(90deg,${primary},transparent)` }} />
              <span className="text-xs tracking-[0.4em] uppercase text-white/30">{p.title || 'Developer'}</span>
              <div className="h-px w-16" style={{ background: `${primary}44` }} />
            </div>

            {/* The main headline — massive */}
            <h1 style={{ fontFamily:`'${font}', serif`, lineHeight: 0.9 }}
              className="text-[clamp(4rem,14vw,11rem)] font-black uppercase tracking-tight mb-8">
              {(p.name || 'YOUR NAME').split(' ').map((word, i) => (
                <span key={i} className="block">
                  {i % 2 === 0
                    ? <span className="text-white">{word}</span>
                    : <span className="bg-clip-text text-transparent" style={{ backgroundImage:`linear-gradient(135deg,${primary},${accent})` }}>{word}</span>
                  }
                </span>
              ))}
            </h1>

            <div className="flex items-end justify-between flex-wrap gap-8">
              <p className="text-white/50 text-lg max-w-md leading-relaxed" style={{ fontFamily:"'Inter', sans-serif" }}>
                {p.bio?.slice(0,150)}…
              </p>
              <div className="flex gap-4">
                {p.social?.github   && <a href={p.social.github}   target="_blank" rel="noreferrer" className="w-12 h-12 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/40 transition-all"><i className="fab fa-github" /></a>}
                {p.social?.linkedin && <a href={p.social.linkedin} target="_blank" rel="noreferrer" className="w-12 h-12 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/40 transition-all"><i className="fab fa-linkedin" /></a>}
              </div>
            </div>
          </ParallaxEl>
        </Reveal>
      </section>

      {/* Skills — tag cloud */}
      {sections.skills && skills.length > 0 && (
        <section id="skills" className="px-6 md:px-12 py-24 border-t border-white/8">
          <div className="max-w-7xl mx-auto">
            <Reveal speed={speed}>
              <div className="flex items-baseline gap-6 mb-16">
                <span className="text-7xl font-black" style={{ color:`${primary}33` }}>02</span>
                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight">Skills</h2>
              </div>
            </Reveal>
            <div className="flex flex-wrap gap-3">
              {skills.map((sk, i) => {
                const size = sk.level > 85 ? 'text-2xl px-6 py-3' : sk.level > 70 ? 'text-lg px-5 py-2.5' : 'text-sm px-4 py-2';
                return (
                  <Reveal key={sk._id || i} delay={i * 40} speed={speed}>
                    <span className={`${size} border font-bold uppercase tracking-wide transition-all duration-300 hover:scale-105 cursor-default inline-flex items-center gap-2`}
                      style={{
                        borderColor: sk.level > 80 ? primary : 'rgba(255,255,255,0.12)',
                        color:       sk.level > 80 ? primary : 'rgba(255,255,255,0.6)',
                        background:  sk.level > 85 ? `${primary}15` : 'transparent',
                      }}>
                      <SkillIcon icon={sk.icon} size={18} />
                      {sk.name}
                    </span>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Projects — editorial grid */}
      {sections.projects && projs.length > 0 && (
        <section id="projects" className="px-6 md:px-12 py-24 border-t border-white/8">
          <div className="max-w-7xl mx-auto">
            <Reveal speed={speed}>
              <div className="flex items-baseline gap-6 mb-16 relative">
                <ParallaxEl scrollOffset={-scrollNum * 0.5} mx={mouse.x} my={mouse.y} strength={8}
                  className="pointer-events-none">
                  <span className="text-7xl font-black" style={{ color:`${primary}33` }}>03</span>
                </ParallaxEl>
                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight">Projects</h2>
              </div>
            </Reveal>
            <div className="space-y-0">
              {projs.map((proj, i) => (
                <Reveal key={proj._id || i} delay={i * 80} speed={speed}>
                  <div className={`grid md:grid-cols-2 gap-0 border-t border-white/8 py-10 ${i % 2 === 1 ? 'md:grid-flow-dense' : ''}`}>
                    {/* Image with scroll parallax */}
                    <div className={`overflow-hidden ${i % 2 === 1 ? 'md:col-start-2' : ''}`}>
                      <div style={{ transform:`translateY(${scrollImg * 0.06}px)`, transition:'transform 0.1s linear' }}>
                        <img src={proj.image} alt={proj.title}
                          className="w-full h-56 md:h-full object-cover hover:scale-105 transition-transform duration-700" />
                      </div>
                    </div>
                    {/* Content */}
                    <div className={`flex flex-col justify-center p-6 md:p-12 ${i % 2 === 1 ? 'md:col-start-1 md:row-start-1' : ''}`}>
                      <span className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: primary }}>Project {String(i+1).padStart(2,'0')}</span>
                      <h3 className="text-3xl md:text-4xl font-black uppercase mb-4">{proj.title}</h3>
                      <p className="text-white/50 leading-relaxed mb-6" style={{ fontFamily:"'Inter', sans-serif" }}>{proj.description}</p>
                      {proj.technologies?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                          {proj.technologies.map((t,j) => <span key={j} className="text-xs tracking-widest uppercase border border-white/15 px-3 py-1 text-white/40">{t}</span>)}
                        </div>
                      )}
                      <div className="flex gap-6">
                        {proj.githubLink && proj.githubLink !== '#' && <a href={proj.githubLink} target="_blank" rel="noreferrer" className="text-sm tracking-widest uppercase border-b transition-colors hover:border-white" style={{ borderColor:primary, color:primary }}>Source</a>}
                        {proj.liveDemo   && proj.liveDemo   !== '#' && <a href={proj.liveDemo}   target="_blank" rel="noreferrer" className="text-sm tracking-widest uppercase border-b border-white/20 text-white/50 hover:border-white hover:text-white transition-colors">Live →</a>}
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      {sections.contact && (
        <section id="contact" className="px-6 md:px-12 py-24 border-t border-white/8">
          <div className="max-w-7xl mx-auto">
            <Reveal speed={speed}>
              <div className="flex items-baseline gap-6 mb-12">
                <span className="text-7xl font-black" style={{ color:`${primary}33` }}>04</span>
                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight">Contact</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-0 border-t border-white/8">
                {contact.email    && <div className="py-10 pr-10 border-r border-white/8"><p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color:primary }}>Email</p><a href={`mailto:${contact.email}`} className="text-xl hover:underline" style={{ color:'white' }}>{contact.email}</a></div>}
                {contact.phone    && <div className="py-10 px-10 border-r border-white/8"><p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color:primary }}>Phone</p><p className="text-xl text-white">{contact.phone}</p></div>}
                {contact.location && <div className="py-10 pl-10"><p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color:primary }}>Location</p><p className="text-xl text-white">{contact.location}</p></div>}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      <footer className="border-t border-white/8 px-6 md:px-12 py-8 flex items-center justify-between text-white/20 text-xs tracking-widest uppercase">
        <span>{p.name} © {new Date().getFullYear()}</span>
        <Link to="/" className="hover:text-white transition-colors">Portfolio Builder</Link>
      </footer>
    </div>
  );
}
