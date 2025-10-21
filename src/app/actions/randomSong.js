'use server';

import { createClient } from "@/utils/supabase/server";

export async function getRandomSongId() {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_random_song');

  if (error || !data || data.length === 0) {
    console.error("Error fetching random song:", error);
    return null;
  }

  return data[0].id;
}
