import { NextRequest, NextResponse } from "next/server";
import { fetchQuranApi } from "@/lib/quran-api";
import type { VersesByPageResponse } from "@/interfaces";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> },
) {
  try {
    const { pageId } = await params;
    const pageNumber = parseInt(pageId, 10);

    if (isNaN(pageNumber) || pageNumber < 1 || pageNumber > 604) {
      return NextResponse.json(
        { error: "Invalid page number. Must be between 1 and 604." },
        { status: 400 },
      );
    }

    const translations = await fetchQuranApi<any>(
      "GET",
      `/resources/translations?language=en`,
    );

    const translationId = (translations.translations || [])
      .filter(
        (translation: any) =>
          translation.language_name === "english" && translation.id !== 57,
      )
      .map((translation: any) => translation.id);

    const reciters = await fetchQuranApi<any>("GET", `/resources/recitations`);
    const reciterId = reciters.recitations[0].id;

    const queryString = new URLSearchParams({
      translations: translationId.join(","),
      fields: "text_uthmani,chapter_id",
      audio: reciterId.toString(),
    }).toString();

    const data = await fetchQuranApi<VersesByPageResponse>(
      "GET",
      `/verses/by_page/${pageNumber}?${queryString}`,
      { next: { revalidate: 86400 } },
    );

    if (!data) {
      return NextResponse.json(
        { error: "Failed to fetch verses for this page" },
        { status: 502 },
      );
    }
    const hashmapId: Record<string, string> = {};

    for (const verse of data.verses) {
      if (!hashmapId[verse.chapter_id]) {
        const chapter = await fetchQuranApi<any>(
          "GET",
          `/chapters/${verse.chapter_id}`,
        );
        hashmapId[verse.chapter_id] = chapter.chapter.name_simple;
      }

      verse.chapter_name_simple = hashmapId[verse.chapter_id];
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching verses by page:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
