/**
 * Provides a shared sign-out action used across profile surfaces.
 *
 * @returns A signOut action that returns true on success.
 */
export const useSignOut = () => {
  const supabaseClient = useSupabaseClient();
  const { notifyMessage } = useNotify();

  /**
   * Signs the current user out and navigates to the auth page.
   *
   * @returns True when sign-out and redirect succeed.
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
