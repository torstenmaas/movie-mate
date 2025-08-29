// Starts an ephemeral PostgreSQL 16 via Testcontainers for DB tests.
// Only runs when RUN_DB_TESTS=true.
const { execSync } = require('node:child_process')

module.exports = async () => {
  if (process.env.RUN_DB_TESTS !== 'true') return

  // Lazy require to avoid dependency when not running DB tests
  const { PostgreSqlContainer } = require('@testcontainers/postgresql')

  const container = await new PostgreSqlContainer('postgres:16')
    .withDatabase('moviemate_test')
    .withUsername('moviemate')
    .withPassword('moviemate')
    .start()

  const uri = container.getConnectionUri()

  // Expose for tests
  process.env.DATABASE_URL = uri

  // Persist container id for teardown
  const fs = require('node:fs')
  const path = require('node:path')
  const tmpDir = path.join(process.cwd(), 'tmp')
  fs.mkdirSync(tmpDir, { recursive: true })
  const meta = { id: container.getId ? container.getId() : null, uri }
  fs.writeFileSync(path.join(tmpDir, 'pg-testcontainer.json'), JSON.stringify(meta))

  // Run migrations against the container
  try {
    execSync('pnpm -s prisma:migrate:deploy', {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: uri },
    })
    // Ensure generated client matches current schema (needed for new models)
    execSync('pnpm -s prisma:generate', {
      stdio: 'inherit',
      env: { ...process.env },
    })
  } catch (e) {
    // Stop the container if migrations fail
    try {
      await container.stop()
    } catch (_) {}
    throw e
  }

  // Keep container alive; Jest teardown will stop it by id (best-effort)
}
