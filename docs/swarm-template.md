# Swarm Prompt (Vorlage)

name: <kurzer-name>
role: Swarm
purpose: <1 Zeile, warum dieses Work‑Package>

prompt:
Ziel: - <konkretes, testbares Ziel (1–2 Sätze)>
Dateien/Orte: - <Pfad1> - <Pfad2>
Schritte: - Implementiere die Änderung an <Datei/Ort> … - Ergänze/aktualisiere Tests … - pnpm typecheck - pnpm lint - pnpm test - pnpm format
PR:
Titel: <feat|fix|docs(scope): …>
Beschreibung: - Was und warum - Betroffene Dateien/Module - Tests: neu/angepasst (welche Suiten) - Risiken/Trade-offs - ENV/Docker/Docs-Hinweise (falls nötig)
Checkliste:

- [ ] Branch mit git erstellt
- [ ] PR mit gh erstellt mit Titel/Beschreibung
- [ ] Code implementiert
- [ ] Tests neu/angepasst (welche Suiten)
- [ ] `pnpm test` lokal grün
- [ ] `pnpm typecheck` grün, `pnpm lint` grün
- [ ] `pnpm format` ausgeführt
- [ ] Docs aktualisiert (falls nötig)
- [ ] `.env.example` aktualisiert (falls nötig)

Grenzen: - Kein Push nach main (nur PR) - Keine Deploy‑Trigger; Deploy läuft pipeline‑gesteuert - Keine Secrets - Kein Update der tasks.md (Queen macht das)

Rückmeldung an Queen:

```
STATUS: success|needs-info|blocked
SUMMARY: 3–5 Stichpunkte, was geändert wurde
PR: URL/Branch/Titel
CI: grün/rot + Grund (falls rot: Fehlermeldung + Kurz‑Fixplan)
NEXT: 1–2 konkrete nächste Schritte
```
