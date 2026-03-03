/**
 * This file contains types related to the "profiles" table in the database.
 */

import type { Tables } from "~~/shared/types/database.types";

/** Server row projection for `public.profiles`. */
export type ProfileRow = Pick<
  Tables<"profiles">,
  "id" | "username" | "avatar_path" | "timezone" | "created_at"
>;
