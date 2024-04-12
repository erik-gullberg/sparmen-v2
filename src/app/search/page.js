import { createClient } from "@/utils/supabase/server";

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
    .select("*")
    .textSearch("search_text", formattedQuery);
}

export default async function Page({ params, searchParams }) {
  const { q } = searchParams;
  const data = await fetchData(q);

  return <pre>{JSON.stringify(data.data, null, 2)}</pre>;
}
