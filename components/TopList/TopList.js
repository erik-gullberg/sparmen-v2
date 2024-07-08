import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import style from "./page.module.css";

async function fetchData() {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("get_top_10_songs");

  if (error) {
    return [];
  }

  return data;
}

export default async function Page() {
  const data = await fetchData();
  return (
    <table className={style.table}>
      <thead className={style.thead}>
        <tr className={style.tr}>
          <th className={style.th} id={style.ratingHeader}>
            Rating
          </th>
          <th className={style.th}>Kuplett</th>
        </tr>
      </thead>
      <tbody className={style.tbody}>
        {data?.map((song, i) => (
          <tr className={style.tr} key={i}>
            <td className={style.td} id={style.points}>
              {i === 0 && "🥇 "}
              {i === 1 && "🥈 "}
              {i === 2 && "🥉 "}
              {song.vote_count}
            </td>
            <td className={style.td}>
              <Link href={`/song/${song.song_id}`}>{song.name}</Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
