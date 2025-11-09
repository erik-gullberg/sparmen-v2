"use client";
import style from "./page.module.css";
import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import createClient from "@/utils/supabase/browserClient";
import toast from "react-hot-toast";
import { createSpex } from "@/app/actions/spexActions";

function NewSpexContent() {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEditor, setIsEditor] = useState(false);

  const buttonDisabled = !title || !year;

  const onClick = async () => {
    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('year', year)

      const result = await createSpex(formData)

      if (result.error) {
        console.error("Error creating spex:", result.error);
        toast.error("Ett spex med den titeln finns redan.");
        return;
      }

      router.push(`/spex/${result.data.id}`);
    } catch (error) {
      console.error("Unexpected error during spex creation:", error);
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
      } catch (error) {
        console.error("Unexpected error during authentication check:", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkUser();
  }, [supabase]);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isEditor)) {
      router.push("/");
    }
  }, [isLoading, isAuthenticated, router, isEditor]);

  if (isLoading) {
    return <div>Loading...</div>;
  } else if (!isAuthenticated || !isEditor) {
    return null;
  }

  return (
    <div className={style.container}>
      <h2>Skapa nytt spex</h2>

      <section className={style.section}>
        <h4>Titel *</h4>
        <input
          className={style.input}
          type="text"
          placeholder="Titel på spexet"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </section>

      <section className={style.section}>
        <h4>Årtal *</h4>
        <input
          className={style.input}
          type="number"
          placeholder="Året spexet sattes upp"
          value={year}
          onChange={(e) => setYear(e.target.value)}
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
  );
}

export default function NewSpexPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewSpexContent />
    </Suspense>
  );
}
