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

    // Fixed menu state
    // (Dragging logic removed)

    // Bio rotation
    useEffect(() => {
        const interval = setInterval(() => {
            setBioIndex(prev => (prev + 1) % 2);
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    const scrollTo = (ref) => {
        if (ref.current) {
            ref.current.scrollIntoView({ behavior: 'smooth' });
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
        // NATURAL SCROLL CONTAINER
        <div className="relative w-full z-40">

            {/* CONTENT WRAPPER */}
            <div className="w-full flex flex-col">
                {/* HOME */}
                <section ref={homeRef} className="w-full min-h-[100dvh] flex flex-col justify-end px-6 py-16">
                    {/* Inline Header Removed - Moved to Fixed Layout */}

                    {/* Hero Text */}
                    <div className="flex-1 flex flex-col justify-center items-end text-right py-8">
                        <div className="text-[9vw] font-bold leading-none tracking-tighter mix-blend-difference">
                            {bios[bioIndex]}
                        </div>
                    </div>
                    <div className="h-16"></div>
                </section>

                {/* ABOUT */}
                <section ref={aboutRef} className="w-full flex flex-col justify-center px-6 py-20 gap-8 relative overflow-hidden">
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
                <section ref={workRef} className="w-full flex flex-col justify-center px-6 py-20 gap-8 relative overflow-hidden">
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

            {/* --- FIXED UI OVERLAYS --- */}

            {/* Top Left: Name & Active Page Indicator (Sticky) */}
            <div className={`fixed top-6 left-6 z-40 flex flex-col items-start gap-1 ${theme.text} transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}>
                {/* Name (Click to About) */}
                <button onClick={() => activePage !== 'about' && handlePageChange('about')} className="flex items-center group mb-1">
                    <span className="transition-all duration-300 mr-2" style={{
                        width: activePage === 'about' ? '4px' : '0px',
                        height: '1.2em',
                        backgroundColor: colorScheme.compString,
                        opacity: activePage === 'about' ? 1 : 0
                    }} />
                    <span className={`text-xl font-black tracking-[0.2em] uppercase transition-opacity duration-300 ${activePage === 'about' ? 'opacity-100' : 'opacity-70'}`} style={{ color: activePage === 'about' ? nameColor : 'inherit' }}>Vinz Tan</span>
                </button>

                {/* Current Page Title (Dynamic) */}
                <div className="flex items-center h-4">
                    <span className="transition-all duration-300 mr-2" style={{
                        width: activePage !== 'about' ? '4px' : '0px',
                        height: '1em',
                        backgroundColor: colorScheme.compString,
                        opacity: activePage !== 'about' ? 1 : 0
                    }} />
                    <span className="text-xs font-bold tracking-[0.2em] uppercase opacity-90">
                        {activePage === 'about' ? 'ABOUT' : activePage === 'work' ? 'PROJECTS' : 'HOME'}
                    </span>
                </div>
            </div>

            {/* Top Right: Menu Trigger */}
            <div className={`fixed top-6 right-6 z-50`}>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`flex items-center justify-center p-3 rounded-full backdrop-blur-md border shadow-lg transition-transform active:scale-90 ${theme.border} ${isLightMode ? 'bg-white/80 text-black' : 'bg-black/50 text-white'}`}>
                    {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Bottom Left: Role & Info */}
            <div className={`fixed bottom-6 left-6 z-40 flex flex-col gap-1 text-[10px] uppercase tracking-widest ${theme.text} transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}>
                <div className="flex flex-col mb-2 opacity-80">
                    {roles[currentRoleIndex].split(' ').map((word, i) => (
                        <span key={i} className={i === 0 ? "font-bold" : ""}>{word}</span>
                    ))}
                </div>
                <div className="opacity-50">Based in Malaysia</div>
                <div className="opacity-50">© 2026 (v12.24)</div>
            </div>

            {/* Bottom Right: Scroll Indicator */}
            <div className={`fixed bottom-6 right-6 z-40 transition-opacity duration-500 ${isMenuOpen ? 'opacity-0' : 'opacity-100'} ${activePage === 'work' ? 'opacity-0' : 'opacity-100'}`}>
                <div className={`text-[10px] uppercase tracking-widest opacity-50 ${theme.text}`}>Scroll ↓</div>
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
