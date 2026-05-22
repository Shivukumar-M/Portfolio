import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Reveal, TiltCard, TypeWriter, CustomInjector, FontLoader, useMouseParallax, useScrollParallax, ParallaxEl, SkillIcon } from './utils';

function NeonText({ children, color, className = '' }) {
  return (
    <span className={className} style={{ color, textShadow:`0 0 10px ${color}, 0 0 30px ${color}88, 0 0 60px ${color}44` }}>
      {children}
    </span>
  );
}

function RetroBar({ level, color, accent }) {
  const blocks = 20;
  const filled = Math.round((level / 100) * blocks);
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {Array.from({ length: blocks }).map((_, i) => (
          <div key={i} className="w-2.5 h-4"
            style={{
              background: i < filled ? color : 'rgba(255,255,255,0.06)',
              boxShadow:  i < filled ? `0 0 4px ${color}88` : 'none',
            }} />
        ))}
      </div>
      <span className="text-xs font-bold" style={{ color: accent }}>{level}%</span>
    </div>
  );
}

export default function TemplateRetro({ data, config }) {
  const colors   = config?.colors || {};
  const primary  = colors.primary || '#ff007a';
  const accent   = colors.accent  || '#00d4ff';
  const bgColor  = colors.bg      || '#0d0018';
  const speed    = config?.animationSpeed || 'normal';
  const sections = config?.sections || { about:true, skills:true, projects:true, contact:true };
  const font     = config?.font || 'Press Start 2P';

  const p       = data.profile  || {};
  const skills  = data.skills   || [];
  const projs   = data.projects || [];
  const about   = data.about    || null;
  const contact = data.contact  || {};
  const username= data.username || '';

  const [filter, setFilter] = useState('all');
  const cats   = ['all', ...new Set(skills.map(s => s.category).filter(Boolean))];
  const visSk  = filter === 'all' ? skills : skills.filter(s => s.category === filter);
  const roles  = [p.title || 'DEVELOPER', 'CODE WARRIOR', 'PIXEL WIZARD'];
  const mouse     = useMouseParallax();
  const scrollGrid = useScrollParallax(0.18);
  const scrollHero = useScrollParallax(0.08);

  const retroBorder = `2px solid ${primary}`;
  const glowBorder  = `border border-[${primary}44]`;

  return (
    <div style={{ background: bgColor, fontFamily: font !== 'Press Start 2P' ? `'${font}', monospace` : "'Press Start 2P', monospace", color: '#fff' }}
      className="min-h-screen overflow-x-hidden">
      <FontLoader font={font} />
      <CustomInjector css={config?.customCSS} js={config?.customJS} />

      {/* Grid floor overlay — parallax perspective deepens on scroll */}
      <div className="pointer-events-none fixed inset-0 z-0" style={{
        backgroundImage: `
          linear-gradient(${primary}18 1px, transparent 1px),
          linear-gradient(90deg, ${primary}18 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
        maskImage: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)',
        transform: `perspective(${800 + scrollGrid * 0.4}px) rotateX(${Math.min(scrollGrid * 0.015, 8)}deg)`,
        transformOrigin: 'bottom center',
        transition: 'transform 0.1s linear',
      }} />

      {/* Nav */}
      <nav className="sticky top-0 z-50" style={{ background:`${bgColor}ee`, borderBottom:`1px solid ${primary}44`, backdropFilter:'blur(10px)' }}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <NeonText color={primary} className="text-xs md:text-sm font-bold tracking-widest">▶ {username.toUpperCase()}</NeonText>
          <div className="hidden md:flex gap-8 text-xs">
            {['skills','projects','contact'].filter(s => sections[s]).map(s => (
              <a key={s} href={`#${s}`} className="tracking-widest uppercase transition-all hover:scale-110"
                style={{ color:`${accent}88` }} onMouseEnter={e => e.target.style.color=accent} onMouseLeave={e => e.target.style.color=`${accent}88`}>
                {s}
              </a>
            ))}
          </div>
          <div className="text-xs" style={{ color:`${primary}88` }}>PRESS START</div>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex items-center px-6 md:px-12 pt-10 pb-20 relative">
        {/* Sunset gradient */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background:`radial-gradient(ellipse 80% 50% at 50% 100%, ${primary}22 0%, transparent 70%)`,
        }} />

        <div className="max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center relative z-10">
          <Reveal speed={speed}>
            <ParallaxEl mx={mouse.x} my={mouse.y} strength={7} scrollOffset={scrollHero * 0.4}>
              <div className="text-xs tracking-[0.5em] mb-6" style={{ color:`${accent}88` }}>INSERT COIN TO CONTINUE</div>
              <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
                <NeonText color={accent} className="block text-sm md:text-base mb-2">PLAYER ONE</NeonText>
                <NeonText color={primary}>{p.name || 'DEVELOPER'}</NeonText>
              </h1>
              <div className="text-sm md:text-base mb-6" style={{ color: accent }}>
                <TypeWriter words={roles} speed={80} />
              </div>
              <p className="text-xs md:text-sm text-white/50 mb-8 leading-relaxed max-w-md" style={{ fontFamily:"'Inter', sans-serif", fontSize:'14px' }}>
                {p.bio}
              </p>
              {/* Retro stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[['PWR', skills.length, primary], ['XP', projs.length, accent], ['LVL', Math.ceil((skills.length + projs.length) / 3) || 1, primary]].map(([label, val, c]) => (
                  <div key={label} className="text-center p-3 border" style={{ borderColor:`${c}44`, background:`${c}0a` }}>
                    <div className="text-xs" style={{ color:`${c}88` }}>{label}</div>
                    <NeonText color={c} className="text-2xl md:text-3xl font-black block">{val}</NeonText>
                  </div>
                ))}
              </div>
              <div className="flex gap-4">
                <a href="#projects" className="px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all hover:scale-105"
                  style={{ background:primary, color:'#000', boxShadow:`0 0 20px ${primary}88` }}>
                  ▶ View Work
                </a>
                {p.social?.github && <a href={p.social.github} target="_blank" rel="noreferrer" className="px-6 py-3 text-xs font-bold uppercase tracking-widest border transition-all hover:scale-105"
                  style={{ borderColor:accent, color:accent, boxShadow:`0 0 20px ${accent}44` }}>
                  GitHub →
                </a>}
              </div>
            </ParallaxEl>
          </Reveal>

          <Reveal speed={speed} delay={150}>
            <div className="flex justify-center">
              <ParallaxEl mx={mouse.x} my={mouse.y} strength={-14} scrollOffset={scrollHero * 0.2}>
                <div className="relative" style={{ animation:'retroFloat 5s ease-in-out infinite' }}>
                  {/* Retro frame */}
                  <div className="absolute -inset-3 border-2 border-dashed" style={{ borderColor:`${primary}44` }} />
                  <div className="absolute -inset-6 border" style={{ borderColor:`${accent}22` }} />
                  <img src={p.photo || 'https://via.placeholder.com/280'} alt={p.name}
                    className="w-56 h-56 md:w-72 md:h-72 object-cover"
                    style={{ filter:`saturate(1.2) contrast(1.1)`, boxShadow:`0 0 40px ${primary}66, 0 0 80px ${primary}33` }} />
                  <div className="absolute bottom-0 left-0 right-0 text-center py-2" style={{ background:`${bgColor}cc`, color:accent, fontSize:'10px' }}>
                    ● ● ● ONLINE ● ● ●
                  </div>
                </div>
              </ParallaxEl>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Skills */}
      {sections.skills && skills.length > 0 && (
        <section id="skills" className="py-20 px-6 md:px-12 border-t" style={{ borderColor:`${primary}22` }}>
          <div className="max-w-6xl mx-auto">
            <Reveal speed={speed}>
              <div className="flex items-center gap-4 mb-12">
                <NeonText color={primary} className="text-2xl md:text-3xl font-black">SKILLS</NeonText>
                <div className="h-px flex-1" style={{ background:`linear-gradient(90deg,${primary}88,transparent)` }} />
              </div>
            </Reveal>
            <div className="flex flex-wrap gap-3 mb-8">
              {cats.map(cat => (
                <button key={cat} onClick={() => setFilter(cat)} className="px-4 py-1.5 text-xs uppercase tracking-widest font-bold transition-all hover:scale-105"
                  style={{ background:filter===cat?primary:'transparent', color:filter===cat?'#000':accent, border:`1px solid ${filter===cat?primary:accent}44` }}>
                  {cat}
                </button>
              ))}
            </div>
            <div className="space-y-4">
              {visSk.map((sk, i) => (
                <Reveal key={sk._id || i} delay={i * 40} speed={speed}>
                  <div className="flex items-center gap-4 p-4 border" style={{ borderColor:`${primary}22`, background:`${primary}06` }}>
                    <SkillIcon icon={sk.icon} size={20} />
                    <span className="text-xs w-24 truncate" style={{ color: accent }}>{sk.name}</span>
                    <RetroBar level={sk.level || 80} color={primary} accent={accent} />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Projects */}
      {sections.projects && projs.length > 0 && (
        <section id="projects" className="py-20 px-6 md:px-12 border-t" style={{ borderColor:`${accent}22` }}>
          <div className="max-w-6xl mx-auto">
            <Reveal speed={speed}>
              <div className="flex items-center gap-4 mb-12">
                <NeonText color={accent} className="text-2xl md:text-3xl font-black">PROJECTS</NeonText>
                <div className="h-px flex-1" style={{ background:`linear-gradient(90deg,${accent}88,transparent)` }} />
              </div>
            </Reveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projs.map((proj, i) => (
                <Reveal key={proj._id || i} delay={i * 80} speed={speed}>
                  <TiltCard className="h-full">
                    <div className="h-full border overflow-hidden" style={{ borderColor:`${primary}44`, background:`${primary}06` }}>
                      <div className="h-40 overflow-hidden relative">
                        <img src={proj.image} alt={proj.title} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                          style={{ filter:'saturate(1.3) contrast(1.1)' }} />
                        <div className="absolute top-2 left-2 text-xs font-bold px-2 py-1" style={{ background:primary, color:'#000' }}>
                          {String(i+1).padStart(2,'0')}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>
                      <div className="p-4">
                        <NeonText color={accent} className="text-sm font-bold block mb-2">{proj.title}</NeonText>
                        <p className="text-xs text-white/50 mb-4 leading-relaxed" style={{ fontFamily:"'Inter',sans-serif", fontSize:'13px' }}>{proj.description}</p>
                        {proj.technologies?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {proj.technologies.map((t,j) => <span key={j} className="text-xs px-2 py-0.5 border" style={{ borderColor:`${accent}44`, color:`${accent}88` }}>{t}</span>)}
                          </div>
                        )}
                        <div className="flex gap-4 border-t pt-3" style={{ borderColor:`${primary}22` }}>
                          {proj.githubLink && proj.githubLink !== '#' && <a href={proj.githubLink} target="_blank" rel="noreferrer" className="text-xs uppercase tracking-wider hover:underline" style={{ color:`${primary}88` }}>Code</a>}
                          {proj.liveDemo   && proj.liveDemo   !== '#' && <a href={proj.liveDemo}   target="_blank" rel="noreferrer" className="text-xs uppercase tracking-wider hover:underline" style={{ color: accent }}>Live →</a>}
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
        <section id="contact" className="py-20 px-6 md:px-12 border-t" style={{ borderColor:`${primary}22` }}>
          <div className="max-w-3xl mx-auto text-center">
            <Reveal speed={speed}>
              <NeonText color={primary} className="text-3xl md:text-4xl font-black block mb-3">CONTINUE?</NeonText>
              <div className="text-xs tracking-[0.5em] mb-10" style={{ color:`${accent}88` }}>INSERT COIN OR CONTACT ME</div>
              <div className="border p-8 text-left space-y-6" style={{ borderColor:`${primary}44`, background:`${primary}06` }}>
                {contact.email    && <div className="flex items-center gap-4"><span style={{ color:`${primary}88` }} className="text-xs w-20">EMAIL</span><a href={`mailto:${contact.email}`} style={{ color: accent }} className="hover:underline text-sm">{contact.email}</a></div>}
                {contact.phone    && <div className="flex items-center gap-4"><span style={{ color:`${primary}88` }} className="text-xs w-20">PHONE</span><span style={{ color: '#fff' }} className="text-sm">{contact.phone}</span></div>}
                {contact.location && <div className="flex items-center gap-4"><span style={{ color:`${primary}88` }} className="text-xs w-20">LOCATION</span><span style={{ color: '#fff' }} className="text-sm">{contact.location}</span></div>}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      <footer className="border-t py-8 text-center text-xs" style={{ borderColor:`${primary}22`, color:`${primary}44` }}>
        <NeonText color={primary}>GAME OVER</NeonText>
        <span className="mx-3" style={{ color:`${primary}44` }}>·</span>
        <Link to="/" style={{ color:`${accent}66` }} className="hover:underline">Portfolio Builder</Link>
      </footer>

      <style>{`
        @keyframes retroFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        @keyframes neonPulse{0%,100%{opacity:1}50%{opacity:0.7}}
      `}</style>
    </div>
  );
}
