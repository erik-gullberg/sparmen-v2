import { createClient } from "@/utils/supabase/server";
import styles from "@/app/page.module.css";
import Link from "next/link";

async function fetchData() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_top_voted_songs");

  if (error) {
    return [];
  }

  return data;
}

export const revalidate = 3600; // Revalidate every hour
export const dynamic = "force-static"; // Force static generation

// Generate metadata for better SEO
export const metadata = {
  title: "Toppröstade låtar",
  description: "De mest populära spexlåtarna baserat på användarröster",
};

export default async function TopSongs() {
  const data = await fetchData();
  return (
    <main>
      <h3 style={{ textAlign: "center", margin: "1rem" }}>Toppröstade låtar</h3>
      <ul className={styles.spexList}>
        {data?.map((song, i) => (
          <li key={i} className={styles["song-container"]}>
            <Link href={`/song/${song.id}`} passHref>
              <div className={styles.song}>{song.name}</div>
            </Link>
            <div className={styles["vote-count"]}>{song.vote_count}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
