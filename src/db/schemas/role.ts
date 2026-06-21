import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

export const roles = pgTable("roles", {
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

export const permissions = pgTable("permissions", {
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

export const rolePermissions = pgTable(
  "role_permissions",
  {
    // ***Identity
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),

    // *** Fields
    roleId: text("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    permissionId: text("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),

    // *** Audit
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("rolePermissions_roleId_idx").on(table.roleId),
    index("rolePermissions_permissionId_idx").on(table.permissionId),
  ],
);

export const rolesRelations = relations(roles, ({ many }) => ({
  permissions: many(rolePermissions),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  roles: many(rolePermissions),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id],
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
}));
