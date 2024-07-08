import { createClient } from "@/utils/supabase/server";
export default async function fetchUser(supabase) {
  supabase = createClient();

  const user = await supabase.auth.getUser();

  if (user.data.user) {
    const roles = await supabase
      .from("role")
      .select("is_editor")
      .eq("user_id", user.data.user.id)
      .single();

    return { ...user.data, roles: roles.data };
  } else {
    return { ...user.data };
  }
}
