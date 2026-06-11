import { cache } from "react";
import pageStyle from "@/app/(main-flow)/spex/[id]/page.module.css";
import styles from "@/app/page.module.css";
import Link from "next/link";
import { createBuildClient } from "@/utils/supabase/buildClient";
import { MelodyLink } from "@/components/MelodyLink/MelodyLink";
import { notFound } from "next/navigation";

// Revalidate every hour, but serve stale content while revalidating
export const revalidate = 3600;

// Force static generation when possible
export const dynamic = "force-static";

// Cached so generateMetadata and the page share a single fetch per request
// instead of each hitting Supabase. Keyed by argument, so the build client is
// created inside rather than passed in.
const getSong = cache(async (id) => {
  const client = createBuildClient();
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
});

const getShow = cache(async (id) => {
  const client = createBuildClient();
  const { data } = await client
    .from("show")
    .select("id, year, spex(name, id)")
    .eq("id", id)
    .single();

  return data;
});

// Pre-render the entire song catalog at build time so every song page is a
// static CDN file. The archive is finite and changes rarely, so this keeps
// concurrent event traffic off Supabase entirely (no on-demand renders).
export async function generateStaticParams() {
  const client = createBuildClient();

  const { data } = await client.from("song").select("id");

  if (!data) return [];

  return data.map((song) => ({
    id: song.id.toString(),
  }));
}

// Generate dynamic metadata for better SEO and caching
export async function generateMetadata(props) {
  const params = await props.params;
  const song = await getSong(params.id);

  if (!song) {
    return {
      title: "Låt hittades inte",
    };
  }

  const show = await getShow(song?.show_id);

  return {
    title: `${song.title ?? song.name} - ${show?.spex?.name ?? ""}`,
    description: song.lyrics?.substring(0, 160) || "Spexlåt",
  };
}

export default async function Page(props) {
  const params = await props.params;
  const song = await getSong(params.id);

  if (!song) {
    notFound();
  }

  const show = await getShow(song?.show_id);

  if (!show) {
    notFound();
  }

  const formattedLyrics = song.lyrics.replace(/\n/g, "<br>");

  return (
    <div className={styles.container}>
      <div className={styles.containerHeader}>
        <h3>
          {show.spex.id}.{song.number}
          {" - "}
          {song.title ?? song.name}
        </h3>
        <h4>
          <Link
            className={pageStyle.spexLink}
            href={`/spex/${show.spex.id}?show=${show.id}`}
          >
            {show.spex.name} {show.year}
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
