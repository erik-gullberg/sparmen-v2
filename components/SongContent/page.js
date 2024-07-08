"use client";
import pageStyle from "@/app/spex/[id]/page.module.css";
import createClient from "@/utils/supabase/browserClient";
import { useState } from "react";
import Editor from "../Editor/Editor";
import toast from "react-hot-toast";

export default function SongContent({ song, user, songNr }) {
  const supabase = createClient();
  const [count, setCount] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [showWarning, setShowWarning] = useState(song.show_warning);
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

  async function hasUserVoted(songId, userId) {
    const { count, error } = await supabase
      .from("vote")
      .select("*", { count: "exact", head: true })
      .eq("song_id", songId)
      .eq("user_id", userId);

    return !!(count > 0 || error);
  }

  const handleToggle = (song) => (event) => {
    const statusBar = document.querySelector('.' + pageStyle.statusBar);
  
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
  
      if (!user) {
        return false;
      }
  
      hasUserVoted(song.id, user.user?.id).then((hasVoted) => {
        setHasVoted(hasVoted);
      });
  
      statusBar.classList.add(pageStyle.floatingStatusBar);
    } else {
      statusBar.classList.remove(pageStyle.floatingStatusBar);
    }
  };

  const handleVote = (songId) => async () => {
    const { error } = await supabase.from("vote").insert({
      song_id: songId,
      user_id: user.user.id,
    });

    if (error) {
      console.error("Error voting: " + error.message);
      return;
    }

    setCount(count + 1);
    setHasVoted(true);
  };

  const handleUnvote = (songId) => async () => {
    const { error } = await supabase
      .from("vote")
      .delete()
      .eq("song_id", songId)
      .eq("user_id", user.user.id);

    if (error) {
      console.error("Error unvoting: " + error.message);
      return;
    }

    setCount(count - 1);
    setHasVoted(false);
  };

  const toggleWarning = (songId) => async () => {
    const { error } = await supabase
      .from("song")
      .update({ show_warning: !song.show_warning })
      .eq("id", songId);

    if (error) {
      console.error("Error toggling warning: " + error.message);
      return;
    }

    setShowWarning(!showWarning);
  };

  return (
    <details className={pageStyle.dropDown} onToggle={handleToggle(song)}>
      <summary>
        {songNr + "."} {song.name}
      </summary>
      <div className={pageStyle.statusBar}>
        <div>
 
          
          {user.user && (
            <>
              {hasVoted ? (
                <button
                  className={pageStyle.voteButton}
                  onClick={handleUnvote(song.id)}
                >
                  Av-rösta
                </button>
              ) : (
                <button
                  className={pageStyle.voteButton}
                  onClick={handleVote(song.id)}
                >
                  Rösta
                </button>
              )}

            </>
          )}
        </div>
        <div className={pageStyle.voteCount}>
          {count}
        </div>
        <div>
          <button
            className={pageStyle.copyLink}
            onClick={() =>
              navigator.clipboard
                .writeText(`https://sparmen-v2.vercel.app/song/${song.id}`)
                .then(() => toast.success("Länk kopierad till urklipp"))
            }
          >
            Länk
          </button>
        </div>
      </div>

      {user.roles?.is_editor && (
        <div className={pageStyle.statusBar}>
          <div>
            <input
              checked={showWarning}
              className={pageStyle.triggerCheck}
              id="trigger"
              type="checkbox"
              onClick={toggleWarning(song.id)}
            />
            <label htmlFor={"trigger"}>Olämplig för sittning</label>
          </div>
        </div>
      )}

      <div>
        {showWarning && (
          <div className={pageStyle.warningBar}>
            ⚠️ Denna låt är olämplig för sittning ⚠️
          </div>
        )}
      </div>
      {user.roles?.is_editor ? (
        <Editor
          songId={song.id}
          formattedLyrics={formattedLyrics}
          userId={user.user.id}
          className={
            showWarning ? pageStyle.warningSongText : pageStyle.songText
          }
        />
      ) : (
        <div
          className={
            showWarning ? pageStyle.warningSongText : pageStyle.songText
          }
          dangerouslySetInnerHTML={{
            __html: formattedLyrics,
          }}
        />
      )}
    </details>
  );
}
