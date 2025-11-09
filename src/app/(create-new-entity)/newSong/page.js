"use client";
import style from "./page.module.css";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import createClient from "@/utils/supabase/browserClient";
import toast from "react-hot-toast";
import { createSong } from "@/app/actions/spexActions";

function NewSongContent() {
  const router = useRouter();
  const supabase = createClient();

  const [songTitle, setSongTitle] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [melody, setMelody] = useState("");
  const [melodyLink, setMelodyLink] = useState("");
  const [id, setId] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEditor, setIsEditor] = useState(false);

  const searchParams = useSearchParams();
  const showId = searchParams.get("showId");

  const buttonDisabled = !songTitle || !lyrics;

  const onClick = async () => {
    try {
      const formData = new FormData()
      formData.append('showId', showId)
      formData.append('name', songTitle)
      formData.append('lyrics', lyrics)
      formData.append('melody', melody)
      formData.append('melodyLink', melodyLink)
      formData.append('createdBy', id)

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

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.error("Error fetching user data:", error);
        }

        const roles = await supabase
          .from("role")
          .select("is_editor")
          .eq("user_id", data.user.id)
          .single();

        setIsEditor(roles.data.is_editor);
        setIsAuthenticated(data.user);
        setId(data.user.id);
      } catch (error) {
        console.error("Unexpected error during authentication check:", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkUser();
  }, [supabase]);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isEditor || !showId)) {
      router.push("/");
    }
  }, [isLoading, isAuthenticated, router, isEditor, showId]);

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
          <h4>Sångtitel *</h4>
          <input
            className={style.input}
            type="text"
            placeholder=""
            value={songTitle}
            onChange={(e) => setSongTitle(e.target.value)}
          />
        </section>

        <section className={style.lyricsSection}>
          <h4>Sångtext *</h4>
          <textarea
            className={style.lyricInput}
            placeholder=""
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
          />
        </section>

        <section className={style.section}>
          <h4>Melodi</h4>
          <input
            className={style.input}
            type="text"
            placeholder="ex. Så Lunka vi så småningom"
            value={melody}
            onChange={(e) => setMelody(e.target.value)}
          />
        </section>
        <section className={style.section}>
          <h4>Melodilänk</h4>
          <input
            className={style.input}
            type="url"
            placeholder="Länk till melodin på YouTube, Spotify etc."
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
