"use client";
import { useEffect, useState } from "react";
import pageStyle from "@/app/spex/[id]/page.module.css";
import createClient from "@/utils/supabase/browserClient";

const songCache = {};

export default function SongSelector({ showId }) {
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSongs() {
      if (songCache[showId]) {
        setSongs(songCache[showId]);
        return;
      }
      setIsLoading(true);

      const supabase = createClient();
      const response = await supabase
        .from("song")
        .select("name, lyrics")
        .eq("show_id", showId);

      // Store the fetched songs in the cache
      songCache[showId] = response.data;

      setSongs(response.data);
    }

    loadSongs().then(() => setIsLoading(false));
  }, [showId]);

  return (
    <div className={pageStyle.songContainer}>
      {isLoading && <p>Loading songs...</p>}

      {!isLoading &&
        songs?.map((song, index) => (
          <details className={pageStyle.dropDown} key={index}>
            <summary>{song.name}</summary>
            <div
              className={pageStyle.songText}
              dangerouslySetInnerHTML={{
                __html: song.lyrics.replace(/\n/g, "<br>"),
              }}
            />
          </details>
        ))}
    </div>
  );
}
