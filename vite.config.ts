import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

const validateProductionApiUrl = (value: string | undefined, isRailway: boolean) => {
  const apiUrl = value?.trim()
  if (!apiUrl) {
    throw new Error('VITE_API_URL is required for production builds')
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(apiUrl)
  } catch {
    throw new Error('VITE_API_URL must be a valid absolute URL')
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error('VITE_API_URL must use HTTP or HTTPS')
  }
  if (!parsedUrl.pathname.replace(/\/$/, '').endsWith('/api')) {
    throw new Error('VITE_API_URL must end in /api')
  }
  if (isRailway && parsedUrl.protocol !== 'https:') {
    throw new Error('VITE_API_URL must use HTTPS for Railway builds')
  }
}

const validatePublicLinks = (env: Record<string, string>) => {
  const supportEmail = env.VITE_SUPPORT_EMAIL?.trim()
  if (supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail)) {
    throw new Error('VITE_SUPPORT_EMAIL must be a valid email address')
  }

  for (const name of [
    'VITE_PRIVACY_POLICY_URL',
    'VITE_TERMS_URL',
    'VITE_REFUND_POLICY_URL',
  ]) {
    const value = env[name]?.trim()
    if (!value) continue
    try {
      if (new URL(value).protocol !== 'https:') throw new Error()
    } catch {
      throw new Error(`${name} must be a valid HTTPS URL`)
    }
  }
}

const validateGoogleAnalytics = (value: string | undefined) => {
  const measurementId = value?.trim()
  if (measurementId && !/^G-[A-Z0-9]+$/i.test(measurementId)) {
    throw new Error('VITE_GOOGLE_ANALYTICS_ID must be a valid GA4 measurement ID')
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  if (mode === 'production') {
    validateProductionApiUrl(
      env.VITE_API_URL,
      Boolean(env.RAILWAY_ENVIRONMENT || env.RAILWAY_PROJECT_ID || env.RAILWAY_SERVICE_ID),
    )
    validatePublicLinks(env)
    validateGoogleAnalytics(env.VITE_GOOGLE_ANALYTICS_ID)
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@api': path.resolve(__dirname, './api'),
        '@components': path.resolve(__dirname, './src/components'),
        '@context': path.resolve(__dirname, './src/context'),
        '@features': path.resolve(__dirname, './src/features'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@layouts': path.resolve(__dirname, './src/layouts'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@stores': path.resolve(__dirname, './src/stores'),
        '@utils': path.resolve(__dirname, './src/utils'),
      },
    },
  }
})
