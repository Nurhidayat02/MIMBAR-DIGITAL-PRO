/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import SpeechGeneratorForm from "./components/SpeechGeneratorForm";
import SpeechViewer from "./components/SpeechViewer";
import TeleprompterView from "./components/TeleprompterView";
import { SpeechRequest, SpeechResult } from "./types";
import { SAMPLE_SPEECH } from "./data/sampleSpeech";
import brandLogo from "./assets/images/mimbar_digital_logo_1782743876619.jpg";
import { 
  Sparkles, 
  BookOpen, 
  HelpCircle, 
  FileText, 
  Compass, 
  Flame, 
  Star,
  Activity,
  User,
  ShieldAlert,
  GraduationCap,
  Sun,
  Moon,
  Download
} from "lucide-react";

export default function App() {
  const [speech, setSpeech] = useState<SpeechResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [teleprompterActive, setTeleprompterActive] = useState(false);
  const [teleprompterText, setTeleprompterText] = useState("");
  
  // PWA installation states and triggers
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const [showPwaModal, setShowPwaModal] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt as any);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setShowInstallBtn(false);
    }

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowInstallBtn(false);
      console.log("MIMBAR DIGITAL PRO PWA installed!");
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt as any);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User install outcome: ${outcome}`);
    } catch (installErr) {
      console.warn("PWA installation prompt error:", installErr);
    } finally {
      setDeferredPrompt(null);
      setShowInstallBtn(false);
    }
  };
  
  // Theme state: default to dark emerald-green theme (true), but allows user preference
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("orator_theme");
      return saved === null ? true : saved === "dark"; 
    } catch (e) {
      return true;
    }
  });

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      try {
        localStorage.setItem("orator_theme", next ? "dark" : "light");
      } catch (e) {
        console.warn("localStorage is not available/blocked:", e);
      }
      return next;
    });
  };

  const handleGenerate = async (request: SpeechRequest) => {
    setIsLoading(true);
    setErrorMsg(null);
    setSpeech(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Gagal menyusun naskah dari server.");
      }

      const data = await response.json();
      setSpeech(data);
    } catch (err: any) {
      console.error(err);
      let errMsg = err.message || "Koneksi terputus atau terjadi kesalahan sistem.";
      if (errMsg.includes("SyntaxError") || errMsg.includes("JSON") || errMsg.includes("Unexpected token") || errMsg.includes("unterminated")) {
        errMsg = "Gagal memproses data naskah (Format tidak valid). Hal ini biasanya terjadi karena naskah yang dihasilkan terlalu panjang dan terpotong karena limitasi token. Tips: Coba perkecil target durasi (misalnya ke 7-10 menit) atau berikan detail topik yang lebih spesifik.";
      } else if (errMsg.includes("Failed to fetch") || errMsg.includes("fetch")) {
        errMsg = "Koneksi internet terputus atau respon tertunda dari server (Failed to fetch). Silakan periksa jaringan Anda atau coba sesuaikan target durasi lebih pendek agar server memproses lebih ringan.";
      }
      setErrorMsg(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSample = () => {
    setSpeech(SAMPLE_SPEECH);
    setErrorMsg(null);
  };

  const handleUpdateSpeech = (updatedSpeech: SpeechResult) => {
    setSpeech(updatedSpeech);
  };

  const handleLaunchTeleprompter = (text: string) => {
    setTeleprompterText(text);
    setTeleprompterActive(true);
  };

  return (
    <div className={`min-h-screen overflow-x-hidden ${isDarkMode ? "bg-[#01231a] text-emerald-100" : "bg-[#f4faf7] text-emerald-950"} selection:bg-amber-500 selection:text-emerald-950 font-sans antialiased relative transition-colors duration-300`}>
      
      {/* Visual background decorations in elegant green/gold gradient blobs clipped */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-emerald-600/10 to-amber-500/5 rounded-full filter blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-900/15 to-emerald-500/5 rounded-full filter blur-[120px]" />
      </div>

      {/* Primary Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
        {/* Floating/Absolute Premium Theme Switcher & Install Pin */}
        <div className="absolute top-4 right-4 sm:right-8 z-30 no-print flex items-center gap-2">
          {/* Always show Install/PWA button to guide user, but with dynamic look if prompt is ready */}
          <button
            onClick={showInstallBtn ? handleInstallClick : () => setShowPwaModal(true)}
            className={`px-3 py-1.5 rounded-full border transition-all duration-300 flex items-center gap-1.5 cursor-pointer text-xs font-semibold shadow-md ${
              isDarkMode
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 active:bg-amber-500/30 shadow-amber-950/20"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 hover:bg-emerald-500/20 active:bg-emerald-500/30 shadow-emerald-150"
            }`}
            title="Instal Aplikasi MIMBAR DIGITAL PRO"
          >
            <Download className="h-4 w-4 animate-bounce" />
            <span className="hidden xs:inline">Instal Aplikasi</span>
          </button>

          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-full border transition-all duration-300 flex items-center justify-center cursor-pointer shadow-md ${
              isDarkMode
                ? "bg-emerald-950/60 border-emerald-800/40 text-amber-400 hover:bg-emerald-900/60"
                : "bg-white border-emerald-200 text-emerald-800 hover:bg-emerald-50 shadow-emerald-100"
            }`}
            title={isDarkMode ? "Aktifkan Tema Terang (Cerah)" : "Aktifkan Tema Gelap (Malam)"}
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5 text-amber-400" />
            ) : (
              <Moon className="h-5 w-5 text-emerald-800" />
            )}
          </button>
        </div>

        {/* Header Branding */}
        <header className="flex flex-col items-center justify-center text-center pb-8 border-b border-emerald-900/30 mb-8 no-print">
          
          {/* Islamic Emblem logo wrapper */}
          <div className="relative mb-5 flex items-center justify-center">
            {/* Glowing gold back shadow aura */}
            <div className="absolute h-20 w-20 rounded-[22px] bg-amber-500/10 blur-xl animate-pulse" />
            {/* Elegant fine dashed border rotating */}
            <div className="h-24 w-24 rounded-full border border-dashed border-amber-500/20 absolute animate-[spin_100s_linear_infinite]" />
            {/* Real generated logo image with pristine rounded squircle look */}
            <img 
              src={`${brandLogo}?v=17`}
              alt="MIMBAR DIGITAL PRO Logo" 
              referrerPolicy="no-referrer"
              className="h-20 w-20 rounded-[22px] shadow-2xl border border-amber-500/40 object-cover relative z-10 transition-transform duration-500 hover:scale-110 cursor-pointer"
            />
          </div>

          <h1 className={`text-3xl sm:text-4xl font-serif font-black tracking-widest ${isDarkMode ? "animate-gold-text" : "animate-gold-text-light"}`}>
            MIMBAR DIGITAL PRO
          </h1>
          
          <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-amber-500 to-transparent my-2" />
          
          <p className={`${isDarkMode ? "text-emerald-400" : "text-emerald-800"} font-medium text-xs sm:text-sm max-w-xl font-sans uppercase tracking-[0.14em] leading-relaxed`}>
            Perumus Naskah Dakwah Sunnah &amp; Orasi Multilingual Ahlussunnah
          </p>
        </header>

        {/* Global Error Popover Alert */}
        {errorMsg && (
          <div className="mb-6 bg-red-950/40 border border-red-800/40 rounded-xl p-4 flex gap-3 text-red-200 text-sm no-print shadow-xl animate-fade-in">
            <ShieldAlert className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Gagal Merumuskan Naskah</p>
              <p className="text-xs text-red-300/80 mt-1">{errorMsg}</p>
              <p className="text-xs text-amber-500 mt-2">
                Tips: Pastikan <strong>GEMINI_API_KEY</strong> sudah ditambahkan di panel <strong>Secrets (tombol Settings di sisi atas/pojok AI Studio)</strong> agar naskah teologi bisa terbentang indah.
              </p>
            </div>
          </div>
        )}

        {/* Dynamic Dual-Column Content */}
        {!speech && !isLoading ? (
          /* Introduction Empty State (Highly polished & styled) */
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start no-print">
            
            {/* Left side Form */}
            <div className="lg:col-span-2">
              <SpeechGeneratorForm 
                onGenerate={handleGenerate} 
                isLoading={isLoading} 
                onLoadSample={handleLoadSample} 
                isDarkMode={isDarkMode}
              />
            </div>

            {/* Right side Welcomer & Muslim Scholar Guide */}
            <div className="lg:col-span-3 space-y-6">
              <div className={`${isDarkMode ? 'bg-emerald-950/30 border border-emerald-900/40 shadow-xl' : 'bg-white border border-emerald-100 shadow-md shadow-emerald-150/50'} rounded-2xl p-6 md:p-8 relative overflow-hidden transition-colors duration-300`}>
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Compass className="h-44 w-44 text-amber-500" />
                </div>

                <div className="flex items-center gap-2 text-amber-400 uppercase tracking-widest text-xs font-mono font-bold mb-3">
                  <Flame className="h-4 w-4 text-amber-500 animate-pulse" />
                  Selamat Datang di MIMBAR DIGITAL PRO
                </div>

                <h2 className={`text-2xl sm:text-3xl font-serif font-semibold leading-snug ${isDarkMode ? 'text-emerald-100' : 'text-emerald-950'}`}>
                  Naskah yang Fasih, Sahih, dan Memiliki Sanad Pemikiran Madzhab
                </h2>

                <p className={`${isDarkMode ? 'text-emerald-400/90' : 'text-zinc-600'} text-sm mt-4 leading-relaxed font-sans text-justify`}>
                  MIMBAR DIGITAL PRO dirancang khusus untuk para asatid, pengurus masjid, instansi Islami, serta umat muslim dalam menyusun naskah yang berbobot, beradab, dan bernuansa mulia. Sistem AI kami memilah rujukan dalil yang disepakati (shahih) dan menentang faham ekstremis serta mengedepankan corak manhaj moderat Ahlussunnah wal Jama'ah.
                </p>

                <div className={`h-px my-6 ${isDarkMode ? 'bg-emerald-900/45' : 'bg-emerald-100/80'}`} />

                {/* Educational Bento Rows */}
                <h3 className={`font-serif font-bold text-sm mb-4 flex items-center gap-2 ${isDarkMode ? 'text-amber-200' : 'text-emerald-800'}`}>
                  <GraduationCap className="h-4.5 w-4.5 text-amber-500" />
                  Adab Penggunaan & Fitur Keunggulan:
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`${isDarkMode ? 'bg-emerald-950/60 border-emerald-900/30' : 'bg-emerald-50/50 border-emerald-100'} p-4 rounded-xl border`}>
                    <span className={`font-serif font-bold text-xs block mb-1 ${isDarkMode ? 'text-emerald-100' : 'text-emerald-950'}`}>✓ Validasi Rukun Khutbah</span>
                    <p className={`text-[11px] leading-normal ${isDarkMode ? 'text-emerald-400' : 'text-zinc-650 text-zinc-600'}`}>
                      Khusus Khutbah Jumat, sistem memvalidasi kelayakan khutbah 1 & 2 agar memenuhi syarat sah hamdalah, sholawat, wasiat taqwa, ayat Al-Qur'an, dan doa muslimin.
                    </p>
                  </div>

                  <div className={`${isDarkMode ? 'bg-emerald-950/60 border-emerald-900/30' : 'bg-emerald-50/50 border-emerald-100'} p-4 rounded-xl border`}>
                    <span className={`font-serif font-bold text-xs block mb-1 ${isDarkMode ? 'text-emerald-100' : 'text-emerald-950'}`}>✓ Keutamaan Sanad & Fiqih Aswaja</span>
                    <p className={`text-[11px] leading-normal ${isDarkMode ? 'text-emerald-400' : 'text-zinc-650 text-zinc-600'}`}>
                      Rujukan dalil mengacu pada kutipan orisinil kitab-kitab klasik madzhab (Syafi'i, Hanafi, Maliki, Hanbali) dan menjauhi paham Wahabi radikal.
                    </p>
                  </div>

                  <div className={`${isDarkMode ? 'bg-emerald-950/60 border-emerald-900/30' : 'bg-emerald-50/50 border-emerald-100'} p-4 rounded-xl border`}>
                    <span className={`font-serif font-bold text-xs block mb-1 ${isDarkMode ? 'text-emerald-100' : 'text-emerald-950'}`}>✓ Teleprompter Profesional</span>
                    <p className={`text-[11px] leading-normal ${isDarkMode ? 'text-emerald-400' : 'text-zinc-650 text-zinc-600'}`}>
                      Membantu proses membaca di mimbar tanpa khawatir mengganggu perhatian. Dilengkapi mode anti-mati layar dan pengaturan ukuran huruf/kecepatan.
                    </p>
                  </div>

                  <div className={`${isDarkMode ? 'bg-emerald-950/60 border-emerald-900/30' : 'bg-emerald-50/50 border-emerald-100'} p-4 rounded-xl border`}>
                    <span className={`font-serif font-bold text-xs block mb-1 ${isDarkMode ? 'text-emerald-100' : 'text-emerald-950'}`}>✓ Ekspor MS Word & PDF</span>
                    <p className={`text-[11px] leading-normal ${isDarkMode ? 'text-emerald-400' : 'text-zinc-650 text-zinc-600'}`}>
                      Naskah bisa langsung disalin, dicetak secara rapi, atau diunduh berupa file Word kompatibel demi kepraktisan cetak fisik khutbah Anda.
                    </p>
                  </div>
                </div>

                {/* Instructional guidance advice on Mimbar */}
                <div className={`mt-6 border rounded-xl p-4 flex gap-3 text-xs items-start ${isDarkMode ? 'bg-[#2d1b02]/30 border-amber-500/10 text-amber-200' : 'bg-amber-50/60 border-amber-200/50 text-amber-900'}`}>
                  <HelpCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className={`font-serif font-bold block ${isDarkMode ? 'text-amber-300' : 'text-amber-800'}`}>Belum memiliki ide hari ini?</span>
                    <p className="mt-1 leading-relaxed">
                      Klik tombol <strong>&quot;Gunakan Contoh Naskah&quot;</strong> di sisi formulir untuk merasakan langsung keindahan visual naskah khutbah tentang menjaga lisan lengkap dengan verifikasi tuntas.
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        ) : (
          /* Main active workstation area (when loading or when text generated) */
          <div className="space-y-6">
            
            {/* Loading Display */}
            {isLoading && (
              <div className={`flex flex-col items-center justify-center py-24 border rounded-2xl text-center relative overflow-hidden min-h-[400px] no-print shadow-xl transition-all duration-300 ${isDarkMode ? 'bg-emerald-950/20 border-emerald-900/30' : 'bg-white border-emerald-100'}`}>
                {/* Visual Arabic Orbiting circle */}
                <div className="relative mb-6 flex items-center justify-center">
                  <div className="h-20 w-20 border-4 border-amber-500/10 border-t-amber-500 rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Activity className="h-6 w-6 text-amber-400 animate-pulse" />
                  </div>
                </div>
                
                <h3 className={`text-xl font-serif font-bold ${isDarkMode ? "text-[#FFF9E6]" : "text-emerald-950"}`}>
                  Merumuskan Sanad Naskah Dakwah...
                </h3>
                <p className={`text-xs max-w-md mx-auto mt-2.5 px-6 leading-relaxed ${isDarkMode ? "text-emerald-400" : "text-zinc-600"}`}>
                  Menyisir dalil-dalil shahih, merangkai kalimat fasih khas ulamak aswaja tradisional, serta memvalidasi keselarasan rukun-rukun wajib. Mohon tunggu sejenak.
                </p>
              </div>
            )}

            {/* Generated results rendering */}
            {speech && !isLoading && (
              <div className="space-y-6">
                
                {/* Navigation Back Button Block */}
                <div className="flex items-center justify-between border-b border-emerald-900/30 pb-4 no-print">
                  <button
                    onClick={() => setSpeech(null)}
                    className={`py-1.5 px-3 rounded-lg border transition duration-300 flex items-center gap-1.5 cursor-pointer text-xs font-semibold ${isDarkMode ? 'border-emerald-900 bg-emerald-950/50 text-emerald-300 hover:bg-emerald-900 hover:text-emerald-100' : 'border-emerald-200 bg-white text-emerald-800 hover:bg-emerald-50 shadow-sm'}`}
                  >
                    ← Buat Ulang / Ganti Naskah Baru
                  </button>
                  
                  <span className={`text-xs font-mono italic ${isDarkMode ? 'text-emerald-400' : 'text-emerald-850 text-emerald-800'}`}>
                    Naskah Terpilih: {speech.title}
                  </span>
                </div>

                {/* Actual viewer containing actions, edit screen and details panel */}
                <SpeechViewer 
                  speech={speech} 
                  onLaunchTeleprompter={handleLaunchTeleprompter} 
                  onUpdateSpeech={handleUpdateSpeech} 
                  isDarkMode={isDarkMode}
                />

              </div>
            )}

          </div>
        )}

      </div>

      {/* Full-screen overlay for Teleprompter View rendering */}
      {teleprompterActive && (
        <TeleprompterView 
          text={teleprompterText} 
          title={speech?.title || "Naskah Orasi"} 
          onClose={() => setTeleprompterActive(false)} 
        />
      )}

      {/* Beautiful Footer */}
      <footer className={`py-8 border-t text-center text-xs mt-24 no-print transition-colors duration-300 ${isDarkMode ? 'bg-[#010e0b] border-emerald-900/20 text-emerald-600' : 'bg-[#eef5f1] border-emerald-250/55 text-emerald-800'}`}>
        <div className="max-w-4xl mx-auto px-4 space-y-2">
          <p>MIMBAR DIGITAL PRO © 2026 • Dirumuskan Khidmat Secara Tradisional Sunnah</p>
          <p className={`text-[10px] font-sans tracking-wide ${isDarkMode ? 'text-emerald-700' : 'text-emerald-900/60'}`}>
            Mengedepankan keaslian dalil, toleransi beragama, adab bermadzhab Ahlussunnah wal Jama'ah.
          </p>
        </div>
      </footer>

      {/* PWA Installation Guidance Modal */}
      {showPwaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm no-print animate-fade-in">
          <div className={`relative w-full max-w-md rounded-[28px] border p-6 shadow-2xl transition-all duration-300 ${
            isDarkMode 
              ? "bg-[#01261d] border-amber-500/30 text-emerald-100 shadow-emerald-950/50" 
              : "bg-white border-emerald-250 text-emerald-950 shadow-emerald-900/10"
          }`}>
            {/* Elegant Header and Close button */}
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-serif font-bold text-amber-500 flex items-center gap-2">
                🕌 Pasang Aplikasi
              </h3>
              <button 
                onClick={() => setShowPwaModal(false)}
                className={`p-1.5 rounded-full hover:bg-emerald-500/10 transition cursor-pointer ${isDarkMode ? "text-emerald-400" : "text-emerald-800"}`}
              >
                ✕
              </button>
            </div>

            {/* App Icon and Description */}
            <div className="flex items-center gap-4 mb-5 p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
              <img 
                src={`${brandLogo}?v=17`} 
                alt="MIMBAR DIGITAL PRO Logo" 
                className="h-14 w-14 rounded-[14px] border border-amber-500/30 object-cover"
              />
              <div>
                <h4 className="font-bold text-sm font-serif">MIMBAR DIGITAL PRO</h4>
                <p className="text-xs text-emerald-500 font-medium">Khutbah &amp; Orasi Multilingual</p>
              </div>
            </div>

            {/* Guide Steps */}
            <div className="space-y-4 text-xs leading-relaxed mb-6">
              <p className={isDarkMode ? "text-emerald-300" : "text-emerald-800"}>
                Untuk pemasangan terbaik dan ikon aplikasi premium muncul di layar utama:
              </p>
              
              <div className="space-y-3">
                <div className="flex gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-[10px] font-bold text-amber-500 border border-amber-500/30">1</span>
                  <div>
                    <span className="font-bold text-emerald-400">Android (Google Chrome/Opera/Samsung):</span>
                    <p className="opacity-80 mt-0.5">Ketuk tombol menu <strong className="text-amber-500 font-bold">titik tiga (⋮)</strong> di pojok kanan atas layar, lalu pilih <strong className="font-bold text-amber-500">"Instal aplikasi"</strong> atau <strong className="font-bold text-amber-500">"Tambahkan ke Layar Utama"</strong>.</p>
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-[10px] font-bold text-amber-500 border border-amber-500/30">2</span>
                  <div>
                    <span className="font-bold text-emerald-400">Apple iOS (Safari - iPhone/iPad):</span>
                    <p className="opacity-80 mt-0.5">Ketuk tombol <strong className="text-amber-500 font-bold">"Bagikan" (Share)</strong> di bagian bawah layar Safari, lalu gulir ke bawah dan ketuk <strong className="font-bold text-amber-500">"Tambahkan ke Layar Utama" (Add to Home Screen)</strong>.</p>
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-[10px] font-bold text-amber-500 border border-amber-500/30">3</span>
                  <div>
                    <span className="font-bold text-emerald-400">Desktop PC (Chrome/Edge/Opera):</span>
                    <p className="opacity-80 mt-0.5">Klik tombol <strong className="text-amber-500 font-bold">Instal / Pasang</strong> di sisi kanan bilah alamat (URL bar) browser Anda atau ketuk tombol "Instal Aplikasi" di kanan atas.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end col-span-2">
              <button
                onClick={() => setShowPwaModal(false)}
                className="py-2 px-5 rounded-full bg-amber-500 hover:bg-amber-600 font-bold text-xs text-[#01231a] transition-colors shadow-lg cursor-pointer"
              >
                Dipahami &amp; Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
