"use client";
import style from "./page.module.css";
import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import createClient from "@/utils/supabase/browserClient";
import toast from "react-hot-toast";

function NewSpexContent() {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [id, setId] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEditor, setIsEditor] = useState(false);

  const buttonDisabled = !title || !year;

  const onClick = () => {
    const createSpex = async () => {
      try {
        const { data, error } = await supabase
          .from("spex")
          .insert([
            {
              title: title,
              year: year,
              created_by: id,
            },
          ])
          .select();

        if (error) {
          console.error("Error creating spex:", error);
          toast.error("Ett spex med den titeln finns redan.");
          return;
        }

        router.push(`/spex/${data[0].id}`);
      } catch (error) {
        console.error("Unexpected error during spex creation:", error);
        toast.error("Något gick fel. Försök igen senare.");
      }
    };
    createSpex();
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
