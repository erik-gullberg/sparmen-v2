"use client";
import pageStyle from "@/app/spex/[id]/page.module.css";
import createClient from "@/utils/supabase/browserClient";
import { useState, useEffect } from "react";
import Editor from "../Editor/Editor";
import StatusBar from "../StatusBar/StatusBar"; // Importera StatusBar
import toast from "react-hot-toast";

export default function SongContent({ song, user, songNr }) {
  const supabase = createClient();
  const [showWarning, setShowWarning] = useState(song.show_warning);
  const formattedLyrics = song.lyrics.replace(/\n/g, "<br>");
  const [isOpen, setIsOpen] = useState(false);

  const openDropdown = (id) => {
    if (song.id === id) {
      setIsOpen(true);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("id")) {
      openDropdown(urlParams.get("id"));
    }
  }, []);

  return (
    <details className={pageStyle.dropDown} open={isOpen}>
      <summary>
        {songNr + "."} {song.name}
      </summary>

      {!showWarning && (
        <StatusBar
          song={song}
          user={user}
          showWarning={showWarning}
          setShowWarning={setShowWarning}
        />
      )}

      {user.roles?.is_editor && (
        <div className={pageStyle.statusBar}>
          <div>
            <input
              checked={showWarning}
              className={pageStyle.triggerCheck}
              id="trigger"
              type="checkbox"
              onClick={() => setShowWarning(!showWarning)}
            />
            <label htmlFor={"trigger"}>Olämplig för sittning</label>
          </div>
        </div>
      )}

      <div>
        {showWarning && (
          <div className={pageStyle.warningBar}>
            ⚠️ Denna låt är olämplig för sittning ⚠️
          </div>
        )}
      </div>
      {user.roles?.is_editor ? (
        <Editor
          songId={song.id}
          formattedLyrics={formattedLyrics}
          userId={user.user.id}
          className={
            showWarning ? pageStyle.warningSongText : pageStyle.songText
          }
        />
      ) : (
        <div
          className={
            showWarning ? pageStyle.warningSongText : pageStyle.songText
          }
          dangerouslySetInnerHTML={{
            __html: formattedLyrics,
          }}
        />
      )}
    </details>
  );
}