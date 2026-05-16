import type { Ayah } from "./verse";

export interface Translation {
  id: number;
  resource_id: number;
  text: string;
  resource_name?: string;
}

export interface TranslationResponse {
  translations: Ayah[];
}
