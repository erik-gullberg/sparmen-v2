import { createClient } from "@/utils/supabase/server";
export default async function fetchUser() {
  const supabase = createClient();
  const user = await supabase.auth.getUser();
  const roles = await supabase
    .from("role")
    .select("is_editor")
    .eq("user_id", user.data.user.id)
    .single();

  return { ...user, roles: roles.data };
}
