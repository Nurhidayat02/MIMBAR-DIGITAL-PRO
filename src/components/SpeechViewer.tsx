import React, { useState, useEffect } from "react";
import { SpeechResult } from "../types";
import { 
  Printer, 
  FileEdit, 
  Check, 
  Copy, 
  ArrowRight, 
  Trophy, 
  FileDown, 
  BookOpen, 
  Sparkles, 
  CheckCircle, 
  AlertCircle,
  Undo,
  X,
  ExternalLink
} from "lucide-react";

interface SpeechViewerProps {
  speech: SpeechResult;
  onLaunchTeleprompter: (editedText: string) => void;
  onUpdateSpeech: (updatedSpeech: SpeechResult) => void;
  isDarkMode?: boolean;
}

export default function SpeechViewer({ 
  speech, 
  onLaunchTeleprompter, 
  onUpdateSpeech,
  isDarkMode = true
}: SpeechViewerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(speech.title);
  const [editedText, setEditedText] = useState(speech.scriptText);
  const [copied, setCopied] = useState(false);

  // Keep state sync with new generated speech
  useEffect(() => {
    setEditedTitle(speech.title);
    setEditedText(speech.scriptText);
  }, [speech]);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${editedTitle}\n\n${editedText}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    onUpdateSpeech({
      ...speech,
      title: editedTitle,
      scriptText: editedText,
    });
    setIsEditing(false);
  };

  const handleReset = () => {
    setEditedTitle(speech.title);
    setEditedText(speech.scriptText);
    setIsEditing(false);
  };

  const [showPrintModal, setShowPrintModal] = useState(false);

  const handlePrint = () => {
    setShowPrintModal(true);
  };

  const handleDownloadPrintHtml = () => {
    const lines = editedText.split("\n");
    let formattedHtml = "";

    const formatInline = (textStr: string) => {
      const basicFormatted = textStr
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/\*([^*]+)\*/g, "<em>$1</em>");
      
      const arabicRegex = /([\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+(?:\s+[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+)*)/g;
      return basicFormatted.replace(arabicRegex, (match) => {
        return `<span dir="rtl" style="font-family: 'Amiri', 'Times New Roman', serif; font-size: 1.45em; color: #0f766e; font-weight: bold; padding: 0 2px; direction: rtl; display: inline-block;">${match}</span>`;
      });
    };

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        formattedHtml += "<p><br/></p>";
        return;
      }

      if (trimmed.startsWith("##")) {
        const headerText = trimmed.replace(/^##\s*/, "").replace(/\*\*/g, "");
        formattedHtml += `<h3 dir="ltr">${formatInline(headerText)}</h3>`;
      } else if (trimmed.startsWith("۞")) {
        const arabicText = trimmed.replace(/^۞\s*/, "");
        formattedHtml += `
          <div class="arabic-quote" dir="rtl">
            ${arabicText}
          </div>
        `;
      } else if (trimmed.startsWith("*") && trimmed.endsWith("*")) {
        const directiveText = trimmed.replace(/^\*\s*/, "").replace(/\*$/, "");
        formattedHtml += `<div class="directive-directive" dir="ltr">[ ${formatInline(directiveText)} ]</div>`;
      } else {
        formattedHtml += `<p dir="ltr">${formatInline(trimmed)}</p>`;
      }
    });

    const fullHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>Cetak - ${editedTitle}</title>
  <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Playfair+Display:ital,wght@0,550;0,700;1,500&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #1a1a1a;
      background-color: #fafaf9;
      margin: 0;
      padding: 0;
    }
    
    .toolbar-print {
      background-color: #022c22;
      border-bottom: 2px solid #b45309;
      color: #fff;
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      font-family: 'Inter', sans-serif;
      box-shadow: 0 4px 15px rgba(0,0,0,0.15);
      z-index: 1000;
    }
    .toolbar-title {
      font-weight: 700;
      font-size: 13px;
      letter-spacing: 0.1em;
      color: #fbbf24;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .toolbar-info {
      font-size: 11px;
      color: #34d399;
      background: rgba(4, 120, 87, 0.4);
      padding: 4px 10px;
      border-radius: 99px;
      font-family: monospace;
    }
    .btn-print {
      background-color: #f59e0b;
      color: #022c22;
      border: none;
      padding: 10px 20px;
      font-size: 13px;
      font-weight: 700;
      border-radius: 8px;
      cursor: pointer;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      transition: all 0.2s ease;
    }
    .btn-print:hover {
      background-color: #fbbf24;
      transform: translateY(-1px);
    }
    
    .paper-sheet {
      background: #ffffff;
      max-width: 820px;
      margin: 30px auto;
      padding: 50px 70px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      border-radius: 4px;
      box-sizing: border-box;
    }
    
    .script-header {
      text-align: center;
      border-bottom: 2px double #059669;
      padding-bottom: 25px;
      margin-bottom: 35px;
    }
    .script-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 26pt;
      color: #064e3b;
      margin: 0 0 10px 0;
      font-weight: 750;
      line-height: 1.2;
    }
    .script-meta {
      font-style: italic;
      color: #4b5563;
      font-size: 11pt;
    }
    
    h3 {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 16pt;
      color: #065f46;
      border-bottom: 1px solid #d1d5db;
      padding-bottom: 6px;
      margin-top: 35px;
      margin-bottom: 15px;
      text-align: left;
      direction: ltr;
    }

    p {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.7;
      text-align: justify;
      color: #111827;
      margin-top: 0;
      margin-bottom: 14pt;
      direction: ltr;
    }
    
    strong {
      color: #000;
      font-weight: 700;
    }
    
    .arabic-quote {
      font-family: 'Amiri', 'Times New Roman', serif;
      font-size: 20pt;
      text-align: right;
      line-height: 2.2;
      color: #0f766e;
      background-color: #f0fdf4;
      padding: 16px 20px;
      margin: 22px 0;
      border-right: 5px solid #059669;
      border-left: none;
      border-radius: 4px;
      direction: rtl;
    }
    
    .directive-directive {
      font-family: 'Times New Roman', Times, serif;
      font-size: 11pt;
      font-style: italic;
      color: #b45309;
      text-align: center;
      margin: 16px 0;
      text-transform: uppercase;
      letter-spacing: 0.12em;
    }

    @media print {
      body {
        background: #fff !important;
        color: #000 !important;
      }
      .toolbar-print {
        display: none !important;
      }
      .paper-sheet {
        margin: 0 !important;
        padding: 0 !important;
        box-shadow: none !important;
        max-width: 100% !important;
      }
      h3 {
        color: #065f46 !important;
        border-bottom: 1px solid #000 !important;
      }
      .arabic-quote {
        color: #0f766e !important;
        background-color: #f4fbf7 !important;
        border-right: 4px solid #059669 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .directive-directive {
        color: #b45309 !important;
      }
    }
  </style>
</head>
<body>
  <div class="toolbar-print">
    <div class="toolbar-title">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg>
      <span style="margin-left: 8px;">MIMBAR DIGITAL PRO • HALAMAN PRATINJAU CETAK</span>
    </div>
    <div style="display: flex; align-items: center; gap: 15px;">
      <span class="toolbar-info">Perkiraan: ${speech.estimatedDuration}</span>
      <button class="btn-print" onclick="window.print()">Cetak / Simpan PDF Sekarang</button>
    </div>
  </div>

  <div class="paper-sheet">
    <div class="script-header">
      <h1 class="script-title">${editedTitle}</h1>
      <div class="script-meta">Perkiraan Durasi Membaca: ${speech.estimatedDuration} | Diolah Menggunakan Mimbar Digital Pro</div>
    </div>
    ${formattedHtml}
  </div>

  <script>
    setTimeout(() => {
      window.print();
    }, 600);
  </script>
</body>
</html>`;

    const blob = new Blob(["\ufeff" + fullHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Cetak_${editedTitle.replace(/[\\/*?:"<>|]/g, "").replace(/\s+/g, "_")}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Safe and compatible export to MS Word format (.doc with standard HTML parsing)
  const handleExportWord = () => {
    const lines = editedText.split("\n");
    let formattedHtml = "";

    // Helper to format bold and italic within standard runs
    const formatInline = (textStr: string) => {
      const basicFormatted = textStr
        .replace(/\*\*([^*]+)\*\*/g, "<strong style='color: #121212;'>$1</strong>")
        .replace(/\*([^*]+)\*/g, "<em>$1</em>");
      
      const arabicRegex = /([\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+(?:\s+[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+)*)/g;
      return basicFormatted.replace(arabicRegex, (match) => {
        return `<span dir="rtl" style="font-family: Arial, sans-serif; font-size: 15pt; color: #0d5c3a; font-weight: bold; direction: rtl; display: inline-block;">${match}</span>`;
      });
    };

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        formattedHtml += "<p style='margin-bottom: 12pt;'><br/></p>";
        return;
      }

      // 1. Structural headings
      if (trimmed.startsWith("##")) {
        const headerText = trimmed.replace(/^##\s*/, "").replace(/\*\*/g, "");
        formattedHtml += `<h3 dir="ltr" style="color: #0c4a24; font-family: Georgia, serif; font-size: 16pt; margin-top: 24px; margin-bottom: 12px; border-bottom: 1px solid #ccc; padding-bottom: 4px; text-align: left;">${formatInline(headerText)}</h3>`;
      } 
      // 2. Arabic verses starting with ۞
      else if (trimmed.startsWith("۞")) {
        const arabicText = trimmed.replace(/^۞\s*/, "");
        formattedHtml += `
          <div dir="rtl" style="font-family: Arial, 'Times New Roman', serif; font-size: 18pt; text-align: right; line-height: 2.2; color: #155d27; background-color: #f7f9f7; padding: 12px; margin: 15px 0; border-right: 4px solid #0d5c3a; font-weight: bold;">
            ${arabicText}
          </div>
        `;
      } 
      // 3. Stage directions wrapped in * ... *
      else if (trimmed.startsWith("*") && trimmed.endsWith("*")) {
        const directiveText = trimmed.replace(/^\*\s*/, "").replace(/\*$/, "");
        formattedHtml += `<p dir="ltr" style="font-family: 'Times New Roman', Times, serif; font-size: 11pt; font-style: italic; color: #b45309; text-align: center; margin: 12px 0;">[ ${formatInline(directiveText)} ]</p>`;
      } 
      // 4. Standard Indonesian text lines
      else {
        formattedHtml += `<p dir="ltr" style="font-family: 'Times New Roman', Times, serif; font-size: 12pt; text-align: justify; line-height: 1.6; color: #1a1a1a; margin-bottom: 12pt;">${formatInline(trimmed)}</p>`;
      }
    });

    const wordWrapper = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>${editedTitle}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 1.6;
            color: #000;
            margin: 1in;
          }
          h1 {
            color: #0c4a24;
            font-family: Georgia, serif;
            font-size: 24pt;
            text-align: center;
            margin-bottom: 30px;
          }
          p {
            margin-bottom: 12pt;
            text-align: justify;
          }
        </style>
      </head>
      <body dir="ltr">
        <h1 dir="ltr" style="text-align: center;">${editedTitle}</h1>
        <div dir="ltr" style="text-align: center; margin-bottom: 20px; font-style: italic; color: #555;">
          Perkiraan Durasi: ${speech.estimatedDuration || "12 Menit"} | Diolah dari Mimbar Digital Pro
        </div>
        <hr style="border: 0; border-top: 1px double #0d5c3a; margin-bottom: 30px;" />
        ${formattedHtml}
      </body>
      </html>
    `;

    const blob = new Blob(["\ufeff" + wordWrapper], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${editedTitle.replace(/[\\/*?:"<>|]/g, "").replace(/\s+/g, "_")}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderMixedText = (textStr: string) => {
    const arabicRegex = /([\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+(?:\s+[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+)*)/g;
    const parts = textStr.split(arabicRegex);
    return parts.map((part, idx) => {
      const isArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(part);
      if (isArabic) {
        return (
          <span 
            key={idx} 
            dir="rtl" 
            className={`font-arabic text-2xl tracking-wide mx-1 align-baseline inline-block select-all ${
              isDarkMode ? "text-amber-300" : "text-emerald-900 font-extrabold"
            }`}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // Convert script markdown into beautiful visual elements for JSX preview
  const renderFormattedScript = () => {
    const lines = editedText.split("\n");
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      
      // Empty line
      if (!trimmed) return <div key={idx} className="h-4" />;

      // Header h2 (e.g., ## Khutbah Pertama)
      if (trimmed.startsWith("##")) {
        const headerTxt = trimmed.replace(/^##\s*/, "").replace(/\*\*/g, "");
        return (
          <h3 
            key={idx} 
            dir="ltr" 
            className={`text-2xl font-serif font-bold pb-2 mt-8 mb-4 tracking-tight flex items-center gap-2 text-left border-b ${
              isDarkMode 
                ? "text-emerald-100 border-emerald-900/60" 
                : "text-emerald-950 border-emerald-200"
            }`}
          >
            <span className="text-amber-500 text-lg leading-none shrink-0 select-none">✦</span>
            {renderMixedText(headerTxt)}
          </h3>
        );
      }

      // Quran/Hadits Arab with ۞ bullet
      if (trimmed.startsWith("۞")) {
        const arabicText = trimmed.replace(/^۞\s*/, "");
        return (
          <div 
            key={idx} 
            className={`my-6 p-5 rounded-l-xl rounded-r-lg shadow-inner border-r-4 ${
              isDarkMode 
                ? "bg-emerald-950/70 border-amber-500" 
                : "bg-emerald-50/70 border-emerald-700 border-l border-y border-emerald-200/50"
            }`} 
            dir="rtl"
          >
            <p className={`font-arabic text-3xl leading-relaxed text-right font-bold tracking-wide ${
              isDarkMode ? "text-amber-200" : "text-emerald-950"
            }`}>
              {arabicText}
            </p>
          </div>
        );
      }

      // Strong / emphasis markers
      if (trimmed.startsWith("*") && trimmed.endsWith("*")) {
        // Dialogue style or subtext instructions
        const subtext = trimmed.replace(/^\*\s*/, "").replace(/\*$/, "");
        return (
          <p 
            key={idx} 
            dir="ltr" 
            className={`italic text-sm font-medium px-3 py-1.5 rounded-lg border inline-block my-2 text-left ${
              isDarkMode 
                ? "text-emerald-400 bg-emerald-950/20 border-emerald-900/40" 
                : "text-amber-800 bg-amber-50 border-amber-200"
            }`}
          >
            {renderMixedText(subtext)}
          </p>
        );
      }

      // Inline strong highlights
      return (
        <p 
          key={idx} 
          dir="ltr" 
          className={`leading-relaxed text-base text-justify font-sans my-3.5 whitespace-pre-line ${
            isDarkMode ? "text-emerald-100" : "text-zinc-800"
          }`}
        >
          {trimmed.split(/\*\*([^*]+)\*\*/g).map((part, pIdx) => {
            // odd parts are matched wrapped groups inside ** **
            if (pIdx % 2 === 1) {
              return (
                <strong 
                  key={pIdx} 
                  className={`font-semibold ${
                    isDarkMode ? "text-amber-400" : "text-emerald-850 text-emerald-850 text-emerald-800 font-bold"
                  }`}
                >
                  {renderMixedText(part)}
                </strong>
              );
            }
            return renderMixedText(part);
          })}
        </p>
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Action Toolbar */}
      <div className={`border p-4 flex flex-wrap gap-3 items-center justify-between no-print shadow-md rounded-xl transition-all duration-300 ${isDarkMode ? 'bg-emerald-950/60 border-emerald-900/40 text-emerald-100' : 'bg-white border-emerald-100 text-emerald-950 shadow-emerald-100/40'}`}>
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className={`text-xs font-semibold font-mono uppercase tracking-wider ${isDarkMode ? 'text-emerald-400' : 'text-emerald-800'}`}>
            Selesai Dirumuskan • {speech.estimatedDuration} Bacaan
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSaveEdit}
                className="py-2 px-4 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all font-sans"
              >
                <Check className="h-3.5 w-3.5" />
                Simpan Perubahan
              </button>
              <button
                onClick={handleReset}
                className={`py-2 px-4 rounded-lg border transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer font-sans ${isDarkMode ? 'bg-emerald-900/50 hover:bg-emerald-800/50 border-emerald-800/40 text-emerald-300' : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800'}`}
              >
                <Undo className="h-3.5 w-3.5" />
                Batal
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className={`py-2 px-3.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all font-sans ${isDarkMode ? 'bg-emerald-900/60 hover:bg-emerald-800/60 border-emerald-800/40 text-emerald-200' : 'bg-zinc-50 hover:bg-emerald-50 border-emerald-200 text-emerald-900'}`}
              >
                <FileEdit className="h-3.5 w-3.5 text-emerald-500" />
                Edit Naskah
              </button>
              <button
                onClick={handleCopy}
                className={`py-2 px-3.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all font-sans ${isDarkMode ? 'bg-emerald-900/60 hover:bg-emerald-800/60 border-emerald-800/40 text-emerald-200' : 'bg-zinc-50 hover:bg-emerald-50 border-emerald-200 text-emerald-900'}`}
              >
                {copied ? <Check className={`h-3.5 w-3.5 ${isDarkMode ? "text-emerald-400" : "text-emerald-600"}`} /> : <Copy className={`h-3.5 w-3.5 ${isDarkMode ? "text-emerald-400" : "text-emerald-600"}`} />}
                {copied ? "Tersalin!" : "Salin Teks"}
              </button>
              <button
                onClick={handleExportWord}
                className={`py-2 px-3.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all font-sans ${isDarkMode ? 'bg-emerald-900/60 hover:bg-emerald-800/60 border-emerald-800/40 text-emerald-200' : 'bg-zinc-50 hover:bg-emerald-50 border-emerald-200 text-emerald-900'}`}
              >
                <FileDown className="h-3.5 w-3.5 text-amber-500" />
                Ekspor MS Word
              </button>
              <button
                onClick={handlePrint}
                className={`py-2 px-3.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all font-sans ${isDarkMode ? 'bg-emerald-900/60 hover:bg-emerald-800/60 border-emerald-800/40 text-emerald-200' : 'bg-zinc-50 hover:bg-emerald-50 border-emerald-200 text-emerald-900'}`}
              >
                <Printer className="h-3.5 w-3.5 text-amber-500" />
                Cetak / Simpan PDF
              </button>
            </>
          )}

          <button
            onClick={() => onLaunchTeleprompter(editedText)}
            className="py-2 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 active:scale-95 transition-all font-sans"
          >
            Baca di Teleprompter
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Script Content Panel */}
        <div className={`lg:col-span-2 rounded-2xl p-6 md:p-8 relative print-card border transition-all duration-300 ${isDarkMode ? 'bg-emerald-950/20 border-emerald-900/30 shadow-xl' : 'bg-white border-emerald-100 shadow-md shadow-emerald-100/30'}`}>
          {/* Decorative Corner Leaf Star designs */}
          <div className="absolute top-4 left-4 h-6 w-6 border-t-2 border-l-2 border-emerald-800/30 rounded-tl-sm pointer-events-none no-print" />
          <div className="absolute top-4 right-4 h-6 w-6 border-t-2 border-r-2 border-emerald-800/30 rounded-tr-sm pointer-events-none no-print" />
          <div className="absolute bottom-4 left-4 h-6 w-6 border-b-2 border-l-2 border-emerald-800/30 rounded-bl-sm pointer-events-none no-print" />
          <div className="absolute bottom-4 right-4 h-6 w-6 border-b-2 border-r-2 border-emerald-800/30 rounded-br-sm pointer-events-none no-print" />

          {isEditing ? (
            <div className="space-y-4 no-print">
              <div>
                <label className={`block text-xs font-mono uppercase mb-2 ${isDarkMode ? "text-emerald-400" : "text-emerald-900 font-semibold"}`}>Judul Dokumen</label>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className={`w-full rounded-lg p-3 font-serif font-bold text-xl outline-none border transition-all ${isDarkMode ? 'bg-emerald-950 border-emerald-900/80 text-emerald-100 focus:border-amber-500' : 'bg-white border-emerald-200 text-emerald-950 focus:border-emerald-600'}`}
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className={`block text-xs font-mono uppercase ${isDarkMode ? "text-emerald-400" : "text-emerald-900 font-semibold"}`}>Isi Naskah (Mendukung Teks ۞ Arab)</label>
                  <span className={`text-[10px] ${isDarkMode ? "text-emerald-600" : "text-zinc-500"}`}>Gunakan &quot;۞&quot; di awal baris untuk teks Arab besar</span>
                </div>
                <textarea
                  rows={20}
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className={`w-full rounded-lg p-4 font-mono text-sm outline-none resize-y leading-relaxed border transition-all ${isDarkMode ? 'bg-emerald-950 border-emerald-900/80 text-emerald-100 focus:border-amber-500' : 'bg-white border-emerald-200 text-emerald-950 focus:border-emerald-600'}`}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleSaveEdit}
                  className="py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-sm cursor-pointer shadow-md"
                >
                  Simpan Teks
                </button>
                <button
                  onClick={handleReset}
                  className="py-2.5 px-4 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-emerald-300 font-medium text-sm cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <div className="prose max-w-none">
              <div className={`text-center pb-6 mb-6 border-b ${isDarkMode ? "border-emerald-900/40" : "border-emerald-100"}`}>
                <h1 className={`text-2xl md:text-3xl font-serif font-bold leading-tight ${isDarkMode ? "text-amber-100" : "text-emerald-950"}`}>
                  {editedTitle}
                </h1>
                <p className={`text-xs mt-2 italic no-print ${isDarkMode ? "text-emerald-500" : "text-emerald-850"}`}>
                  Prakiraan membaca: {speech.estimatedDuration} | Diolah menggunakan sistem teologi Ahlussunnah
                </p>
              </div>

              {/* Display Script Text compiled */}
              <div className="space-y-1">
                {renderFormattedScript()}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Rukun validations, Hadits Citations */}
        <div className="space-y-6 no-print">
          
          {/* Validation Checklist Card */}
          <div className={`rounded-2xl p-5 shadow-lg backdrop-blur-md border ${isDarkMode ? 'bg-emerald-950/40 border-emerald-900/40' : 'bg-white border-emerald-150 border-emerald-100 shadow-emerald-150/20'}`}>
            <h3 className={`text-sm font-serif font-bold flex items-center gap-2 mb-4 border-b pb-2 ${isDarkMode ? 'text-emerald-100 border-emerald-900/40' : 'text-emerald-950 border-emerald-100'}`}>
              <Trophy className="h-4 w-4 text-amber-500" />
              Verifikasi &amp; Amanah Syariat
            </h3>
            
            <p className={`text-xs mb-4 p-2.5 rounded-lg border ${isDarkMode ? 'text-emerald-400/80 bg-emerald-900/10 border-emerald-900/20' : 'text-zinc-650 text-zinc-600 bg-emerald-50/50 border-emerald-100/60'}`}>
              Verifikasi kelayakan naskah berdasarkan standar rukun dan manhaj ulama empat madzhab fiqih.
            </p>

            <div className="space-y-3.5">
              {speech.rukunAmanah && speech.rukunAmanah.length > 0 ? (
                speech.rukunAmanah.map((rukun, rIdx) => (
                  <div key={rIdx} className={`border rounded-xl p-3 text-xs ${isDarkMode ? 'bg-emerald-950/60 border-emerald-900/50' : 'bg-slate-50/70 border-emerald-100/60'}`}>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className={`font-semibold block ${isDarkMode ? 'text-emerald-200' : 'text-emerald-950'}`}>{rukun.pillarName}</span>
                      {rukun.status ? (
                        <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 shrink-0">
                          <CheckCircle className="h-3 w-3 text-emerald-500" />
                          Terbaca Valid
                        </span>
                      ) : (
                        <span className="bg-amber-500/10 text-amber-600 border border-amber-500/20 px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 shrink-0">
                          <AlertCircle className="h-3 w-3 text-amber-650" />
                          Modifikasi
                        </span>
                      )}
                    </div>
                    {rukun.textSnippet && (
                      <div className={`p-1.5 rounded border text-center font-arabic text-sm tracking-wide my-1.5 ${isDarkMode ? 'bg-emerald-950/80 border-emerald-900/40 text-amber-250 text-amber-200/90' : 'bg-white border-emerald-105 border-emerald-100 text-emerald-900'}`} dir="rtl">
                        {rukun.textSnippet}
                      </div>
                    )}
                    <p className={`text-[11px] leading-normal ${isDarkMode ? 'text-emerald-400' : 'text-zinc-600'}`}>{rukun.explanation}</p>
                  </div>
                ))
              ) : (
                <div className={`text-center p-4 text-xs ${isDarkMode ? 'text-emerald-500' : 'text-zinc-500'}`}>
                  Amanah Syariat tervalidasi dengan baik untuk Kategori Non-Khutbah.
                </div>
              )}
            </div>
          </div>

          {/* Citations Panel */}
          <div className={`rounded-2xl p-5 shadow-lg backdrop-blur-md border ${isDarkMode ? 'bg-emerald-950/40 border-emerald-900/40' : 'bg-white border-emerald-150 border-emerald-100 shadow-emerald-150/20'}`}>
            <h3 className={`text-sm font-serif font-bold flex items-center gap-2 mb-4 border-b pb-2 ${isDarkMode ? 'text-emerald-100 border-emerald-900/40' : 'text-emerald-950 border-emerald-100'}`}>
              <BookOpen className="h-4 w-4 text-amber-500" />
              Akurasi Dalil Rujukan ({speech.citations?.length || 0})
            </h3>

            <div className="space-y-4">
              {speech.citations && speech.citations.length > 0 ? (
                speech.citations.map((cite, cIdx) => (
                  <div key={cIdx} className={`pb-3 last:border-0 last:pb-0 text-xs border-b ${isDarkMode ? 'border-emerald-900/30' : 'border-emerald-100'}`}>
                    <div className="flex justify-between items-center gap-2 mb-1">
                      <span className={`font-bold font-mono ${isDarkMode ? 'text-amber-400' : 'text-emerald-800'}`}>{cite.source}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono border shadow-sm ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-800 border-emerald-250/20'}`}>
                        {cite.authenticity}
                      </span>
                    </div>

                    <div className={`my-1.5 font-arabic text-right text-base leading-relaxed p-1.5 rounded border ${isDarkMode ? 'text-amber-200 bg-emerald-950/40 border-emerald-900/30' : 'text-emerald-950 bg-emerald-50/50 border-emerald-100/50'}`} dir="rtl">
                      {cite.textArabic}
                    </div>

                    <p className={`leading-normal text-[11px] italic ${isDarkMode ? 'text-emerald-300' : 'text-zinc-650'}`}>
                      &ldquo;{cite.translation}&rdquo;
                    </p>
                  </div>
                ))
              ) : (
                <div className={`text-center p-4 text-xs ${isDarkMode ? 'text-emerald-500' : 'text-zinc-500'}`}>
                  Tidak ditemukan kutipan ayat/hadits terpisah dalam naskah ini.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md no-print animate-fade-in">
          <div className="bg-zinc-950 border border-emerald-900/60 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl relative text-left">
            {/* Close Button */}
            <button 
              onClick={() => setShowPrintModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 cursor-pointer transition-colors"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            {/* Pattern Accent Header */}
            <div className="bg-emerald-950/85 p-6 border-b border-emerald-900/40 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Printer className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <h3 className="text-base font-serif font-black text-amber-100 uppercase tracking-wider block">
                  Cetak &amp; Simpan PDF Naskah
                </h3>
                <p className="text-xs text-emerald-400 mt-0.5 mt-0">
                  Pilih metode pencetakan yang sesuai dengan kebutuhan Anda.
                </p>
              </div>
            </div>

            {/* Content body */}
            <div className="p-6 space-y-4">
              <div className="bg-emerald-900/10 border border-emerald-900/20 rounded-xl p-4 text-xs text-emerald-300 leading-relaxed">
                <strong className="text-amber-500 block mb-1">Catatan Keamanan Browser:</strong>
                Aplikasi ini berjalan di dalam panel pratinjau iFrame AI Studio. Beberapa browser membatasi fungsi cetak langsung <code>window.print()</code> jika berada di dalam iFrame. Kami menyediakan solusi cetak mandiri yang 100% aman dan lancar di bawah ini.
              </div>

              {/* Solusi Rekomendasi: HTML Download */}
              <div className="bg-zinc-900/60 border border-amber-500/30 hover:border-amber-500/60 rounded-xl p-4 transition-all duration-300">
                <div className="flex items-start gap-3">
                  <div className="bg-amber-500/10 text-amber-500 p-2 rounded-lg mt-0.5 font-bold text-xs shrink-0 font-sans">
                    A4
                  </div>
                  <div className="flex-1 space-y-1">
                    <span className="text-xs font-bold text-[#FFF9E6] flex items-center gap-1.5 font-serif">
                      1. File Cetak Mandiri / Save PDF (Rekomendasi Utama)
                      <span className="bg-amber-500/10 text-amber-400 text-[9px] font-bold py-0.5 px-1.5 rounded uppercase font-mono tracking-wider">
                        Sangat Stabil
                      </span>
                    </span>
                    <p className="text-[11px] text-zinc-400 leading-normal font-sans">
                      Mengunduh file halaman cetak mandiri. Cukup klik tombol unduhan, jalankan file HTML tersebut, lalu tekan tombol <strong>&quot;Cetak Ke PDF&quot;</strong> di browser Anda demi baris tulisan Indonesia-Arab yang presisi dan tidak terpotong.
                    </p>
                    <button
                      onClick={() => {
                        handleDownloadPrintHtml();
                        setShowPrintModal(false);
                      }}
                      className="mt-3.5 w-full py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95 font-sans"
                    >
                      <FileDown className="h-3.5 w-3.5 text-emerald-950" />
                      Unduh Berkas Cetak Mandiri
                    </button>
                  </div>
                </div>
              </div>

              {/* Solusi Alternatif: Cetak Langsung */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-zinc-200 block font-serif">
                      2. Cetak Langsung Browser
                    </span>
                    <p className="text-[10px] text-zinc-400 leading-normal font-sans">
                      Membuka antarmuka cetak default browser sekarang. Mungkin terblokir jika pengaturan iFrame Anda ketat.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowPrintModal(false);
                      setTimeout(() => {
                        window.print();
                      }, 300);
                    }}
                    className="mt-4 w-full py-2 px-3 rounded-lg bg-emerald-900 hover:bg-emerald-800 border border-emerald-800 text-emerald-300 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all font-sans"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Cetak Instan
                  </button>
                </div>

                <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-zinc-200 block font-serif">
                      3. Buka di Tab Baru
                    </span>
                    <p className="text-[10px] text-zinc-400 leading-normal font-sans">
                      Buka aplikasi di tab baru agar tidak terhalang iFrame keamanan, kemudian cetak langsung dengan lancar.
                    </p>
                  </div>
                  <a
                    href={window.location.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 w-full py-2 px-3 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-900 text-amber-500 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all text-center font-sans"
                    onClick={() => setShowPrintModal(false)}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Buka Tab Baru
                  </a>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-zinc-950 px-6 py-4 border-t border-zinc-900 text-center">
              <button
                onClick={() => setShowPrintModal(false)}
                className="py-2 px-5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-medium cursor-pointer transition-all font-sans"
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
