"use client";
import style from "./page.module.css";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { createShow } from "@/app/actions/spexActions";
import useEditorGuard from "@/utils/useEditorGuard";

function NewShowContent() {
  const router = useRouter();

  const [year, setYear] = useState("");

  const searchParams = useSearchParams();
  const spexId = searchParams.get("spexId");

  const { isLoading, isAuthenticated, isEditor } = useEditorGuard(!!spexId);

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

  if (isLoading) {
    return <div>Loading...</div>;
  } else if (!isAuthenticated || !isEditor) {
    return null;
  }

  return (
    <div className={style.container}>
      <h2>Skapa ny uppsättning</h2>

      <section className={style.section}>
        <label className={style.label} htmlFor="show-term">
          Termin *
        </label>
        <input
          id="show-term"
          className={style.input}
          type="text"
          placeholder="Termin ex. HT22"
          autoComplete="off"
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
      <NewShowContent />
    </Suspense>
  );
}
