import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";

import authGlobalMiddleware from "../../../../app/middleware/auth.global";
import { getClaimsMock } from "../../utils/supabase-auth-mock";

const { navigateToMock } = vi.hoisted(() => ({
  navigateToMock: vi.fn((to: string, options: { replace: boolean }) => ({
    options,
    to,
  })),
}));

mockNuxtImport("navigateTo", () => navigateToMock);

describe("auth.global middleware", () => {
  beforeEach(() => {
    navigateToMock.mockClear();
  });

  it("redirects authenticated users away from /auth", async () => {
    getClaimsMock.mockResolvedValueOnce({
      data: {
        claims: { sub: "user-1" },
      },
    });

    const result = await authGlobalMiddleware(
      { path: "/auth" } as never,
      { path: "/" } as never,
    );

    expect(navigateToMock).toHaveBeenCalledWith("/", { replace: true });
    expect(result).toEqual({
      options: { replace: true },
      to: "/",
    });
  });

  it("redirects unauthenticated users from protected routes", async () => {
    getClaimsMock.mockResolvedValueOnce({
      data: {
        claims: null,
      },
    });

    const result = await authGlobalMiddleware(
      { path: "/profile" } as never,
      { path: "/auth" } as never,
    );

    expect(navigateToMock).toHaveBeenCalledWith("/auth", { replace: true });
    expect(result).toEqual({
      options: { replace: true },
      to: "/auth",
    });
  });

  it("allows unauthenticated users on /auth", async () => {
    getClaimsMock.mockResolvedValueOnce({
      data: {
        claims: null,
      },
    });

    const result = await authGlobalMiddleware(
      { path: "/auth" } as never,
      { path: "/" } as never,
    );

    expect(navigateToMock).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });

  it("allows authenticated users on protected routes", async () => {
    getClaimsMock.mockResolvedValueOnce({
      data: {
        claims: { sub: "user-2" },
      },
    });

    const result = await authGlobalMiddleware(
      { path: "/" } as never,
      { path: "/auth" } as never,
    );

    expect(navigateToMock).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });
});
