import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Sun, Moon, Plus, Pin as PinIcon, Mail, Linkedin, Volume2, VolumeX, AudioLines } from 'lucide-react';
import gsap from 'gsap';
import { HackerText } from './TextEffects';
import Project from '../Project';

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
    bioRef, // Not used for transition, but potentially for scroll syncing if needed later
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
    imageProgress = 0, // Pass from Project via App
    onImageScroll,
    isTouch
}) {
    // --- LOCAL STATE ---
    const comp = useRef(null);
    const [bioIndex, setBioIndex] = useState(0);
    const [bioScrollData, setBioScrollData] = useState({ ratio: 0, visible: false });
    const localAboutBioRef = useRef(null);
    const touchStart = useRef(0);

    const bioPhysics = useRef({ currentY: 0, targetY: 0, velocity: 0, isDragging: false, lastY: 0, momentum: 0 });

    const handleBioScroll = (e) => {
        if (bioPhysics.current.isDragging) return;
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        const totalScrollable = scrollHeight - clientHeight;
        if (totalScrollable <= 0) {
            if (bioScrollData.visible) setBioScrollData(prev => ({ ...prev, visible: false }));
            return;
        }
        const ratio = scrollTop / totalScrollable;
        bioPhysics.current.currentY = scrollTop;
        bioPhysics.current.targetY = scrollTop;
        setBioScrollData({ ratio, visible: true });
    };

    useEffect(() => {
        if (activePage !== 'about' || !localAboutBioRef.current) return;
        const el = localAboutBioRef.current;
        const p = bioPhysics.current;
        let rafId;

        const handleTouchStart = (e) => {
            e.stopPropagation();
            p.isDragging = true;
            p.lastY = e.touches[0].clientY;
            p.momentum = 0;
        };
        const handleTouchMove = (e) => {
            e.stopPropagation();
            if (!p.isDragging) return;
            const delta = (p.lastY - e.touches[0].clientY);
            p.lastY = e.touches[0].clientY;
            p.targetY += delta * 1.5;
            p.velocity = delta * 1.5;
            const max = el.scrollHeight - el.clientHeight;
            p.targetY = Math.max(0, Math.min(p.targetY, max));
        };
        const handleTouchEnd = (e) => {
            e.stopPropagation();
            p.isDragging = false;
            p.momentum = p.velocity;
        };

        const update = () => {
            const max = el.scrollHeight - el.clientHeight;
            if (max > 0) {
                if (!p.isDragging) { p.targetY += p.momentum; p.momentum *= 0.95; }
                p.targetY = Math.max(0, Math.min(p.targetY, max));
                p.currentY += (p.targetY - p.currentY) * 0.1;
                el.scrollTop = p.currentY;
                setBioScrollData({ ratio: p.currentY / max, visible: true });
            }
            rafId = requestAnimationFrame(update);
        };

        el.addEventListener('touchstart', handleTouchStart, { passive: false });
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd);
        rafId = requestAnimationFrame(update);
        return () => {
            el.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
            cancelAnimationFrame(rafId);
        };
    }, [activePage]);

    // --- ENTRANCE ANIMATION (Specifically Timed Sequence) ---
    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 1.0 } });

            // 1. Initial States (Hidden/Offset)
            gsap.set(".hl-container", { opacity: 0 });
            gsap.set(".entry-highlight-mask", { scaleX: 0 }); // The highlight strike
            gsap.set(".hero-line", { opacity: 0 }); // Slogan
            gsap.set(".cl-container", { opacity: 0, y: 30 }); // Role
            gsap.set(".fl-container", { opacity: 0, x: -40 }); // Based (Left)
            gsap.set(".corner-ui", { opacity: 0, x: 40 }); // Icons (Right)
            gsap.set(".scroll-indicator", { opacity: 0, filter: "blur(12px)", scale: 0.95 });

            // 2. Orchestrated Sequence
            // - 0s: Highlight Strike Starts
            tl.to(".entry-highlight-mask", {
                scaleX: 1,
                duration: 0.5,
                ease: "expo.inOut",
                stagger: 0.1
            }, 0)
                // - 0.5s: Nav text appears as strike begins to clear
                .to(".hl-container", { opacity: 1, duration: 0.1 }, 0.5)
                .to(".entry-highlight-mask", {
                    scaleX: 0,
                    duration: 0.4,
                    ease: "power2.inOut",
                    transformOrigin: "right center"
                }, 0.5)

                // - 0.3s: Slogan (HackerText entry)
                .to(".hero-line", {
                    opacity: 1,
                    duration: 0.8,
                    stagger: 0.1
                }, 0.3)

                // - 0.5s: Role (Bottom in from original location)
                .to(".cl-container", {
                    opacity: 1, y: 0,
                    duration: 1.2
                }, 0.5)

                // - 0.5s: Icons and Based (Slide in from outside x-axis)
                .to(".fl-container", { opacity: 1, x: 0, duration: 1.2 }, 0.5)
                .to(".corner-ui", { opacity: 1, x: 0, duration: 1.2 }, "<")

                // SET 2: 
                // - 0.65s: Scroll for more (Remain blur in)
                .to(".scroll-indicator", {
                    opacity: 0.6,
                    filter: "blur(0px)",
                    scale: 1,
                    duration: 1.5,
                    ease: "sine.inOut"
                }, 0.65);

        }, comp);
        return () => ctx.revert();
    }, []);

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

    // Desktop Scroll Visibility Logic (v13.96)
    const isAtTop = activePage !== 'work' || imageProgress < 0.05;
    const isAtBottom = activePage === 'work' && imageProgress > 0.95;
    const shouldShowFooter = activePage !== 'work' || isAtTop || isAtBottom;

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

    const ThemeToggleButtons = () => (
        <div className="flex items-center gap-2">
            <button onClick={(e) => { e.stopPropagation(); setIsColorPinned(!isColorPinned); }} className={`group relative pl-3 py-3 pr-0 transition-all duration-300 ${isColorPinned ? 'opacity-100 scale-110' : 'opacity-50 hover:opacity-100 hover:scale-110'}`} style={{ color: isColorPinned ? colorScheme.compString : (isLightMode ? '#000' : '#fff') }} aria-label="Pin Color"><PinIcon size={22} strokeWidth={2.1} className={`transition-transform duration-300 ${isColorPinned ? "fill-current" : "group-hover:-rotate-12 group-hover:scale-110"}`} /><span className={`absolute top-1/2 right-full mr-2 -translate-y-1/2 px-2 py-1 text-[10px] uppercase tracking-wider rounded bg-black/50 text-white backdrop-blur-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}>Pin the Color</span></button>
            <button onClick={(e) => { e.stopPropagation(); setIsLightMode(!isLightMode); }} onMouseEnter={() => !isTouch && setHoveredEl('theme')} onMouseLeave={() => !isTouch && setHoveredEl(null)} className={`pl-3 py-3 pr-0 transition-all duration-300 opacity-50 hover:opacity-100 hover:scale-110 translate-x-[2px]`} style={{ color: isLightMode ? '#000' : '#fff' }} aria-label="Toggle Theme">{isLightMode ? <Moon size={24} className={hoveredEl === 'theme' ? 'animate-moon-swing' : ''} /> : <Sun size={24} className={hoveredEl === 'theme' ? 'animate-sun-spin' : ''} />}</button>
            <button onClick={(e) => { e.stopPropagation(); toggleAudio(undefined, true); }} className={`group relative pl-3 py-3 pr-0 transition-all duration-300 ${isPlaying ? 'opacity-100' : 'opacity-40 hover:opacity-100 hover:scale-110'}`} style={{ color: isPlaying ? colorScheme.compString : (isLightMode ? '#000' : '#fff') }} aria-label="Toggle Audio">
                <AudioLines size={22} strokeWidth={2.1} className={isPlaying ? "animate-pulse" : ""} />
                <span className={`absolute top-1/2 right-full mr-2 -translate-y-1/2 px-2 py-1 text-[10px] uppercase tracking-wider rounded bg-black/50 text-white backdrop-blur-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}>{isPlaying ? 'Mute' : 'Play Music'}</span>
            </button>
        </div>
    );

    // --- TOUCH SWIPE LOGIC (For tablets/touch laptops) ---
    useEffect(() => {
        if (!comp.current) return;
        const el = comp.current;
        const handleNativeTouchStart = (e) => { touchStart.current = e.touches[0].clientY; };
        const handleNativeTouchEnd = (e) => {
            // Divide Swiping Zones (v14.07)
            // 'home' page allows swiping everywhere.
            // 'work' and 'about' only allow swiping in the Left Sidebar (GLC) for page transitions.
            if (activePage !== 'home') {
                const isInsideContent = gccRef.current?.contains(e.target) || grcRef.current?.contains(e.target);
                if (isInsideContent) return;
            }

            const touchEnd = e.changedTouches[0].clientY;
            const delta = touchStart.current - touchEnd;
            if (Math.abs(delta) < 50) return;

            if (delta > 0) {
                if (activePage === 'home') handlePageChange('work');
                else if (activePage === 'work') handlePageChange('about');
                else if (activePage === 'about') handlePageChange('home');
            } else {
                if (activePage === 'home') handlePageChange('about');
                else if (activePage === 'about') handlePageChange('work');
                else if (activePage === 'work') handlePageChange('home');
            }
        };

        el.addEventListener('touchstart', handleNativeTouchStart);
        el.addEventListener('touchend', handleNativeTouchEnd);
        return () => {
            el.removeEventListener('touchstart', handleNativeTouchStart);
            el.removeEventListener('touchend', handleNativeTouchEnd);
        };
    }, [activePage]);

    return (
        <div ref={comp}
            className={`relative z-10 h-[100dvh] w-full pointer-events-auto flex items-stretch px-[4vw] py-[5vh] overflow-hidden`}>

            {/* HR: Header Right (Persistent / Non-Transitioning) */}
            <div className="absolute top-[5vh] right-[4vw] z-[100] pointer-events-auto flex justify-end corner-ui">
                <ThemeToggleButtons />
            </div>

            {/* FR: Footer Right (Persistent / Non-Transitioning) */}
            <div className="absolute bottom-[5vh] right-[4vw] z-[100] pointer-events-auto flex justify-end corner-ui">
                <FooterRight />
            </div>

            {/* GLC: Global Left Container (Fixed 15vw / v13.79 registration) */}
            <div className="w-[12vw] flex flex-col justify-between items-start h-full pointer-events-auto flex-shrink-0 border-r border-transparent relative z-30">
                {/* HL: Header Left (Nav Menu - removed Contact) */}
                <div className="hl-container pt-3 pb-[2vh] overflow-visible">
                    <nav className="flex flex-col items-start gap-4 nav-item">
                        {/* 1. About Section (Muted when on Work) */}
                        <div className="flex flex-col items-start leading-none relative">
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handlePageChange('about');
                                    // Trigger Sweep
                                    const sweep = e.currentTarget.querySelector('.nav-sweep');
                                    if (sweep) {
                                        gsap.timeline()
                                            .set(sweep, { transformOrigin: "left center", scaleX: 0, opacity: 1 })
                                            .to(sweep, { scaleX: 1, duration: 0.4, ease: "power2.inOut" })
                                            .set(sweep, { transformOrigin: "right center" })
                                            .to(sweep, { scaleX: 0, duration: 0.4, ease: "power2.inOut" });
                                    }
                                }}
                                className={`group relative tracking-[0.2em] uppercase font-primary transition-all duration-300 flex items-center gap-0 ${activePage === 'work' ? 'opacity-40 hover:opacity-100 text-base font-medium' : 'opacity-100 text-lg font-normal'}`}
                                onMouseEnter={() => !isTouch && setHoveredNav('Vinz Tan')}
                                onMouseLeave={() => !isTouch && setHoveredNav(null)}
                                style={{ color: (activePage === 'about' || activePage === 'home') ? colorScheme.base : 'inherit' }}
                            >
                                <span className="absolute inset-x-0 inset-y-[-2px] entry-highlight-mask" style={{ backgroundColor: colorScheme.compString, transformOrigin: 'left center', zIndex: 10, opacity: 1 }} />
                                <span className="transition-all ease-out" style={{ width: (hoveredNav === 'Vinz Tan' || (activePage === 'about' && hoveredNav === null)) ? '0.5cqw' : '0px', height: (hoveredNav === 'Vinz Tan' || (activePage === 'about' && hoveredNav === null)) ? '1em' : '1px', backgroundColor: colorScheme.compString, marginRight: (hoveredNav === 'Vinz Tan' || (activePage === 'about' && hoveredNav === null)) ? '8px' : '0px', opacity: (hoveredNav === 'Vinz Tan' || (activePage === 'about' && hoveredNav === null)) ? 1 : 0, transitionProperty: 'width, height, margin-right, opacity', transitionDuration: '300ms, 200ms, 300ms, 300ms', transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)', zIndex: -1 }} />
                                {/* Click Sweep Layer */}
                                <span className="nav-sweep absolute left-0 right-0 h-[1.1em] pointer-events-none opacity-0" style={{ backgroundColor: colorScheme.compString, zIndex: 5 }} />
                                <span className="relative" style={{ zIndex: 1 }}>Vinz Tan</span>
                            </a>
                        </div>

                        {/* 2. Projects Section (Highlighted when on Work) */}
                        <div className="flex flex-col items-start gap-4">
                            <button
                                onClick={(e) => {
                                    handlePageChange('work');
                                    const sweep = e.currentTarget.querySelector('.nav-sweep');
                                    if (sweep) {
                                        gsap.timeline()
                                            .set(sweep, { transformOrigin: "left center", scaleX: 0, opacity: 1 })
                                            .to(sweep, { scaleX: 1, duration: 0.4, ease: "power2.inOut" })
                                            .set(sweep, { transformOrigin: "right center" })
                                            .to(sweep, { scaleX: 0, duration: 0.4, ease: "power2.inOut" });
                                    }
                                }}
                                className={`flex items-center gap-0 tracking-[0.2em] relative uppercase transition-all duration-300 font-primary text-left ${activePage === 'work' ? 'text-lg font-normal opacity-100' : 'text-base opacity-40 font-medium hover:opacity-100 cursor-pointer'}`}
                                onMouseEnter={() => !isTouch && setHoveredNav('Projects')}
                                onMouseLeave={() => !isTouch && setHoveredNav(null)}
                                style={{ color: activePage === 'work' ? colorScheme.base : 'inherit' }}
                            >
                                <span className="absolute inset-x-0 inset-y-[-2px] entry-highlight-mask" style={{ backgroundColor: colorScheme.compString, transformOrigin: 'left center', zIndex: 10, opacity: 1 }} />
                                <span className="transition-all ease-out" style={{ width: (hoveredNav === 'Projects' || (activePage === 'work' && hoveredNav === null)) ? '0.5cqw' : '0px', height: (hoveredNav === 'Projects' || (activePage === 'work' && hoveredNav === null)) ? '1em' : '1px', backgroundColor: colorScheme.compString, marginRight: (hoveredNav === 'Projects' || (activePage === 'work' && hoveredNav === null)) ? '8px' : '0px', opacity: (hoveredNav === 'Projects' || (activePage === 'work' && hoveredNav === null)) ? 1 : 0, transitionProperty: 'width, height, margin-right, opacity', transitionDuration: '300ms, 200ms, 300ms, 300ms', transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)', zIndex: -1 }} />
                                {/* Click Sweep Layer */}
                                <span className="nav-sweep absolute left-0 right-0 h-[1.1em] pointer-events-none opacity-0" style={{ backgroundColor: colorScheme.compString, zIndex: 5 }} />
                                <span className="relative" style={{ zIndex: 1 }}>Projects</span>
                            </button>
                        </div>
                    </nav>
                </div>

                {/* CL + FL Group (Bottom Aligned) */}
                <div className="flex flex-col mt-auto">
                    {/* CL: Center Left (Role sitting on top of FL) */}
                    <div className="cl-container">
                        <div className="flex flex-col leading-tight tracking-widest font-primary cursor-pointer group overflow-hidden" style={{ fontSize: 'clamp(0.5rem, 1.4vw, 1.4rem)' }} onMouseEnter={() => !isTouch && setIsRoleHovered(true)} onMouseLeave={() => !isTouch && setIsRoleHovered(false)}>
                            {[0, 1, 2].map((offset) => {
                                const roleIndex = (currentRoleIndex + offset) % roles.length; const role = roles[roleIndex]; const isFirst = offset === 0;
                                return (
                                    <div key={`${role}-${offset}`} className={`grid transition-all duration-500 ease-out ${isFirst ? 'grid-rows-[1fr]' : (isRoleHovered ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}`}>
                                        <div className="overflow-hidden flex flex-col">
                                            {!isFirst && (<div className={`py-1 text-left transition-all duration-500 ${isRoleHovered ? 'opacity-100' : 'opacity-0'}`}><span className={`text-[0.8em] ${theme.subText}`} style={{ animation: `intermittent-spin ${3 + (roleIndex * 7 % 4)}s ease-in-out infinite`, animationDelay: `${(roleIndex * 3) % 2}s`, transformOrigin: 'center center', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '1em', height: '1em' }}><Plus size={12} strokeWidth={3} /></span></div>)}
                                            <div style={isFirst && !isRoleHovered ? { animation: 'slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards' } : {}}>
                                                {role.split(' ').map((word, i) => (
                                                    <div key={i} className={i === 0 ? "font-normal" : "font-light"}>{word}</div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* FL: Footer Left (Based/Year) */}
                    <div className="fl-container pt-[2vh]">
                        <FooterLeft />
                    </div>
                </div>
            </div>

            {/* GCC: Global Center Container (Responsive Stage) */}
            <div ref={gccRef} className={`flex flex-col min-w-0 items-start ${activePage === 'home' ? 'w-0 overflow-hidden py-0' : 'flex-1 -my-[5vh] h-[100dvh] overflow-visible'} relative z-20`}>
                {/* HC: Header Center (Optional/Hidden - Hidden for Project/About per instruction) */}
                <div className={`${activePage === 'home' ? 'h-[10vh] pb-[2vh]' : 'h-0'} flex-none`} />

                {/* PC: Perfect Center (Restricted by instruction per page) */}
                <div className={`min-h-0 min-w-0 pointer-events-auto overflow-visible ${activePage === 'work' ? 'px-0 items-center justify-start h-full' : 'flex-1 items-center justify-start'}`}>
                    {activePage === 'home' ? null : ( // Remove PC for Home
                        <>
                            {activePage === 'about' && (
                                <div className="flex w-full h-full gap-[1vw]">
                                    {/* Left-PC: Portrait & Expertise (Sophisticated Registration) */}
                                    <div className="flex flex-col justify-center items-start h-full" style={{ flex: 4 }}>
                                        <div className="flex flex-col gap-8 w-[70%]">
                                            {/* Portrait (Top) */}
                                            <div className={`flex flex-col w-full aspect-[1/1] rounded-2xl border ${isLightMode ? 'bg-white/10 border-black/10' : 'bg-black/5 border-white/10'} backdrop-blur-md shadow-lg shadow-black/5 overflow-hidden relative group shrink-0`}>
                                                <div className="absolute inset-0">
                                                    <img
                                                        src="/vinz-portrait.jpg"
                                                        alt="Vinz Portrait"
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                </div>
                                            </div>
                                            {/* Expertise list (Bottom) */}
                                            <div className="flex flex-col gap-2 w-full">
                                                <h3 className={`text-xs uppercase tracking-[0.2em] mb-3 ${theme.subText} text-left font-primary`}>Expertise</h3>
                                                <div className="flex flex-wrap gap-2 text-[0.7rem] justify-start font-content">
                                                    {['Creative Ops Strategy', 'Hybrid Workflow Design', 'AIGC Pipeline Arch.', 'Art Direction', 'Brand Systems', 'Tech-Art Leadership'].map((skill, i) => (
                                                        <div key={i} className={`px-2 py-1.5 rounded border ${theme.border} uppercase tracking-wider text-left bg-transparent whitespace-nowrap`}>
                                                            {skill}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Right-PC: Bio narrative (Left-Center aligned) */}
                                    <div className="flex-1 min-h-0 min-w-0 flex items-center pr-[2vw]" style={{ flex: 6 }}>
                                        <div
                                            ref={(el) => {
                                                localAboutBioRef.current = el;
                                            }}
                                            onScroll={handleBioScroll}
                                            id="about-bio-scroll-area"
                                            className={`w-full overflow-y-auto pr-6 scrollbar-none ${theme.text} text-left max-h-full cursor-grab select-none`}
                                            style={{
                                                msOverflowStyle: 'none',
                                                scrollbarWidth: 'none',
                                                touchAction: 'none'
                                            }}
                                            onMouseDown={(e) => {
                                                const el = localAboutBioRef.current;
                                                if (!el) return;
                                                el.style.cursor = 'grabbing';
                                                const startY = e.pageY - el.offsetTop;
                                                const scrollTop = el.scrollTop;

                                                const handleMouseMove = (moveEvent) => {
                                                    const y = moveEvent.pageY - el.offsetTop;
                                                    const walk = (y - startY) * 1.5;
                                                    el.scrollTop = scrollTop - walk;
                                                };

                                                const handleMouseUp = () => {
                                                    el.style.cursor = 'grab';
                                                    window.removeEventListener('mousemove', handleMouseMove);
                                                    window.removeEventListener('mouseup', handleMouseUp);
                                                };

                                                window.addEventListener('mousemove', handleMouseMove);
                                                window.addEventListener('mouseup', handleMouseUp);
                                            }}
                                        >
                                            <div className="space-y-6 leading-relaxed text-[13px] text-left max-w-[35vw] font-content">
                                                <h2 className={`text-xl font-normal font-primary mb-2 tracking-tight ${theme.highlight}`}>Hi, I'm Vinz.</h2>
                                                <p>I am a Creative Operations Architect who helps Creative Teams escape production limits and maximize their impact.</p>
                                                <p>With over 12 years of experience spanning roles from Art & Design Educator to Design Team Lead, I bridge the gap between traditional artistry and modern efficiency.</p>
                                                <p>Unlike generalist designers, I specialize in Hybrid Design Systems. I have successfully implemented AI-based rendering workflows that scaled asset production for illustration, visual design, and mobile game projects, proving that AI can amplify output without sacrificing quality. I am here to help your studio build "AI-Resilient" pipelines that empower your artists to use technology for control, not replacement.</p>
                                                <div className="mt-6">
                                                    <h4 className={`text-xs uppercase tracking-widest font-normal ${theme.subText} mb-4 font-primary`}>My Focus:</h4>
                                                    <ul className="space-y-4 list-none pl-0">
                                                        {[
                                                            { t: 'Empowering Artists', d: 'Training teams to use AI as a tool for control, not a replacement.' },
                                                            { t: 'Protecting Integrity', d: 'Using AI for the "base," while human taste handles the "finish."' },
                                                            { t: 'Scaling Output', d: 'Removing bottlenecks so teams can create more without burnout.' }
                                                        ].map((item, i) => (
                                                            <li key={i} className="pl-4 border-l-2" style={{ borderColor: mutedColor.replace('1)', '0.25)') }}>
                                                                <span className="font-normal block mb-1 font-primary">{item.t}</span>
                                                                <span className={`${theme.subText} text-[13px] font-content`}>{item.d}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activePage === 'work' && (
                                <div className="flex w-full h-full">
                                    {/* LPC: Images section */}
                                    <div className="flex-1 min-h-0 relative h-full overflow-visible" style={{ flex: 4 }}>
                                        <div className="w-full h-full relative" id="project-lpc-target">
                                            {/* Project images will be rendered here or PC container will host it */}
                                            <Project theme={theme} colorScheme={colorScheme} isLightMode={isLightMode} placement="lpc" onImageScroll={onImageScroll} />
                                        </div>
                                    </div>
                                    {/* RPC: Scrubber section */}
                                    <div className="w-[4vw] flex-none min-h-0 relative flex items-center justify-center h-full">
                                        <div id="project-rpc-target" className="w-full flex justify-center items-center" />
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                    {/* Footer Center Gap (Mirroring HC for screen-centering - Home Only) */}
                    <div className={`${activePage === 'home' ? 'h-[10vh] pt-[2vh]' : 'h-0'} flex-none`} />
                </div>

            </div>

            {/* CR: Center Right (Dynamic Content Staging) - Now the sole GRC target */}
            <div
                ref={grcRef}
                className={`flex flex-col h-full pointer-events-auto overflow-visible z-10 ${activePage === 'home' ? 'justify-end items-end' : 'justify-center items-end'} pt-[calc(60px+2vh)] pb-[calc(6vh+2vh)]`}
                style={{
                    width: activePage === 'home' ? 'auto' : activePage === 'about' ? '120px' : activePage === 'work' ? '18vw' : '15vw',
                    flex: activePage === 'home' ? '1' : 'none'
                }}
            >
                <div className={`w-full h-full max-h-full min-h-0 relative py-0 overflow-visible flex flex-col justify-${activePage === 'home' ? 'end' : 'center'}`}>
                    {activePage === 'home' && (
                        <div className={`text-[min(5.5vw,12vh)] leading-none font-primary font-normal tracking-tighter mix-blend-difference flex flex-col gap-[1vh] items-end text-right select-none cursor-default`}>
                            {bios[bioIndex]}
                        </div>
                    )}
                    {/* About Page: CR hosts the scrollbar for the PC-Bio area (Remote Linked) */}
                    {activePage === 'about' && (
                        <div className={`w-full flex justify-center items-center h-full transition-opacity duration-500 ${bioScrollData.visible ? 'opacity-100' : 'opacity-0'}`}>
                            <div className={`w-[2px] h-[30vh] bg-[#808080] opacity-20 rounded-full relative overflow-hidden`}>
                                <div
                                    className="absolute w-full rounded-full transition-transform duration-100 ease-out"
                                    style={{
                                        height: '25%',
                                        transform: `translateY(${bioScrollData.ratio * (100 - 25)}%)`,
                                        backgroundColor: isLightMode ? '#000' : '#fff',
                                        opacity: 0.8
                                    }}
                                />
                            </div>
                        </div>
                    )}
                    {activePage === 'work' && (
                        <div ref={detailPanelRef} id="right-panel-portal-wrapper" className="w-full relative z-50 flex flex-col justify-center h-full overflow-visible">
                            <div id="right-panel-portal" className="w-full h-full" />
                        </div>
                    )}
                </div>
            </div>

            {/* FC Overlay: Viewport Centered Scroll Indicator (Home only) */}
            {activePage === 'home' && (
                <div className="absolute bottom-[4vh] left-1/2 -translate-x-1/2 pointer-events-none flex items-end h-[6vh] z-20 pb-1 scroll-indicator">
                    <div className={`${theme.subText} text-[10px] uppercase tracking-widest opacity-60 animate-pulse`}>Scroll for more ↓</div>
                </div>
            )}
        </div>
    );
}
