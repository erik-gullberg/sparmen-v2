import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

async function fetchData(query) {
  const supabase = createClient();
  const user = supabase.auth.getUser();

  if (!user) {
    return { text: "Unauthenticated" };
  }

  // Replace spaces in the query with the & operator
  const formattedQuery = query.split(" ").join("<->");

  return supabase
    .from("song")
    .select("name, id, show_id")
    .textSearch("search_text", formattedQuery);
}

export default async function Page({ params, searchParams }) {
  const { q } = searchParams;
  const data = await fetchData(q);

  return data.data?.length === 0 ? (
    <div>Inget hittat på `{q}`</div>
  ) : (
    <ul>
      {data.data.map((song, i) => (
        <li key={i}>
          <Link href={`/song/${song.id}`}>{song.name}</Link>
        </li>
      ))}
    </ul>
  );
}
