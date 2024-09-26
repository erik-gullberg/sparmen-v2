import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

import styles from "@/app/page.module.css";

function noSongsInResults(results) {
  return results.songs?.length === 0;
}

function noSpexInResults(results) {
  return results.spex?.length === 0;
}

async function fetchData(query, supabase) {
  const { data: songs, error: songsError } = await supabase
    .from("song")
    .select(`
      name,
      id,
      show_id,
      show (
        year_short,
        year,
        spex_id,
        spex (
          name
        )
      )
    `)
    .or(`name.ilike.%${query}%, lyrics.ilike.%${query}%`)
    .order("name", { ascending: false });

  if (songsError) {
    console.error("Error fetching songs:", songsError);
    return { songs: [], spex: [] };
  }

  const spex = songs.map(song => song.show.spex);

  return { songs, spex };
}

export default async function Page({ params, searchParams }) {
  const { q } = searchParams;
  const supabase = createClient();

  const results = await fetchData(q, supabase);

  if (results.songs?.length === 1 && noSpexInResults(results)) {
    redirect(`/song/${results.songs[0].id}`);
  }

  if (results.spex?.length === 1 && noSongsInResults(results)) {
    redirect(`/spex/${results.spex[0].id}`);
  }
  // Sortera results.songs baserat på year_short
  return noSongsInResults(results) && noSpexInResults(results) ? (
    <div>
      <p>Inget hittat på `{q}`</p>
      <br />
      <p>Kolla så du stavat rätt.</p>
      <br />
      <p>Du kan söka på</p>
      <ul>
        <li>Låtnamn</li>
        <li>Låttext</li>
        <li>Orginallåt</li>
        <li>Spexnamn</li>
      </ul>
    </div>
  ) : (
    <div>
      <ul className={styles.spexList}>
        {results.songs.map((song, i) => (
          <li key={i}>
            <Link href={`/song/${song.id}`} passHref>
              <div className={styles.song}>
                {song.name} 
                <br/>
                <div className={styles.songDesc}>{song.show.spex.name} - {song.show.year_short}</div>
                </div>
              
            </Link>
          </li>
        ))}
      </ul>
      <br></br>
      {/* Add this code snippet 
      <ul className={styles.spexList}>
        {results.spex.map((spex, i) => (
          <li key={i}>
            <Link href={`/spex/${spex.id}`}>
              <div className={styles.song}>{spex.name}</div>
            </Link>
          </li>
        ))}
      </ul>
      */}
    </div>
    
  );
}