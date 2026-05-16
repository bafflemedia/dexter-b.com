• Mapper Plan

  Read-only inspection completed. I did not edit code or mutate Notion. I inspected database metadata only, not BATS page content.

  1. Current Notion BATS property names and types

  Database found: BATS - Asset Registry
  This appears to be the BATS database matching “Baffle Asset Tag System”; the exact Notion title is not BATS - Baffle Asset Tag System.

  | Property | Type |
  |---|---|
  | AI Field Note | text |
  | Asset Class | select |
  | BAT | formula |
  | BATS URL | formula |
  | Category | relation |
  | Index | number |
  | Location | relation |
  | Manual Link | file |
  | Manufacturer | text |
  | Merchant | rollup |
  | Name | title |
  | Notes | text |
  | Photo | text |
  | Power Draw in Watts | number |
  | Primary User | select |
  | Projects | relation |
  | Receipt/Transaction | relation |
  | Serial Number | text |
  | Status | select |
  | Sync Status | select |
  | Tax Year | formula |
  | Unit Price | number |
  | Warranty Expiration | date |

  2. Current frontend form fields found

  In /C:/Development/dexter-b.com/src/pages/BATS.tsx:16, AssetData currently contains:

  name, categoryId, locationId, projectIds, index, assetClass, status, price, serialNumber, manufacturer, warrantyExp, powerDraw, notes,
  aiFieldNote, primaryUser, syncStatus, isPersonalTransfer, manualLink, referenceVideoUrl, functionalCheck, photoGallery.

  ReceiptData contains:

  id, merchantId, date, totalPrice, qbTransactionId, sourceUrl.

  The live submit shape is currently:

  {
    assetData: asset,
    receiptData: receipt
  }

  There is no src/api/bats helper directory or API wrapper. The page calls fetch('/api/bats') directly.

  3. Current server.js /api/bats mapping behavior

  In /C:/Development/dexter-b.com/server.js:180, GET /api/bats:

  - Requires requireAuth.
  - Queries process.env.NOTION_BATS_DB_ID.
  - Maps each Notion page to a frontend object.
  - Uses outdated property names:
      - BAT ID
      - Asset Name
      - Price
      - Warranty Exp
      - Power Draw
      - Functional Check
      - Personal Transfer
  - Some of those properties do not exist in the current Notion schema.

  In /C:/Development/dexter-b.com/server.js:252, POST /api/bats:

  - Requires requireAuth.
  - Blocks users with role viewer.
  - Expects { assetData, receiptData }.
  - Requires assetData.name.
  - Attempts to create a Notion page.
  - Uses outdated or nonexistent Notion property names:
      - Asset Name
      - Functional Check
      - Personal Transfer
      - Reference Video URL
      - Warranty Exp
      - Price
      - Power Draw
      - Transaction Date
      - Receipt Total
      - QB Transaction ID
      - Receipt URL

  Auth middleware in /C:/Development/dexter-b.com/server.js:96 reads the baffle_auth HttpOnly cookie and verifies it with JWT_SECRET.

  4. Mismatches between frontend payload, Express route, and Notion schema

  Primary schema-name mismatches:

  | Frontend / server concept | Server currently writes/reads | Actual Notion property |
  |---|---|---|
  | asset name | Asset Name | Name |
  | generated BAT ID | BAT ID | BAT |
  | unit price | Price | Unit Price |
  | warranty expiration | Warranty Exp | Warranty Expiration |
  | power draw | Power Draw | Power Draw in Watts |
  | primary user | rich text | Primary User is select |
  | category | skipped/read inconsistently | Category is relation |
  | location | skipped/read inconsistently | Location is relation |
  | projects | skipped | Projects is relation |
  | receipt | receipt scalar fields | Receipt/Transaction relation |
  | BATS URL | locally derived | BATS URL formula |
  | tax year | not mapped | Tax Year formula |
  | photo | frontend photoGallery[] | Photo text |
  | manual link | frontend optional string | Manual Link file |

  Frontend-only fields with no current Notion property:

  referenceVideoUrl, functionalCheck, isPersonalTransfer, receipt.date, receipt.totalPrice, receipt.qbTransactionId, receipt.sourceUrl,
  receipt.merchantId.

  Notion-only fields not cleanly represented in frontend:

  BAT, BATS URL, Merchant, Tax Year, Receipt/Transaction, Manual Link.

  5. Recommended canonical frontend payload shape

  Use one canonical payload with field names matching app semantics, not Notion property names:

  {
    name: string,
    categoryPageId?: string,
    locationPageId?: string,
    projectPageIds?: string[],
    receiptTransactionPageId?: string,
    index?: number,
    assetClass: 'Expensed (Section 179)' | 'Capitalized' | 'Consumable',
    status: 'Available' | 'In Use' | 'Maintenance' | 'Retired',
    unitPrice?: number,
    serialNumber?: string,
    manufacturer?: string,
    warrantyExpiration?: string,
    powerDrawWatts?: number,
    notes?: string,
    aiFieldNote?: string,
    primaryUser?: 'DexterB',
    syncStatus?: 'Draft' | 'Manual Uploaded' | 'AI Ready',
    photo?: string
  }

  Keep receipt creation out of this mapper for v1 unless a separate approved Receipts route exists. BATS should link to an existing Receipt/
  Transaction relation by Notion page ID.

  6. Recommended Notion-to-frontend mapper shape

  Return an internal-safe BATS asset DTO:

  {
    id: string,
    notionPageId: string,
    bat: string | null,
    batsUrl: string | null,
    name: string,
    categoryIds: string[],
    locationIds: string[],
    projectIds: string[],
    receiptTransactionIds: string[],
    index: number | null,
    assetClass: string | null,
    status: string | null,
    unitPrice: number | null,
    serialNumber: string | null,
    manufacturer: string | null,
    warrantyExpiration: string | null,
    powerDrawWatts: number | null,
    notes: string | null,
    aiFieldNote: string | null,
    primaryUser: string | null,
    syncStatus: string | null,
    photo: string | null,
    taxYear: string | number | null,
    merchant: unknown | null,
    lastEdited: string | null
  }

  Use relation IDs initially. Resolve relation display names later through controlled backend lookups, not React-to-Notion calls.

  7. Recommended frontend-to-Notion create mapper shape

  Map canonical payload to Notion properties:

  {
    "Name": title(name),
    "Category": relation(categoryPageId),
    "Location": relation(locationPageId),
    "Projects": relationArray(projectPageIds),
    "Receipt/Transaction": relation(receiptTransactionPageId),
    "Index": number(index),
    "Asset Class": select(assetClass),
    "Status": select(status),
    "Unit Price": number(unitPrice),
    "Serial Number": richText(serialNumber),
    "Manufacturer": richText(manufacturer),
    "Warranty Expiration": date(warrantyExpiration),
    "Power Draw in Watts": number(powerDrawWatts),
    "Notes": richText(notes),
    "AI Field Note": richText(aiFieldNote),
    "Primary User": select(primaryUser),
    "Sync Status": select(syncStatus),
    "Photo": richText(photo)
  }

  Do not attempt to write formulas or rollups:

  BAT, BATS URL, Tax Year, Merchant.

  Do not write unsupported frontend fields unless the schema is intentionally extended later.

  8. Recommended update/PATCH strategy

  Add a protected PATCH /api/bats/:pageId later, with role write guard matching POST.

  Strategy:

  - Accept the same canonical asset payload, preferably partial.
  - Whitelist writable fields only.
  - Ignore or reject formula/rollup/system fields.
  - Convert only provided keys into Notion property updates.
  - Treat empty strings explicitly:
      - For text: clear with empty rich_text array if intentional.
      - For relation: clear with empty relation array if intentional.
      - For number/date/select: set null only if Notion API supports the intended clear operation and the UI explicitly requests it.
  - Never identify pages by serial number or asset name.
  - For public /bats/:batId route support, use BAT formula lookup server-side, but updates should still target Notion page IDs after lookup.

  9. Risks and assumptions

  - Assumption: BATS - Asset Registry is the intended BATS database despite the user-facing phrase “BATS - Baffle Asset Tag System.”
  - Current POST likely fails against Notion because it writes nonexistent properties like Asset Name, Price, and Warranty Exp.
  - Primary User is currently a Notion select, but server writes rich text.
  - Frontend mock IDs like cat1, loc1, prj1 are not Notion page IDs and cannot be used for relation writes.
  - Receipt creation is not supported by the current BATS schema; BATS links to Receipt/Transaction.
  - The current frontend logs the full payload before POST. That may expose serial numbers in browser console during live use and should be removed
    later.
  - Photo is text in Notion, while frontend stores base64-like gallery data. Storing image blobs in text is not a good long-term shape.
  - Manual Link is a Notion file property and should not be treated as a plain string without a deliberate upload/link strategy.

  10. Exact files I would modify later

  - /C:/Development/dexter-b.com/server.js:180
    Fix BATS GET/POST mappers, add helper functions for Notion property extraction/building, and later add PATCH /api/bats/:pageId.
  - /C:/Development/dexter-b.com/src/pages/BATS.tsx:16
    Align frontend state/payload names with the canonical DTO, remove unsupported fields or mark them UI-only, stop logging sensitive payloads, and
    prepare relation IDs for real Notion relations.
  - Optional new file later: src/api/bats.ts
    Add a small frontend API wrapper so BATS.tsx does not own raw fetch details.
  - Optional new backend mapper module later: server/notionBatsMapper.js or similar
    Only if server.js becomes too crowded; for the smallest v1, keeping mapper helpers inside server.js is acceptable.