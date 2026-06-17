/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import SpeechGeneratorForm from "./components/SpeechGeneratorForm";
import SpeechViewer from "./components/SpeechViewer";
import TeleprompterView from "./components/TeleprompterView";
import { SpeechRequest, SpeechResult } from "./types";
import { SAMPLE_SPEECH } from "./data/sampleSpeech";
const brandLogo = "/brand_logo.png";
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
  Moon
} from "lucide-react";

export default function App() {
  const [speech, setSpeech] = useState<SpeechResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [teleprompterActive, setTeleprompterActive] = useState(false);
  const [teleprompterText, setTeleprompterText] = useState("");
  
  // Theme state: default to dark emerald-green theme (true), but allows user preference
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("orator_theme");
    return saved === null ? true : saved === "dark"; 
  });

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem("orator_theme", next ? "dark" : "light");
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
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal menyusun naskah dari server.");
      }

      const data = await response.json();
      setSpeech(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Koneksi terputus atau terjadi kesalahan sistem.");
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
    <div className={`min-h-screen ${isDarkMode ? "bg-[#01231a] text-emerald-100" : "bg-[#f4faf7] text-emerald-950"} selection:bg-amber-500 selection:text-emerald-950 font-sans antialiased relative transition-colors duration-300`}>
      
      {/* Visual background decorations in elegant green/gold gradient blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-emerald-600/10 to-amber-500/5 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-900/15 to-emerald-500/5 rounded-full filter blur-[120px] pointer-events-none" />

      {/* Primary Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
        {/* Floating/Absolute Premium Theme Switcher Pin */}
        <div className="absolute top-4 right-4 sm:right-8 z-30 no-print">
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
              src={brandLogo}
              alt="Mimbar Digital Pro Logo" 
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
                  Selamat Datang di Mimbar Digital Pro
                </div>

                <h2 className={`text-2xl sm:text-3xl font-serif font-semibold leading-snug ${isDarkMode ? 'text-emerald-100' : 'text-emerald-950'}`}>
                  Naskah yang Fasih, Sahih, dan Memiliki Sanad Pemikiran Madzhab
                </h2>

                <p className={`${isDarkMode ? 'text-emerald-400/90' : 'text-zinc-600'} text-sm mt-4 leading-relaxed font-sans text-justify`}>
                  Mimbar Digital Pro dirancang khusus untuk para asatid, pengurus masjid, instansi Islami, serta umat muslim dalam menyusun naskah yang berbobot, beradab, dan bernuansa mulia. Sistem AI kami memilah rujukan dalil yang disepakati (shahih) dan menentang faham ekstremis serta mengedepankan corak manhaj moderat Ahlussunnah wal Jama'ah.
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

    </div>
  );
}
