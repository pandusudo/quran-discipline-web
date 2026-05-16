import { NextResponse } from "next/server";
import { fetchQuranApi } from "@/lib/quran-api";
import type { ChaptersResponse } from "@/interfaces";

export async function GET() {
  try {
    const chapters = await fetchQuranApi<ChaptersResponse>("GET", "/chapters", {
      next: { revalidate: 86400 },
    });

    if (!chapters) {
      return NextResponse.json(
        { error: "Failed to fetch chapters" },
        { status: 502 },
      );
    }

    return NextResponse.json(chapters);
  } catch (error) {
    console.error("Error fetching chapters:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
