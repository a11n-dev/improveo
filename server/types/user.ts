/**
 * This file contains types related to the "profiles" table in the database.
 */

export type ProfileRow = Pick<
  Tables<"profiles">,
  "id" | "username" | "avatar_path" | "timezone" | "created_at"
>;
