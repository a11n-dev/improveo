export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser();

  if (user.value && to.path === "/auth")
    return navigateTo("/", { replace: true });
});
