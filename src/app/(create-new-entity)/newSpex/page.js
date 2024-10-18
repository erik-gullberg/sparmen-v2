"use client";
import style from "./page.module.css";
import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import createClient from "@/utils/supabase/browserClient";
import toast from "react-hot-toast";

export default function NewSpexPage() {
  const router = useRouter();
  const supabase = createClient();

  const [spexName, setSpexName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEditor, setIsEditor] = useState(false);

  const buttonDisabled = !spexName;

  const onClick = () => {
    const createSpex = async () => {
      try {
        const { data, error } = await supabase
          .from("spex")
          .insert([
            {
              name: spexName,
            },
          ])
          .select();

        if (error) {
          console.error("Error creating spex:", error);
          return;
        }

        console.log(data);
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
      } catch (error) {
        console.error("Unexpected error during authentication check:", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkUser();
  }, []);

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
    <Suspense>
      <div className={style.container}>
        <h2>Skapa nytt spex</h2>

        <section className={style.section}>
          <h4>Spexnamn *</h4>
          <input
            className={style.input}
            type="text"
            placeholder="Namn"
            value={spexName}
            onChange={(e) => setSpexName(e.target.value)}
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
