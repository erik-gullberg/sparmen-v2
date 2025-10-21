"use client";
import { useState, useEffect } from "react";
import SongSelector from "../SongSelector/SongSelector";
import pageStyle from "@/app/(main-flow)/spex/[id]/page.module.css";
import Link from "next/link";
import createClient from "@/utils/supabase/browserClient";

export default function ShowAndSongSelector({
  shows,
  defaultShowId,
  spexId,
}) {
  const [selectedShowId, setSelectedShowId] = useState(
    parseInt(defaultShowId) || shows[shows.length - 1]?.id,
  );
  const [user, setUser] = useState({ roles: null });

  useEffect(() => {
    async function fetchUser() {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (authUser) {
        const { data: roles } = await supabase
          .from("role")
          .select("is_editor")
          .eq("user_id", authUser.id)
          .single();

        setUser({ ...authUser, roles });
      }
    }

    fetchUser();
  }, []);

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
        {user.roles?.is_editor && (
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
