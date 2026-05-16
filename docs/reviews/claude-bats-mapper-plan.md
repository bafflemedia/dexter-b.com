  BATS Mapper Plan

  1. Current Notion BATS Property Names and Types

  Database: BATS - Asset Registry (collection ID 337056c8-2aa3-80ed-a0e0-000b8e010944)

  ┌─────────────────────┬────────────────────────┬──────────────────────────────────────────────────────────────────────────────────┐
  │   Notion Property   │          Type          │                                 Options / Notes                                  │
  ├─────────────────────┼────────────────────────┼──────────────────────────────────────────────────────────────────────────────────┤
  │ Name                │ title                  │ Asset name — the Notion title field                                              │
  ├─────────────────────┼────────────────────────┼──────────────────────────────────────────────────────────────────────────────────┤
  │ BAT                 │ formula (read-only)    │ "BM-" + Category.Code + "-" + padded(Index) — shows "PENDING" until Index is set │
  ├─────────────────────┼────────────────────────┼──────────────────────────────────────────────────────────────────────────────────┤
  │ BATS URL            │ formula (read-only)    │ "https://baffle.link/" + BAT                                                     │
  ├─────────────────────┼────────────────────────┼──────────────────────────────────────────────────────────────────────────────────┤
  │ Category            │ relation               │ → Category DB (collection://5296d47a-…)                                          │
  ├─────────────────────┼────────────────────────┼──────────────────────────────────────────────────────────────────────────────────┤
  │ Location            │ relation               │ → Master Locations DB (collection://ebe3325b-…)                                  │
  ├─────────────────────┼────────────────────────┼──────────────────────────────────────────────────────────────────────────────────┤
  │ Projects            │ relation               │ → Projects DB (collection://34f056c8-…aa)                                        │
  ├─────────────────────┼────────────────────────┼──────────────────────────────────────────────────────────────────────────────────┤
  │ Receipt/Transaction │ relation               │ → Receipt DB (collection://34f056c8-…43)                                         │
  ├─────────────────────┼────────────────────────┼──────────────────────────────────────────────────────────────────────────────────┤
  │ Merchant            │ rollup (read-only)     │ Derived from Receipt/Transaction relation                                        │
  ├─────────────────────┼────────────────────────┼──────────────────────────────────────────────────────────────────────────────────┤
  │ Index               │ number                 │ Integer — drives the BAT formula; must be set manually                           │
  ├─────────────────────┼────────────────────────┼──────────────────────────────────────────────────────────────────────────────────┤
  │ Asset Class         │ select                 │ Expensed (Section 179) · Capitalized · Consumable                                │
  ├─────────────────────┼────────────────────────┼──────────────────────────────────────────────────────────────────────────────────┤
  │ Status              │ select                 │ Available · In Use · Maintenance · Retired                                       │
  ├─────────────────────┼────────────────────────┼──────────────────────────────────────────────────────────────────────────────────┤
  │ Primary User        │ select                 │ DexterB (only option)                                                            │
  ├─────────────────────┼────────────────────────┼──────────────────────────────────────────────────────────────────────────────────┤
  │ Sync Status         │ select                 │ Draft · Manual Uploaded · AI Ready                                               │
  ├─────────────────────┼────────────────────────┼──────────────────────────────────────────────────────────────────────────────────┤
  │ Unit Price          │ number (dollar format) │ Cost basis                                                                       │
  ├─────────────────────┼────────────────────────┼──────────────────────────────────────────────────────────────────────────────────┤
  │ Manufacturer        │ text                   │                                                                                  │
  ├─────────────────────┼────────────────────────┼──────────────────────────────────────────────────────────────────────────────────┤
  │ Serial Number       │ text                   │                                                                                  │
  ├─────────────────────┼────────────────────────┼──────────────────────────────────────────────────────────────────────────────────┤
  │ Warranty Expiration │ date                   │                                                                                  │
  ├─────────────────────┼────────────────────────┼──────────────────────────────────────────────────────────────────────────────────┤
  │ Power Draw in Watts │ number                 │                                                                                  │
  ├─────────────────────┼────────────────────────┼──────────────────────────────────────────────────────────────────────────────────┤
  │ Notes               │ text                   │                                                                                  │
  ├─────────────────────┼────────────────────────┼──────────────────────────────────────────────────────────────────────────────────┤
  │ AI Field Note       │ text                   │ High-fidelity tips for AI / NotebookLM                                           │
  ├─────────────────────┼────────────────────────┼──────────────────────────────────────────────────────────────────────────────────┤
  │ Photo               │ text                   │ Stores URL or base64 string                                                      │
  ├─────────────────────┼────────────────────────┼──────────────────────────────────────────────────────────────────────────────────┤
  │ Manual Link         │ file                   │ Uploaded file attachment                                                         │
  ├─────────────────────┼────────────────────────┼──────────────────────────────────────────────────────────────────────────────────┤
  │ Tax Year            │ formula (read-only)    │ Derived from receipt Purchase Date via relation                                  │
  └─────────────────────┴────────────────────────┴──────────────────────────────────────────────────────────────────────────────────┘

  Not in current Notion schema (confirmed absent):
  - Functional Check, Personal Transfer, Reference Video URL, Transaction Date, Receipt Total, QB Transaction ID, Receipt URL, Purchase Date

  The schema export doc (748e7adb…) reflects an older "Baffle Asset Library" iteration with different property names (Asset Name, Price, Baffle ID,
  Purchase Date, QB Transaction ID as direct fields). It does not match the live schema. The live MCP fetch is authoritative.

  ---
  2. Current Frontend Form Fields (src/pages/BATS.tsx)

  AssetData state (submitted as assetData in POST body):

  ┌────────────────────┬────────────────────────────────┬────────────────────────────────────────────────────┐
  │   Frontend field   │           Input type           │                 Sent in POST body                  │
  ├────────────────────┼────────────────────────────────┼────────────────────────────────────────────────────┤
  │ name               │ text                           │ ✓ as ad.name                                       │
  ├────────────────────┼────────────────────────────────┼────────────────────────────────────────────────────┤
  │ assetClass         │ select                         │ ✓ as ad.assetClass                                 │
  ├────────────────────┼────────────────────────────────┼────────────────────────────────────────────────────┤
  │ status             │ select                         │ ✓ as ad.status                                     │
  ├────────────────────┼────────────────────────────────┼────────────────────────────────────────────────────┤
  │ categoryId         │ select (mock IDs: cat1, cat2…) │ NOT sent — category block is commented out of POST │
  ├────────────────────┼────────────────────────────────┼────────────────────────────────────────────────────┤
  │ locationId         │ select (mock IDs: loc1…)       │ NOT sent                                           │
  ├────────────────────┼────────────────────────────────┼────────────────────────────────────────────────────┤
  │ projectIds         │ multi-select (mock IDs: prj1…) │ NOT sent                                           │
  ├────────────────────┼────────────────────────────────┼────────────────────────────────────────────────────┤
  │ index              │ auto-computed string           │ NOT sent                                           │
  ├────────────────────┼────────────────────────────────┼────────────────────────────────────────────────────┤
  │ price              │ number                         │ ✓ as ad.price                                      │
  ├────────────────────┼────────────────────────────────┼────────────────────────────────────────────────────┤
  │ serialNumber       │ text                           │ ✓ as ad.serialNumber                               │
  ├────────────────────┼────────────────────────────────┼────────────────────────────────────────────────────┤
  │ manufacturer       │ text                           │ ✓ as ad.manufacturer                               │
  ├────────────────────┼────────────────────────────────┼────────────────────────────────────────────────────┤
  │ warrantyExp        │ date                           │ ✓ as ad.warrantyExp                                │
  ├────────────────────┼────────────────────────────────┼────────────────────────────────────────────────────┤
  │ powerDraw          │ number                         │ ✓ as ad.powerDraw                                  │
  ├────────────────────┼────────────────────────────────┼────────────────────────────────────────────────────┤
  │ notes              │ textarea                       │ ✓ as ad.notes                                      │
  ├────────────────────┼────────────────────────────────┼────────────────────────────────────────────────────┤
  │ aiFieldNote        │ textarea                       │ ✓ as ad.aiFieldNote                                │
  ├────────────────────┼────────────────────────────────┼────────────────────────────────────────────────────┤
  │ primaryUser        │ hardcoded 'DexterB'            │ ✓ as ad.primaryUser                                │
  ├────────────────────┼────────────────────────────────┼────────────────────────────────────────────────────┤
  │ syncStatus         │ select                         │ ✓ as ad.syncStatus                                 │
  ├────────────────────┼────────────────────────────────┼────────────────────────────────────────────────────┤
  │ isPersonalTransfer │ checkbox/toggle                │ ✓ as ad.isPersonalTransfer                         │
  ├────────────────────┼────────────────────────────────┼────────────────────────────────────────────────────┤
  │ functionalCheck    │ checkbox                       │ ✓ as ad.functionalCheck                            │
  ├────────────────────┼────────────────────────────────┼────────────────────────────────────────────────────┤
  │ referenceVideoUrl  │ text                           │ ✓ as ad.referenceVideoUrl                          │
  ├────────────────────┼────────────────────────────────┼────────────────────────────────────────────────────┤
  │ manualLink         │ not rendered                   │ NOT sent                                           │
  ├────────────────────┼────────────────────────────────┼────────────────────────────────────────────────────┤
  │ photoGallery       │ file input (base64)            │ NOT sent                                           │
  └────────────────────┴────────────────────────────────┴────────────────────────────────────────────────────┘

  ReceiptData state (submitted as receiptData in POST body):

  ┌─────────────────┬───────────────────────────────────────────────────────┐
  │ Frontend field  │                        Sent as                        │
  ├─────────────────┼───────────────────────────────────────────────────────┤
  │ id              │ NOT sent (used only to display selected mock receipt) │
  ├─────────────────┼───────────────────────────────────────────────────────┤
  │ merchantId      │ NOT sent                                              │
  ├─────────────────┼───────────────────────────────────────────────────────┤
  │ date            │ ✓ as rd.date                                          │
  ├─────────────────┼───────────────────────────────────────────────────────┤
  │ totalPrice      │ ✓ as rd.totalPrice                                    │
  ├─────────────────┼───────────────────────────────────────────────────────┤
  │ qbTransactionId │ ✓ as rd.qbTransactionId                               │
  ├─────────────────┼───────────────────────────────────────────────────────┤
  │ sourceUrl       │ ✓ as rd.sourceUrl                                     │
  └─────────────────┴───────────────────────────────────────────────────────┘

  After a successful POST, the frontend displays NODE-{last4 of page.id} and links to notion.so/{page_id} — not a real BATS URL.

  ---
  3. Current server.js /api/bats Mapping Behavior

  GET /api/bats (reads from Notion)

  Queries the BATS DB with an empty filter (returns all records). Maps each Notion page to a clean object with these reads:

  ┌────────────────────┬───────────────────────────────┬─────────────────────────────────────────────────────────────────────────────────────┐
  │    Target field    │  Reads from Notion property   │                                       Problem                                       │
  ├────────────────────┼───────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────┤
  │ batId              │ BAT ID (formula OR rich_text) │ Wrong name — property is BAT, not BAT ID                                            │
  ├────────────────────┼───────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────┤
  │ name               │ Asset Name (title)            │ Wrong name — title property is Name                                                 │
  ├────────────────────┼───────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────┤
  │ status             │ Status (select)               │ ✓ Correct                                                                           │
  ├────────────────────┼───────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────┤
  │ assetClass         │ Asset Class (select)          │ ✓ Correct                                                                           │
  ├────────────────────┼───────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────┤
  │ category           │ Category (select OR relation) │ Wrong type — it's a relation only; select accessor returns null always              │
  ├────────────────────┼───────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────┤
  │ location           │ Location (select OR relation) │ Wrong type — same issue                                                             │
  ├────────────────────┼───────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────┤
  │ manufacturer       │ Manufacturer (rich_text)      │ ✓ Correct                                                                           │
  ├────────────────────┼───────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────┤
  │ serialNumber       │ Serial Number (rich_text)     │ ✓ Correct                                                                           │
  ├────────────────────┼───────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────┤
  │ price              │ Price (number)                │ Wrong name — property is Unit Price                                                 │
  ├────────────────────┼───────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────┤
  │ warrantyExp        │ Warranty Exp (date)           │ Wrong name — property is Warranty Expiration                                        │
  ├────────────────────┼───────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────┤
  │ powerDraw          │ Power Draw (number)           │ Wrong name — property is Power Draw in Watts                                        │
  ├────────────────────┼───────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────┤
  │ syncStatus         │ Sync Status (select)          │ ✓ Correct                                                                           │
  ├────────────────────┼───────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────┤
  │ primaryUser        │ Primary User (rich_text)      │ Wrong type — Primary User is a select in Notion, not rich_text; always returns null │
  ├────────────────────┼───────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────┤
  │ functionalCheck    │ Functional Check (checkbox)   │ Does not exist in schema                                                            │
  ├────────────────────┼───────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────┤
  │ isPersonalTransfer │ Personal Transfer (checkbox)  │ Does not exist in schema                                                            │
  ├────────────────────┼───────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────┤
  │ notes              │ Notes (rich_text)             │ ✓ Correct                                                                           │
  └────────────────────┴───────────────────────────────┴─────────────────────────────────────────────────────────────────────────────────────┘

  Not read (present in Notion, missing from GET response):
  Index, BATS URL formula, Tax Year, AI Field Note, Photo, Manual Link, Merchant rollup, Receipt/Transaction relation, Projects relation.

  POST /api/bats (writes to Notion)

  Requires role guardian or collaborator. Maps req.body.{ assetData, receiptData }.

  ┌──────────────────────────────┬───────────────────────┬───────────────────────────────────────────────────────────┐
  │    Writes Notion property    │        Source         │                          Problem                          │
  ├──────────────────────────────┼───────────────────────┼───────────────────────────────────────────────────────────┤
  │ Asset Name (title)           │ ad.name               │ Wrong name — title field is Name; Notion API will error   │
  ├──────────────────────────────┼───────────────────────┼───────────────────────────────────────────────────────────┤
  │ Status (select)              │ ad.status             │ ✓ Correct                                                 │
  ├──────────────────────────────┼───────────────────────┼───────────────────────────────────────────────────────────┤
  │ Asset Class (select)         │ ad.assetClass         │ ✓ Correct                                                 │
  ├──────────────────────────────┼───────────────────────┼───────────────────────────────────────────────────────────┤
  │ Sync Status (select)         │ ad.syncStatus         │ ✓ Correct                                                 │
  ├──────────────────────────────┼───────────────────────┼───────────────────────────────────────────────────────────┤
  │ Functional Check (checkbox)  │ ad.functionalCheck    │ Does not exist in schema; Notion will reject              │
  ├──────────────────────────────┼───────────────────────┼───────────────────────────────────────────────────────────┤
  │ Personal Transfer (checkbox) │ ad.isPersonalTransfer │ Does not exist in schema; Notion will reject              │
  ├──────────────────────────────┼───────────────────────┼───────────────────────────────────────────────────────────┤
  │ Serial Number (text)         │ ad.serialNumber       │ ✓ Correct                                                 │
  ├──────────────────────────────┼───────────────────────┼───────────────────────────────────────────────────────────┤
  │ Manufacturer (text)          │ ad.manufacturer       │ ✓ Correct                                                 │
  ├──────────────────────────────┼───────────────────────┼───────────────────────────────────────────────────────────┤
  │ Primary User (rich_text!)    │ ad.primaryUser        │ Wrong type — Primary User is a select; Notion will reject │
  ├──────────────────────────────┼───────────────────────┼───────────────────────────────────────────────────────────┤
  │ Notes (text)                 │ ad.notes              │ ✓ Correct                                                 │
  ├──────────────────────────────┼───────────────────────┼───────────────────────────────────────────────────────────┤
  │ AI Field Note (text)         │ ad.aiFieldNote        │ ✓ Correct                                                 │
  ├──────────────────────────────┼───────────────────────┼───────────────────────────────────────────────────────────┤
  │ Reference Video URL (url)    │ ad.referenceVideoUrl  │ Does not exist in schema                                  │
  ├──────────────────────────────┼───────────────────────┼───────────────────────────────────────────────────────────┤
  │ Warranty Exp (date)          │ ad.warrantyExp        │ Wrong name — is Warranty Expiration                       │
  ├──────────────────────────────┼───────────────────────┼───────────────────────────────────────────────────────────┤
  │ Price (number)               │ ad.price              │ Wrong name — is Unit Price                                │
  ├──────────────────────────────┼───────────────────────┼───────────────────────────────────────────────────────────┤
  │ Power Draw (number)          │ ad.powerDraw          │ Wrong name — is Power Draw in Watts                       │
  ├──────────────────────────────┼───────────────────────┼───────────────────────────────────────────────────────────┤
  │ Transaction Date (date)      │ rd.date               │ Does not exist in BATS schema — belongs on Receipt DB     │
  ├──────────────────────────────┼───────────────────────┼───────────────────────────────────────────────────────────┤
  │ Receipt Total (number)       │ rd.totalPrice         │ Does not exist in BATS schema — belongs on Receipt DB     │
  ├──────────────────────────────┼───────────────────────┼───────────────────────────────────────────────────────────┤
  │ QB Transaction ID (text)     │ rd.qbTransactionId    │ Does not exist in BATS schema — belongs on Receipt DB     │
  ├──────────────────────────────┼───────────────────────┼───────────────────────────────────────────────────────────┤
  │ Receipt URL (url)            │ rd.sourceUrl          │ Does not exist in BATS schema — belongs on Receipt DB     │
  └──────────────────────────────┴───────────────────────┴───────────────────────────────────────────────────────────┘

  Never written to Notion (gaps):
  Name (correct title), Index (critical for BAT formula), Category relation, Location relation, Projects relation, Receipt/Transaction relation,
  Unit Price (correct name).

  ---
  4. Mismatches — Summary Table

  ┌────────────────────┬──────────────────────────────────────────────────────────────────────────────────────┬─────────────────────────────────┐
  │        Area        │                                        Issue                                         │            Severity             │
  ├────────────────────┼──────────────────────────────────────────────────────────────────────────────────────┼─────────────────────────────────┤
  │ Title property     │ Server uses Asset Name; Notion uses Name                                             │ Critical — POST fails           │
  ├────────────────────┼──────────────────────────────────────────────────────────────────────────────────────┼─────────────────────────────────┤
  │ BAT ID property    │ Server reads BAT ID; Notion formula is BAT                                           │ Critical — batId always null    │
  ├────────────────────┼──────────────────────────────────────────────────────────────────────────────────────┼─────────────────────────────────┤
  │ Unit Price         │ Server uses Price; Notion uses Unit Price                                            │ High — price never saved/read   │
  ├────────────────────┼──────────────────────────────────────────────────────────────────────────────────────┼─────────────────────────────────┤
  │ Warranty date      │ Server uses Warranty Exp; Notion uses Warranty Expiration                            │ High — date never saved/read    │
  ├────────────────────┼──────────────────────────────────────────────────────────────────────────────────────┼─────────────────────────────────┤
  │ Power Draw         │ Server uses Power Draw; Notion uses Power Draw in Watts                              │ High — never saved/read         │
  ├────────────────────┼──────────────────────────────────────────────────────────────────────────────────────┼─────────────────────────────────┤
  │ Primary User type  │ Server reads/writes as rich_text; Notion is select                                   │ High — always null on read; API │
  │                    │                                                                                      │  error on write                 │
  ├────────────────────┼──────────────────────────────────────────────────────────────────────────────────────┼─────────────────────────────────┤
  │ Category/Location  │ Server reads as select; Notion is relation                                           │ High — always null; relation    │
  │                    │                                                                                      │ IDs never sent on write         │
  ├────────────────────┼──────────────────────────────────────────────────────────────────────────────────────┼─────────────────────────────────┤
  │ Functional Check   │ Written in POST, does not exist in Notion schema                                     │ High — Notion API will reject   │
  │                    │                                                                                      │ POST                            │
  ├────────────────────┼──────────────────────────────────────────────────────────────────────────────────────┼─────────────────────────────────┤
  │ Personal Transfer  │ Written in POST, does not exist in Notion schema                                     │ High — Notion API will reject   │
  │                    │                                                                                      │ POST                            │
  ├────────────────────┼──────────────────────────────────────────────────────────────────────────────────────┼─────────────────────────────────┤
  │ Reference Video    │ Written in POST, does not exist in Notion schema                                     │ Medium — Notion API will reject │
  │ URL                │                                                                                      │  POST                           │
  ├────────────────────┼──────────────────────────────────────────────────────────────────────────────────────┼─────────────────────────────────┤
  │ Receipt fields     │ Transaction Date, Receipt Total, QB Transaction ID, Receipt URL are written to the   │ High — architectural mismatch;  │
  │                    │ BATS record; these are properties of the Receipt/Transaction relation database       │ data goes nowhere               │
  ├────────────────────┼──────────────────────────────────────────────────────────────────────────────────────┼─────────────────────────────────┤
  │ Index never        │ BAT formula always "PENDING" for new records                                         │ High — BAT ID never resolves    │
  │ written            │                                                                                      │                                 │
  ├────────────────────┼──────────────────────────────────────────────────────────────────────────────────────┼─────────────────────────────────┤
  │ Mock relation IDs  │ categoryId, locationId, projectIds are frontend mock IDs, never resolved to real     │ High — relations never linked   │
  │                    │ Notion page IDs                                                                      │                                 │
  ├────────────────────┼──────────────────────────────────────────────────────────────────────────────────────┼─────────────────────────────────┤
  │ BATS URL           │ Frontend shows notion.so/{page_id} instead of /bats/{batId}                          │ Medium — UX gap                 │
  │ post-create        │                                                                                      │                                 │
  └────────────────────┴──────────────────────────────────────────────────────────────────────────────────────┴─────────────────────────────────┘

  ---
  5. Recommended Canonical Frontend Payload Shape

  The frontend should submit two separate objects. Fields that don't exist in Notion are noted as UI-only.

  // POST /api/bats body
  {
    assetData: {
      // Core identity
      name: string;              // required
      categoryPageId?: string;   // real Notion page ID for Category relation
      locationPageId?: string;   // real Notion page ID for Location relation
      projectPageIds?: string[]; // real Notion page IDs for Projects relation
      index?: number;            // integer — set to lastIndex + 1 from Category DB

      // Classification
      assetClass: string;        // "Expensed (Section 179)" | "Capitalized" | "Consumable"
      status: string;            // "Available" | "In Use" | "Maintenance" | "Retired"
      primaryUser: string;       // "DexterB" (must match select option)
      syncStatus: string;        // "Draft" | "Manual Uploaded" | "AI Ready"

      // Specs
      manufacturer?: string;
      serialNumber?: string;
      unitPrice?: number;        // renamed from price
      warrantyExpiration?: string; // renamed from warrantyExp; ISO date
      powerDrawWatts?: number;   // renamed from powerDraw

      // Documentation
      notes?: string;
      aiFieldNote?: string;
      photo?: string;            // URL or base64 string

      // UI-only flags — NOT sent to Notion, handled in form logic only
      // isPersonalTransfer: boolean  (drives receiptMode and notes pre-fill)
      // functionalCheck: boolean     (pre-flight check, no Notion field)

      // Awaiting schema addition before wiring:
      // referenceVideoUrl?: string   (no Notion field yet)
      // manualLink?: ...             (file upload — needs separate handling)
    },
    receiptData: {
      // Option A: Link an existing receipt page in Notion
      existingReceiptPageId?: string;   // links Receipt/Transaction relation on the BATS record

      // Option B: Create a new receipt record first, then link it (Phase 2)
      // newReceipt fields belong to the Receipt/Transaction database, not BATS:
      // date, totalPrice, qbTransactionId, sourceUrl, merchantPageId
    }
  }

  ---
  6. Recommended Notion-to-Frontend READ Mapper

  For GET /api/bats in server.js:

  const mapNotionPageToAsset = (page) => {
    const props = page.properties;
    const batId = props['BAT']?.formula?.string || null;

    return {
      id: page.id,
      batId,
      batsUrl: props['BATS URL']?.formula?.string
        || (batId ? `/bats/${batId}` : `/bats/${page.id}`),

      // Core
      name: props['Name']?.title?.[0]?.plain_text || 'Unidentified Asset',
      index: props['Index']?.number ?? null,
      taxYear: props['Tax Year']?.formula?.number || null,

      // Classification
      status: props['Status']?.select?.name || null,
      assetClass: props['Asset Class']?.select?.name || null,
      primaryUser: props['Primary User']?.select?.name || null,
      syncStatus: props['Sync Status']?.select?.name || null,

      // Relations — return arrays of Notion page IDs for now
      categoryIds: props['Category']?.relation?.map(r => r.id) || [],
      locationIds: props['Location']?.relation?.map(r => r.id) || [],
      projectIds: props['Projects']?.relation?.map(r => r.id) || [],
      receiptIds: props['Receipt/Transaction']?.relation?.map(r => r.id) || [],
      merchantName: props['Merchant']?.rollup?.array?.[0]?.title?.[0]?.plain_text || null,

      // Specs
      unitPrice: props['Unit Price']?.number ?? null,
      manufacturer: props['Manufacturer']?.rich_text?.[0]?.plain_text || null,
      serialNumber: props['Serial Number']?.rich_text?.[0]?.plain_text || null,
      warrantyExpiration: props['Warranty Expiration']?.date?.start || null,
      powerDrawWatts: props['Power Draw in Watts']?.number ?? null,

      // Documentation
      notes: props['Notes']?.rich_text?.[0]?.plain_text || null,
      aiFieldNote: props['AI Field Note']?.rich_text?.[0]?.plain_text || null,
      photo: props['Photo']?.rich_text?.[0]?.plain_text || null,

      lastEdited: page.last_edited_time || null,
    };
  };

  ---
  7. Recommended Frontend-to-Notion CREATE Mapper

  For POST /api/bats in server.js:

  const mapAssetToNotionProperties = (ad) => {
    const properties = {
      // Title — ALWAYS required
      "Name": {
        title: [{ text: { content: ad.name } }]
      },
      // Required selects with safe defaults
      "Status": { select: { name: ad.status || "Available" } },
      "Asset Class": { select: { name: ad.assetClass || "Expensed (Section 179)" } },
      "Sync Status": { select: { name: ad.syncStatus || "Draft" } },
      "Primary User": { select: { name: ad.primaryUser || "DexterB" } },
    };

    // Optional scalars — only write when value provided
    if (ad.index != null)             properties["Index"]                = { number: parseInt(ad.index, 10) };
    if (ad.unitPrice != null)         properties["Unit Price"]           = { number: parseFloat(ad.unitPrice) };
    if (ad.manufacturer)              properties["Manufacturer"]         = { rich_text: [{ text: { content: ad.manufacturer } }] };
    if (ad.serialNumber)              properties["Serial Number"]        = { rich_text: [{ text: { content: ad.serialNumber } }] };
    if (ad.warrantyExpiration)        properties["Warranty Expiration"]  = { date: { start: ad.warrantyExpiration } };
    if (ad.powerDrawWatts != null)    properties["Power Draw in Watts"]  = { number: parseFloat(ad.powerDrawWatts) };
    if (ad.notes)                     properties["Notes"]                = { rich_text: [{ text: { content: ad.notes } }] };
    if (ad.aiFieldNote)               properties["AI Field Note"]        = { rich_text: [{ text: { content: ad.aiFieldNote } }] };
    if (ad.photo)                     properties["Photo"]                = { rich_text: [{ text: { content: ad.photo } }] };

    // Relations — require real Notion page IDs, skip if absent
    if (ad.categoryPageId)
      properties["Category"] = { relation: [{ id: ad.categoryPageId }] };
    if (ad.locationPageId)
      properties["Location"] = { relation: [{ id: ad.locationPageId }] };
    if (ad.projectPageIds?.length)
      properties["Projects"] = { relation: ad.projectPageIds.map(id => ({ id })) };
    if (ad.receiptPageId)
      properties["Receipt/Transaction"] = { relation: [{ id: ad.receiptPageId }] };

    return properties;
  };

  Receipt fields (date, totalPrice, qbTransactionId, sourceUrl) do not belong in this mapper. They belong to the Receipt/Transaction database and
  require a separate Phase 2 write flow: create/update a receipt record first, then link its page ID via receiptPageId.

  ---
  8. Recommended Update/PATCH Strategy

  Notion supports PATCH /v1/pages/{page_id} with a properties object.

  Route to add: PATCH /api/bats/:pageId in server.js

  PATCH /api/bats/:pageId
  Body: { assetData: { ...partial fields... } }
  Auth: requireAuth + role !== 'viewer'

  Rules:
  - Use the same mapAssetToNotionProperties() mapper, but only pass the fields that changed (undefined fields are omitted by the if guards already
  in place)
  - Never include formula fields (BAT, BATS URL, Tax Year, Merchant) in the write payload — they are computed by Notion
  - Relations are replaced, not appended — if the client sends projectPageIds, it must send the full desired array
  - Use Notion page ID (page.id) as the PATCH target, not the BAT formula string — the BAT string is read-only and not a valid page identifier for
  the API
  - The frontend should look up the page id from the GET response before issuing a PATCH

  ---
  9. Risks and Assumptions

  ┌─────┬────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │  #  │                                                           Risk / Assumption                                                            │
  ├─────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ 1   │ All current POST attempts likely fail silently or return Notion API errors because Asset Name (title key) does not match Name. Any     │
  │     │ records created may have empty titles. Need to verify in Notion.                                                                       │
  ├─────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ 2   │ Primary User is a select with one option (DexterB). If the form ever sends a value not in that option list, Notion will reject or      │
  │     │ create an ad-hoc option depending on API behavior. Add guard logic.                                                                    │
  ├─────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │     │ Index is never sent from the frontend today. Every new BAT record will show "PENDING" in the BAT formula until Index is set manually   │
  │ 3   │ in Notion. Wiring the index requires a GET of the Category DB to fetch Last Index rollup — this needs a new Express helper route or a  │
  │     │ Category lookup embedded in the POST flow.                                                                                             │
  ├─────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │     │ Category, Location, and Project relations use frontend mock IDs (cat1, loc1, prj1). These are not Notion page IDs and are silently     │
  │ 4   │ dropped by the current POST route. Wiring real relations requires a GET /api/bats/categories (and similar) route that queries the      │
  │     │ Notion Category/Location/Projects databases and returns { id, name, code } tuples. The frontend must replace mock arrays with live     │
  │     │ ones.                                                                                                                                  │
  ├─────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │     │ Receipt linking is a two-step operation. The current design attempts to write receipt fields directly onto the BATS record, but those  │
  │ 5   │ fields don't exist there. Phase 2 must either: (a) look up an existing receipt page ID by QB Transaction ID or date, or (b) create a   │
  │     │ new receipt record then link it by page ID.                                                                                            │
  ├─────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │     │ Photo is a Notion text property, not a file attachment — it stores a URL or text string. The frontend captures base64 image data,      │
  │ 6   │ which cannot go directly into a Notion text field at any reasonable size. Photo upload requires a separate storage step (e.g., upload  │
  │     │ to cloud storage, then save the URL string).                                                                                           │
  ├─────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ 7   │ The Manual Link property is a Notion file type, not a URL field. File uploads to Notion via API require the Notion file upload         │
  │     │ endpoint. This is a separate flow from the main BATS record creation.                                                                  │
  ├─────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ 8   │ The old schema export (748e7adb…) reflects a previous database design ("Baffle Asset Library") with different property names. It       │
  │     │ should be treated as historical only. The MCP fetch of 337056c8… is authoritative.                                                     │
  ├─────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ 9   │ Functional Check and Personal Transfer are UI-only state. They should be removed from the POST payload or ignored server-side. They    │
  │     │ should not be added to the Notion schema unless there is a specific reporting need.                                                    │
  ├─────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │     │ The frontend success handler shows NODE-{last4} and links to notion.so/{page_id}. Once the BAT formula works (Index + Category wired), │
  │ 10  │  the success response should instead return the resolved batId from a follow-up GET on the new page, and the link should be            │
  │     │ /bats/{batId}.                                                                                                                         │
  └─────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

  ---
  10. Files to Modify Later (Do Not Edit Now)

  ┌───────────────────────────┬─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │           File            │                                                What would change                                                │
  ├───────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │                           │ Fix GET mapper (7 property name and type errors); fix POST mapper (5 name errors, 4 type errors, remove 7       │
  │ server.js                 │ non-existent fields); rename mapNotionPageToAsset and mapAssetToNotionProperties as named helpers; add PATCH    │
  │                           │ /api/bats/:pageId route; add GET /api/bats/categories, GET /api/bats/locations lookup routes                    │
  ├───────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │                           │ Rename AssetData fields to match canonical payload (unitPrice, warrantyExpiration, powerDrawWatts,              │
  │ src/pages/BATS.tsx        │ categoryPageId, locationPageId, projectPageIds, receiptPageId); replace mock arrays with live API fetch from    │
  │                           │ lookup routes; remove functionalCheck and isPersonalTransfer from POST payload; update success handler to show  │
  │                           │ real BAT ID                                                                                                     │
  ├───────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ src/types/bats.ts (new,   │ Shared TypeScript interfaces: NotionAsset, AssetPayload, ReceiptPayload                                         │
  │ does not exist yet)       │                                                                                                                 │
  └───────────────────────────┴─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

  ---
  End of mapper plan. No files have been modified. No Notion records have been created, edited, or deleted.