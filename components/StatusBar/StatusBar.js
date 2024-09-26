"use client";
import pageStyle from "@/app/spex/[id]/page.module.css";
import createClient from "@/utils/supabase/browserClient";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function StatusBar({ song, user, showWarning, setShowWarning }) {
  const supabase = createClient();
  const [count, setCount] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    if (song) {
      getVoteCount(song.id).then(setCount).catch(console.error);
      if (user) {
        hasUserVoted(song.id, user.user?.id).then(setHasVoted).catch(console.error);
      }
    }
  }, [song, user]);

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

  async function hasUserVoted(songId, userId) {
    const { count, error } = await supabase
      .from("vote")
      .select("*", { count: "exact", head: true })
      .eq("song_id", songId)
      .eq("user_id", userId);

    return !!(count > 0 || error);
  }

  const handleVote = async () => {
    const { error } = await supabase.from("vote").insert({
      song_id: song.id,
      user_id: user.user.id,
    });

    if (error) {
      console.error("Error voting: " + error.message);
      return;
    }

    setCount(count + 1);
    setHasVoted(true);
  };

  const handleUnvote = async () => {
    const { error } = await supabase
      .from("vote")
      .delete()
      .eq("song_id", song.id)
      .eq("user_id", user.user.id);

    if (error) {
      console.error("Error unvoting: " + error.message);
      return;
    }

    setCount(count - 1);
    setHasVoted(false);
  };



  return (
    <div className={pageStyle.statusBar}>
      <div>
        <button
          className={pageStyle.button}
          onClick={() =>
            navigator.clipboard
              .writeText(`https://sparmen-v2.vercel.app/song/${song.id}`)
              .then(() => toast.success("Länk kopierad till urklipp"))
          }
        >
          Kopiera Länk
        </button>
      </div>
      {user.user && (
        <>
          {hasVoted ? (
            <button
              className={pageStyle.button}
              onClick={handleUnvote}
            >
              Av-rösta
            </button>
          ) : (
            <button
              className={pageStyle.button}
              onClick={handleVote}
            >
              Rösta
            </button>
          )}
        </>
      )}
      <div className={pageStyle.count}>{count}</div>

    </div>
  );
}