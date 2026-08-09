"use client";
import style from "./page.module.css";
import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createSpex } from "@/app/actions/spexActions";
import useEditorGuard from "@/utils/useEditorGuard";

function NewSpexContent() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");

  const { isLoading, isAuthenticated, isEditor } = useEditorGuard();

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

  if (isLoading) {
    return <div>Loading...</div>;
  } else if (!isAuthenticated || !isEditor) {
    return null;
  }

  return (
    <div className={style.container}>
      <h2>Skapa nytt spex</h2>

      <section className={style.section}>
        <label className={style.label} htmlFor="spex-title">
          Titel *
        </label>
        <input
          id="spex-title"
          className={style.input}
          type="text"
          placeholder="Titel på spexet"
          autoComplete="off"
          enterKeyHint="next"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </section>

      <section className={style.section}>
        <label className={style.label} htmlFor="spex-year">
          Årtal *
        </label>
        <input
          id="spex-year"
          className={style.input}
          type="number"
          inputMode="numeric"
          placeholder="Året spexet sattes upp"
          enterKeyHint="done"
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
