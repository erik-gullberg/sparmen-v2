import { cache } from "react";

// The public repo that backs the changelog. Overridable via env for forks.
const OWNER = process.env.NEXT_PUBLIC_GITHUB_OWNER || "erik-gullberg";
const REPO = process.env.NEXT_PUBLIC_GITHUB_REPO || "sparmen-v2";

export const repoUrl = `https://github.com/${OWNER}/${REPO}`;

/**
 * Fetches recent commits from the GitHub REST API.
 *
 * Runs server-side and is cached two ways: React `cache()` dedupes calls within
 * a single request, and Next's Data Cache (`next.revalidate`) means GitHub is
 * actually hit at most once per hour regardless of traffic — so this stays fast
 * and won't blow the unauthenticated rate limit under load.
 *
 * Merge commits are filtered out and only the first line of each message is
 * kept. Returns `[]` on any failure so callers can render gracefully.
 *
 * @param {number} [limit=30]
 * @returns {Promise<Array<{sha:string, shortSha:string, message:string, body:string, date:string, author:string, url:string}>>}
 */
export const getCommits = cache(async (limit = 30) => {
  try {
    const headers = {
      Accept: "application/vnd.github+json",
      "User-Agent": "sparmen-app",
    };
    // Optional: raises the rate limit / allows private repos if provided.
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const res = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/commits?per_page=${limit}`,
      { headers, next: { revalidate: 3600 } },
    );

    if (!res.ok) return [];

    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data
      .filter((c) => !c.commit?.message?.startsWith("Merge "))
      .map((c) => {
        const lines = (c.commit?.message ?? "").split("\n");
        return {
          sha: c.sha,
          shortSha: c.sha.slice(0, 7),
          message: lines[0] || "Uppdatering",
          body: lines.slice(1).join("\n").trim(),
          date: c.commit?.author?.date ?? c.commit?.committer?.date ?? null,
          author: c.commit?.author?.name ?? null,
          url: c.html_url,
        };
      });
  } catch {
    return [];
  }
});

const dateFormatter = new Intl.DateTimeFormat("sv-SE", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

/** Formats an ISO date as a Swedish long date, e.g. "9 augusti 2026". */
export function formatDate(iso) {
  if (!iso) return "";
  return dateFormatter.format(new Date(iso));
}
