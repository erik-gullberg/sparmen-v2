"use client";
import pageStyle from "@/app/spex/[id]/page.module.css";
import createClient from "@/utils/supabase/browserClient";
import { useState } from "react";

export default function SongContent({ song }) {
  const supabase = createClient();
  const [count, setCount] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [user, setUser] = useState(null);
  const formattedLyrics = song.lyrics.replace(/\n/g, "<br>");

  async function getVoteCount(songId) {
    const { count, error } = await supabase
      .from("vote")
      .select("*", { count: "exact", head: true })
      .eq("song_id", songId);

    if (error) {
      throw Error("Error fetching votes: " + error.message);
    }

    return count;
  }

  async function getUser() {
    return await supabase.auth.getUser();
  }

  async function hasUserVoted(songId, userId) {
    const { count, error } = await supabase
      .from("vote")
      .select("*", { count: "exact", head: true })
      .eq("song_id", songId)
      .eq("user_id", userId);

    return !!(count > 0 || error);
  }

  const handleToggle = (song) => (event) => {
    if (event.target.open) {
      if (count === 0) {
        getVoteCount(song.id)
          .then((count) => {
            setCount(count);
          })
          .catch((e) => {
            console.error(e);
          });
      }

      getUser().then((user) => {
        if (!user) {
          return false;
        }

        setUser(user);
        hasUserVoted(song.id, user.data.user.id).then((hasVoted) => {
          setHasVoted(hasVoted);
        });
      });
    }
  };

  const handleVote = (songId) => async () => {
    const user = await getUser();

    const { error } = await supabase.from("vote").insert({
      song_id: songId,
      user_id: user.data.user.id,
    });

    if (error) {
      console.error("Error voting: " + error.message);
      return;
    }

    setCount(count + 1);
    setHasVoted(true);
  };

  const handleUnvote = (songId) => async () => {
    const user = await getUser();

    const { error } = await supabase
      .from("vote")
      .delete()
      .eq("song_id", songId)
      .eq("user_id", user.data.user.id);

    if (error) {
      console.error("Error unvoting: " + error.message);
      return;
    }

    setCount(count - 1);
    setHasVoted(false);
  };

  return (
    <details className={pageStyle.dropDown} onToggle={handleToggle(song)}>
      <summary>{song.name}</summary>
      <div>
        {count}
        {hasVoted && user ? (
          <button onClick={handleUnvote(song.id)}>-</button>
        ) : (
          <button onClick={handleVote(song.id)}>+</button>
        )}
      </div>
      <div
        className={pageStyle.songText}
        dangerouslySetInnerHTML={{
          __html: formattedLyrics,
        }}
      />
    </details>
  );
}
