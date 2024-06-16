import { createClient } from "@/utils/supabase/server";
import pageStyle from "@/app/spex/[id]/page.module.css";
import styles from "@/app/page.module.css";
import Link from "next/link";

async function fetchSong(id) {
  const supabase = createClient();
  return supabase.from("song").select("*").eq("id", id).single();
}

async function fetchShow(id) {
  const supabase = createClient();
  return supabase
    .from("show")
    .select("id, year, spex(name, id)")
    .eq("id", id)
    .single();
}

export default async function Page({ params }) {
  const song = await fetchSong(params.id);
  const show = await fetchShow(song.data?.show_id);
  if (!song.data || !show.data) {
    return <div>Den låten hittade vi inte. id: {params.id}</div>;
  }

  const formattedLyrics = song.data?.lyrics.replace(/\n/g, "<br>");

  return (
    <div className={styles.container}>
      <div className={styles.containerHeader}>
        <h3>
          {song.data?.name}
          {" - "}
          <Link
            className={pageStyle.spexLink}
            href={`/spex/${show.data.spex.id}?show=${show.data.id}`}
          >
            {show.data.spex.name} {show.data.year}
          </Link>
        </h3>
      </div>
      <div>
        {song.data.show_warning && (
          <div className={pageStyle.warningBar}>
            ⚠️ Denna låt är olämplig för sittning ⚠️
          </div>
        )}
      </div>
      <div
        className={
          song.data.show_warning
            ? pageStyle.warningSongText
            : pageStyle.songText
        }
        dangerouslySetInnerHTML={{
          __html: formattedLyrics,
        }}
      />
    </div>
  );
}
