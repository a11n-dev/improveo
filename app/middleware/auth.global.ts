/**
 * Redirects authenticated users away from `/auth` and guests to `/auth`.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const supabase = useSupabaseClient();
  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims);

  if (isAuthenticated && to.path === "/auth") {
    return navigateTo("/", { replace: true });
  }

  if (!isAuthenticated && to.path !== "/auth") {
    return navigateTo("/auth", { replace: true });
  }
});
