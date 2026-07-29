import "server-only";
import { createSupabaseServerClient } from "./supabase/server";
import { supabaseAdmin } from "./supabase/admin";

export async function getSessionUser() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("is_admin, display_name")
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw new Error("Role check failed");
  if (!data?.is_admin) throw new Error("Forbidden: admin only");

  return {
    user,
    displayName: data.display_name ?? user.email ?? "Admin",
  };
}

export async function checkIsAdmin(userId: string): Promise<boolean> {
  const { data } = await supabaseAdmin.from("profiles").select("is_admin").eq("id", userId).maybeSingle();
  return !!data?.is_admin;
}
