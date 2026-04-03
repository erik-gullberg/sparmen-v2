"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import createClient from "@/utils/supabase/browserClient";
import toast from "react-hot-toast";
import { ListPlus } from "lucide-react";
import {
  addSongToPlaylist,
  createPlaylistAndAddSong,
} from "@/app/actions/playlistActions";
import styles from "./AddToPlaylist.module.css";

export default function AddToPlaylist({ songId, buttonClassName }) {
  const { user, loading } = useAuth();
  const dialogRef = useRef(null);
  const [playlists, setPlaylists] = useState([]);
  const [fetchingPlaylists, setFetchingPlaylists] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchPlaylists = useCallback(async () => {
    if (!user) return;
    setFetchingPlaylists(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("playlist")
      .select("id, name")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) setPlaylists(data || []);
    setFetchingPlaylists(false);
  }, [user]);

  const openDialog = () => {
    dialogRef.current.showModal();
    if (user) fetchPlaylists();
  };

  const closeDialog = () => {
    dialogRef.current.close();
    setNewName("");
  };

  // Close on backdrop click
  useEffect(() => {
    const dialog = dialogRef.current;
    const handleClick = (e) => {
      if (e.target === dialog) closeDialog();
    };
    dialog?.addEventListener("click", handleClick);
    return () => dialog?.removeEventListener("click", handleClick);
  }, []);

  const handleAdd = async (playlistId) => {
    const result = await addSongToPlaylist(playlistId, songId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Tillagd i spellistan!");
      closeDialog();
    }
  };

  const handleCreateAndAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    const result = await createPlaylistAndAddSong(newName, songId);
    setCreating(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(
        `Spellistan "${result.data.name}" skapad och låten tillagd!`,
      );
      closeDialog();
    }
  };

  const handleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: "https://xn--sprmen-cua.se" },
    });
  };

  return (
    <>
      <button
        className={buttonClassName ?? styles.playlistButton}
        onClick={openDialog}
        aria-label="Lägg till i spellista"
      >
        <ListPlus size={15} strokeWidth={2} /> Spellista
      </button>

      <dialog ref={dialogRef} className={styles.dialog}>
        <div className={styles.dialogHeader}>
          <h2>Lägg till i spellista</h2>
          <button
            className={styles.closeButton}
            onClick={closeDialog}
            aria-label="Stäng"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <p className={styles.message}>Laddar...</p>
        ) : !user ? (
          <div className={styles.loginPrompt}>
            <p>Du måste vara inloggad för att spara låtar i spellistor.</p>
            <button className={styles.loginButton} onClick={handleLogin}>
              Logga in
            </button>
          </div>
        ) : (
          <>
            <div className={styles.playlistList}>
              {fetchingPlaylists ? (
                <p className={styles.message}>Laddar spellistor...</p>
              ) : playlists.length === 0 ? (
                <p className={styles.message}>Du har inga spellistor än.</p>
              ) : (
                playlists.map((pl) => (
                  <button
                    key={pl.id}
                    className={styles.playlistItem}
                    onClick={() => handleAdd(pl.id)}
                  >
                    {pl.name}
                  </button>
                ))
              )}
            </div>

            <hr className={styles.divider} />

            <form onSubmit={handleCreateAndAdd} className={styles.newForm}>
              <label className={styles.newLabel}>Skapa ny spellista</label>
              <div className={styles.newRow}>
                <input
                  className={styles.newInput}
                  type="text"
                  placeholder="Namn på spellistan"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  maxLength={80}
                  required
                />
                <button
                  type="submit"
                  className={styles.createButton}
                  disabled={creating || !newName.trim()}
                >
                  {creating ? "Skapar..." : "Skapa & lägg till"}
                </button>
              </div>
            </form>
          </>
        )}
      </dialog>
    </>
  );
}
