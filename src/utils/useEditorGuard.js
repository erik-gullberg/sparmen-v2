"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import createClient from "@/utils/supabase/browserClient";

/**
 * Client-side guard for editor-only pages.
 *
 * Fetches the current user and their `is_editor` role, and redirects to "/"
 * when the visitor is not an authenticated editor (or when `paramValid` is
 * false, e.g. a required query/route param is missing).
 *
 * @param {boolean} [paramValid=true] - Extra precondition that must hold for
 *   the page to render (e.g. `!!spexId`). When false, the user is redirected.
 * @returns {{ isLoading: boolean, isAuthenticated: boolean, isEditor: boolean, userId: string|null }}
 */
export default function useEditorGuard(paramValid = true) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEditor, setIsEditor] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const supabase = createClient();

    const checkUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.error("Error fetching user data:", error);
        }

        if (data?.user) {
          const roles = await supabase
            .from("role")
            .select("is_editor")
            .eq("user_id", data.user.id)
            .single();

          setIsEditor(roles.data?.is_editor ?? false);
          setIsAuthenticated(Boolean(data.user));
          setUserId(data.user.id);
        }
      } catch (error) {
        console.error("Unexpected error during authentication check:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, []);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isEditor || !paramValid)) {
      router.push("/");
    }
  }, [isLoading, isAuthenticated, isEditor, paramValid, router]);

  return { isLoading, isAuthenticated, isEditor, userId };
}
