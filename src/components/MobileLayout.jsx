import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Plus, Pin as PinIcon, Menu, X } from 'lucide-react';
import { ScaleText, HackerText } from './TextEffects';
import gsap from 'gsap';

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
    // --- LOCAL STATE ---
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [bioIndex, setBioIndex] = useState(0);

    // --- REFS ---
    const homeRef = useRef(null);
    const aboutRef = useRef(null);
    const workRef = useRef(null);

    // --- BIO ROTATION (Matches Desktop) ---
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

    // --- FLOATING CONTROL DRAG LOGIC ---
    // Using a simpler implementation for reliability
    const iconContainerRef = useRef(null);
    // FIX: Initialize to TOP RIGHT (y is distance from BOTTOM)
    const [position, setPosition] = useState(() => ({
        x: 20,
        y: typeof window !== 'undefined' ? window.innerHeight - 100 : 600
    }));
    const isDragging = useRef(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    useEffect(() => {
        // Ensure it stays within bounds on resize
        const handleResize = () => {
            setPosition(prev => ({
                x: Math.min(prev.x, window.innerWidth - 60),
                y: Math.min(prev.y, window.innerHeight - 60)
            }));
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const el = iconContainerRef.current;
        if (!el) return;

        const handleStart = (clientX, clientY) => {
            isDragging.current = true;
            const rect = el.getBoundingClientRect();
            dragOffset.current = {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
            el.style.transition = 'none';
        };

        const handleMove = (clientX, clientY) => {
            if (!isDragging.current) return;
            const newLeft = clientX - dragOffset.current.x;
            const newTop = clientY - dragOffset.current.y;
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            // Constrain to viewport
            const constrainedY = Math.max(20, Math.min(viewportHeight - newTop - el.offsetHeight, viewportHeight - 80));

            setPosition({
                x: viewportWidth - newLeft - el.offsetWidth,
                y: constrainedY // Use constrained Y
            });
        };

        const handleEnd = () => {
            isDragging.current = false;
            el.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        };

        const onTouchStart = (e) => handleStart(e.touches[0].clientX, e.touches[0].clientY);
        const onTouchMove = (e) => handleMove(e.touches[0].clientX, e.touches[0].clientY);
        const onMouseDown = (e) => handleStart(e.clientX, e.clientY);
        const onMouseMove = (e) => handleMove(e.clientX, e.clientY);

        el.addEventListener('touchstart', onTouchStart, { passive: false });
        window.addEventListener('touchmove', onTouchMove, { passive: false });
        window.addEventListener('touchend', handleEnd);
        el.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', handleEnd);

        return () => {
            el.removeEventListener('touchstart', onTouchStart);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', handleEnd);
            el.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', handleEnd);
        };
    }, []);

    // Scroll Handler for Menu
    const scrollToSection = (ref) => {
        if (ref.current) {
            ref.current.scrollIntoView({ behavior: 'smooth' });
            setIsMenuOpen(false);
        }
    };

    const bios = [
        // Bio 1: Empowering...
        (
            <div className="flex flex-col gap-2 w-full">
                <div className="flex flex-wrap justify-end gap-2"><span className={`${theme.highlight}`}><HackerText text="EMPOWERING" /></span></div>
                <div className="flex flex-wrap justify-end gap-2"><span className={`${theme.highlight}`}><HackerText text="Creative" /></span><span className={`${theme.highlight}`}><HackerText text="TEAMS" /></span><span className={`${theme.muted}`}><HackerText text="to" /></span></div>
                <div className="flex flex-wrap justify-end gap-2"><span className={`${theme.highlight}`}><HackerText text="SCALE" /></span><span className={`${theme.highlight}`}><HackerText text="PRODUCTION" /></span></div>
                <div className="flex flex-wrap justify-end gap-2"><span className={`${theme.muted}`}><HackerText text="without" /></span><span className={`${theme.muted}`}><HackerText text="compromising" /></span></div>
                <div className="flex flex-wrap justify-end gap-2"><span className={`${theme.highlight}`}><HackerText text="INTEGRITY" /></span></div>
            </div>
        ),
        // Bio 2: AI didn't kill...
        (
            <div className="flex flex-col gap-2 w-full">
                <div className="flex flex-wrap justify-end gap-2"><span className={`${theme.highlight}`}><HackerText text="AI" /></span><span className={`${theme.muted}`}><HackerText text="didn't" /></span></div>
                <div className="flex flex-wrap justify-end gap-2"><span className={`${theme.muted}`}><HackerText text="kill" /></span><span className={`${theme.highlight}`}><HackerText text="DESIGN" /><span className={`${theme.muted}`}>;</span></span><span className={`${theme.muted}`}><HackerText text="it" /></span></div>
                <div className="flex flex-wrap justify-end gap-2"><span className={`${theme.highlight}`}><HackerText text="is" /></span><span className={`${theme.highlight}`}><HackerText text="PART" /></span><span className={`${theme.highlight}`}><HackerText text="of" /></span></div>
                <div className="flex flex-wrap justify-end gap-2"><span className={`${theme.muted}`}><HackerText text="the" /></span><span className={`${theme.highlight}`}><HackerText text="FUTURE" /></span></div>
                <div className="flex flex-wrap justify-end gap-2"><span className={`${theme.highlight}`}><HackerText text="DESIGN" /></span></div>
            </div>
        )
    ];

    return (
        <div className={`absolute inset-0 overflow-y-auto overflow-x-hidden transition-colors duration-500 ease-in-out ${theme.text} md:hidden ${isMenuOpen ? 'overflow-y-hidden h-[100dvh]' : ''}`}>

            {/* Floating Controls (Menu, Theme, Pin) */}
            <div
                ref={iconContainerRef}
                className="fixed z-50 flex flex-col gap-4 items-end pointer-events-auto touch-none"
                style={{
                    bottom: `${position.y}px`,
                    right: `${position.x}px`,
                    willChange: 'transform' // GPU Layer
                }}
            >
                <div className="flex flex-col gap-2 bg-black/10 backdrop-blur-md rounded-full p-2 border border-white/10 shadow-lg">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-3 bg-white text-black rounded-full shadow-lg active:scale-90 transition-transform">
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    <button onClick={() => setIsColorPinned(!isColorPinned)} className={`p-3 rounded-full transition-all ${isColorPinned ? 'bg-white text-black' : 'bg-transparent text-white'}`}>
                        <PinIcon size={20} className={isColorPinned ? 'fill-current' : ''} />
                    </button>
                    <button onClick={() => setIsLightMode(!isLightMode)} className="p-3 rounded-full bg-transparent text-white">
                        {isLightMode ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                </div>
            </div>

            {/* Full Screen Menu Overlay */}
            <div className={`fixed inset-0 z-40 bg-black/95 backdrop-blur-xl transition-all duration-500 flex flex-col items-center justify-center gap-8 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                {[
                    { name: 'Home', ref: homeRef },
                    { name: 'Vinz Tan', ref: aboutRef }, // Maps to About
                    { name: 'Projects', ref: workRef }   // Maps to Work
                ].map((item) => (
                    <button
                        key={item.name}
                        onClick={() => scrollToSection(item.ref)}
                        className="text-4xl font-bold uppercase tracking-widest text-white hover:text-gray-300 transition-colors"
                        style={{ color: item.name === 'Vinz Tan' ? nameColor : 'inherit' }}
                    >
                        {item.name}
                    </button>
                ))}
            </div>

            {/* Scroll Content Container */}
            <div className="flex flex-col w-full">

                {/* SECTION: HOME */}
                <section ref={homeRef} className="min-h-[100dvh] w-full flex flex-col justify-between px-6 py-12 relative">
                    {/* Top Name/Role */}
                    <div className="flex flex-col gap-2 pointer-events-none">
                        <h1 className="text-xl font-bold tracking-[0.2em] uppercase" style={{ color: nameColor }}>Vinz Tan</h1>
                        <div className="flex flex-col text-xs font-light tracking-widest opacity-80">
                            {roles[currentRoleIndex].split(' ').map((word, i) => (
                                <span key={i} className={i === 0 ? "font-bold" : ""}>{word}</span>
                            ))}
                        </div>
                    </div>

                    {/* Rotating Bio Content */}
                    <div className="flex-1 flex flex-col justify-center items-end text-right">
                        <div className="text-[9vw] font-bold leading-none tracking-tighter mix-blend-difference">
                            {bios[bioIndex]}
                        </div>
                    </div>

                    {/* Scroll Indicator */}
                    <div className="absolute bottom-10 left-6 text-[10px] uppercase tracking-widest opacity-50 animate-pulse">
                        Scroll ↓
                    </div>
                </section>

                {/* SECTION: ABOUT */}
                <section ref={aboutRef} className="min-h-[100dvh] w-full flex flex-col justify-center px-6 py-20 gap-8 relative">
                    <h2 className="text-[15vw] font-bold uppercase tracking-tighter opacity-10 absolute top-10 right-[-5vw] pointer-events-none select-none">About</h2>

                    {/* Picture Block */}
                    <div className={`w-full aspect-square max-w-sm mx-auto rounded-2xl border ${theme.border} bg-white/5 backdrop-blur-sm relative overflow-hidden flex items-center justify-center`}>
                        <span className={`text-sm uppercase tracking-widest ${theme.subText}`}>Picture</span>
                        {/* Placeholder for noise/image */}
                        <div className="absolute inset-0 opacity-20 pointer-events-none bg-noise"></div>
                    </div>

                    {/* Expertise */}
                    <div className="flex flex-wrap gap-2 justify-center">
                        {['Creative Ops Strategy', 'Hybrid Workflow Design', 'AIGC Pipeline Arch.', 'Art Direction', 'Brand Systems', 'Tech-Art Leadership'].map((skill, i) => (
                            <div key={i} className={`px-3 py-2 rounded border ${theme.border} text-center uppercase tracking-wider text-[10px] bg-transparent whitespace-normal`}>
                                {skill}
                            </div>
                        ))}
                    </div>

                    {/* Bio Text */}
                    <div className={`${theme.text} p-4 rounded-xl bg-black/5 backdrop-blur-sm text-sm leading-relaxed text-justify space-y-4 border ${theme.border}`}>
                        <p>Hi, I'm Vinz, I help Creative Teams escape production limits and maximize their impact.</p>
                        <p>With over 12 years of experience as a Lead Artist and Educator, I bridge the gap between traditional artistry and modern efficiency.</p>
                    </div>
                </section>

                {/* SECTION: WORK */}
                <section ref={workRef} className="min-h-[100dvh] w-full flex flex-col justify-center px-6 py-20 gap-8 relative">
                    <h2 className="text-[15vw] font-bold uppercase tracking-tighter opacity-10 absolute top-10 left-[-2vw] pointer-events-none select-none">Work</h2>

                    <div className="flex flex-col items-end text-right space-y-6">
                        <h3 className="text-4xl font-bold uppercase tracking-wide" style={{ color: colorScheme.base }}>Featured Projects</h3>
                        <div className="w-20 h-1 bg-current" style={{ color: colorScheme.compString }}></div>
                        <p className={`${theme.text} text-lg leading-relaxed max-w-md`}>
                            Featured projects and case studies coming soon. I specialize in AI-driven creative solutions and strategic implementations.
                        </p>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-12 px-6 flex flex-col items-center gap-6 border-t border-white/10 bg-black/10 backdrop-blur-sm">
                    <div className="text-[10px] uppercase tracking-widest opacity-60">Based in Malaysia @ 2026</div>
                    <div className="flex gap-8">
                        <a href="#" className="opacity-80 hover:opacity-100 transition-opacity">LinkedIn</a>
                        <a href="mailto:hello@vinztan.com" className="opacity-80 hover:opacity-100 transition-opacity">Email</a>
                    </div>
                </footer>

            </div>
        </div>
    );
}
