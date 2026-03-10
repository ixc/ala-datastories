/**
 * Centralised API configuration.
 *
 * VITE_EXTRA_FQ – an optional filter-query parameter appended to every
 * occurrence / biocache API request.  Set it in .env.local (git-ignored
 * by Vite) so the fork can override without touching source files.
 *
 * Usage:
 *   import { extraFq } from '../apiConfig.js'   // (adjust path)
 *   // or rely on the axios interceptor set up in main.js
 */

export const extraFq = import.meta.env.VITE_EXTRA_FQ || ''
