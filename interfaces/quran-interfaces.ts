export interface Surah {
  id: number;
  revelation_place: string;
  revelation_order: number;
  bismillah_pre: boolean;
  name_simple: string;
  name_complex: string;
  name_arabic: string;
  verses_count: number;
  pages: number[];
  translated_name: {
    language_name: string;
    name: string;
  };
}

export interface SurahListResponse {
  chapters: Surah[];
}

export interface ChaptersResponse {
  chapters: Surah[];
}

export interface QuranFilterOptions {
  type: "surah" | "page";
  value: number | null;
  searchQuery: string;
}

export interface Translation {
  id: number;
  resource_id: number;
  text: string;
  resource_name?: string;
}

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

export interface AudioData {
  url: string;
  duration?: number;
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

export interface ChapterInfo {
  id: number;
  chapter_id: number;
  language_name: string;
  short_text: string;
  source: string;
  text: string;
}

export interface ChapterInfoResponse {
  chapter_info: ChapterInfo;
}

export interface RecitationInfo {
  id: number;
  reciter_name: string;
  style: string | null;
  translated_name: {
    name: string;
    language_name: string;
  };
}
