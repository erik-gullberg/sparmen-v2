"use client";
import style from "./page.module.css";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import createClient from "@/utils/supabase/browserClient";
import toast from "react-hot-toast";

export default function NewSpexPage() {
  const router = useRouter();
  const supabase = createClient();

  const [songTitle, setSongTitle] = useState("");
  const [lyrics, setLyrics] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEditor, setIsEditor] = useState(false);

  const searchParams = useSearchParams();
  const showId = searchParams.get("showId");

  const buttonDisabled = !songTitle || !lyrics;

  const onClick = () => {
    const createShow = async () => {
      try {
        const { data, error } = await supabase
          .from("song")
          .insert([
            {
              show_id: showId,
              name: songTitle,
              lyrics: lyrics,
            },
          ])
          .select();

        if (error) {
          console.error("Error creating song:", error);
          return;
        }

        router.push(`/song/${data[0].id}`);
      } catch (error) {
        console.error("Unexpected error during song creation:", error);
        toast.error("Något gick fel. Försök igen senare.");
      }
    };
    createShow();
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
      } catch (error) {
        console.error("Unexpected error during authentication check:", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkUser();
  }, []);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isEditor || !showId)) {
      router.push("/");
    }
  }, [isLoading, isAuthenticated, router, isEditor]);

  if (isLoading) {
    return <div>Loading...</div>;
  } else if (!isAuthenticated || !isEditor) {
    return null;
  }

  return (
    <Suspense>
      <div className={style.container}>
        <h2>Skapa ny sång</h2>

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

        <button
          className={buttonDisabled ? style.buttonDisabled : style.button}
          disabled={buttonDisabled}
          onClick={onClick}
        >
          Skapa
        </button>
      </div>
    </Suspense>
  );
}
