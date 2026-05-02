/**
 * Re-export Database type from the canonical location.
 * The @nuxtjs/supabase module expects the file at ~/app/types/database.types.ts.
 * All composables and stores import from ~/types/database.
 * This bridge file keeps both paths working without touching 11+ files.
 */
export type { Database } from './database.types';
