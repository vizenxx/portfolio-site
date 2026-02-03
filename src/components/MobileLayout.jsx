import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Pin as PinIcon, Menu, X, GripVertical, Plus } from 'lucide-react';

import { HackerText } from './TextEffects';

export default function MobileLayout({
    activePage,
    handlePageChange,
    isLightMode,
    setIsLightMode,
    theme,
    colorScheme,
    nameColor,
    roles,
    currentRoleIndex,
    isColorPinned,
    setIsColorPinned
}) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [bioIndex, setBioIndex] = useState(0);
    const [isRoleExpanded, setIsRoleExpanded] = useState(false);

    // Magnetic Dock State (v13.13)
    const [isBottomDocked, setIsBottomDocked] = useState(false);
    // Scroll End State (v13.20)
    const [isAtBottom, setIsAtBottom] = useState(false);


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


    // Detect Scroll End (v13.20)
    useEffect(() => {
        const handleScroll = () => {
            const scrolledToBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 10;
            setIsAtBottom(scrolledToBottom);
        };
        window.addEventListener('scroll', handleScroll);
        // Initial check
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
        }, { threshold: 0.3 });
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
            <div className="flex flex-wrap justify-end gap-2"><span className={theme.highlight}><HackerText text="EMPOWERING" /></span></div>
            <div className="flex flex-wrap justify-end gap-2"><span className="opacity-40"><HackerText text="Creative" /></span><span className={theme.highlight}><HackerText text="TEAMS" /></span><span className="opacity-40"><HackerText text="to" /></span></div>
            <div className="flex flex-wrap justify-end gap-2"><span className={theme.highlight}><HackerText text="SCALE" /></span><span className={theme.highlight}><HackerText text="PRODUCTION" /></span></div>
            <div className="flex flex-wrap justify-end gap-2"><span className="opacity-40"><HackerText text="without" /></span><span className="opacity-40"><HackerText text="compromising" /></span></div>
            <div className="flex flex-wrap justify-end gap-2"><span className={theme.highlight}><HackerText text="INTEGRITY" /></span></div>
        </div>,

        <div className="flex flex-col gap-2 w-full">
            <div className="flex flex-wrap justify-end gap-2"><span className={theme.highlight}><HackerText text="AI" /></span><span className="opacity-40"><HackerText text="didn't" /></span></div>
            <div className="flex flex-wrap justify-end gap-2"><span className="opacity-40"><HackerText text="kill" /></span><span className={theme.highlight}><HackerText text="DESIGN" /></span><span className="opacity-40">;</span><span className="opacity-40"><HackerText text="it" /></span></div>
            <div className="flex flex-wrap justify-end gap-2"><span className={theme.highlight}><HackerText text="is" /></span><span className={theme.highlight}><HackerText text="PART" /></span><span className={theme.highlight}><HackerText text="of" /></span></div>
            <div className="flex flex-wrap justify-end gap-2"><span className="opacity-40"><HackerText text="the" /></span><span className={theme.highlight}><HackerText text="FUTURE" /></span></div>
            <div className="flex flex-wrap justify-end gap-2"><span className={theme.highlight}><HackerText text="DESIGN" /></span></div>
        </div>
    ];


    const menuBg = isLightMode ? 'bg-white/80' : 'bg-black/20';
    const menuBorder = isLightMode ? 'border-black/10' : 'border-white/10';
    const menuIcon = isLightMode ? 'text-black' : 'text-white';
    const overlayBg = isLightMode ? 'bg-white/95' : 'bg-black/95';
    const overlayText = isLightMode ? 'text-black' : 'text-white';

    return (
        // NATURAL SCROLL CONTAINER (No mask for performance)
        <div className={`relative w-full z-40 ${theme.text}`} onClick={() => setIsRoleExpanded(false)}>



            {/* CONTENT WRAPPER */}
            <div className="w-full flex flex-col">
                {/* HOME */}
                <section ref={homeRef} id="home" className="w-full min-h-[100dvh] px-6 relative flex flex-col pt-24">

                    {/* Hero Text (Bio) - justify-center items-end */}
                    <div className="flex flex-col justify-center items-end text-right py-12 z-10 h-[60vh]">
                        <div className="text-[7vw] font-bold leading-none tracking-tighter mix-blend-difference">
                            {bios[bioIndex]}
                        </div>
                    </div>



                    {/* Role (Responsive Width) - Fixed Bottom at 15%, Grow Upwards */}
                    <div
                        className={`absolute bottom-[15%] left-[24px] z-20 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${theme.text} pointer-events-auto`}
                        style={{ width: '40vw' }}
                    >


                        <div
                            className="flex flex-col justify-end items-start text-left cursor-pointer overflow-visible gap-0"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsRoleExpanded(!isRoleExpanded);
                            }}
                        >
                            {[2, 1, 0].map((offset) => {
                                const roleIndex = (currentRoleIndex + offset) % roles.length;
                                const role = roles[roleIndex];
                                const isFirst = offset === 0;
                                const showPlus = offset < 2 && isRoleExpanded;

                                return (
                                    <div key={offset} className={`grid transition-all duration-500 ease-out 
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
                                            <div style={isFirst && !isRoleExpanded ? { animation: 'slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards' } : {}}>
                                                <h2 className="text-sm uppercase tracking-[0.15em] font-medium leading-[1.4] break-words">
                                                    {role.split(' ').map((word, i) => (
                                                        <span key={i} className={i === 0 ? 'font-bold block text-base' : `${isLightMode ? 'opacity-50' : 'opacity-40'} block`}>{word}</span>
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



                {/* ABOUT */}
                <section ref={aboutRef} id="about" className="w-full flex flex-col justify-center px-6 py-20 gap-8 relative overflow-hidden">

                    <div className={`w-full aspect-square max-w-sm mx-auto rounded-2xl border ${theme.border} bg-white/5 backdrop-blur-sm flex items-center justify-center`}>
                        <span className={`text-sm uppercase tracking-widest ${theme.subText}`}>Picture</span>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {['Creative Ops Strategy', 'Hybrid Workflow Design', 'AIGC Pipeline Arch.', 'Art Direction', 'Brand Systems', 'Tech-Art Leadership'].map((skill, i) => (
                            <div key={i} className={`px-3 py-2 rounded border ${theme.border} text-center uppercase tracking-wider text-[10px]`}>{skill}</div>
                        ))}
                    </div>
                    <div className={`${theme.text} p-4 rounded-xl bg-black/5 backdrop-blur-sm text-base leading-relaxed text-justify space-y-4 border ${theme.border}`}>
                        <p>Hi, I'm Vinz, I help Creative Teams escape production limits and maximize their impact.</p>
                        <p>With over 12 years of experience as a Lead Artist and Educator, I bridge the gap between traditional artistry and modern efficiency. I do not replace artists; I empower them with Hybrid Design Systems—workflows that let AI handle the repetitive "drafting" so your team can focus entirely on high-fidelity polish and creative strategy.</p>

                        <div className="mt-4">
                            <h4 className={`text-sm uppercase tracking-widest font-bold ${theme.subText} mb-3`}>My Focus:</h4>
                            <ul className="space-y-4 list-none pl-0">
                                <li className="pl-4 border-l-2 border-white/20">
                                    <span className="font-bold block mb-1 text-base">Empowering Artists</span>
                                    <span className={`${theme.subText} text-sm`}>Training teams to use AI as a tool for control, not a replacement.</span>
                                </li>
                                <li className="pl-4 border-l-2 border-white/20">
                                    <span className="font-bold block mb-1 text-base">Protecting Integrity</span>
                                    <span className={`${theme.subText} text-sm`}>Using AI for the "base," while human taste handles the "finish."</span>
                                </li>
                                <li className="pl-4 border-l-2 border-white/20">
                                    <span className="font-bold block mb-1 text-base">Scaling Output</span>
                                    <span className={`${theme.subText} text-sm`}>Removing bottlenecks so teams can create more without burnout.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* WORK */}
                <section ref={workRef} id="work" className="w-full flex flex-col justify-center px-6 py-20 gap-8 relative overflow-hidden">

                    <div className="flex flex-col items-end text-right space-y-6">
                        <h3 className="text-4xl font-bold uppercase tracking-wide" style={{ color: colorScheme.base }}>Featured Projects</h3>
                        <div className="w-20 h-1" style={{ backgroundColor: colorScheme.compString }}></div>
                        <p className={`${theme.text} text-lg leading-relaxed max-w-md`}>
                            Featured projects and case studies coming soon. I specialize in AI-driven creative solutions.
                        </p>
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




            {/* --- FIXED UI ELEMENTS (Above atmosphere) --- */}

            {/* Top UI: Desktop-style Nav - Moves ONLY on overlap */}
            <div className={`fixed z-40 flex flex-col items-start gap-3 ${theme.text} transition-all duration-500 ${isMenuOpen ? 'opacity-0' : 'opacity-100'} 
                ${overlap.topLeft ? 'top-[30px] right-[24px] items-end text-right' : 'top-[30px] left-[24px] items-start text-left'}`}
                style={{ pointerEvents: isMenuOpen ? 'none' : 'auto' }}>





                {/* Vinz Tan */}
                <button onClick={() => handlePageChange('about')} className={`flex items-center group h-5 transition-all ${overlap.topLeft ? 'flex-row-reverse' : ''}`}>
                    <span className={`transition-all duration-300 ${overlap.topLeft ? 'ml-3' : 'mr-3'}`} style={{
                        width: activePage === 'about' ? '4px' : '0px',
                        height: '100%',
                        backgroundColor: colorScheme.compString,
                        opacity: activePage === 'about' ? 1 : 0
                    }} />
                    <span className={`text-lg font-black tracking-[0.2em] uppercase transition-all duration-300 ${activePage === 'work' ? 'opacity-80' : 'opacity-100'}`}
                        style={{ color: activePage === 'work' ? 'inherit' : nameColor }}>
                        Vinz Tan
                    </span>

                </button>


                {/* Projects */}
                <button onClick={() => handlePageChange('work')} className={`flex items-center group h-5 transition-all ${overlap.topLeft ? 'flex-row-reverse' : ''}`}>
                    <span className={`transition-all duration-300 ${overlap.topLeft ? 'ml-3' : 'mr-3'}`} style={{
                        width: activePage === 'work' ? '4px' : '0px',
                        height: '100%',
                        backgroundColor: colorScheme.compString,
                        opacity: activePage === 'work' ? 1 : 0
                    }} />
                    <span className={`text-base font-bold tracking-[0.2em] uppercase transition-all duration-300 ${activePage === 'work' ? 'opacity-100' : 'opacity-60'}`}
                        style={{
                            color: activePage === 'work' ? colorScheme.base : 'inherit'
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
                    <span className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors drop-shadow-sm ${theme.text}`}>{tooltip.text}</span>
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
                        padding: '0 12px' // Increased end padding
                    }}

                >
                    {/* Directional Logic: Grip always on outer edge */}
                    {menuSide === 'left' ? (
                        <>
                            {/* LEFT SIDE: (0.75) D (1.25) C (1) B (1) A (0.75) */}
                            <div className={`p-1.5 rounded-full flex-shrink-0 ${isLightMode ? 'text-black' : 'text-white'}`}
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

                                <GripVertical size={isDragging ? 28 : 18} />
                            </div>
                            <div className={`flex items-center transition-all duration-500 overflow-hidden ${isDragging ? 'w-0 opacity-0' : 'w-fit opacity-100'}`}>
                                <div className="w-[6px]" /> {/* spacing 1.25 (approx) */}
                                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`p-1.5 rounded-full transition-all active:scale-90 ${isLightMode ? 'hover:bg-black/5 text-black' : 'hover:bg-white/10 text-white'}`}>
                                    {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
                                </button>
                                <div className="w-[5px]" /> {/* spacing 1.0 */}
                                <button onClick={() => setIsLightMode(!isLightMode)} className={`p-1.5 rounded-full transition-all active:scale-90 ${isLightMode ? 'hover:bg-black/5 text-black' : 'hover:bg-white/10 text-white'}`}>
                                    {isLightMode ? <Moon size={20} /> : <Sun size={20} />}
                                </button>
                                <div className="w-[5px]" /> {/* spacing 1.0 */}
                                <button onClick={handlePinClick} className={`p-1.5 rounded-full transition-all active:scale-90 ${isLightMode ? 'hover:bg-black/5 text-black' : 'hover:bg-white/10 text-white'}`}>
                                    <PinIcon size={20} className={isColorPinned ? 'fill-current' : ''} />
                                </button>

                            </div>
                        </>
                    ) : (
                        <>
                            {/* RIGHT SIDE: (0.75) A (1) B (1) C (1.25) D (0.75) */}
                            <div className={`flex items-center transition-all duration-500 overflow-hidden ${isDragging ? 'w-0 opacity-0' : 'w-fit opacity-100'}`}>
                                <button onClick={handlePinClick} className={`p-1.5 rounded-full transition-all active:scale-90 ${isLightMode ? 'hover:bg-black/5 text-black' : 'hover:bg-white/10 text-white'}`}>
                                    <PinIcon size={20} className={isColorPinned ? 'fill-current' : ''} />
                                </button>

                                <div className="w-[5px]" /> {/* spacing 1.0 */}
                                <button onClick={() => setIsLightMode(!isLightMode)} className={`p-1.5 rounded-full transition-all active:scale-90 ${isLightMode ? 'hover:bg-black/5 text-black' : 'hover:bg-white/10 text-white'}`}>
                                    {isLightMode ? <Moon size={20} /> : <Sun size={20} />}
                                </button>
                                <div className="w-[5px]" /> {/* spacing 1.0 */}
                                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`p-1.5 rounded-full transition-all active:scale-90 ${isLightMode ? 'hover:bg-black/5 text-black' : 'hover:bg-white/10 text-white'}`}>
                                    {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
                                </button>
                                <div className="w-[6px]" /> {/* spacing 1.25 (approx) */}
                            </div>
                            <div className={`p-1.5 rounded-full flex-shrink-0 ${isLightMode ? 'text-black' : 'text-white'}`}
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

                                <GripVertical size={isDragging ? 28 : 18} />
                            </div>
                        </>
                    )}
                </div>

            </div>



            {/* CLEAN FOOTER TEXT - Anti-crash positioning */}
            <div className={`fixed z-40 pointer-events-none transition-opacity duration-500 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}>

                {/* Based in Malaysia */}
                <div className={`fixed transition-alls duration-700 ${theme.text} text-[10px] uppercase tracking-widest
                    ${overlap.bottomLeft || overlap.bottomRight ? 'top-[30px] right-[24px] text-right items-end' : 'bottom-[20px] left-[24px] text-left items-start'}`}>
                    <div className={isLightMode ? 'opacity-70' : 'opacity-50'}>Based in Malaysia</div>
                    <div className={isLightMode ? 'opacity-40' : 'opacity-30'}>© 2026 (v13.31)</div>
                </div>































                {/* Scroll Indicator */}
                <div className={`fixed transition-all duration-700 ${theme.text} text-[10px] uppercase tracking-widest animate-pulse
                    ${overlap.bottomRight ? 'bottom-[20px] left-[24px] text-left' : 'bottom-[20px] right-[24px] text-right'}`}>

                    <div className="relative inline-block w-[60px] h-[12px] align-middle">
                        {/* Scroll Label - Fades out to LEFT */}
                        <span className={`absolute top-0 ${overlap.bottomRight ? 'left-0' : 'right-0'} transition-all duration-500 ease-out whitespace-nowrap 
                            ${isAtBottom ? '-translate-x-4 opacity-0' : `translate-x-0 ${isLightMode ? 'opacity-70' : 'opacity-50'}`}`}>
                            Scroll ↓
                        </span>
                        {/* End Label - Fades in from RIGHT */}
                        <span className={`absolute top-0 ${overlap.bottomRight ? 'left-0' : 'right-0'} transition-all duration-500 ease-out whitespace-nowrap 
                            ${isAtBottom ? `translate-x-0 ${isLightMode ? 'opacity-70' : 'opacity-50'}` : 'translate-x-4 opacity-0'}`}>
                            End
                        </span>
                    </div>
                </div>



            </div>

            {/* Menu Overlay */}
            {isMenuOpen && (
                <div className={`fixed inset-0 z-[45] ${overlayBg} backdrop-blur-xl transition-all duration-500 flex flex-col items-center justify-center gap-8`}>
                    {[
                        { name: 'Home', ref: homeRef },
                        { name: 'Vinz Tan', ref: aboutRef },
                        { name: 'Projects', ref: workRef }
                    ].map((item) => (
                        <button key={item.name} onClick={() => scrollTo(item.ref)} className={`text-4xl font-bold uppercase tracking-widest ${overlayText} hover:opacity-70`} style={item.name === 'Vinz Tan' ? { color: nameColor } : {}}>
                            {item.name}
                        </button>
                    ))}
                    <div className={`mt-8 flex gap-8 text-sm ${isLightMode ? 'text-black/60' : 'text-white/60'}`}>
                        <a href="#">LinkedIn</a>
                        <a href="mailto:hello@vinztan.com">Email</a>
                    </div>
                </div>
            )}
        </div>
    );
}
