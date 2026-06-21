import { db } from "./index";
import { roles, permissions, rolePermissions } from "./schemas/role";
import { scopes, scopeItems } from "./schemas/scope";
import { assignments, assignmentScopeItems } from "./schemas/assignment";

async function seed() {
  console.log("Seeding database...");

  // 1. Roles
  console.log("Seeding roles...");
  await db.insert(roles).values([
    { id: "r_super_admin", name: "super_admin", description: "Super Admin - Global Access" },
    { id: "r_admin_fakultas", name: "admin_fakultas", description: "Admin Fakultas" },
    { id: "r_admin_prodi", name: "admin_prodi", description: "Admin Program Studi" },
    { id: "r_auditor", name: "auditor", description: "Auditor" },
    { id: "r_viewer", name: "viewer", description: "Viewer - Read Only" },
  ]).onConflictDoNothing();

  // 2. Permissions
  console.log("Seeding permissions...");
  await db.insert(permissions).values([
    { id: "perm_manage_students", name: "manage_students", description: "Manage student data" },
    { id: "perm_manage_courses", name: "manage_courses", description: "Manage course data" },
    { id: "perm_manage_grades", name: "manage_grades", description: "Manage grades" },
    { id: "perm_view_reports", name: "view_reports", description: "View reports" },
    { id: "perm_manage_users", name: "manage_users", description: "Manage users" },
    { id: "perm_audit", name: "audit", description: "Perform audits" },
  ]).onConflictDoNothing();

  // 3. Role-Permission mappings
  console.log("Seeding role permissions...");
  await db.insert(rolePermissions).values([
    // Super Admin - all permissions
    { roleId: "r_super_admin", permissionId: "perm_manage_students" },
    { roleId: "r_super_admin", permissionId: "perm_manage_courses" },
    { roleId: "r_super_admin", permissionId: "perm_manage_grades" },
    { roleId: "r_super_admin", permissionId: "perm_view_reports" },
    { roleId: "r_super_admin", permissionId: "perm_manage_users" },
    { roleId: "r_super_admin", permissionId: "perm_audit" },
    // Admin Fakultas
    { roleId: "r_admin_fakultas", permissionId: "perm_manage_students" },
    { roleId: "r_admin_fakultas", permissionId: "perm_manage_courses" },
    { roleId: "r_admin_fakultas", permissionId: "perm_view_reports" },
    // Admin Prodi
    { roleId: "r_admin_prodi", permissionId: "perm_manage_students" },
    { roleId: "r_admin_prodi", permissionId: "perm_manage_grades" },
    { roleId: "r_admin_prodi", permissionId: "perm_view_reports" },
    // Auditor
    { roleId: "r_auditor", permissionId: "perm_audit" },
    { roleId: "r_auditor", permissionId: "perm_view_reports" },
    // Viewer
    { roleId: "r_viewer", permissionId: "perm_view_reports" },
  ]).onConflictDoNothing();

  // 4. Scopes
  console.log("Seeding scopes...");
  await db.insert(scopes).values([
    { id: "sc_universitas", name: "universitas", description: "University level" },
    { id: "sc_fakultas", name: "fakultas", description: "Faculty level" },
    { id: "sc_prodi", name: "prodi", description: "Study Program level" },
  ]).onConflictDoNothing();

  // 5. Scope Items (hierarchical)
  console.log("Seeding scope items...");
  await db.insert(scopeItems).values([
    // Universitas
    { id: "si_univ_x", scopeId: "sc_universitas", name: "Universitas X", parentId: null },
    // Fakultas
    { id: "si_ft", scopeId: "sc_fakultas", name: "Fakultas Teknik", parentId: "si_univ_x" },
    { id: "si_fe", scopeId: "sc_fakultas", name: "Fakultas Ekonomi", parentId: "si_univ_x" },
    { id: "si_fkip", scopeId: "sc_fakultas", name: "Fakultas Keguruan", parentId: "si_univ_x" },
    // Prodi (under Fakultas Teknik)
    { id: "si_ti", scopeId: "sc_prodi", name: "Teknik Informatika", parentId: "si_ft" },
    { id: "si_tk", scopeId: "sc_prodi", name: "Teknik Komputer", parentId: "si_ft" },
    { id: "si_el", scopeId: "sc_prodi", name: "Teknik Elektro", parentId: "si_ft" },
    // Prodi (under Fakultas Ekonomi)
    { id: "si_man", scopeId: "sc_prodi", name: "Manajemen", parentId: "si_fe" },
    { id: "si_ak", scopeId: "sc_prodi", name: "Akuntansi", parentId: "si_fe" },
  ]).onConflictDoNothing();

  // 6. Assignments (with scopeMode)
  console.log("Seeding assignments...");
  await db.insert(assignments).values([
    // Global - Super Admin
    { id: "a_super_admin", roleId: "r_super_admin", scopeId: null, scopeMode: "global", name: "Super Admin" },
    // Single - Admin Fakultas Teknik
    { id: "a_admin_ft", roleId: "r_admin_fakultas", scopeId: "sc_fakultas", scopeMode: "single", name: "Admin Fakultas Teknik" },
    // Single - Admin Prodi TI
    { id: "a_admin_ti", roleId: "r_admin_prodi", scopeId: "sc_prodi", scopeMode: "single", name: "Admin Prodi Teknik Informatika" },
    // Multiple - Auditor (multiple fakultas)
    { id: "a_auditor_ft_fe", roleId: "r_auditor", scopeId: "sc_fakultas", scopeMode: "multiple", name: "Auditor Fakultas Teknik & Ekonomi" },
    // Multiple - Admin Prodi (multiple prodi)
    { id: "a_admin_ti_tk", roleId: "r_admin_prodi", scopeId: "sc_prodi", scopeMode: "multiple", name: "Admin Prodi TI & TK" },
  ]).onConflictDoNothing();

  // 7. Assignment-Scope mappings
  console.log("Seeding assignment scope items...");
  await db.insert(assignmentScopeItems).values([
    // Admin Fakultas Teknik → Fakultas Teknik
    { id: "asi_1", assignmentId: "a_admin_ft", scopeItemId: "si_ft" },
    // Admin Prodi TI → Teknik Informatika
    { id: "asi_2", assignmentId: "a_admin_ti", scopeItemId: "si_ti" },
    // Auditor → Fakultas Teknik + Fakultas Ekonomi
    { id: "asi_3", assignmentId: "a_auditor_ft_fe", scopeItemId: "si_ft" },
    { id: "asi_4", assignmentId: "a_auditor_ft_fe", scopeItemId: "si_fe" },
    // Admin Prodi TI & TK → TI + TK
    { id: "asi_5", assignmentId: "a_admin_ti_tk", scopeItemId: "si_ti" },
    { id: "asi_6", assignmentId: "a_admin_ti_tk", scopeItemId: "si_tk" },
  ]).onConflictDoNothing();

  console.log("Seed completed!");
}

seed()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
