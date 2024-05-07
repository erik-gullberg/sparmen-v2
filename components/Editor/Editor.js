"use client";
import createClient from "@/utils/supabase/browserClient";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState } from "react";

async function updateSong(songId, lyrics) {
  const supabase = createClient();

  const { error } = await supabase
    .from("song")
    .update({ lyrics: lyrics })
    .eq("id", songId);

  if (error) {
    throw Error("Error updating song: " + error.message);
  }
}

const Editor = ({ songId, formattedLyrics }) => {
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
            updateSong(songId, editor.getHTML()).then((r) => {
              setShowButton(false);
            });
          }}
        >
          Spara
        </button>
      )}

      <EditorContent editor={editor} />
    </div>
  );
};

export default Editor;
