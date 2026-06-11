import styles from "@/app/page.module.css";
import { createBuildClient } from "@/utils/supabase/buildClient";
import ShowAndSongSelector from "../../../../components/ShowAndSongSelector/ShowAndSongSelector";
import WakeLock from "@/components/WakeLock/WakeLock";
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

// Fetch every song for this spex's shows in a single query and group them by
// show. Baked into the static page at build time so browsing shows/songs never
// triggers a per-visitor query against Supabase.
async function fetchSongsByShow(client, showIds) {
  if (!showIds.length) return {};

  const { data } = await client
    .from("song")
    .select("id, name, lyrics, show_warning, number, melody, melody_link, show_id")
    .in("show_id", showIds)
    .order("id", { ascending: true });

  const byShow = {};
  for (const song of data ?? []) {
    (byShow[song.show_id] ??= []).push(song);
  }
  return byShow;
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
  const supabase = createBuildClient();
  const [spex, shows] = await Promise.all([
    fetchSpexName(supabase, params.id),
    fetchShows(supabase, params.id),
  ]);

  if (spex.data?.length === 0) {
    notFound();
  }

  const showIds = (shows.data ?? []).map((show) => show.id);
  const songsByShow = await fetchSongsByShow(supabase, showIds);

  return (
    <div className={styles.flex}>
      <WakeLock />
      <div className={styles.container}>
        <div className={styles.containerHeader}>
          <h3>
            {params.id}. {spex.data ? spex.data[0].name : ""}
          </h3>
        </div>
        <ShowAndSongSelector
          shows={shows.data ?? []}
          songsByShow={songsByShow}
          defaultShowId={searchParams.show}
          spexId={params.id}
        ></ShowAndSongSelector>
      </div>
    </div>
  );
}
