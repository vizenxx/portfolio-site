import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Pin as PinIcon, Menu, X, GripVertical } from 'lucide-react';
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

    // Draggable Menu State
    const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });

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
        // NATURAL SCROLL CONTAINER (No mask for performance)
        <div className="relative w-full z-40">

            {/* CONTENT WRAPPER */}
            <div className="w-full flex flex-col">
                {/* HOME */}
                <section ref={homeRef} className="w-full min-h-[100dvh] flex flex-col justify-end px-6 py-24 relative">
                    {/* Hero Text (Bio) */}
                    <div className="flex-1 flex flex-col justify-center items-end text-right py-8 z-10">
                        <div className="text-[7vw] font-bold leading-none tracking-tighter mix-blend-difference">
                            {bios[bioIndex]}
                        </div>
                    </div>

                    {/* Role (Responsive Width) */}
                    <div className={`flex flex-col gap-2 z-10 mt-12 mb-6 ${theme.text}`}>
                        <div className="w-[30%] min-w-[120px] flex flex-col justify-end">
                            <h2 className="text-xs uppercase tracking-widest leading-tight break-words">
                                {roles[currentRoleIndex].split(' ').map((word, i) => (
                                    <span key={i} className={i === 0 ? 'font-bold block' : 'font-light block'}>{word}</span>
                                ))}
                            </h2>
                        </div>
                    </div>
                </section>

                {/* ABOUT */}
                <section ref={aboutRef} className="w-full flex flex-col justify-center px-6 py-20 gap-8 relative overflow-hidden">
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
                        <p>With over 12 years of experience as a Lead Artist and Educator, I bridge the gap between traditional artistry and modern efficiency. I do not replace artists; I empower them with Hybrid Design Systems—workflows that let AI handle the repetitive "drafting" so your team can focus entirely on high-fidelity polish and creative strategy.</p>

                        <div className="mt-4">
                            <h4 className={`text-xs uppercase tracking-widest font-bold ${theme.subText} mb-3`}>My Focus:</h4>
                            <ul className="space-y-3 list-none pl-0">
                                <li className="pl-3 border-l-2 border-white/20">
                                    <span className="font-bold block mb-1">Empowering Artists</span>
                                    <span className={`${theme.subText} text-xs`}>Training teams to use AI as a tool for control, not a replacement.</span>
                                </li>
                                <li className="pl-3 border-l-2 border-white/20">
                                    <span className="font-bold block mb-1">Protecting Integrity</span>
                                    <span className={`${theme.subText} text-xs`}>Using AI for the "base," while human taste handles the "finish."</span>
                                </li>
                                <li className="pl-3 border-l-2 border-white/20">
                                    <span className="font-bold block mb-1">Scaling Output</span>
                                    <span className={`${theme.subText} text-xs`}>Removing bottlenecks so teams can create more without burnout.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* WORK */}
                <section ref={workRef} className="w-full flex flex-col justify-center px-6 py-20 gap-8 relative overflow-hidden">
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
                    <span className={`text-[10px] uppercase tracking-widest ${theme.subText} opacity-50`}>— End —</span>
                </div>
            </div>

            {/* BOTTOM ATMOSPHERIC BLUR ONLY (Pure Blur, No Color, Edge-Anchored) */}
            <div
                className="fixed bottom-0 left-0 right-0 h-32 z-30 pointer-events-none"
                style={{
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    // Mask: Solid at absolute bottom, transparent at top of this div
                    maskImage: 'linear-gradient(to top, black 0%, black 20%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to top, black 0%, black 20%, transparent 100%)'
                }}
            />

            {/* --- FIXED UI ELEMENTS (Above atmosphere) --- */}

            {/* Top Left: Desktop-style Nav (Sticky) */}
            <div className={`fixed top-6 left-6 z-40 flex flex-col items-start gap-3 ${theme.text} transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}>
                {/* Vinz Tan - Primary unless on Projects */}
                <button onClick={() => handlePageChange('about')} className="flex items-center group h-5">
                    <span className="transition-all duration-300 mr-3" style={{
                        width: activePage === 'about' ? '4px' : '0px',
                        height: '100%',
                        backgroundColor: colorScheme.compString,
                        opacity: activePage === 'about' ? 1 : 0
                    }} />
                    <span className={`text-lg font-black tracking-[0.2em] uppercase transition-opacity duration-300 ${activePage === 'about' ? 'opacity-100' : 'opacity-80'}`}
                        style={{ color: activePage === 'work' ? 'inherit' : nameColor }}>
                        Vinz Tan
                    </span>
                </button>

                {/* Projects (Work) - Active only on Work */}
                <button onClick={() => handlePageChange('work')} className="flex items-center group h-5">
                    <span className="transition-all duration-300 mr-3" style={{
                        width: activePage === 'work' ? '4px' : '0px',
                        height: '100%',
                        backgroundColor: colorScheme.compString,
                        opacity: activePage === 'work' ? 1 : 0
                    }} />
                    <span className={`text-base font-bold tracking-[0.2em] uppercase transition-opacity duration-300 ${activePage === 'work' ? 'opacity-100' : 'opacity-60'}`} style={{ color: activePage === 'work' ? colorScheme.base : 'inherit' }}>
                        Projects
                    </span>
                </button>
            </div>

            {/* Top Right: Floating Pill Menu (Draggable + Glass) */}
            <div
                className={`fixed z-50 touch-none`}
                style={{
                    top: `calc(1.5rem + ${menuPos.y}px)`,
                    right: `calc(1.5rem - ${menuPos.x}px)`,
                    cursor: isDragging ? 'grabbing' : 'grab'
                }}
            >
                <div
                    className={`flex items-center gap-1 p-1.5 rounded-full border shadow-lg transition-colors duration-300 ${theme.border}`}
                    style={{
                        backdropFilter: 'blur(8px) saturate(1.5)',
                        WebkitBackdropFilter: 'blur(8px) saturate(1.5)',
                        backgroundColor: isLightMode ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)'
                    }}
                >
                    {/* Drag Handle */}
                    <div
                        className={`p-2 rounded-full ${isLightMode ? 'text-black/40' : 'text-white/40'}`}
                        onTouchStart={(e) => {
                            setIsDragging(true);
                            const touch = e.touches[0];
                            dragStartRef.current = { x: touch.clientX, y: touch.clientY, posX: menuPos.x, posY: menuPos.y };
                        }}
                        onTouchMove={(e) => {
                            if (!isDragging) return;
                            const touch = e.touches[0];
                            const dx = touch.clientX - dragStartRef.current.x;
                            const dy = touch.clientY - dragStartRef.current.y;
                            setMenuPos({ x: dragStartRef.current.posX + dx, y: dragStartRef.current.posY + dy });
                        }}
                        onTouchEnd={() => setIsDragging(false)}
                    >
                        <GripVertical size={14} />
                    </div>
                    {/* Pin Color */}
                    <button onClick={() => setIsColorPinned(!isColorPinned)} className={`p-2 rounded-full transition-all active:scale-90 ${isLightMode ? 'hover:bg-black/5 text-black' : 'hover:bg-white/10 text-white'}`}>
                        <PinIcon size={16} className={isColorPinned ? 'fill-current' : ''} />
                    </button>
                    {/* Theme Toggle */}
                    <button onClick={() => setIsLightMode(!isLightMode)} className={`p-2 rounded-full transition-all active:scale-90 ${isLightMode ? 'hover:bg-black/5 text-black' : 'hover:bg-white/10 text-white'}`}>
                        {isLightMode ? <Moon size={16} /> : <Sun size={16} />}
                    </button>
                    {/* Menu Toggle (Right) */}
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`p-2 rounded-full transition-all active:scale-90 ${isLightMode ? 'hover:bg-black/5 text-black' : 'hover:bg-white/10 text-white'}`}>
                        {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>
            </div>

            {/* Bottom Left: Location/Version (Restored Fixed) */}
            <div className={`fixed bottom-6 left-6 z-40 flex flex-col gap-1 text-[10px] uppercase tracking-widest ${theme.text} transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}>
                <div className="opacity-50">Based in Malaysia</div>
                <div className="opacity-50">© 2026 (v12.52)</div>
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
