import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { vi } from "vitest";

type ClaimsResult = {
  data: {
    claims: Record<string, unknown> | null;
  };
};

const { getClaimsMock } = vi.hoisted(() => ({
  getClaimsMock: vi.fn<() => Promise<ClaimsResult>>(async () => ({
    data: { claims: null },
  })),
}));

mockNuxtImport("useSupabaseClient", () => {
  return () => ({
    auth: {
      getClaims: getClaimsMock,
    },
  });
});

export { getClaimsMock };
