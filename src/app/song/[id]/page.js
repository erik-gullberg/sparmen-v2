import { createClient } from "@/utils/supabase/server";
import pageStyle from "@/app/spex/[id]/page.module.css";
import styles from "@/app/page.module.css";
import Link from "next/link";

async function fetchSong(id) {
  const supabase = createClient();
  const user = supabase.auth.getUser();

  if (!user) {
    return { text: "Unauthenticated" };
  }
  return supabase.from("song").select("*").eq("id", id).single();
}

async function fetchShow(id) {
  const supabase = createClient();
  const user = supabase.auth.getUser();

  if (!user) {
    return { text: "Unauthenticated" };
  }
  return supabase
    .from("show")
    .select("id, year, spex(name, id)")
    .eq("id", id)
    .single();
}

export default async function Page({ params }) {
  const song = await fetchSong(params.id);
  const show = await fetchShow(song.data.show_id);
  if (!song.data) {
    return <div>No song found with id {params.id}</div>;
  }

  const formattedLyrics = song.data?.lyrics.replace(/\n/g, "<br>");

  return (
    <div className={styles.container}>
      <div className={styles.containerHeader}>
        <h3>
          {song.data?.name}
          {" - "}
          <Link href={`/spex/${show.data.spex.id}`}>
            {show.data.spex.name} {show.data.year}
          </Link>
        </h3>
      </div>
      <div
        className={pageStyle.songText}
        dangerouslySetInnerHTML={{
          __html: formattedLyrics,
        }}
      />
    </div>
  );
}
