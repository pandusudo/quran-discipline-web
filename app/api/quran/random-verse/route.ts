import { NextRequest, NextResponse } from "next/server";
import { fetchQuranApi } from "@/lib/quran-api";
import type { Ayah, Surah } from "@/interfaces";

interface RecitationsResponse {
  recitations: { id: number; reciter_name: string }[];
}

interface TranslationsResponse {
  translations: {
    id: number;
    language_name: string;
    name: string;
  }[];
}

interface RandomVerseResponse {
  verse: Ayah;
}

interface ChapterResponse {
  chapter: Surah;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeTranslation =
      searchParams.get("include_translation") === "true";
    const includeTransliteration =
      searchParams.get("include_transliteration") === "true";

    // Get reciters to get audio
    const reciters = await fetchQuranApi<RecitationsResponse>(
      "GET",
      "/resources/recitations",
    );
    if (!reciters) {
      return NextResponse.json(
        { success: false, message: "Failed to fetch reciters" },
        { status: 500 },
      );
    }
    const reciterId = reciters.recitations[0]?.id;

    // Build translation IDs if needed
    const translationIds: number[] = [];

    if (includeTranslation || includeTransliteration) {
      const translations = await fetchQuranApi<TranslationsResponse>(
        "GET",
        "/resources/translations?language=en",
      );

      if (translations?.translations) {
        for (const translation of translations.translations) {
          if (translation.language_name === "english") {
            // ID 57 is transliteration
            if (includeTransliteration && translation.id === 57) {
              translationIds.push(translation.id);
            } else if (includeTranslation && translation.id !== 57) {
              translationIds.push(translation.id);
            }
          }
        }
      }
    }

    const translationsParam =
      translationIds.length > 0
        ? `&translations=${translationIds.join(",")}`
        : "";

    // Fetch random verse — must not be cached so each call returns a different verse
    const result = await fetchQuranApi<RandomVerseResponse>(
      "GET",
      `/verses/random?fields=text_uthmani,chapter_id&audio=${reciterId}${translationsParam}`,
      { cache: "no-store" },
    );

    if (!result?.verse) {
      return NextResponse.json(
        { success: false, message: "Failed to fetch random verse" },
        { status: 500 },
      );
    }

    // Get chapter info for the verse
    const chapter = await fetchQuranApi<ChapterResponse>(
      "GET",
      `/chapters/${result.verse.chapter_id}`,
    );

    if (chapter?.chapter) {
      result.verse.chapter_name_simple = chapter.chapter.name_simple;
    }

    // Handle transliteration separately
    if (includeTransliteration && result.verse.translations) {
      const transliterationData = result.verse.translations.find(
        (t) => t.resource_id === 57,
      );

      if (transliterationData) {
        (
          result.verse as Ayah & { text_transliteration?: string }
        ).text_transliteration = transliterationData.text;
        result.verse.translations = result.verse.translations.filter(
          (t) => t.resource_id !== 57,
        );
      }
    }

    // Remove translations if not requested
    if (!includeTranslation) {
      delete result.verse.translations;
    }

    return NextResponse.json({
      success: true,
      message: "Random verse fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching random verse:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 },
    );
  }
}
