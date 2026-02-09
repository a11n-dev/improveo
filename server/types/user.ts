/**
 * This file contains types related to the "profiles" table in the database.
 */

export type ProfileSelectRow = Pick<
  Tables<"profiles">,
  "id" | "email" | "name" | "avatar_path" | "timezone" | "created_at"
>;
