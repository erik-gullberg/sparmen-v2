"use client";
import style from "./page.module.css";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import createClient from "@/utils/supabase/browserClient";
import toast from "react-hot-toast";

export default function NewSpexPage() {
  const router = useRouter();
  const supabase = createClient();

  const [songTitle, setSongTitle] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [melody, setMelody] = useState("");
  const [melodyLink, setMelodyLink] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEditor, setIsEditor] = useState(false);

  const params = useParams();
  const songId = params.id;

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

  async function updateSong() {
    try {
      const { data, error } = await supabase
        .from("song")
        .update({
          name: songTitle,
          lyrics: lyrics,
          melody: melody,
          melody_link: melodyLink,
        })
        .eq("id", songId);

      if (error) {
        console.error("Error updating song:", error);
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

        setIsEditor(roles.data?.is_editor ?? false);
        setIsAuthenticated(data.user);
      } catch (error) {
        console.error("Unexpected error during authentication check:", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkUser();
    fetchSong(supabase, songId);
  }, [supabase, songId]);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isEditor || !songId)) {
      router.push("/");
    }
  }, [isLoading, isAuthenticated, router, isEditor, songId]);

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
            value={lyrics
              .replace(/<p>/g, "")
              .replace(/<\/p>/g, "\n")
              .replace(/<br>/g, "\n")}
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
        onClick={updateSong}
      >
        Spara
      </button>
      <br />
    </>
  );
}
