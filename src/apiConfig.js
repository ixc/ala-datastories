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

/**
 * Lifeform display mode derived from extraFq:
 *   'all'    – no collection filter or institution filter → show all lifeforms
 *   'subset' – specific collection_uid with known lifeform mapping → show subset
 *   'none'   – other collection_uid → hide lifeform picker entirely
 */
const collectionLifeforms = {
	co10: ['amphibians', 'reptiles'],  // herpetology
}

export function getLifeformMode() {
	const m = extraFq.match(/^collection_uid[=:](.+)$/)
	if (!m) return 'all'          // institution_uid or no filter
	return collectionLifeforms[m[1]] ? 'subset' : 'none'
}

export function getLifeformAllowList() {
	const m = extraFq.match(/^collection_uid[=:](.+)$/)
	return m && collectionLifeforms[m[1]] ? collectionLifeforms[m[1]] : null
}
