import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Pin as PinIcon, Menu, X } from 'lucide-react';
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

    // Refs for scrolling
    const scrollRef = useRef(null);
    const homeRef = useRef(null);
    const aboutRef = useRef(null);
    const workRef = useRef(null);

    // Floating menu state
    const menuRef = useRef(null);
    const [menuPos, setMenuPos] = useState({ x: 16, y: 16 });
    const dragging = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const moved = useRef(false);

    // Bio rotation
    useEffect(() => {
        const interval = setInterval(() => {
            setBioIndex(prev => (prev + 1) % 2);
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    // Drag handlers
    useEffect(() => {
        const el = menuRef.current;
        if (!el) return;

        const onStart = (x, y) => {
            dragging.current = true;
            moved.current = false;
            const rect = el.getBoundingClientRect();
            dragStart.current = { x: x - rect.left, y: y - rect.top };
        };

        const onMove = (x, y) => {
            if (!dragging.current) return;
            moved.current = true;
            const newX = window.innerWidth - x - (el.offsetWidth - dragStart.current.x);
            const newY = y - dragStart.current.y;
            setMenuPos({
                x: Math.max(8, Math.min(newX, window.innerWidth - el.offsetWidth - 8)),
                y: Math.max(8, Math.min(newY, window.innerHeight - el.offsetHeight - 8))
            });
        };

        const onEnd = () => { dragging.current = false; };

        const touchStart = (e) => {
            onStart(e.touches[0].clientX, e.touches[0].clientY);
        };
        const touchMove = (e) => {
            // CRITICAL FIX: Do not block scrolling unless we are actively dragging the menu
            if (!dragging.current) return;
            if (e.cancelable) e.preventDefault();
            onMove(e.touches[0].clientX, e.touches[0].clientY);
        };
        const mouseDown = (e) => onStart(e.clientX, e.clientY);
        const mouseMove = (e) => onMove(e.clientX, e.clientY);

        el.addEventListener('touchstart', touchStart, { passive: false });
        window.addEventListener('touchmove', touchMove, { passive: false });
        window.addEventListener('touchend', onEnd);
        el.addEventListener('mousedown', mouseDown);
        window.addEventListener('mousemove', mouseMove);
        window.addEventListener('mouseup', onEnd);

        return () => {
            el.removeEventListener('touchstart', touchStart);
            window.removeEventListener('touchmove', touchMove);
            window.removeEventListener('touchend', onEnd);
            el.removeEventListener('mousedown', mouseDown);
            window.removeEventListener('mousemove', mouseMove);
            window.removeEventListener('mouseup', onEnd);
        };
    }, []);

    const scrollTo = (ref) => {
        if (ref.current && scrollRef.current) {
            scrollRef.current.scrollTo({ top: ref.current.offsetTop, behavior: 'smooth' });
            setIsMenuOpen(false);
        }
    };

    const bios = [
        <div className="flex flex-col gap-2 w-full">
            <div className="flex flex-wrap justify-end gap-2"><span className={theme.highlight}><HackerText text="EMPOWERING" /></span></div>
            <div className="flex flex-wrap justify-end gap-2"><span className={theme.highlight}><HackerText text="Creative" /></span><span className={theme.highlight}><HackerText text="TEAMS" /></span><span className={theme.muted}><HackerText text="to" /></span></div>
            <div className="flex flex-wrap justify-end gap-2"><span className={theme.highlight}><HackerText text="SCALE" /></span><span className={theme.highlight}><HackerText text="PRODUCTION" /></span></div>
            <div className="flex flex-wrap justify-end gap-2"><span className={theme.muted}><HackerText text="without" /></span><span className={theme.muted}><HackerText text="compromising" /></span></div>
            <div className="flex flex-wrap justify-end gap-2"><span className={theme.highlight}><HackerText text="INTEGRITY" /></span></div>
        </div>,
        <div className="flex flex-col gap-2 w-full">
            <div className="flex flex-wrap justify-end gap-2"><span className={theme.highlight}><HackerText text="AI" /></span><span className={theme.muted}><HackerText text="didn't" /></span></div>
            <div className="flex flex-wrap justify-end gap-2"><span className={theme.muted}><HackerText text="kill" /></span><span className={theme.highlight}><HackerText text="DESIGN" /></span><span className={theme.muted}>;</span><span className={theme.muted}><HackerText text="it" /></span></div>
            <div className="flex flex-wrap justify-end gap-2"><span className={theme.highlight}><HackerText text="is" /></span><span className={theme.highlight}><HackerText text="PART" /></span><span className={theme.highlight}><HackerText text="of" /></span></div>
            <div className="flex flex-wrap justify-end gap-2"><span className={theme.muted}><HackerText text="the" /></span><span className={theme.highlight}><HackerText text="FUTURE" /></span></div>
            <div className="flex flex-wrap justify-end gap-2"><span className={theme.highlight}><HackerText text="DESIGN" /></span></div>
        </div>
    ];

    const menuBg = isLightMode ? 'bg-white/80' : 'bg-black/20';
    const menuBorder = isLightMode ? 'border-black/10' : 'border-white/10';
    const menuIcon = isLightMode ? 'text-black' : 'text-white';
    const overlayBg = isLightMode ? 'bg-white/95' : 'bg-black/95';
    const overlayText = isLightMode ? 'text-black' : 'text-white';

    return (
        // FIXED CONTAINER - Takes full viewport, contains scroll area
        <div className="fixed inset-0 z-40" style={{ touchAction: 'pan-y' }}>

            {/* SCROLL CONTAINER - This is what scrolls */}
            <div
                ref={scrollRef}
                className="absolute inset-0 overflow-y-auto overflow-x-hidden"
                style={{ WebkitOverflowScrolling: 'touch' }}
            >
                {/* HOME */}
                <section ref={homeRef} className="min-h-screen w-full flex flex-col justify-between px-6 py-16">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-xl font-bold tracking-[0.2em] uppercase" style={{ color: nameColor }}>Vinz Tan</h1>
                        <div className="flex flex-col text-xs font-light tracking-widest opacity-80">
                            {roles[currentRoleIndex].split(' ').map((word, i) => (
                                <span key={i} className={i === 0 ? "font-bold" : ""}>{word}</span>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-center items-end text-right py-8">
                        <div className="text-[9vw] font-bold leading-none tracking-tighter mix-blend-difference">
                            {bios[bioIndex]}
                        </div>
                    </div>
                    <div className="h-16"></div>
                </section>

                {/* ABOUT */}
                <section ref={aboutRef} className="min-h-screen w-full flex flex-col justify-center px-6 py-20 gap-8 relative overflow-hidden">
                    <h2 className="text-[15vw] font-bold uppercase tracking-tighter opacity-10 absolute top-10 right-0 pointer-events-none select-none">About</h2>
                    <div className={`w-full aspect-square max-w-sm mx-auto rounded-2xl border ${theme.border} bg-white/5 backdrop-blur-sm flex items-center justify-center`}>
                        <span className={`text-sm uppercase tracking-widest ${theme.subText}`}>Picture</span>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {['Creative Ops Strategy', 'Hybrid Workflow Design', 'AIGC Pipeline Arch.', 'Art Direction', 'Brand Systems', 'Tech-Art Leadership'].map((skill, i) => (
                            <div key={i} className={`px-3 py-2 rounded border ${theme.border} text-center uppercase tracking-wider text-[10px]`}>{skill}</div>
                        ))}
                    </div>
                    <div className={`${theme.text} p-4 rounded-xl bg-black/5 backdrop-blur-sm text-sm leading-relaxed text-justify space-y-4 border ${theme.border}`}>
                        <p>Hi, I'm Vinz, I help Creative Teams escape production limits and maximize their impact.</p>
                        <p>With over 12 years of experience as a Lead Artist and Educator, I bridge the gap between traditional artistry and modern efficiency.</p>
                    </div>
                </section>

                {/* WORK */}
                <section ref={workRef} className="min-h-screen w-full flex flex-col justify-center px-6 py-20 gap-8 relative overflow-hidden">
                    <h2 className="text-[15vw] font-bold uppercase tracking-tighter opacity-10 absolute top-10 left-0 pointer-events-none select-none">Work</h2>
                    <div className="flex flex-col items-end text-right space-y-6">
                        <h3 className="text-4xl font-bold uppercase tracking-wide" style={{ color: colorScheme.base }}>Featured Projects</h3>
                        <div className="w-20 h-1" style={{ backgroundColor: colorScheme.compString }}></div>
                        <p className={`${theme.text} text-lg leading-relaxed max-w-md`}>
                            Featured projects and case studies coming soon. I specialize in AI-driven creative solutions.
                        </p>
                    </div>
                </section>

                {/* END */}
                <div className="h-32 flex items-center justify-center">
                    <span className={`text-[10px] uppercase tracking-widest ${theme.subText} opacity-50`}>— End —</span>
                </div>
            </div>

            {/* FIXED UI - Floating Menu */}
            <div
                ref={menuRef}
                className="fixed z-50 touch-none"
                style={{ top: menuPos.y, right: menuPos.x }}
            >
                <div className={`flex flex-col gap-2 ${menuBg} backdrop-blur-md rounded-full p-2 border ${menuBorder} shadow-lg`}>
                    <button onClick={() => !moved.current && setIsMenuOpen(!isMenuOpen)} className={`p-3 ${isLightMode ? 'bg-black text-white' : 'bg-white text-black'} rounded-full shadow-lg active:scale-90 transition-transform`}>
                        {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                    <button onClick={() => !moved.current && setIsColorPinned(!isColorPinned)} className={`p-2.5 rounded-full transition-all ${isColorPinned ? (isLightMode ? 'bg-black text-white' : 'bg-white text-black') : `bg-transparent ${menuIcon}`}`}>
                        <PinIcon size={18} className={isColorPinned ? 'fill-current' : ''} />
                    </button>
                    <button onClick={() => !moved.current && setIsLightMode(!isLightMode)} className={`p-2.5 rounded-full bg-transparent ${menuIcon}`}>
                        {isLightMode ? <Moon size={18} /> : <Sun size={18} />}
                    </button>
                </div>
            </div>

            {/* Scroll Hint */}
            <div className={`fixed bottom-6 left-6 z-40 text-[10px] uppercase tracking-widest opacity-50 animate-pulse ${theme.text} pointer-events-none`}>
                Scroll ↓
            </div>

            {/* Footer */}
            <div className={`fixed bottom-6 right-6 z-40 text-[10px] uppercase tracking-widest opacity-50 text-right ${theme.text} pointer-events-none`}>
                <div>Based in Malaysia</div>
                <div>© 2026</div>
            </div>

            {/* Menu Overlay */}
            <div className={`fixed inset-0 z-[45] ${overlayBg} backdrop-blur-xl transition-all duration-500 flex flex-col items-center justify-center gap-8 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
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
        </div>
    );
}
