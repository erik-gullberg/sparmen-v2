import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";
import ShareButton from "./ShareButton";

export const dynamic = "force-dynamic";

async function getPlaylist(id) {
  const supabase = await createClient();

  const { data: playlist, error: plError } = await supabase
    .from("playlist")
    .select("id, name, created_at, user_id")
    .eq("id", id)
    .single();

  if (plError || !playlist) return null;

  const { data: songs, error: songsError } = await supabase
    .from("playlist_song")
    .select("added_at, song:song_id(id, name, number, show:show_id(spex_id))")
    .eq("playlist_id", id)
    .order("added_at", { ascending: true });

  if (songsError) {
    console.error("Error fetching playlist songs:", songsError);
    return { ...playlist, songs: [] };
  }

  return { ...playlist, songs: songs || [] };
}

export default async function PlaylistPage({ params }) {
  const { id } = await params;
  const playlist = await getPlaylist(id);

  if (!playlist) notFound();

  const shareUrl = `https://xn--sprmen-cua.se/playlist/${id}`;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{playlist.name}</h1>
        <p className={styles.meta}>
          {playlist.songs.length}{" "}
          {playlist.songs.length === 1 ? "låt" : "låtar"}
        </p>
        <ShareButton shareUrl={shareUrl} />
      </div>

      {playlist.songs.length === 0 ? (
        <p className={styles.empty}>Inga låtar i den här spellistan ännu.</p>
      ) : (
        <ul className={styles.songList}>
          {playlist.songs.map(({ song }) => (
            <li key={song.id}>
              <Link
                href={`/song/${song.show?.spex_id}.${song.number}`}
                className={styles.songItem}
              >
                <span className={styles.songName}>{song.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
