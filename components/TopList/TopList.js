import { createClient } from "@/utils/supabase/server";
import styles from "@/app/page.module.css";
import Link from "next/link";
import style from "./page.module.css";

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

    <ul className={styles.spexList}>
      {data?.map((song, i) => (
        <li key={i} className={styles['song-container']}> 
          <div className={styles.song}>
            <Link href={`/song/${song.song_id}`}>
              {song.name}
            </Link>
          </div>
          <div className={styles['vote-count']}>{song.vote_count}</div>
        </li>
      ))}
    </ul>

  );
}
