"use client";
import { useState } from "react";
import { createPlaylist } from "@/app/actions/playlistActions";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import style from "./page.module.css";

export default function NewPlaylistForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    const formData = new FormData();
    formData.set("name", name.trim());
    const result = await createPlaylist(formData);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Spellistan "${result.data.name}" skapad!`);
      setName("");
      setOpen(false);
      router.refresh();
    }
  };

  if (!open) {
    return (
      <button className={style.addButton} onClick={() => setOpen(true)}>
        Skapa ny spellista +
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={style.newPlaylistForm}>
      <input
        className={style.newPlaylistInput}
        type="text"
        placeholder="Namn på spellistan"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={80}
        required
        autoFocus
      />
      <div className={style.newPlaylistButtons}>
        <button type="submit" className={style.addButton} disabled={loading}>
          {loading ? "Skapar..." : "Skapa"}
        </button>
        <button
          type="button"
          className={style.cancelPlaylistButton}
          onClick={() => {
            setOpen(false);
            setName("");
          }}
        >
          Avbryt
        </button>
      </div>
    </form>
  );
}

