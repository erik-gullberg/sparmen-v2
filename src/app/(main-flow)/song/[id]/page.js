import pageStyle from "@/app/(main-flow)/spex/[id]/page.module.css";
import styles from "@/app/page.module.css";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { createBuildClient } from "@/utils/supabase/buildClient";
import { MelodyLink } from "@/components/MelodyLink/MelodyLink";
import { notFound } from "next/navigation";

// Revalidate every hour, but serve stale content while revalidating
export const revalidate = 3600;

// Force static generation when possible
export const dynamic = "force-static";

async function fetchSong(client, id) {
  const [spexId, songNumber] = id.split(".");

  if (spexId && !songNumber) {
    const { data } = await client
      .from("song")
      .select("*")
      .eq("id", id)
      .single();

    return data;
  }

  const { data } = await client.rpc("get_song_with_show_and_spex", {
    spex_id: spexId,
    song_number: songNumber,
  });

  return data ? data[0] : null;
}

async function fetchShow(client, id) {
  return client
    .from("show")
    .select("id, year, spex(name, id)")
    .eq("id", id)
    .single();
}

// Pre-render the most popular songs at build time
export async function generateStaticParams() {
  const client = createBuildClient();

  // Fetch top songs to pre-render
  const { data } = await client.rpc("get_top_voted_songs").limit(50); // Pre-render top 50 songs

  if (!data) return [];

  return data.map((song) => ({
    id: song.id.toString(),
  }));
}

// Generate dynamic metadata for better SEO and caching
export async function generateMetadata(props) {
  const params = await props.params;
  const client = createBuildClient();
  const song = await fetchSong(client, params.id);

  if (!song) {
    return {
      title: "Låt hittades inte",
    };
  }

  const show = await fetchShow(client, song?.show_id);

  return {
    title: `${song.title ?? song.name} - ${show.data?.spex?.name ?? ""}`,
    description: song.lyrics?.substring(0, 160) || "Spexlåt",
  };
}

export default async function Page(props) {
  const params = await props.params;
  const client = await createClient();
  const song = await fetchSong(client, params.id);

  if (!song) {
    notFound();
  }

  const show = await fetchShow(client, song?.show_id);

  if (!show.data) {
    notFound();
  }

  const formattedLyrics = song.lyrics.replace(/\n/g, "<br>");

  return (
    <div className={styles.container}>
      <div className={styles.containerHeader}>
        <h3>
          {show.data.spex.id}.{song.number}
          {" - "}
          {song.title ?? song.name}
        </h3>
        <h4>
          <Link
            className={pageStyle.spexLink}
            href={`/spex/${show.data.spex.id}?show=${show.data.id}`}
          >
            {show.data.spex.name} {show.data.year}
          </Link>
        </h4>
      </div>
      <div>
        {song.show_warning && (
          <div className={pageStyle.warningBar}>
            ⚠️ Denna låt är olämplig för sittning ⚠️
          </div>
        )}
      </div>
      {song.melody && song.melody_link && <MelodyLink song={song} />}
      <div
        className={
          song.show_warning ? pageStyle.warningSongText : pageStyle.songText
        }
        dangerouslySetInnerHTML={{
          __html: formattedLyrics,
        }}
      />
    </div>
  );
}
