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

  // TEMPORARY TELEMETRY: Logs what the backend actually sees (remove before production)
  console.log(`[AUTH CHECK] Backend expects: ${process.env.PASS_DEXTERB}`);

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
    // Log the specific JWT failure
    console.warn(`[AUTH PERIMETER] Clearance rejected: ${err.message}`);
    
    // Return a generic, safe response to the client
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

// Protected route example: BATS operations (Requires Auth)
app.post('/api/notion/bats', requireAuth, async (req, res) => {
  // Role-based logic check
  if (req.user.role === 'viewer') {
    return res.status(403).json({ error: 'Clearance level insufficient for write access.' });
  }

  // Insert your Notion POST fetch logic here for BATS additions
  res.json({ message: `Access granted to BATS database for ${req.user.username}` });
});

// ============================================================================
// 7. FRONTEND DELIVERY & FALLBACK ROUTING (BATS Fix)
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