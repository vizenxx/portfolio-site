import React, { useEffect, useRef, useState, useMemo, useLayoutEffect } from 'react';
import { ReactLenis } from '@studio-freight/react-lenis'
import gsap from 'gsap';

// Components
import DesktopLayout from './components/DesktopLayout';
import LandscapeTabletLayout from './components/LandscapeTabletLayout';
import PortraitMobileLayout from './components/PortraitMobileLayout';

// Shared Utilities
// Kept locally for now

const hexToHSL = (H) => {
  let r = 0, g = 0, b = 0;
  if (H.length === 4) { r = "0x" + H[1] + H[1]; g = "0x" + H[2] + H[2]; b = "0x" + H[3] + H[3]; }
  else if (H.length === 7 || H.length === 9) { r = "0x" + H[1] + H[2]; g = "0x" + H[3] + H[4]; b = "0x" + H[5] + H[6]; }
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
    const lightModeColors = ['#DC2626', '#EA580C', '#0b9b19ff', '#2563EB', '#7C3AED', '#ae0c67', '#4338CA'];
    const darkModeColors = ['#FF3B30', '#FF9500', '#FFCC00', '#007AFF', '#FF2D55', '#00FF00', '#00FFFF', '#dc40fd'];
    const palette = isLight ? lightModeColors : darkModeColors;
    return palette[Math.floor(Math.random() * palette.length)];
  };

  const [isLightMode, setIsLightMode] = useState(false);
  const [isColorPinned, setIsColorPinned] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [imageProgress, setImageProgress] = useState(0);
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const isAudioInitialized = useRef(false);
  const userDecidedMute = useRef(false);
  const [activePage, setActivePage] = useState('home');

  // Audio Logic (v13.92 - Refined Auto-start Fallback)
  useEffect(() => {
    const audio = new Audio('/portfolio-site/music/BGM.MP3');
    audio.loop = true;
    audio.volume = 0;
    audio.muted = true; // Essential for browser autoplay permission
    audioRef.current = audio;

    // Attempt immediate play (muted)
    audio.play().then(() => {
      console.log("Muted autoplay started successfully.");
    }).catch(() => {
      console.log("Muted autoplay blocked.");
    });

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleAudio = (forceState, isManual = false) => {
    if (!audioRef.current) return;

    // 1. If user manually interacts, they take full control forever
    if (isManual) {
      userDecidedMute.current = true;
    }

    // Bass Boost & Context Setup (Only once)
    if (!audioContextRef.current && !isAudioInitialized.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      try {
        const source = ctx.createMediaElementSource(audioRef.current);
        const bassFilter = ctx.createBiquadFilter();
        bassFilter.type = 'lowshelf';
        bassFilter.frequency.value = 150;
        bassFilter.gain.value = 12;
        source.connect(bassFilter);
        bassFilter.connect(ctx.destination);
        audioContextRef.current = ctx;
        isAudioInitialized.current = true;
      } catch (e) {
        console.log("Audio node already connected.");
        audioContextRef.current = ctx; // Still track context
        isAudioInitialized.current = true;
      }
    }

    const shouldPlay = typeof forceState === 'boolean' ? forceState : !isPlaying;

    if (!shouldPlay) {
      // Manual Mute: Kill all tweens and fade volume to zero
      gsap.killTweensOf(audioRef.current);
      gsap.to(audioRef.current, {
        volume: 0, duration: 0.8, onComplete: () => {
          if (audioRef.current) audioRef.current.pause();
        }
      });
      setIsPlaying(false);
    } else {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      // Unmute and Start Fade-in
      audioRef.current.muted = false;

      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          gsap.killTweensOf(audioRef.current);
          gsap.to(audioRef.current, {
            volume: 0.4,
            duration: 2.5,
            ease: "sine.inOut",
            onStart: () => setIsPlaying(true)
          });
        }).catch(e => {
          console.log("Auto-start waiting for interaction...");
          setIsPlaying(false);
        });
      }
    }
  };

  // One-time Interaction Fallback
  useEffect(() => {
    const handleEngagement = () => {
      // If user hasn't explicitly muted, try to start (Skip auto-start on Mobile)
      if (!isMobile && !userDecidedMute.current && !isPlaying) {
        if (audioRef.current) {
          // MOST AGGRESSIVE MOBILE FIX: Direct play in gesture handler (Only for desktop engagement now)
          audioRef.current.muted = false;
          if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
          }
          audioRef.current.play()
            .then(() => toggleAudio(true))
            .catch(e => console.log("Still blocked..."));
        }
      }

      // Remove permanently after engagement attempt
      window.removeEventListener('click', handleEngagement, true);
      window.removeEventListener('touchstart', handleEngagement, true);
      window.removeEventListener('mousedown', handleEngagement, true);
      window.removeEventListener('pointerdown', handleEngagement, true);
    };

    window.addEventListener('click', handleEngagement, true);
    window.addEventListener('touchstart', handleEngagement, true);
    window.addEventListener('mousedown', handleEngagement, true);
    window.addEventListener('pointerdown', handleEngagement, true);

    const timer = setTimeout(() => {
      if (!isMobile && !userDecidedMute.current && !isPlaying) {
        toggleAudio(true);
      }
    }, 2000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', handleEngagement, true);
      window.removeEventListener('touchstart', handleEngagement, true);
      window.removeEventListener('mousedown', handleEngagement, true);
      window.removeEventListener('pointerdown', handleEngagement, true);
    };
  }, [isPlaying]);

  // Debug Version
  useEffect(() => { console.log('Portfolio Version: v13.92 (Refined Auto-start Fallback)'); }, []);

  // Layout detection (v14.07)
  const [layoutMode, setLayoutMode] = useState(() => {
    if (typeof window === 'undefined') return 'desktop';
    const isPortrait = window.innerHeight > window.innerWidth;
    if (isPortrait || window.innerWidth < 768) return 'portrait-mobile';
    if (window.innerWidth < 1200) return 'landscape-tablet';
    return 'desktop';
  });

  // Keep isMobile for legacy logic check (music, etc)
  const isMobile = layoutMode === 'portrait-mobile' || layoutMode === 'landscape-tablet';

  useEffect(() => {
    const checkLayout = () => {
      const isPortrait = window.innerHeight > window.innerWidth;
      const w = window.innerWidth;
      if (isPortrait || w < 768) setLayoutMode('portrait-mobile');
      else if (w < 1200) setLayoutMode('landscape-tablet');
      else setLayoutMode('desktop');
    };
    const setAppHeight = () => {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    };
    checkLayout();
    setAppHeight();
    window.addEventListener('resize', () => {
      checkLayout();
      setAppHeight();
    });
    return () => window.removeEventListener('resize', checkLayout);
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

  const [nameColor, setNameColor] = useState(() => getContrastSafeColor(true));
  const isTouchDevice = useRef(false);
  const [isTouchActive, setIsTouchActive] = useState(false);
  const trailRipplesRef = useRef([]);
  const clickRipplesRef = useRef([]);
  const spotsRef = useRef([]);
  const clickShockwaveRef = useRef(0);
  const targetConfigRef = useRef({ h: 0, s: 0, l: 0, a: 0.1 });

  // Global interaction listeners (v14.07)
  useEffect(() => {
    const handleFirstInteraction = (e) => {
      if (e.pointerType === 'touch' || e.type === 'touchstart') {
        isTouchDevice.current = true;
      }
      // Remove this listener after the first interaction
      window.removeEventListener('pointerdown', handleFirstInteraction, { once: true });
      window.removeEventListener('touchstart', handleFirstInteraction, { once: true });
    };

    const handleTouchStart = () => {
      isTouchDevice.current = true;
      setIsTouchActive(true);
      // Reset reactive hover states on any touch interaction
      setHoveredNav(null);
      setHoveredEl(null);
      setIsRoleHovered(false);
      if (cursorRef.current) cursorRef.current.style.opacity = '0';
    };

    window.addEventListener('pointerdown', handleFirstInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true }); // Passive for performance

    return () => {
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, []);

  const randomizeSpots = () => {
    spotsRef.current = [];
    // OPTIMIZATION: Adjusted spot count (v13.48)
    // Desktop: Base 3 + up to 4 random (Range: 3-7)
    // Mobile: Base 2 + up to 1 random (Range: 2-3)
    const spotCount = isMobile ? (2 + Math.floor(Math.random() * 2)) : (3 + Math.floor(Math.random() * 5));
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
        // Radius: Desktop (25vw, varies slightly) | Mobile (25vh, varies slightly)
        // We use a base 25 unit relative to the dimension. (v13.45)
        const radius = isMobile
          ? (window.innerHeight * 0.25)
          : (window.innerWidth * 0.25);

        let overlap = false;
        for (const spot of spotsRef.current) {
          const dx = x - spot.x;
          const dy = y - spot.y;
          const dist = Math.hypot(dx, dy);
          // 65% Overlap Rule: If distance is less than 65% of the combined radii, they are "too close"
          if (dist < (radius + spot.baseRadius) * 0.65) { overlap = true; break; }
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

  const grcRef = useRef(null);
  const gccRef = useRef(null);
  const detailPanelRef = useRef(null);
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

    if (layoutMode === 'landscape-tablet') {
      setActivePage(newPage);
      return;
    }
    // CRITICAL FIX: Disable GSAP page transitions on Mobile or if refs are missing
    if (isMobile || !grcRef.current) {
      setActivePage(newPage);
      setImageProgress(0); // Reset scroll position when switching pages (v13.96)
      return;
    }

    isTransitioning.current = true;
    const angle = Math.random() * 360; const radian = angle * (Math.PI / 180);
    const distance = 2000; const destX = Math.cos(radian) * distance; const destY = Math.sin(radian) * distance;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setActivePage(newPage); randomizeSpots();
          setImageProgress(0); // Reset scroll position when switching pages (v13.96)
          trailRipplesRef.current = [];
          clickRipplesRef.current = [];

          // Wait for React to mount the new page's elements
          requestAnimationFrame(() => {
            // Reset positions hidden - Subtler blur and closer starting position
            if (grcRef.current) gsap.set(grcRef.current, { x: -destX * 0.3, y: -destY * 0.3, opacity: 0, scale: 0.95, filter: 'blur(5px)' });
            if (gccRef.current) gsap.set(gccRef.current, { x: -destX * 0.3, y: -destY * 0.3, opacity: 0, scale: 0.95, filter: 'blur(5px)' });
            if (rippleCanvasRef.current) gsap.set(rippleCanvasRef.current, { x: -destX * 0.3, y: -destY * 0.3, opacity: 0, scale: 0.95, filter: 'blur(5px)' });

            // Animate in - Snappier duration
            if (grcRef.current) gsap.to(grcRef.current, { x: 0, y: 0, opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.4, ease: 'expo.out' });
            if (gccRef.current) gsap.to(gccRef.current, { x: 0, y: 0, opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.4, ease: 'expo.out' });
            if (rippleCanvasRef.current) gsap.to(rippleCanvasRef.current, { x: 0, y: 0, opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.4, ease: 'expo.out' });
            if (spotlightRef.current) gsap.to(spotlightRef.current, { x: 0, y: 0, opacity: 1, scale: 1.25, filter: 'blur(100px)', duration: 0.5, ease: 'power4.out', onComplete: () => { isTransitioning.current = false; } });
          });
        }
      });
      // Animate out
      const targetsOut = [grcRef.current, gccRef.current, rippleCanvasRef.current].filter(Boolean);
      if (targetsOut.length > 0) {
        // Optimized: Reduced blur and scale for better performance
        tl.to(targetsOut, { x: destX * 0.5, opacity: 0, scale: 1.05, filter: 'blur(15px)', duration: 0.3, ease: 'power2.in' });
        tl.to(targetsOut, { y: destY * 0.5, duration: 0.3, ease: 'linear' }, "<");
      }

      const bgTravelDist = destX * 0.3; const bgTravelDistY = destY * 0.3;
      if (spotlightRef.current) {
        tl.to(spotlightRef.current, { x: bgTravelDist, opacity: 0, scale: 1.05, filter: 'blur(30px)', duration: 0.3, ease: 'power2.in' }, "<");
        tl.to(spotlightRef.current, { y: bgTravelDistY, duration: 0.3, ease: 'linear' }, "<");
        tl.set(spotlightRef.current, { x: -bgTravelDist, y: -bgTravelDistY, opacity: 0, scale: 1.05, filter: 'blur(20px)' });
      }

      clickShockwaveRef.current = 2000;
      spotsRef.current.forEach(spot => { gsap.to(spot, { x: spot.x + -destX * 0.05, y: spot.y + -destY * 0.05, duration: 0.5, ease: 'power2.inOut' }); });
    }, containerRef);
  };

  const colorScheme = useMemo(() => {
    const hsl = hexToHSL(nameColor); const compHue = (hsl.h + 180) % 360;
    const secondaryColor = HSLToRGBString(compHue, hsl.s, hsl.l);
    return {
      base: nameColor,
      compHSL: { h: compHue, s: hsl.s, l: hsl.l },
      compString: secondaryColor,
      secondary: secondaryColor // Alias for clarity
    };
  }, [nameColor]);

  useEffect(() => { if (!isColorPinned) setNameColor(getContrastSafeColor(isLightMode)); }, [isLightMode, isColorPinned]);

  // ========== GLOBAL BACKGROUND COLORS ==========
  // ========== GLOBAL BACKGROUND COLORS ==========
  const BG_DARK = '#050505';    // Super dark grey
  const BG_LIGHT = '#fafafa';   // Super light grey
  // ================================================
  // ================================================

  const pageBg = isLightMode ? BG_LIGHT : BG_DARK;

  const mutedColor = useMemo(() => {
    const { h, l } = colorScheme.compHSL;
    const sMuted = 10;
    let lMuted = isLightMode ? (l - 5) : (l + 5); lMuted = Math.max(0, Math.min(100, lMuted));
    return HSLToRGBString(h, sMuted, lMuted);
  }, [colorScheme, isLightMode]);

  // Apply background color to document root (global) & Sync Safari Theme Color (Aggressive)
  useEffect(() => {
    // 1. CSS Variable for components
    document.documentElement.style.setProperty('--page-bg', pageBg);

    // 2. Explicit Body Background (Crucial for Safari overscroll area)
    document.body.style.backgroundColor = pageBg;

    // 3. Sync Meta Tag for Safari UI
    const syncThemeColor = () => {
      let metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (!metaThemeColor) {
        metaThemeColor = document.createElement('meta');
        metaThemeColor.name = "theme-color";
        document.head.appendChild(metaThemeColor);
      }
      metaThemeColor.setAttribute("content", pageBg);
    };

    syncThemeColor();
    console.log(`v12.74 Sync: Theme[${isLightMode ? 'LIGHT' : 'DARK'}] Color[${pageBg}]`);
  }, [pageBg, isLightMode]);

  const cursorRef = useRef(null); const spotlightRef = useRef(null); const rippleCanvasRef = useRef(null); const trailCanvasRef = useRef(null);

  useEffect(() => {
    targetConfigRef.current = {
      h: colorScheme.compHSL.h,
      s: colorScheme.compHSL.s,
      l: colorScheme.compHSL.l,
      // Alpha: 0.25 for Mobile | 0.15 for Desktop
      a: isMobile ? 0.25 : 0.15
    };
  }, [colorScheme.compHSL, isLightMode, isMobile]);

  // Spotlight Effect Canvas
  useEffect(() => {
    const canvas = spotlightRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); let animationFrameId; let currentColor = { ...targetConfigRef.current };
    let mousePos = { x: -1000, y: -1000 }; let mouseActive = false; let mouseTimer; let time = 0;
    const resizeCanvas = () => {
      if (canvas.parentElement) {
        // ROBUST ENGINE (v13.44) - 1:1 CSS Pixel Mapping for Mobile
        // Mobile: Cap dpr at 1.0. This aligns drawing coords 1:1 with screen pixels.
        // Desktop: Full native resolution.
        const dpr = isMobile ? Math.min(window.devicePixelRatio, 1) : window.devicePixelRatio;
        canvas.width = canvas.parentElement.offsetWidth * dpr;
        canvas.height = canvas.parentElement.offsetHeight * dpr;
        ctx.resetTransform();
        ctx.scale(dpr, dpr);
      }
    };
    window.addEventListener('resize', resizeCanvas); resizeCanvas();
    const handleMouseMove = (e) => { mousePos.x = e.clientX; mousePos.y = e.clientY; mouseActive = true; clearTimeout(mouseTimer); mouseTimer = setTimeout(() => { mouseActive = false; }, 2000); };
    window.addEventListener('mousemove', handleMouseMove);
    const handlePointerDown = (e) => {
      if (e.target.closest('.cursor-grab')) return;
      clickShockwaveRef.current = 5500;
    };
    window.addEventListener('pointerdown', handlePointerDown);
    const animate = () => {
      // CLEAR LOGIC (v13.44)
      // use scaled dimensions to clear the full logical viewport
      const dpr = isMobile ? Math.min(window.devicePixelRatio, 1) : window.devicePixelRatio;
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      time += 1;
      const target = targetConfigRef.current; currentColor.h += (target.h - currentColor.h) * 0.01; currentColor.s += (target.s - currentColor.s) * 0.01; currentColor.l += (target.l - currentColor.l) * 0.01; currentColor.a += (target.a - currentColor.a) * 0.01;
      const colorStart = HSLToRGBString(currentColor.h, currentColor.s, currentColor.l, currentColor.a); const colorEnd = HSLToRGBString(currentColor.h, currentColor.s, currentColor.l, 0);
      spotsRef.current.forEach((spot) => {
        // Wandering with Center Gravity Bias (10% chance to drift to center)
        let biasX = spot.offsetX;
        let biasY = spot.offsetY;
        if (Math.random() < 0.10) {
          // Temporarily bias the wandering offset towards the center of the screen
          // We implement this implicitly by keeping the noise but adding no extra push, just letting them drift
        }

        const wanderX = (window.innerWidth / 2) + (Math.cos((time * spot.speedX) + biasX) * (window.innerWidth / 3));
        const wanderY = (window.innerHeight / 2) + (Math.sin((time * spot.speedY) + biasY) * (window.innerHeight / 3));

        let targetX = wanderX; let targetY = wanderY;
        // Repulsion: Desktop Only
        if (!isMobile && mouseActive) { const dx = spot.x - mousePos.x; const dy = spot.y - mousePos.y; const dist = Math.hypot(dx, dy); const repelRadius = 300; if (dist < repelRadius) { const force = (repelRadius - dist) / repelRadius; const repelStrength = 1800; const angle = Math.atan2(dy, dx); targetX += Math.cos(angle) * force * repelStrength; targetY += Math.sin(angle) * force * repelStrength; } }

        if (clickShockwaveRef.current > 10) { const dx = spot.x - mousePos.x; const dy = spot.y - mousePos.y; const dist = Math.hypot(dx, dy); const shockRadius = window.innerWidth * 0.45; if (dist < shockRadius) { const force = Math.pow((shockRadius - dist) / shockRadius, 2); const angle = Math.atan2(dy, dx); targetX += Math.cos(angle) * force * (clickShockwaveRef.current * 3); targetY += Math.sin(angle) * force * (clickShockwaveRef.current * 3); } }
        spot.x += (targetX - spot.x) * 0.005; spot.y += (targetY - spot.y) * 0.005;
        // Pulse: Max 15% of base radius (v13.47)
        const pulse = Math.sin(time * 0.005); // -1 to 1
        const currentRadius = spot.baseRadius + (pulse * spot.baseRadius * 0.15);

        const gradient = ctx.createRadialGradient(spot.x, spot.y, 0, spot.x, spot.y, currentRadius);
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
    const ctx = canvas.getContext('2d'); let animationFrameId; let trailId; let lastPos = null;
    const CLICK_CONFIG = { maxRadius: isMobile ? 250 : 500, lifespan: isMobile ? 2400 : 4000 };

    const resizeCanvas = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', resizeCanvas);
    setTimeout(resizeCanvas, 50);

    const handleMouseMove = (e) => {
      if (e.pointerType === 'touch' || isTouchDevice.current) return;
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
        // Trail Radius reduced to 60% (v13.48) -> 5 base + 12 max (was 20)
        trailRipplesRef.current.push({ x: rx, y: ry, startTime: now, baseRadius: 5, maxRadius: 12, lifespan: 150 });
      }
      lastPos = { x, y };
    };
    window.addEventListener('mousemove', handleMouseMove);

    // KILL STICKY HOVER (v14.07)
    const handleGlobalTouch = () => {
      isTouchDevice.current = true;
      setHoveredNav(null);
      setHoveredEl(null);
      setIsRoleHovered(false);
      if (cursorRef.current) cursorRef.current.style.opacity = '0';
    };
    window.addEventListener('touchstart', handleGlobalTouch, { passive: true });

    const handlePointerDown = (e) => {
      // Prevent ripple if clicking on the mobile menu (drag or buttons) or dragging images
      if (e.target.closest('#mobile-menu-pill')) return;
      if (e.target.closest('.cursor-grab')) return;
      clickRipplesRef.current.push({ x: e.clientX, y: e.clientY, startTime: Date.now(), baseRadius: 10, maxRadius: CLICK_CONFIG.maxRadius, lifespan: CLICK_CONFIG.lifespan });
    };
    window.addEventListener('pointerdown', handlePointerDown);

    // Trail Canvas Animation Logic (v16.24 Simplified)
    const trailCanvas = trailCanvasRef.current;
    const resizeTrail = () => { if (trailCanvas) { trailCanvas.width = window.innerWidth; trailCanvas.height = window.innerHeight; } };

    if (trailCanvas) {
      const trailCtx = trailCanvas.getContext('2d');
      window.addEventListener('resize', resizeTrail);
      resizeTrail();

      const animateTrail = () => {
        trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
        const now = Date.now();
        const { h, s } = colorScheme.compHSL;
        const rippleL = isLightMode ? 40 : 90;
        const colorStr = HSLToRGBString(h, s, rippleL, 1);

        trailCtx.globalCompositeOperation = 'source-over';
        trailCtx.fillStyle = colorStr;
        trailCtx.shadowBlur = 15;
        trailCtx.shadowColor = colorStr;

        for (let i = trailRipplesRef.current.length - 1; i >= 0; i--) {
          const r = trailRipplesRef.current[i];
          if (now - r.startTime > r.lifespan) {
            trailRipplesRef.current.splice(i, 1);
            continue;
          }
          const progress = (now - r.startTime) / r.lifespan;
          let currentRadius = 0;
          let currentAlpha = 0;
          const expandFraction = 0.2;
          if (progress < expandFraction) {
            const p = progress / expandFraction;
            currentRadius = r.maxRadius * (1 - Math.pow(1 - p, 3));
            currentAlpha = 0.5 * p;
          } else {
            const p = (progress - expandFraction) / (1 - expandFraction);
            currentRadius = r.maxRadius * (1 - p);
            currentAlpha = 0.15 * Math.pow(1 - p, 3);
          }
          trailCtx.beginPath();
          trailCtx.arc(r.x, r.y, currentRadius, 0, Math.PI * 2);
          trailCtx.globalAlpha = currentAlpha;
          trailCtx.fill();
        }

        trailCtx.globalCompositeOperation = 'destination-out';
        trailCtx.fillStyle = 'rgba(0,0,0,1)';
        trailCtx.shadowBlur = 15;
        trailCtx.shadowColor = 'rgba(0,0,0,1)';
        trailCtx.globalAlpha = 1;

        for (let i = 0; i < trailRipplesRef.current.length; i++) {
          const r = trailRipplesRef.current[i];
          const progress = (now - r.startTime) / r.lifespan;
          let currentRadius = 0;
          const expandFraction = 0.2;
          if (progress < expandFraction) {
            const p = progress / expandFraction;
            currentRadius = r.maxRadius * (1 - Math.pow(1 - p, 3));
          } else {
            const p = (progress - expandFraction) / (1 - expandFraction);
            currentRadius = r.maxRadius * (1 - p);
          }
          const innerRadius = Math.max(0, currentRadius - 3);
          trailCtx.beginPath();
          trailCtx.arc(r.x, r.y, innerRadius, 0, Math.PI * 2);
          trailCtx.fill();
        }
        trailId = requestAnimationFrame(animateTrail);
      };
      animateTrail();
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const now = Date.now(); const { h, s } = colorScheme.compHSL; const rippleL = isLightMode ? 40 : 90; const colorStr = HSLToRGBString(h, s, rippleL, 1);
      // Only keep click ripple circles in the main ripple canvas
      ctx.globalCompositeOperation = 'lighter'; ctx.shadowBlur = 15; ctx.shadowColor = HSLToRGBString(h, s, rippleL, 1);
      for (let i = clickRipplesRef.current.length - 1; i >= 0; i--) { const r = clickRipplesRef.current[i]; if (now - r.startTime > r.lifespan) { clickRipplesRef.current.splice(i, 1); continue; } const progress = (now - r.startTime) / r.lifespan; const currentRadius = r.baseRadius + (r.maxRadius * Math.sin(progress * Math.PI / 2)); const currentAlpha = 0.2 * (1 - progress); ctx.beginPath(); ctx.arc(r.x, r.y, currentRadius, 0, Math.PI * 2); ctx.lineWidth = 3; ctx.strokeStyle = colorStr.replace('1)', `${currentAlpha})`); ctx.stroke(); }
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('resize', resizeTrail);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      cancelAnimationFrame(animationFrameId);
      cancelAnimationFrame(trailId);
    };
  }, [colorScheme.compHSL, isLightMode, isMobile]);

  // Global Click handler for color change
  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (!isColorPinned && !e.target.closest('button') && !e.target.closest('a') && !e.target.closest('.mobile-role-box')) {
        setNameColor(getContrastSafeColor(isLightMode));
      }
    };
    window.addEventListener('click', handleGlobalClick); return () => window.removeEventListener('click', handleGlobalClick);
  }, [isLightMode, isColorPinned]);

  // --- GLOBAL ENTRANCE (Atmosphere Layer) ---
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".atmosphere-layer",
        { opacity: 0 },
        { opacity: 1, duration: 2.5, ease: "sine.out", delay: 0.2 }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // Update meta theme color dynamically
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', isLightMode ? BG_LIGHT : BG_DARK);
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

          {/* UNIFIED BACKGROUNDS (Spotlight + Noise + Ripple) with Top/Bottom Edge Fade */}
          <div className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-1000 atmosphere-layer" style={{
            opacity: 1,
            // Desktop: None | Mobile: Standard Black (15%) for UI transitions
            maskImage: isMobile
              ? `linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)`
              : 'none',
            WebkitMaskImage: isMobile
              ? `linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)`
              : 'none'
          }}>
            <canvas ref={spotlightRef} className="absolute inset-0 z-0 transition-opacity duration-1000 scale-110 pointer-events-none" />
            {/* Atmosphere: Desktop gets real blur. Mobile gets a top-gradient overlay for 'depth' without cost. */}
            {isMobile
              ? <div className="absolute inset-0 z-1 pointer-events-none" style={{ background: `linear-gradient(to bottom, ${isLightMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'} 0%, transparent 15%)`, mixBlendMode: isLightMode ? 'plus-lighter' : 'overlay' }} />
              : <div className="absolute inset-0 z-1 pointer-events-none" style={{ backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', mixBlendMode: isLightMode ? 'plus-lighter' : 'overlay', opacity: 1 }} />
            }

            <canvas ref={rippleCanvasRef} className="absolute inset-0 z-20 pointer-events-none" />
          </div>
          <canvas ref={trailCanvasRef} className="fixed inset-0 z-30 pointer-events-none" />
          {!isMobile && <div ref={cursorRef} className={`fixed top-0 left-0 w-6 h-6 border ${isLightMode ? 'border-black' : 'border-white'} rounded-full pointer-events-none z-[60] mix-blend-difference -translate-x-1/2 -translate-y-1/2 hidden md:block transition-transform duration-75 ease-out`} />}
          {/* {!isMobile && <div className="fixed inset-0 pointer-events-none z-[50] opacity-[0.07] mix-blend-overlay user-select-none"><svg className="w-full h-full"><filter id="globalNoise"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" /></filter><rect width="100%" height="100%" filter="url(#globalNoise)" /></svg></div>} */}


          {/* CONTENT */}
          <div className={`relative z-10 ${layoutMode === 'desktop' ? 'h-full w-full' : ''}`}>

            {/* 1. Desktop Layout */}
            {layoutMode === 'desktop' && (
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
                grcRef={grcRef}
                gccRef={gccRef}
                detailPanelRef={detailPanelRef}
                aboutContentRef={aboutContentRef}
                hoveredEl={hoveredEl}
                setHoveredEl={setHoveredEl}
                isColorPinned={isColorPinned}
                setIsColorPinned={setIsColorPinned}
                mutedColor={mutedColor}
                isPlaying={isPlaying}
                toggleAudio={toggleAudio}
                imageProgress={imageProgress}
                onImageScroll={setImageProgress}
                isTouch={isTouchActive}
              />
            )}

            {/* 2. Landscape Tablet Layout */}
            {layoutMode === 'landscape-tablet' && (
              <LandscapeTabletLayout
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
                grcRef={grcRef}
                gccRef={gccRef}
                detailPanelRef={detailPanelRef}
                aboutContentRef={aboutContentRef}
                hoveredEl={hoveredEl}
                setHoveredEl={setHoveredEl}
                isColorPinned={isColorPinned}
                setIsColorPinned={setIsColorPinned}
                mutedColor={mutedColor}
                isPlaying={isPlaying}
                toggleAudio={toggleAudio}
                imageProgress={imageProgress}
                onImageScroll={setImageProgress}
                isTouch={isTouchActive}
              />
            )}
          </div>

        </div>

        {/* 3. Portrait Mobile Layout - Rendered LAST to ensure top z-index priority and clickable */}
        {layoutMode === 'portrait-mobile' && (
          <PortraitMobileLayout
            activePage={activePage}
            handlePageChange={handlePageChange}
            isLightMode={isLightMode}
            setIsLightMode={setIsLightMode}
            theme={theme}
            colorScheme={colorScheme}
            nameColor={nameColor}
            roles={roles}
            currentRoleIndex={currentRoleIndex}
            isRoleHovered={isRoleHovered}
            setIsRoleHovered={setIsRoleHovered}
            isColorPinned={isColorPinned}
            setIsColorPinned={setIsColorPinned}
            mutedColor={mutedColor}
            isMobile={true}
            isPlaying={isPlaying}
            toggleAudio={toggleAudio}
            isTouch={isTouchActive}
          />
        )}
      </div>
    </ReactLenis>
  );
}
