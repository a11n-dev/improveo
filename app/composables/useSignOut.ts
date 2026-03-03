/**
 * Provides a shared sign-out action used across profile surfaces.
 */
export const useSignOut = () => {
  const supabaseClient = useSupabaseClient();
  const { notifyMessage } = useNotify();

  /**
   * Signs the current user out and navigates to the auth page.
   */
  const signOut = async (): Promise<boolean> => {
    const { error } = await supabaseClient.auth.signOut({ scope: "global" });

    if (error) {
      notifyMessage({ scope: "auth", code: "logout_failed" });
      return false;
    }

    await navigateTo("/auth", { replace: true });
    return true;
  };

  return {
    signOut,
  };
};
