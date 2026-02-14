"use server";

import { createClient } from "@/utils/supabase/server";

export async function searchSuggestions(query) {
  if (!query || query.length < 2) {
    return { songs: [], spex: [] };
  }

  const supabase = await createClient();

  // Fetch name matches and lyrics matches separately to prioritize name matches
  const [nameMatchesResult, lyricsMatchesResult, spexResult] =
    await Promise.all([
      // Songs where the name contains the query (highest priority)
      supabase
        .from("song")
        .select(
          `
        name,
        id,
        show (
          year_short,
          spex (
            name
          )
        )
      `,
        )
        .ilike("name", `%${query}%`)
        .order("name", { ascending: true })
        .limit(5),
      // Songs where the lyrics contain the query but name doesn't
      supabase
        .from("song")
        .select(
          `
        name,
        id,
        show (
          year_short,
          spex (
            name
          )
        )
      `,
        )
        .ilike("lyrics", `%${query}%`)
        .not("name", "ilike", `%${query}%`)
        .order("name", { ascending: true })
        .limit(5),
      supabase
        .from("spex")
        .select("name, id")
        .ilike("name", `%${query}%`)
        .limit(3),
    ]);

  // Combine results: name matches first, then lyrics matches
  const nameMatches = nameMatchesResult.data || [];
  const lyricsMatches = lyricsMatchesResult.data || [];

  // Combine and limit to 5 total results
  const combinedSongs = [...nameMatches, ...lyricsMatches].slice(0, 5);

  return {
    songs: combinedSongs,
    spex: spexResult.data || [],
  };
}
