"use client";
import style from "./page.module.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import createClient from "@/utils/supabase/browserClient";

export default function NewSpexPage() {
  const router = useRouter();
  const supabase = createClient();

  const [spexName, setSpexName] = useState("");
  const [showYear, setShowYear] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const buttonDisabled = !spexName || !showYear;

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.error("Error fetching user data:", error);
        }

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
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  } else if (!isAuthenticated) {
    return null;
  }

  return (
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

      <section className={style.section}>
        <h4>Uppsättning *</h4>
        <input
          className={style.input}
          type="text"
          placeholder="Terminsförkortning och årtal. ex. HT22"
          value={showYear}
          onChange={(e) => setShowYear(e.target.value)}
        />
      </section>

      <button
        className={buttonDisabled ? style.buttonDisabled : style.button}
        disabled={buttonDisabled}
      >
        Skapa
      </button>
    </div>
  );
}
