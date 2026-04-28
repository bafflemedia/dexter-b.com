import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 1. Initialize Local Vault
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    : 'http://localhost:5173'
}));
app.use(express.json());

// ============================================================================
// 5. THE API PAYLOAD: Native REST Fetch
// ============================================================================
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
// 6. FRONTEND DELIVERY & FALLBACK ROUTING (BATS Fix)
// ============================================================================

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback routing: Any request that doesn't match an API route is sent to index.html
// This allows React Router to handle the URL (e.g., /bats)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// 7. Ignition
app.listen(PORT, () => {
  console.log(`[SYSTEM] Baffle Media Bridge active on port ${PORT}`);
  console.log(`[ENVIRONMENT] ${process.env.NODE_ENV || 'development'}`);
});