import { Sun, Moon, Menu, X, ArrowUpRight, Linkedin, Mail, GripVertical, Pin as PinIcon, Volume2, VolumeX, Pause, Play, Download, AudioLines, Plus } from 'lucide-react';
import { HackerText } from './TextEffects';
import Project from '../Project';
import { useRef, useState, useEffect, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ==========================================
// SECTION 1: MARQUEE COMPONENT
// ==========================================
// Hybrid Marquee Component for Manual + Auto Scroll (v13.90)
const MarqueeRow = ({ items, reverse = false, theme, isLightMode }) => {
    const containerRef = useRef(null);
    const contentRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    // Refs for physics state
    const state = useRef({
        x: 0,           // Current visual position (pixels)
        speed: reverse ? -0.5 : 0.5, // Base auto-scroll speed
        targetSpeed: reverse ? -0.5 : 0.5,
        lastX: 0,       // For drag delta
        dragVelocity: 0,
        contentWidth: 0
    });

    useEffect(() => {
        const container = containerRef.current;
        const content = contentRef.current;
        if (!container || !content) return;

        // Measure content width (single set)
        // We have 4 sets rendered. Real width of one set = total / 4
        // Logic: The loop resets when we travel 1 set's width.
        const measure = () => {
            // We use 4 sets. 
            state.current.contentWidth = content.scrollWidth / 4;
        };
        measure();
        // Recalculate on resize
        window.addEventListener('resize', measure);

        // --- ANIMATION LOOP ---
        let rafId;
        const loop = () => {
            const s = state.current;

            if (isDragging) {
                // While dragging, x is updated by touchmove events directly
                // We just track velocity here for release inertia
            } else {
                // Apply velocity/speed
                // Decay drag velocity back to target speed
                s.speed += (s.targetSpeed - s.speed) * 0.05;
                s.x -= s.speed;
            }

            // --- INFINITY LOGIC ---
            // If x moves past -contentWidth (scrolled one full set left), snap back to 0
            // If x moves past 0 (scrolled right), snap to -contentWidth
            // We use standard modulo logic, but adjusted for negative numbers
            if (s.contentWidth > 0) {
                const wrap = s.contentWidth;
                // standard wrap: ((x % w) + w) % w  mapped to 0..-w
                // If we move LEFT (negative X), we want to wrap when < -wrap
                // We want x to stay between 0 and -wrap

                // Normalize X to positive range for modulo
                // Then flip back to negative
                // s.x = - ((-s.x) % wrap); -- simple version

                // Robust version:
                if (s.x <= -wrap) s.x += wrap;
                if (s.x > 0) s.x -= wrap;
            }

            // Apply transform
            // render 3d for acceleration
            content.style.transform = `translate3d(${s.x}px, 0, 0)`;
            rafId = requestAnimationFrame(loop);
        };
        rafId = requestAnimationFrame(loop);

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener('resize', measure);
        };
    }, [isDragging, items, reverse]);


    // --- TOUCH HANDLERS ---
    const handleTouchStart = (e) => {
        setIsDragging(true);
        state.current.lastX = e.touches[0].clientX;
        state.current.dragVelocity = 0;
        // Pause auto-scroll visually by setting speed to 0 for decay logic,
        // but we override speed directly during drag anyway.
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;
        const clientX = e.touches[0].clientX;
        const delta = state.current.lastX - clientX; // Move left = positive delta
        state.current.lastX = clientX;

        // Update Position Directly 
        state.current.x -= delta;

        // Update velocity for throw (inverted because drag left = negative x movement)
        state.current.speed = delta;
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        // On release, state.current.speed is already set to the last drag delta.
        // The loop will automatically decay it back to state.current.targetSpeed
    };

    return (
        <div
            ref={containerRef}
            className="w-full py-2 overflow-hidden select-none touch-pan-y"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div
                ref={contentRef}
                className="flex gap-4 whitespace-nowrap w-fit"
                style={{ willChange: 'transform' }}
            >
                {/* 4 sets: A, B, C, D. 
                    We loop over width of A. 
                    If we go left past A, we see B. We snap X back to 0 (start of A). 
                    If we go right past A start, we see D (wrapped). We snap X to end of A. 
                */}
                {[...items, ...items, ...items, ...items].map((skill, j) => (
                    <div key={j}
                        className={`px-6 py-3 rounded-full border ${theme.border} text-center uppercase tracking-[0.15em] text-[10px] shadow-lg whitespace-nowrap font-primary flex-shrink-0 transition-colors duration-500`}
                        style={{
                            backdropFilter: 'blur(5.6px) saturate(1.5)',
                            WebkitBackdropFilter: 'blur(5.6px) saturate(1.5)',
                            backgroundColor: isLightMode ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)',
                        }}
                    >
                        {skill}
                    </div>
                ))}
            </div>
        </div>
    );
};

// ==========================================
// SECTION 2: PORTRAIT MOBILE LAYOUT (MAIN)
// ==========================================
export default function PortraitMobileLayout({
    activePage,
    handlePageChange,
    isLightMode,
    setIsLightMode,
    theme,
    colorScheme,
    nameColor,
    roles,
    currentRoleIndex,
    isRoleHovered,
    setIsRoleHovered,
    isColorPinned,
    setIsColorPinned,
    mutedColor,
    isMobile,
    isPlaying,
    toggleAudio
}) {
    const comp = useRef(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [bioIndex, setBioIndex] = useState(0);
    const [isRoleExpanded, setIsRoleExpanded] = useState(false);
    const [isNearPortrait, setIsNearPortrait] = useState(false);

    // --- ENTRANCE ANIMATION (Specifically Timed Sequence) ---
    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 1.0 } });

            // 1. Initial States (Hidden/Offset)
            gsap.set(".hl-container", { opacity: 0 });
            gsap.set(".entry-highlight-mask", { scaleX: 0 }); // The highlight strike
            gsap.set(".mobile-hero-line", { opacity: 0 }); // Slogan
            gsap.set(".mobile-role-box", { opacity: 0, y: 30 }); // Role
            gsap.set(".mobile-footer-item-left", { opacity: 0, x: -40 });
            gsap.set(".mobile-footer-item-right", { opacity: 0, x: 40, filter: "blur(12px)", scale: 0.95 });
            gsap.set("#mobile-menu-pill", { opacity: 0, x: 100, scale: 0.8 });

            // 2. Orchestrated Sequence
            // - 0s: Highlight Starts
            tl.to(".entry-highlight-mask", {
                scaleX: 1,
                duration: 0.5,
                ease: "expo.inOut",
                stagger: 0.1
            }, 0)
                // - 0.5s: Nav appears as highlight clears
                .to(".hl-container", { opacity: 1, duration: 0.1 }, 0.5)
                .to(".entry-highlight-mask", {
                    scaleX: 0,
                    duration: 0.4,
                    ease: "power2.inOut",
                    transformOrigin: "right center"
                }, 0.5)

                // - 0.3s: Slogan (HackerText entry)
                .to(".mobile-hero-line", {
                    opacity: 1,
                    duration: 0.8,
                    stagger: 0.1
                }, 0.3)

                // - 0.5s: Role & Outside elements
                .to(".mobile-role-box", { opacity: 1, y: 0, duration: 1.2 }, 0.5)
                .to(".mobile-footer-item-left", { opacity: 1, x: 0, duration: 1.2, clearProps: "all" }, 0.5)
                .to(".mobile-footer-item-right", {
                    opacity: 1,
                    x: 0,
                    duration: 1.2,
                    clearProps: "all"
                }, "<")
                .to("#mobile-menu-pill", { opacity: 1, x: 0, scale: 1, duration: 1.2 }, "<")

            // - 0.65s: Scroll for more (now part of right footer)
            // Removed: .to(".mobile-scroll-indicator", {
            //     opacity: 1,
            //     filter: "blur(0px)",
            //     scale: 1,
            //     duration: 1.5,
            //     ease: "sine.inOut",
            //     clearProps: "all"
            // }, 0.65);

        }, comp);
        return () => ctx.revert();
    }, []);

    // Magnetic Dock State (v13.13)
    const [isBottomDocked, setIsBottomDocked] = useState(false);
    // Scroll End State (v13.20)
    const [isAtBottom, setIsAtBottom] = useState(false);
    const [isAtTop, setIsAtTop] = useState(true);

    // Sync expanded state to global "hover" state to pause timer
    useEffect(() => {
        if (setIsRoleHovered) setIsRoleHovered(isRoleExpanded);
    }, [isRoleExpanded, setIsRoleHovered]);


    // Initial Center Coord: Aligned to 18px side (20-2) and 30px top
    // 55px pill -> Top Y at 30 => Center Y = 30 + 27.5 = 57.5
    // 55px grip side -> Right X at 18 => Center X = window.innerWidth - 18 - 27.5 = window.innerWidth - 45.5
    const [menuCoord, setMenuCoord] = useState(() => ({
        x: typeof window !== 'undefined' ? window.innerWidth - 39.5 : 300,
        y: 57.5
    }));


    // Pin Tooltip State (v12.93)
    const [tooltip, setTooltip] = useState({ show: false, text: '' });
    const tooltipTimeout = useRef(null);

    const handlePinClick = () => {
        const nextState = !isColorPinned;
        setIsColorPinned(nextState);
        setTooltip({ show: true, text: nextState ? 'Color Pinned' : 'Color Released' });
        if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
        tooltipTimeout.current = setTimeout(() => setTooltip(prev => ({ ...prev, show: false })), 2000);
    };



    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0, coordX: 0, coordY: 0 });
    const pillRef = useRef(null);


    // Precise Quadrant & Overlap Logic (v12.86)
    // - Release at 50% center is treated as 'left'
    const menuSide = (typeof window !== 'undefined' && menuCoord.x > window.innerWidth / 2) ? 'right' : 'left';
    const menuVertical = (typeof window !== 'undefined' && menuCoord.y > window.innerHeight / 2 - 100) ? 'bottom' : 'top';

    const [overlap, setOverlap] = useState({ topLeft: false, topRight: false, bottomLeft: false, bottomRight: false });

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;

        // Pill Bounding Box (v12.89 refined estimates)
        const pillW = isDragging ? 66 : 160;
        const pillH = isDragging ? 66 : 55;
        let pL, pR, pT, pB;

        pT = menuCoord.y - (isDragging ? 33 : 27.5);
        pB = menuCoord.y + (isDragging ? 33 : 27.5);

        if (menuSide === 'left') {
            pL = menuCoord.x - (isDragging ? 33 : 27.5);
            pR = pL + pillW;
        } else {
            pR = menuCoord.x + (isDragging ? 33 : 27.5);
            pL = pR - pillW;
        }

        // Detect overlaps with specific corner bounds (Synced to 20px grid)
        setOverlap({
            topLeft: (pL < 140 && pT < 80),
            topRight: (pR > screenW - 60 && pT < 80),
            bottomLeft: (pL < 160 && pB > screenH - 60),
            bottomRight: (pR > screenW - 100 && pB > screenH - 60)
        });

    }, [menuCoord, isDragging, menuSide]);

    // Ultra-Responsive Drag Effect (v12.91)
    useEffect(() => {
        if (!isDragging) return;

        const handleMove = (e) => {
            const touch = e.touches[0];
            const dx = touch.clientX - dragStartRef.current.x;
            const dy = touch.clientY - dragStartRef.current.y;

            let nextX = dragStartRef.current.coordX + dx;
            let nextY = dragStartRef.current.coordY + dy;

            // CLAMP ONLY (v13.16 - Free Drag within Grid)
            const PAD_X = 24; // Standard Grid (v13.16)
            const PAD_TOP = 30; // Standard Top
            const PAD_BOTTOM = 20; // Standard Bottom
            const screenW = window.innerWidth;
            const screenH = window.innerHeight;

            const hW = (isDragging ? 33 : 27.5);

            // Strict Viewport Clamping (Respecting Standard Grid as boundaries)
            // Left/Right: 24px buffer
            // Top: 30px buffer
            // Bottom: 20px buffer
            const clampedX = Math.max(PAD_X + hW, Math.min(screenW - PAD_X - hW, nextX));
            const clampedY = Math.max(PAD_TOP + hW, Math.min(screenH - PAD_BOTTOM - hW, nextY));

            setMenuCoord({ x: clampedX, y: clampedY });
        };



        const handleEnd = () => {
            setIsDragging(false);

            // Snap Logic on Release (v13.16)
            // "Always stick to top left or top right"
            const PAD_X = 24;
            const PAD_TOP = 30;
            const hW = 27.5;
            const screenW = window.innerWidth;

            // Get current X (visual center)
            const currentX = (dragStartRef.current && dragStartRef.current.coordX !== undefined)
                ? menuCoord.x // Approximate since we lacked latestX
                : menuCoord.x;

            // Determine Side (Left or Right)
            let destX;
            if (currentX < screenW / 2) {
                // Snap Left
                destX = PAD_X + hW;
            } else {
                // Snap Right
                destX = screenW - PAD_X - hW;
            }

            // Always Top
            const destY = PAD_TOP + hW;

            setMenuCoord({ x: destX, y: destY });
            setIsBottomDocked(false); // Reset bottom dock if we were somehow there

            // Cleanup Logic
            if (dragStartRef.current) dragStartRef.current.latestY = undefined;
        };



        window.addEventListener('touchmove', handleMove, { passive: false });
        window.addEventListener('touchend', handleEnd);
        return () => {
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleEnd);
        };
    }, [isDragging, menuSide]);

    // Detect Scroll End (v14.05)
    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const screenH = window.innerHeight;
            const docH = document.body.offsetHeight;

            // Sensitive Top/Bottom detects
            const atTop = scrollY < 5;
            const atBottom = scrollY + screenH >= docH - 40;

            setIsAtTop(atTop);
            setIsAtBottom(atBottom);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);


    // Refs for scrolling
    const scrollRef = useRef(null);
    const homeRef = useRef(null);
    const aboutRef = useRef(null);
    const workRef = useRef(null);

    // Fixed menu state
    // (Dragging logic removed)

    // Bio rotation
    useEffect(() => {
        const interval = setInterval(() => {
            setBioIndex(prev => (prev + 1) % 2);
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    // Scroll Spy (Trigger active state on scroll)
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (entry.target === homeRef.current) handlePageChange('home');
                    if (entry.target === aboutRef.current) handlePageChange('about');
                    if (entry.target === workRef.current) handlePageChange('work');
                }
            });
        }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
        if (homeRef.current) observer.observe(homeRef.current);
        if (aboutRef.current) observer.observe(aboutRef.current);
        if (workRef.current) observer.observe(workRef.current);
        return () => observer.disconnect();
    }, [handlePageChange]);

    const scrollTo = (ref) => {
        if (ref.current) {
            ref.current.scrollIntoView({ behavior: 'smooth' });
            setIsMenuOpen(false);
        }
    };

    const bios = [
        <div className="flex flex-col gap-2 w-full">
            <div className="flex flex-wrap justify-end gap-2 mobile-hero-line"><span className={theme.highlight}><HackerText text="EMPOWERING" /></span></div>
            <div className="flex flex-wrap justify-end gap-2 mobile-hero-line"><span className="opacity-40"><HackerText text="Creative" /></span><span className={theme.highlight}><HackerText text="TEAMS" /></span><span className="opacity-40"><HackerText text="to" /></span></div>
            <div className="flex flex-wrap justify-end gap-2 mobile-hero-line"><span className={theme.highlight}><HackerText text="SCALE" /></span><span className={theme.highlight}><HackerText text="PRODUCTION" /></span></div>
            <div className="flex flex-wrap justify-end gap-2 mobile-hero-line"><span className="opacity-40"><HackerText text="without" /></span><span className="opacity-40"><HackerText text="compromising" /></span></div>
            <div className="flex flex-wrap justify-end gap-2 mobile-hero-line"><span className={theme.highlight}><HackerText text="INTEGRITY" /></span></div>
        </div>,

        <div className="flex flex-col gap-2 w-full">
            <div className="flex flex-wrap justify-end gap-2 mobile-hero-line"><span className={theme.highlight}><HackerText text="AI" /></span><span className="opacity-40"><HackerText text="didn't" /></span></div>
            <div className="flex flex-wrap justify-end gap-2 mobile-hero-line"><span className="opacity-40"><HackerText text="kill" /></span><span className={theme.highlight}><HackerText text="DESIGN" /></span><span className="opacity-40">;</span><span className="opacity-40"><HackerText text="it" /></span></div>
            <div className="flex flex-wrap justify-end gap-2 mobile-hero-line"><span className={theme.highlight}><HackerText text="is" /></span><span className={theme.highlight}><HackerText text="PART" /></span><span className={theme.highlight}><HackerText text="of" /></span></div>
            <div className="flex flex-wrap justify-end gap-2 mobile-hero-line"><span className="opacity-40"><HackerText text="the" /></span><span className={theme.highlight}><HackerText text="FUTURE" /></span></div>
            <div className="flex flex-wrap justify-end gap-2 mobile-hero-line"><span className={theme.highlight}><HackerText text="DESIGN" /></span></div>
        </div>
    ];


    const menuBg = isLightMode ? 'bg-white/80' : 'bg-black/20';
    const menuBorder = isLightMode ? 'border-black/10' : 'border-white/10';
    const menuIcon = isLightMode ? 'text-black' : 'text-white';
    const overlayBg = isLightMode ? 'bg-white/95' : 'bg-black/95';
    const overlayText = isLightMode ? 'text-black' : 'text-white';

    // Visibility Logic (v14.01)
    // Only show at the very top or very bottom.
    const shouldShowFooter = isAtTop || isAtBottom;

    // Force correct nav state at bottom of page
    useEffect(() => {
        if (isAtBottom) handlePageChange('work');
    }, [isAtBottom, handlePageChange]);

    const handleNavClick = (page) => {
        handlePageChange(page);
        if (page === 'about') scrollTo(aboutRef);
        if (page === 'work') scrollTo(workRef);
    };

    return (
        // NATURAL SCROLL CONTAINER (No mask for performance)
        <div ref={comp} className={`relative w-full z-40 ${theme.text}`} onClick={() => setIsRoleExpanded(false)}>

            {/* CONTENT WRAPPER */}
            <div className="w-full flex flex-col">
                {/* ==========================================
                    SECTION 3: HOME SECTION (Hero/Role)
                    ========================================== */}
                <section ref={homeRef} id="home" className="w-full min-h-[100dvh] px-6 relative flex flex-col pt-24">
                    {/* ... content truncated ... */}
                    {/* Hero Text ... */}
                    <div className="flex flex-col justify-center items-end text-right py-12 z-10 h-[60vh]">
                        <div className="text-[8.5vw] font-normal leading-none tracking-tighter mix-blend-difference font-primary">
                            {bios[bioIndex]}
                        </div>
                    </div>
                    {/* ... content truncated ... */}
                    {/* Role ... */}
                    <div
                        className={`absolute bottom-[15%] left-[24px] z-20 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${theme.text} pointer-events-auto mobile-role-box`}
                        style={{ width: '40vw' }}
                    >
                        {/* ... content truncated ... */}
                        <div
                            className="flex flex-col justify-end items-start text-left cursor-pointer overflow-visible gap-0 pointer-events-auto w-full"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsRoleExpanded(!isRoleExpanded);
                            }}
                            role="button"
                            aria-expanded={isRoleExpanded}
                            aria-label="Toggle role list"
                        >
                            {[2, 1, 0].map((offset) => {
                                const roleIndex = (currentRoleIndex + offset) % roles.length;
                                const role = roles[roleIndex];
                                const isFirst = offset === 0;
                                const showPlus = offset < 2 && isRoleExpanded;

                                return (
                                    <div key={`${role}-${offset}`} className={`grid transition-all duration-500 ease-out 
                                        ${isFirst ? 'grid-rows-[1fr]' : (isRoleExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}`}>
                                        <div className="overflow-hidden flex flex-col items-start origin-bottom-left pt-0">
                                            {showPlus && (
                                                <div className="w-full flex justify-start py-2 opacity-100 transition-all duration-500">
                                                    <span className={`text-[0.8em] ${theme.subText}`} style={{
                                                        animation: `intermittent-spin ${3 + (roleIndex * 7 % 4)}s ease-in-out infinite`,
                                                        animationDelay: `${(roleIndex * 3) % 2}s`,
                                                        transformOrigin: 'center center',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        width: '1em', height: '1em'
                                                    }}>
                                                        <Plus size={12} strokeWidth={3} />
                                                    </span>
                                                </div>
                                            )}
                                            <div className="w-full">
                                                <h2 className="text-sm uppercase tracking-[0.15em] font-medium leading-[1.4] break-words font-primary w-full">
                                                    {role.split(' ').map((word, i) => (
                                                        <span key={i} className={i === 0 ? 'font-normal block text-base' : `${isLightMode ? 'opacity-50' : 'opacity-40'} block`}>{word}</span>
                                                    ))}
                                                </h2>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </section>



                {/* ==========================================
                    SECTION 4: ABOUT SECTION (Portrait/Bio)
                    ========================================== */}
                <section ref={aboutRef} id="about" className="w-full flex flex-col pt-20 relative overflow-hidden scroll-mt-28">
                    <div className={`w-full h-[65vh] relative overflow-hidden`}>
                        <img
                            src="/vinz-portrait.jpg"
                            alt="Vinz Portrait"
                            className="w-full h-full object-cover transition-all duration-1000"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute bottom-12 left-6 right-6">
                            <h3 className="text-6xl font-normal tracking-tighter leading-none text-white drop-shadow-2xl">
                                Hi, I'm Vinz.
                            </h3>
                        </div>
                    </div>

                    <div className="relative z-10 py-4 flex flex-col gap-2 -mt-10 overflow-hidden touch-pan-y">
                        <MarqueeRow
                            items={['Creative Ops Strategy', 'Hybrid Workflow Design', 'AIGC Pipeline Arch.']}
                            theme={theme}
                            isLightMode={isLightMode}
                        />
                        <MarqueeRow
                            items={['Art Direction', 'Brand Systems', 'Tech-Art Leadership']}
                            reverse={true}
                            theme={theme}
                            isLightMode={isLightMode}
                        />
                    </div>

                    <div className={`px-6 pt-6 pb-10 space-y-6 font-content text-[15px] leading-relaxed ${theme.subText} text-justify opacity-60`}>
                        <p>I am a Creative Operations Architect who helps Creative Teams escape production limits and maximize their impact.</p>
                        <p>With over 12 years of experience spanning roles from Art & Design Educator to Design Team Lead, I bridge the gap between traditional artistry and modern efficiency.</p>
                        <p>Unlike generalist designers, I specialize in Hybrid Design Systems. I have successfully implemented AI-based rendering workflows that scaled asset production for illustration, visual design, and mobile game projects, proving that AI can amplify output without sacrificing quality. I am here to help your studio build "AI-Resilient" pipelines that empower your artists to use technology for control, not replacement.</p>

                        <div className="mt-8 pt-8 border-t border-white/10">
                            <h4 className={`text-[10px] uppercase tracking-[0.3em] font-normal ${theme.subText} mb-6 font-primary opacity-60`}>Strategic Focus:</h4>
                            <div className="grid grid-cols-1 gap-12">
                                <div className="flex flex-col gap-2">
                                    <span className="text-lg font-semibold font-primary leading-none" style={{ color: colorScheme.base }}>Empowering Artists</span>
                                    <span className={`${theme.subText} text-[15px] font-content opacity-60 leading-relaxed text-justify`}>Training teams to use AI as a tool for control, not a replacement.</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className="text-lg font-semibold font-primary leading-none" style={{ color: colorScheme.base }}>Protecting Integrity</span>
                                    <span className={`${theme.subText} text-[15px] font-content opacity-60 leading-relaxed text-justify`}>Using AI for the "base," while human taste handles the "finish."</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className="text-lg font-semibold font-primary leading-none" style={{ color: colorScheme.base }}>Scaling Output</span>
                                    <span className={`${theme.subText} text-[15px] font-content opacity-60 leading-relaxed text-justify`}>Removing bottlenecks so teams can create more without burnout.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ==========================================
                    SECTION 5: WORK SECTION (Projects)
                    ========================================== */}
                <section ref={workRef} id="work" className="w-full flex flex-col pt-20 pb-20 gap-4 relative scroll-mt-28">

                    <div className="w-full h-auto relative">
                        <Project
                            theme={theme}
                            colorScheme={colorScheme}
                            isLightMode={isLightMode}
                            isMobile={isMobile}
                        />
                    </div>
                </section>

                {/* END */}
                <div className="pb-24 pt-4 flex items-end justify-center">
                </div>
            </div>

            {/* ATMOSPHERE - Noise Canvas Hidden */}
            <div className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-1000" style={{
                opacity: 1,
                maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)'
            }}>
                {/* Noise filter removed for clarity */}
            </div>


            {/* ATMOSPHERE - Refined Gradient Blur Stack (v13.19) */}
            {/* Layer 1: Base Blur (5px) */}
            <div className="fixed top-0 left-0 right-0 z-30 pointer-events-none h-[22.5vh]"
                style={{
                    backdropFilter: 'blur(5px)',
                    WebkitBackdropFilter: 'blur(5px)',
                    transform: 'translate3d(0,0,0)',
                    WebkitTransform: 'translate3d(0,0,0)',
                    opacity: 0.95,
                    background: isLightMode
                        ? 'linear-gradient(to bottom, rgba(255,255,255,0.15) 0%, transparent 100%)'
                        : 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 100%)',
                    maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)'
                }}
            />
            {/* Layer 2: Boost Blur (+5px at Top = 10px Total) */}
            <div className="fixed top-0 left-0 right-0 z-30 pointer-events-none h-[22.5vh]"
                style={{
                    backdropFilter: 'blur(5px)',
                    WebkitBackdropFilter: 'blur(5px)',
                    transform: 'translate3d(0,0,0)',
                    WebkitTransform: 'translate3d(0,0,0)',
                    opacity: 1,
                    background: 'transparent',
                    maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)'
                }}
            />


            {/* ==========================================
                SECTION 6: FIXED UI ELEMENTS (Nav/Pill/Footer)
                ========================================== */}
            {/* --- FIXED UI ELEMENTS (Above atmosphere) --- */}

            {/* Top UI: Desktop-style Nav - Moves ONLY on overlap */}
            <div className={`fixed z-40 flex flex-col items-start justify-start ${theme.text} transition-all duration-500 ${isMenuOpen ? 'opacity-0' : 'opacity-100'} 
                ${overlap.topLeft ? 'top-[30px] right-[24px] items-end text-right' : 'top-[30px] left-[24px] items-start text-left'}`}
                style={{ pointerEvents: isMenuOpen ? 'none' : 'auto' }}>

                <button onClick={() => handleNavClick('about')} className={`flex items-center group transition-all relative ${overlap.topLeft ? 'flex-row-reverse' : ''}`}>
                    <span className="absolute inset-x-[-4px] inset-y-[-2px] entry-highlight-mask" style={{ backgroundColor: colorScheme.compString, transformOrigin: 'left center', zIndex: 10, opacity: 1 }} />

                    {/* Active Color Bar - Relative push logic like DV */}
                    <span className={`transition-all ease-out`} style={{
                        width: activePage === 'about' ? '4px' : '0px',
                        height: activePage === 'about' ? '1em' : '1px',
                        backgroundColor: colorScheme.compString,
                        marginRight: activePage === 'about' ? (overlap.topLeft ? '0px' : '8px') : '0px',
                        marginLeft: activePage === 'about' ? (overlap.topLeft ? '8px' : '0px') : '0px',
                        opacity: activePage === 'about' ? 1 : 0,
                        transitionProperty: 'width, height, margin, opacity',
                        transitionDuration: '300ms, 200ms, 300ms, 300ms',
                        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                        zIndex: -1
                    }} />

                    <span className={`tracking-[0.2em] relative uppercase transition-all duration-300 font-primary hl-container ${(activePage === 'about' || activePage === 'home') ? 'text-lg font-normal opacity-100' : 'text-base opacity-40 font-medium'}`}
                        style={{ color: (activePage === 'about' || activePage === 'home') ? nameColor : 'inherit', zIndex: 1 }}>
                        Vinz Tan
                    </span>
                </button>


                <button onClick={() => handleNavClick('work')} className={`flex items-center group py-3 transition-all relative ${overlap.topLeft ? 'flex-row-reverse' : ''}`}>
                    <span className="absolute inset-x-[-4px] inset-y-[-2px] entry-highlight-mask" style={{ backgroundColor: colorScheme.compString, transformOrigin: 'left center', zIndex: 10, opacity: 1 }} />

                    {/* Active Color Bar - Relative push logic like DV */}
                    <span className={`transition-all ease-out`} style={{
                        width: activePage === 'work' ? '4px' : '0px',
                        height: activePage === 'work' ? '1em' : '1px',
                        backgroundColor: colorScheme.compString,
                        marginRight: activePage === 'work' ? (overlap.topLeft ? '0px' : '8px') : '0px',
                        marginLeft: activePage === 'work' ? (overlap.topLeft ? '8px' : '0px') : '0px',
                        opacity: activePage === 'work' ? 1 : 0,
                        transitionProperty: 'width, height, margin, opacity',
                        transitionDuration: '300ms, 200ms, 300ms, 300ms',
                        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                        zIndex: -1
                    }} />

                    <span className={`tracking-[0.2em] relative uppercase transition-all duration-300 font-primary hl-container ${activePage === 'work' ? 'text-lg font-normal opacity-100' : 'text-base opacity-40 font-medium'}`}
                        style={{
                            color: activePage === 'work' ? colorScheme.base : 'inherit',
                            zIndex: 1
                        }}>
                        Projects
                    </span>
                </button>


            </div>

            {/* Top Right: Floating Pill Menu (Draggable Anchor-Stable) */}
            <div
                id="mobile-menu-pill"
                className={`fixed z-50 touch-none flex flex-col items-center justify-center pointer-events-auto`}
                style={{
                    top: (isBottomDocked && !isDragging) ? 'auto' : menuCoord.y - (isDragging ? 33 : 27.5),
                    bottom: (isBottomDocked && !isDragging) ? '20px' : 'auto',
                    ...(menuSide === 'left' ? { left: menuCoord.x - (isDragging ? 33 : 27.5) } : { right: (typeof window !== 'undefined' ? window.innerWidth : 400) - menuCoord.x - (isDragging ? 33 : 27.5) }),
                    width: isDragging ? '66px' : 'max-content',
                    minWidth: isDragging ? '66px' : '55px',

                    height: isDragging ? '66px' : '55px',
                    transition: isDragging ? 'none' : 'all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
                }}
            >
                {/* TOOLTIP (v12.97 Minimalist & Tight Contextual) */}
                <div className={`absolute transition-all duration-300 pointer-events-none whitespace-nowrap
                    ${menuVertical === 'top' ? 'top-[57px]' : 'bottom-[57px]'}
                    ${tooltip.show ? 'opacity-100' : 'opacity-0 scale-95'}`}>
                    <span className={`text-[10px] font-bold uppercase tracking-[0.2em] font-primary transition-colors drop-shadow-sm ${theme.text}`}>{tooltip.text}</span>
                </div>




                <div
                    ref={pillRef}
                    className={`flex items-center rounded-full border shadow-lg overflow-hidden transition-all duration-500 ${theme.border}`}
                    style={{
                        backdropFilter: 'blur(5.6px) saturate(1.5)',
                        WebkitBackdropFilter: 'blur(5.6px) saturate(1.5)',
                        backgroundColor: isLightMode ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)',
                        width: '100%',
                        height: '100%',
                        justifyContent: 'center',
                        padding: '0 12px'
                    }}

                >
                    <div className={menuSide === 'left' ? 'flex flex-row-reverse items-center gap-[5px]' : 'flex flex-row items-center gap-[5px]'}>
                        {/* 4. Pin */}
                        <button onClick={handlePinClick} className={`p-1.5 rounded-full transition-all active:scale-90 ${isColorPinned ? 'opacity-100' : 'opacity-50'}`} style={{ color: isColorPinned ? colorScheme.compString : (isLightMode ? '#000' : '#fff') }}>
                            <PinIcon size={20} className={isColorPinned ? 'fill-current' : ''} />
                        </button>

                        {/* 3. Theme */}
                        <button onClick={() => setIsLightMode(!isLightMode)} className={`p-1.5 rounded-full transition-all active:scale-90 ${isLightMode ? 'hover:bg-black/5 text-black' : 'hover:bg-white/10 text-white'}`}>
                            {isLightMode ? <Moon size={20} /> : <Sun size={20} />}
                        </button>

                        {/* 2. Music */}
                        <button onClick={() => toggleAudio(undefined, true)} className={`p-1.5 rounded-full transition-all active:scale-90 ${isLightMode ? 'hover:bg-black/5' : 'hover:bg-white/10'} ${isPlaying ? 'opacity-100' : 'opacity-40'}`} style={{ color: isPlaying ? colorScheme.compString : (isLightMode ? '#000' : '#fff') }}>
                            <AudioLines size={20} className={isPlaying ? "animate-pulse" : ""} />
                        </button>

                        {/* 1. Menu */}
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`p-1.5 rounded-full transition-all active:scale-90 ${isLightMode ? 'hover:bg-black/5 text-black' : 'hover:bg-white/10 text-white'}`}>
                            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>

                        {/* 0. Drag (Outer edge) */}
                        <div className={`overflow-hidden transition-all duration-500 ease-in-out flex items-center ${isMenuOpen ? 'w-[36px] opacity-100' : 'w-0 opacity-0'} ${isMenuOpen && menuSide === 'left' ? 'mr-0' : ''} ${isMenuOpen && menuSide === 'right' ? 'ml-0' : ''}`}
                            onTouchStart={(e) => {
                                setIsDragging(true);
                                let currentY = menuCoord.y;
                                if (isBottomDocked) {
                                    const PAD_BOTTOM = 20;
                                    const hW = 27.5;
                                    currentY = window.innerHeight - PAD_BOTTOM - hW;
                                    setMenuCoord(prev => ({ ...prev, y: currentY }));
                                    setIsBottomDocked(false);
                                }
                                const touch = e.touches[0];
                                dragStartRef.current = { x: touch.clientX, y: touch.clientY, coordX: menuCoord.x, coordY: currentY };
                            }}>
                            <div className={`p-1.5 rounded-full flex-shrink-0 ${isLightMode ? 'text-black' : 'text-white'}`}>
                                <GripVertical size={isDragging ? 28 : 18} />
                            </div>
                        </div>
                    </div>
                </div>

            </div>



            {/* CLEAN FOOTER TEXT - Anti-crash positioning */}
            <div className={`fixed z-40 pointer-events-none transition-opacity duration-500 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}>

                {/* Based in Malaysia */}
                <div className={`fixed transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${theme.text} text-[10px] uppercase tracking-widest font-primary flex flex-col justify-center h-[40px] mobile-footer-item-left
                    ${overlap.bottomLeft || overlap.bottomRight ? 'top-[30px] right-[24px] text-right items-end' : 'bottom-[20px] left-[24px] text-left items-start'}
                    ${shouldShowFooter ? 'translate-x-0 opacity-100' : (overlap.bottomLeft || overlap.bottomRight ? 'translate-x-[120%] opacity-0' : '-translate-x-[120%] opacity-0')}`}>
                    <div className={isLightMode ? 'opacity-70' : 'opacity-50'}>Based in Malaysia</div>
                    <div className={isLightMode ? 'opacity-40' : 'opacity-30'}>© 2026</div>
                </div>



                {/* Scroll/Social Indicator - Always slide out to RIGHT */}
                <div className={`fixed transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${theme.text} text-[10px] uppercase tracking-widest font-primary flex flex-col justify-center h-[40px] mobile-footer-item-right
                    ${overlap.bottomRight ? 'bottom-[20px] left-[24px] text-left items-start' : 'bottom-[20px] right-[24px] text-right items-end'}
                    ${shouldShowFooter ? 'translate-x-0 opacity-100' : (overlap.bottomRight ? '-translate-x-[120%] opacity-0' : 'translate-x-[120%] opacity-0')}`}>

                    <div className="relative w-[80px] h-[20px]">
                        {/* Scroll Label - ONLY at Top */}
                        {isAtTop && !isAtBottom && (
                            <span className={`absolute inset-0 flex items-center ${overlap.bottomRight ? 'justify-start' : 'justify-end'} transition-opacity duration-300 ease-out whitespace-nowrap 
                                opacity-100`}>
                                <span className={`${isLightMode ? 'opacity-70' : 'opacity-50'} animate-pulse`}>Scroll ↓</span>
                            </span>
                        )}

                        {/* End Icons - ONLY at Bottom */}
                        {isAtBottom && (
                            <div className={`absolute inset-0 flex items-center ${overlap.bottomRight ? 'justify-start' : 'justify-end'} gap-5 transition-opacity duration-300 ease-out 
                                opacity-100`}>
                                <a href="https://www.linkedin.com/in/vinz-tan/" target="_blank" rel="noopener noreferrer" className={`transition-all active:scale-95 ${isLightMode ? 'text-black' : 'text-white'}`} style={{ opacity: isLightMode ? 0.7 : 0.6 }}>
                                    <Linkedin size={20} strokeWidth={1.5} />
                                </a>
                                <a href="mailto:vinz.a.studio@gmail.com" className={`transition-all active:scale-95 ${isLightMode ? 'text-black' : 'text-white'}`} style={{ opacity: isLightMode ? 0.7 : 0.6 }}>
                                    <Mail size={20} strokeWidth={1.5} />
                                </a>
                            </div>
                        )}
                    </div>
                </div>


            </div>

            {/* Menu Overlay */}
            {isMenuOpen && (
                <div className={`fixed inset-0 z-[45] ${overlayBg} backdrop-blur-xl transition-all duration-500 flex flex-col items-center justify-center gap-8`}>
                    {[
                        { name: 'Home', ref: homeRef, id: 'home' },
                        { name: 'Vinz Tan', ref: aboutRef, id: 'about' },
                        { name: 'Projects', ref: workRef, id: 'work' },
                    ].map((item) => (
                        <button
                            key={item.name}
                            onClick={(e) => {
                                handleNavClick(item.id);
                                const sweep = e.currentTarget.querySelector('.nav-sweep');
                                if (sweep) {
                                    gsap.timeline()
                                        .set(sweep, { transformOrigin: "left center", scaleX: 0, opacity: 1 })
                                        .to(sweep, { scaleX: 1, duration: 0.4, ease: "power2.inOut" })
                                        .set(sweep, { transformOrigin: "right center" })
                                        .to(sweep, { scaleX: 0, duration: 0.4, ease: "power2.inOut" });
                                }
                            }}
                            className={`flex items-center group transition-all relative px-8 py-2 overflow-hidden`}
                        >
                            {/* Click Sweep Layer */}
                            <span className="nav-sweep absolute left-0 right-0 h-[1.2em] top-1/2 -translate-y-1/2 pointer-events-none opacity-0" style={{ backgroundColor: colorScheme.compString, zIndex: 0 }} />
                            <div className="relative z-10">
                                <HackerText text={item.name} />
                            </div>
                        </button>
                    ))}

                    <div className={`mt-8 flex gap-8`}>
                        <a href="https://www.linkedin.com/in/vinz-tan/" target="_blank" rel="noopener noreferrer" className={`flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] font-primary ${isLightMode ? 'text-black/60' : 'text-white/60'} hover:opacity-100`}>
                            <Linkedin size={18} strokeWidth={1.5} />
                            <span>LinkedIn</span>
                        </a>
                        <a href="mailto:vinz.a.studio@gmail.com" className={`flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] font-primary ${isLightMode ? 'text-black/60' : 'text-white/60'} hover:opacity-100`}>
                            <Mail size={18} strokeWidth={1.5} />
                            <span>Email</span>
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
