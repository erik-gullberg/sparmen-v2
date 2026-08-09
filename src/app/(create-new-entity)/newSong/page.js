"use client";
import style from "./page.module.css";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { createSong } from "@/app/actions/spexActions";
import useEditorGuard from "@/utils/useEditorGuard";

function NewSongContent() {
  const router = useRouter();

  const [songTitle, setSongTitle] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [melody, setMelody] = useState("");
  const [melodyLink, setMelodyLink] = useState("");

  const searchParams = useSearchParams();
  const showId = searchParams.get("showId");

  const { isLoading, isAuthenticated, isEditor, userId } =
    useEditorGuard(!!showId);

  const buttonDisabled = !songTitle || !lyrics;

  const onClick = async () => {
    try {
      const formData = new FormData()
      formData.append('showId', showId)
      formData.append('name', songTitle)
      formData.append('lyrics', lyrics)
      formData.append('melody', melody)
      formData.append('melodyLink', melodyLink)
      formData.append('createdBy', userId)

      const result = await createSong(formData)

      if (result.error) {
        console.error("Error creating song:", result.error);
        toast.error("Något gick fel. Försök igen senare.");
        return;
      }

      router.push(`/song/${result.data.id}`);
    } catch (error) {
      console.error("Unexpected error during song creation:", error);
      toast.error("Något gick fel. Försök igen senare.");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  } else if (!isAuthenticated || !isEditor) {
    return null;
  }

  return (
    <>
      <h2 style={{ marginTop: "1rem" }}>Skapa ny sång</h2>
      <div className={style.container}>
        <section className={style.section}>
          <label className={style.label} htmlFor="song-title">
            Sångtitel *
          </label>
          <input
            id="song-title"
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
          <label className={style.label} htmlFor="song-lyrics">
            Sångtext *
          </label>
          <textarea
            id="song-lyrics"
            className={style.lyricInput}
            placeholder=""
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
          />
        </section>

        <section className={style.section}>
          <label className={style.label} htmlFor="song-melody">
            Melodi
          </label>
          <input
            id="song-melody"
            className={style.input}
            type="text"
            placeholder="ex. Så Lunka vi så småningom"
            enterKeyHint="next"
            value={melody}
            onChange={(e) => setMelody(e.target.value)}
          />
        </section>
        <section className={style.section}>
          <label className={style.label} htmlFor="song-melodylink">
            Melodilänk
          </label>
          <input
            id="song-melodylink"
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
        onClick={onClick}
      >
        Skapa
      </button>
      <br />
    </>
  );
}

export default function NewSongPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewSongContent />
    </Suspense>
  );
}
