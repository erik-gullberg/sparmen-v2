"use client";
import style from "./page.module.css";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import createClient from "@/utils/supabase/browserClient";
import toast from "react-hot-toast";
import { updateSong } from "@/app/actions/spexActions";
import useEditorGuard from "@/utils/useEditorGuard";

export default function EditSongPage() {
  const router = useRouter();

  const [songTitle, setSongTitle] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [melody, setMelody] = useState("");
  const [melodyLink, setMelodyLink] = useState("");

  const params = useParams();
  const songId = params.id;

  const { isLoading, isAuthenticated, isEditor } = useEditorGuard(!!songId);

  const buttonDisabled = !songTitle || !lyrics;

  async function fetchSong(client, id) {
    if (id) {
      const { data } = await client
        .from("song")
        .select("*")
        .eq("id", id)
        .single();

      setSongTitle(data.name ?? "");
      setLyrics(data.lyrics ?? "");
      setMelody(data.melody ?? "");
      setMelodyLink(data.melody_link ?? "");
    }
  }

  async function updateSongData() {
    try {
      const formData = new FormData()
      formData.append('songId', songId)
      formData.append('name', songTitle)
      formData.append('lyrics', lyrics)
      formData.append('melody', melody)
      formData.append('melodyLink', melodyLink)

      const result = await updateSong(formData)

      if (result.error) {
        console.error("Error updating song:", result.error);
        toast.error("Något gick fel. Försök igen senare.");
        return;
      }

      toast.success("Sång uppdaterad!");
      router.push(`/song/${songId}`);
    } catch (error) {
      console.error("Unexpected error during song update:", error);
      toast.error("Något gick fel. Försök igen senare.");
    }
  }

  useEffect(() => {
    const supabase = createClient();
    // Loads existing song data into the form; state is set after an async
    // query, not synchronously, so the cascading-render concern doesn't apply.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSong(supabase, songId);
  }, [songId]);

  if (isLoading) {
    return <div>Loading...</div>;
  } else if (!isAuthenticated || !isEditor) {
    return null;
  }

  return (
    <>
      <h2 style={{ marginTop: "1rem" }}>Redigera sång</h2>
      <div className={style.container}>
        <section className={style.section}>
          <label className={style.label} htmlFor="edit-song-title">
            Sångtitel *
          </label>
          <input
            id="edit-song-title"
            className={style.input}
            type="text"
            placeholder=""
            autoComplete="off"
            enterKeyHint="next"
            value={songTitle}
            onChange={(e) => setSongTitle(e.target.value)}
          />
        </section>

        <section className={style.lyricsSection}>
          <label className={style.label} htmlFor="edit-song-lyrics">
            Sångtext *
          </label>
          <textarea
            id="edit-song-lyrics"
            className={style.lyricInput}
            placeholder=""
            value={lyrics
              .replace(/<p>/g, "")
              .replace(/<\/p>/g, "\n")
              .replace(/<br>/g, "\n")}
            onChange={(e) => setLyrics(e.target.value)}
          />
        </section>

        <section className={style.section}>
          <label className={style.label} htmlFor="edit-song-melody">
            Melodi
          </label>
          <input
            id="edit-song-melody"
            className={style.input}
            type="text"
            placeholder="ex. Så Lunka vi så småningom"
            enterKeyHint="next"
            value={melody}
            onChange={(e) => setMelody(e.target.value)}
          />
        </section>
        <section className={style.section}>
          <label className={style.label} htmlFor="edit-song-melodylink">
            Melodilänk
          </label>
          <input
            id="edit-song-melodylink"
            className={style.input}
            type="url"
            inputMode="url"
            placeholder="Länk till melodin på YouTube, Spotify etc."
            enterKeyHint="done"
            value={melodyLink}
            onChange={(e) => setMelodyLink(e.target.value)}
          />
        </section>
      </div>
      <button
        className={buttonDisabled ? style.buttonDisabled : style.button}
        disabled={buttonDisabled}
        onClick={updateSongData}
      >
        Spara
      </button>
      <br />
    </>
  );
}
