import styles from "@/app/page.module.css";
import { createClient } from "@/utils/supabase/server";
import ShowAndSongSelector from "../../../../components/ShowAndSongSelector/ShowAndSongSelector";

async function fetchShows(query) {
  const supabase = createClient();
  const user = supabase.auth.getUser();

  if (!user) {
    return { text: "Unauthenticated" };
  }
  return supabase.from("show").select("*").eq("spex_id", query);
}

async function fetchSpexName(query) {
  const supabase = createClient();
  const user = supabase.auth.getUser();

  if (!user) {
    return { text: "Unauthenticated" };
  }
  return supabase.from("spex").select("name").eq("id", query);
}

export default async function Page({ params }) {
  const [spex, shows] = await Promise.all([
    fetchSpexName(params.id),
    fetchShows(params.id),
  ]);

  return (
    <div className={styles.flex}>
      <div className={styles.container}>
        <div className={styles.containerHeader}>
          <h3>{spex.data[0].name}</h3>
        </div>
        <ShowAndSongSelector shows={shows.data}></ShowAndSongSelector>
      </div>
    </div>
  );
}
