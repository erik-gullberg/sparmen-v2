"use client";
import { useState } from "react";
import SongSelector from "../SongSelector/SongSelector";
import pageStyle from "@/app/(main-flow)/spex/[id]/page.module.css";
import Link from "next/link";

export default function ShowAndSongSelector({
  shows,
  user,
  defaultShowId,
  spexId,
}) {
  const [selectedShowId, setSelectedShowId] = useState(
    parseInt(defaultShowId) || shows[shows.length - 1]?.id,
  );

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
        {user?.user && user?.roles?.is_editor && (
          <button className={pageStyle.tab}>
            <Link href={"/newShow?spexId=" + spexId}>Ny uppsättning +</Link>
          </button>
        )}
      </div>

      <SongSelector
        showId={selectedShowId}
        user={user}
        spexId={spexId}
      ></SongSelector>
    </div>
  );
}
