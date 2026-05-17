// @vitest-environment node
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.PASS_DEXTERB = 'guardian-pass';
process.env.PASS_KATE = 'collaborator-pass';
process.env.PASS_ILIANA = 'viewer-pass';
process.env.NOTION_SECRET_TOKEN = 'test-notion-token';
process.env.NOTION_BATS_DB_ID = 'test-bats-db';
process.env.NOTION_MANIFEST_DB_ID = 'test-manifest-db';

const { app, mapAssetToNotionProperties, mapNotionPageToAsset, shouldRedirectToCanonicalHost } = await import('../../server.js');

const notionResponse = (body, ok = true, status = ok ? 200 : 500) => ({
  ok,
  status,
  json: vi.fn().mockResolvedValue(body),
});

const loginCookie = async (username, password) => {
  const response = await request(app)
    .post('/api/login')
    .send({ username, password })
    .expect(200);

  return response.headers['set-cookie'];
};

const mockReq = (headers, protocol = 'http') => ({
  get: (name) => headers[name.toLowerCase()],
  protocol,
});

describe('Production host redirects', () => {
  it('redirects public apex and insecure canonical requests', () => {
    expect(shouldRedirectToCanonicalHost(mockReq({
      host: 'dexter-b.com',
      'x-forwarded-proto': 'https',
    }))).toBe(true);

    expect(shouldRedirectToCanonicalHost(mockReq({
      host: 'www.dexter-b.com',
      'x-forwarded-proto': 'http',
    }))).toBe(true);
  });

  it('allows canonical HTTPS and internal proxy hosts through', () => {
    expect(shouldRedirectToCanonicalHost(mockReq({
      host: 'www.dexter-b.com',
      'x-forwarded-proto': 'https',
    }))).toBe(false);

    expect(shouldRedirectToCanonicalHost(mockReq({
      host: '127.0.0.1:3000',
    }))).toBe(false);
  });
});

describe('BATS Notion mappers', () => {
  it('maps Notion pages to the internal BATS asset shape', () => {
    const asset = mapNotionPageToAsset({
      id: 'page-1',
      last_edited_time: '2026-05-16T12:00:00.000Z',
      properties: {
        BAT: { formula: { string: 'BM-VIS-001' } },
        'BATS URL': { formula: { string: 'https://www.dexter-b.com/bats/BM-VIS-001' } },
        Name: { title: [{ plain_text: 'Samsung Display' }] },
        Index: { number: 1 },
        'Tax Year': { formula: { number: 2026 } },
        Status: { select: { name: 'Available' } },
        'Asset Class': { select: { name: 'Capitalized' } },
        'Primary User': { select: { name: 'DexterB' } },
        'Sync Status': { select: { name: 'Draft' } },
        Category: { relation: [{ id: 'category-1' }] },
        Location: { relation: [{ id: 'location-1' }] },
        Projects: { relation: [{ id: 'project-1' }, { id: 'project-2' }] },
        'Receipt/Transaction': { relation: [{ id: 'receipt-1' }] },
        Merchant: { rollup: { array: [{ title: [{ plain_text: 'Micro Center' }] }] } },
        'Unit Price': { number: 299.99 },
        Manufacturer: { rich_text: [{ plain_text: 'Samsung' }] },
        'Serial Number': { rich_text: [{ plain_text: 'SN-123' }] },
        'Warranty Expiration': { date: { start: '2027-05-16' } },
        'Power Draw in Watts': { number: 120 },
        Notes: { rich_text: [{ plain_text: 'Mounted in studio.' }] },
        'AI Field Note': { rich_text: [{ plain_text: 'Use for display wall.' }] },
        Photo: { rich_text: [{ plain_text: 'https://example.com/photo.jpg' }] },
      },
    });

    expect(asset).toEqual({
      id: 'page-1',
      batId: 'BM-VIS-001',
      batsUrl: 'https://www.dexter-b.com/bats/BM-VIS-001',
      name: 'Samsung Display',
      index: 1,
      taxYear: 2026,
      status: 'Available',
      assetClass: 'Capitalized',
      primaryUser: 'DexterB',
      syncStatus: 'Draft',
      categoryIds: ['category-1'],
      locationIds: ['location-1'],
      projectIds: ['project-1', 'project-2'],
      receiptTransactionIds: ['receipt-1'],
      merchantName: 'Micro Center',
      unitPrice: 299.99,
      manufacturer: 'Samsung',
      serialNumber: 'SN-123',
      warrantyExpiration: '2027-05-16',
      powerDrawWatts: 120,
      notes: 'Mounted in studio.',
      aiFieldNote: 'Use for display wall.',
      photo: 'https://example.com/photo.jpg',
      lastEdited: '2026-05-16T12:00:00.000Z',
    });
  });

  it('writes only canonical BATS properties on create', () => {
    const props = mapAssetToNotionProperties({
      name: 'Tripod',
      categoryPageId: 'category-1',
      locationPageId: 'location-1',
      projectPageIds: ['project-1'],
      receiptTransactionPageId: 'receipt-1',
      index: 7,
      assetClass: 'Expensed (Section 179)',
      status: 'Available',
      primaryUser: 'DexterB',
      syncStatus: 'Draft',
      manufacturer: 'Manfrotto',
      serialNumber: 'PRIVATE-SERIAL',
      unitPrice: 149.5,
      warrantyExpiration: '2028-01-01',
      powerDrawWatts: 0,
      notes: 'Field kit.',
      aiFieldNote: 'Useful for shoots.',
      photo: 'https://example.com/photo.jpg',
      functionalCheck: true,
      isPersonalTransfer: true,
      referenceVideoUrl: 'https://example.com/video',
      receiptData: { totalPrice: 149.5 },
    });

    expect(props.Name.title[0].text.content).toBe('Tripod');
    expect(props.Category.relation).toEqual([{ id: 'category-1' }]);
    expect(props.Location.relation).toEqual([{ id: 'location-1' }]);
    expect(props.Projects.relation).toEqual([{ id: 'project-1' }]);
    expect(props['Receipt/Transaction'].relation).toEqual([{ id: 'receipt-1' }]);
    expect(props['Unit Price'].number).toBe(149.5);
    expect(props['Power Draw in Watts'].number).toBe(0);

    expect(props).not.toHaveProperty('BAT');
    expect(props).not.toHaveProperty('BATS URL');
    expect(props).not.toHaveProperty('Tax Year');
    expect(props).not.toHaveProperty('Merchant');
    expect(props).not.toHaveProperty('Functional Check');
    expect(props).not.toHaveProperty('Personal Transfer');
    expect(props).not.toHaveProperty('Reference Video URL');
    expect(props).not.toHaveProperty('Receipt Total');
  });
});

describe('BATS API routes', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('requires auth for protected BATS reads', async () => {
    await request(app)
      .get('/api/bats')
      .expect(401)
      .expect(({ body }) => {
        expect(body.error).toMatch(/No clearance badge/);
      });
  });

  it('sets an HttpOnly auth cookie on successful login', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({ username: 'dexterb', password: 'guardian-pass' })
      .expect(200);

    expect(response.body.user).toEqual({ username: 'dexterb', role: 'guardian' });
    expect(response.headers['set-cookie'][0]).toContain('baffle_auth=');
    expect(response.headers['set-cookie'][0]).toContain('HttpOnly');
  });

  it('maps GET /api/bats Notion results for authenticated users', async () => {
    const cookie = await loginCookie('dexterb', 'guardian-pass');
    const fetchMock = vi.fn().mockResolvedValue(notionResponse({
      results: [
        {
          id: 'page-1',
          last_edited_time: '2026-05-16T12:00:00.000Z',
          properties: {
            BAT: { formula: { string: 'BM-CMP-109' } },
            'BATS URL': { formula: { string: 'https://www.dexter-b.com/bats/BM-CMP-109' } },
            Name: { title: [{ plain_text: 'NAS' }] },
            Index: { number: 109 },
            'Primary User': { select: { name: 'DexterB' } },
            Category: { relation: [{ id: 'category-1' }] },
            Location: { relation: [{ id: 'location-1' }] },
            Projects: { relation: [] },
            'Receipt/Transaction': { relation: [] },
            Merchant: { rollup: { array: [] } },
            'Unit Price': { number: 499 },
            'Warranty Expiration': { date: { start: '2027-01-01' } },
            'Power Draw in Watts': { number: 65 },
          },
        },
      ],
    }));
    vi.stubGlobal('fetch', fetchMock);

    await request(app)
      .get('/api/bats')
      .set('Cookie', cookie)
      .expect(200)
      .expect(({ body }) => {
        expect(body[0]).toMatchObject({
          id: 'page-1',
          batId: 'BM-CMP-109',
          name: 'NAS',
          index: 109,
          primaryUser: 'DexterB',
          categoryIds: ['category-1'],
          locationIds: ['location-1'],
          unitPrice: 499,
          warrantyExpiration: '2027-01-01',
          powerDrawWatts: 65,
        });
      });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.notion.com/v1/databases/test-bats-db/query',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('rejects viewer writes to POST /api/bats', async () => {
    const cookie = await loginCookie('iliana', 'viewer-pass');

    await request(app)
      .post('/api/bats')
      .set('Cookie', cookie)
      .send({ assetData: { name: 'Viewer Attempt' } })
      .expect(403);
  });

  it('creates BATS records with the canonical Notion payload', async () => {
    const cookie = await loginCookie('dexterb', 'guardian-pass');
    const fetchMock = vi.fn().mockResolvedValue(notionResponse({ id: 'created-page' }, true, 200));
    vi.stubGlobal('fetch', fetchMock);

    await request(app)
      .post('/api/bats')
      .set('Cookie', cookie)
      .send({
        assetData: {
          name: 'Camera Body',
          categoryPageId: 'category-1',
          locationPageId: 'location-1',
          projectPageIds: ['project-1'],
          receiptTransactionPageId: 'receipt-1',
          index: 12,
          unitPrice: 1999.99,
          serialNumber: 'PRIVATE-SERIAL',
          warrantyExpiration: '2028-05-16',
          powerDrawWatts: 15,
          functionalCheck: true,
        },
      })
      .expect(201)
      .expect(({ body }) => {
        expect(body.page_id).toBe('created-page');
      });

    const [, requestOptions] = fetchMock.mock.calls[0];
    const payload = JSON.parse(requestOptions.body);
    expect(payload.parent).toEqual({ database_id: 'test-bats-db' });
    expect(payload.properties.Name.title[0].text.content).toBe('Camera Body');
    expect(payload.properties.Category.relation).toEqual([{ id: 'category-1' }]);
    expect(payload.properties['Receipt/Transaction'].relation).toEqual([{ id: 'receipt-1' }]);
    expect(payload.properties).not.toHaveProperty('Functional Check');
    expect(payload.properties).not.toHaveProperty('BAT');
    expect(payload.properties).not.toHaveProperty('BATS URL');
  });

  it('updates only explicitly supplied PATCH fields and supports clears', async () => {
    const cookie = await loginCookie('kate', 'collaborator-pass');
    const fetchMock = vi.fn().mockResolvedValue(notionResponse({ id: 'page-1' }));
    vi.stubGlobal('fetch', fetchMock);

    await request(app)
      .patch('/api/bats/page-1')
      .set('Cookie', cookie)
      .send({
        assetData: {
          notes: '',
          warrantyExpiration: null,
          projectPageIds: [],
          unitPrice: 25,
        },
      })
      .expect(200)
      .expect(({ body }) => {
        expect(body.id).toBe('page-1');
      });

    const [url, requestOptions] = fetchMock.mock.calls[0];
    const payload = JSON.parse(requestOptions.body);
    expect(url).toBe('https://api.notion.com/v1/pages/page-1');
    expect(requestOptions.method).toBe('PATCH');
    expect(payload.properties).toEqual({
      'Unit Price': { number: 25 },
      Notes: { rich_text: [] },
      'Warranty Expiration': { date: null },
      Projects: { relation: [] },
    });
  });
});
