import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Prevent browser/CDN caching of PWA config files so updates propagate instantly
app.use((req, res, next) => {
  const url = req.path;
  if ((url.startsWith("/sw") && url.endsWith(".js")) || url.endsWith(".json")) {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
    res.setHeader("Expires", "0");
    res.setHeader("Pragma", "no-cache");
  }
  next();
});

app.use(express.static("public"));

// Lazy Initialize Gemini Client to avoid module-load crashes if key is initially missing
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not configured on the server. Please check Settings > Secrets.");
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// API Routes
app.post("/api/generate", async (req, res) => {
  try {
    const { category, language, tone, topic, occasion, audience, durationMin, details } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured on the server. Please check Settings > Secrets.",
      });
    }

    if (!category || !language || !topic) {
      return res.status(400).json({ error: "Category, Language, and Topic are required." });
    }

    // Build guidelines for the selected tone/style
    let toneGuidelines = "";
    if (tone) {
      switch (tone) {
        case "Formal Terstruktur":
          toneGuidelines = "Gunakan pembawaan bahasa yang sangat formal, tertib, terarah secara logis, akademis, dan memiliki kewibawaan tinggi.";
          break;
        case "Khidmat (Syahdu)":
          toneGuidelines = "Gunakan untaian bahasa yang khidmat, syahdu, agung, penuh penghayatan ruhani yang mendalam, dan menuntun batin pada ketenangan ibadah.";
          break;
        case "Menyentuh Hati":
          toneGuidelines = "Pilihlah diksi yang menyentuh perasaan (heart-touching), penuh empati, kasih sayang, kelembutan nasihat, dan membangkitkan getaran batin pendengar.";
          break;
        case "Santai Humoris":
          toneGuidelines = "Gunakan gaya bicara yang luwes, santai, dan sesekali diselingi humor/anekdot jenaka yang santun, segar, serta mendidik tanpa mengurangi kewibawaan dalil.";
          break;
        case "Membakar Semangat":
          toneGuidelines = "Gunakan ungkapan yang heroik, berapi-api, penuh gelora, kharismatik, bertenaga, dan membakar semangat juang maupun ketakwaan jamaah.";
          break;
        case "Edukatif Akademis":
          toneGuidelines = "Bawakan dengan pendekatan edukatif yang ilmiah, kaya wawasan sejarah (siroh), argumentasi yang rasional, logis, dan mendalam namun tetap mudah dipahami.";
          break;
      }
    }

    // Build the system instructions based on the user's specific theological and structural demands
    let specificGuidelines = "";
    if (category === "Khutbah") {
      specificGuidelines = `
- Anda harus menyusun Khutbah ini menjadi dua bagian: Khutbah Pertama (Sermon 1) dan Khutbah Kedua (Sermon 2).
- Khutbah harus memenuhi 5 rukun khutbah Sunni (Madzhab Ahlussunnah wal Jama'ah), yaitu:
  1. Memuji Allah (Alhamdulillah) - wajib dalam khutbah 1 & 2.
  2. Membaca Shalawat Nabi (Allahumma sholli 'ala Muhammad...) - wajib dalam khutbah 1 & 2.
  3. Berwasiat taqwa (Ittaqullah...) - wajib dalam khutbah 1 & 2.
  4. Membaca ayat Al-Qur'an pada salah satu khutbah (paling utama di khutbah pertama).
  5. Mendoakan kaum muslimin (Allahummaghfir lil muslimina wal muslimati...) - wajib di khutbah kedua.
- Cantumkan dan validasi rukun-rukun ini di dalam respon JSON 'rukunAmanah' Anda dengan mencuplik potongan teks Arab yang sesuai dari naskah.
- Pengambilan dalil wajib yang shahih dari Al-Qur'an (nama surat dan ayat) atau kitab hadits standar (seperti Shahih Bukhari, Shahih Muslim, Abu Dawud, dll).
- Dilarang keras merujuk pada pemikiran Wahabi/salafi kontemporer radikal, wajib berpijak pada pemikiran ulamak klasik madzhab yang diakui (Syafi'i, Hanafi, Maliki, Hanbali) dan ulama Aswaja terkemuka (Imam Al-Ghazali, Imam An-Nawawi, dll).
      `;
    } else {
      specificGuidelines = `
- Bentuk naskah: ${category} yang tulus, mengalir, penuh hikmah, dan beralur jelas (Pendahuluan, Isi, Penutup).
- Masukkan ucapan salam yang pantas, hamdalah/pujian yang agung, serta dalil pendukung yang relevan.
- Pengambilan dalil harus sahih dari Al-Qur'an atau Hadits yang disepakati (Bukhari, Muslim, At-Tirmidzi, dll).
- Hubungkan pesan dengan konteks saat ini dari segi moral, akhlak, dan persatuan umat berlandaskan pemikiran ulama madzhab (terutama aswaja/tradisionalists).
      `;
    }

    const prompt = `
Buatlah sebuah naskah ${category} lengkap dengan detail sebagai berikut:
- Topik / Judul: "${topic}"
- Bahasa pengantar naskah: ${language === 'Arab' ? 'Arab (dengan harokat lengkap untuk ayat/hadits & pidato utama)' : language}
- Gaya Penyampaian / Intonasi & Nada Bicara: "${tone || "Formal Terstruktur"}" (${toneGuidelines})
- Konteks Acara / Momentum: "${occasion || "Umum"}"
- Target Pendengar / Audience: "${audience || "Umum"}"
- Target Durasi Pembacaan: ${durationMin || "10"} menit
- Detail tambahan / Catatan khusus pengguna: "${details || "-"}"

Panduan Tambahan untuk Bahasa:
- Jika bahasa Jawa: Gunakan bahasa Krama Alus untuk bagian penyampaian utama agar sopan, namun bacaan ayat/hadits tetap Arab.
- Jika bahasa Sunda: Gunakan bahasa Sunda Lemes/Loma yang santun dan khidmat.
- Jika bahasa Melayu: Gunakan gaya bahasa Melayu formal yang indah dan puitis.
- Jika bahasa Arab: Ketiklah naskah penuh dalam bahasa Arab berharakat yang indah dan fasih.
- Jika bahasa Indonesia / Inggris: Gunakan bahasa yang baku, mengalir, dan menyentuh hati.

${specificGuidelines}

Tulis naskah khutbah/ceramah secara lengkap, berbobot, namun padat. Berikan harokat lengkap pada teks Arab (terutama ayat atau kutipan hadits) agar mudah dibaca oleh khatib/pembicara.

PENTING UNTUK MENGHINDARI TRUNKASI / GAGAL GENERATE (UNTERMINATED JSON STRING):
1. Batasi kepanjangan tulisan naskah utama ('scriptText') maksimal sekitar 700 - 1000 kata agar tidak memicu limitasi token maksimum Gemini.
2. Di dalam array 'rukunAmanah' dan 'citations', JANGAN menyalin teks ayat/hadits/paragraf yang panjang lebar secara berulang. Cukup berikan potongan ringkas/singkat (1-3 kata) sebagai penanda (textSnippet) agar payload JSON tetap ramping dan utuh.
`;

    const systemInstruction = `
Anda adalah seorang ahli agama Islam (Kiai / Ustadz senior, akademisi dakwah) lulusan universitas Islam terkemuka yang berpegang teguh pada manhaj Ahlussunnah wal Jama'ah (Asy'ariyah/Maturidiyah) dan mengikuti salah satu dari empat Madzhab fiqih yang sah.
Tugas Anda adalah memformulasikan naskah ${category} dalam bahasa ${language} yang sangat fasih, indah, menyentuh hati, terstruktur rapi, valid secara syariat (terutama rukun khutbah), mengutip dalil sahih, dan mendalam secara ilmu.
Format output harus selalu JSON valid sesuai schema yang diminta. Agar naskah tidak terpotong (truncated JSON), pastikan naskah utama padat, bernilai tinggi, dan seluruh elemen data pendukung/metode dibuat se-ringkas mungkin.
`;

    let response: any = null;
    let lastError: any = null;
    const modelsToTry = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
    
    for (const modelName of modelsToTry) {
      let attempts = 3;
      for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
          console.log(`[Gemini API] Menghubungi model ${modelName} (Percobaan ${attempt}/${attempts})...`);
          response = await getGeminiClient().models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              systemInstruction,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  title: {
                    type: Type.STRING,
                    description: "Judul naskah yang menarik, agung, dan relevan.",
                  },
                  scriptText: {
                    type: Type.STRING,
                    description: "Teks naskah lengkap utama dengan format Markdown yang indah. Gunakan pemisah paragraf ganda, judul bab (##), poin-poin yang jelas, dan tulis ayat/hadits Arab lengkap dengan harokat beserta terjemahannya di bawahnya.",
                  },
                  estimatedDuration: {
                    type: Type.STRING,
                    description: "Perkiraan waktu membaca (misal: '12 Menit').",
                  },
                  rukunAmanah: {
                    type: Type.ARRAY,
                    description: "Daftar rukun khutbah (jika Khutbah) atau struktur pidato penting (untuk kategori lain), berikan status kelayakan dan kutipan bagian naskah yang membuktikannya.",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        pillarName: { type: Type.STRING, description: "Nama Rukun / Bagian Struktur (cth: 'Pujian kepada Allah (Hamdalah)', 'Membaca Sholawat', 'Wasiat Taqwa', dll)" },
                        textSnippet: { type: Type.STRING, description: "Potongan teks pembuktian dalam Arab atau bahasa lokal" },
                        status: { type: Type.BOOLEAN, description: "true jika terpenuhi" },
                        explanation: { type: Type.STRING, description: "Penjelasan fiqih singkat terkait rukun tersebut" }
                      },
                      required: ["pillarName", "textSnippet", "status", "explanation"]
                    }
                  },
                  citations: {
                    type: Type.ARRAY,
                    description: "Kutipan dalil-dalil Al-Qur'an dan Hadits Shahih yang disematkan dalam naskah tersebut beserta status kesahihannya.",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        source: { type: Type.STRING, description: "Sumber (cth: 'Surah Al-Baqarah ayat 183' atau 'HR. Bukhari no. 12')" },
                        textArabic: { type: Type.STRING, description: "Teks Arab dalil asli lengkap dengan harokat" },
                        translation: { type: Type.STRING, description: "Terjemahan bahasa Indonesia/sumber naskah" },
                        authenticity: { type: Type.STRING, description: "Ulasan validitas (cth: 'Shahih Mutawatir', 'Shahih Bukhari - Muslim', dll)" }
                      },
                      required: ["source", "textArabic", "translation", "authenticity"]
                    }
                  }
                },
                required: ["title", "scriptText", "estimatedDuration", "citations", "rukunAmanah"]
              }
            }
          });
          
          if (response && response.text) {
            console.log(`[Gemini API] Sukses generate menggunakan model ${modelName} pada percobaan ke-${attempt}`);
            break; 
          }
        } catch (err: any) {
          lastError = err;
          console.warn(`[Gemini API] Model ${modelName} percobaan ke-${attempt} gagal:`, err?.message || err);
          
          if (err?.status && err.status >= 400 && err.status < 500 && err.status !== 429) {
            break; 
          }
          
          if (attempt < attempts) {
            await new Promise(resolve => setTimeout(resolve, attempt * 800));
          }
        }
      }
      
      if (response && response.text) {
        break;
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error("Failed to generate content after trying multiple attempts and models.");
    }

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response generated from Gemini.");
    }

    try {
      const parsedData = JSON.parse(resultText.trim());
      return res.json(parsedData);
    } catch {
      // Fallback in case Gemini returned JSON in block quotes
      const cleanJson = resultText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsedData = JSON.parse(cleanJson);
      return res.json(parsedData);
    }
  } catch (error: any) {
    console.error("Error generating speech content:", error);
    res.status(500).json({ error: error?.message || "Internal Server Error" });
  }
});

// Serve static assets in production, otherwise hook Vite middleware
if (process.env.NODE_ENV !== "production") {
  createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  }).then((vite) => {
    app.use(vite.middlewares);
    
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Development server active on http://localhost:${PORT}`);
    });
  });
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Production server running on port ${PORT}`);
  });
}
