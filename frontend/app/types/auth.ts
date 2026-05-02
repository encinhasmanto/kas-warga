/**
 * User roles in the KasWarga system.
 * Values may appear in different casing depending on source (DB vs code).
 * The auth store normalizes to lowercase internally.
 */
export type UserRole = 'resident' | 'admin' | 'super_admin' | 'Resident' | 'Admin' | 'Super Admin';

/**
 * Represents an authenticated user session, stored in Pinia.
 * Constructed by useAuthService.authenticateResident() or authenticateAdmin().
 */
export interface UserSession {
  /** UUID from the `units` or `admins` table */
  id: string;

  /** Unit code (e.g. "A1", "B5", "R3"). Empty string for admins. */
  unitCode: string;

  /** Display name shown in the UI (unit owner name or admin username) */
  displayName: string;

  /** User role — determines layout, sidebar, and available pages */
  role: UserRole;

  /** Unit category: "Rumah" or "Ruko". Only for residents. */
  category?: string;

  /** URL to the user's avatar image in Supabase Storage */
  avatarUrl?: string | null;

  /** Whether this is a guest/demo session (feature not yet implemented) */
  isGuest?: boolean;

  /** True when a Super Admin is impersonating this resident */
  impersonated?: boolean;
}
