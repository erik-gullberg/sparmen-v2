"use client";
import createClient from "@/utils/supabase/browserClient";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState } from "react";
import toast from "react-hot-toast";
import styles from "./styles.css";

async function updateSong(songId, lyrics, originalLyrics, userId) {
  const supabase = createClient();

  const updatePromise = supabase
    .from("song")
    .update({ lyrics: lyrics })
    .eq("id", songId);

  const insertPromise = supabase.from("changelog").insert({
    song_id: songId,
    original_content: originalLyrics,
    updated_content: lyrics,
    user_id: userId,
  });

  const [updateResult, insertResult] = await Promise.all([
    updatePromise,
    insertPromise,
  ]);

  if (updateResult.error || insertResult.error) {
    throw Error("Error updating song");
  }
}

const Editor = ({ songId, formattedLyrics, userId }) => {
  const [showButton, setShowButton] = useState(false);
  const editor = useEditor({
    extensions: [StarterKit],
    content: formattedLyrics,
    onUpdate() {
      setShowButton(true);
    },
  });

  return (
    <div>
      {showButton && (
        <button
          onClick={() => {
            updateSong(songId, editor.getHTML(), formattedLyrics, userId).then(
              (r) => {
                toast.success("Sparat!");
                setShowButton(false);
              },
            );
          }}
        >
          Spara
        </button>
      )}

      <EditorContent className={styles.editor} editor={editor} />
    </div>
  );
};

export default Editor;
