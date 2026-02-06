import { afterEach, vi } from "vitest";

import { getClaimsMock } from "./utils/supabase-auth-mock";

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();

  getClaimsMock.mockReset();
  getClaimsMock.mockResolvedValue({ data: { claims: null } });
});
