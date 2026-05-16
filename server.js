import express from 'express';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs'; // INJECTED: File System module

// 1. Initialize Local Vault (The Fix)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly check for .env.local first, fallback to .env
if (fs.existsSync(path.join(__dirname, '.env.local'))) {
  dotenv.config({ path: '.env.local' });
  console.log('[SYSTEM] Loaded vault: .env.local');
} else {
  dotenv.config();
  console.log('[SYSTEM] Loaded vault: .env');
}

// 2. Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// 3. PRODUCTION GUARD: HTTPS & WWW Redirect
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    const host = req.get('host') || '';
    const isHttps = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https';

    if (!isHttps || !host.startsWith('www.')) {
      return res.redirect(301, `https://www.dexter-b.com${req.url}`);
    }
    next();
  });
}

// 4. Middleware Configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://www.dexter-b.com' 
    : 'http://localhost:5173',
  credentials: true // CRITICAL: Required to send/receive HttpOnly cookies
}));
app.use(express.json());
app.use(cookieParser()); // Intercepts and parses incoming cookies

// ============================================================================
// 5. THE GATEKEEPER: JWT Auth & Tiered Access
// ============================================================================

// User credentials mapped to roles (passwords injected via environment variables)
const USERS = [
  { username: 'dexterb', password: process.env.PASS_DEXTERB, role: 'guardian' },
  { username: 'kate', password: process.env.PASS_KATE, role: 'collaborator' },
  { username: 'iliana', password: process.env.PASS_ILIANA, role: 'viewer' }
];

// Login route: Validates credentials and issues a JWT
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  const user = USERS.find(u => u.username === username && u.password === password);
  
  if (!user) {
    return res.status(401).json({ error: 'Signal rejected: Invalid credentials.' });
  }

  // Mint the JWT with the user's role
  const token = jwt.sign(
    { username: user.username, role: user.role }, 
    process.env.JWT_SECRET, 
    { expiresIn: '12h' } 
  );

  // Secure the token in an HttpOnly cookie
  res.cookie('baffle_auth', token, {
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production', 
    sameSite: 'strict', 
    maxAge: 12 * 60 * 60 * 1000 // 12 hours
  });

  res.json({ message: 'Authentication successful', user: { username: user.username, role: user.role } });
});

// Logout route: Clears the session cookie
app.post('/api/logout', (req, res) => {
  res.clearCookie('baffle_auth');
  res.json({ message: 'Comm link severed. Logged out.' });
});

// Authorization middleware: Verifies JWT for protected routes
const requireAuth = (req, res, next) => {
  const token = req.cookies.baffle_auth;

  if (!token) {
    return res.status(401).json({ error: 'Perimeter Breach: No clearance badge provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next(); 
  } catch (err) {
    console.warn(`[AUTH PERIMETER] Clearance rejected: ${err.message}`);
    return res.status(403).json({ error: 'Access Denied: Invalid or expired clearance.' });
  }
};

// ============================================================================
// 6. THE API PAYLOAD: Native REST Fetch
// ============================================================================

// Public Route (No auth required)
app.get('/api/manifest', async (req, res) => {
  try {
    const dbId = process.env.NOTION_MANIFEST_DB_ID;
    const secret = process.env.NOTION_SECRET_TOKEN;

    if (!dbId || !secret) {
      throw new Error('Intelligence mismatch: Missing Notion environmental variables.');
    }

    const response = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secret}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filter: {
          property: 'Web Status',
          status: { equals: 'Active Signal' }
        },
        sorts: [
          { property: 'Sort Order', direction: 'ascending' },
          { property: 'Created', direction: 'descending' }
        ]
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(`Notion API Rejected Request: ${errData.message}`);
    }

    const data = await response.json();

    const cleanManifest = data.results.map((row) => {
      const props = row.properties;
      return {
        id: row.id,
        name: props['Title']?.title?.[0]?.plain_text || 'Unidentified Node',
        slug: props['Slug']?.rich_text?.[0]?.plain_text || row.id,
        spotlight: props['Spotlight']?.checkbox || false,
        category: props['Category']?.select?.name || 'Uncategorized',
        image: props['Image URL']?.url || null,
        amazon: props['Amazon']?.url || null,
        direct: props['Direct']?.url || null,
        copy: props['Copy']?.rich_text?.[0]?.plain_text || '',
        priority: props['Sort Order']?.number || 999
      };
    });

    res.json(cleanManifest);

  } catch (error) {
    console.error('[SYSTEM FAILURE] Native Fetch Intercept:', error.message);
    res.status(500).json({ error: 'Failed to fetch Notion API data natively.' });
  }
});

// ============================================================================
// BATS MAPPER HELPERS
// ============================================================================

const mapNotionPageToAsset = (page) => {
  const props = page.properties;
  return {
    id: page.id,
    batId:   props['BAT']?.formula?.string || null,
    batsUrl: props['BATS URL']?.formula?.string || null,

    name:    props['Name']?.title?.[0]?.plain_text || 'Unidentified Asset',
    index:   props['Index']?.number ?? null,
    taxYear: props['Tax Year']?.formula?.number || null,

    status:      props['Status']?.select?.name || null,
    assetClass:  props['Asset Class']?.select?.name || null,
    primaryUser: props['Primary User']?.select?.name || null,
    syncStatus:  props['Sync Status']?.select?.name || null,

    categoryIds:           props['Category']?.relation?.map(r => r.id) || [],
    locationIds:           props['Location']?.relation?.map(r => r.id) || [],
    projectIds:            props['Projects']?.relation?.map(r => r.id) || [],
    receiptTransactionIds: props['Receipt/Transaction']?.relation?.map(r => r.id) || [],
    merchantName:          props['Merchant']?.rollup?.array?.[0]?.title?.[0]?.plain_text || null,

    unitPrice:          props['Unit Price']?.number ?? null,
    manufacturer:       props['Manufacturer']?.rich_text?.[0]?.plain_text || null,
    serialNumber:       props['Serial Number']?.rich_text?.[0]?.plain_text || null,
    warrantyExpiration: props['Warranty Expiration']?.date?.start || null,
    powerDrawWatts:     props['Power Draw in Watts']?.number ?? null,

    notes:       props['Notes']?.rich_text?.[0]?.plain_text || null,
    aiFieldNote: props['AI Field Note']?.rich_text?.[0]?.plain_text || null,
    photo:       props['Photo']?.rich_text?.[0]?.plain_text || null,

    lastEdited: page.last_edited_time || null,
  };
};

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

// ---------------------------------------------------------
// GET: Retrieve BATS Inventory (Protected Read Bridge)
// ---------------------------------------------------------
app.get('/api/bats', requireAuth, async (req, res) => {
  try {
    const dbId = process.env.NOTION_BATS_DB_ID;
    const secret = process.env.NOTION_SECRET_TOKEN;

    if (!dbId || !secret) {
      throw new Error('Intelligence mismatch: Missing Notion environmental variables for BATS.');
    }

    const response = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secret}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({}) // Future iteration: Add filtering for specific categories/status
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Notion API GET Error:', errorData);
      return res.status(response.status).json({ error: 'Failed to retrieve BATS data' });
    }
    
    const data = await response.json();

    const cleanAssets = data.results.map(mapNotionPageToAsset);

    res.json(cleanAssets);
  } catch (error) {
    console.error('BATS Express GET Exception:', error.message);
    res.status(500).json({ error: 'Internal Server Error fetching BATS database' });
  }
});

// ---------------------------------------------------------
// POST: Add new BATS Item (Protected Write Bridge)
// ---------------------------------------------------------
app.post('/api/bats', requireAuth, async (req, res) => {
  // Role-based logic check: Reject write access for viewers
  if (req.user.role === 'viewer') {
    return res.status(403).json({ error: 'Clearance level insufficient for write access.' });
  }

  const { assetData: ad = {} } = req.body;

  if (!ad.name) {
    return res.status(400).json({ error: 'Asset Name is required.' });
  }

  const properties = mapAssetToNotionProperties(ad);

  try {
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_SECRET_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        parent: { database_id: process.env.NOTION_BATS_DB_ID },
        properties
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Notion API POST Error:', errorData);
      return res.status(response.status).json({ error: 'Failed to write to BATS database' });
    }
    
    const data = await response.json();
    res.status(201).json({ message: 'Asset logged successfully', page_id: data.id });
  } catch (error) {
    console.error('BATS Express POST Exception:', error.message);
    res.status(500).json({ error: 'Internal Server Error writing to BATS database' });
  }
});

// ---------------------------------------------------------
// PATCH: Update a BATS Asset (Protected Write Bridge)
// ---------------------------------------------------------
app.patch('/api/bats/:pageId', requireAuth, async (req, res) => {
  if (req.user.role === 'viewer') {
    return res.status(403).json({ error: 'Clearance level insufficient for write access.' });
  }

  const { pageId } = req.params;
  const { assetData: ad } = req.body;
  if (!ad || typeof ad !== 'object') {
    return res.status(400).json({ error: 'assetData required.' });
  }

  const props = {};

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
  if (ad.powerDrawWatts != null)
    props["Power Draw in Watts"] = { number: parseFloat(ad.powerDrawWatts) };

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

  // Date: undefined = unchanged, null = clear
  if (ad.warrantyExpiration !== undefined)
    props["Warranty Expiration"] = ad.warrantyExpiration ? { date: { start: ad.warrantyExpiration } } : { date: null };

  // Relations: empty array clears, undefined = unchanged
  if (ad.categoryPageId !== undefined)
    props["Category"] = { relation: ad.categoryPageId ? [{ id: ad.categoryPageId }] : [] };
  if (ad.locationPageId !== undefined)
    props["Location"] = { relation: ad.locationPageId ? [{ id: ad.locationPageId }] : [] };
  if (ad.projectPageIds !== undefined)
    props["Projects"] = { relation: (ad.projectPageIds || []).map(id => ({ id })) };
  if (ad.receiptTransactionPageId !== undefined)
    props["Receipt/Transaction"] = { relation: ad.receiptTransactionPageId ? [{ id: ad.receiptTransactionPageId }] : [] };

  try {
    const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_SECRET_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ properties: props })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Notion API PATCH Error:', errorData);
      return res.status(response.status).json({ error: 'Failed to update BATS record' });
    }

    const data = await response.json();
    res.json({ id: data.id });
  } catch (error) {
    console.error('BATS Express PATCH Exception:', error.message);
    res.status(500).json({ error: 'Internal Server Error updating BATS record' });
  }
});

// ============================================================================
// 7. FRONTEND DELIVERY & FALLBACK ROUTING
// ============================================================================

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback routing: Any request that doesn't match an API route is sent to index.html
// This allows React Router to handle the URL (e.g., /bats)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// 8. Ignition
app.listen(PORT, () => {
  console.log(`[SYSTEM] Baffle Media Bridge active on port ${PORT}`);
  console.log(`[ENVIRONMENT] ${process.env.NODE_ENV || 'development'}`);
});