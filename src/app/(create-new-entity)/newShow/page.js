"use client";
import style from "./page.module.css";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import createClient from "@/utils/supabase/browserClient";
import toast from "react-hot-toast";
import { createShow } from "@/app/actions/spexActions";

function NewShowContent() {
  const router = useRouter();
  const supabase = createClient();

  const [year, setYear] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEditor, setIsEditor] = useState(false);

  const searchParams = useSearchParams();
  const spexId = searchParams.get("spexId");

  const buttonDisabled = !year;

  const onClick = async () => {
    try {
      const formData = new FormData()
      formData.append('spexId', spexId)
      formData.append('year', year)

      const result = await createShow(formData)

      if (result.error) {
        console.error("Error creating show:", result.error);
        toast.error("Något gick fel. Försök igen senare.");
        return;
      }

      console.log(result.data);
      router.push(`/spex/${result.spexId}`);
    } catch (error) {
      console.error("Unexpected error during show creation:", error);
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
    if (!isLoading && (!isAuthenticated || !isEditor || !spexId)) {
      router.push("/");
    }
  }, [isLoading, isAuthenticated, router, isEditor, spexId]);

  if (isLoading) {
    return <div>Loading...</div>;
  } else if (!isAuthenticated || !isEditor) {
    return null;
  }

  return (
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
  );
}

export default function NewSpexPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewShowContent />
    </Suspense>
  );
}
