import * as Sentry from '@sentry/node'

// Read config from environment as early as possible
const dsn = process.env.SENTRY_DSN || ''
const environment = process.env.NODE_ENV || 'development'
// Prefer explicit SENTRY_RELEASE, else IMAGE_COMMIT (short SHA), else undefined
const imageCommit = (process.env.IMAGE_COMMIT || '').trim()
const release =
  process.env.SENTRY_RELEASE || (imageCommit ? imageCommit.substring(0, 7) : '') || undefined

const tracesSampleRate = Number.parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1')
const profilesSampleRate = Number.parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE || '0')
const verifySetup = (process.env.SENTRY_VERIFY_SETUP || 'false') === 'true'

if (dsn) {
  Sentry.init({
    dsn,
    environment,
    release,
    tracesSampleRate: Number.isFinite(tracesSampleRate) ? tracesSampleRate : 0,
    profilesSampleRate: Number.isFinite(profilesSampleRate) ? profilesSampleRate : 0,
    integrations: [Sentry.expressIntegration()],
    beforeSend(event) {
      const url = event.request?.url || ''
      if (url.includes('/api/v1/health')) return null
      if (url.includes('/api/v1/docs')) return null
      return event
    },
    beforeSendTransaction(event) {
      const url = event.request?.url || ''
      if (url.includes('/api/v1/health')) return null
      if (url.includes('/api/v1/docs')) return null
      return event
    },
  })

  if (verifySetup) {
    try {
      Sentry.captureMessage('sentry-setup-ok', 'info')
    } catch {}
  }
}

export {}
