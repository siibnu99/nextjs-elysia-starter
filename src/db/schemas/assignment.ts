import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { roles } from "./role";
import { scopes, scopeItems } from "./scope";
import { user } from "./auth";

export const assignments = pgTable(
  "assignments",
  {
    // ***Identity
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),

    // *** Fields
    roleId: text("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    scopeId: text("scope_id").references(() => scopes.id, { onDelete: "cascade" }),
    scopeMode: text("scope_mode").notNull().default("single"),
    name: text("name").notNull(),

    // *** Audit
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("assignments_roleId_idx").on(table.roleId),
    index("assignments_scopeId_idx").on(table.scopeId),
  ],
);

export const assignmentScopeItems = pgTable(
  "assignment_scope_items",
  {
    // ***Identity
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),

    // *** Fields
    assignmentId: text("assignment_id")
      .notNull()
      .references(() => assignments.id, { onDelete: "cascade" }),
    scopeItemId: text("scope_item_id")
      .notNull()
      .references(() => scopeItems.id, { onDelete: "cascade" }),

    // *** Audit
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("assignmentScopeItems_assignmentId_idx").on(table.assignmentId),
    index("assignmentScopeItems_scopeItemId_idx").on(table.scopeItemId),
  ],
);

export const userAssignments = pgTable(
  "user_assignments",
  {
    // ***Identity
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),

    // *** Fields
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    assignmentId: text("assignment_id")
      .notNull()
      .references(() => assignments.id, { onDelete: "cascade" }),

    // *** Audit
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("userAssignments_userId_idx").on(table.userId),
    index("userAssignments_assignmentId_idx").on(table.assignmentId),
  ],
);

export const assignmentsRelations = relations(assignments, ({ one, many }) => ({
  role: one(roles, {
    fields: [assignments.roleId],
    references: [roles.id],
  }),
  scope: one(scopes, {
    fields: [assignments.scopeId],
    references: [scopes.id],
  }),
  scopeItems: many(assignmentScopeItems),
  users: many(userAssignments),
}));

export const assignmentScopeItemsRelations = relations(assignmentScopeItems, ({ one }) => ({
  assignment: one(assignments, {
    fields: [assignmentScopeItems.assignmentId],
    references: [assignments.id],
  }),
  scopeItem: one(scopeItems, {
    fields: [assignmentScopeItems.scopeItemId],
    references: [scopeItems.id],
  }),
}));

export const userAssignmentsRelations = relations(userAssignments, ({ one }) => ({
  user: one(user, {
    fields: [userAssignments.userId],
    references: [user.id],
  }),
  assignment: one(assignments, {
    fields: [userAssignments.assignmentId],
    references: [assignments.id],
  }),
}));
