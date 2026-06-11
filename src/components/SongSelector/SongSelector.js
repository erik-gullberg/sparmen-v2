"use client";
import { useEffect, useState } from "react";
import pageStyle from "@/app/(main-flow)/spex/[id]/page.module.css";
import createClient from "@/utils/supabase/browserClient";
import SongContent from "../SongContent/page";
import Link from "next/link";

export default function SongSelector({ songs, showId, user, spexId }) {
  const [voteCounts, setVoteCounts] = useState({});
  const [votedSongIds, setVotedSongIds] = useState(() => new Set());

  const songIds = songs.map((song) => song.id);
  const songIdsKey = songIds.join(",");
  const userId = user.user?.id;

  // Vote data is the one thing that genuinely changes, so we still load it at
  // runtime — but batched into a single query for the whole show instead of one
  // count() per expanded song.
  useEffect(() => {
    if (songIds.length === 0) {
      setVoteCounts({});
      setVotedSongIds(new Set());
      return;
    }

    let cancelled = false;
    const supabase = createClient();

    async function loadVotes() {
      const { data: votes } = await supabase
        .from("vote")
        .select("song_id")
        .in("song_id", songIds);

      if (cancelled) return;

      const counts = {};
      for (const vote of votes ?? []) {
        counts[vote.song_id] = (counts[vote.song_id] ?? 0) + 1;
      }
      setVoteCounts(counts);

      if (!userId) {
        setVotedSongIds(new Set());
        return;
      }

      const { data: mine } = await supabase
        .from("vote")
        .select("song_id")
        .eq("user_id", userId)
        .in("song_id", songIds);

      if (!cancelled) {
        setVotedSongIds(new Set((mine ?? []).map((vote) => vote.song_id)));
      }
    }

    loadVotes();
    return () => {
      cancelled = true;
    };
    // songIdsKey captures the set of songs; userId re-runs when auth resolves.
  }, [songIdsKey, userId]);

  return (
    <div className={pageStyle.songContainer}>
      {songs?.map((song) => (
        <SongContent
          key={song.id}
          song={song}
          user={user}
          spexId={spexId}
          initialCount={voteCounts[song.id] ?? 0}
          initialHasVoted={votedSongIds.has(song.id)}
        ></SongContent>
      ))}

      {user.roles?.is_editor && showId && (
        <Link href={"/newSong?showId=" + showId} className={pageStyle.tab}>
          Ny Sång +
        </Link>
      )}
    </div>
  );
}
