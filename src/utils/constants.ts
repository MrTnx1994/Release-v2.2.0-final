// Shared UI constants.
// These used to be duplicated as local magic numbers in both App.tsx and the
// screens that consume them (e.g. ConfigScreen.tsx had PRODUCTS_TABLE_PAGE_SIZE = 12
// while App.tsx had 10 for the exact same table), which could put the user on a
// page number that the child screen then rendered as empty. Keeping a single
// source of truth here prevents that class of bug.

export const DRIVERS_TABLE_PAGE_SIZE = 8;
export const PRODUCTS_TABLE_PAGE_SIZE = 10;

// Must stay in sync with PRIMARY_ADMIN_EMAILS in server.ts. Used to decide which
// accounts see admin-only danger-zone actions (factory reset, etc.) in the UI.
export const PRIMARY_ADMIN_EMAILS = ["admin@system.com", "nazari925@gmail.com"];
