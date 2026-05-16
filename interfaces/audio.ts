export interface AudioData {
  url: string;
  duration?: number;
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
