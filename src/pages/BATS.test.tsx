import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BATS from './BATS';
import type { BatsAsset } from '../types/bats';

const renderBats = () => render(
  <MemoryRouter>
    <BATS />
  </MemoryRouter>,
);

const asset = (overrides: Partial<BatsAsset>): BatsAsset => ({
  id: 'page-1',
  batId: 'BM-CMP-109',
  batsUrl: 'https://www.dexter-b.com/bats/BM-CMP-109',
  name: 'Ugreen NAS Node',
  index: 109,
  taxYear: 2026,
  status: 'In Service',
  assetClass: 'Capitalized',
  primaryUser: 'DexterB',
  syncStatus: 'AI Ready',
  categoryIds: ['Computing'],
  locationIds: ['Server Rack'],
  projectIds: ['NAS Build'],
  receiptTransactionIds: [],
  merchantName: 'Amazon',
  unitPrice: 499,
  manufacturer: 'Ugreen',
  serialNumber: null,
  warrantyExpiration: null,
  powerDrawWatts: 65,
  notes: null,
  aiFieldNote: null,
  photo: null,
  lastEdited: '2026-05-16T12:00:00.000Z',
  ...overrides,
});

describe('BATS asset overview', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('loads live assets and exposes the add asset action', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue([
        asset({ id: 'page-1', name: 'Ugreen NAS Node' }),
        asset({ id: 'page-2', batId: 'BM-VIS-002', name: 'Studio Reference Display', unitPrice: 300 }),
      ]),
    }));

    renderBats();

    expect(screen.getByRole('link', { name: /add bats asset/i })).toHaveAttribute('href', '/bats/new');
    expect(await screen.findByText('Ugreen NAS Node')).toBeInTheDocument();
    expect(screen.getByText('Studio Reference Display')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('$799')).toBeInTheDocument();
  });

  it('filters assets by search text', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue([
        asset({ id: 'page-1', name: 'Ugreen NAS Node', categoryIds: ['Computing'] }),
        asset({ id: 'page-2', batId: 'BM-LGT-013', name: 'Key Light Panel', categoryIds: ['Lighting'] }),
      ]),
    }));

    renderBats();

    await screen.findByText('Ugreen NAS Node');
    await user.type(screen.getByPlaceholderText('Search assets'), 'lighting');

    expect(screen.queryByText('Ugreen NAS Node')).not.toBeInTheDocument();
    expect(screen.getByText('Key Light Panel')).toBeInTheDocument();
  });

  it('falls back to local review data when the live request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    renderBats();

    await waitFor(() => {
      expect(screen.getByText('Live inventory unavailable. Showing local review data.')).toBeInTheDocument();
    });
    expect(screen.getByText('Studio Reference Display')).toBeInTheDocument();
  });
});
