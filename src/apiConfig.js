/**
 * Centralised API configuration.
 *
 * extraFq – an optional filter-query parameter appended to every
 * occurrence / biocache API request.
 *
 * Priority (highest wins):
 *   1. URL query parameter  ?fq=institution_uid:in4
 *   2. Build-time env var   VITE_EXTRA_FQ  (set in .env.local)
 *
 * This makes it easy to embed the app in an iframe with different
 * filters per instance, e.g.:
 *   <iframe src="/lens/?fq=institution_uid:in4"></iframe>
 *
 * Usage:
 *   import { extraFq } from '../apiConfig.js'   // (adjust path)
 *   // or rely on the axios interceptor set up in main.js
 */

const urlParams = new URLSearchParams(window.location.search)
export const extraFq = urlParams.get('fq') || import.meta.env.VITE_EXTRA_FQ || ''
