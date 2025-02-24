"use client";
import pageStyle from "@/app/(main-flow)/spex/[id]/page.module.css";
import createClient from "@/utils/supabase/browserClient";
import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { MelodyLink } from "@/components/MelodyLink/MelodyLink";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SongContent({ song, user, spexId }) {
  const supabase = createClient();
  const [count, setCount] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [showWarning, setShowWarning] = useState(song.show_warning);
  const dialogRef = useRef(null);
  const formattedLyrics = song.lyrics.replace(/\n/g, "<br>");

  const router = useRouter();

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

  const openDialog = () => dialogRef.current.showModal();
  const closeDialog = () => dialogRef.current.close();

  const handleDelete = async () => {
    try {
      const { error } = await supabase.from("song").delete().eq("id", song.id);

      if (error) {
        console.error("Error deleting song:", error);
        toast.error("Något gick fel. Försök igen senare.");
        return;
      }

      toast.success("Sång borttagen!");
      window.location.reload();
    } catch (error) {
      console.error("Unexpected error during song deletion:", error);
      toast.error("Något gick fel. Försök igen senare.");
    } finally {
      closeDialog();
    }
  };

  return (
    <>
      <details className={pageStyle.dropDown} onToggle={handleToggle(song)}>
        <summary className={pageStyle.summary}>
          {song.number + "."} {song.name}
        </summary>
        <div className={pageStyle.statusBar}>
          <div>
            Rating:
            {"  "}
            {count}
            {user.user && (
              <>
                {hasVoted ? (
                  <button
                    className={pageStyle.voteButton}
                    onClick={handleUnvote(song.id)}
                  >
                    -1
                  </button>
                ) : (
                  <button
                    className={pageStyle.voteButton}
                    onClick={handleVote(song.id)}
                  >
                    +1
                  </button>
                )}
              </>
            )}
          </div>
          <div>
            <button
              className={pageStyle.copyLink}
              onClick={() =>
                navigator.clipboard
                  .writeText(
                    `https://sparmen-v2.vercel.app/song/${spexId}.${song.number}`,
                  )
                  .then(() => toast.success("Länk kopierad till urklipp"))
              }
            >
              Kopiera Länk
            </button>
          </div>
        </div>
        {user.roles?.is_editor && (
          <>
            <p className={pageStyle.editorHeader}>Adminkontroller</p>
            <div
              className={`${pageStyle.statusBar} ${pageStyle.editorControls}`}
            >
              <div>
                <Link href={`/edit/song/${song.id}`}>
                  <button className={pageStyle.editButton}>Redigera</button>
                </Link>
              </div>
              <div>
                <input
                  checked={showWarning}
                  className={pageStyle.triggerCheck}
                  id="trigger"
                  type="checkbox"
                  onChange={toggleWarning(song.id)}
                />
                <label htmlFor={"trigger"}>Olämplig för sittning</label>
              </div>
              <div>
                <button className={pageStyle.editButton} onClick={openDialog}>
                  Ta Bort
                </button>
              </div>
            </div>
          </>
        )}
        <div>
          {showWarning && (
            <div className={pageStyle.warningBar}>
              ⚠️ Denna låt är olämplig för sittning ⚠️
            </div>
          )}
        </div>
        {song.melody && song.melody_link && <MelodyLink song={song} />}
        <div
          className={
            showWarning ? pageStyle.warningSongText : pageStyle.songText
          }
          dangerouslySetInnerHTML={{
            __html: formattedLyrics,
          }}
        />
      </details>

      <dialog ref={dialogRef} className={pageStyle.dialog}>
        <h2>Är du säker?</h2>
        <p>Detta går inte att ångra.</p>

        <button className={pageStyle.confirmButton} onClick={handleDelete}>
          Ja, ta bort
        </button>
        <button className={pageStyle.cancelButton} onClick={closeDialog}>
          Avbryt
        </button>

        <p style={{ marginTop: "1rem", fontSize: "0.8rem" }}>
          Du kan bara ta bort låtar du själv skapat
        </p>
      </dialog>
    </>
  );
}
