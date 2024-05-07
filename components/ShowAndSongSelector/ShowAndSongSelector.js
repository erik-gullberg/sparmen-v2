"use client";
import { useState } from "react";
import SongSelector from "../SongSelector/SongSelector";
import pageStyle from "@/app/spex/[id]/page.module.css";

export default function ShowAndSongSelector({ shows, user }) {
  const lastShowId = shows[shows.length - 1].id;
  const [selectedShowId, setSelectedShowId] = useState(lastShowId);

  return (
    <div>
      <div className={pageStyle.tabContainer}>
        {shows.map((show, i) => (
          <button
            className={`${pageStyle.tab} ${show.id === selectedShowId ? pageStyle.selected : ""}`}
            key={i}
            onClick={() => setSelectedShowId(show.id)}
          >
            {show.year}
          </button>
        ))}
      </div>
      <SongSelector showId={selectedShowId} user={user}></SongSelector>
    </div>
  );
}
