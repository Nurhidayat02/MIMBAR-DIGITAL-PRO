import React, { useState, useEffect, useRef } from "react";
import { TeleprompterConfig } from "../types";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  X, 
  Eye, 
  EyeOff, 
  ChevronUp, 
  ChevronDown,
  Monitor,
  Zap,
  Sliders,
  SlidersHorizontal,
  FolderOpen,
  Settings,
  Sparkles,
  RefreshCw
} from "lucide-react";

interface TeleprompterViewProps {
  text: string;
  title: string;
  onClose: () => void;
}

export default function TeleprompterView({ text, title, onClose }: TeleprompterViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<any>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [config, setConfig] = useState<TeleprompterConfig>({
    speed: 3, // 1 to 10
    fontSize: 32, // in px (large by default for mimbar readability)
    isScrollActive: false,
    theme: "dark",
    fontStyle: "serif",
    flipped: false,
  });

  const [wakeLock, setWakeLock] = useState<any>(null);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [showGuideLine, setShowGuideLine] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showConsoleOnMobile, setShowConsoleOnMobile] = useState(true);

  // Screen Wake Lock to satisfy "layar harus hidup terus ga boleh mati"
  const requestWakeLock = async () => {
    if ("wakeLock" in navigator) {
      try {
        const lock = await (navigator as any).wakeLock.request("screen");
        setWakeLock(lock);
        setWakeLockActive(true);
      } catch (err) {
        console.warn("Screen Wake Lock could not be acquired:", err);
      }
    }
  };

  const releaseWakeLock = () => {
    if (wakeLock) {
      try {
        wakeLock.release();
        setWakeLock(null);
        setWakeLockActive(false);
      } catch (err) {
        console.error("Error releasing wake lock:", err);
      }
    }
  };

  // Bind Wake Lock state to playing status
  useEffect(() => {
    if (isPlaying) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }
    return () => {
      releaseWakeLock();
    };
  }, [isPlaying]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isPlaying) {
        requestWakeLock();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isPlaying]);

  // Clean-up scrolling interval
  useEffect(() => {
    return () => {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    };
  }, []);

  // Smooth manual & auto-scrolling engine
  useEffect(() => {
    if (isPlaying && countdown === null) {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);

      const intervalMs = 35; // smooth high fps interval
      // Multiply with small base step so speed 1-10 is beautifully granular
      const stepPixels = config.speed * 0.35; 

      scrollIntervalRef.current = setInterval(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop += stepPixels;
          
          // Check if bottom bounding reached
          const isAtBottom = 
            containerRef.current.scrollTop + containerRef.current.clientHeight >= 
            containerRef.current.scrollHeight - 6;
          if (isAtBottom) {
            setIsPlaying(false);
          }
        }
      }, intervalMs);
    } else {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
    }

    return () => {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    };
  }, [isPlaying, config.speed, countdown]);

  const handlePlayToggle = () => {
    if (!isPlaying) {
      setCountdown(3); // 3 seconds count down before scroll
    } else {
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      setCountdown(null);
      setIsPlaying(true);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResetScroll = () => {
    setIsPlaying(false);
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  };

  // Theme styling configurations 
  const getThemeClasses = () => {
    switch (config.theme) {
      case "dark":
        return "bg-zinc-950 text-zinc-100 border-zinc-900";
      case "light":
        return "bg-stone-50 text-stone-900 border-stone-200";
      case "sepia":
        return "bg-[#faf4e8] text-amber-950 border-amber-200/40";
      case "emerald":
        return "bg-[#01140f] text-emerald-50 border-emerald-950";
      default:
        return "bg-zinc-950 text-white";
    }
  };

  // Font family options for readability
  const getFontFamily = () => {
    switch (config.fontStyle) {
      case "sans":
        return "font-sans tracking-wide";
      case "serif":
        return "font-serif tracking-normal leading-relaxed";
      case "mono":
        return "font-mono tracking-tight text-sm sm:text-base";
      case "naskh":
        return "font-arabic leading-[2.1]";
      default:
        return "font-serif";
    }
  };

  // Theme-specific UI elements (e.g. sidebar controls should blend beautifully)
  const getControlThemeClasses = () => {
    switch (config.theme) {
      case "dark":
        return "bg-zinc-900/90 border-zinc-800 text-zinc-100";
      case "light":
        return "bg-stone-100/95 border-stone-300/60 text-stone-900";
      case "sepia":
        return "bg-[#f3ead3] border-amber-200/70 text-amber-950";
      case "emerald":
        return "bg-emerald-950/90 border-emerald-900/60 text-emerald-100";
    }
  };

  const getButtonActiveThemeClasses = () => {
    return "bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold border-amber-500 shadow-md";
  };

  const getButtonInactiveThemeClasses = () => {
    switch (config.theme) {
      case "dark":
        return "bg-zinc-850 hover:bg-zinc-800 border-zinc-700 text-zinc-300";
      case "light":
        return "bg-white hover:bg-stone-100 border-stone-300 text-stone-700";
      case "sepia":
        return "bg-[#e8dbbf] hover:bg-[#decfae] border-amber-300/40 text-amber-950";
      case "emerald":
        return "bg-emerald-900/60 hover:bg-emerald-900 border-emerald-800 text-emerald-300";
    }
  };

  const parseTeleprompterText = () => {
    const isLightOrSepia = config.theme === "light" || config.theme === "sepia";
    const headerColorClass = isLightOrSepia 
      ? "text-stone-950 border-b border-stone-800/30" 
      : "text-amber-500 border-b border-amber-500/30";

    const verseBgClass = config.theme === "light" 
      ? "bg-stone-100 border-stone-800 text-stone-950" 
      : config.theme === "sepia"
      ? "bg-[#ecdcb2]/30 border-amber-950 text-amber-950"
      : "bg-amber-500/5 border-amber-500 text-amber-500";

    const directiveColor = config.theme === "light"
      ? "#292524" // stone-800
      : config.theme === "sepia"
      ? "#451a03" // amber-950
      : "#b45309"; // amber-700

    const boldColorClass = isLightOrSepia 
      ? "text-stone-950 font-black" 
      : "text-amber-500 font-bold";

    const lines = text.split("\n");
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} style={{ height: `${config.fontSize * 0.8}px` }} />;

      // Structural headers
      if (trimmed.startsWith("##")) {
        const cleanHeader = trimmed.replace(/^##\s*/, "").replace(/\*\*/g, "");
        return (
          <h2 
            key={idx} 
            className={`${headerColorClass} font-bold pb-2 mt-12 mb-6 block text-center`}
            style={{ fontSize: `${config.fontSize * 1.25}px` }}
          >
            ✦ {cleanHeader} ✦
          </h2>
        );
      }

      // Holy Text & Arabic Verses with ۞ marker
      if (trimmed.startsWith("۞")) {
        const cleanVerses = trimmed.replace(/^۞\s*/, "");
        return (
          <div 
            key={idx} 
            className={`my-10 p-6 rounded-2xl border-l-4 border-r-4 text-center font-arabic font-bold ${verseBgClass}`} 
            dir="rtl"
            style={{ fontSize: `${config.fontSize * 1.4}px`, lineHeight: 2.1 }}
          >
            {cleanVerses}
          </div>
        );
      }

      // Stage / Khatib guidelines wrapped in * ... *
      if (trimmed.startsWith("*") && trimmed.endsWith("*")) {
        const cleanDirective = trimmed.replace(/^\*\s*/, "").replace(/\*$/, "");
        return (
          <div 
            key={idx} 
            className="text-center italic opacity-75 my-4 uppercase tracking-[0.2em]"
            style={{ fontSize: `${config.fontSize * 0.65}px`, color: directiveColor }}
          >
            [ {cleanDirective} ]
          </div>
        );
      }

      return (
        <p 
          key={idx} 
          className="my-8 leading-relaxed text-center font-normal"
          style={{ fontSize: `${config.fontSize}px` }}
        >
          {trimmed.split(/\*\*([^*]+)\*\*/g).map((part, pIdx) => {
            if (pIdx % 2 === 1) {
              return <strong key={pIdx} className={boldColorClass}>{part}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${getThemeClasses()} transition-colors duration-300 select-none overflow-hidden h-screen w-screen`}>
      
      {/* PERSISTENT TOP FLOATING BAR */}
      <div className={`px-4 sm:px-6 py-3.5 border-b flex items-center justify-between z-30 ${getControlThemeClasses()} shadow-md`}>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse hidden sm:block" />
          <span className="font-serif font-black tracking-widest text-amber-500 text-xs sm:text-base">
            MIMBAR DIGITAL PRO • TELEPROMPTER
          </span>
          <span className="opacity-30 text-xs hidden md:inline">|</span>
          <span className="text-xs opacity-75 hidden md:inline max-w-xs truncate font-mono">{title}</span>
        </div>

        {/* Rapid control helpers in topbar */}
        <div className="flex items-center gap-2">
          {/* Mobile Console Toggle button */}
          <button
            onClick={() => setShowConsoleOnMobile(!showConsoleOnMobile)}
            className="md:hidden py-1 px-2.5 rounded text-xs font-semibold flex items-center gap-1.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 active:bg-amber-500/20 cursor-pointer"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>{showConsoleOnMobile ? "Sembunyikan Menu" : "Pengaturan Panel"}</span>
          </button>

          <button 
            onClick={onClose}
            className="p-1.5 px-3.5 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm shadow-red-950 transition-colors"
          >
            <X className="h-4 w-4" />
            Keluar Sesi
          </button>
        </div>
      </div>

      {/* WORKSTATION VIEW: DUAL GRID SECTION (Script area + Side Panel Controller) */}
      <div className="flex-1 relative flex flex-col md:flex-row overflow-hidden">
        
        {/* Horizontal Reading Guideline Overlays */}
        {showGuideLine && (
          <div className="absolute top-1/2 left-0 right-0 md:right-80 h-28 -translate-y-1/2 pointer-events-none border-t border-b border-amber-500/25 bg-amber-500/5 z-10 flex items-center justify-between px-6">
            <div className="text-[9px] uppercase font-mono tracking-widest text-amber-500 opacity-60 flex items-center gap-1">
              <Eye className="h-3 w-3" /> FOKUS BACA
            </div>
            <div className="text-[9px] uppercase font-mono tracking-widest text-amber-500 opacity-60 flex items-center gap-1">
              FOKUS BACA <Eye className="h-3 w-3 text-amber-500" />
            </div>
          </div>
        )}

        {/* Countdown overlay during start prep */}
        {countdown !== null && (
          <div className="absolute inset-0 bg-black/95 z-40 flex flex-col items-center justify-center pointer-events-auto">
            <span className="text-[130px] font-sans font-black text-amber-500 animate-ping">
              {countdown}
            </span>
            <span className="text-lg text-emerald-300 font-serif uppercase tracking-widest mt-6">
              Mulai bersuara dalam hitungan detik...
            </span>
          </div>
        )}

        {/* LEFT / CENTER STAGE: SCROLLABLE SCRIPT READER */}
        <div 
          ref={containerRef}
          className={`flex-1 overflow-y-auto px-4 sm:px-12 md:px-20 py-24 scroll-smooth ${getFontFamily()} ${
            config.flipped ? "scale-x-[-1]" : ""
          }`}
          style={{ height: "100%" }}
        >
          {/* Buffer spaces */}
          <div className="h-36" />
          
          <div className="max-w-3xl mx-auto">
            {parseTeleprompterText()}
          </div>

          <div className="h-[50vh]" />
        </div>

        {/* RIGHT SIDE: MASTER CONTROL CONSOLE PANEL (Highly accessible & beautiful) */}
        <div className={`sm:relative md:w-80 border-l shrink-0 flex flex-col ${getControlThemeClasses()} ${
          showConsoleOnMobile ? "flex border-t md:border-t-0" : "hidden md:flex"
        } transition-all duration-300 max-h-[45vh] md:max-h-full overflow-y-auto pb-6 md:pb-0 z-20 shadow-xl`}>
          
          {/* Console Header Accent */}
          <div className="p-4 border-b border-dashed flex items-center justify-between bg-emerald-900/10">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-amber-500" />
              <span className="font-serif font-bold text-xs uppercase tracking-wider text-amber-500">
                Menu Pengaturan Utama
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className={`h-2.5 w-2.5 rounded-full ${wakeLockActive ? "bg-emerald-500 animate-pulse" : "bg-zinc-600"}`} />
              <span className="text-[10px] font-mono text-emerald-400 font-bold">ANTI-MATI</span>
            </div>
          </div>

          {/* Console Elements Block */}
          <div className="p-4 sm:p-5 space-y-6 flex-1">
            
            {/* 1. MASTER PLAY/STOP BUTTON & RESET */}
            <div>
              <span className="block text-[10px] font-mono tracking-wider uppercase mb-2.5 text-amber-500 font-bold">
                1. Navigasi Jalannya Teks
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handlePlayToggle}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-sm text-emerald-950 bg-amber-500 hover:bg-amber-400 active:scale-95 transition-all flex items-center justify-center gap-2 border border-amber-600 shadow-md cursor-pointer"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-4 w-4 fill-emerald-950" />
                      HENTIKAN TEKS
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 fill-emerald-950" />
                      JALANKAN TEKS
                    </>
                  )}
                </button>

                <button
                  onClick={handleResetScroll}
                  className={`p-3 rounded-xl border flex items-center justify-center cursor-pointer transition-all hover:scale-105 ${getButtonInactiveThemeClasses()} hover:text-amber-500`}
                  title="Kembali ke atas"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* 2. SPEED CONTROLLER (MEMPERCEPAT & MEMPERLAMBAT TEKS) */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-mono tracking-wider uppercase text-amber-500 font-bold">
                  2. Atur Kecepatan Teks Jalan
                </span>
                <span className="text-xs font-mono font-bold bg-amber-500/15 py-0.5 px-2 rounded border border-amber-500/30 text-amber-500">
                  Speed x{config.speed}
                </span>
              </div>

              <div className="flex gap-2 items-center">
                <button
                  onClick={() => setConfig(prev => ({ ...prev, speed: Math.max(1, prev.speed - 1) }))}
                  className={`flex-1 py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-all ${getButtonInactiveThemeClasses()}`}
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                  Lebih Lambat
                </button>

                <button
                  onClick={() => setConfig(prev => ({ ...prev, speed: Math.min(10, prev.speed + 1) }))}
                  className={`flex-1 py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-all ${getButtonInactiveThemeClasses()}`}
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                  Lebih Cepat
                </button>
              </div>

              {/* Slider for precision */}
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={config.speed}
                onChange={(e) => setConfig(prev => ({ ...prev, speed: Number(e.target.value) }))}
                className="w-full accent-amber-500 h-1 mt-3 bg-amber-500/10 rounded cursor-pointer"
              />
            </div>

            {/* 3. FONT SIZE CONTROLLER (PERBESAR & PERKECIL TEKS) */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-mono tracking-wider uppercase text-amber-500 font-bold">
                  3. Ukuran Huruf / Font Size
                </span>
                <span className="text-xs font-mono font-bold bg-emerald-500/15 py-0.5 px-2 rounded border border-emerald-500/30 text-emerald-400">
                  {config.fontSize}px
                </span>
              </div>

              <div className="flex gap-2 text-center">
                <button
                  onClick={() => setConfig(prev => ({ ...prev, fontSize: Math.max(16, prev.fontSize - 3) }))}
                  className={`flex-1 py-2 rounded-xl border font-bold text-xs cursor-pointer transition-all ${getButtonInactiveThemeClasses()}`}
                >
                  A- (Lebih Kecil)
                </button>

                <button
                  onClick={() => setConfig(prev => ({ ...prev, fontSize: Math.min(80, prev.fontSize + 3) }))}
                  className={`flex-1 py-2 rounded-xl border font-bold text-xs cursor-pointer transition-all ${getButtonInactiveThemeClasses()}`}
                >
                  A+ (Lebih Besar)
                </button>
              </div>
            </div>

            {/* 4. THEMES SELECTION (TEMA GELAP & TERANG SELECTIONS) */}
            <div>
              <span className="block text-[10px] font-mono tracking-wider uppercase mb-2 text-amber-500 font-bold">
                4. Pilih Warna Layar / Tema
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-center">
                {([
                  { key: "dark", label: "Tema Gelap" },
                  { key: "light", label: "Tema Terang" },
                  { key: "sepia", label: "Klasik (Sepia)" },
                  { key: "emerald", label: "Mihrab (Hijau)" }
                ] as const).map((t) => {
                  const isActive = config.theme === t.key;
                  return (
                    <button
                      key={t.key}
                      onClick={() => setConfig(prev => ({ ...prev, theme: t.key }))}
                      className={`py-2 px-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        isActive ? getButtonActiveThemeClasses() : getButtonInactiveThemeClasses()
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. FONTS STYLES */}
            <div>
              <span className="block text-[10px] font-mono tracking-wider uppercase mb-2 text-amber-500 font-bold">
                5. Gaya Tulisan (Font Style)
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-center">
                {([
                  { key: "serif", label: "Serif (Syar'i)" },
                  { key: "sans", label: "Biasa (Modern)" },
                  { key: "mono", label: "Fokus (Mono)" },
                  { key: "naskh", label: "Khas Arab Naskh" }
                ] as const).map((st) => {
                  const isActive = config.fontStyle === st.key;
                  return (
                    <button
                      key={st.key}
                      onClick={() => setConfig(prev => ({ ...prev, fontStyle: st.key }))}
                      className={`py-1.5 text-[11px] font-medium rounded border transition-all cursor-pointer ${
                        isActive ? "bg-amber-600/25 border-amber-500 text-amber-300 font-bold" : getButtonInactiveThemeClasses()
                      }`}
                    >
                      {st.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 6. EXTRA TOGGLES: GUIDE LINE & MIRROR ACTION */}
            <div>
              <span className="block text-[10px] font-mono tracking-wider uppercase mb-2 text-amber-500 font-bold">
                6. Opsi Bantuan Visual
              </span>
              <div className="grid grid-cols-2 gap-2 text-center">
                {/* Guide lines toggle */}
                <button
                  onClick={() => setShowGuideLine(!showGuideLine)}
                  className={`py-2 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    showGuideLine ? "bg-amber-500/20 border-amber-500 text-amber-300" : getButtonInactiveThemeClasses()
                  }`}
                >
                  {showGuideLine ? (
                    <>
                      <Eye className="h-3.5 w-3.5" />
                      Garis Panduan ON
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-3.5 w-3.5" />
                      Garis Panduan OFF
                    </>
                  )}
                </button>

                {/* Mirror mirror text toggle */}
                <button
                  onClick={() => setConfig(prev => ({ ...prev, flipped: !prev.flipped }))}
                  className={`py-2 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    config.flipped ? "bg-amber-500/20 border-amber-500 text-amber-300" : getButtonInactiveThemeClasses()
                  }`}
                  title="Membalikkan tulisan untuk refleksi cermin kaca"
                >
                  <Monitor className="h-3.5 w-3.5" />
                  {config.flipped ? "Mode Cermin ON" : "Mode Cermin OFF"}
                </button>
              </div>
            </div>

          </div>
          
          {/* Wake Lock safety info box at bottom */}
          <div className="px-5 py-3 border-t border-dashed border-emerald-900/40 bg-emerald-900/5 text-[10px] opacity-90 leading-tight">
            <span className="font-bold text-amber-500 flex items-center gap-1">
              <Zap className="h-3 w-3 animate-bounce text-amber-500" />
              Catatan Anti-Mati Layar
            </span>
            <span className="mt-1 block">
              Sistem secara otomatis mengaktifkan fitur <strong>Screen Wake Lock</strong> agar layar gadget tidak padam selama Anda sedang membaca di atas podium mimbar.
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}
