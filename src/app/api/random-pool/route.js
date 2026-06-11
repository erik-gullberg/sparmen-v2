import { NextResponse } from "next/server";
import { createBuildClient } from "@/utils/supabase/buildClient";

// Static, hourly-revalidated pool of every song's id + "spexId.number" label.
// Lets the random-song dice pick a song entirely client-side (no server action,
// no DB on the hot path) and flash real song numbers during the reel spin.
export const dynamic = "force-static";
export const revalidate = 3600;

export async function GET() {
  const client = createBuildClient();

  const { data } = await client
    .from("song")
    .select("id, number, show(spex_id)");

  const pool = (data ?? [])
    .filter((song) => song.show?.spex_id != null && song.number != null)
    .map((song) => ({
      id: song.id,
      label: `${song.show.spex_id}.${song.number}`,
    }));

  return NextResponse.json(pool);
}
