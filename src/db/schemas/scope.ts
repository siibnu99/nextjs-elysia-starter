import { relations } from "drizzle-orm";
import { index, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

export const scopes = pgTable("scopes", {
  // ***Identity
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),

  // *** Fields
  name: text("name").notNull().unique(),
  description: text("description"),

  // *** Audit
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const scopeItems = pgTable(
  "scope_items",
  {
    // ***Identity
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),

    // *** Fields
    scopeId: text("scope_id")
      .notNull()
      .references(() => scopes.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    parentId: text("parent_id"),
    metadata: jsonb("metadata"),

    // *** Audit
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("scopeItems_scopeId_idx").on(table.scopeId),
    index("scopeItems_parentId_idx").on(table.parentId),
  ],
);

export const scopesRelations = relations(scopes, ({ many }) => ({
  items: many(scopeItems),
}));

export const scopeItemsRelations = relations(scopeItems, ({ one, many }) => ({
  scope: one(scopes, {
    fields: [scopeItems.scopeId],
    references: [scopes.id],
  }),
  parent: one(scopeItems, {
    fields: [scopeItems.parentId],
    references: [scopeItems.id],
    relationName: "scopeItemChildren",
  }),
  children: many(scopeItems, {
    relationName: "scopeItemChildren",
  }),
}));
