import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import style from "./page.module.css";
import Image from "next/image";
import fetchUser from "@/utils/fetchUserAndRoles";
import { Suspense } from "react";
import NewPlaylistForm from "./NewPlaylistForm";

async function getVotedSongs(supabase, userId) {
  const { data, error } = await supabase.rpc("get_voted_songs", {
    user_id: userId,
  });

  if (error) {
    console.error("Error fetching voted songs:", error);
    return [];
  }

  return data;
}

async function getUserPlaylists(supabase, userId) {
  const { data, error } = await supabase
    .from("playlist")
    .select("id, name, created_at, playlist_song(count)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching playlists:", error);
    return [];
  }

  return data || [];
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const userData = await fetchUser(supabase);

  if (userData.user === null) {
    redirect("/");
  }

  const votedSongs = await getVotedSongs(supabase, userData.user.id);
  const playlists = await getUserPlaylists(supabase, userData.user.id);

  return (
    <Suspense fallback={<div>Laddar profil...</div>}>
      <div className={style.profileHeader}>
        <Image
          src={userData.user.user_metadata.picture}
          alt={"User avatar"}
          width={100}
          height={100}
          sizes="(max-width: 768px) 50vw, 100px"
        />
        <h1>{userData.user.user_metadata.name}</h1>
        <p>Användare sedan: {userData.user.created_at.split("T")[0]}</p>

        {userData.roles?.is_editor && (
          <div className={style.roleBadge}>
            <p>Regissör</p>
            <div className={style.tooltip}>Kan redigera låtar</div>
          </div>
        )}
      </div>
      {userData.roles?.is_editor && (
        <>
          <hr className={style.solidLine} />
          <h4>Adminkontroller</h4>
          <br />
          <Link href={"/newSpex"}>
            <button className={style.addButton}>Skapa nytt spex +</button>
          </Link>
        </>
      )}
      <hr className={style.solidLine} />
      <div>
        <h2>Dina Spellistor</h2>
        <ul className={style.favouritesList}>
          {playlists.length === 0 && (
            <p style={{ color: "#aaa", marginTop: "0.5rem" }}>
              Du har inga spellistor ännu.
            </p>
          )}
          {playlists.map((pl) => (
            <Link key={pl.id} href={`/playlist/${pl.id}`}>
              <li className={style.song}>
                <span>{pl.name + " "}</span>
                <span
                  style={{
                    marginLeft: "auto",
                    color: "#aaa",
                    fontSize: "0.85rem",
                  }}
                >
                  {pl.playlist_song?.[0]?.count ?? 0} låtar
                </span>
              </li>
            </Link>
          ))}
        </ul>
      </div>
      <hr className={style.solidLine} />
      <div>
        <h2>Dina Favoriter</h2>
        <ul className={style.favouritesList}>
          {votedSongs.map((song) => (
            <Link key={song.id} href={`/song/${song.id}`}>
              <li className={style.song} key={song.id}>
                {song.name}
              </li>
            </Link>
          ))}
        </ul>
      </div>
    </Suspense>
  );
}
