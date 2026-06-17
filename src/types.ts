/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SpeechCategory = "Khutbah" | "Ceramah" | "Tausyiah" | "Sambutan" | "MC";

export type SpeechLanguage = "Indonesia" | "Jawa" | "Sunda" | "Melayu" | "Inggris" | "Arab";

export type SpeechTone = 
  | "Formal Terstruktur" 
  | "Khidmat (Syahdu)" 
  | "Menyentuh Hati" 
  | "Santai Humoris" 
  | "Membakar Semangat" 
  | "Edukatif Akademis";

export interface SpeechRequest {
  category: SpeechCategory;
  language: SpeechLanguage;
  tone: SpeechTone;
  topic: string;
  occasion: string;
  audience: string;
  durationMin: number;
  details: string;
}

export interface RukunAmanahItem {
  pillarName: string;
  textSnippet: string;
  status: boolean;
  explanation: string;
}

export interface CitationItem {
  source: string;
  textArabic: string;
  translation: string;
  authenticity: string;
}

export interface SpeechResult {
  title: string;
  scriptText: string;
  estimatedDuration: string;
  citations: CitationItem[];
  rukunAmanah: RukunAmanahItem[];
}

export interface TeleprompterConfig {
  speed: number;       // 1 - 10
  fontSize: number;    // in px (e.g. 24, 32, 40 etc)
  isScrollActive: boolean;
  theme: "dark" | "light" | "sepia" | "emerald";
  fontStyle: "sans" | "serif" | "mono" | "naskh";
  flipped: boolean;    // mirror effect if requested
}
