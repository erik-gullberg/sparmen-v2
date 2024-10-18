"use client";
import style from "./page.module.css";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import createClient from "@/utils/supabase/browserClient";
import toast from "react-hot-toast";

export default function NewSpexPage() {
  const router = useRouter();
  const supabase = createClient();

  const [year, setYear] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEditor, setIsEditor] = useState(false);

  const searchParams = useSearchParams();
  const spexId = searchParams.get("spexId");

  const buttonDisabled = !year;

  const onClick = () => {
    const createShow = async () => {
      try {
        const { data, error } = await supabase
          .from("show")
          .insert([
            {
              spex_id: spexId,
              year: year,
              year_short: year,
            },
          ])
          .select();

        if (error) {
          console.error("Error creating show:", error);
          return;
        }

        console.log(data);
        router.push(`/spex/${spexId}`);
      } catch (error) {
        console.error("Unexpected error during show creation:", error);
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
    if (!isLoading && (!isAuthenticated || !isEditor || !spexId)) {
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
        <h2>Skapa ny uppsättning</h2>

        <section className={style.section}>
          <h4>Termin *</h4>
          <input
            className={style.input}
            type="text"
            placeholder="Termin ex. HT22"
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
    </Suspense>
  );
}
