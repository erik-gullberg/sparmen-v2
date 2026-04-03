"use client";
import pageStyle from "@/app/(main-flow)/spex/[id]/page.module.css";
import createClient from "@/utils/supabase/browserClient";
import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { MelodyLink } from "@/components/MelodyLink/MelodyLink";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  voteSong,
  unvoteSong,
  toggleSongWarning,
  deleteSong,
} from "@/app/actions/spexActions";
import { Heart, Link2, Pencil, Trash2, AlertTriangle } from "lucide-react";
import AddToPlaylist from "@/components/AddToPlaylist/AddToPlaylist";

export default function SongContent({ song, user, spexId }) {
  const supabase = createClient();
  const [count, setCount] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteLoading, setVoteLoading] = useState(false);
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
    // Optimistic update
    setHasVoted(true);
    setCount((c) => c + 1);
    setVoteLoading(true);

    const formData = new FormData();
    formData.append("songId", songId);
    formData.append("userId", user.user.id);

    const result = await voteSong(formData);
    setVoteLoading(false);

    if (result.error) {
      console.error("Error voting: " + result.error);
      // Revert
      setHasVoted(false);
      setCount((c) => c - 1);
    }
  };

  const handleUnvote = (songId) => async () => {
    // Optimistic update
    setHasVoted(false);
    setCount((c) => c - 1);
    setVoteLoading(true);

    const formData = new FormData();
    formData.append("songId", songId);
    formData.append("userId", user.user.id);

    const result = await unvoteSong(formData);
    setVoteLoading(false);

    if (result.error) {
      console.error("Error unvoting: " + result.error);
      // Revert
      setHasVoted(true);
      setCount((c) => c + 1);
    }
  };

  const toggleWarning = (songId) => async () => {
    const formData = new FormData();
    formData.append("songId", songId);
    formData.append("showWarning", showWarning.toString());

    const result = await toggleSongWarning(formData);

    if (result.error) {
      console.error("Error toggling warning: " + result.error);
      return;
    }

    setShowWarning(!showWarning);
  };

  const openDialog = () => dialogRef.current.showModal();
  const closeDialog = () => dialogRef.current.close();

  const handleDelete = async () => {
    try {
      const formData = new FormData();
      formData.append("songId", song.id);
      formData.append("spexId", spexId);

      const result = await deleteSong(formData);

      if (result.error) {
        console.error("Error deleting song:", result.error);
        toast.error("Något gick fel. Försök igen senare.");
        return;
      }

      toast.success("Sång borttagen!");
      router.push(spexId ? `/spex/${spexId}` : "/");
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
          {/* Rating */}
          {user.user ? (
            <button
              className={`${pageStyle.actionButton} ${hasVoted ? pageStyle.actionButtonActive : ""} ${voteLoading ? pageStyle.actionButtonLoading : ""}`}
              onClick={hasVoted ? handleUnvote(song.id) : handleVote(song.id)}
              disabled={voteLoading}
              aria-label={hasVoted ? "Ta bort röst" : "Rösta på låt"}
            >
              <Heart size={15} fill={hasVoted ? "currentColor" : "none"} strokeWidth={2} />
              {count}
            </button>
          ) : (
            <span className={pageStyle.actionButton} style={{ cursor: "default", pointerEvents: "none" }}>
              <Heart size={15} fill="none" strokeWidth={2} />
              {count}
            </span>
          )}

          {/* Divider */}
          <span style={{ flex: 1 }} />

          {/* Actions — always grouped together on the right */}
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <button
              className={pageStyle.actionButton}
              onClick={() =>
                navigator.clipboard
                  .writeText(`https://spärmen.se/song/${spexId}.${song.number}`)
                  .then(() => toast.success("Länk kopierad till urklipp"))
              }
            >
              <Link2 size={15} strokeWidth={2} /> Kopiera länk
            </button>
            <AddToPlaylist songId={song.id} buttonClassName={pageStyle.actionButton} />
          </div>
        </div>
        {user.roles?.is_editor && (
          <>
            <p className={pageStyle.editorHeader}>Adminkontroller</p>
            <div className={`${pageStyle.statusBar} ${pageStyle.editorControls}`}>
              <Link href={`/edit/song/${song.id}`}>
                <button className={pageStyle.actionButton}>
                  <Pencil size={14} strokeWidth={2} /> Redigera
                </button>
              </Link>
              <button
                className={`${pageStyle.actionButton} ${showWarning ? pageStyle.actionButtonWarning : ""}`}
                onClick={toggleWarning(song.id)}
              >
                <AlertTriangle size={14} strokeWidth={2} />
                {showWarning ? "Olämplig: På" : "Olämplig: Av"}
              </button>
              <button
                className={pageStyle.actionButton}
                onClick={openDialog}
                style={{ borderColor: "rgba(217,83,79,0.5)", color: "#d9534f" }}
              >
                <Trash2 size={14} strokeWidth={2} /> Ta bort
              </button>
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
