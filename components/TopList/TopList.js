import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

async function fetchData() {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("get_top_10_songs");

  if (error) {
    return [];
  }

  return data;
}

export default async function Page() {
  const data = await fetchData();
  return (
    <ul>
      {data?.map((song, i) => (
        <li key={i}>
          <Link href={`/song/${song.song_id}`}>
            {song.vote_count} - {song.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
