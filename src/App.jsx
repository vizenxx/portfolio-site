import React, { useEffect, useRef, useState, useMemo } from 'react';
import { ReactLenis } from '@studio-freight/react-lenis'
import gsap from 'gsap';

// Components
import DesktopLayout from './components/DesktopLayout';
import MobileLayout from './components/MobileLayout';

// Shared Utilities
// Kept locally for now

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

export default function App() {
  const getContrastSafeColor = (isLight) => {
    const lightModeColors = ['#DC2626', '#EA580C', '#15803D', '#2563EB', '#7C3AED', '#ae0c67', '#4338CA'];
    const darkModeColors = ['#FF3B30', '#FF9500', '#FFCC00', '#007AFF', '#FF2D55', '#00FF00', '#00FFFF', '#dc40fd'];
    const palette = isLight ? lightModeColors : darkModeColors;
    return palette[Math.floor(Math.random() * palette.length)];
  };

  const [isLightMode, setIsLightMode] = useState(false);
  const [isColorPinned, setIsColorPinned] = useState(false);
  const [activePage, setActivePage] = useState('home');
  // FIX: Initialize with function to check immediately to avoid double-render (Desktop -> Mobile)
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 768 : false));

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    const setAppHeight = () => {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    };
    checkMobile();
    setAppHeight();
    window.addEventListener('resize', () => {
      checkMobile();
      setAppHeight();
    });
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // --- STATE FOR DESKTOP (Can be shared if needed) ---
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
    // OPTIMIZATION: Reduce spot count for mobile (2-3) vs Desktop (3-7)
    // 3-7 spots logic: floor(random * 5) + 3
    // 2-3 spots logic: floor(random * 2) + 2
    const spotCount = isMobile ? (Math.floor(Math.random() * 2) + 2) : (Math.floor(Math.random() * 5) + 3);
    const maxAttempts = 50;

    for (let i = 0; i < spotCount; i++) {
      // ... (Keeping exact logic)
      let attempts = 0;
      let valid = false;
      let newSpot = {};
      while (!valid && attempts < maxAttempts) {
        attempts++;
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        const radius = 150 + Math.random() * 150;
        let overlap = false;
        for (const spot of spotsRef.current) {
          const dx = x - spot.x;
          const dy = y - spot.y;
          const dist = Math.hypot(dx, dy);
          if (dist < (radius + spot.baseRadius) * 0.75) { overlap = true; break; }
        }
        if (!overlap) {
          valid = true;
          newSpot = { x, y, offsetX: Math.random() * 1000, offsetY: Math.random() * 1000, speedX: 0.001 + Math.random() * 0.002, speedY: 0.001 + Math.random() * 0.002, baseRadius: radius };
        }
      }
      if (valid) { spotsRef.current.push(newSpot); }
      else { spotsRef.current.push({ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, offsetX: Math.random() * 1000, offsetY: Math.random() * 1000, speedX: 0.001 + Math.random() * 0.002, speedY: 0.001 + Math.random() * 0.002, baseRadius: 150 + Math.random() * 150 }); }
    }
  };

  useEffect(() => { randomizeSpots(); }, [isMobile]);

  const bioRef = useRef(null);
  const containerRef = useRef(null);
  const aboutContentRef = useRef(null);
  const isTransitioning = useRef(false);

  useEffect(() => {
    // Wheel event logic for pagination
    const handleWheel = (e) => {
      if (isTransitioning.current || isMobile) return;
      if (Math.abs(e.deltaY) < 40) return;
      // Scroll inside specific divs prevention
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
  }, [activePage, isMobile]);

  // Handle Page Transition (GSAP)
  const handlePageChange = (newPage) => {
    if (newPage === activePage || isTransitioning.current) return;
    // CRITICAL FIX: Disable GSAP page transitions on Mobile or if refs are missing
    if (isMobile || !bioRef.current) {
      setActivePage(newPage);
      return;
    }

    isTransitioning.current = true;
    const angle = Math.random() * 360; const radian = angle * (Math.PI / 180);
    const distance = 2000; const destX = Math.cos(radian) * distance; const destY = Math.sin(radian) * distance;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setActivePage(newPage); randomizeSpots();
          trailRipplesRef.current = [];
          clickRipplesRef.current = [];
          // Reset positions hidden
          if (bioRef.current) gsap.set(bioRef.current, { x: -destX * 0.5, y: -destY * 0.5, opacity: 0, scale: 0.8, filter: 'blur(10px)' });
          if (rippleCanvasRef.current) gsap.set(rippleCanvasRef.current, { x: -destX * 0.5, y: -destY * 0.5, opacity: 0, scale: 0.8, filter: 'blur(10px)' });

          // Animate in
          if (bioRef.current) gsap.to(bioRef.current, { x: 0, y: 0, opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.5, ease: 'power4.out' });
          if (rippleCanvasRef.current) gsap.to(rippleCanvasRef.current, { x: 0, y: 0, opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.5, ease: 'power4.out' });
          if (spotlightRef.current) gsap.to(spotlightRef.current, { x: 0, y: 0, opacity: 1, scale: 1.25, filter: 'blur(100px)', duration: 0.5, ease: 'power4.out', onComplete: () => { isTransitioning.current = false; } });
        }
      });
      // Animate out
      const targetsOut = [bioRef.current, rippleCanvasRef.current].filter(Boolean);
      if (targetsOut.length > 0) {
        tl.to(targetsOut, { x: destX, opacity: 0, scale: 1.2, filter: 'blur(40px)', duration: 0.3, ease: 'expo.in' });
        if (bioRef.current) tl.to(bioRef.current, { y: destY, duration: 0.3, ease: 'linear' }, "<");
      }

      const bgTravelDist = destX * 0.5; const bgTravelDistY = destY * 0.5;
      if (spotlightRef.current) {
        tl.to(spotlightRef.current, { x: bgTravelDist, opacity: 0, scale: 1.1, filter: 'blur(80px)', duration: 0.3, ease: 'expo.in' }, "<");
        tl.to(spotlightRef.current, { y: bgTravelDistY, duration: 0.3, ease: 'linear' }, "<");
        tl.set(spotlightRef.current, { x: -bgTravelDist, y: -bgTravelDistY, opacity: 0, scale: 1.1, filter: 'blur(40px)' });
      }

      clickShockwaveRef.current = 2000;
      spotsRef.current.forEach(spot => { gsap.to(spot, { x: spot.x + -destX * 0.05, y: spot.y + -destY * 0.05, duration: 0.5, ease: 'power2.inOut' }); });
    }, containerRef);
  };

  const colorScheme = useMemo(() => {
    const hsl = hexToHSL(nameColor); const compHue = (hsl.h + 180) % 360;
    return { base: nameColor, compHSL: { h: compHue, s: hsl.s, l: hsl.l }, compString: HSLToRGBString(compHue, hsl.s, hsl.l) };
  }, [nameColor]);

  useEffect(() => { if (!isColorPinned) setNameColor(getContrastSafeColor(isLightMode)); }, [isLightMode, isColorPinned]);

  // ========== GLOBAL BACKGROUND COLORS ==========
  const BG_DARK = '#1a231d';    // Grey-green (dark mode)
  const BG_LIGHT = '#e8d4f0';   // Light purple (light mode)
  // ================================================

  const pageBg = isLightMode ? BG_LIGHT : BG_DARK;

  const mutedColor = useMemo(() => {
    const { h, l } = colorScheme.compHSL;
    const sMuted = 10;
    let lMuted = isLightMode ? (l - 5) : (l + 5); lMuted = Math.max(0, Math.min(100, lMuted));
    return HSLToRGBString(h, sMuted, lMuted);
  }, [colorScheme, isLightMode]);

  // Apply background color to document root (global)
  useEffect(() => {
    document.documentElement.style.setProperty('--page-bg', pageBg);
  }, [pageBg]);

  const cursorRef = useRef(null); const spotlightRef = useRef(null); const rippleCanvasRef = useRef(null);

  useEffect(() => { targetConfigRef.current = { h: colorScheme.compHSL.h, s: colorScheme.compHSL.s, l: colorScheme.compHSL.l, a: isLightMode ? 0.125 : 0.1 }; }, [colorScheme.compHSL, isLightMode]);

  // Spotlight Effect Canvas
  useEffect(() => {
    const canvas = spotlightRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); let animationFrameId; let currentColor = { ...targetConfigRef.current };
    let mousePos = { x: -1000, y: -1000 }; let mouseActive = false; let mouseTimer; let time = 0;
    const resizeCanvas = () => {
      if (canvas.parentElement) {
        // OPTIMIZATION: Cap pixel ratio on mobile to save GPU
        const dpr = isMobile ? Math.min(window.devicePixelRatio, 1.5) : window.devicePixelRatio;
        canvas.width = canvas.parentElement.offsetWidth * dpr;
        canvas.height = canvas.parentElement.offsetHeight * dpr;
        ctx.scale(dpr, dpr);
      }
    };
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

  // Ripple Effect Canvas
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

  // Global Click handler for color change
  useEffect(() => {
    const handleGlobalClick = (e) => { if (!isColorPinned && !e.target.closest('button') && !e.target.closest('a')) setNameColor(getContrastSafeColor(isLightMode)); };
    window.addEventListener('click', handleGlobalClick); return () => window.removeEventListener('click', handleGlobalClick);
  }, [isLightMode, isColorPinned]);

  // Update meta theme color dynamically
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', isLightMode ? '#ffffff' : '#000000');
    }
  }, [isLightMode]);

  const theme = {
    text: isLightMode ? 'text-[#18181b]' : 'text-[#ededed]',
    subText: 'text-[var(--muted-color)]',
    border: isLightMode ? 'border-black/10' : 'border-white/20',
    selection: isLightMode ? 'selection:bg-black selection:text-white' : 'selection:bg-white selection:text-black',
    navHover: isLightMode ? 'hover:bg-black/5' : 'hover:bg-white/10',
    highlight: isLightMode ? 'text-black' : 'text-white',
    muted: 'text-[var(--muted-color)]',
  };

  return (
    <ReactLenis root>
      <div className={`w-full ${isMobile ? '' : 'flex items-center justify-center'}`}>

        <div ref={containerRef} className={`relative w-full transition-colors duration-500 ease-in-out font-sans ${theme.text} ${theme.selection} ${isMobile ? '' : 'overflow-hidden'}`} style={{ '--muted-color': mutedColor }}>

          {/* Backgrounds - Mobile: fixed to viewport, Desktop: absolute to container */}
          <div className={`${isMobile ? 'fixed' : 'absolute'} inset-0 z-0 pointer-events-none`}>
            <canvas ref={spotlightRef} className="absolute inset-0 z-0 transition-opacity duration-1000 scale-125 pointer-events-none" style={{ filter: isMobile ? 'blur(40px)' : 'blur(100px)' }} />
            <div className="absolute inset-0 z-1 pointer-events-none" style={{ backdropFilter: isMobile ? 'none' : 'blur(30px) saturate(1.2)', WebkitBackdropFilter: isMobile ? 'none' : 'blur(30px) saturate(1.2)', backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E")`, mixBlendMode: isLightMode ? 'plus-lighter' : 'overlay', opacity: isMobile ? 0 : (isLightMode ? 0.6 : 0.4) }} />
          </div>
          <canvas ref={rippleCanvasRef} className="fixed inset-0 pointer-events-none z-20" style={{ maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)' }} />
          {!isMobile && <div ref={cursorRef} className={`fixed top-0 left-0 w-6 h-6 border ${isLightMode ? 'border-black' : 'border-white'} rounded-full pointer-events-none z-[60] mix-blend-difference -translate-x-1/2 -translate-y-1/2 hidden md:block transition-transform duration-75 ease-out`} />}
          {!isMobile && <div className="fixed inset-0 pointer-events-none z-[50] opacity-[0.07] mix-blend-overlay user-select-none"><svg className="w-full h-full"><filter id="globalNoise"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" /></filter><rect width="100%" height="100%" filter="url(#globalNoise)" /></svg></div>}

          {/* CONTENT */}
          <div className={`relative z-10 ${isMobile ? '' : 'h-full w-full'}`}>
            {!isMobile && (
              <DesktopLayout
                activePage={activePage}
                handlePageChange={handlePageChange}
                clickedItem={clickedItem}
                setClickedItem={setClickedItem}
                hoveredNav={hoveredNav}
                setHoveredNav={setHoveredNav}
                isLightMode={isLightMode}
                setIsLightMode={setIsLightMode}
                theme={theme}
                colorScheme={colorScheme}
                nameColor={nameColor}
                roles={roles}
                currentRoleIndex={currentRoleIndex}
                isRoleHovered={isRoleHovered}
                setIsRoleHovered={setIsRoleHovered}
                bioRef={bioRef}
                aboutContentRef={aboutContentRef}
                hoveredEl={hoveredEl}
                setHoveredEl={setHoveredEl}
                isColorPinned={isColorPinned}
                setIsColorPinned={setIsColorPinned}
              />
            )}
          </div>

        </div>

        {/* Mobile Layout - Rendered LAST to ensure top z-index priority and clickable */}
        {isMobile && (
          <MobileLayout
            activePage={activePage}
            handlePageChange={handlePageChange}
            isLightMode={isLightMode}
            setIsLightMode={setIsLightMode}
            theme={theme}
            colorScheme={colorScheme}
            nameColor={nameColor}
            roles={roles}
            currentRoleIndex={currentRoleIndex}
            isColorPinned={isColorPinned}
            setIsColorPinned={setIsColorPinned}
          />
        )}
      </div>
    </ReactLenis>
  );
}