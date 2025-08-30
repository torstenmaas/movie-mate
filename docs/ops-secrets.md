# Secrets-Runbook und Produktions-Guards

Dieses Runbook beschreibt die Verwaltung und Rotation von Secrets (insb. JWT-Secrets) und dokumentiert produktionsseitige Guards gegen die Nutzung von Dev-Defaults.

## Secret-Typen

- JWT Access Secret: Signiert Access Tokens. Kurzlebig (z. B. 15 Minuten).
- JWT Refresh Secret: Signiert Refresh Tokens. Längerlebig (z. B. 30 Tage).

Hinweise:

- Keine Secrets im Repository speichern. Niemals in Git committen.
- Secrets werden in Produktion ausschließlich über Coolify/Env-Variablen gesetzt.
- Für lokale Entwicklung stehen Dev-Defaults in `.env.example` zur Verfügung.

## Erzeugung (256-bit random, base64url)

Empfehlung: 32 Bytes kryptographisch sichere Zufallsdaten, base64url-kodiert.

Beispiele:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Optionales Script (komfortabel, erzeugt Access/Refresh):

```bash
pnpm -s tsx scripts/generate-secrets.ts
```

## Setzen der Secrets (Produktion)

- In Coolify für den API-Container die Env-Variablen setzen/ändern:
  - `JWT_SECRET`
  - `JWT_REFRESH_SECRET`
- Änderungen werden beim nächsten Deploy/Restart wirksam.

## Rotation

Ziel: Zero-Downtime-Rotation ist ideal, ansonsten kurzes Zeitfenster einplanen.

Schritte (empfohlen):

1. Vorbereitung: Neue Secrets generieren (Access/Refresh separat!) und sicher ablegen.
2. Rollout planen: Kurzfristiges Wartungsfenster ankündigen (falls nötig).
3. Deploy: In Coolify die neuen Secrets setzen und den Dienst neu starten.
4. Verifikation (siehe unten) durchführen.

Auswirkungen:

- Access Tokens, die mit dem alten Secret signiert wurden, sind nach Rotation ungültig.
- Refresh Tokens sind ebenfalls ungültig; Benutzer müssen sich ggf. erneut anmelden.
- In der Regel genügt ein erneutes Login. Planen Sie Support/Monitoring ein.

Rollback:

- Alte Secrets sicher bereithalten. Bei Problemen Wechsel zurück, dann Ursache analysieren.

## Produktions-Guards (Fail-Fast)

In `apps/api/src/config/config.schema.ts` wird in `NODE_ENV=production` ein Start abgebrochen, wenn Dev-Defaults verwendet werden:

- `JWT_SECRET === 'dev-secret-change-me'` oder
- `JWT_REFRESH_SECRET === 'dev-refresh-secret-change-me'`

Fehlerhinweis verweist auf dieses Dokument.

## Verifikation nach Rotation

- Health: `GET /api/v1/health` und `GET /api/v1/health/ready` prüfen.
- Auth-Flows: Login durchführen, Access/Refresh Token ausstellen/prüfen.
- Fehler-Monitoring: 4xx/5xx-Rate, Auth-spezifische Fehler, Logs prüfen.

## Sicherheitshinweise

- Secrets regelmäßig rotieren und mindestens wie Passwörter behandeln.
- Zugriff nur für berechtigte Personen; Audit/Versionierung in Coolify/Secret-Store nutzen.
- Keine Secrets in Logs, Commits, PRs oder Issue-Texten.
