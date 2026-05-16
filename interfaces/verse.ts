import type { AudioData } from "./audio";
import type { Translation } from "./translation";

export interface Ayah {
  id: number;
  verse_number: number;
  verse_key: string;
  hizb_number: number;
  rub_el_hizb_number: number;
  ruku_number: number;
  manzil_number: number;
  sajdah_number: number | null;
  text_uthmani: string;
  page_number: number;
  juz_number: number;
  chapter_id: number;
  chapter_name_simple?: string;
  translations?: Translation[];
  audio?: AudioData;
}

export interface VerseResponse {
  verses: Ayah[];
}

export interface VersesByPageResponse {
  verses: Ayah[];
  pagination: {
    per_page: number;
    current_page: number;
    next_page: number | null;
    total_pages: number;
    total_records: number;
  };
}

export interface BlockedVerse {
  id: number;
  verse_number: number;
  verse_key: string;
  text_uthmani: string;
  text_transliteration?: string;
  chapter_name_simple: string;
  chapter_id: number;
  page_number: number;
  juz_number: number;
  audio: {
    url: string;
    segments: Array<[number, number, number, number]>;
  };
  translations: Array<{
    id: number;
    resource_id: number;
    text: string;
  }>;
}

export interface RandomVerseApiResponse {
  success: boolean;
  message: string;
  data: { verse: BlockedVerse };
}
