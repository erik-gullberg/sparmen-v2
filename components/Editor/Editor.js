"use client";
import createClient from "@/utils/supabase/browserClient";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState } from "react";
import toast from "react-hot-toast";
import styles from "@/app/page.module.css";

function rewriteEncodedAnchors(inputString) {
  const regex = /&lt;a (.*?)&gt;(.*?)&lt;\/a&gt;/g;

  function replaceEncodedTag(match, attributes, content) {
    const decodedAttributes = attributes.replace(/&quot;/g, '"');

    const parser = new DOMParser();
    const doc = parser.parseFromString(
      `<a ${decodedAttributes}>${content}</a>`,
      "text/html",
    );

    const linkElement = doc.body.firstChild;

    if (linkElement.href && !linkElement.href.startsWith("http")) {
      return match;
    }

    return linkElement.outerHTML;
  }

  const resultString = inputString.replace(regex, replaceEncodedTag);
  return resultString;
}

async function updateSong(songId, lyrics, originalLyrics, userId) {
  const supabase = createClient();

  const rewrittenLyrics = rewriteEncodedAnchors(lyrics);

  const updatePromise = supabase
    .from("song")
    .update({ lyrics: rewrittenLyrics })
    .eq("id", songId);

  const insertPromise = supabase.from("changelog").insert({
    song_id: songId,
    original_content: originalLyrics,
    updated_content: rewrittenLyrics,
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
          className={styles.saveButton}
        >
          Spara
        </button>
      )}

      <EditorContent className={styles.editor} editor={editor} />
    </div>
  );
};

export default Editor;
