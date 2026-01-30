export default defineNuxtRouteMiddleware(async (to) => {
  const supabase = useSupabaseClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims && to.path === "/auth")
    return navigateTo("/", { replace: true });
});
