Unified BATS Mapper Implementation Plan
1. Where Both Plans Agree
Both plans independently reached identical conclusions on every critical finding:

Notion property name corrections required: Asset Name → Name, BAT ID → BAT, Price → Unit Price, Warranty Exp → Warranty Expiration, Power Draw → Power Draw in Watts
Primary User must be read/written as select, not rich_text
Category, Location, Projects are relation types, not select — the current accessor is always null
functionalCheck, isPersonalTransfer, referenceVideoUrl do not exist in the live Notion schema — writing them causes Notion API rejection
Receipt fields (date, totalPrice, qbTransactionId, sourceUrl) belong in a separate Receipt/Transaction database, not on a BATS page — writing them to BATS silently fails
Phase 1 receipt strategy: link an existing receipt by Notion page ID only; creating new receipt records is Phase 2
BAT, BATS URL, Tax Year, Merchant are formula/rollup — never write them
Photo is a Notion text field storing a URL string, not a file attachment
Manual Link is a Notion file property requiring a separate upload flow
Index must be written for the BAT formula to resolve; new records show PENDING without it
Mock IDs (cat1, loc1, prj1) are not Notion page IDs and are silently dropped
Files to modify: server.js and src/pages/BATS.tsx
PATCH must target Notion page ID; formulas/rollups are excluded from the write payload
2. Where They Disagree and the Safer Choice
Topic	Claude plan	Codex plan	Chosen (safer)
POST payload structure	Nested { assetData, receiptData }	Flat single object	Nested assetData only — keeps existing backend contract, requires fewer changes; drop the receiptData object entirely for v1 since its fields don't belong on BATS
Receipt field name in payload	receiptPageId	receiptTransactionPageId	receiptTransactionPageId — matches the Notion property name "Receipt/Transaction" exactly, avoids ambiguity
Receipt field name in read DTO	receiptIds	receiptTransactionIds	receiptTransactionIds — same reasoning
Read DTO: BAT formula field	batId	bat	batId — clearer that it is the computed identifier string
Read DTO: redundant page ID	Only id	Both id and notionPageId	Only id — notionPageId is redundant with id
Merchant field in read DTO	merchantName: string | null (resolved)	merchant: unknown | null (raw)	merchantName: string | null — extracts the plain text string from the rollup array; don't expose raw Notion structure to the frontend
batsUrl fallback in read	Falls back to /bats/${batId} or /bats/${page.id}	Returns null when formula is empty	Return null — the fallback to page.id would produce a broken URL before Index is set; surface the absence honestly
Optional new files (v1)	src/types/bats.ts required	src/api/bats.ts + server/notionBatsMapper.js optional	src/types/bats.ts only for v1 — TypeScript interfaces prevent re-introducing type mismatches; frontend API wrapper and backend mapper module are deferred
PATCH: clearing empty values	Mentions relation replacement only	Explicit rules for clearing text, number, date, select	Codex's explicit clearing rules — more complete and prevents accidental data corruption
Console.log risk	Not mentioned	Flags that frontend logs full payload (exposes serial numbers)	Include as a fix — remove or redact the pre-POST console.log
3. Final Canonical Frontend Payload Shape
The receiptData object is removed for v1. The receipt relation link moves into assetData. Fields that are UI-only are excluded from the POST body.


// POST /api/bats
// PATCH /api/bats/:pageId (same shape, all fields optional)
{
  assetData: {
    // Required on create
    name: string;

    // Relations — must be real Notion page IDs from lookup routes
    categoryPageId?: string;
    locationPageId?: string;
    projectPageIds?: string[];
    receiptTransactionPageId?: string;

    // Classification
    assetClass?: string;        // "Expensed (Section 179)" | "Capitalized" | "Consumable"
    status?: string;            // "Available" | "In Use" | "Maintenance" | "Retired"
    primaryUser?: string;       // "DexterB"
    syncStatus?: string;        // "Draft" | "Manual Uploaded" | "AI Ready"

    // Numbering (drives BAT formula)
    index?: number;

    // Specs
    manufacturer?: string;
    serialNumber?: string;
    unitPrice?: number;
    warrantyExpiration?: string;  // ISO date string e.g. "2026-12-31"
    powerDrawWatts?: number;

    // Documentation
    notes?: string;
    aiFieldNote?: string;
    photo?: string;               // URL string only; base64 requires a separate upload step
  }
}

// UI-only fields — NOT included in any POST/PATCH body:
//   isPersonalTransfer  (drives form UI mode; no Notion field)
//   functionalCheck     (pre-flight check; no Notion field)
//   referenceVideoUrl   (no Notion field yet; defer)
//   manualLink          (Notion file type; separate upload flow)
//   photoGallery        (base64 blob; separate upload flow)
4. Final Notion Read Mapper (GET)
For server.js, replace the existing inline mapping inside GET /api/bats:


const mapNotionPageToAsset = (page) => {
  const props = page.properties;
  return {
    id: page.id,
    batId:   props['BAT']?.formula?.string || null,
    batsUrl: props['BATS URL']?.formula?.string || null,

    name:     props['Name']?.title?.[0]?.plain_text || 'Unidentified Asset',
    index:    props['Index']?.number ?? null,
    taxYear:  props['Tax Year']?.formula?.number || null,

    status:      props['Status']?.select?.name || null,
    assetClass:  props['Asset Class']?.select?.name || null,
    primaryUser: props['Primary User']?.select?.name || null,
    syncStatus:  props['Sync Status']?.select?.name || null,

    categoryIds:           props['Category']?.relation?.map(r => r.id) || [],
    locationIds:           props['Location']?.relation?.map(r => r.id) || [],
    projectIds:            props['Projects']?.relation?.map(r => r.id) || [],
    receiptTransactionIds: props['Receipt/Transaction']?.relation?.map(r => r.id) || [],
    merchantName:          props['Merchant']?.rollup?.array?.[0]?.title?.[0]?.plain_text || null,

    unitPrice:           props['Unit Price']?.number ?? null,
    manufacturer:        props['Manufacturer']?.rich_text?.[0]?.plain_text || null,
    serialNumber:        props['Serial Number']?.rich_text?.[0]?.plain_text || null,
    warrantyExpiration:  props['Warranty Expiration']?.date?.start || null,
    powerDrawWatts:      props['Power Draw in Watts']?.number ?? null,

    notes:       props['Notes']?.rich_text?.[0]?.plain_text || null,
    aiFieldNote: props['AI Field Note']?.rich_text?.[0]?.plain_text || null,
    photo:       props['Photo']?.rich_text?.[0]?.plain_text || null,

    lastEdited: page.last_edited_time || null,
  };
};
5. Final Notion Create Mapper (POST)
For server.js, replace the existing inline POST /api/bats property block:


const mapAssetToNotionProperties = (ad) => {
  const props = {
    "Name":         { title: [{ text: { content: ad.name } }] },
    "Status":       { select: { name: ad.status || 'Available' } },
    "Asset Class":  { select: { name: ad.assetClass || 'Expensed (Section 179)' } },
    "Sync Status":  { select: { name: ad.syncStatus || 'Draft' } },
    "Primary User": { select: { name: ad.primaryUser || 'DexterB' } },
  };

  if (ad.index != null)
    props["Index"] = { number: parseInt(ad.index, 10) };
  if (ad.unitPrice != null)
    props["Unit Price"] = { number: parseFloat(ad.unitPrice) };
  if (ad.manufacturer)
    props["Manufacturer"] = { rich_text: [{ text: { content: ad.manufacturer } }] };
  if (ad.serialNumber)
    props["Serial Number"] = { rich_text: [{ text: { content: ad.serialNumber } }] };
  if (ad.warrantyExpiration)
    props["Warranty Expiration"] = { date: { start: ad.warrantyExpiration } };
  if (ad.powerDrawWatts != null)
    props["Power Draw in Watts"] = { number: parseFloat(ad.powerDrawWatts) };
  if (ad.notes)
    props["Notes"] = { rich_text: [{ text: { content: ad.notes } }] };
  if (ad.aiFieldNote)
    props["AI Field Note"] = { rich_text: [{ text: { content: ad.aiFieldNote } }] };
  if (ad.photo)
    props["Photo"] = { rich_text: [{ text: { content: ad.photo } }] };

  if (ad.categoryPageId)
    props["Category"] = { relation: [{ id: ad.categoryPageId }] };
  if (ad.locationPageId)
    props["Location"] = { relation: [{ id: ad.locationPageId }] };
  if (ad.projectPageIds?.length)
    props["Projects"] = { relation: ad.projectPageIds.map(id => ({ id })) };
  if (ad.receiptTransactionPageId)
    props["Receipt/Transaction"] = { relation: [{ id: ad.receiptTransactionPageId }] };

  return props;
};
Never write: BAT, BATS URL, Tax Year, Merchant, Functional Check, Personal Transfer, Reference Video URL, Transaction Date, Receipt Total, QB Transaction ID, Receipt URL.

6. Final PATCH/Update Mapper
Add PATCH /api/bats/:pageId to server.js:


// PATCH /api/bats/:pageId
router.patch('/api/bats/:pageId', requireAuth, (req, res) => {
  if (req.user.role === 'viewer') return res.status(403).json({ error: 'Forbidden' });

  const { pageId } = req.params;
  const { assetData: ad } = req.body;
  if (!ad || typeof ad !== 'object') return res.status(400).json({ error: 'assetData required' });

  const props = {};

  // Only write keys that were explicitly provided
  if (ad.name != null)
    props["Name"] = { title: [{ text: { content: ad.name } }] };
  if (ad.status != null)
    props["Status"] = { select: { name: ad.status } };
  if (ad.assetClass != null)
    props["Asset Class"] = { select: { name: ad.assetClass } };
  if (ad.syncStatus != null)
    props["Sync Status"] = { select: { name: ad.syncStatus } };
  if (ad.primaryUser != null)
    props["Primary User"] = { select: { name: ad.primaryUser } };
  if (ad.index != null)
    props["Index"] = { number: parseInt(ad.index, 10) };
  if (ad.unitPrice != null)
    props["Unit Price"] = { number: parseFloat(ad.unitPrice) };

  // Text fields: empty string clears the field
  if (ad.manufacturer != null)
    props["Manufacturer"] = { rich_text: ad.manufacturer ? [{ text: { content: ad.manufacturer } }] : [] };
  if (ad.serialNumber != null)
    props["Serial Number"] = { rich_text: ad.serialNumber ? [{ text: { content: ad.serialNumber } }] : [] };
  if (ad.notes != null)
    props["Notes"] = { rich_text: ad.notes ? [{ text: { content: ad.notes } }] : [] };
  if (ad.aiFieldNote != null)
    props["AI Field Note"] = { rich_text: ad.aiFieldNote ? [{ text: { content: ad.aiFieldNote } }] : [] };
  if (ad.photo != null)
    props["Photo"] = { rich_text: ad.photo ? [{ text: { content: ad.photo } }] : [] };

  // Date: null clears the field
  if (ad.warrantyExpiration !== undefined)
    props["Warranty Expiration"] = ad.warrantyExpiration ? { date: { start: ad.warrantyExpiration } } : { date: null };

  // Relations: sending empty array clears the relation
  if (ad.categoryPageId !== undefined)
    props["Category"] = { relation: ad.categoryPageId ? [{ id: ad.categoryPageId }] : [] };
  if (ad.locationPageId !== undefined)
    props["Location"] = { relation: ad.locationPageId ? [{ id: ad.locationPageId }] : [] };
  if (ad.projectPageIds !== undefined)
    props["Projects"] = { relation: (ad.projectPageIds || []).map(id => ({ id })) };
  if (ad.receiptTransactionPageId !== undefined)
    props["Receipt/Transaction"] = { relation: ad.receiptTransactionPageId ? [{ id: ad.receiptTransactionPageId }] : [] };

  // Use Notion page ID as PATCH target — never the BAT formula string
  notion.pages.update({ page_id: pageId, properties: props })
    .then(page => res.json({ id: page.id }))
    .catch(err => res.status(500).json({ error: err.message }));
});
7. TypeScript Interfaces (new file)
New file: src/types/bats.ts


export interface BatsAsset {
  id: string;
  batId: string | null;
  batsUrl: string | null;
  name: string;
  index: number | null;
  taxYear: number | null;
  status: string | null;
  assetClass: string | null;
  primaryUser: string | null;
  syncStatus: string | null;
  categoryIds: string[];
  locationIds: string[];
  projectIds: string[];
  receiptTransactionIds: string[];
  merchantName: string | null;
  unitPrice: number | null;
  manufacturer: string | null;
  serialNumber: string | null;
  warrantyExpiration: string | null;
  powerDrawWatts: number | null;
  notes: string | null;
  aiFieldNote: string | null;
  photo: string | null;
  lastEdited: string | null;
}

export interface AssetPayload {
  name: string;
  categoryPageId?: string;
  locationPageId?: string;
  projectPageIds?: string[];
  receiptTransactionPageId?: string;
  index?: number;
  assetClass?: string;
  status?: string;
  primaryUser?: string;
  syncStatus?: string;
  manufacturer?: string;
  serialNumber?: string;
  unitPrice?: number;
  warrantyExpiration?: string;
  powerDrawWatts?: number;
  notes?: string;
  aiFieldNote?: string;
  photo?: string;
}
8. Exact Files to Modify
File	What changes
server.js	Replace inline GET mapper with mapNotionPageToAsset; replace inline POST mapper with mapAssetToNotionProperties; add PATCH /api/bats/:pageId route; remove all writes to non-existent Notion properties
src/pages/BATS.tsx	Rename AssetData fields to match canonical payload (unitPrice, warrantyExpiration, powerDrawWatts, categoryPageId, locationPageId, projectPageIds, receiptTransactionPageId); remove functionalCheck, isPersonalTransfer, referenceVideoUrl from POST body; remove receiptData object from POST body; remove pre-POST console.log
src/types/bats.ts	New file. BatsAsset and AssetPayload interfaces
Do not modify any other files yet. Lookup routes for categories/locations are Phase 2.

9. Implementation Order
Create src/types/bats.ts — establishes the contract before any code changes; no runtime risk
Fix server.js GET mapper — read-only change; fixes null fields in the asset list without touching create logic
Fix server.js POST mapper — correct property names and types, remove non-existent fields; this is the change most likely to unblock Notion record creation
Add PATCH /api/bats/:pageId to server.js — additive new route; no risk to existing endpoints
Update src/pages/BATS.tsx — rename payload fields to match the canonical shape, remove receiptData from POST body, remove console.log; do this last so backend is ready to accept the corrected payload before the frontend starts sending it
10. Test Steps
After step 2 (GET mapper fix):

Authenticate and call GET /api/bats
Verify batId is populated (not null) for records that have Index set
Verify primaryUser returns a string (was always null before)
Verify unitPrice, warrantyExpiration, powerDrawWatts are populated where Notion has values
Verify categoryIds, locationIds return arrays of UUID strings, not empty arrays
After step 3 (POST mapper fix):

Submit a minimal create: { assetData: { name: "Test Asset", status: "Available", assetClass: "Consumable", syncStatus: "Draft" } }
Confirm the Express route returns 200 with a page ID (not a Notion API error)
Open the Notion record directly and confirm: Name is set, Status/Asset Class/Sync Status/Primary User are set as selects
Confirm no properties named Asset Name, Price, Warranty Exp, Power Draw, Functional Check, Personal Transfer, Reference Video URL appear on the new record
Delete the test record from Notion
After step 4 (PATCH route):

Use the page ID from the GET response for an existing record
Send PATCH /api/bats/:pageId with { assetData: { notes: "Updated note" } }
Confirm only Notes changed in Notion; other fields unchanged
Send with { assetData: { warrantyExpiration: null } } and confirm the date field clears
After step 5 (frontend update):

Submit the form in the browser
Confirm no browser console errors about unrecognized fields
Confirm no pre-submit console.log output containing serial number or other sensitive fields
Confirm the success handler receives a valid page ID
