import './assets/main.css'
import { createApp } from 'vue'
import axios from 'axios'
import { extraFq } from './apiConfig.js'
import App from './App.vue'

// Automatically append the extra filter query to all occurrence / biocache
// API requests.  The value comes from ?fq= URL param or VITE_EXTRA_FQ env var.
axios.interceptors.request.use((config) => {
  if (!extraFq) return config
  const url = config.url || ''
  // Only occurrence / biocache endpoints accept fq
  if (
    url.includes('api.ala.org.au/occurrences') ||
    url.includes('biocache-ws.ala.org.au')
  ) {
    config.params = config.params || {}
    // fq can be an array (multiple filters) — append to existing
    if (Array.isArray(config.params.fq)) {
      config.params.fq.push(extraFq)
    } else if (config.params.fq) {
      config.params.fq = [config.params.fq, extraFq]
    } else {
      config.params.fq = extraFq
    }
  }
  return config
})

const app = createApp(App)
app.mount('#app')
