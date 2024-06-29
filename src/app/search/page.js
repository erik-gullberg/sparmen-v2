import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

function noSongsInResults(results) {
  return results.songs?.length === 0;
}

function noSpexInResults(results) {
  return results.spex?.length === 0;
}

async function fetchData(query) {
  const supabase = createClient();

  const [songs, spex] = await Promise.all([
    supabase
      .from("song")
      .select("name, id, show_id")
      .or(`name.ilike.%${query}%, lyrics.ilike.%${query}%`)
      .order("name", { ascending: false }), // Order by name (ascending) first

    supabase.from("spex").select("name, id").ilike("name", `%${query}%`),
  ]);

  return { songs: [...songs.data], spex: [...spex.data] };
}

export default async function Page({ params, searchParams }) {
  const { q } = searchParams;
  const results = await fetchData(q);

  if (results.songs?.length === 1 && noSpexInResults(results)) {
    redirect(`/song/${results.songs[0].id}`);
  }

  if (results.spex?.length === 1 && noSongsInResults(results)) {
    redirect(`/spex/${results.spex[0].id}`);
  }

  return noSongsInResults(results) && noSpexInResults(results) ? (
    <div>
      <p>Inget hittat på `{q}`</p>
      <br />
      <p>Kolla så du stavat rätt.</p>
      <br />
      <p>Du kan söka på</p>
      <ul>
        <li>Låtnamn</li>
        <li>Låttext</li>
        <li>Orginallåt</li>
        <li>Spexnamn</li>
      </ul>
    </div>
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
        {results.spex.map((spex, i) => (
          <li key={i}>
            <Link href={`/spex/${spex.id}`}>{spex.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
