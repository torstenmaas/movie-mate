# PRD - Movie Mate Platform

## Vision

Eine Social Planning Platform für gemeinsames Film- und Serienschauen - koordiniere WER mit WEM schaut.

## Problem

Menschen wollen gemeinsam Filme/Serien schauen, aber die Koordination ist chaotisch: WhatsApp-Gruppen, verschiedene Streaming-Dienste, Terminfindung, Location (Kino vs. Zuhause).

## Zielgruppen

### Persona 1: Social Cinephile

- 25-35 Jahre, urban
- Geht gerne ins Kino mit Freunden
- Nutzt 2-3 Streaming-Dienste
- Frustriert von WhatsApp-Koordination

### Persona 2: Serien-Binger

- 20-30 Jahre
- Schaut Serien mit Partner/WG
- Will gemeinsame Watch-Partys
- Braucht Spoiler-freie Koordination

### Persona 3: Familie

- 35-45 Jahre
- Plant Familienfilmabende
- Verschiedene Altersgruppen berücksichtigen
- Einfache Bedienung wichtig

## User Stories

1. **Als User** möchte ich Filme/Serien zu meiner Watchlist hinzufügen und angeben ob ich sie im Kino oder Zuhause schauen will.
2. **Als User** möchte ich Freunde zu gemeinsamen Watch-Sessions einladen.
3. **Als User** möchte ich sehen, welche meiner Freunde einen Film auch sehen wollen.
4. **Als User** möchte ich Push-Notifications erhalten, wenn Freunde mich einladen.
5. **Als User** möchte ich meine Streaming-Dienste hinterlegen und sehen, wo ein Film verfügbar ist.

## Erfolgskriterien

- **Aktivierungsrate**: 60% der registrierten User erstellen eine Watchlist
- **Engagement**: 3+ Sessions pro Woche pro aktivem User
- **Social**: Durchschnitt 5 Freunde pro User nach 30 Tagen
- **Retention**: 40% Monthly Active Users nach 3 Monaten
- **Performance**: API Response < 200ms, WebSocket Latenz < 100ms

## MVP Scope

### Phase 1: Foundation

- User Registration/Login (Email, Google, Apple)
- Basic Profile

### Phase 2: Core Features

- TMDB Integration
- Watchlist Management
- Friend System
- Invitations

### Phase 3: Real-time

- WebSocket Notifications
- Live Status Updates

## Out of Scope (v1)

- In-App Streaming
- Ticket Booking
- Reviews/Ratings
- Chat

## Tech Requirements

- Multi-language (DE/EN start)
- Mobile-first responsive
- GDPR compliant
- 99.9% Uptime

---

**Changelog:**

- 2024-01-XX: Initial version- 2025-08-25: Akzeptanzkriterium ergänzt: axe E2E-Check (0 critical violations) als Go/No-Go für Releases.

## Changelog

- 2025-08-25: **A11y-Akzeptanz** präzisiert (E2E axe: 0 critical; Tastaturfluss geprüft; Kontrast ≥4.5:1). **TMDB-Constraints** quantifiziert (≈40 req/10s) und Cache-TTL festgelegt (Details 24h, Search 10m, Trending 1h). **Error Codes** katalogisiert; **Rate-Limit-Profile** und **Feature Flags** (Unleash) als spätere Erweiterungen ergänzt.
