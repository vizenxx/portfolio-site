import React, { useRef, useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUpRight, ZoomIn, X, ChevronLeft, ChevronRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HackerText } from './components/TextEffects';

gsap.registerPlugin(ScrollTrigger);

// ==========================================
// SECTION 1: PROJECT DATA
// ==========================================
const projects = [
    {
        id: "luckbros",
        title: "LuckBros",
        subtitle: "AIGC INTEGRATED SPATIAL DESIGN",
        meta: [
            { label: "Cooperated With", value: "Rising Formula Design Studio" },
            { label: "Project Type", value: "Mural Wallpaper & Branding" },
            { label: "Project Result", value: "The Hybrid Protocol: Delivering 4 Months of High-Fidelity Detailing in 30 Days" },
        ],
        description: [
            {
                type: "pivot-group",
                items: [
                    {
                        pivot: "The Challenge: Macro Scale, Micro Detail",
                        targetId: "header",
                        paragraphs: [
                            "The Goal: Our client required a massive 4-meter wall graphic that balanced specific brand storytelling with intricate visual density.",
                            "The Trap: Traditional workflows forced a choice: spend weeks hand-painting details (risking the deadline) or use stock assets (risking brand integrity). We needed high-fidelity custom art, fast."
                        ]
                    },
                    {
                        pivot: "The Solution: The Ping-Pong Protocol",
                        targetIds: ["main-mural", "artifacts"],
                        paragraphs: [
                            "We utilized a \"Ping-Pong\" Strategy—a rapid iteration loop where hand-sketches and AI visualizations constantly inform each other.",
                            "Instead of a linear process, we used AI as a \"Time Machine\" to instantly jump from rough sketches to near-final fidelity. This allowed us to align on the vision immediately, smoothing out client communication and eliminating the \"drafting\" bottleneck. By compressing the rendering phase, we gained the time to focus deeply on the final Human Polish, ensuring the outcome felt crafted, not computed."
                        ]
                    },
                    {
                        pivot: "The Result: Strategic Expansion",
                        targetId: "process-1",
                        paragraphs: [
                            "Velocity: By removing the \"Drafting Bottleneck,\" the team increased production velocity by 300%, focusing entirely on Art Direction rather than manual shading.",
                            "Business Impact: The resulting assets were so high-quality that the client expanded the scope. What started as a single mural evolved into a full Brand Identity System, proving that AI-assisted workflows can unlock higher-value opportunities when guided by human strategy."
                        ]
                    }
                ]
            }
        ],
        images: [
            { id: "header", src: "/portfolio-site/projects/case9/1.jpg" },
            { id: "main-mural", src: "/portfolio-site/projects/case9/2.jpg" },
            { id: "artifacts", src: "/portfolio-site/projects/case9/3.jpg" },
            { id: "process-1", src: "/portfolio-site/projects/case9/4.jpg" },
        ]
    },
    /*
    {
        id: "metamorphosis",
        title: "Metamorphosis",
        subtitle: "CYBERPUNK CHARACTER ARCHIVE",
        meta: [
            { label: "Cooperated With", value: "Independent Project" },
            { label: "Project Type", value: "Social Media Campaign" },
            { label: "Project Result", value: "Architected a modular design system that scaled content production by 3x for launch." },
        ],
        description: [
            {
                type: "pivot-group",
                items: [
                    {
                        pivot: "Synthesizing Organic and Synthetic",
                        targetId: "meta-header",
                        paragraphs: [
                            "Exploring the boundary between human silhouette and mechanical evolution.",
                            "This project serves as a stress-test for custom LoRA models trained on high-fashion and industrial design motifs."
                        ]
                    },
                    {
                        pivot: "Unified Visual Language",
                        targetId: "meta-main",
                        paragraphs: [
                            "Maintaining stylistic consistency across disparate character classes using seed-based prompting and structural control maps."
                        ]
                    }
                ]
            }
        ],
        images: [
            { id: "meta-header", src: "/portfolio-site/projects/case9/1.jpg" }, // Reuse internal images if no meta-header exists, or use common ones
            { id: "meta-main", src: "/portfolio-site/projects/case9/2.jpg" },
        ]
    }
    */
];

// ==========================================
// SECTION 2: LIGHTBOX COMPONENTS (Zoom/Drag)
// ==========================================
// LIGHTBOX COMPONENT
// DESKTOP LIGHTBOX (Zoom, Drag, Wheel)
const DesktopLightbox = ({ src, onClose }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef(null);
    const lastMousePos = useRef({ x: 0, y: 0 });
    const longPressTimer = useRef(null);
    const [isLongPress, setIsLongPress] = useState(false);

    const MAX_ZOOM = 1.5;
    const MIN_ZOOM = 0.8;

    useEffect(() => {
        const handleWheel = (e) => {
            e.preventDefault();
            const delta = -e.deltaY * 0.001;

            setScale(prev => {
                const newScale = prev + delta;
                const OVER_MAX = MAX_ZOOM + 0.1;
                const UNDER_MIN = MIN_ZOOM - 0.1;
                return Math.min(OVER_MAX, Math.max(UNDER_MIN, newScale));
            });

            clearTimeout(window.zoomBounceTimeout);
            window.zoomBounceTimeout = setTimeout(() => {
                setScale(prev => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev)));
            }, 150);
        };
        const container = containerRef.current;
        if (container) {
            container.addEventListener('wheel', handleWheel, { passive: false });
        }
        return () => {
            if (container) container.removeEventListener('wheel', handleWheel);
        };
    }, []);

    const handleMouseDown = (e) => {
        if (e.button !== 0) return;
        lastMousePos.current = { x: e.clientX, y: e.clientY };

        longPressTimer.current = setTimeout(() => {
            setIsLongPress(true);
            setIsDragging(true);
        }, 200);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        const dx = e.clientX - lastMousePos.current.x;
        const dy = e.clientY - lastMousePos.current.y;
        setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
        clearTimeout(longPressTimer.current);
        if (!isLongPress && isLoaded) {
            onClose();
        }
        setIsDragging(false);
        setIsLongPress(false);
    };

    return createPortal(
        <div
            ref={containerRef}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center animate-in fade-in duration-500 overflow-hidden select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={() => {
                clearTimeout(longPressTimer.current);
                setIsDragging(false);
                setIsLongPress(false);
            }}
            onMouseLeave={() => {
                clearTimeout(longPressTimer.current);
                setIsDragging(false);
                setIsLongPress(false);
            }}
            onDoubleClick={onClose}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
            <button
                className="fixed top-6 right-6 p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-[110] backdrop-blur-md border border-white/10 pointer-events-auto"
                onClick={(e) => { e.stopPropagation(); onClose(); }}
            >
                <X size={24} />
            </button>

            <div
                className={`relative transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'} w-full h-full flex items-center justify-center`}
            >
                <img
                    src={src}
                    alt="Lightbox content"
                    className="max-w-none w-full h-auto transition-transform duration-300 ease-out"
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        pointerEvents: 'none'
                    }}
                    onLoad={() => setIsLoaded(true)}
                />
            </div>

            <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'} z-[110] pointer-events-none`}>
                <div className="px-4 py-2 rounded-full bg-white/10 border border-white/5 backdrop-blur-md text-white/80 text-[10px] uppercase tracking-[0.2em] font-primary">
                    Wheel to Zoom • Hold to Drag • Double Click to Close
                </div>
            </div>
        </div>,
        document.body
    );
};

// MOBILE LIGHTBOX (Touch Gestures: Pinch Zoom, Drag, Pull-to-Close)
const MobileLightbox = ({ src, onClose }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    // Transform State
    const [scale, setScale] = useState(1);
    const [translate, setTranslate] = useState({ x: 0, y: 0 });

    // Gesture State
    const gesture = useRef({
        startDist: 0,
        startScale: 1,
        startPan: { x: 0, y: 0 },
        startCenter: { x: 0, y: 0 },
        isPinching: false,
        isDragging: false,
        lastTouch: { x: 0, y: 0 }
    });

    const imgRef = useRef(null);

    // Initial Full-Height Calculation
    // We rely on CSS object-contain + h-full to handle visual fit, 
    // but we need to reset transform state on mount.

    const handleTouchStart = (e) => {
        if (e.touches.length === 2) {
            // PINCH START
            gesture.current.isPinching = true;
            gesture.current.isDragging = false;

            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            gesture.current.startDist = dist;
            gesture.current.startScale = scale;

        } else if (e.touches.length === 1) {
            // DRAG START
            gesture.current.isPinching = false;
            gesture.current.isDragging = true;
            gesture.current.lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            gesture.current.startPan = { ...translate };
        }
    };

    const handleTouchMove = (e) => {
        if (gesture.current.isPinching && e.touches.length === 2) {
            e.preventDefault(); // Prevent browser zoom

            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );

            // Calculate new scale
            const scaleDelta = dist / gesture.current.startDist;
            let newScale = gesture.current.startScale * scaleDelta;

            // Soft limits with resistance
            if (newScale > 1.5) {
                // Resistance above 1.5
                const extra = newScale - 1.5;
                newScale = 1.5 + (extra * 0.3);
            }
            // Pinch-in to close threshold logic handled in end

            setScale(newScale);

        } else if (gesture.current.isDragging && e.touches.length === 1) {
            // 1-Finger Drag
            e.preventDefault();
            const dx = e.touches[0].clientX - gesture.current.lastTouch.x;
            const dy = e.touches[0].clientY - gesture.current.lastTouch.y;

            // Update translate
            setTranslate(prev => ({ x: prev.x + dx, y: prev.y + dy }));

            gesture.current.lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
    };

    const handleTouchEnd = () => {
        gesture.current.isDragging = false;
        gesture.current.isPinching = false;

        // BOUNCE / SNAP LOGIC via CSS Transition
        // We simply set the target state, and the style prop's transition handles the smoothing
        if (scale > 1.5) {
            // Bounce back to max 1.5
            setScale(1.5);
        } else if (scale < 0.75) {
            // Close if pinched in significantly
            onClose();
        } else if (scale < 1) {
            // Bounce back to 1 (fill screen)
            setScale(1);
            setTranslate({ x: 0, y: 0 });
        }
    };

    return createPortal(
        <div
            className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-2xl flex items-center justify-center animate-in fade-in duration-500 overflow-hidden touch-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <button
                className="fixed top-6 right-6 p-4 rounded-full bg-white/10 text-white z-[110] backdrop-blur-md border border-white/10"
                onClick={(e) => { e.stopPropagation(); onClose(); }}
            >
                <X size={24} />
            </button>

            <div className={`w-full h-full flex items-center justify-center p-0`}>
                <div
                    className={`relative w-full h-full flex items-center justify-center transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                >
                    <img
                        ref={imgRef}
                        src={src}
                        alt="Lightbox content"
                        className="w-full h-full object-contain pointer-events-none will-change-transform"
                        style={{
                            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
                            transition: gesture.current.isPinching || gesture.current.isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
                        }}
                        onLoad={() => setIsLoaded(true)}
                    />
                </div>
            </div>

            {/* Minimal Helper Text */}
            <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 border border-white/5 backdrop-blur-md text-white/50 text-[9px] uppercase tracking-[0.2em] font-primary pointer-events-none transition-opacity duration-300 ${scale > 1.1 ? 'opacity-0' : 'opacity-100'}`}>
                Pinch to Zoom • Drag to Move
            </div>
        </div>,
        document.body
    );
};

const ProjectSwitcher = ({ projects, activeId, onSwitch, theme, colorScheme, isLightMode }) => {
    if (!projects || projects.length <= 1) return null;
    const activeIndex = projects.findIndex(p => p.id === activeId);
    const handlePrev = (e) => { e.stopPropagation(); onSwitch(projects[(activeIndex - 1 + projects.length) % projects.length].id); };
    const handleNext = (e) => { e.stopPropagation(); onSwitch(projects[(activeIndex + 1) % projects.length].id); };

    return (
        <div className="w-full h-12 flex items-center justify-between select-none pointer-events-auto">
            <button onClick={handlePrev} className={`h-full px-4 hover:bg-white/10 transition-colors ${theme.text} opacity-50 hover:opacity-100 flex items-center justify-center`} aria-label="Previous Project"><ChevronLeft size={18} /></button>
            <div className="flex-1 h-1 flex gap-1 mx-2 bg-transparent">
                {projects.map(p => (
                    <div key={p.id} onClick={(e) => { e.stopPropagation(); onSwitch(p.id) }}
                        className={`flex-1 h-full rounded-full cursor-pointer transition-all duration-300 ${p.id === activeId ? '' : 'hover:opacity-100'}`}
                        style={{ backgroundColor: p.id === activeId ? (colorScheme.secondary || colorScheme.compString) : (isLightMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)') }}
                    />
                ))}
            </div>
            <button onClick={handleNext} className={`h-full px-4 hover:bg-white/10 transition-colors ${theme.text} opacity-50 hover:opacity-100 flex items-center justify-center`} aria-label="Next Project"><ChevronRight size={18} /></button>
        </div>
    );
};

// ==========================================
// SECTION 3: MAIN PROJECT COMPONENT 
// ==========================================
export default function Project({
    theme,
    colorScheme,
    isLightMode,
    onImageScroll,
    isMobile = false,
    disablePhysics = false,
    selectedProjectId: selectedProjectIdProp
}) {
    // ==========================================
    // SECTION 3.1: STATE & REFS
    // ==========================================
    const [selectedProjectId, setSelectedProjectId] = useState(selectedProjectIdProp || projects[0].id);
    const [zoomImage, setZoomImage] = useState(null);

    useEffect(() => {
        if (selectedProjectIdProp) setSelectedProjectId(selectedProjectIdProp);
    }, [selectedProjectIdProp]);

    const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];

    const imageContainerRef = useRef(null);
    const narrativeRef = useRef(null);

    const [imageProgressInternal, setImageProgressInternal] = useState(0);
    const [narrativeProgress, setNarrativeProgress] = useState(0);
    const [activeImageId, setActiveImageId] = useState(activeProject.images[0].id);
    const activeImageIdRef = useRef(activeProject.images[0].id);

    const [portalTarget, setPortalTarget] = useState(null);
    const [rpcTarget, setRpcTarget] = useState(null);
    useEffect(() => {
        if (isMobile) return;

        const updateTargets = () => {
            const portal = document.getElementById('right-panel-portal');
            const rpc = document.getElementById('project-rpc-target');
            if (portal) setPortalTarget(portal);
            if (rpc) setRpcTarget(rpc);
        };

        updateTargets();
        // Fallback for cases where IDs might not be present immediately
        const timer = setTimeout(updateTargets, 100);
        return () => clearTimeout(timer);
    }, [isMobile]);

    // Update active image when project changes and reset scroll
    useEffect(() => {
        setActiveImageId(activeProject.images[0].id);
        activeImageIdRef.current = activeProject.images[0].id;

        // Reset Physics and scroll position
        if (imageContainerRef.current) {
            scrollPhysics.current.currentY = 0;
            scrollPhysics.current.targetY = 0;
            scrollPhysics.current.velocity = 0;
            scrollPhysics.current.momentum = 0;
            imageContainerRef.current.scrollTop = 0;
            setImageProgressInternal(0);
        }
        if (narrativeRef.current) {
            narrativePhysics.current.currentY = 0;
            narrativePhysics.current.targetY = 0;
            narrativePhysics.current.velocity = 0;
            narrativePhysics.current.momentum = 0;
            narrativeRef.current.scrollTop = 0;
            setNarrativeProgress(0);
        }
    }, [activeProject]);

    const activePivotIndex = useMemo(() => {
        if (!activeProject || !activeProject.description) return -1;
        const pivotGroup = activeProject.description.find(block => block.type === 'pivot-group');
        if (!pivotGroup) return -1;
        return pivotGroup.items.findIndex(item =>
            item.targetId === activeImageId || (item.targetIds && item.targetIds.includes(activeImageId))
        );
    }, [activeImageId, activeProject]);

    const scrollToImage = (id) => {
        const element = document.getElementById(`proj-img-${id}`);
        if (element) {
            if (isMobile || disablePhysics) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else if (imageContainerRef.current) {
                const container = imageContainerRef.current;
                const top = element.offsetTop + element.offsetHeight / 2 - container.clientHeight / 2;
                scrollPhysics.current.targetY = Math.max(0, Math.min(top, container.scrollHeight - container.clientHeight));
                scrollPhysics.current.isScrubbing = true;
            }
        }
    };

    const handleScrollUpdate = () => {
        if (!imageContainerRef.current) return;
        const container = imageContainerRef.current;
        const { scrollTop, scrollHeight, clientHeight } = container;

        // 1. Update Progress
        if (scrollHeight > clientHeight) {
            const progress = scrollTop / (scrollHeight - clientHeight);
            setImageProgressInternal(progress);
            if (onImageScroll) onImageScroll(progress);
        }

        // 2. Active Image Detection (Only needed if physics loop isn't running active check)
        if (disablePhysics || isMobile) {
            const center_container = scrollTop + clientHeight / 2;
            let minDistance = Infinity;
            let currentActiveId = activeImageIdRef.current;

            const wrappers = container.querySelectorAll('.project-image-wrapper');
            wrappers.forEach(el => {
                const rect_el = el; // Since we are inside container, use offsetTop relative to container
                const center_el = el.offsetTop + el.offsetHeight / 2;
                const distance = Math.abs(center_container - center_el);
                if (distance < minDistance) { minDistance = distance; currentActiveId = el.id.replace('proj-img-', ''); }
            });

            if (currentActiveId !== activeImageIdRef.current) {
                activeImageIdRef.current = currentActiveId;
                setActiveImageId(currentActiveId);
            }
        }
    };

    const handleNarrativeScroll = () => {
        if (!narrativeRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = narrativeRef.current;
        if (scrollHeight > clientHeight) {
            setNarrativeProgress(scrollTop / (scrollHeight - clientHeight));
        }
    };

    const scrollPhysics = useRef({ currentY: 0, targetY: 0, velocity: 0, isDragging: false, isScrubbing: false, isManualScrubbing: false, isPointerDown: false, startY: 0, lastY: 0, momentum: 0 });
    const narrativePhysics = useRef({ currentY: 0, targetY: 0, velocity: 0, isDragging: false, isPointerDown: false, lastY: 0, momentum: 0 });

    useEffect(() => {
        if (isMobile || !imageContainerRef.current || disablePhysics) return;
        const container = imageContainerRef.current;
        let rafId;

        const handleWheel = (e) => {
            // ==========================================
            // SECTION 4: IMAGE PHYSICS SCROLLER (Desktop)
            // ==========================================
            e.preventDefault();
            e.stopPropagation();
            scrollPhysics.current.targetY += e.deltaY * 1.25;
            const maxScroll = container.scrollHeight - container.clientHeight;
            scrollPhysics.current.targetY = Math.max(0, Math.min(scrollPhysics.current.targetY, maxScroll));
        };

        const handleMouseDown = (e) => {
            // Ignore clicks in the side padding buffers (100px left/right) to prevent "invisible drag"
            const rect = container.getBoundingClientRect();
            const buffer = 100; // Matches padding
            if (e.clientX < rect.left + buffer || e.clientX > rect.right - buffer) return;

            scrollPhysics.current.isPointerDown = true;
            scrollPhysics.current.isDragging = true;
            scrollPhysics.current.isScrubbing = false;
            scrollPhysics.current.startY = e.clientY;
            scrollPhysics.current.lastY = e.clientY;
            container.style.cursor = 'grabbing';
        };

        const handleMouseMove = (e) => {
            if (!scrollPhysics.current.isDragging) return;
            const delta = (scrollPhysics.current.lastY - e.clientY) * 1.9;
            scrollPhysics.current.lastY = e.clientY;
            scrollPhysics.current.targetY += delta;
            scrollPhysics.current.velocity = delta;
            const maxScroll = container.scrollHeight - container.clientHeight;
            scrollPhysics.current.targetY = Math.max(0, Math.min(scrollPhysics.current.targetY, maxScroll));
        };

        const handleMouseUp = () => {
            scrollPhysics.current.isPointerDown = false;
            if (scrollPhysics.current.isDragging) {
                scrollPhysics.current.isDragging = false;
                container.style.cursor = 'grab';

                const maxScroll = container.scrollHeight - container.clientHeight;
                const progress = scrollPhysics.current.currentY / maxScroll;
                scrollPhysics.current.momentum = scrollPhysics.current.velocity;
            }
        };

        const handleTouchStart = (e) => {
            e.stopPropagation();
            const touch = e.touches[0];
            scrollPhysics.current.isPointerDown = true;
            scrollPhysics.current.isDragging = true;
            scrollPhysics.current.isScrubbing = false;
            scrollPhysics.current.startY = touch.clientY;
            scrollPhysics.current.lastY = touch.clientY;
        };

        const handleTouchMove = (e) => {
            e.stopPropagation();
            if (!scrollPhysics.current.isDragging) return;
            const touch = e.touches[0];
            const delta = (scrollPhysics.current.lastY - touch.clientY) * 1.9;
            scrollPhysics.current.lastY = touch.clientY;
            scrollPhysics.current.targetY += delta;
            scrollPhysics.current.velocity = delta;
            const maxScroll = container.scrollHeight - container.clientHeight;
            scrollPhysics.current.targetY = Math.max(0, Math.min(scrollPhysics.current.targetY, maxScroll));
        };

        const handleTouchEnd = (e) => {
            e.stopPropagation();
            scrollPhysics.current.isPointerDown = false;
            if (scrollPhysics.current.isDragging) {
                scrollPhysics.current.isDragging = false;
                const maxScroll = container.scrollHeight - container.clientHeight;
                const progress = scrollPhysics.current.currentY / maxScroll;
                setImageProgressInternal(progress);
                if (onImageScroll) onImageScroll(progress);
                scrollPhysics.current.momentum = scrollPhysics.current.velocity;
            }
        };

        const updatePhysics = () => {
            if (!container) return;
            const wrappers = container.querySelectorAll('.project-image-wrapper');
            const p = scrollPhysics.current;

            const maxScroll = container.scrollHeight - container.clientHeight;

            if (maxScroll <= 0) {
                p.currentY = 0; p.targetY = 0; p.momentum = 0;
                container.scrollTop = 0;
                setImageProgressInternal(0);
                rafId = requestAnimationFrame(updatePhysics);
                return;
            }

            if (p.isScrubbing) {
                p.currentY += (p.targetY - p.currentY) * 0.18;
                if (Math.abs(p.targetY - p.currentY) < 0.1) p.isScrubbing = false;
            } else if (!p.isDragging) {
                p.targetY += p.momentum; p.momentum *= 0.97;
                if (!p.isScrubbing && (p.momentum === 0 || Math.abs(p.momentum) < 1.0)) {
                    let nearestSnap = p.targetY; let minDist = Infinity;
                    wrappers.forEach(el => {
                        let snapTarget = el.offsetTop + el.offsetHeight / 2 - container.clientHeight / 2;
                        snapTarget = Math.max(0, Math.min(snapTarget, maxScroll));
                        const dist = Math.abs(snapTarget - p.targetY);
                        if (dist < minDist) { minDist = dist; nearestSnap = snapTarget; }
                    });
                    p.targetY += (nearestSnap - p.targetY) * 0.10;
                }
                p.targetY = Math.max(0, Math.min(p.targetY, maxScroll));
                if (p.targetY <= 0 || p.targetY >= maxScroll) p.momentum = 0;
                const diff = p.targetY - p.currentY;
                if (Math.abs(diff) < 0.0001) { p.currentY = p.targetY; p.momentum = 0; }
                else { p.currentY += diff * 0.1; }
            } else { p.currentY += (p.targetY - p.currentY) * 0.19; }

            container.scrollTop = p.currentY;

            const progress = p.currentY / maxScroll;
            setImageProgressInternal(progress);
            if (onImageScroll) onImageScroll(progress);
            const v = p.targetY - p.currentY; const vAbs = Math.abs(v);
            if (!disablePhysics) {
                const rotation = Math.max(-45, Math.min(25, v * 0.16));
                const scaleY = 1 + Math.min(vAbs * 0.0015, 0.25);
                const skew = Math.max(-5, Math.min(10, v * 0.12));
                const curveRadius = Math.min(50, vAbs * 0.8); // 0 to 100px based on speed

                wrappers.forEach(el => {
                    el.style.transform = `perspective(2000px) rotateX(${rotation}deg) skewY(${skew}deg) scaleY(${scaleY})`;
                    // Apply dynamic curvature (Jelly effect)
                    el.style.borderRadius = `${curveRadius}px`;
                    // Compression effect: Shrink base scale slightly when moving, then add curvature compensation
                    const movementShrink = Math.min(1, vAbs * 0.0004); // Up to 6% shrink at speed
                    const finalScale = 1 - movementShrink + (curveRadius * 0.00075);
                    el.style.scale = `${finalScale}`;
                });
            } else {
                // Reset styles if physics disabled
                wrappers.forEach(el => {
                    el.style.transform = '';
                    el.style.borderRadius = '';
                    el.style.scale = '';
                });
            }

            const rect_container = container.getBoundingClientRect();
            const center_container = rect_container.top + rect_container.height / 2;
            let currentActiveId = activeImageIdRef.current; let minDistance = Infinity;
            wrappers.forEach(el => {
                const rect_el = el.getBoundingClientRect();
                const center_el = rect_el.top + rect_el.height / 2;
                const distance = Math.abs(center_container - center_el);
                if (distance < minDistance) { minDistance = distance; currentActiveId = el.id.replace('proj-img-', ''); }
            });
            if (currentActiveId !== activeImageIdRef.current) { activeImageIdRef.current = currentActiveId; setActiveImageId(currentActiveId); }
            rafId = requestAnimationFrame(updatePhysics);
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        container.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        container.addEventListener('touchstart', handleTouchStart, { passive: false });
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd);
        rafId = requestAnimationFrame(updatePhysics);
        return () => {
            container.removeEventListener('wheel', handleWheel);
            container.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            container.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
            cancelAnimationFrame(rafId);
        };
    }, [isMobile, portalTarget, disablePhysics]); // portalTarget dependency ensures layout is ready

    // Pivot-based auto-scroll to keep narrative in sync with visuals
    useEffect(() => {
        if (isMobile || !narrativeRef.current || activePivotIndex === -1) return;

        const container = narrativeRef.current;
        const p = narrativePhysics.current;

        // Zero out current momentum to let the auto-scroll take control
        p.momentum = 0;

        // Use a GSAP update loop for 1.5s to "chase" the correct position
        // while other sections are collapsing or expanding in the layout.
        const scrollTween = gsap.to({}, {
            duration: 1.5,
            ease: "power4.out",
            onUpdate: () => {
                const activeElement = container.querySelector(`[data-pivot-active="true"]`);
                if (activeElement) {
                    const containerRect = container.getBoundingClientRect();
                    const activeRect = activeElement.getBoundingClientRect();

                    // Calculate precise scroll position relative to the container's top
                    const relativeTop = activeRect.top - containerRect.top + container.scrollTop;

                    // Alignment Logic: Instead of a fixed margin, we align the header to 
                    // the top 15% of the container's visible area. This adapts perfectly 
                    // to different screen sizes and content lengths.
                    const dynamicPadding = container.clientHeight * 0.15;
                    p.targetY = Math.max(0, relativeTop - dynamicPadding);
                }
            }
        });

        return () => scrollTween.kill();
    }, [activePivotIndex, isMobile]);

    // Narrative Logic for Desktop - NESTED SCROLL (content first, then images)
    useEffect(() => {
        if (isMobile || !portalTarget || !narrativeRef.current || !imageContainerRef.current) return;
        const narrative = narrativeRef.current;
        const imageContainer = imageContainerRef.current;
        const p = narrativePhysics.current;
        let rafId;

        const handleWheel = (e) => {
            // ==========================================
            // SECTION 4.1: NARRATIVE PHYSICS SCROLLER (Desktop)
            // ==========================================
            e.preventDefault();
            e.stopPropagation();
            const delta = e.deltaY;
            const narrativeMax = narrative.scrollHeight - narrative.clientHeight;
            const atTop = narrative.scrollTop <= 0;
            const atBottom = narrative.scrollTop >= narrativeMax - 1;

            // Scroll narrative first if it has room
            if (narrativeMax > 0) {
                if ((delta > 0 && !atBottom) || (delta < 0 && !atTop)) {
                    // Scroll within narrative
                    p.targetY += delta;
                    p.targetY = Math.max(0, Math.min(p.targetY, narrativeMax));
                    return;
                }
            }

            // Narrative at boundary - pass to images
            scrollPhysics.current.targetY += delta * 1.25;
            const imageMax = imageContainer.scrollHeight - imageContainer.clientHeight;
            scrollPhysics.current.targetY = Math.max(0, Math.min(scrollPhysics.current.targetY, imageMax));
        };

        const handleMouseDown = (e) => {
            p.isPointerDown = true;
            p.isDragging = true;
            p.lastY = e.clientY;
            p.momentum = 0;
            p.passToImages = false;
            narrative.style.cursor = 'grabbing';
        };

        const handleMouseMove = (e) => {
            if (!p.isDragging) return;
            const delta = p.lastY - e.clientY;
            p.lastY = e.clientY;

            const narrativeMax = narrative.scrollHeight - narrative.clientHeight;
            const atTop = narrative.scrollTop <= 0;
            const atBottom = narrative.scrollTop >= narrativeMax - 1;

            // Check if narrative has room to scroll
            if (narrativeMax > 0 && !p.passToImages) {
                if ((delta > 0 && !atBottom) || (delta < 0 && !atTop)) {
                    // Scroll within narrative
                    p.targetY += delta * 0.15;
                    p.velocity = delta * 2.5;
                    p.targetY = Math.max(0, Math.min(p.targetY, narrativeMax));
                    return;
                } else {
                    // Hit boundary - start passing to images
                    p.passToImages = true;
                }
            }

            // Pass to images
            const imageDelta = delta * 3.5;
            scrollPhysics.current.targetY += imageDelta;
            scrollPhysics.current.velocity = imageDelta;
            const imageMax = imageContainer.scrollHeight - imageContainer.clientHeight;
            scrollPhysics.current.targetY = Math.max(0, Math.min(scrollPhysics.current.targetY, imageMax));
        };

        const handleMouseUp = () => {
            p.isPointerDown = false;
            if (p.isDragging) {
                p.isDragging = false;
                p.passToImages = false;
                narrative.style.cursor = 'grab';
                p.momentum = p.velocity;
            }
        };

        const handleTouchStart = (e) => {
            e.stopPropagation();
            const touch = e.touches[0];
            p.isPointerDown = true;
            p.isDragging = true;
            p.lastY = touch.clientY;
            p.momentum = 0;
            p.passToImages = false;
        };

        const handleTouchMove = (e) => {
            e.stopPropagation();
            if (!p.isDragging) return;
            const touch = e.touches[0];
            const delta = (p.lastY - touch.clientY) * 1.5;
            p.lastY = touch.clientY;

            const narrativeMax = narrative.scrollHeight - narrative.clientHeight;
            const atTop = narrative.scrollTop <= 0;
            const atBottom = narrative.scrollTop >= narrativeMax - 1;

            if (narrativeMax > 0 && !p.passToImages) {
                if ((delta > 0 && !atBottom) || (delta < 0 && !atTop)) {
                    p.targetY += delta * 1.8;
                    p.velocity = delta * 1.8;
                    p.targetY = Math.max(0, Math.min(p.targetY, narrativeMax));
                    return;
                } else {
                    p.passToImages = true;
                }
            }

            const imageDelta = delta * 2.5;
            scrollPhysics.current.targetY += imageDelta;
            scrollPhysics.current.velocity = imageDelta;
            const imageMax = imageContainer.scrollHeight - imageContainer.clientHeight;
            scrollPhysics.current.targetY = Math.max(0, Math.min(scrollPhysics.current.targetY, imageMax));
        };

        const handleTouchEnd = (e) => {
            e.stopPropagation();
            p.isPointerDown = false;
            if (p.isDragging) {
                p.isDragging = false;
                p.passToImages = false;
                p.momentum = p.velocity;
            }
        };

        // Animation loop for smooth narrative scrolling
        const update = () => {
            const max = narrative.scrollHeight - narrative.clientHeight;
            if (max > 0) {
                if (!p.isDragging) { p.targetY += p.momentum; p.momentum *= 0.965; }
                p.targetY = Math.max(0, Math.min(p.targetY, max));
                p.currentY += (p.targetY - p.currentY) * 0.18;
                narrative.scrollTop = p.currentY;
                setNarrativeProgress(p.currentY / max);
            }
            rafId = requestAnimationFrame(update);
        };

        narrative.addEventListener('wheel', handleWheel, { passive: false });
        if (disablePhysics) {
            narrative.addEventListener('mousedown', handleMouseDown);
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            narrative.addEventListener('touchstart', handleTouchStart, { passive: false });
            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('touchend', handleTouchEnd);
        }
        rafId = requestAnimationFrame(update);
        return () => {
            narrative.removeEventListener('wheel', handleWheel);
            if (disablePhysics) {
                narrative.removeEventListener('mousedown', handleMouseDown);
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
                narrative.removeEventListener('touchstart', handleTouchStart);
                window.removeEventListener('touchmove', handleTouchMove);
                window.removeEventListener('touchend', handleTouchEnd);
            }
            cancelAnimationFrame(rafId);
        };
    }, [isMobile, portalTarget, disablePhysics]);

    // ==========================================
    // SECTION 5: RENDER (MOBILE VIEW)
    // ==========================================
    if (isMobile) {
        return (
            <div className="w-full flex flex-col font-primary">
                {!isMobile && (
                    <div className="px-6 mb-8 flex flex-nowrap gap-8 overflow-x-auto scrollbar-none items-end min-h-[40px]">
                        {/* Desktop-only switcher padding */}
                    </div>
                )}

                <div className={`relative px-4 mb-20 overflow-visible`}>
                    {/* Balanced Glassmorphic Header (v13.97) */}
                    <div className="relative">
                        {/* Glow with slower breathing animation */}
                        <div className="absolute -inset-2 bg-gradient-to-r from-white/10 to-transparent blur-3xl opacity-30 pointer-events-none" />

                        <div
                            className={`relative px-7 pt-8 pb-4 rounded-3xl border border-white/15 shadow-lg overflow-hidden transition-colors duration-500`}
                            style={{
                                backdropFilter: 'blur(5.6px) saturate(1.5)',
                                WebkitBackdropFilter: 'blur(5.6px) saturate(1.5)',
                                backgroundColor: isLightMode ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)',
                            }}
                        >
                            {/* Accent leak */}
                            <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />



                            <div className="flex flex-col gap-1.5 relative z-10">
                                <div className="space-y-1">
                                    <h2 className={`font-normal uppercase tracking-[0.2em] leading-[1.1] pr-4 break-words ${theme.text}`} style={{ fontSize: '1.25rem' }}>
                                        <HackerText text={activeProject.title} />
                                    </h2>
                                    <div className="flex items-center gap-2 pt-2">
                                        <p className={`text-xs tracking-normal font-normal ${theme.text} leading-tight opacity-70 italic`}>
                                            <span style={{ color: colorScheme.base }} className="font-semibold font-primary">"{activeProject.meta.find(m => m.label === "Project Result")?.value}"</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-y-5 border-t border-white/5 pt-6">
                                {activeProject.meta.filter(m => m.label !== 'Project Result').map((m, i) => (
                                    <div key={i} className={`flex flex-col gap-1 ${m.label === 'Cooperated With' ? 'col-span-2' : ''}`}>
                                        <span className={`text-[8px] uppercase tracking-[0.2em] font-normal ${theme.subText} opacity-30`}>{m.label}</span>
                                        {m.label === "Cooperated With" ? (
                                            <a href="https://risingformula.com/work" target="_blank" rel="noopener noreferrer" className={`text-[10px] font-content uppercase tracking-[0.05em] ${theme.text} underline underline-offset-[4px] decoration-current hover:decoration-current/60 transition-all font-medium break-words pr-2 block`}>
                                                {m.value}
                                            </a>
                                        ) : (
                                            <span className={`text-[10px] font-content uppercase tracking-[0.05em] opacity-80 font-medium pr-2`}>
                                                {m.value}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6  border-t border-white/5">
                                <ProjectSwitcher projects={projects} activeId={activeProject.id} onSwitch={setSelectedProjectId} theme={theme} colorScheme={colorScheme} isLightMode={isLightMode} />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-20 mt-10">
                        {activeProject.images.map((img) => {
                            const pivotItem = activeProject.description[0].items.find(item =>
                                item.targetId === img.id || (item.targetIds && item.targetIds.includes(img.id))
                            );
                            return (
                                <div
                                    key={img.id}
                                    id={`proj-img-${img.id}`}
                                    className="flex flex-col gap-8 opacity-0 translate-y-12 transition-all duration-1000 ease-out"
                                    ref={(el) => {
                                        if (el) {
                                            gsap.to(el, {
                                                opacity: 1,
                                                y: 0,
                                                duration: 1.2,
                                                ease: "power3.out",
                                                scrollTrigger: {
                                                    trigger: el,
                                                    start: "top 90%",
                                                }
                                            });
                                        }
                                    }}
                                >
                                    <div
                                        className={`relative w-full overflow-hidden cursor-zoom-in group`}
                                        onClick={() => setZoomImage(img.src)}
                                    >
                                        <img src={img.src} alt={img.id} className="w-full h-auto block" loading="lazy" />
                                        <div className="absolute top-4 right-4 p-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white/40">
                                            <ArrowUpRight size={14} />
                                        </div>
                                    </div>
                                    {pivotItem && (
                                        <div className="px-6 flex flex-col gap-6">
                                            <div className="flex flex-col gap-3">
                                                <div className="h-[2px] w-12" style={{ backgroundColor: colorScheme.base }} />
                                                <h3 className={`text-xl font-semibold uppercase tracking-widest leading-tight font-primary transition-all duration-500`}
                                                    style={{
                                                        color: theme.text,
                                                        textDecorationColor: activeImageId === pivotItem.targetId ? (colorScheme.secondary || colorScheme.compString) : 'currentColor'
                                                    }}>
                                                    {pivotItem.pivot}
                                                </h3>
                                            </div>
                                            <div className={`space-y-6 text-[15px] leading-relaxed font-content ${theme.subText} text-justify opacity-60`}>
                                                {pivotItem.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    {zoomImage && (isMobile ? <MobileLightbox src={zoomImage} onClose={() => setZoomImage(null)} /> : <DesktopLightbox src={zoomImage} onClose={() => setZoomImage(null)} />)}
                </div>
            </div>
        );
    }

    // DESKTOP RENDER
    return (
        <div className="w-full h-full flex flex-col justify-center pointer-events-auto overflow-visible" onWheel={(e) => e.stopPropagation()}>
            <div className={`w-full h-full flex flex-col md:flex-row relative overflow-visible`}>
                <div className="w-full h-1/2 md:h-full relative min-w-0 flex-shrink-0 overflow-visible">
                    <div ref={imageContainerRef} className={`${disablePhysics ? 'w-full px-[5vw] snap-y snap-mandatory' : 'w-[calc(100%+200px)] -ml-[100px] px-[100px]'} h-full overflow-y-auto scrollbar-none cursor-grab select-none relative`} onScroll={handleScrollUpdate} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', touchAction: disablePhysics ? 'pan-y' : 'none' }}>
                        <div className={`flex flex-col w-full ${disablePhysics ? 'gap-24 py-[40vh]' : 'gap-12 py-[50vh] transition-transform duration-150 relative'}`}>
                            {activeProject.images.map((img) => (
                                <div key={img.id} id={`proj-img-${img.id}`} className={`project-image-wrapper relative group overflow-visible flex-shrink-0 w-full h-auto ${disablePhysics ? 'rounded-2xl shadow-2xl overflow-hidden snap-center' : 'rounded-[2px]'} will-change-transform cursor-inherit`}>
                                    <img src={img.src} alt={img.id} draggable="false" className={`w-full h-auto block pointer-events-none transition-all duration-700 ${disablePhysics ? 'group-hover:scale-105' : ''}`} loading="lazy" />
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setZoomImage(img.src); }}
                                        className="absolute top-6 right-6 p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/60 opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100 cursor-zoom-in z-20 pointer-events-auto"
                                    >
                                        <ZoomIn size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                    {rpcTarget && createPortal(
                        <div className="w-full pointer-events-auto flex items-center justify-center relative px-2" style={{ height: disablePhysics ? '40vh' : `${Math.min(30, activeProject.images.length * 5)}vh` }}>
                            <div className="relative w-[1px] h-full bg-transparent flex flex-col items-center">
                                <div className={`absolute inset-y-0 left-1/2 -translate-x-1/2 w-full ${isLightMode ? 'bg-black' : 'bg-white'} opacity-10`} />
                                {activeProject.images.map((img, idx, filtered) => (
                                    <button
                                        key={img.id}
                                        onClick={() => scrollToImage(img.id)}
                                        className="absolute left-1/2 -translate-x-1/2 w-11 h-11 flex items-center justify-center z-[100]"
                                        style={{ top: `${(idx / (filtered.length - 1)) * 100}%`, transform: 'translate(-50%, -50%)' }}
                                        aria-label={`Scroll to section ${idx + 1}`}
                                    >
                                        <div className={`relative transition-all duration-300 ${activeImageId === img.id ? 'w-[3px] h-6' : 'w-[1px] h-4'} rounded-full`} style={{ backgroundColor: activeImageId === img.id ? (colorScheme.secondary || colorScheme.compString) : (isLightMode ? '#000' : '#fff'), opacity: activeImageId === img.id ? 1 : 0.2 }} />
                                    </button>
                                ))}
                            </div>
                        </div>, rpcTarget
                    )}
                </div>
            </div>

            {portalTarget && createPortal(
                <div
                    className={`group h-full min-h-0 flex flex-col justify-between ${disablePhysics ? 'rounded-l-3xl border-l w-full' : 'rounded-xl border w-[20vw]'} ${theme.border} ${disablePhysics ? 'py-7 px-7' : 'py-5 px-6'} shadow-lg relative transition-all duration-500`}
                    style={{
                        backdropFilter: disablePhysics ? 'blur(15px) saturate(1.8)' : 'blur(5.6px) saturate(1.5)',
                        WebkitBackdropFilter: disablePhysics ? 'blur(15px) saturate(1.8)' : 'blur(5.6px) saturate(1.5)',
                        backgroundColor: isLightMode
                            ? (disablePhysics ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.25)')
                            : (disablePhysics ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.2)'),
                    }}
                >
                    {/* Project Switcher for LMV (Wait, removing old one, inserting New one at bottom) */}

                    <div className={`w-full ${theme.text} font-light font-content mb-2`} style={{ textAlign: 'left', display: 'block' }}>
                        <h2 className={`${disablePhysics ? 'text-lg' : 'text-lg'} font-normal uppercase tracking-[0.15em] mb-1.5 break-words`} style={{ color: theme.text }}>{activeProject.title}</h2>
                        <div className="flex flex-col gap-1 mb-6 mt-1">
                            <p className="text-sm tracking-tight font-normal leading-snug">
                                <span style={{ color: colorScheme.base }} className="font-semibold italic font-primary">"{activeProject.meta.find(m => m.label === "Project Result")?.value}"</span>
                            </p>
                        </div>
                    </div>

                    <div ref={narrativeRef} className="relative w-full flex-1 min-h-0 overflow-y-auto scrollbar-none pb-4" onScroll={handleNarrativeScroll} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', touchAction: 'none' }}>
                        <div className={`w-full ${theme.text} font-light font-content mb-2`} style={{ textAlign: 'left', display: 'block' }}>


                            {activeProject.description.map((block, idx) => {
                                if (block.type === 'pivot-group') {
                                    return (
                                        <div key={idx} className="mb-4 w-full">
                                            {block.items.map((item, i) => {
                                                const isActive = item.targetIds ? item.targetIds.includes(activeImageId) : activeImageId === item.targetId;
                                                return (
                                                    <div key={i} className="mb-3" data-pivot-active={isActive ? "true" : "false"}>
                                                        <button
                                                            onClick={() => scrollToImage(item.targetIds ? item.targetIds[0] : item.targetId)}
                                                            className={`block text-left font-semibold underline transition-all duration-500 uppercase tracking-widest mb-1.5 ${isActive ? 'opacity-100' : 'opacity-40 hover:opacity-100'}`}
                                                            style={{
                                                                color: 'inherit',
                                                                fontSize: isActive ? '12px' : '10px',
                                                                textDecorationColor: isActive ? (colorScheme.secondary || colorScheme.compString) : 'currentColor'
                                                            }}
                                                        >
                                                            {item.pivot}
                                                        </button>
                                                        <div className={`overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isActive ? 'max-h-[1000px] opacity-100 mt-1.5' : 'max-h-0 opacity-0'}`}>
                                                            <div className={`text-[12px] leading-relaxed text-left opacity-80 space-y-3`}>{item.paragraphs.map((para, pi) => <p key={pi}>{para}</p>)}</div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                }
                                return null;
                            })}
                        </div>
                    </div>
                    <div className={`absolute right-4 top-1/2 -translate-y-1/2 ${disablePhysics ? 'h-[50vh] w-[1px]' : 'h-[30vh] w-[2px]'} bg-[#808080] opacity-10 rounded-full group-hover:opacity-20 transition-opacity duration-300`}>
                        <div className="w-full rounded-full" style={{ height: '15%', top: `${narrativeProgress * 85}%`, position: 'absolute', backgroundColor: colorScheme.base, opacity: 0.9 }} />
                    </div>
                    <div className="w-full pt-1 pb-3">
                        <ProjectSwitcher projects={projects} activeId={activeProject.id} onSwitch={setSelectedProjectId} theme={theme} colorScheme={colorScheme} isLightMode={isLightMode} />
                    </div>
                    <div className={`w-full h-auto flex flex-col gap-3 text-left pt-3 mt-0 border-t border-black/5`}>
                        <div className={`flex flex-col gap-1.5 items-start`}>
                            <span className={`text-[9px] uppercase font-primary tracking-widest ${theme.text} opacity-30`}>Cooperated With</span>
                            <a href="https://risingformula.com/work" target="_blank" rel="noopener noreferrer" className={`text-[12px] font-content ${theme.text} relative group w-fit`}>
                                {activeProject.meta.find(m => m.label === "Cooperated With")?.value || activeProject.meta[0].value}
                                <span className={`absolute bottom-0 left-0 w-full h-[1px] bg-current opacity-20 group-hover:opacity-100 transition-opacity duration-300`} />
                            </a>
                        </div>
                        <div className={`flex flex-col gap-1.5 items-start`}>
                            <span className={`text-[9px] uppercase font-primary tracking-widest ${theme.text} opacity-30`}>Project Type</span>
                            <span className={`text-[12px] font-content ${theme.text}`}>{activeProject.meta.find(m => m.label === "Project Type")?.value}</span>
                        </div>
                    </div>
                </div>, portalTarget
            )}
            {zoomImage && ((isMobile || disablePhysics) ? <MobileLightbox src={zoomImage} onClose={() => setZoomImage(null)} /> : <DesktopLightbox src={zoomImage} onClose={() => setZoomImage(null)} />)}
        </div>
    );
}


