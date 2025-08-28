// Stops the PostgreSQL Testcontainers container if one was started.
const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

module.exports = async () => {
  if (process.env.RUN_DB_TESTS !== 'true') return;
  const metaPath = path.join(process.cwd(), 'tmp', 'pg-testcontainer.json');
  if (!fs.existsSync(metaPath)) return;
  try {
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    // Best-effort: stop container by id via docker CLI if available
    if (meta.id) {
      try {
        execSync(`docker rm -f ${meta.id}`, { stdio: 'ignore' });
      } catch (_) {
        // ignore; container may already be removed/reused
      }
    }
  } catch (_) {
    // ignore
  }
};

