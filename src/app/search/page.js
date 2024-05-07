import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

async function fetchData(query) {
  const supabase = createClient();
  const user = supabase.auth.getUser();

  if (!user) {
    return { text: "Unauthenticated" };
  }

  // Replace spaces in the query with the & operator
  const formattedQuery = query.split(" ").join("<->");

  const [songs, spex] = await Promise.all([
    supabase
      .from("song")
      .select("name, id, show_id")
      .textSearch("search_text", formattedQuery),
    supabase.from("spex").select("name, id").textSearch("name", formattedQuery),
  ]);

  return { songs: [...songs.data], spex: [...spex.data] };
}

export default async function Page({ params, searchParams }) {
  const { q } = searchParams;
  const results = await fetchData(q);
  console.log(results);

  if (results.songs?.length === 1 && results.spex?.length === 0) {
    redirect(`/song/${results.songs[0].id}`);
  }

  if (results.spex?.length === 1 && results.songs?.length === 0) {
    redirect(`/spex/${results.spex[0].id}`);
  }

  return results.songs?.length === 0 && results.spex?.length === 0 ? (
    <div>Inget hittat på `{q}`</div>
  ) : (
    <div>
      <ul>
        {results.songs.map((song, i) => (
          <li key={i}>
            <Link href={`/song/${song.id}`}>{song.name}</Link>
          </li>
        ))}
      </ul>
      <br></br>
      <ul>
        {results.spex.map((song, i) => (
          <li key={i}>
            <Link href={`/song/${song.id}`}>{song.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
