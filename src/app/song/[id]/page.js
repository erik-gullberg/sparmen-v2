import pageStyle from "@/app/spex/[id]/page.module.css";
import styles from "@/app/page.module.css";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

async function fetchSong(client, id) {
  return client.from("song").select("*").eq("id", id).single();
}

async function fetchShow(client, id) {
  return client
    .from("show")
    .select("id, year, spex(name, id)")
    .eq("id", id)
    .single();
}

export default async function Page({ params }) {
  const client = createClient();
  const song = await fetchSong(client, params.id);
  const show = await fetchShow(client, song.data?.show_id);

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
