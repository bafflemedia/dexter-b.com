import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// --- STRICT TYPING DIRECTIVES ---

interface NotionProperty {
    title?: Array<{ plain_text: string }>;
    rich_text?: Array<{ plain_text: string }>;
    checkbox?: boolean;
    select?: { name: string };
    url?: string;
    number?: number;
}

interface NotionRow {
    id: string;
    properties: Record<string, NotionProperty>;
}

// 1. Initialize Local Vault 
dotenv.config();

// ES Module polyfill for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// Force HTTPS and WWW
app.use((req: Request, res: Response, next: NextFunction) => {
  const host = req.get('host') || '';
  const isHttps = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https';

  // Logic Scrub: If not HTTPS OR not starting with www., redirect to the clean URL
  // Note: If this fires in local dev, it will redirect localhost to dexter-b.com. 
  // Consider wrapping this in a `process.env.NODE_ENV === 'production'` check if needed.
  if (!isHttps || !host.startsWith('www.')) {
    return res.redirect(301, `https://www.dexter-b.com${req.url}`);
  }
  next();
});

// 3. Middleware
app.use(cors({
  origin: 'http://localhost:5173' // Match your Vite dev server port
}));
app.use(express.json());

// ============================================================================
// 4. THE API PAYLOAD: Native REST Fetch (The "SDK-Free" Bridge)
// ============================================================================
app.get('/api/manifest', async (req: Request, res: Response): Promise<void> => {
    try {
        const dbId = process.env.NOTION_MANIFEST_DB_ID;
        const secret = process.env.NOTION_SECRET_TOKEN;

        if (!dbId || !secret) {
            throw new Error('Missing Notion environmental variables in Local Vault.');
        }

        // Direct REST query to Notion's endpoint
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
                    status: {
                        equals: 'Active Signal'
                    }
                },
                sorts: [
                    { property: 'Sort Order', direction: 'ascending' },
                    { property: 'Created', direction: 'descending' }
                ]
            })
        });

        // Intercept API-level errors (401, 404, etc.)
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(`Notion API Rejected Request: ${errData.message}`);
        }

        const data = await response.json();

        // Map the raw response into our clean React-ready objects
        const cleanManifest = data.results.map((row: NotionRow) => {
            const props = row.properties;
            return {
                id: row.id,
                name: props['Title']?.title?.[0]?.plain_text || 'Unidentified Node',
                slug: props['Slug']?.rich_text?.[0]?.plain_text || row.id,
                spotlight: props['Spotlight']?.checkbox || false,
                category: props['Category']?.select?.name || 'Uncategorized',
                image: props['Image URL']?.url || null,
                amazon: props['Amazon']?.url || null,
                tiktok: props['TikTok']?.url || null,
                direct: props['Direct']?.url || null,
                copy: props['Copy']?.rich_text?.[0]?.plain_text || '',
                priority: props['Sort Order']?.number || 999
            };
        });

        res.json(cleanManifest);

    } catch (error) {
        // Terminal telemetry for debugging
        const errorMessage = error instanceof Error ? error.message : 'Unknown system failure';
        console.error('[SYSTEM FAILURE] Native Fetch Intercept:', errorMessage);
        res.status(500).json({ error: 'Failed to fetch Notion API data natively.' });
    }
});

// ============================================================================
// 5. PRODUCTION ROUTING: Hostinger Integration
// ============================================================================
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
}

// 6. Ignition
app.listen(PORT, () => {
    console.log(`[SYSTEM] Notion API Native Bridge active on port ${PORT}`);
    console.log(`[ENVIRONMENT] ${process.env.NODE_ENV === 'production' ? 'Production (Hostinger)' : 'Development (Local)'}`);
});