import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Sun, Moon, Plus, Pin as PinIcon, Mail, Linkedin } from 'lucide-react';
import gsap from 'gsap';
import { HackerText } from './TextEffects';

export default function DesktopLayout({
    activePage,
    handlePageChange,
    clickedItem,
    setClickedItem,
    hoveredNav,
    setHoveredNav,
    isLightMode,
    setIsLightMode,
    theme,
    colorScheme,
    nameColor,
    roles,
    currentRoleIndex,
    isRoleHovered,
    setIsRoleHovered,
    bioRef,
    aboutContentRef,
    hoveredEl,
    setHoveredEl,
    isColorPinned,
    setIsColorPinned,
    mutedColor
}) {
    // --- LOCAL STATE ---
    const comp = useRef(null);
    const [bioIndex, setBioIndex] = useState(0);

    // --- ENTRANCE ANIMATION REMOVED FOR STABILITY ---


    // --- BIO ROTATION ---
    useEffect(() => {
        let timeout;
        const scheduleNext = () => {
            const delay = Math.random() * 5000 + 5000; // 5-10s
            timeout = setTimeout(() => {
                setBioIndex(prev => (prev + 1) % 2);
                scheduleNext();
            }, delay);
        };
        scheduleNext();
        return () => clearTimeout(timeout);
    }, []);

    const bios = [
        // Bio 1: Empowering...
        (
            <>
                <div className="hero-line flex flex-wrap justify-end gap-[1.5vw]"><span className={`${theme.highlight}`}><HackerText text="EMPOWERING" /></span></div>
                <div className="hero-line flex flex-wrap justify-end gap-[1.5vw]"><span className={`${theme.muted}`}><HackerText text="Creative" /></span><span className={`${theme.highlight}`}><HackerText text="TEAMS" /></span><span className={`${theme.muted}`}><HackerText text="to" /></span><span className={`${theme.highlight}`}><HackerText text="SCALE" /></span></div>
                <div className="hero-line flex flex-wrap justify-end gap-[1.5vw]"><span className={`${theme.highlight}`}><HackerText text="PRODUCTION" /></span><span className={`${theme.muted}`}><HackerText text="without" /></span></div>
                <div className="hero-line flex flex-wrap justify-end gap-[1.5vw]"><span className={`${theme.muted}`}><HackerText text="compromising" /></span><span className={`${theme.highlight}`}><HackerText text="INTEGRITY" /></span></div>
            </>
        ),

        // Bio 2: AI didn't kill...
        (
            <>
                <div className="hero-line flex flex-wrap justify-end gap-[1.5vw]"><span className={`${theme.highlight}`}><HackerText text="AI" /></span><span className={`${theme.muted}`}><HackerText text="didn't" /></span></div>
                <div className="hero-line flex flex-wrap justify-end gap-[1.5vw]"><span className={`${theme.muted}`}><HackerText text="kill" /></span><span className={`${theme.highlight}`}><HackerText text="DESIGN" /><span className={`${theme.muted}`}>;</span></span><span className={`${theme.muted}`}><HackerText text="it" /></span><span className={`${theme.highlight}`}><HackerText text="is" /></span></div>
                <div className="hero-line flex flex-wrap justify-end gap-[1.5vw]"><span className={`${theme.highlight}`}><HackerText text="PART" /></span><span className={`${theme.highlight}`}><HackerText text="of" /></span><span className={`${theme.muted}`}><HackerText text="the" /></span></div>
                <div className="hero-line flex flex-wrap justify-end gap-[1.5vw]"><span className={`${theme.highlight}`}><HackerText text="FUTURE" /></span><span className={`${theme.highlight}`}><HackerText text="DESIGN" /></span></div>
            </>
        )
    ];

    return (
        <div ref={comp} className={`relative z-10 h-[100dvh] w-full pointer-events-none flex flex-col`}>
            <div className="flex-1 grid grid-cols-[auto_1fr] gap-0 min-h-0">
                <div className="flex flex-col justify-between h-full min-h-0 pl-[4vw] pr-[2vw] py-[4vh] pointer-events-auto">
                    {/* Nav */}
                    <nav className="flex flex-col items-start gap-6 nav-item pt-3">
                        {['Vinz Tan', 'Projects'].map((item) => {
                            let pageKey = item === 'Projects' ? 'work' : item === 'Vinz Tan' ? 'about' : 'home';
                            const isActive = activePage === pageKey; const isHovered = hoveredNav === item; const isClicked = clickedItem === item; const isOtherHovered = hoveredNav !== null && hoveredNav !== item; const isName = item === 'Vinz Tan';
                            return (
                                <a key={item} href="#" onClick={(e) => { e.preventDefault(); handlePageChange(pageKey); setClickedItem(item); setTimeout(() => setClickedItem(null), 300); }} className={`group relative text-base tracking-[0.2em] uppercase transition-all duration-300 flex items-center gap-0 ${isActive ? 'font-bold' : 'font-medium'} ${isName ? 'font-black text-lg' : ''}`} onMouseEnter={() => setHoveredNav(item)} onMouseLeave={() => setHoveredNav(null)} style={{ color: isClicked ? (isLightMode ? '#ffffff' : '#000000') : isActive ? colorScheme.base : isName ? (activePage === 'work' ? 'inherit' : nameColor) : 'inherit' }}>
                                    <span className="absolute inset-0 transition-all duration-300" style={{ backgroundColor: colorScheme.compString, opacity: isClicked ? 1 : 0, transformOrigin: isClicked ? 'left center' : 'right center', transform: isClicked ? 'scaleX(1)' : 'scaleX(0)', transitionProperty: 'opacity, transform', transitionTimingFunction: 'ease-out', zIndex: 10 }} />
                                    <span className="transition-all ease-out" style={{ width: (isHovered || (isActive && !isOtherHovered)) && !isClicked ? '0.5cqw' : '0px', height: (isHovered || (isActive && !isOtherHovered)) && !isClicked ? '1em' : '1px', backgroundColor: colorScheme.compString, marginRight: (isHovered || (isActive && !isOtherHovered)) && !isClicked ? '8px' : '0px', opacity: (isHovered || (isActive && !isOtherHovered)) && !isClicked ? 1 : 0, transitionProperty: 'width, height, margin-right, opacity', transitionDuration: '300ms, 200ms, 300ms, 300ms', transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)', transitionDelay: (isHovered || (isActive && !isOtherHovered)) && !isClicked ? '0s, 100ms, 0s, 0s' : '200ms, 0s, 200ms, 0s', zIndex: -1 }} />
                                    <span className="relative" style={{ zIndex: 5 }}>{item}</span>
                                </a>
                            );
                        })}
                    </nav>
                    {/* Role */}
                    <div className="flex flex-col justify-end w-[25%] lg:w-[13%] min-w-[140px]">
                        <div className="flex flex-col leading-tight tracking-widest font-sans cursor-pointer group overflow-hidden" style={{ fontSize: 'clamp(0.5rem, 1.4vw, 1.4rem)' }} onMouseEnter={() => setIsRoleHovered(true)} onMouseLeave={() => setIsRoleHovered(false)}>
                            {[0, 1, 2].map((offset) => {
                                const roleIndex = (currentRoleIndex + offset) % roles.length; const role = roles[roleIndex]; const isFirst = offset === 0;
                                return (
                                    <div key={`${role}-${offset}`} className={`grid transition-all duration-500 ease-out ${isFirst ? 'grid-rows-[1fr]' : (isRoleHovered ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}`}>
                                        <div className="overflow-hidden flex flex-col">
                                            {!isFirst && (<div className={`py-1 text-left transition-all duration-500 ${isRoleHovered ? 'opacity-100' : 'opacity-0'}`}><span className={`text-[0.8em] ${theme.subText}`} style={{ animation: `intermittent-spin ${3 + (roleIndex * 7 % 4)}s ease-in-out infinite`, animationDelay: `${(roleIndex * 3) % 2}s`, transformOrigin: 'center center', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '1em', height: '1em' }}><Plus size={12} strokeWidth={3} /></span></div>)}
                                            <div style={isFirst && !isRoleHovered ? { animation: 'slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards' } : {}}>
                                                {role.split(' ').map((word, i) => (
                                                    <div key={i} className={i === 0 ? "font-bold" : "font-light"}>{word}</div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                {/* Right Container */}
                <div className="flex flex-col justify-between h-full min-h-0 pr-[4vw] pl-[2vw] py-[4vh] pointer-events-auto">
                    <div className="theme-toggle flex items-center gap-1 fixed bottom-8 left-8 z-50 md:static md:flex-row md:justify-end md:w-full">
                        <button onClick={(e) => { e.stopPropagation(); setIsColorPinned(!isColorPinned); }} className={`group relative pl-3 py-3 pr-0 transition-all duration-300 ${isColorPinned ? 'opacity-100 scale-110' : 'opacity-50 hover:opacity-100 hover:scale-110'}`} style={{ color: isColorPinned ? colorScheme.compString : (isLightMode ? '#000' : '#fff') }} aria-label="Pin Color"><PinIcon size={22} strokeWidth={2.1} className={`transition-transform duration-300 ${isColorPinned ? "fill-current" : "group-hover:-rotate-12 group-hover:scale-110"}`} /><span className={`absolute top-1/2 right-full mr-2 -translate-y-1/2 px-2 py-1 text-[10px] uppercase tracking-wider rounded bg-black/50 text-white backdrop-blur-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}>Pin the Color</span></button>
                        <button onClick={(e) => { e.stopPropagation(); setIsLightMode(!isLightMode); }} onMouseEnter={() => setHoveredEl('theme')} onMouseLeave={() => setHoveredEl(null)} className={`pl-3 py-3 pr-0 transition-all duration-300 opacity-50 hover:opacity-100 hover:scale-110 translate-x-[2px]`} style={{ color: isLightMode ? '#000' : '#fff' }} aria-label="Toggle Theme">{isLightMode ? <Moon size={24} className={hoveredEl === 'theme' ? 'animate-moon-swing' : ''} /> : <Sun size={24} className={hoveredEl === 'theme' ? 'animate-sun-spin' : ''} />}</button>
                    </div>
                    {/* Context Block Desktop */}
                    <div ref={bioRef} className={`flex flex-col ${activePage === 'about' ? 'items-end justify-center' : 'items-end justify-end'} bio-block relative flex-1 min-h-0`}>
                        {activePage === 'home' && (
                            <div className={`text-[min(5.5vw,12vh)] leading-none font-kumbh font-bold tracking-tighter mix-blend-difference flex flex-col gap-[1vh] items-end text-right select-none cursor-default`}>
                                {bios[bioIndex]}
                            </div>
                        )}
                        {activePage === 'about' && (
                            <div className="relative w-full h-full flex flex-col justify-center">
                                <style>{`.custom-scroll::-webkit-scrollbar { width: 10px; } .custom-scroll::-webkit-scrollbar-track { background: transparent; border: 1px solid ${isLightMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)'}; border-radius: 999px; margin-block: 20vh; } .custom-scroll::-webkit-scrollbar-thumb { background: ${isLightMode ? 'black' : 'white'}; border-radius: 999px; border: 2px solid transparent; background-clip: content-box; } .custom-scroll::-webkit-scrollbar-thumb:hover { background: ${isLightMode ? '#333' : '#ddd'}; background-clip: content-box; }`}</style>
                                <div className="flex w-full gap-12 px-2 h-full items-center">
                                    <div className="flex flex-col w-[30%] h-full gap-6 pt-5">
                                        <div className={`flex-1 w-full rounded-2xl border ${isLightMode ? 'bg-white/80 border-black/10' : 'bg-black/20 border-white/10'} backdrop-blur-[6px] shadow-lg shadow-black/5 overflow-hidden relative group`}><div className="absolute inset-0 flex items-center justify-center"><span className={`text-xs uppercase tracking-widest ${theme.subText}`}>Picture</span></div></div>
                                        <div><h3 className={`text-xs uppercase tracking-[0.2em] mb-3 ${theme.subText} text-left`}>Expertise</h3><div className="flex flex-wrap gap-2 text-[0.7rem] justify-start">{['Creative Ops Strategy', 'Hybrid Workflow Design', 'AIGC Pipeline Arch.', 'Art Direction', 'Brand Systems', 'Tech-Art Leadership'].map((skill, i) => (<div key={i} className={`px-2 py-1.5 rounded border ${theme.border} uppercase tracking-wider text-left bg-transparent whitespace-nowrap`}>{skill}</div>))}</div></div>
                                    </div>
                                    <div ref={aboutContentRef} className={`flex-1 h-full overflow-y-auto pr-6 custom-scroll ${theme.text} text-left pt-5 flex flex-col justify-center`} style={{ maskImage: 'linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)' }}>
                                        <div className="space-y-6 leading-relaxed text-base max-w-prose mx-auto text-justify">
                                            <p>Hi, I'm Vinz, I help Creative Teams escape production limits and maximize their impact.</p>
                                            <p>With over 12 years of experience as a Lead Artist and Educator, I bridge the gap between traditional artistry and modern efficiency. I do not replace artists; I empower them with Hybrid Design Systems—workflows that let AI handle the repetitive "drafting" so your team can focus entirely on high-fidelity polish and creative strategy.</p>

                                            <div className="mt-6">
                                                <h4 className={`text-xs uppercase tracking-widest font-bold ${theme.subText} mb-4`}>My Focus:</h4>
                                                <ul className="space-y-4 list-none pl-0">
                                                    <li className="pl-4 border-l-2" style={{ borderColor: mutedColor.replace('1)', '0.25)') }}>
                                                        <span className="font-bold block mb-1">Empowering Artists</span>
                                                        <span className={`${theme.subText} text-sm`}>Training teams to use AI as a tool for control, not a replacement.</span>
                                                    </li>
                                                    <li className="pl-4 border-l-2" style={{ borderColor: mutedColor.replace('1)', '0.25)') }}>
                                                        <span className="font-bold block mb-1">Protecting Integrity</span>
                                                        <span className={`${theme.subText} text-sm`}>Using AI for the "base," while human taste handles the "finish."</span>
                                                    </li>
                                                    <li className="pl-4 border-l-2" style={{ borderColor: mutedColor.replace('1)', '0.25)') }}>
                                                        <span className="font-bold block mb-1">Scaling Output</span>
                                                        <span className={`${theme.subText} text-sm`}>Removing bottlenecks so teams can create more without burnout.</span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activePage === 'work' && (<div className={`${theme.text} max-w-2xl text-right space-y-6`}><h2 className={`text-3xl font-bold uppercase tracking-wide mb-6`} style={{ color: colorScheme.base }}>Work</h2><p className="leading-relaxed text-base">Featured projects and case studies coming soon. I specialize in AI-driven creative solutions and strategic implementations for forward-thinking organizations.</p></div>)}
                        {activePage === 'contact' && (<div className={`${theme.text} max-w-2xl text-right space-y-6`}><h2 className={`text-3xl font-bold uppercase tracking-wide mb-6`} style={{ color: colorScheme.base }}>Contact</h2><div className="leading-relaxed text-base space-y-4"><p>Let's discuss how AI can transform your creative workflow.</p><div className="space-y-2"><p className={`${theme.subText} text-sm uppercase tracking-widest`}>Email</p><p>hello@vinztan.com</p></div><div className="space-y-2"><p className={`${theme.subText} text-sm uppercase tracking-widest`}>Location</p><p>Kuala Lumpur, Malaysia</p></div></div><button onClick={() => setActivePage('home')} className={`mt-6 px-4 py-2 rounded-full border ${theme.border} ${theme.navHover} transition-all duration-300 text-xs uppercase tracking-widest`} style={{ borderColor: colorScheme.compString, color: colorScheme.compString }}>← Back to Home</button></div>)}
                    </div>
                </div>
            </div>
            <div className="flex-none w-full px-[4%] py-[2vh] pb-[6vh] pointer-events-auto"><div className="flex items-center justify-between w-full footer-elem"><div className={`${theme.subText} w-[25%] lg:w-[13%] min-w-[140px]`}><div className="flex flex-col leading-tight tracking-widest uppercase font-sans" style={{ fontSize: 'clamp(0.2rem, 0.7vw, 0.8rem)' }}><div className="whitespace-nowrap font-light">Based in Malaysia</div><div className="font-light">@ 2026</div></div></div><div className={`${theme.subText} text-[10px] uppercase tracking-widest opacity-60 animate-pulse`}>Scroll for more ↓</div><div className="flex items-center gap-8"><a href="#" className={`transition-colors duration-300 transform hover:scale-110`} onMouseEnter={() => setHoveredEl('linkedin')} onMouseLeave={() => setHoveredEl(null)} style={{ color: hoveredEl === 'linkedin' ? colorScheme.compString : (isLightMode ? '#000' : '#fff') }} aria-label="LinkedIn"><Linkedin size={20} /></a><a href="mailto:hello@vinztan.com" className={`transition-colors duration-300 transform hover:scale-110`} onMouseEnter={() => setHoveredEl('mail')} onMouseLeave={() => setHoveredEl(null)} style={{ color: hoveredEl === 'mail' ? colorScheme.compString : (isLightMode ? '#000' : '#fff') }} aria-label="Email"><Mail size={20} /></a></div></div></div>
        </div>
    );
}
