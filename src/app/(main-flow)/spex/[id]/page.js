import styles from "@/app/page.module.css";
import { createClient } from "@/utils/supabase/server";
import { createBuildClient } from "@/utils/supabase/buildClient";
import ShowAndSongSelector from "../../../../components/ShowAndSongSelector/ShowAndSongSelector";
import { notFound } from "next/navigation";

// Revalidate every hour
export const revalidate = 3600;
// Use static rendering for better performance
export const dynamic = "force-static";

async function fetchShows(client, query) {
  return client
    .from("show")
    .select("*")
    .eq("spex_id", query)
    .order("id", { ascending: true });
}

async function fetchSpexName(client, query) {
  return client.from("spex").select("name").eq("id", query);
}

// Pre-render all spex pages at build time
export async function generateStaticParams() {
  const client = createBuildClient();

  const { data } = await client.from("spex").select("id");

  if (!data) return [];

  return data.map((spex) => ({
    id: spex.id.toString(),
  }));
}

export default async function Page(props) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const supabase = await createClient();
  const [spex, shows] = await Promise.all([
    fetchSpexName(supabase, params.id),
    fetchShows(supabase, params.id),
  ]);

  if (spex.data?.length === 0) {
    notFound();
  }

  return (
    <div className={styles.flex}>
      <div className={styles.container}>
        <div className={styles.containerHeader}>
          <h3>
            {params.id}. {spex.data ? spex.data[0].name : ""}
          </h3>
        </div>
        <ShowAndSongSelector
          shows={shows.data ?? []}
          defaultShowId={searchParams.show}
          spexId={params.id}
        ></ShowAndSongSelector>
      </div>
    </div>
  );
}
