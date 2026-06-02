import React, { useState, useRef, useEffect, memo, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronDown, Check, Sparkles, MessageSquare, ArrowUpRight, 
  Eye, ShieldCheck, Mail, Send, ArrowLeft, ArrowRight as ArrowRightIcon,
  Sliders, Activity, Settings, RefreshCw, Cpu, Gauge, Terminal, HelpCircle, 
  User, Zap, Layers, Compass, SlidersHorizontal, ToggleLeft, ToggleRight
} from 'lucide-react';

interface FigurineMode {
  id: string;
  name: string;
  category: string;
  description: string;
  scaleMetric: number;
  bgHex: string;
  giantText: string;
  badgeCss: string;
  ambientShadow: string;
  accentHex: string;
}

const figurineModes: FigurineMode[] = [
  {
    id: 'brand',
    name: "TOONHUB BRAND MODEL",
    category: "Brand Integration",
    description: "Vibrant high-contrast art crafted for physical and digital workspaces. Featuring responsive multi-dimensional depth mapping and biological eye damping.",
    scaleMetric: 85,
    bgHex: "#e24c86",
    giantText: "TOON BRAND",
    badgeCss: "bg-pink-950/40 text-pink-400 border-pink-500/30",
    ambientShadow: "rgba(226,76,134,0.4)",
    accentHex: "#e24c86"
  },
  {
    id: 'digital',
    name: "DIGITAL FIGURINES",
    category: "Virtual Companion",
    description: "Adaptive responsive companion optimized for multi-device viewports. Calibrates real-time focal metrics according to live user coordinate mapping.",
    scaleMetric: 92,
    bgHex: "#1d4ed8",
    giantText: "DIGITAL SPACE",
    badgeCss: "bg-blue-950/40 text-blue-400 border-blue-500/30",
    ambientShadow: "rgba(29,78,216,0.4)",
    accentHex: "#3b82f6"
  },
  {
    id: 'campaign',
    name: "CAMPAIGN METASTAGE",
    category: "Creative Arena",
    description: "Designed for premium immersive product launches. High-impact kinetic typeface interactions produce unmatched dwell time metrics.",
    scaleMetric: 78,
    bgHex: "#6d28d9",
    giantText: "METASTAGE UI",
    badgeCss: "bg-purple-950/40 text-purple-400 border-purple-500/30",
    ambientShadow: "rgba(109,40,217,0.4)",
    accentHex: "#a855f7"
  },
  {
    id: 'strategy',
    name: "STRATEGY BLUEPRINT",
    category: "Product Core",
    description: "Bridging mechanical 3D prototyping and web front-end execution. Interactive simulation models optimized for sleek minimalist interfaces.",
    scaleMetric: 95,
    bgHex: "#111827",
    giantText: "ARCHITECT 3D",
    badgeCss: "bg-slate-800/40 text-slate-350 border-slate-500/30",
    ambientShadow: "rgba(255,255,255,0.05)",
    accentHex: "#64748b"
  }
];

interface BackgroundVideoProps {
  activeMode: FigurineMode;
  onPrev: () => void;
  onNext: () => void;
  damping: number;
  sensitivity: number;
  scaleValue: number;
  glowIntensity: number;
  showScanlines: boolean;
  showRadarHairlines: boolean;
}

const BackgroundVideo = memo(({ 
  activeMode, 
  onPrev, 
  onNext,
  damping,
  sensitivity,
  scaleValue,
  glowIntensity,
  showScanlines,
  showRadarHairlines
}: BackgroundVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const targetTimeRef = useRef<number>(0);
  const interpolatedTimeRef = useRef<number>(0);

  // States for live HUD tracking
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [smoothedCoords, setSmoothedCoords] = useState({ x: 0, y: 0 });
  const [distanceFactor, setDistanceFactor] = useState(1);

  // Track coordinates inside Card Stage specifically for exact crosshair rendering
  useEffect(() => {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let targetScale = scaleValue;
    let currentScale = scaleValue;
    let targetTranslateMultiplier = 1.0;
    let currentTranslateMultiplier = 1.0;
    let rAFId: number;

    const handleMouseMove3D = (e: MouseEvent) => {
      // Normalize mouse coordinates based on screen
      const normX = (e.clientX / window.innerWidth) - 0.5;
      const normY = (e.clientY / window.innerHeight) - 0.5;
      targetX = normX;
      targetY = normY;

      // Find cursor proximity relative to Card center
      let charX = window.innerWidth / 2;
      let charY = window.innerHeight * 0.45;

      if (wrapperRef.current) {
        const rect = wrapperRef.current.getBoundingClientRect();
        charX = rect.left + rect.width / 2;
        charY = rect.top + rect.height / 2;
      }

      const dx = e.clientX - charX;
      const dy = e.clientY - charY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Proximity triggered zoom shifts according to user adjustable scale
      const maxRange = 650;
      if (distance < maxRange) {
        const factor = Math.pow(1 - distance / maxRange, 1.4); 
        targetScale = scaleValue + factor * 0.12; 
        targetTranslateMultiplier = 1.0 + factor * 1.5; 
      } else {
        targetScale = scaleValue;
        targetTranslateMultiplier = 1.0;
      }
    };

    window.addEventListener('mousemove', handleMouseMove3D, { passive: true });

    const updatePhysicsLoop = () => {
      // Live dynamic physics tuning coefficients
      currentX += (targetX - currentX) * damping;
      currentY += (targetY - currentY) * damping;
      currentScale += (targetScale - currentScale) * damping;
      currentTranslateMultiplier += (targetTranslateMultiplier - currentTranslateMultiplier) * damping;

      // Pass coordinates to local state for HUD rendering
      setCoords({ x: targetX, y: targetY });
      setSmoothedCoords({ x: currentX, y: currentY });
      setDistanceFactor(currentTranslateMultiplier);

      if (wrapperRef.current) {
        // Compute standard translations mapped with customizable coefficients
        const translateX = currentX * 65 * currentTranslateMultiplier * sensitivity; 
        const translateY = currentY * 45 * currentTranslateMultiplier * sensitivity;

        wrapperRef.current.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`;
      }

      if (textRef.current) {
        // Giant background text slides in opposite, customized depth vector
        const textTranslateX = currentX * -50 * currentTranslateMultiplier * sensitivity;
        const textTranslateY = currentY * -30 * currentTranslateMultiplier * sensitivity;
        textRef.current.style.transform = `translate(${textTranslateX}px, ${textTranslateY}px)`;
      }

      // Live Telemetry HUD Sync
      const telemetryEl = document.getElementById('hud-coords-value');
      if (telemetryEl) {
        telemetryEl.textContent = `X: ${(currentX * 100).toFixed(0)}°  Y: ${(currentY * 100).toFixed(0)}°`;
      }

      // Live Gaze Compass Rotation
      const compassNeedle = document.getElementById('hud-compass-needle');
      if (compassNeedle) {
        const angle = Math.atan2(currentY, currentX) * (180 / Math.PI);
        compassNeedle.style.transform = `rotate(${angle}deg)`;
      }

      const azimuthValue = document.getElementById('hud-azimuth-val');
      if (azimuthValue) {
        const radius = Math.sqrt(currentX * currentX + currentY * currentY);
        azimuthValue.textContent = `${(radius * 180).toFixed(1)}° DEG`;
      }

      rAFId = requestAnimationFrame(updatePhysicsLoop);
    };

    updatePhysicsLoop();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove3D);
      cancelAnimationFrame(rAFId);
    };
  }, [damping, sensitivity, scaleValue]);

  // Proportional absolute mouse scrubbing system so the avatar follows the cursor gaze
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";

    let rAFId: number;
    let isSeeking = false;

    const handleMouseMoveScrub = (e: MouseEvent) => {
      if (!video.duration || isNaN(video.duration)) {
        return;
      }

      // Proportional mapping: horizontal screen position defines frame seek target
      const ratio = 1 - (e.clientX / window.innerWidth);
      const targetTime = ratio * video.duration;
      targetTimeRef.current = Math.max(0, Math.min(targetTime, video.duration));
    };

    const handleSeeked = () => {
      isSeeking = false;
    };

    const interpolationScrubLoop = () => {
      if (video.duration && !isNaN(video.duration)) {
        // High quality biological gaze damping matching customized settings
        interpolatedTimeRef.current += (targetTimeRef.current - interpolatedTimeRef.current) * damping;

        if (Math.abs(interpolatedTimeRef.current - targetTimeRef.current) < 0.001) {
          interpolatedTimeRef.current = targetTimeRef.current;
        }

        if (!isSeeking && Math.abs(video.currentTime - interpolatedTimeRef.current) > 0.015) {
          isSeeking = true;
          video.currentTime = interpolatedTimeRef.current;
        }

        // Live HUD progress indicators
        const percentage = (interpolatedTimeRef.current / video.duration) * 100;
        const progressIndicator = document.getElementById('scrub-progress-bar');
        const percentageText = document.getElementById('scrub-percentage-text');
        
        if (progressIndicator) {
          progressIndicator.style.width = `${percentage}%`;
        }
        if (percentageText) {
          const gazeOffset = Math.round((percentage - 50) * 0.9);
          percentageText.textContent = `${gazeOffset > 0 ? '+' : ''}${gazeOffset}° LOBE`;
        }
      }
      rAFId = requestAnimationFrame(interpolationScrubLoop);
    };

    const initTime = () => {
      if (video.duration && !isNaN(video.duration)) {
        targetTimeRef.current = video.duration / 2;
        interpolatedTimeRef.current = video.duration / 2;
        video.currentTime = video.duration / 2;
      }
    };

    window.addEventListener('mousemove', handleMouseMoveScrub, { passive: true });
    video.addEventListener('seeked', handleSeeked);

    if (video.readyState >= 1) {
      initTime();
    } else {
      video.addEventListener('loadedmetadata', initTime);
    }

    rAFId = requestAnimationFrame(interpolationScrubLoop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMoveScrub);
      video.removeEventListener('seeked', handleSeeked);
      video.removeEventListener('loadedmetadata', initTime);
      cancelAnimationFrame(rAFId);
    };
  }, [damping]);

  const activeIndex = figurineModes.findIndex(m => m.id === activeMode.id);

  // Compute exact crosshair location mapped in local percentage coordinates (from 0 to 100)
  const crosshairPercentX = 50 + (smoothedCoords.x * 100);
  const crosshairPercentY = 50 + (smoothedCoords.y * 100);

  return (
    <div 
      ref={stageRef}
      id="background-video-container" 
      className="relative w-full h-[580px] sm:h-[660px] lg:h-[740px] rounded-[2.5rem] overflow-hidden flex justify-center items-end border border-white/10 transition-all duration-700 ease-in-out bg-[#060608]"
      style={{ 
        boxShadow: `0 25px 80px -15px ${activeMode.ambientShadow}`
      }}
    >
      {/* SOLID CHROMATIC LAYER BASE (Controlled opacity utilizing dynamic lumens slider) */}
      <div 
        className="absolute inset-0 transition-all duration-700 pointer-events-none"
        style={{ 
          backgroundColor: activeMode.bgHex,
          opacity: glowIntensity * 0.85
        }}
      />

      {/* AMBIENT RADIAL LIGHTING REFLECTION */}
      <div 
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none blur-[140px] -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-out z-0"
        style={{
          left: `${crosshairPercentX}%`,
          top: `${crosshairPercentY}%`,
          background: `radial-gradient(circle, ${activeMode.accentHex} 0%, transparent 70%)`,
          opacity: glowIntensity
        }}
      />

      {/* HI-TECH CALIBRATION LAB GRID */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.06] bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:40px_40px] z-0" />

      {/* STAGE GEOMETRY: CIRCULAR FOCUS RADAR */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0">
        <div className="absolute w-[360px] h-[360px] rounded-full border border-white/5 animate-spin-slow pointer-events-none" />
        <div className="absolute w-[480px] h-[480px] rounded-full border border-dashed border-white/5 animate-spin-slow-reverse pointer-events-none" />
      </div>

      {/* HOLOGRAM SCANLINES OPTION */}
      {showScanlines && (
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.18)_50%,rgba(0,0,0,0)_50%)] bg-[size:100%_4px] pointer-events-none z-10 opacity-70 animate-scanline" />
      )}

      {/* DYNAMIC RADAR INTERSECTING TARGET HAIRLINES */}
      {showRadarHairlines && (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          {/* Horizontal Reticle Line */}
          <div 
            className="absolute left-0 right-0 h-[1px] bg-white/20 border-t border-dashed border-white/10 transition-all duration-75"
            style={{ top: `${crosshairPercentY}%` }}
          />
          {/* Vertical Reticle Line */}
          <div 
            className="absolute top-0 bottom-0 w-[1px] bg-white/20 border-l border-dashed border-white/10 transition-all duration-75"
            style={{ left: `${crosshairPercentX}%` }}
          />
          {/* Intersection Circle Target Reticle */}
          <div 
            className="absolute w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 transition-all duration-75 bg-white/5 backdrop-blur-xs"
            style={{ left: `${crosshairPercentX}%`, top: `${crosshairPercentY}%` }}
          >
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="absolute bottom-[-18px] text-[7px] font-mono font-black text-white bg-black/60 px-1 py-[1px] rounded uppercase tracking-wider">
              LOCK // LOBE
            </span>
          </div>
        </div>
      )}

      {/* Header telemetry label block top left */}
      <div className="absolute top-8 left-8 sm:left-10 flex items-center space-x-3.5 z-30 bg-black/45 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 shadow-lg pointer-events-none select-none">
        <div className="w-2 h-2 rounded-full bg-[#e24c86] animate-pulse" />
        <div className="flex flex-col">
          <span className="text-[10px] font-black tracking-[0.2em] text-white uppercase font-sans">SPADE' METASTAGE</span>
          <span className="text-[7.5px] font-extrabold text-white/50 tracking-widest font-mono uppercase">COGNITIVE RAYCASTER LAB</span>
        </div>
      </div>

      {/* HUD Telemetry stats panel top right */}
      <div className="absolute top-8 right-8 sm:right-10 z-30 flex items-center space-x-2 pointer-events-none select-none">
        <div className="flex flex-col items-end text-right font-mono bg-black/45 backdrop-blur-md border border-white/10 rounded-2xl p-2.5 px-3.5 shadow-lg">
          <span className="text-[7px] text-white/40 font-bold tracking-wider uppercase leading-none">TELEMETRY VECTOR</span>
          <span id="hud-coords-value" className="text-[10px] text-white font-extrabold mt-1 tracking-wider">X: 0°  Y: 0°</span>
        </div>
      </div>

      {/* Left indicator: Mode List progress index */}
      <div className="absolute left-8 sm:left-10 top-[38%] -translate-y-1/2 hidden lg:flex flex-col items-center space-y-4 z-30 pointer-events-none select-none">
        <span className="text-[7px] font-black text-white/30 tracking-widest font-mono uppercase [writing-mode:vertical-lr] mb-2 tracking-[0.3em]">HOLOGRAPH INDEX</span>
        <div className="flex flex-col space-y-4 items-center">
          {figurineModes.map((mode, idx) => (
            <div key={mode.id} className="flex flex-col items-center">
              {idx > 0 && <div className={`w-[1px] h-3.5 transition-colors duration-500 ${idx === activeIndex ? 'bg-white/70' : 'bg-white/10'}`} />}
              <div 
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black tracking-tight transition-all duration-500 border ${
                  idx === activeIndex 
                    ? 'bg-white text-neutral-900 border-white shadow-xl scale-110' 
                    : 'bg-white/5 text-white/40 border-white/10'
                }`}
              >
                0{idx + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right indicator: Azimuth and live raycaster compass */}
      <div className="absolute right-8 sm:right-10 top-[38%] -translate-y-1/2 hidden lg:flex flex-col items-center space-y-5 z-30 pointer-events-none select-none">
        <span className="text-[7px] font-black text-white/30 tracking-widest font-mono uppercase [writing-mode:vertical-lr] mb-1 tracking-[0.3em]">GAZE AZIMUTH HUD</span>
        
        {/* Animated Compass Hub */}
        <div className="relative w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-black/20 backdrop-blur-xs shadow-inner">
          <div className="absolute inset-0.5 rounded-full border border-dashed border-white/5 animate-spin-slow" />
          <div 
            id="hud-compass-needle" 
            className="w-full h-full absolute inset-0 flex items-center justify-center transition-transform duration-75 ease-out"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#ffffff] absolute left-1.5" />
            <div className="w-4.5 h-[1px] bg-gradient-to-r from-white to-transparent absolute left-3 opacity-40" />
          </div>
          <div className="w-2 h-2 rounded-full bg-white/10 border border-white/20 shadow-xs" />
        </div>

        {/* Azimuth Degrees dynamic text read */}
        <div className="flex flex-col items-center text-center space-y-0.5 font-mono text-[8px] text-white/70 bg-black/45 px-2.5 py-1 rounded-xl border border-white/10 shadow-md">
          <span className="text-[6.5px] text-white/45 font-bold tracking-wider">DEGREE</span>
          <span id="hud-azimuth-val" className="font-extrabold text-white text-[9px]">0.0° DEG</span>
        </div>
      </div>

      {/* BACKGROUND LAYER: Giant Display Typography behind modeling */}
      <div 
        ref={textRef}
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10 transition-transform ease-out duration-100"
      >
        <span className="text-[70px] sm:text-[140px] md:text-[180px] lg:text-[230px] font-black tracking-[-0.04em] text-white/15 uppercase select-none leading-none block text-center whitespace-nowrap font-display drop-shadow-[0_4px_15px_rgba(0,0,0,0.1)]">
          {activeMode.giantText}
        </span>
      </div>

      {/* INTERACTIVE AVATAR MODEL PLAYER */}
      <div 
        ref={wrapperRef}
        className="w-[105%] h-[105%] absolute flex justify-center items-center overflow-hidden bottom-[-10px] sm:bottom-[-20px] z-20"
      >
        <video
          ref={videoRef}
          src="/video.mp4"
          muted
          playsInline
          preload="auto"
          className="w-full h-[95%] object-contain select-none pointer-events-none transition-all duration-300 animate-glitch"
          style={{ 
            mixBlendMode: 'multiply'
          }}
        />
      </div>

      {/* FOREGROUND CARD METADATA OVERLAY (Bottom Left) */}
      <div className="absolute bottom-8 left-8 sm:left-10 z-30 text-left max-w-[310px] sm:max-w-[380px] flex flex-col space-y-4 pointer-events-auto bg-[#0a0a0c]/90 backdrop-blur-xl p-5 sm:p-6.5 rounded-[2rem] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.4)] transition-all duration-500">
        <div>
          <span className={`inline-block px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider font-mono border ${activeMode.badgeCss}`}>
            {activeMode.category}
          </span>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-3 font-display uppercase">
            {activeMode.name}
          </h3>
          <p className="text-xs sm:text-[12.5px] text-gray-400 leading-relaxed font-normal mt-2">
            {activeMode.description}
          </p>
        </div>

        {/* Carousel slide keys */}
        <div className="flex items-center space-x-3.5 pt-4.5 border-t border-white/5">
          <button 
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="w-9.5 h-9.5 rounded-full border border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer active:scale-95 text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="w-9.5 h-9.5 rounded-full border border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer active:scale-95 text-white"
          >
            <ArrowRightIcon className="w-4 h-4" />
          </button>
          <span className="text-[9px] font-mono text-gray-500 uppercase font-black tracking-widest pl-1">
            CYCLE COGNITIONS
          </span>
        </div>
      </div>

      {/* ACTION TRIGGER BUTTON (Bottom Right) */}
      <div className="absolute bottom-11 right-8 sm:right-10 z-30 text-right pointer-events-auto">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            const el = document.getElementById('brief-builder-container');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="text-[17px] sm:text-[19px] font-medium tracking-tight text-white hover:text-white/80 flex items-center space-x-2 border-b-2 border-white pb-2 font-display uppercase hover:opacity-85 transition-all cursor-pointer transform hover:translate-x-1"
        >
          <span>CALIBRATE MODEL</span>
          <ArrowUpRight className="w-4 h-4 stroke-[2px]" />
        </button>
      </div>

      {/* Live tracking scrubber bottom middle */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-2.5 bg-neutral-900/95 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 shadow-lg">
        <Eye className="w-3 h-3 text-white animate-pulse" />
        <span id="scrub-percentage-text" className="text-[8.5px] font-black text-white/90 font-mono tracking-widest uppercase">0° INDEX</span>
        <div className="w-11 bg-white/10 h-1 rounded-full overflow-hidden relative">
          <div id="scrub-progress-bar" className="bg-white h-full w-[50%] transition-all duration-75" />
        </div>
      </div>

    </div>
  );
});

BackgroundVideo.displayName = 'BackgroundVideo';

export default function App() {
  const [activeModeIndex, setActiveModeIndex] = useState(0);
  const [selectedServices, setSelectedServices] = useState<string[]>(['Brand', 'Digital']);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  
  // Custom Live Calibration Physics parameters
  const [damping, setDamping] = useState(0.08);
  const [sensitivity, setSensitivity] = useState(1.0);
  const [scaleValue, setScaleValue] = useState(1.02);
  const [glowIntensity, setGlowIntensity] = useState(0.55);
  const [showScanlines, setShowScanlines] = useState(false);
  const [showRadarHairlines, setShowRadarHairlines] = useState(true);

  // Form integration states
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const services = ['Brand', 'Digital', 'Campaign', 'Strategy', 'Other'];
  const activeMode = figurineModes[activeModeIndex];

  const handleNextMode = () => {
    setActiveModeIndex((prev) => (prev + 1) % figurineModes.length);
  };

  const handlePrevMode = () => {
    setActiveModeIndex((prev) => (prev - 1 + figurineModes.length) % figurineModes.length);
  };

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  const toggleDropdown = (name: string) => {
    setDropdownOpen(dropdownOpen === name ? null : name);
  };

  const handleBriefSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (selectedServices.length === 0) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setEmail('');
      setMessage('');
    }, 4000);
  };

  // Helper trigger to set preset values
  const applyPreset = (preset: 'default' | 'robot' | 'float' | 'hyper') => {
    switch (preset) {
      case 'default':
        setDamping(0.08);
        setSensitivity(1.0);
        setScaleValue(1.02);
        setGlowIntensity(0.55);
        break;
      case 'robot':
        setDamping(0.22);
        setSensitivity(1.4);
        setScaleValue(1.06);
        setGlowIntensity(0.85);
        break;
      case 'float':
        setDamping(0.03);
        setSensitivity(0.65);
        setScaleValue(0.99);
        setGlowIntensity(0.4);
        break;
      case 'hyper':
        setDamping(0.14);
        setSensitivity(1.9);
        setScaleValue(1.1);
        setGlowIntensity(0.95);
        break;
    }
  };

  return (
    <div className="relative min-h-screen bg-[#07070a] font-sans text-white selection:bg-white/10 selection:text-white flex flex-col antialiased">
      
      {/* Dynamic Ambient backdrop illumination */}
      <div className="absolute inset-0 bg-[#07070a] z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[25%] w-[450px] h-[450px] rounded-full bg-pink-500/5 blur-[130px]" />
        <div className="absolute bottom-[20%] right-[15%] w-[550px] h-[550px] rounded-full bg-blue-500/5 blur-[150px]" />
        <div className="absolute top-[40%] right-[30%] w-[350px] h-[350px] rounded-full bg-purple-500/5 blur-[120px]" />
      </div>

      {/* Structural dashboard overlay grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:6.25rem_6.25rem] pointer-events-none z-0" />

      {/* Main Content Node */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Futuristic Glassy Navbar */}
        <header className="w-full bg-transparent py-5 md:py-6 border-b border-white/5 backdrop-blur-md sticky top-0 z-50">
          <div id="navbar-container" className="max-w-[1450px] mx-auto px-6 md:px-12 lg:px-16 flex items-center justify-between">
            
            <div className="flex items-center space-x-12 md:space-x-16">
              {/* Logo */}
              <div id="logo-section">
                <a href="#" className="font-bold text-[19px] md:text-[21px] tracking-tight font-display hover:opacity-85 transition-opacity flex items-center space-x-2.5">
                  <div className="w-3.5 h-3.5 rounded bg-gradient-to-tr from-[#e24c86] to-pink-500 flex items-center justify-center transform rotate-45">
                    <span className="w-1 h-1 rounded-full bg-white animate-ping" />
                  </div>
                  <span className="tracking-[0.1em]">SPADE<span className="text-[#e24c86]">'</span></span>
                </a>
              </div>

              {/* Advanced Navigation Nodes */}
              <nav id="desktop-nav" className="hidden md:flex items-center space-x-8 text-[13px] font-semibold text-gray-400">
                <div className="relative">
                  <button
                    id="solutions-btn"
                    onClick={() => toggleDropdown('solutions')}
                    className="flex items-center space-x-1.5 hover:text-white transition-colors focus:outline-none cursor-pointer"
                  >
                    <span>Solutions</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-300 ${dropdownOpen === 'solutions' ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {dropdownOpen === 'solutions' && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 mt-3.5 w-56 bg-neutral-950/95 backdrop-blur-glass border border-white/10 rounded-2xl shadow-2xl p-2 z-50 text-[13px]"
                      >
                        <a href="#" className="block px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors">Digital Strategy</a>
                        <a href="#" className="block px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors">Brand Positioning</a>
                        <a href="#" className="block px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors">Campaign Creative</a>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <a href="#" className="hover:text-white transition-colors">Customers</a>

                <div className="relative">
                  <button
                    id="company-btn"
                    onClick={() => toggleDropdown('company')}
                    className="flex items-center space-x-1.5 hover:text-white transition-colors focus:outline-none cursor-pointer"
                  >
                    <span>Company</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-300 ${dropdownOpen === 'company' ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {dropdownOpen === 'company' && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 mt-3.5 w-48 bg-neutral-950/95 backdrop-blur-glass border border-white/10 rounded-2xl shadow-2xl p-2 z-50 text-[13px]"
                      >
                        <a href="#" className="block px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors">About</a>
                        <a href="#" className="block px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors">Careers</a>
                        <a href="#" className="block px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors">Press</a>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <a href="#" className="hover:text-white transition-colors">Docs</a>
              </nav>
            </div>

            {/* Right Command Center Trigger */}
            <div id="contact-sales-section" className="flex items-center space-x-4">
              <span className="hidden sm:inline-flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-mono border border-emerald-500/25">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>SERVER ONLINE</span>
              </span>
              <button 
                onClick={() => {
                  const el = document.getElementById('brief-builder-container');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-[13px] font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all px-5 py-2.5 rounded-full flex items-center space-x-2 cursor-pointer hover:scale-[1.02]"
              >
                <span>Contact sales</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#e24c86]" />
              </button>
            </div>

          </div>
        </header>

        {/* Master Interactive Core Content */}
        <main className="flex-1 flex flex-col justify-start py-8 md:py-12 z-10">
          
          <div className="max-w-[1360px] w-full mx-auto px-6 md:px-12 flex flex-col items-center">
            
            {/* Header branding block */}
            <div className="w-full flex flex-col md:flex-row items-center md:items-end justify-between mb-8.5 text-center md:text-left gap-4">
              <div className="max-w-xl">
                <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full shadow-lg w-fit mb-4 pointer-events-none select-none">
                  <Sparkles className="w-3.5 h-3.5 text-[#e24c86] animate-pulse" />
                  <span className="text-[10px] font-black text-gray-300 tracking-widest font-mono uppercase">VERSION // METASTAGE 2026</span>
                </div>
                <h1 className="text-[34px] sm:text-[46px] lg:text-[52px] font-black leading-none tracking-tight font-display text-white">
                  COGNITIVE FIGURINE MODELER
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 max-w-sm mt-3 md:mt-0 md:text-right leading-relaxed font-sans font-medium">
                Sleek multi-dimensional physics controller. Sweep your cursor to steer the visual perspective while our customized tracking reticle records dynamic azimuth calculations.
              </p>
            </div>

            {/* MAIN CHROMATIC CARD STAGE MODULE */}
            <div className="w-full relative shadow-3xl">
              <BackgroundVideo 
                activeMode={activeMode} 
                onPrev={handlePrevMode} 
                onNext={handleNextMode} 
                damping={damping}
                sensitivity={sensitivity}
                scaleValue={scaleValue}
                glowIntensity={glowIntensity}
                showScanlines={showScanlines}
                showRadarHairlines={showRadarHairlines}
              />
            </div>

            {/* INTERACTIVE PHYSICS CONTROLLER & BRIEF DECK */}
            <div id="brief-builder-container" className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mt-16">
              
              {/* Left Console: Highly Functional Live Calibration Dashboard */}
              <div className="lg:col-span-5 flex flex-col justify-between bg-[#0c0c0e]/90 border border-white/10 rounded-[2.5rem] p-7 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#e24c86]/5 rounded-full blur-2.5xl pointer-events-none" />
                
                <div>
                  {/* Title indicator */}
                  <div className="flex items-center justify-between pb-4 border-b border-white/5">
                    <div className="flex items-center space-x-2.5">
                      <Sliders className="w-4.5 h-4.5 text-[#e24c86]" />
                      <h3 className="text-xs font-black tracking-widest font-mono text-white uppercase">PHYSICS CALIBRATOR</h3>
                    </div>
                    <span className="flex items-center space-x-1.5 bg-pink-500/10 text-pink-400 border border-pink-500/20 px-2.5 py-0.5 rounded-full text-[8.5px] font-mono leading-none">
                      <Cpu className="w-2.5 h-2.5" />
                      <span>REAL-TIME ENGINE</span>
                    </span>
                  </div>

                  {/* Physics Mode Preset Buttons */}
                  <div className="mt-6">
                    <span className="text-[9.5px] font-mono text-gray-500 font-bold block mb-2.5 uppercase tracking-wider">CHOOSE SIMULATOR PRESET</span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(['default', 'robot', 'float', 'hyper'] as const).map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => applyPreset(preset)}
                          className="px-2 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center text-gray-300 hover:text-white"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tuning Slider Parameters */}
                  <div className="space-y-5.5 mt-7.5">
                    
                    {/* Damping slider */}
                    <div>
                      <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono font-bold text-gray-400 mb-1.5">
                        <span className="flex items-center space-x-1.5">
                          <Activity className="w-3.5 h-3.5 text-pink-500" />
                          <span>LERP VELOCITY DAMPING</span>
                        </span>
                        <span className="text-white font-extrabold">{damping.toFixed(2)}s</span>
                      </div>
                      <input 
                        type="range"
                        min="0.02"
                        max="0.25"
                        step="0.01"
                        value={damping}
                        onChange={(e) => setDamping(parseFloat(e.target.value))}
                        className="w-full accent-[#e24c86] bg-neutral-800 h-1.5 rounded-full outline-none cursor-ew-resize opacity-85 hover:opacity-100 transition-opacity"
                      />
                    </div>

                    {/* Sensitivity 3D Amplitude slider */}
                    <div>
                      <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono font-bold text-gray-400 mb-1.5">
                        <span className="flex items-center space-x-1.5">
                          <Compass className="w-3.5 h-3.5 text-pink-500" />
                          <span>3D PERSPECTIVE WEIGHT</span>
                        </span>
                        <span className="text-white font-extrabold">{sensitivity.toFixed(1)}x</span>
                      </div>
                      <input 
                        type="range"
                        min="0.4"
                        max="2.2"
                        step="0.1"
                        value={sensitivity}
                        onChange={(e) => setSensitivity(parseFloat(e.target.value))}
                        className="w-full accent-[#e24c86] bg-neutral-800 h-1.5 rounded-full outline-none cursor-ew-resize opacity-85 hover:opacity-100 transition-opacity"
                      />
                    </div>

                    {/* Scale proximity slider */}
                    <div>
                      <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono font-bold text-gray-400 mb-1.5">
                        <span className="flex items-center space-x-1.5">
                          <Layers className="w-3.5 h-3.5 text-pink-500" />
                          <span>FOCAL PROXIMITY ZOOM</span>
                        </span>
                        <span className="text-white font-extrabold">{scaleValue.toFixed(2)}x</span>
                      </div>
                      <input 
                        type="range"
                        min="0.95"
                        max="1.15"
                        step="0.01"
                        value={scaleValue}
                        onChange={(e) => setScaleValue(parseFloat(e.target.value))}
                        className="w-full accent-[#e24c86] bg-neutral-800 h-1.5 rounded-full outline-none cursor-ew-resize opacity-85 hover:opacity-100 transition-opacity"
                      />
                    </div>

                    {/* Backlight Lumens scale */}
                    <div>
                      <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono font-bold text-gray-400 mb-1.5">
                        <span className="flex items-center space-x-1.5">
                          <Zap className="w-3.5 h-3.5 text-pink-500" />
                          <span>BACKSTAGE GLOW LUMENS</span>
                        </span>
                        <span className="text-white font-extrabold">{Math.round(glowIntensity * 100)}%</span>
                      </div>
                      <input 
                        type="range"
                        min="0.2"
                        max="1.0"
                        step="0.05"
                        value={glowIntensity}
                        onChange={(e) => setGlowIntensity(parseFloat(e.target.value))}
                        className="w-full accent-[#e24c86] bg-neutral-800 h-1.5 rounded-full outline-none cursor-ew-resize opacity-85 hover:opacity-100 transition-opacity"
                      />
                    </div>

                  </div>

                  {/* Toggle controls */}
                  <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => setShowRadarHairlines(!showRadarHairlines)}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                        showRadarHairlines 
                          ? 'bg-pink-500/5 border-pink-500/30 text-white shadow-md' 
                          : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/10'
                      }`}
                    >
                      <span className="text-[10px] font-mono font-black uppercase">RADAR LOCK</span>
                      {showRadarHairlines ? <ToggleRight className="w-6 h-6 text-pink-500" /> : <ToggleLeft className="w-6 h-6 text-gray-500" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowScanlines(!showScanlines)}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                        showScanlines 
                          ? 'bg-pink-500/5 border-pink-500/30 text-white shadow-md' 
                          : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/10'
                      }`}
                    >
                      <span className="text-[10px] font-mono font-black uppercase">SCANLINES</span>
                      {showScanlines ? <ToggleRight className="w-6 h-6 text-pink-500" /> : <ToggleLeft className="w-6 h-6 text-gray-500" />}
                    </button>
                  </div>

                </div>

                <p className="text-[10.5px] text-gray-500 leading-relaxed font-semibold mt-8 pt-5.5 border-t border-white/5">
                  Calibrate damping variables to achieve custom kinetics. Proximity Zoom activates dynamically as the target pointer nears the core modeling geometry.
                </p>

              </div>

              {/* Right Console: Futuristic Premium Creative Brief Form */}
              <div className="lg:col-span-7 bg-[#0c0c0e]/90 border border-white/10 rounded-[2.5rem] p-7 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/5 rounded-full blur-2.5xl pointer-events-none" />

                <form onSubmit={handleBriefSubmit} className="space-y-6 flex flex-col h-full justify-between">
                  
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
                      <div className="flex items-center space-x-2.5">
                        <MessageSquare className="w-4.5 h-4.5 text-white" />
                        <h2 className="text-[15px] font-black tracking-tight text-white font-display uppercase">
                          Creative Brief & Design Configurator
                        </h2>
                      </div>
                      <span className="text-[8px] font-bold text-[#e24c86] tracking-widest font-mono uppercase bg-pink-500/10 border border-pink-500/20 px-3 py-1 rounded-full">
                        CALIBRATION DECK
                      </span>
                    </div>

                    {/* Domains Checkbox Selection */}
                    <div className="space-y-3.5">
                      <label className="text-[10.5px] font-mono font-black text-gray-400 tracking-wider uppercase block">
                        CHOOSE DEPLOYMENT CHANNELS
                      </label>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {services.map((service) => {
                          const isSelected = selectedServices.includes(service);
                          return (
                            <button
                              id={`service-pill-${service.toLowerCase()}`}
                              key={service}
                              type="button"
                              onClick={() => toggleService(service)}
                              className={`px-4.5 py-2.5 rounded-full text-[12.5px] font-extrabold tracking-wide transition-all duration-300 focus:outline-none cursor-pointer border ${
                                isSelected 
                                  ? 'bg-[#e24c86] border-[#e24c86] text-white shadow-lg shadow-pink-500/15' 
                                  : 'bg-white/5 border-white/5 text-gray-400 hover:bg-neutral-800 hover:border-white/15 hover:text-white'
                              }`}
                            >
                              <span className="flex items-center space-x-1.5">
                                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                                <span>{service}</span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Form Inputs */}
                    <div className="space-y-45 mt-7.5">
                      <label className="text-[10.5px] font-mono font-black text-gray-400 tracking-wider uppercase block">
                        DESIGN SPECS & EMAIL DESTINATION
                      </label>
                      
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="developer.leads@spadelabs.io"
                          className="w-full bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-[12.5px] font-medium text-white focus:outline-none focus:border-[#e24c86] placeholder-gray-500 transition-colors"
                        />
                      </div>

                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tell us about your brand vision or metaverse requirements. Our interactive model algorithms adaptation engine starts automatically..."
                        rows={3.5}
                        className="w-full bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl py-3.5 px-4 text-[12.5px] font-medium text-white focus:outline-none focus:border-[#e24c86] placeholder-gray-500 resize-none transition-colors mt-2"
                      />
                    </div>
                  </div>

                  {/* Submit state */}
                  <div className="pt-6 border-t border-white/5 mt-8">
                    <AnimatePresence mode="wait">
                      {submitted ? (
                        <motion.div
                          key="success"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className="bg-emerald-500 text-white p-4 rounded-2xl text-[12.5px] font-black flex items-center justify-center space-x-2 text-center"
                        >
                          <ShieldCheck className="w-4.5 h-4.5 stroke-[3px] animate-bounce" />
                          <span>SPECS SUBMITTED! OUR LAB WILL RETRIEVE CALIBRATION COGNITIONS</span>
                        </motion.div>
                      ) : (
                        <motion.button
                          id="submit-brief-btn"
                          key="idle"
                          type="submit"
                          disabled={selectedServices.length === 0}
                          className={`w-full py-4 rounded-2xl text-[13px] font-black uppercase tracking-wider transition-all flex items-center justify-center space-x-2.5 cursor-pointer ${
                            selectedServices.length > 0 
                              ? 'bg-white text-black hover:bg-[#e24c86] hover:text-white shadow-xl' 
                              : 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5'
                          }`}
                        >
                          <span>Authorized Secure brief dispatch</span>
                          <Send className="w-3.5 h-3.5" />
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>

                </form>
              </div>

            </div>

          </div>
        </main>
        
        {/* Sleek Dark Footer */}
        <footer className="w-full py-8 bg-transparent border-t border-white/5 mt-auto">
          <div className="max-w-[1450px] mx-auto px-6 md:px-12 lg:px-16 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
            <div>
              &copy; 2026 SPADE' Laboratory. Fully Responsive Gaze Physics Engine.
            </div>
            <div className="flex space-x-6 font-semibold">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Contact Deck</a>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
