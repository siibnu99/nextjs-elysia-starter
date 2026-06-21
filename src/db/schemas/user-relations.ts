import { relations } from "drizzle-orm";
import { user, session, account } from "./auth";
import { posts } from "./posts";
import { userAssignments } from "./assignment";

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  posts: many(posts),
  assignments: many(userAssignments),
}));
