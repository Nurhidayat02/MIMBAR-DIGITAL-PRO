import React, { useState } from "react";
import { SpeechCategory, SpeechLanguage, SpeechRequest, SpeechTone } from "../types";
import { 
  BookOpen, 
  MessageSquare, 
  Sparkles, 
  ScrollText, 
  Users, 
  Clock, 
  FileText, 
  Globe, 
  Info,
  Compass,
  CornerDownRight
} from "lucide-react";

interface SpeechGeneratorFormProps {
  onGenerate: (request: SpeechRequest) => void;
  isLoading: boolean;
  onLoadSample: () => void;
  isDarkMode?: boolean;
}

export default function SpeechGeneratorForm({ 
  onGenerate, 
  isLoading, 
  onLoadSample,
  isDarkMode = true 
}: SpeechGeneratorFormProps) {
  const [category, setCategory] = useState<SpeechCategory>("Khutbah");
  const [language, setLanguage] = useState<SpeechLanguage>("Indonesia");
  const [tone, setTone] = useState<SpeechTone>("Formal Terstruktur");
  const [topic, setTopic] = useState("");
  const [occasion, setOccasion] = useState("");
  const [audience, setAudience] = useState("");
  const [durationMin, setDurationMin] = useState(12);
  const [details, setDetails] = useState("");

  // Collapsible toggle states for choices
  const [showToneOptions, setShowToneOptions] = useState(false);
  const [showTopicOptions, setShowTopicOptions] = useState(false);
  const [showOccasionOptions, setShowOccasionOptions] = useState(false);
  const [showAudienceOptions, setShowAudienceOptions] = useState(false);

  // Predefined recommendations for topic selection based on current category
  const topicSuggestions: Record<SpeechCategory, string[]> = {
    Khutbah: [
      "Menjaga Kesucian Lisan di Era Fitnah Media Sosial",
      "Urgensi Shodaqoh Khofiyyah (Sedekah Rahasia)",
      "Adab Menuntut Ilmu wal Mulianya Kedudukan Guru",
      "Kemuliaan Akhlak Islam & Meneladani Rasulullah SAW",
      "Toleransi & Mempererat Ukhuwah Islamiyah"
    ],
    Ceramah: [
      "Mempersiapkan Bekal Terbaik untuk Kehidupan Akhirat",
      "Membangun Keluarga Sakinah Mawaddah Warahmah",
      "Keutamaan Shalat Malam (Tahajjud) bagi Ahli Syukur",
      "Menghadapi Cobaan Hidup Bersendikan Sabar & Ridho",
      "Bahaya Hasad, Riya, dan Takabbur dalam Jiwa Muslim"
    ],
    Tausyiah: [
      "Kesejukan Basahan Dzikir Terapi Penenang Jiwa",
      "Keutamaan Sikap Tawadhu & Menjauhi Kesombongan",
      "Pintu Rezeki yang Berkah dalam Rumah Tangga",
      "Berbakti kepada Orang Tua (Birrul Walidain) Kunci Surga",
      "Mati dalam Keadaan Husnul Khotimah"
    ],
    Sambutan: [
      "Sambutan Khidmat Hari Raya Idul Fitri / Idul Adha",
      "Sambutan Pembukaan Majelis Syafiiyyah & Ta'lim",
      "Sambutan Tuan Rumah pada Acara Syukuran / Walimah",
      "Sambutan Acara Peringatan Hari Besar Islam (PHBI)",
      "Sambutan Silaturahmi Ranting NU/Aswaja setempat"
    ],
    MC: [
      "Pemandu Acara Kajian Akbar & Bedah Kitab Fiqih",
      "Pemandu Acara Akad Nikah Khidmat Islami",
      "Pemandu Acara Pengajian Bulanan Masjid Agung",
      "Pemandu Acara Peringatan Maulid Agung Rasulullah SAW",
      "Pemandu Acara Musyawarah Wali Santri Madrasah"
    ]
  };

  const occasionSuggestions = [
    "Khutbah Shalat Jumat Masjid",
    "Kajian Mingguan Ba'da Maghrib",
    "Peringatan Hari Besar Islam (Maulid/Isra' Mi'raj)",
    "Pertemuan Bulanan Majelis Ta'lim",
    "Acara Syukuran / Akad Nikah Walimah",
    "Pembukaan Acara Resmi / Rapat Instansi"
  ];

  const audienceSuggestions = [
    "Jamaah Umum Masjid (Heterogen)",
    "Remaja, Pemuda Millenial & Gen Z",
    "Bapak-Bapak & Tokoh Masyarakat",
    "Ibu-Ibu Anggota Majelis Ta'lim",
    "Santri & Kalangan Pelajar Akademis"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    onGenerate({
      category,
      language,
      tone,
      topic,
      occasion,
      audience,
      durationMin,
      details,
    });
  };

  // Describe selected category nuances in Indonesian context
  const getCategoryNuance = (cat: SpeechCategory) => {
    switch (cat) {
      case "Khutbah":
        return "Sesuai rukun wajib Khutbah 1 & 2 Ahlussunnah wal Jama'ah (Asy'ariyah/Maturidiyah) dengan dalil shahih bermadzhab.";
      case "Ceramah":
        return "Teks syiar umum yang mengalir, interaktif, mendalam, dan kaya dalil rujukan untuk mencerahkan hati jamaah.";
      case "Tausyiah":
        return "Pesan keagamaan yang menyentuh, santun, hangat, dan fokus pada nasihat batin serta akhlak mulia.";
      case "Sambutan":
        return "Pidato resmi/kata sambutan bernuansa Islami untuk pembukaan acara, syukuran, atau perayaan hari besar.";
      case "MC":
        return "Panduan pemandu acara (Master of Ceremony) dengan tata urutan acara yang rapi, salam hormat, dan muqaddimah indah.";
    }
  };

  // Describe chosen speech tone/style nuances
  const getToneNuance = (selectedTone: SpeechTone) => {
    switch (selectedTone) {
      case "Formal Terstruktur":
        return "Penyampaian baku, tertib, logis, sistematis, dan berwibawa tinggi. Sangat tepat untuk mimbar resmi, pidato kepemimpinan, atau khutbah formal.";
      case "Khidmat (Syahdu)":
        return "Gaya teduh, khusyuk, sarat penghayatan batin dan tadabbur ruhani untuk membawa kedamaian, kekhusyukan, dan keinsyafan jamaah.";
      case "Menyentuh Hati":
        return "Fokus pada untaian kalimat yang sejuk, empatis, penuh ketulusan kasih sayang, merasuk ke kalbu, serta mengobarkan kelembutan akhlak.";
      case "Santai Humoris":
        return "Penyampaian hangat, adaptif, luwes, diselingi humor cerdas dan segar khas asatid kepesantrenan guna mencairkan suasana tanpa merusak wibawa syariat.";
      case "Membakar Semangat":
        return "Gaya berapi-api, heroik, kharismatik, bertenaga, sarat gelora motivasi untuk membangkitkan tekad amal shalih, persatuan, atau perjuangan kebajikan.";
      case "Edukatif Akademis":
        return "Sarat informasi, membedah dalil secara ilmiah-historis (siroh), argumentatif, runtut, dan logis, sangat sesuai bagi kalangan terpelajar.";
    }
  };

  const categories: SpeechCategory[] = ["Khutbah", "Ceramah", "Tausyiah", "Sambutan", "MC"];
  const languages: SpeechLanguage[] = ["Indonesia", "Jawa", "Sunda", "Melayu", "Inggris", "Arab"];
  const tones: SpeechTone[] = [
    "Formal Terstruktur",
    "Khidmat (Syahdu)",
    "Menyentuh Hati",
    "Santai Humoris",
    "Membakar Semangat",
    "Edukatif Akademis"
  ];

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`border rounded-2xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden transition-colors duration-300 ${
        isDarkMode 
          ? "bg-emerald-950/40 border-emerald-900/40" 
          : "bg-white border-emerald-100 shadow-emerald-100/50"
      }`}
    >
      {/* Decorative Gold Border Top Accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 via-amber-500 to-emerald-600" />

      <h2 className={`text-xl font-serif font-bold flex items-center gap-2 mb-6 ${isDarkMode ? "text-emerald-100" : "text-emerald-950"}`}>
        <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
        Formulir Pembuat Naskah Orasi
      </h2>

      <div className="space-y-6">
        {/* Category Selection */}
        <div>
          <label className={`font-medium text-sm mb-2 flex items-center gap-1.5 ${isDarkMode ? "text-emerald-300" : "text-emerald-900 font-semibold"}`}>
            <BookOpen className="h-4 w-4 text-emerald-500" />
            Kategori Naskah
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {categories.map((cat) => {
              const active = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-300 border ${
                    active
                      ? "bg-emerald-800/80 border-amber-500 text-white shadow-md shadow-emerald-900/30 font-bold"
                      : isDarkMode
                        ? "bg-emerald-950/60 border-emerald-900/60 text-emerald-400 hover:bg-emerald-900/40 hover:text-emerald-200"
                        : "bg-slate-50 border-emerald-100 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-950"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
          <div className={`mt-2.5 rounded-lg p-3 border flex items-start gap-2 text-xs transition-colors duration-300 ${
            isDarkMode 
              ? "bg-emerald-900/20 border-emerald-900/40 text-emerald-400" 
              : "bg-emerald-50/60 border-emerald-100/60 text-emerald-800"
          }`}>
            <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <span>{getCategoryNuance(category)}</span>
          </div>
        </div>

        {/* Language Selection */}
        <div>
          <label className={`font-medium text-sm mb-2 flex items-center gap-1.5 ${isDarkMode ? "text-emerald-300" : "text-emerald-900 font-semibold"}`}>
            <Globe className="h-4 w-4 text-emerald-500" />
            Bahasa Pengantar
          </label>
          <div className="flex flex-wrap gap-2">
            {languages.map((lang) => {
              const active = language === lang;
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={`flex-1 min-w-[95px] py-2 px-3.5 text-center rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 border ${
                    active
                      ? isDarkMode
                        ? "bg-amber-600/40 border-amber-500 text-amber-100 shadow-sm font-bold"
                        : "bg-amber-500/10 border-amber-500 text-amber-850 text-amber-800 font-bold"
                      : isDarkMode
                        ? "bg-emerald-950/60 border-emerald-900/60 text-emerald-400 hover:bg-emerald-900/40 hover:text-emerald-200"
                        : "bg-slate-50 border-emerald-100 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-950"
                  }`}
                >
                  {lang}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tone/Delivery Selection */}
        <div>
          <button
            type="button"
            onClick={() => setShowToneOptions(!showToneOptions)}
            className={`w-full flex items-center justify-between p-3 rounded-xl border text-sm font-semibold transition-all duration-300 ${
              isDarkMode
                ? "bg-emerald-900/20 border-emerald-900/60 text-emerald-200 hover:bg-emerald-900/40"
                : "bg-emerald-50/50 border-emerald-100 text-emerald-950 hover:bg-emerald-100/50"
            }`}
          >
            <span className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-emerald-500" />
              Gaya Intonasi &amp; Bicara: <strong className="text-amber-500 font-bold">{tone}</strong>
            </span>
            <span className={`text-[10px] ml-2 transition-transform duration-300 ${showToneOptions ? 'rotate-180' : 'rotate-0'}`}>
              ▼
            </span>
          </button>
          
          {showToneOptions && (
            <div className="mt-3 p-3 rounded-xl border border-emerald-900/20 bg-emerald-900/5 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {tones.map((t) => {
                  const active = tone === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTone(t)}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-300 border text-center cursor-pointer ${
                        active
                          ? isDarkMode
                            ? "bg-amber-600/40 border-amber-500 text-amber-100 shadow-sm font-bold"
                            : "bg-amber-500/10 border-amber-500 text-amber-900 font-bold"
                          : isDarkMode
                            ? "bg-emerald-950/60 border-emerald-900/60 text-emerald-400 hover:bg-emerald-900/40 hover:text-emerald-200"
                            : "bg-slate-50 border-emerald-100 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-950"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
              <div className={`rounded-lg p-2.5 border flex items-start gap-2 text-xs transition-colors duration-300 ${
                isDarkMode 
                  ? "bg-emerald-900/20 border-emerald-900/40 text-emerald-400" 
                  : "bg-emerald-50/60 border-emerald-100/60 text-emerald-800"
              }`}>
                <Info className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>{getToneNuance(tone)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Topic Input */}
        <div className="space-y-2">
          <label htmlFor="topic-input" className={`font-medium text-sm flex items-center gap-1.5 ${isDarkMode ? "text-emerald-300" : "text-emerald-900 font-semibold"}`}>
            <ScrollText className="h-4 w-4 text-emerald-505 text-emerald-500" />
            Topik Utama / Judul Idaman <span className="text-amber-500">*</span>
          </label>
          <input
            id="topic-input"
            type="text"
            required
            placeholder="Contoh: Keutamaan Shodaqoh Khofiyyah, Adab Bermedia Sosial, atau Sambutan Panitia Idul Adha"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className={`w-full border rounded-lg p-3 outline-none text-sm transition-all ${
              isDarkMode 
                ? "bg-emerald-950/60 border-emerald-900/80 focus:border-amber-500 text-emerald-100 placeholder-emerald-700/80 focus:ring-1 focus:ring-amber-500" 
                : "bg-white border-emerald-200 focus:border-emerald-650 text-emerald-950 placeholder-zinc-400 focus:ring-1 focus:ring-emerald-600"
            }`}
          />
          
          <div>
            <button
              type="button"
              onClick={() => setShowTopicOptions(!showTopicOptions)}
              className="mt-1 text-xs font-semibold text-amber-500 hover:text-amber-400 flex items-center gap-1 transition-all cursor-pointer"
            >
              <span>{showTopicOptions ? "▲ Sembunyikan Rekomendasi Judul" : "💡 Pilih dari Rekomendasi Judul Populer / Terbaik"}</span>
            </button>
            
            {showTopicOptions && (
              <div className="mt-2 p-3 rounded-xl border border-emerald-900/20 bg-emerald-900/5 space-y-2">
                <p className="text-[10px] uppercase font-bold text-emerald-600 font-mono tracking-wider">
                  Rekomendasi Tema {category}:
                </p>
                <div className="flex flex-wrap gap-2">
                  {topicSuggestions[category]?.map((suggestion) => {
                    const active = topic === suggestion;
                    return (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => setTopic(suggestion)}
                        className={`text-xs text-left p-2 rounded-lg border transition-all duration-200 cursor-pointer ${
                          active
                            ? "bg-amber-500/20 border-amber-500 text-amber-500 font-bold"
                            : isDarkMode
                              ? "bg-emerald-955 bg-emerald-950/50 border-emerald-900/40 text-emerald-300 hover:bg-emerald-900/40"
                              : "bg-white border-emerald-100 text-emerald-900 hover:bg-emerald-50"
                        }`}
                      >
                        {suggestion}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Occasion & Audience Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="occasion-input" className={`font-medium text-sm flex items-center gap-1.5 ${isDarkMode ? "text-emerald-300" : "text-emerald-900 font-semibold"}`}>
              <Compass className="h-4 w-4 text-emerald-500" />
              Konteks Acara / Momentum
            </label>
            <input
              id="occasion-input"
              type="text"
              placeholder="Contoh: Shalat Jumat umum, Isra Mi'raj, Walimatul Ursy"
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              className={`w-full border rounded-lg p-3 outline-none text-sm transition-all ${
                isDarkMode 
                  ? "bg-emerald-950/60 border-emerald-900/80 focus:border-amber-500 text-emerald-100 placeholder-emerald-700/80 focus:ring-1 focus:ring-amber-500" 
                  : "bg-white border-emerald-200 focus:border-emerald-650 text-emerald-950 placeholder-zinc-450 placeholder-zinc-400 focus:ring-1 focus:ring-emerald-600"
              }`}
            />
            
            <div>
              <button
                type="button"
                onClick={() => setShowOccasionOptions(!showOccasionOptions)}
                className="mt-1 text-[11px] font-semibold text-amber-500 hover:text-amber-400 flex items-center gap-1 transition-all cursor-pointer"
              >
                <span>{showOccasionOptions ? "▲ Sembunyikan Contoh Acara" : "🕌 Pilih dari Pilihan Acara Populer"}</span>
              </button>
              
              {showOccasionOptions && (
                <div className="mt-2 p-2.5 rounded-xl border border-emerald-900/20 bg-emerald-900/5 flex flex-wrap gap-1.5">
                  {occasionSuggestions.map((oc) => {
                    const active = occasion === oc;
                    return (
                      <button
                        key={oc}
                        type="button"
                        onClick={() => setOccasion(oc)}
                        className={`text-[11px] px-2 py-1 rounded border transition-all cursor-pointer ${
                          active
                            ? "bg-amber-500/20 border-amber-500 text-amber-500 font-bold"
                            : isDarkMode
                              ? "bg-emerald-950/40 border-emerald-900/40 text-emerald-400 hover:bg-emerald-900/30"
                              : "bg-white border-emerald-100 text-emerald-800 hover:bg-emerald-50"
                        }`}
                      >
                        {oc}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="audience-input" className={`font-medium text-sm flex items-center gap-1.5 ${isDarkMode ? "text-emerald-300" : "text-emerald-900 font-semibold"}`}>
              <Users className="h-4 w-4 text-emerald-500" />
              Target Pendengar (Audience)
            </label>
            <input
              id="audience-input"
              type="text"
              placeholder="Contoh: Pemuda millenial, jamaah bapak-bapak, umum pedesaan"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className={`w-full border rounded-lg p-3 outline-none text-sm transition-all ${
                isDarkMode 
                  ? "bg-emerald-950/60 border-emerald-900/80 focus:border-amber-500 text-emerald-100 placeholder-emerald-700/80 focus:ring-1 focus:ring-amber-500" 
                  : "bg-white border-emerald-200 focus:border-emerald-650 text-emerald-950 placeholder-zinc-450 placeholder-zinc-400 focus:ring-1 focus:ring-emerald-600"
              }`}
            />
            
            <div>
              <button
                type="button"
                onClick={() => setShowAudienceOptions(!showAudienceOptions)}
                className="mt-1 text-[11px] font-semibold text-amber-500 hover:text-amber-400 flex items-center gap-1 transition-all cursor-pointer"
              >
                <span>{showAudienceOptions ? "▲ Sembunyikan Contoh Pendengar" : "👥 Pilih dari Klasifikasi Pendengar"}</span>
              </button>
              
              {showAudienceOptions && (
                <div className="mt-2 p-2.5 rounded-xl border border-emerald-900/20 bg-emerald-900/5 flex flex-wrap gap-1.5">
                  {audienceSuggestions.map((aud) => {
                    const active = audience === aud;
                    return (
                      <button
                        key={aud}
                        type="button"
                        onClick={() => setAudience(aud)}
                        className={`text-[11px] px-2 py-1 rounded border transition-all cursor-pointer ${
                          active
                            ? "bg-amber-500/20 border-amber-500 text-amber-500 font-bold"
                            : isDarkMode
                              ? "bg-emerald-950/40 border-emerald-900/40 text-emerald-400 hover:bg-emerald-900/30"
                              : "bg-white border-emerald-100 text-emerald-800 hover:bg-emerald-50"
                        }`}
                      >
                        {aud}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Duration Range */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className={`font-medium text-sm flex items-center gap-1.5 ${isDarkMode ? "text-emerald-300" : "text-emerald-900 font-semibold"}`}>
              <Clock className="h-4 w-4 text-emerald-500" />
              Prakiraan Durasi Pembacaan
            </label>
            <span className="text-amber-500 font-mono text-sm font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {durationMin} Menit
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="45"
            step="1"
            value={durationMin}
            onChange={(e) => setDurationMin(Number(e.target.value))}
            className={`w-full accent-amber-500 h-1.5 rounded-lg cursor-pointer ${isDarkMode ? "bg-emerald-950" : "bg-emerald-100"}`}
          />
          <div className="flex justify-between text-[10px] text-emerald-600 px-1 mt-1 font-medium">
            <span>5 Mnt (Ringkas)</span>
            <span>15 Mnt (Sedang)</span>
            <span>30 Mnt (Panjang)</span>
            <span>45 Mnt (Kajian)</span>
          </div>
        </div>

        {/* Additional Specific Demands */}
        <div>
          <label htmlFor="details-input" className={`font-medium text-sm mb-1.5 flex items-center gap-1.5 ${isDarkMode ? "text-emerald-300" : "text-emerald-900 font-semibold"}`}>
            <FileText className="h-4 w-4 text-emerald-500" />
            Catatan Khusus / Detail Tambahan (Opsional)
          </label>
          <textarea
            id="details-input"
            rows={3}
            placeholder="Contoh: Sisipkan ayat tentang berbakti kepada orang tua, sebutkan nama kepala desa Bpk Ahmad, atau gunakan bahasa Jawa krama alus..."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className={`w-full border rounded-lg p-3 outline-none text-sm transition-all resize-none ${
              isDarkMode 
                ? "bg-emerald-950/60 border-emerald-900/80 focus:border-amber-500 text-emerald-100 placeholder-emerald-700/80 focus:ring-1 focus:ring-amber-500" 
                : "bg-white border-emerald-200 focus:border-emerald-650 text-emerald-950 placeholder-zinc-400 focus:ring-1 focus:ring-emerald-600"
            }`}
          />
        </div>

        {/* Actions Button Grid */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={isLoading || !topic.trim()}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold text-white transition-all bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
              isDarkMode ? "shadow-emerald-950/40" : "shadow-emerald-100"
            }`}
          >
            {isLoading ? (
              <>
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Merumuskan Naskah Berkah...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 text-amber-300" />
                Buat Naskah Sekarang [AI]
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onLoadSample}
            disabled={isLoading}
            className={`py-3 px-4 rounded-xl font-semibold border transition-all flex items-center justify-center gap-2 cursor-pointer text-sm ${
              isDarkMode 
                ? "border-emerald-800 text-emerald-300 bg-emerald-950/30 hover:bg-emerald-900/30 hover:text-emerald-100" 
                : "border-emerald-200 text-emerald-850 text-emerald-800 bg-white hover:bg-emerald-50 hover:text-emerald-950"
            }`}
          >
            <ScrollText className="h-4 w-4" />
            Gunakan Contoh Naskah
          </button>
        </div>
      </div>
    </form>
  );
}
