packages/@shared

Gemeinsame Utilities für Apps/Packages.

## Pagination Helpers (Cursor)

Beispiel: Cursor-basiertes Paging mit Prisma und opakem Cursor `{ id, createdAt }`.

```ts
import { encodeCursor, decodeCursor, normalizeLimit } from '@shared'

// Controller/Service: Eingaben normalisieren
const limit = normalizeLimit(req.query.limit) // 1..100, default 20
let cursorFilter: any = undefined
if (req.query.cursor) {
  const { id, createdAt } = decodeCursor(String(req.query.cursor))
  // Für absteigende Sortierung (createdAt DESC, id DESC)
  cursorFilter = {
    OR: [
      { createdAt: { lt: new Date(createdAt) } },
      { createdAt: new Date(createdAt), id: { lt: id } },
    ],
  }
}

// Repository: Query mit Limit+1 (für hasNextPage)
const rows = await prisma.item.findMany({
  where: cursorFilter,
  orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  take: limit + 1,
})

const hasNextPage = rows.length > limit
const items = hasNextPage ? rows.slice(0, limit) : rows
const last = items[items.length - 1]
const nextCursor =
  hasNextPage && last
    ? encodeCursor({ id: last.id, createdAt: last.createdAt.toISOString() })
    : undefined

return { items, pageInfo: { hasNextPage, hasPrevPage: Boolean(req.query.cursor), nextCursor } }
```

Fehlerfälle (422): ungültiger `cursor`, `limit` außerhalb 1..100.
