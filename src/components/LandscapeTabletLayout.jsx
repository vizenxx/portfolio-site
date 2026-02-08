import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Sun, Moon, Plus, Pin as PinIcon, Mail, Linkedin, Volume2, VolumeX, AudioLines, Menu, X, GripVertical } from 'lucide-react';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { HackerText } from './TextEffects';
import Project from '../Project';

gsap.registerPlugin(ScrollToPlugin);

export default function LandscapeTabletLayout({
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
    aboutContentRef,
    hoveredEl,
    setHoveredEl,
    isColorPinned,
    setIsColorPinned,
    mutedColor,
    detailPanelRef,
    gccRef,
    grcRef,
    isPlaying,
    toggleAudio,
    imageProgress = 0,
    onImageScroll,
    isTouch
}) {
    // --- LOCAL STATE ---
    const comp = useRef(null);
    const [bioIndex, setBioIndex] = useState(0);
    const [activeProjectId, setActiveProjectId] = useState('luckbros');

    // --- PILL MENU LOGIC ---
    const [menuCoord, setMenuCoord] = useState(() => ({
        x: typeof window !== 'undefined' ? window.innerWidth - 45.5 : 800,
        y: 60
    }));
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0, coordX: 0, coordY: 0 });

    const scrollToSection = (id) => {
        const target = document.getElementById(`section-${id}`);
        if (target) {
            gsap.to(window, {
                scrollTo: target,
                duration: 1.2,
                ease: "power3.inOut"
            });
            handlePageChange(id);
        }
    };

    // Update activePage on scroll
    useEffect(() => {
        const handleScroll = () => {
            const sections = ['home', 'about', 'work'];
            let current = 'home';
            for (const id of sections) {
                const el = document.getElementById(`section-${id}`);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    if (rect.top < window.innerHeight / 2 && rect.bottom > window.innerHeight / 2) {
                        current = id;
                        break;
                    }
                }
            }
            if (current !== activePage) {
                handlePageChange(current);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [activePage, handlePageChange]);

    // Entrance Animation
    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 1.0 } });
            gsap.set(".hl-container", { opacity: 0 });
            gsap.set(".entry-highlight-mask", { scaleX: 0 });
            gsap.set(".cl-container", { opacity: 0, y: 30 });
            gsap.set(".fl-container", { opacity: 0, x: -40 });
            gsap.set(".corner-ui", { opacity: 0, x: 40 });
            gsap.set("#landscape-pill", { opacity: 0, scale: 0.8, x: 50 });

            tl.to(".entry-highlight-mask", { scaleX: 1, duration: 0.5, ease: "expo.inOut", stagger: 0.1 }, 0)
                .to(".hl-container", { opacity: 1, duration: 0.1 }, 0.5)
                .to(".entry-highlight-mask", { scaleX: 0, duration: 0.4, ease: "power2.inOut", transformOrigin: "right center" }, 0.5)
                .to(".cl-container", { opacity: 1, y: 0, duration: 1.2 }, 0.5)
                .to(".fl-container", { opacity: 1, x: 0, duration: 1.2 }, 0.5)
                .to(".corner-ui", { opacity: 1, x: 0, duration: 1.2 }, "<")
                .to("#landscape-pill", { opacity: 1, scale: 1, x: 0, duration: 1.2, ease: "back.out(1.7)" }, 0.5);
        }, comp);
        return () => ctx.revert();
    }, []);

    useEffect(() => {
        let timeout;
        const scheduleNext = () => {
            const delay = Math.random() * 5000 + 5000;
            timeout = setTimeout(() => {
                setBioIndex(prev => (prev + 1) % 2);
                scheduleNext();
            }, delay);
        };
        scheduleNext();
        return () => clearTimeout(timeout);
    }, []);

    const bios = [
        (
            <>
                <div className="hero-line flex flex-wrap justify-end gap-[1.5vw]"><span className={`${theme.highlight}`}><HackerText text="EMPOWERING" /></span></div>
                <div className="hero-line flex flex-wrap justify-end gap-[1.5vw]"><span className={`${theme.muted}`}><HackerText text="Creative" /></span><span className={`${theme.highlight}`}><HackerText text="TEAMS" /></span><span className={`${theme.muted}`}><HackerText text="to" /></span><span className={`${theme.highlight}`}><HackerText text="SCALE" /></span></div>
                <div className="hero-line flex flex-wrap justify-end gap-[1.5vw]"><span className={`${theme.highlight}`}><HackerText text="PRODUCTION" /></span><span className={`${theme.muted}`}><HackerText text="without" /></span></div>
                <div className="hero-line flex flex-wrap justify-end gap-[1.5vw]"><span className={`${theme.muted}`}><HackerText text="compromising" /></span><span className={`${theme.highlight}`}><HackerText text="INTEGRITY" /></span></div>
            </>
        ),
        (
            <>
                <div className="hero-line flex flex-wrap justify-end gap-[1.5vw]"><span className={`${theme.highlight}`}><HackerText text="AI" /></span><span className={`${theme.muted}`}><HackerText text="didn't" /></span></div>
                <div className="hero-line flex flex-wrap justify-end gap-[1.5vw]"><span className={`${theme.muted}`}><HackerText text="kill" /></span><span className={`${theme.highlight}`}><HackerText text="DESIGN" /><span className={`${theme.muted}`}>;</span></span><span className={`${theme.muted}`}><HackerText text="it" /></span><span className={`${theme.highlight}`}><HackerText text="is" /></span></div>
                <div className="hero-line flex flex-wrap justify-end gap-[1.5vw]"><span className={`${theme.highlight}`}><HackerText text="PART" /></span><span className={`${theme.highlight}`}><HackerText text="of" /></span><span className={`${theme.muted}`}><HackerText text="the" /></span></div>
                <div className="hero-line flex flex-wrap justify-end gap-[1.5vw]"><span className={`${theme.highlight}`}><HackerText text="FUTURE" /></span><span className={`${theme.highlight}`}><HackerText text="DESIGN" /></span></div>
            </>
        )
    ];

    const FooterLeft = () => (
        <div className="flex items-end justify-start w-full h-[6vh] pb-1">
            <div className={`${theme.subText}`}>
                <div className="flex flex-col leading-tight tracking-widest uppercase" style={{ fontSize: 'clamp(0.2rem, 0.7vw, 0.8rem)' }}>
                    <div className="whitespace-nowrap font-light font-primary">Based in Malaysia</div>
                    <div className="font-light font-primary">@ 2026</div>
                </div>
            </div>
        </div>
    );

    const FooterRight = () => (
        <div className="flex items-end gap-7 h-[6vh] pb-1">
            <a href="https://www.linkedin.com/in/vinz-tan/" target="_blank" rel="noopener noreferrer" className={`transition-colors duration-300 transform hover:scale-110`} onMouseEnter={() => !isTouch && setHoveredEl('linkedin')} onMouseLeave={() => !isTouch && setHoveredEl(null)} style={{ color: hoveredEl === 'linkedin' ? colorScheme.compString : (isLightMode ? '#000' : '#fff') }} aria-label="LinkedIn"><Linkedin size={20} /></a>
            <a href="mailto:vinz.a.studio@gmail.com" className={`transition-colors duration-300 transform hover:scale-110`} onMouseEnter={() => !isTouch && setHoveredEl('mail')} onMouseLeave={() => !isTouch && setHoveredEl(null)} style={{ color: hoveredEl === 'mail' ? colorScheme.compString : (isLightMode ? '#000' : '#fff') }} aria-label="Email"><Mail size={20} /></a>
        </div>
    );

    useEffect(() => {
        if (!isDragging) return;
        const handleMove = (e) => {
            const touch = e.touches ? e.touches[0] : e;
            const dx = touch.clientX - dragStartRef.current.x;
            const dy = touch.clientY - dragStartRef.current.y;
            const screenW = window.innerWidth; const screenH = window.innerHeight;
            const clampedX = Math.max(30, Math.min(screenW - 30, dragStartRef.current.coordX + dx));
            const clampedY = Math.max(30, Math.min(screenH - 30, dragStartRef.current.coordY + dy));
            setMenuCoord({ x: clampedX, y: clampedY });
        };
        const handleEnd = () => setIsDragging(false);
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleEnd);
        window.addEventListener('touchmove', handleMove, { passive: false });
        window.addEventListener('touchend', handleEnd);
        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleEnd);
        };
    }, [isDragging]);

    const menuSide = (typeof window !== 'undefined' && menuCoord.x > window.innerWidth / 2) ? 'right' : 'left';

    return (
        <div ref={comp} className={`relative z-10 w-full flex flex-col items-stretch px-[4vw]`}>

            {/* FIXED AND PERSISTENT UI */}
            <div id="landscape-pill"
                className="fixed z-[150] pointer-events-auto"
                style={{
                    top: menuCoord.y - 27.5,
                    ...(menuSide === 'left' ? { left: menuCoord.x - 27.5 } : { right: window.innerWidth - menuCoord.x - 27.5 }),
                    transition: isDragging ? 'none' : 'all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
                }}
            >
                <div className={`flex items-center rounded-full border shadow-lg overflow-hidden transition-all duration-500 ${theme.border}`}
                    style={{
                        backdropFilter: 'blur(10px) saturate(1.5)',
                        WebkitBackdropFilter: 'blur(10px) saturate(1.5)',
                        backgroundColor: isLightMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                        padding: '6px 16px',
                        height: '55px'
                    }}>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsColorPinned(!isColorPinned)} className={`p-2 rounded-full transition-all ${isColorPinned ? 'opacity-100' : 'opacity-40'}`} style={{ color: isColorPinned ? colorScheme.compString : 'inherit' }}>
                            <PinIcon size={20} className={isColorPinned ? 'fill-current' : ''} />
                        </button>
                        <button onClick={() => setIsLightMode(!isLightMode)} className="p-2 rounded-full opacity-60 hover:opacity-100">
                            {isLightMode ? <Moon size={20} /> : <Sun size={20} />}
                        </button>
                        <button onClick={() => toggleAudio(undefined, true)} className={`p-2 rounded-full transition-all ${isPlaying ? 'opacity-100' : 'opacity-40'}`} style={{ color: isPlaying ? colorScheme.compString : 'inherit' }}>
                            <AudioLines size={20} className={isPlaying ? "animate-pulse" : ""} />
                        </button>
                        <div className="h-6 w-[1px] bg-white/10 mx-1" />
                        <div onMouseDown={(e) => { setIsDragging(true); dragStartRef.current = { x: e.clientX, y: e.clientY, coordX: menuCoord.x, coordY: menuCoord.y }; }}
                            onTouchStart={(e) => { setIsDragging(true); const t = e.touches[0]; dragStartRef.current = { x: t.clientX, y: t.clientY, coordX: menuCoord.x, coordY: menuCoord.y }; }}
                            className="p-2 cursor-grab active:cursor-grabbing opacity-40 hover:opacity-100">
                            <GripVertical size={20} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="fixed bottom-[5vh] right-[4vw] z-[100] pointer-events-auto flex justify-end corner-ui">
                <FooterRight />
            </div>

            {/* STICKY SIDEBAR (GLC) */}
            <div className="fixed left-[4vw] top-[5vh] bottom-[5vh] w-[12vw] flex flex-col justify-between items-start pointer-events-auto z-30">
                <div className="hl-container pt-3 pb-[2vh] overflow-visible">
                    <nav className="flex flex-col items-start gap-4 nav-item">
                        <div className="flex flex-col items-start leading-none relative">
                            <button onClick={() => scrollToSection('home')}
                                className={`group relative tracking-[0.2em] uppercase font-primary transition-all duration-300 flex items-center gap-0 ${activePage === 'home' ? 'text-lg font-normal' : 'text-base opacity-40 font-medium'}`}
                                onMouseEnter={() => !isTouch && setHoveredNav('Vinz Tan')} onMouseLeave={() => !isTouch && setHoveredNav(null)}
                                style={{ color: (activePage === 'about' || activePage === 'home') ? colorScheme.base : 'inherit' }}
                            >
                                <span className="absolute inset-x-0 inset-y-[-2px] entry-highlight-mask" style={{ backgroundColor: colorScheme.compString, transformOrigin: 'left center', zIndex: 10, opacity: 1 }} />
                                <span className="transition-all ease-out" style={{ width: (hoveredNav === 'Vinz Tan' || (activePage === 'about' && hoveredNav === null)) && clickedItem !== 'Vinz Tan' ? '0.5cqw' : '0px', height: (hoveredNav === 'Vinz Tan' || (activePage === 'about' && hoveredNav === null)) && clickedItem !== 'Vinz Tan' ? '1em' : '1px', backgroundColor: colorScheme.compString, marginRight: (hoveredNav === 'Vinz Tan' || (activePage === 'about' && hoveredNav === null)) && clickedItem !== 'Vinz Tan' ? '8px' : '0px', opacity: (hoveredNav === 'Vinz Tan' || (activePage === 'about' && hoveredNav === null)) && clickedItem !== 'Vinz Tan' ? 1 : 0, transitionProperty: 'width, height, margin-right, opacity', transitionDuration: '300ms, 200ms, 300ms, 300ms', transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)', zIndex: -1 }} />
                                <span className="relative" style={{ zIndex: 1 }}>Vinz Tan</span>
                            </button>
                        </div>
                        <div className="flex flex-col items-start gap-4">
                            <button onClick={() => scrollToSection('work')}
                                className={`flex items-center gap-0 tracking-[0.2em] relative uppercase transition-all duration-300 font-primary text-left ${activePage === 'work' ? 'text-lg font-normal opacity-100' : 'text-base opacity-40 font-medium hover:opacity-100 cursor-pointer'}`}
                                onMouseEnter={() => !isTouch && setHoveredNav('Projects')}
                                onMouseLeave={() => !isTouch && setHoveredNav(null)}
                                style={{ color: activePage === 'work' ? colorScheme.base : 'inherit' }}
                            >
                                <span className="absolute inset-x-0 inset-y-[-2px] entry-highlight-mask" style={{ backgroundColor: colorScheme.compString, transformOrigin: 'left center', zIndex: 10, opacity: 1 }} />
                                <span className="transition-all ease-out" style={{ width: (hoveredNav === 'Projects' || activePage === 'work') ? '4px' : '0px', height: (hoveredNav === 'Projects' || activePage === 'work') ? '1em' : '1px', backgroundColor: colorScheme.compString, marginRight: (hoveredNav === 'Projects' || activePage === 'work') ? '8px' : '0px', opacity: (hoveredNav === 'Projects' || activePage === 'work') ? 1 : 0, transitionProperty: 'width, height, margin-right, opacity', transitionDuration: '300ms, 200ms, 300ms, 300ms', transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)', zIndex: -1 }} />
                                <span className="relative" style={{ zIndex: 1 }}>Projects</span>
                            </button>
                        </div>
                    </nav>
                </div>
                <div className="flex flex-col mt-auto">
                    <div className="cl-container">
                        <div className="flex flex-col leading-tight tracking-widest font-primary cursor-pointer group overflow-hidden" style={{ fontSize: 'clamp(0.5rem, 1.4vw, 1.4rem)' }} onMouseEnter={() => !isTouch && setIsRoleHovered(true)} onMouseLeave={() => !isTouch && setIsRoleHovered(false)}>
                            {[0, 1, 2].map((offset) => {
                                const roleIndex = (currentRoleIndex + offset) % roles.length; const role = roles[roleIndex]; const isFirst = offset === 0;
                                return (
                                    <div key={`${role}-${offset}`} className={`grid transition-all duration-500 ease-out ${isFirst ? 'grid-rows-[1fr]' : (isRoleHovered ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}`}>
                                        <div className="overflow-hidden flex flex-col">
                                            {!isFirst && (<div className={`py-1 text-left transition-all duration-500 ${isRoleHovered ? 'opacity-100' : 'opacity-0'}`}><span className={`text-[0.8em] ${theme.subText}`} style={{ animation: `intermittent-spin ${3 + (roleIndex * 7 % 4)}s ease-in-out infinite`, animationDelay: `${(roleIndex * 3) % 2}s`, transformOrigin: 'center center', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '1em', height: '1em' }}><Plus size={12} strokeWidth={3} /></span></div>)}
                                            <div>
                                                {role.split(' ').map((word, i) => (<div key={i} className={i === 0 ? "font-normal" : "font-light"}>{word}</div>))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="fl-container pt-[2vh]"><FooterLeft /></div>
                </div>
            </div>

            {/* SECTIONS LIST */}
            <div className="flex-1 ml-[12vw] flex flex-col">

                {/* SECTION: HOME */}
                <section id="section-home" className="min-h-[100dvh] flex flex-row items-center py-[5vh]">
                    <div className="flex-1" />
                    <div className="w-[50vw] flex flex-col justify-center items-end text-right pr-[4vw]">
                        <div className={`text-[min(5.5vw,12vh)] leading-none font-primary font-normal tracking-tighter mix-blend-difference flex flex-col gap-[1.5vh] items-end select-none cursor-default`}>
                            {bios[bioIndex]}
                        </div>
                    </div>
                </section>

                {/* SECTION: ABOUT */}
                <section id="section-about" className="min-h-[100dvh] flex flex-row items-center py-[5vh] gap-[2vw]">
                    <div className="flex flex-col justify-center items-start h-full" style={{ flex: 4 }}>
                        <div className="flex flex-col gap-8 w-[80%]">
                            <div className={`flex flex-col w-full aspect-[1/1] rounded-2xl border ${isLightMode ? 'bg-white/10 border-black/10' : 'bg-black/5 border-white/10'} backdrop-blur-md shadow-lg overflow-hidden relative group shrink-0`}>
                                <div className="absolute inset-0"><img src="/portfolio-site/vinz-portrait.jpg" alt="Vinz Portrait" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" /></div>
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <h3 className={`text-xs uppercase tracking-[0.2em] mb-3 ${theme.subText} text-left font-primary`}>Expertise</h3>
                                <div className="flex flex-wrap gap-2 text-[0.7rem] justify-start font-content">
                                    {['Creative Ops Strategy', 'Hybrid Workflow Design', 'AIGC Pipeline Arch.', 'Art Direction', 'Brand Systems', 'Tech-Art Leadership'].map((skill, i) => (
                                        <div key={i} className={`px-2 py-1.5 rounded border ${theme.border} uppercase tracking-wider text-left bg-transparent whitespace-nowrap`}>{skill}</div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 flex items-center" style={{ flex: 6 }}>
                        <div className={`pr-6 ${theme.text} text-left font-content`}>
                            <div className="space-y-6 leading-relaxed text-[14px] text-left max-w-[40vw]">
                                <h2 className={`text-2xl font-normal font-primary mb-2 tracking-tight ${theme.highlight}`}>Hi, I'm Vinz.</h2>
                                <p>I am a Creative Operations Architect who helps Creative Teams escape production limits and maximize their impact.</p>
                                <p>With over 12 years of experience spanning roles from Art & Design Educator to Design Team Lead, I bridge the gap between traditional artistry and modern efficiency.</p>
                                <p>AI can amplify output without sacrificing quality. I am here to help your studio build "AI-Resilient" pipelines that empower your artists to use technology for control, not replacement.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION: WORK */}
                <section id="section-work" className="h-[100dvh] w-full flex flex-row py-[10vh] pl-[2vw]">
                    {/* Left: Images */}
                    <div className="flex-1 min-h-0 relative h-full overflow-visible" style={{ flex: 4 }}>
                        <div className="w-full h-full relative" id="project-lpc-target">
                            <Project
                                theme={theme}
                                colorScheme={colorScheme}
                                isLightMode={isLightMode}
                                disablePhysics={true}
                                isMobile={false}
                                onImageScroll={onImageScroll}
                                selectedProjectId={activeProjectId}
                            />
                        </div>
                    </div>
                    {/* Right: Narrative Portal */}
                    <div className="w-[30vw] flex-shrink-0 h-full flex flex-row items-center">
                        <div id="project-rpc-target" className="w-[2vw] h-full flex items-center justify-center translate-x-1" />
                        <div id="right-panel-portal" className="flex-1 h-full flex flex-col items-end" />
                    </div>
                </section>
            </div>

            {/* Scroll Indicator (Only at Home) */}
            {activePage === 'home' && (
                <div className="fixed bottom-[4vh] left-1/2 -translate-x-1/2 pointer-events-none flex items-end h-[6vh] z-20 pb-1 scroll-indicator">
                    <div className={`${theme.subText} text-[10px] uppercase tracking-widest opacity-60 animate-pulse`}>Scroll for more ↓</div>
                </div>
            )}
        </div>
    );
}
