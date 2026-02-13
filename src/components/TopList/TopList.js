import { createClient } from "@/utils/supabase/server";
import styles from "@/app/page.module.css";
import Link from "next/link";

async function fetchData() {
  const supabase = await createClient();
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
        <li key={song.song_id} className={styles["song-container"]}>
          <Link href={`/song/${song.song_id}`} passHref>
            <div className={styles.song}>{song.name}</div>
          </Link>
          <div className={styles["vote-count"]}>{song.vote_count}</div>
        </li>
      ))}
    </ul>
  );
}
