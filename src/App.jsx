import React, { useEffect, useRef, useState, useLayoutEffect, useMemo } from 'react';
import { Sun, Moon, Menu, X, Pin as PinIcon, Plus, ChevronsLeft, ChevronsRight } from 'lucide-react';
import gsap from 'gsap';



// --- SCALE TEXT COMPONENT ---
const ScaleText = ({ children, className, lineHeight = 0.8 }) => {
  const containerRef = useRef(null);
  const textRef = useRef(null);

  useLayoutEffect(() => {
    const resize = () => {
      const container = containerRef.current;
      const text = textRef.current;

      if (container && text) {
        const baseFontSize = 100;
        text.style.fontSize = `${baseFontSize}px`;
        text.style.width = 'max-content';

        const containerW = container.getBoundingClientRect().width;
        const textW = text.getBoundingClientRect().width;

        // 0.99 Buffer prevents width clipping
        const ratio = (containerW / textW) * 0.99;

        text.style.width = '100%';
        text.style.fontSize = `${baseFontSize * ratio}px`;
      }
    };

    resize();
    if (document.fonts) {
      document.fonts.ready.then(resize);
    }

    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [children]);

  return (
    <div
      ref={containerRef}
      // FIX 1: Reverted to 'overflow-hidden' to kill the color bar glitch.
      className={`w-full overflow-hidden ${className || ''}`}
      // FIX 2: Added paddingBottom. This extends the "viewable area" downwards
      // just enough to let the tail of 'j', 'g', ';', etc. be seen.
      style={{ paddingBottom: '0.3rem' }}
    >
      <span
        ref={textRef}
        style={{
          display: 'block',
          lineHeight: lineHeight,
          textAlign: 'left',
          whiteSpace: 'nowrap',
          transformOrigin: 'left top'
        }}
      >
        {children}
      </span>
    </div>
  );
};

// --- UTILS ---
const hexToHSL = (H) => {
  let r = 0, g = 0, b = 0;
  if (H.length === 4) { r = "0x" + H[1] + H[1]; g = "0x" + H[2] + H[2]; b = "0x" + H[3] + H[3]; }
  else if (H.length === 7) { r = "0x" + H[1] + H[2]; g = "0x" + H[3] + H[4]; b = "0x" + H[5] + H[6]; }
  r /= 255; g /= 255; b /= 255;
  let cmin = Math.min(r, g, b), cmax = Math.max(r, g, b), delta = cmax - cmin, h = 0, s = 0, l = 0;
  if (delta === 0) h = 0; else if (cmax === r) h = ((g - b) / delta) % 6; else if (cmax === g) h = (b - r) / delta + 2; else h = (r - g) / delta + 4;
  h = Math.round(h * 60); if (h < 0) h += 360; l = (cmax + cmin) / 2;
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1); l = +(l * 100).toFixed(1);
  return { h, s, l };
};

const HSLToRGBString = (h, s, l, alpha = 1) => {
  s /= 100; l /= 100;
  let c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2, r = 0, g = 0, b = 0;
  if (0 <= h && h < 60) { r = c; g = x; b = 0; } else if (60 <= h && h < 120) { r = x; g = c; b = 0; } else if (120 <= h && h < 180) { r = 0; g = c; b = x; } else if (180 <= h && h < 240) { r = 0; g = x; b = c; } else if (240 <= h && h < 300) { r = x; g = 0; b = c; } else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
  r = Math.round((r + m) * 255); g = Math.round((g + m) * 255); b = Math.round((b + m) * 255);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const HackerText = ({ text, className, speed = 30 }) => {
  const [displayText, setDisplayText] = useState(text);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";
  const intervalRef = useRef(null);
  const triggerEffect = () => {
    let iteration = 0;
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setDisplayText(prev => text.split("").map((letter, index) => { if (index < iteration) return text[index]; return chars[Math.floor(Math.random() * chars.length)]; }).join(""));
      if (iteration >= text.length) clearInterval(intervalRef.current);
      iteration += 1 / 3;
    }, speed);
  };
  useEffect(() => { triggerEffect(); return () => clearInterval(intervalRef.current); }, [text]);
  return <span className={`inline-block ${className}`} onMouseEnter={triggerEffect}>{displayText}</span>;
};

// --- MAIN APP ---
export default function App() {
  const getContrastSafeColor = (isLight) => {
    const lightModeColors = ['#DC2626', '#EA580C', '#15803D', '#2563EB', '#7C3AED', '#ae0c67', '#4338CA'];
    const darkModeColors = ['#FF3B30', '#FF9500', '#FFCC00', '#007AFF', '#FF2D55', '#00FF00', '#00FFFF', '#dc40fd'];
    const palette = isLight ? lightModeColors : darkModeColors;
    return palette[Math.floor(Math.random() * palette.length)];
  };

  const [isLightMode, setIsLightMode] = useState(false);
  const [isColorPinned, setIsColorPinned] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState('home');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);

    // Fix for mobile viewport height (Safari toolbar issue)
    const setAppHeight = () => {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    };

    checkMobile();
    setAppHeight();

    window.addEventListener('resize', () => {
      checkMobile();
      setAppHeight();
    });

    return () => window.removeEventListener('resize', checkMobile); // simplified cleanup
  }, []);

  const [hoveredNav, setHoveredNav] = useState(null);
  const [hoveredEl, setHoveredEl] = useState(null);
  const [clickedItem, setClickedItem] = useState(null);
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [isRoleHovered, setIsRoleHovered] = useState(false);
  const roles = useMemo(() => ['Creative Operations Architect', 'AIGC Strategist', 'Visual Designer'], []);

  useEffect(() => {
    if (isRoleHovered) return;
    const interval = setInterval(() => { setCurrentRoleIndex((prev) => (prev + 1) % roles.length); }, 4000);
    return () => clearInterval(interval);
  }, [roles, isRoleHovered]);

  const [nameColor, setNameColor] = useState(() => getContrastSafeColor(false));
  const trailRipplesRef = useRef([]);
  const clickRipplesRef = useRef([]);
  const spotsRef = useRef([]);
  const clickShockwaveRef = useRef(0);
  const targetConfigRef = useRef({ h: 0, s: 0, l: 0, a: 0.1 });

  const randomizeSpots = () => {
    spotsRef.current = [];
    const spotCount = Math.floor(Math.random() * 5) + 2;
    const maxAttempts = 50;

    for (let i = 0; i < spotCount; i++) {
      let attempts = 0;
      let valid = false;
      let newSpot = {};

      while (!valid && attempts < maxAttempts) {
        attempts++;
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        const radius = 150 + Math.random() * 150;

        // Check distance against existing spots
        let overlap = false;
        for (const spot of spotsRef.current) {
          const dx = x - spot.x;
          const dy = y - spot.y;
          const dist = Math.hypot(dx, dy);
          // Require distance to be at least 75% of sum of radii to limit overlap
          if (dist < (radius + spot.baseRadius) * 0.75) {
            overlap = true;
            break;
          }
        }

        if (!overlap) {
          valid = true;
          newSpot = {
            x, y,
            offsetX: Math.random() * 1000, offsetY: Math.random() * 1000,
            speedX: 0.001 + Math.random() * 0.002, speedY: 0.001 + Math.random() * 0.002,
            baseRadius: radius
          };
        }
      }

      // If we couldn't find a spot after maxAttempts, push anyway or skip (pushing to ensure count)
      if (valid) {
        spotsRef.current.push(newSpot);
      } else {
        // Fallback: push random spot even if overlapping if we can't find space, 
        // but usually screen is big enough.
        spotsRef.current.push({
          x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
          offsetX: Math.random() * 1000, offsetY: Math.random() * 1000,
          speedX: 0.001 + Math.random() * 0.002, speedY: 0.001 + Math.random() * 0.002,
          baseRadius: 150 + Math.random() * 150
        });
      }
    }
  };

  useEffect(() => { if (spotsRef.current.length === 0) randomizeSpots(); }, []);

  const bioRef = useRef(null);
  const containerRef = useRef(null);
  const aboutContentRef = useRef(null);
  const isTransitioning = useRef(false);

  useEffect(() => {
    const handleWheel = (e) => {
      if (isTransitioning.current) return;
      if (Math.abs(e.deltaY) < 40) return;
      if (activePage === 'about' && aboutContentRef.current) {
        const contentEl = aboutContentRef.current;
        const isAtTop = contentEl.scrollTop === 0;
        const isAtBottom = contentEl.scrollTop + contentEl.clientHeight >= contentEl.scrollHeight - 1;
        if (e.deltaY > 0 && !isAtBottom) return;
        if (e.deltaY < 0 && !isAtTop) return;
      }
      if (e.deltaY > 0) {
        if (activePage === 'home') handlePageChange('work');
        else if (activePage === 'work') handlePageChange('about');
        else if (activePage === 'about') handlePageChange('home');
      } else {
        if (activePage === 'home') handlePageChange('about');
        else if (activePage === 'about') handlePageChange('work');
        else if (activePage === 'work') handlePageChange('home');
      }
    };
    window.addEventListener('wheel', handleWheel);
    return () => window.removeEventListener('wheel', handleWheel);
  }, [activePage]);

  const handlePageChange = (newPage) => {
    if (newPage === activePage || isTransitioning.current) return;
    isTransitioning.current = true;
    const angle = Math.random() * 360; const radian = angle * (Math.PI / 180);
    const distance = 2000; const destX = Math.cos(radian) * distance; const destY = Math.sin(radian) * distance;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setActivePage(newPage); randomizeSpots();
          // Clear ripples for new page
          trailRipplesRef.current = [];
          clickRipplesRef.current = [];

          gsap.set(bioRef.current, { x: -destX * 0.5, y: -destY * 0.5, opacity: 0, scale: 0.8, filter: 'blur(10px)' });
          gsap.set(rippleCanvasRef.current, { x: -destX * 0.5, y: -destY * 0.5, opacity: 0, scale: 0.8, filter: 'blur(10px)' });

          gsap.to(bioRef.current, { x: 0, y: 0, opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.5, ease: 'power4.out' });
          gsap.to(rippleCanvasRef.current, { x: 0, y: 0, opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.5, ease: 'power4.out' });

          gsap.to(spotlightRef.current, { x: 0, y: 0, opacity: 1, scale: 1.25, filter: 'blur(100px)', duration: 0.5, ease: 'power4.out', onComplete: () => { isTransitioning.current = false; } });
        }
      });
      tl.to([bioRef.current, rippleCanvasRef.current], { x: destX, opacity: 0, scale: 1.2, filter: 'blur(40px)', duration: 0.3, ease: 'expo.in' });
      tl.to(bioRef.current, { y: destY, duration: 0.3, ease: 'linear' }, "<");
      const bgTravelDist = destX * 0.5; const bgTravelDistY = destY * 0.5;
      tl.to(spotlightRef.current, { x: bgTravelDist, opacity: 0, scale: 1.1, filter: 'blur(80px)', duration: 0.3, ease: 'expo.in' }, "<");
      tl.to(spotlightRef.current, { y: bgTravelDistY, duration: 0.3, ease: 'linear' }, "<");
      tl.set(spotlightRef.current, { x: -bgTravelDist, y: -bgTravelDistY, opacity: 0, scale: 1.1, filter: 'blur(40px)' });
      clickShockwaveRef.current = 2000;
      spotsRef.current.forEach(spot => { gsap.to(spot, { x: spot.x + -destX * 0.05, y: spot.y + -destY * 0.05, duration: 0.5, ease: 'power2.inOut' }); });
    }, containerRef);
  };

  const colorScheme = useMemo(() => {
    const hsl = hexToHSL(nameColor); const compHue = (hsl.h + 180) % 360;
    return { base: nameColor, compHSL: { h: compHue, s: hsl.s, l: hsl.l }, compString: HSLToRGBString(compHue, hsl.s, hsl.l) };
  }, [nameColor]);

  useEffect(() => { if (!isColorPinned) setNameColor(getContrastSafeColor(isLightMode)); }, [isLightMode, isColorPinned]);

  const { pageBg, mutedColor } = useMemo(() => {
    const { h, l } = colorScheme.compHSL; const sBg = 5; const lBg = isLightMode ? 88 : 8; const sMuted = 10;
    let lMuted = isLightMode ? (l - 5) : (l + 5); lMuted = Math.max(0, Math.min(100, lMuted));
    return { pageBg: HSLToRGBString(h, sBg, lBg), mutedColor: HSLToRGBString(h, sMuted, lMuted) };
  }, [colorScheme, isLightMode]);

  const comp = useRef(null); const cursorRef = useRef(null); const spotlightRef = useRef(null); const rippleCanvasRef = useRef(null);

  useLayoutEffect(() => {
    if (!comp.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      gsap.set(".hero-line", { x: 100, opacity: 0 }); gsap.set(".title-block", { x: -30, opacity: 0 }); gsap.set(".nav-item", { x: -20, opacity: 0 }); gsap.set(".theme-toggle", { x: 20, opacity: 0 }); gsap.set(".footer-elem", { y: 30, opacity: 0 });
      tl.to(".hero-line", { x: 0, opacity: 1, duration: 1, stagger: 0.15, ease: "power4.out" })
        .to(".title-block", { x: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, "<0.1")
        .to([".nav-item", ".theme-toggle", ".footer-elem"], { x: 0, y: 0, opacity: 1, duration: 0.8, stagger: 0.05, ease: "power2.out" }, "<0.1");
    }, comp);
    return () => ctx.revert();
  }, []);

  useEffect(() => { targetConfigRef.current = { h: colorScheme.compHSL.h, s: colorScheme.compHSL.s, l: colorScheme.compHSL.l, a: isLightMode ? 0.125 : 0.1 }; }, [colorScheme.compHSL, isLightMode]);

  useEffect(() => {
    const canvas = spotlightRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); let animationFrameId; let currentColor = { ...targetConfigRef.current };
    let mousePos = { x: -1000, y: -1000 }; let mouseActive = false; let mouseTimer; let time = 0;
    const resizeCanvas = () => { if (canvas.parentElement) { canvas.width = canvas.parentElement.offsetWidth; canvas.height = canvas.parentElement.offsetHeight; } };
    window.addEventListener('resize', resizeCanvas); resizeCanvas();
    const handleMouseMove = (e) => { mousePos.x = e.clientX; mousePos.y = e.clientY; mouseActive = true; clearTimeout(mouseTimer); mouseTimer = setTimeout(() => { mouseActive = false; }, 2000); };
    window.addEventListener('mousemove', handleMouseMove);
    const handlePointerDown = () => { clickShockwaveRef.current = 5500; };
    window.addEventListener('pointerdown', handlePointerDown);
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height); time += 1;
      const target = targetConfigRef.current; currentColor.h += (target.h - currentColor.h) * 0.05; currentColor.s += (target.s - currentColor.s) * 0.05; currentColor.l += (target.l - currentColor.l) * 0.05; currentColor.a += (target.a - currentColor.a) * 0.05;
      const colorStart = HSLToRGBString(currentColor.h, currentColor.s, currentColor.l, currentColor.a); const colorEnd = HSLToRGBString(currentColor.h, currentColor.s, currentColor.l, 0);
      spotsRef.current.forEach((spot) => {
        const wanderX = (canvas.width / 2) + (Math.cos((time * spot.speedX) + spot.offsetX) * (canvas.width / 3)); const wanderY = (canvas.height / 2) + (Math.sin((time * spot.speedY) + spot.offsetY) * (canvas.height / 3));
        let targetX = wanderX; let targetY = wanderY;
        if (mouseActive) { const dx = spot.x - mousePos.x; const dy = spot.y - mousePos.y; const dist = Math.hypot(dx, dy); const repelRadius = 300; if (dist < repelRadius) { const force = (repelRadius - dist) / repelRadius; const repelStrength = 1800; const angle = Math.atan2(dy, dx); targetX += Math.cos(angle) * force * repelStrength; targetY += Math.sin(angle) * force * repelStrength; } }
        if (clickShockwaveRef.current > 10) { const dx = spot.x - mousePos.x; const dy = spot.y - mousePos.y; const dist = Math.hypot(dx, dy); const shockRadius = window.innerWidth * 0.45; if (dist < shockRadius) { const force = Math.pow((shockRadius - dist) / shockRadius, 2); const angle = Math.atan2(dy, dx); targetX += Math.cos(angle) * force * (clickShockwaveRef.current * 3); targetY += Math.sin(angle) * force * (clickShockwaveRef.current * 3); } }
        spot.x += (targetX - spot.x) * 0.02; spot.y += (targetY - spot.y) * 0.02;
        const currentRadius = spot.baseRadius + Math.sin(time * 0.02) * 50; const gradient = ctx.createRadialGradient(spot.x, spot.y, 0, spot.x, spot.y, currentRadius);
        gradient.addColorStop(0, colorStart); gradient.addColorStop(1, colorEnd); ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc(spot.x, spot.y, currentRadius, 0, Math.PI * 2); ctx.fill();
      });
      clickShockwaveRef.current *= 0.96; animationFrameId = requestAnimationFrame(animate);
    };
    animate();
    return () => { window.removeEventListener('resize', resizeCanvas); window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('pointerdown', handlePointerDown); cancelAnimationFrame(animationFrameId); clearTimeout(mouseTimer); };
  }, []);

  useEffect(() => {
    const canvas = rippleCanvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); let animationFrameId; let lastPos = null; const CLICK_CONFIG = { maxRadius: 500, lifespan: 4000 };
    const resizeCanvas = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', resizeCanvas); setTimeout(resizeCanvas, 50);
    const handleMouseMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      const now = Date.now();

      // Update cursor position (fixed, relative to viewport)
      if (cursorRef.current) cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;

      if (!lastPos) {
        lastPos = { x, y };
        return;
      }
      const dist = Math.hypot(x - lastPos.x, y - lastPos.y);
      const step = 2;
      const steps = Math.ceil(dist / step);
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const rx = lastPos.x + (x - lastPos.x) * t;
        const ry = lastPos.y + (y - lastPos.y) * t;
        trailRipplesRef.current.push({ x: rx, y: ry, startTime: now, baseRadius: 5, maxRadius: 20, lifespan: 150 });
      }
      lastPos = { x, y };
    };
    window.addEventListener('mousemove', handleMouseMove);
    const handlePointerDown = (e) => {
      clickRipplesRef.current.push({ x: e.clientX, y: e.clientY, startTime: Date.now(), baseRadius: 10, maxRadius: CLICK_CONFIG.maxRadius, lifespan: CLICK_CONFIG.lifespan });
    };
    window.addEventListener('pointerdown', handlePointerDown);
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const now = Date.now(); const { h, s } = colorScheme.compHSL; const rippleL = isLightMode ? 40 : 90; const colorStr = HSLToRGBString(h, s, rippleL, 1);
      ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = colorStr; ctx.shadowBlur = 15; ctx.shadowColor = colorStr;
      for (let i = trailRipplesRef.current.length - 1; i >= 0; i--) { const r = trailRipplesRef.current[i]; if (now - r.startTime > r.lifespan) { trailRipplesRef.current.splice(i, 1); continue; } const progress = (now - r.startTime) / r.lifespan; let currentRadius = 0; let currentAlpha = 0; const expandFraction = 0.2; if (progress < expandFraction) { const p = progress / expandFraction; currentRadius = r.maxRadius * (1 - Math.pow(1 - p, 3)); currentAlpha = 0.5 * p; } else { const p = (progress - expandFraction) / (1 - expandFraction); currentRadius = r.maxRadius * (1 - p); currentAlpha = 0.15 * Math.pow(1 - p, 3); } ctx.beginPath(); ctx.arc(r.x, r.y, currentRadius, 0, Math.PI * 2); ctx.globalAlpha = currentAlpha; ctx.fill(); }
      ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = 'rgba(0,0,0,1)'; ctx.shadowBlur = 15; ctx.shadowColor = 'rgba(0,0,0,1)'; ctx.globalAlpha = 1;
      for (let i = 0; i < trailRipplesRef.current.length; i++) { const r = trailRipplesRef.current[i]; const progress = (now - r.startTime) / r.lifespan; let currentRadius = 0; const expandFraction = 0.2; if (progress < expandFraction) { const p = progress / expandFraction; currentRadius = r.maxRadius * (1 - Math.pow(1 - p, 3)); } else { const p = (progress - expandFraction) / (1 - expandFraction); currentRadius = r.maxRadius * (1 - p); } const innerRadius = Math.max(0, currentRadius - 3); ctx.beginPath(); ctx.arc(r.x, r.y, innerRadius, 0, Math.PI * 2); ctx.fill(); }
      ctx.globalCompositeOperation = 'lighter'; ctx.shadowBlur = 15; ctx.shadowColor = HSLToRGBString(h, s, rippleL, 1);
      for (let i = clickRipplesRef.current.length - 1; i >= 0; i--) { const r = clickRipplesRef.current[i]; if (now - r.startTime > r.lifespan) { clickRipplesRef.current.splice(i, 1); continue; } const progress = (now - r.startTime) / r.lifespan; const currentRadius = r.baseRadius + (r.maxRadius * Math.sin(progress * Math.PI / 2)); const currentAlpha = 0.2 * (1 - progress); ctx.beginPath(); ctx.arc(r.x, r.y, currentRadius, 0, Math.PI * 2); ctx.lineWidth = 3; ctx.strokeStyle = colorStr.replace('1)', `${currentAlpha})`); ctx.stroke(); }
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();
    return () => { window.removeEventListener('resize', resizeCanvas); window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('pointerdown', handlePointerDown); cancelAnimationFrame(animationFrameId); };
  }, [colorScheme.compHSL, isLightMode]);

  useEffect(() => {
    const handleGlobalClick = (e) => { if (!isColorPinned && !e.target.closest('button') && !e.target.closest('a')) setNameColor(getContrastSafeColor(isLightMode)); };
    window.addEventListener('click', handleGlobalClick); return () => window.removeEventListener('click', handleGlobalClick);
  }, [isLightMode, isColorPinned]);

  // --- DRAG LOGIC FOR MOBILE ICONS ---
  const [iconsSide, setIconsSide] = useState('right');
  const [isDraggingIcons, setIsDraggingIcons] = useState(false);
  const [showDragHint, setShowDragHint] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dragStartRef = useRef({ x: 0, y: 0 });
  const longPressTimerRef = useRef(null);
  const hintHideTimerRef = useRef(null);
  const wasDraggingRef = useRef(false);

  // Ref to track if hint has been shown this session
  const hasShownHintRef = useRef(false);
  // Ref to track if menu was previously open (to detect close event)
  const wasMenuOpenRef = useRef(false);

  // Trigger Hint on Menu Close
  useEffect(() => {
    if (isMenuOpen) {
      wasMenuOpenRef.current = true;
    } else {
      // Menu just closed (or is initial state). Check if it WAS open.
      if (wasMenuOpenRef.current && !hasShownHintRef.current) {
        setShowDragHint(true);
        hasShownHintRef.current = true;

        clearTimeout(hintHideTimerRef.current);
        hintHideTimerRef.current = setTimeout(() => {
          setShowDragHint(false);
        }, 3000);
      }
    }
  }, [isMenuOpen]);

  // Add Animation Style
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes shuttle-left { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(-5px); } }
      @keyframes shuttle-right { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(5px); } }
      .animate-shuttle-left { animation: shuttle-left 1s ease-in-out infinite; }
      .animate-shuttle-right { animation: shuttle-right 1s ease-in-out infinite; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handleMenuPointerDown = (e) => {
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    wasDraggingRef.current = false;
    // Clear legacy timers if any
    clearTimeout(hintHideTimerRef.current);

    // 2. Drag Timer (0.6s) - Modified to NOT show hint
    longPressTimerRef.current = setTimeout(() => {
      setIsDraggingIcons(true);
      setShowDragHint(false); // Ensure hidden when dragging starts
      wasDraggingRef.current = true;
      if (navigator.vibrate) navigator.vibrate(50);
      e.target.setPointerCapture(e.pointerId);
    }, 600);
  };

  const handleMenuPointerMove = (e) => {
    const clientX = e.clientX;
    const clientY = e.clientY;

    if (isDraggingIcons) {
      setDragOffset({
        x: clientX - dragStartRef.current.x,
        y: clientY - dragStartRef.current.y
      });
    } else {
      const dist = Math.hypot(clientX - dragStartRef.current.x, clientY - dragStartRef.current.y);
      if (dist > 20) {
        clearTimeout(longPressTimerRef.current);
        // Hint logic removed from here
      }
    }
  };

  const handleMenuPointerUp = (e) => {
    clearTimeout(longPressTimerRef.current);

    if (isDraggingIcons) {
      setIsDraggingIcons(false);
      e.target.releasePointerCapture(e.pointerId);

      if (e.clientX < window.innerWidth / 2) {
        setIconsSide('left');
      } else {
        setIconsSide('right');
      }
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();
    if (wasDraggingRef.current) {
      wasDraggingRef.current = false;
      return;
    }
    setIsMenuOpen(!isMenuOpen);
  };

  const theme = {
    text: isLightMode ? 'text-[#18181b]' : 'text-[#ededed]',
    subText: 'text-[var(--muted-color)]',
    border: isLightMode ? 'border-black/10' : 'border-white/20',
    selection: isLightMode ? 'selection:bg-black selection:text-white' : 'selection:bg-white selection:text-black',
    navHover: isLightMode ? 'hover:bg-black/5' : 'hover:bg-white/10',
    highlight: isLightMode ? 'text-black' : 'text-white',
    muted: 'text-[var(--muted-color)]',
  };

  const bioFont = "font-kumbh font-bold";

  const [bioIndex, setBioIndex] = useState(0);

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
        <div className="hero-line flex flex-wrap justify-end gap-[1.5vw]"><span className={`${theme.highlight}`}><HackerText text="Creative" /></span><span className={`${theme.highlight}`}><HackerText text="TEAMS" /></span><span className={`${theme.muted}`}><HackerText text="to" /></span><span className={`${theme.highlight}`}><HackerText text="SCALE" /></span></div>
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
    <div className={`w-full min-h-screen flex items-center justify-center`}>
      <div ref={comp} className={`relative w-full transition-all duration-500 ease-in-out font-sans ${theme.text} ${theme.selection} ${isMobile ? 'h-auto min-h-screen overflow-visible' : 'h-[100dvh] overflow-hidden'}`} style={{ backgroundColor: pageBg, '--muted-color': mutedColor, minHeight: isMobile ? 'var(--app-height)' : '100dvh' }}>

        {/* Backgrounds */}
        <div className="absolute inset-0 z-0">
          <canvas ref={spotlightRef} className="absolute inset-0 z-0 transition-opacity duration-1000 scale-125 pointer-events-none" style={{ filter: 'blur(100px)' }} />
          <div className="absolute inset-0 z-1 pointer-events-none" style={{ backdropFilter: 'blur(30px) saturate(1.2)', WebkitBackdropFilter: 'blur(30px) saturate(1.2)', backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E")`, mixBlendMode: isLightMode ? 'plus-lighter' : 'overlay', opacity: isLightMode ? 0.6 : 0.4 }} />
        </div>
        <canvas ref={rippleCanvasRef} className="fixed inset-0 pointer-events-none z-20" />
        {!isMobile && <div ref={cursorRef} className={`fixed top-0 left-0 w-6 h-6 border ${isLightMode ? 'border-black' : 'border-white'} rounded-full pointer-events-none z-[60] mix-blend-difference -translate-x-1/2 -translate-y-1/2 hidden md:block transition-transform duration-75 ease-out`} />}
        <div className="fixed inset-0 pointer-events-none z-[50] opacity-[0.07] mix-blend-overlay user-select-none"><svg className="w-full h-full"><filter id="globalNoise"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" /></filter><rect width="100%" height="100%" filter="url(#globalNoise)" /></svg></div>

        {/* Mobile Controls */}
        <div
          className={`fixed top-0 p-4 z-50 flex flex-col items-center gap-2 md:hidden pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]`}
          style={{
            right: iconsSide === 'right' ? 0 : 'auto',
            left: iconsSide === 'left' ? 0 : 'auto',
            transform: isDraggingIcons ? `translate(${dragOffset.x}px, ${dragOffset.y}px)` : 'none',
            transition: isDraggingIcons ? 'none' : 'all 0.5s cubic-bezier(0.32, 0.72, 0, 1)'
          }}
        >
          {/* WRAPPER FOR MENU + TOOLTIP (Relative to allow absolute centering) */}
          <div className="relative flex items-center justify-center">
            {/* DRAG HINT TOOLTIP */}
            <div
              className={`absolute pointer-events-none transition-opacity duration-300 ${showDragHint ? 'opacity-100' : 'opacity-0'}`}
              style={{
                top: '50%',
                right: iconsSide === 'right' ? '100%' : 'auto',
                left: iconsSide === 'left' ? '100%' : 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexDirection: iconsSide === 'left' ? 'row' : 'row-reverse',
                marginRight: iconsSide === 'right' ? '12px' : '0',
                marginLeft: iconsSide === 'left' ? '12px' : '0',
                transform: 'translateY(-50%)',
                whiteSpace: 'nowrap'
              }}
            >
              <span className={`text-xs uppercase tracking-widest font-bold ${isLightMode ? 'text-black' : 'text-white'}`}>Drag Me</span>
              {iconsSide === 'right' ? (
                <ChevronsLeft size={18} className={`${isLightMode ? 'text-black' : 'text-white'} animate-shuttle-left`} />
              ) : (
                <ChevronsRight size={18} className={`${isLightMode ? 'text-black' : 'text-white'} animate-shuttle-right`} />
              )}
            </div>

            {/* Menu Button (Top) */}
            <button
              className={`p-2.5 rounded-full backdrop-blur-md border transition-all duration-300 ${isLightMode ? 'border-black/20 hover:bg-black/10' : 'border-white/20 hover:bg-white/10'}`}
              onPointerDown={handleMenuPointerDown}
              onPointerMove={handleMenuPointerMove}
              onPointerUp={handleMenuPointerUp}
              onPointerLeave={handleMenuPointerUp}
              onClick={handleMenuClick}
              style={{
                color: isLightMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)',
                touchAction: 'none',
                cursor: isDraggingIcons ? 'grabbing' : 'pointer',
                zIndex: 20,
                transform: isDraggingIcons ? 'scale(1.2)' : 'scale(1)',
                transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)'
              }}
            >
              {isMenuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>

          {/* Theme Button (Middle) */}
          <button
            className={`p-2.5 rounded-full backdrop-blur-md border transition-all duration-300 ${isLightMode ? 'border-black/20 hover:bg-black/10' : 'border-white/20 hover:bg-white/10'}`}
            onClick={(e) => { e.stopPropagation(); setIsLightMode(!isLightMode); }}
            style={{
              color: isLightMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)',
              zIndex: 10,
              opacity: isDraggingIcons ? 0 : 1,
              transform: isDraggingIcons ? 'translateY(-50px) scale(0.5)' : 'translateY(0) scale(1)',
              transition: 'all 0.3s cubic-bezier(0.32, 0.72, 0, 1)'
            }}
          >
            {isLightMode ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          {/* Pin Button (Bottom) */}
          <button
            className={`p-2.5 rounded-full backdrop-blur-md border transition-all duration-300 ${isLightMode ? 'border-black/20 hover:bg-black/10' : 'border-white/20 hover:bg-white/10'} ${isColorPinned ? (isLightMode ? 'bg-black/20' : 'bg-white/20') : ''}`}
            onClick={(e) => { e.stopPropagation(); setIsColorPinned(!isColorPinned); }}
            style={{
              color: isLightMode ? (isColorPinned ? '#000' : 'rgba(0,0,0,0.6)') : (isColorPinned ? '#fff' : 'rgba(255,255,255,0.6)'),
              zIndex: 5,
              opacity: isDraggingIcons ? 0 : 1,
              transform: isDraggingIcons ? 'translateY(-100px) scale(0.5)' : 'translateY(0) scale(1)',
              transition: 'all 0.3s cubic-bezier(0.32, 0.72, 0, 1)'
            }}
          >
            <PinIcon size={16} className={isColorPinned ? "fill-current" : ""} />
          </button>
        </div>

        {/* DESKTOP LAYOUT */}
        <div className={`relative z-10 h-full w-full pointer-events-none hidden md:flex flex-col`}>
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
                          {!isFirst && (<div className={`py-1 text-left transition-all duration-500 ${isRoleHovered ? 'opacity-100' : 'opacity-0'}`}><span className={`text-[0.8em] ${theme.subText}`} style={{ animation: isRoleHovered ? `intermittent-spin ${3 + (roleIndex * 7 % 4)}s ease-in-out infinite` : 'none', animationDelay: `${(roleIndex * 3) % 2}s`, transformOrigin: 'center center', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '1em', height: '1em' }}><Plus size={12} strokeWidth={3} /></span></div>)}
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
                  <div className={`text-[min(5.5vw,12vh)] leading-none ${bioFont} tracking-tighter mix-blend-difference flex flex-col gap-[1vh] items-end text-right select-none cursor-default`}>
                    {bios[bioIndex]}
                  </div>
                )}
                {activePage === 'about' && (
                  <div className="relative w-full h-full flex flex-col justify-center">
                    <style>{`.custom-scroll::-webkit-scrollbar { width: 10px; } .custom-scroll::-webkit-scrollbar-track { background: transparent; border: 1px solid ${isLightMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)'}; border-radius: 999px; margin-block: 20vh; } .custom-scroll::-webkit-scrollbar-thumb { background: ${isLightMode ? 'black' : 'white'}; border-radius: 999px; border: 2px solid transparent; background-clip: content-box; } .custom-scroll::-webkit-scrollbar-thumb:hover { background: ${isLightMode ? '#333' : '#ddd'}; background-clip: content-box; }`}</style>
                    <div className="flex w-full gap-12 px-2 h-full items-center">
                      <div className="flex flex-col w-[30%] h-full gap-6 pt-5">
                        <div className={`flex-1 w-full rounded-2xl border ${theme.border} bg-white/5 backdrop-blur-sm overflow-hidden relative group`}><div className="absolute inset-0 flex items-center justify-center"><span className={`text-xs uppercase tracking-widest ${theme.subText}`}>Picture</span></div></div>
                        <div><h3 className={`text-xs uppercase tracking-[0.2em] mb-3 ${theme.subText} text-left`}>Expertise</h3><div className="flex flex-wrap gap-2 text-[0.7rem] justify-start">{['Creative Ops Strategy', 'Hybrid Workflow Design', 'AIGC Pipeline Arch.', 'Art Direction', 'Brand Systems', 'Tech-Art Leadership'].map((skill, i) => (<div key={i} className={`px-2 py-1.5 rounded border ${theme.border} uppercase tracking-wider text-left bg-transparent whitespace-nowrap`}>{skill}</div>))}</div></div>
                      </div>
                      <div ref={aboutContentRef} className={`flex-1 h-full overflow-y-auto pr-6 custom-scroll ${theme.text} text-left pt-5 flex flex-col justify-center`} style={{ maskImage: 'linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)' }}>
                        <div className="space-y-6 leading-relaxed text-base max-w-prose mx-auto text-justify">
                          <p>Hi, I'm Vinz, I help Creative Teams escape production limits and maximize their impact.</p>
                          <p>With over 12 years of experience as a Lead Artist and Educator, I bridge the gap between traditional artistry and modern efficiency. I do not replace artists; I empower them with Hybrid Design Systems—workflows that let AI handle the repetitive "drafting" so your team can focus entirely on high-fidelity polish and creative strategy.</p>

                          <div className="mt-6">
                            <h4 className={`text-xs uppercase tracking-widest font-bold ${theme.subText} mb-4`}>My Focus:</h4>
                            <ul className="space-y-4 list-none pl-0">
                              <li className="pl-4 border-l-2 border-white/20">
                                <span className="font-bold block mb-1">Empowering Artists</span>
                                <span className={`${theme.subText} text-sm`}>Training teams to use AI as a tool for control, not a replacement.</span>
                              </li>
                              <li className="pl-4 border-l-2 border-white/20">
                                <span className="font-bold block mb-1">Protecting Integrity</span>
                                <span className={`${theme.subText} text-sm`}>Using AI for the "base," while human taste handles the "finish."</span>
                              </li>
                              <li className="pl-4 border-l-2 border-white/20">
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
                {activePage === 'work' && (<div className={`${theme.text} max-w-2xl text-right space-y-6`}><h2 className={`text-3xl font-bold uppercase tracking-wide mb-6`} style={{ color: colorScheme.base }}>Work</h2><p className="leading-relaxed text-base">Featured projects and case studies coming soon. I specialize in AI-driven creative solutions and strategic implementations for forward-thinking organizations.</p><button onClick={() => handlePageChange('home')} className={`mt-6 px-4 py-2 rounded-full border ${theme.border} ${theme.navHover} transition-all duration-300 text-xs uppercase tracking-widest`} style={{ borderColor: colorScheme.compString, color: colorScheme.compString }}>← Back to Home</button></div>)}
                {activePage === 'contact' && (<div className={`${theme.text} max-w-2xl text-right space-y-6`}><h2 className={`text-3xl font-bold uppercase tracking-wide mb-6`} style={{ color: colorScheme.base }}>Contact</h2><div className="leading-relaxed text-base space-y-4"><p>Let's discuss how AI can transform your creative workflow.</p><div className="space-y-2"><p className={`${theme.subText} text-sm uppercase tracking-widest`}>Email</p><p>hello@vinztan.com</p></div><div className="space-y-2"><p className={`${theme.subText} text-sm uppercase tracking-widest`}>Location</p><p>Kuala Lumpur, Malaysia</p></div></div><button onClick={() => setActivePage('home')} className={`mt-6 px-4 py-2 rounded-full border ${theme.border} ${theme.navHover} transition-all duration-300 text-xs uppercase tracking-widest`} style={{ borderColor: colorScheme.compString, color: colorScheme.compString }}>← Back to Home</button></div>)}
              </div>
            </div>
          </div>
          <div className="flex-none w-full px-[4%] py-[2vh] pb-[6vh] pointer-events-auto"><div className="flex items-center justify-between w-full footer-elem"><div className={`${theme.subText} w-[25%] lg:w-[13%] min-w-[140px]`}><div className="flex flex-col leading-tight tracking-widest uppercase font-sans" style={{ fontSize: 'clamp(0.2rem, 0.7vw, 0.8rem)' }}><div className="whitespace-nowrap font-light">Based in Malaysia</div><div className="font-light">@ 2026</div></div></div><div className={`${theme.subText} text-[10px] uppercase tracking-widest opacity-60 animate-pulse`}>Scroll for more ↓</div><div className="flex items-center gap-8"><a href="#" className={`transition-colors duration-300 transform hover:scale-110`} onMouseEnter={() => setHoveredEl('linkedin')} onMouseLeave={() => setHoveredEl(null)} style={{ color: hoveredEl === 'linkedin' ? colorScheme.compString : (isLightMode ? '#000' : '#fff') }} aria-label="LinkedIn"><svg role="img" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" /></svg></a><a href="mailto:hello@vinztan.com" className={`transition-colors duration-300 transform hover:scale-110`} onMouseEnter={() => setHoveredEl('mail')} onMouseLeave={() => setHoveredEl(null)} style={{ color: hoveredEl === 'mail' ? colorScheme.compString : (isLightMode ? '#000' : '#fff') }} aria-label="Email"><svg role="img" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-.4 4.25l-7.07 4.42c-.32.2-.74.2-1.06 0L4.4 8.25c-.25-.16-.4-.43-.4-.72 0-.67.73-1.07 1.3-.72L12 11l6.7-4.19c.57-.35 1.3.05 1.3.72 0 .29-.15.56-.4.72z" /></svg></a></div></div></div>
        </div>

        {/* MOBILE LAYOUT */}
        <div className={`relative z-10 block w-full pointer-events-auto md:hidden`}>
          <div className={`fixed inset-0 z-40 bg-black/95 backdrop-blur-xl transition-transform duration-500 flex flex-col items-center justify-center gap-6 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            {['Home', 'About', 'Projects', 'Contact'].map((item) => {
              let sectionId = 'mobile-home'; if (item === 'About') sectionId = 'mobile-about'; if (item === 'Projects') sectionId = 'mobile-work'; if (item === 'Contact') sectionId = 'mobile-contact'; const isName = item === 'About';
              return (<button key={item} onClick={() => { setIsMenuOpen(false); const el = document.getElementById(sectionId); if (el) el.scrollIntoView({ behavior: 'smooth' }); }} className={`text-4xl uppercase tracking-widest transition-colors duration-300 ${isName ? 'font-black' : 'font-light'}`} style={{ color: 'white' }}>{item}</button>);
            })}
            <div className="mt-8 pt-8 border-t border-white/10 flex flex-col items-center gap-4"><div className="text-[10px] uppercase tracking-widest text-white/50 text-center leading-relaxed">Based in Malaysia<br />© 2026</div><div className="flex items-center gap-6"><a href="#" className="text-white/60 hover:text-white transition-colors" aria-label="LinkedIn"><svg role="img" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" /></svg></a><a href="mailto:hello@vinztan.com" className="text-white/60 hover:text-white transition-colors" aria-label="Email"><svg role="img" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-.4 4.25l-7.07 4.42c-.32.2-.74.2-1.06 0L4.4 8.25c-.25-.16-.4-.43-.4-.72 0-.67.73-1.07 1.3-.72L12 11l6.7-4.19c.57-.35 1.3.05 1.3.72 0 .29-.15.56-.4.72z" /></svg></a></div></div>
          </div>

          {/* 1. HOME SECTION */}
          {/* FIX: Added 'px-4' here. Now ALL children (Bio, Name, Scroll Text) align perfectly. */}
          <section id="mobile-home" className="min-h-screen flex flex-col justify-center py-24 relative px-4 gap-8" style={{ minHeight: 'var(--app-height)' }}>

            {/* Bio Text */}
            {/* REMOVED: 'px-4' from here. It inherits width from the parent section. */}
            <div className={`${bioFont} tracking-tighter mix-blend-difference flex flex-col w-full gap-6`}>
              <ScaleText className={`${theme.highlight} font-bold`} lineHeight={0.75}>
                AI <span className={theme.muted}>didn't</span>
              </ScaleText>
              <ScaleText className="font-bold" lineHeight={0.75}>
                <span className={theme.muted}>kill </span>
                <span className={theme.highlight}>DESIGN</span>
              </ScaleText>
              <ScaleText className={`${theme.muted} font-bold`} lineHeight={0.75}>
                ; it is <span className={theme.highlight}>PART of </span>
                <span className={theme.muted}>the</span>
              </ScaleText>
              <ScaleText className={`${theme.highlight} font-bold`} lineHeight={0.75}>
                FUTURE
              </ScaleText>
              <ScaleText className={`${theme.highlight} font-bold`} lineHeight={0.75}>
                DESIGN
              </ScaleText>
            </div>

            {/* Title Block */}
            <div className="flex flex-col items-start gap-0.5 px-2">
              <div className={`font-sans flex flex-col leading-none`}>
                <div className={`flex flex-col items-start`}>
                  <div key={currentRoleIndex} className="flex flex-col items-start" style={{ color: isLightMode ? '#18181b' : '#ededed' }}>
                    <span className="text-xl tracking-widest font-medium">{roles[currentRoleIndex].split(' ')[0]}</span>
                    <span className="text-xl tracking-widest -mt-1 font-light">{roles[currentRoleIndex].split(' ')[1]}</span>
                  </div>
                </div>
                <h2 className={`font-sans font-bold text-4xl uppercase tracking-regular mb-1 mt-2 transition-colors duration-300`} style={{ color: nameColor }}>
                  Vinz Tan
                </h2>
              </div>
            </div>

            {/* Scroll Indicator */}
            <div className={`absolute bottom-8 left-0 w-full text-center ${theme.subText} text-[10px] uppercase tracking-widest opacity-60 animate-pulse pointer-events-none`}>
              Scroll for more ↓
            </div>
          </section>

          <section id="mobile-about" className="min-h-screen py-24 px-6 flex flex-col justify-center" style={{ minHeight: 'var(--app-height)' }}><div className={`flex flex-col w-full ${theme.text}`}><div className={`w-full aspect-square rounded-2xl border ${theme.border} bg-white/5 backdrop-blur-sm mb-6 flex items-center justify-center`}><span className={`text-xs uppercase tracking-widest ${theme.subText}`}>Picture</span></div><div className="mb-6"><h3 className={`text-xs uppercase tracking-[0.2em] mb-3 ${theme.subText}`}>Expertise</h3><div className="flex flex-wrap gap-2 text-[0.7rem]">{['Creative Ops Strategy', 'Hybrid Workflow Design', 'AIGC Pipeline Arch.', 'Art Direction', 'Brand Systems', 'Tech-Art Leadership'].map((skill, i) => (<div key={i} className={`px-2 py-1.5 rounded border ${theme.border} uppercase tracking-wider bg-transparent whitespace-nowrap`}>{skill}</div>))}</div></div><div className="space-y-4 leading-relaxed text-sm"><p>I'm Vinz Tan, I help Creative Teams escape production limits and maximize their impact.
            With over 12 years of experience as a Lead Artist and Educator, I bridge the gap between traditional artistry and modern efficiency. I do not replace artists; I empower them with Hybrid Design Systems—workflows that let AI handle the repetitive "drafting" so your team can focus entirely on high-fidelity polish and creative strategy.
            My Focus:
            • Empowering Artists: Training teams to use AI as a tool for control, not a replacement.
            • Protecting Integrity: Using AI for the "base," while human taste handles the "finish."
            • Scaling Output: Removing bottlenecks so teams can create more without burnout.</p></div></div></section>
          <section id="mobile-work" className="min-h-screen py-24 px-6 flex flex-col justify-center" style={{ minHeight: 'var(--app-height)' }}><div className={`flex flex-col w-full ${theme.text}`}><h2 className={`text-3xl font-bold uppercase tracking-wide mb-6`} style={{ color: colorScheme.base }}>Work</h2><p className="leading-relaxed text-sm mb-8">Featured projects coming soon...</p></div></section>
          <section id="mobile-contact" className="min-h-screen py-24 px-6 flex flex-col justify-between" style={{ minHeight: 'var(--app-height)' }}><div className={`flex flex-col w-full ${theme.text}`}><h2 className={`text-3xl font-bold uppercase tracking-wide mb-6`} style={{ color: colorScheme.base }}>Contact</h2><p className="leading-relaxed text-sm mb-8">Let's discuss...</p><div className="space-y-4 text-sm"><div><p className={`${theme.subText} text-xs uppercase tracking-widest`}>Email</p><p>hello@vinztan.com</p></div></div></div><div className="w-full flex flex-row items-end justify-between mt-12 pt-12 border-t border-white/10"><div className={`text-[10px] uppercase tracking-widest ${theme.subText} text-left leading-tight`}>Based in Malaysia <br /> @ 2026</div><div className="flex items-center gap-6"><a href="#" className={`${theme.subText} hover:scale-110 transition-transform`} aria-label="LinkedIn"><svg role="img" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" /></svg></a><a href="mailto:hello@vinztan.com" className={`${theme.subText} hover:scale-110 transition-transform`} aria-label="Email"><svg role="img" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-.4 4.25l-7.07 4.42c-.32.2-.74.2-1.06 0L4.4 8.25c-.25-.16-.4-.43-.4-.72 0-.67.73-1.07 1.3-.72L12 11l6.7-4.19c.57-.35 1.3.05 1.3.72 0 .29-.15.56-.4.72z" /></svg></a></div></div></section>
        </div>
      </div>
    </div>
  );
}