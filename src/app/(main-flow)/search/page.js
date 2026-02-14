import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import styles from "./search.module.css";

function noSongsInResults(results) {
  return results.songs?.length === 0;
}

function noSpexInResults(results) {
  return results.spex?.length === 0;
}

async function fetchData(query, supabase) {
  // Fetch name matches and lyrics matches separately to prioritize name matches
  let [nameMatches, lyricsMatches, spex] = await Promise.all([
    // Songs where the name contains the query (highest priority)
    supabase
      .from("song")
      .select(
        `
        name,
        id,
        show_id,
        show (
          year_short,
          year,
          spex_id,
          spex (
            name
          )
        )
      `,
      )
      .ilike("name", `%${query}%`)
      .order("name", { ascending: true }),
    // Songs where the lyrics contain the query but name doesn't
    supabase
      .from("song")
      .select(
        `
        name,
        id,
        show_id,
        show (
          year_short,
          year,
          spex_id,
          spex (
            name
          )
        )
      `,
      )
      .ilike("lyrics", `%${query}%`)
      .not("name", "ilike", `%${query}%`)
      .order("name", { ascending: true }),
    supabase.from("spex").select("name, id").ilike("name", `%${query}%`),
  ]);

  // Combine results: name matches first, then lyrics matches
  const songs = [...(nameMatches.data || []), ...(lyricsMatches.data || [])];

  return { songs, spex: spex.data };
}

export default async function Page(props) {
  const searchParams = await props.searchParams;
  const { q } = searchParams;
  const supabase = await createClient();

  const results = await fetchData(q, supabase);

  if (results.songs.length === 1 && noSpexInResults(results)) {
    redirect(`/song/${results.songs[0].id}`);
  }

  if (results.spex.length === 1 && noSongsInResults(results)) {
    redirect(`/spex/${results.spex[0].id}`);
  }

  const totalResults =
    (results.songs?.length || 0) + (results.spex?.length || 0);

  return (
    <div className={styles.searchResultsContainer}>
      {noSongsInResults(results) && noSpexInResults(results) ? (
        <div className={styles.noResults}>
          <p className={styles.noResultsTitle}>
            Inget hittat på &ldquo;
            <span className={styles.searchQuery}>{q}</span>&rdquo;
          </p>
          <p>Kolla så du stavat rätt.</p>
          <div className={styles.suggestions}>
            <h4>Du kan söka på:</h4>
            <ul>
              <li>Låtnamn</li>
              <li>Låtnummer (ex. 38.5)</li>
              <li>Låttext</li>
              <li>Originallåt</li>
              <li>Spexnamn</li>
            </ul>
          </div>
          <Link href="/" className={styles.backLink}>
            ← Tillbaka till startsidan
          </Link>
        </div>
      ) : (
        <>
          <div className={styles.searchHeader}>
            <span>Sökresultat för</span>
            <span className={styles.searchQuery}>&#39;{q}&#39;</span>
            <span className={styles.resultCount}>
              {totalResults} {totalResults === 1 ? "träff" : "träffar"}
            </span>
          </div>

          {results.songs.length > 0 && (
            <>
              <div className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>🎵</span>
                <h3>Sånger ({results.songs.length})</h3>
              </div>
              <ul className={styles.resultsList}>
                {results.songs.map((song) => (
                  <li key={song.id} className={styles.resultItem}>
                    <Link
                      href={`/song/${song.id}`}
                      className={styles.songResult}
                    >
                      <div className={styles.songName}>{song.name}</div>
                      <div className={styles.songMeta}>
                        {song.show.spex.name} - {song.show.year_short}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}

          {results.spex.length > 0 && (
            <>
              <div className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>🎭</span>
                <h3>Spex ({results.spex.length})</h3>
              </div>
              <ul className={styles.resultsList}>
                {results.spex.map((spex) => (
                  <li key={spex.id} className={styles.resultItem}>
                    <Link
                      href={`/spex/${spex.id}`}
                      className={styles.spexResult}
                    >
                      {spex.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}
