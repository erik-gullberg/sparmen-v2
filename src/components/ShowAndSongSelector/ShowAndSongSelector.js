"use client";
import { useState, useEffect } from "react";
import SongSelector from "../SongSelector/SongSelector";
import pageStyle from "@/app/(main-flow)/spex/[id]/page.module.css";
import Link from "next/link";
import createClient from "@/utils/supabase/browserClient";
import { useAuth } from "@/context/AuthContext";

export default function ShowAndSongSelector({
  shows,
  songsByShow,
  defaultShowId,
  spexId,
}) {
  const { user: authUser } = useAuth();
  const [roles, setRoles] = useState(null);
  const [selectedShowId, setSelectedShowId] = useState(
    parseInt(defaultShowId) || shows[shows.length - 1]?.id,
  );

  // Only hit the network for the editor role when someone is actually logged
  // in. Anonymous visitors (the bulk of event traffic) skip it entirely.
  useEffect(() => {
    if (!authUser) {
      setRoles(null);
      return;
    }

    const supabase = createClient();
    supabase
      .from("role")
      .select("is_editor")
      .eq("user_id", authUser.id)
      .single()
      .then(({ data }) => setRoles(data));
  }, [authUser]);

  const user = { user: authUser, roles };

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
        {roles?.is_editor && (
          <button className={pageStyle.tab}>
            <Link href={"/newShow?spexId=" + spexId}>Ny uppsättning +</Link>
          </button>
        )}
      </div>

      <SongSelector
        songs={songsByShow[selectedShowId] ?? []}
        showId={selectedShowId}
        user={user}
        spexId={spexId}
      ></SongSelector>
    </div>
  );
}
