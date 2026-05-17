import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import BATSForm from './BATSForm';

const renderForm = (
  mode: 'new' | 'edit' = 'new',
  route = mode === 'edit' ? '/bats/page-1/edit' : '/bats/new',
  state?: unknown,
) => render(
  <MemoryRouter initialEntries={[{ pathname: route, state }]}>
    <Routes>
      <Route path="/bats/new" element={<BATSForm mode="new" />} />
      <Route path="/bats/:batId/edit" element={<BATSForm mode={mode} />} />
    </Routes>
  </MemoryRouter>,
);

const selectByName = (container: HTMLElement, name: string) => {
  const element = container.querySelector(`[name="${name}"]`);
  if (!element) throw new Error(`Missing form control: ${name}`);
  return element as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
};

const jsonResponse = (body: unknown, ok = true) => ({
  ok,
  json: vi.fn().mockResolvedValue(body),
});

describe('BATS intake UI', () => {
  it('requires asset name and category before save', async () => {
    const user = userEvent.setup();
    const { container } = renderForm();
    const saveButton = screen.getByRole('button', { name: /save bats/i });

    expect(saveButton).toBeDisabled();

    await user.type(screen.getByPlaceholderText('e.g. Samsung 55 UHD'), 'Studio Display');
    expect(saveButton).toBeDisabled();

    await user.selectOptions(selectByName(container, 'categoryPageId'), 'cat1');
    expect(selectByName(container, 'categoryPageId')).toHaveValue('cat1');
    expect(saveButton).toBeEnabled();
  });

  it('disables physical-asset-only fields for consumables', async () => {
    const user = userEvent.setup();
    const { container } = renderForm();

    await user.selectOptions(selectByName(container, 'assetClass'), 'Consumable');

    expect(selectByName(container, 'serialNumber')).toBeDisabled();
    expect(selectByName(container, 'warrantyExpiration')).toBeDisabled();
    expect(selectByName(container, 'powerDrawWatts')).toBeDisabled();
    expect(screen.getByText('Consumable Details')).toBeInTheDocument();
  });

  it('sets owner-equity transaction details for personal transfers', async () => {
    const user = userEvent.setup();
    const { container } = renderForm();

    await user.click(screen.getByRole('button', { name: /personal transfer/i }));

    expect(screen.getByText('DexterB (Owner)')).toBeInTheDocument();
    expect(selectByName(container, 'qbTransactionId')).toHaveValue('OWNER-EQUITY');
    expect(selectByName(container, 'notes')).toHaveValue(
      'Personal asset transferred to business inventory at Fair Market Value. Owner Equity Contribution.',
    );
  });

  it('purges intake state after reset confirmation', async () => {
    const user = userEvent.setup();
    const { container } = renderForm();

    await user.type(screen.getByPlaceholderText('e.g. Samsung 55 UHD'), 'Temporary Asset');
    await user.selectOptions(selectByName(container, 'categoryPageId'), 'cat2');
    expect(screen.getByRole('button', { name: /save bats/i })).toBeEnabled();

    const resetButton = container.querySelector('footer button');
    if (!resetButton) throw new Error('Missing reset button');
    await user.click(resetButton);
    expect(screen.getByText('Purge Intake?')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /yes, purge/i }));

    expect(screen.getByPlaceholderText('e.g. Samsung 55 UHD')).toHaveValue('');
    expect(selectByName(container, 'serialNumber')).toHaveValue('');
    expect(screen.getByRole('button', { name: /save bats/i })).toBeDisabled();
  });

  it('sends only canonical assetData fields in live mode', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ page_id: 'notion-page-1234' }));
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderForm();

    await user.type(screen.getByPlaceholderText('e.g. Samsung 55 UHD'), 'Camera Body');
    await user.selectOptions(selectByName(container, 'categoryPageId'), 'cat1');
    await user.selectOptions(selectByName(container, 'locationPageId'), 'loc1');
    await user.type(selectByName(container, 'serialNumber'), 'PRIVATE-SERIAL');
    await user.type(selectByName(container, 'unitPrice'), '1999.99');
    await user.type(selectByName(container, 'notes'), 'Internal note');
    await user.click(screen.getByRole('button', { name: /save bats/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    const [, options] = fetchMock.mock.calls[0];
    expect(options).toMatchObject({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    const body = JSON.parse(options.body as string);
    expect(body).toEqual({
      assetData: {
        name: 'Camera Body',
        projectPageIds: [],
        assetClass: 'Expensed (Section 179)',
        status: 'Available',
        primaryUser: 'DexterB',
        syncStatus: 'Draft',
        serialNumber: 'PRIVATE-SERIAL',
        unitPrice: 1999.99,
        notes: 'Internal note',
      },
    });
    expect(body.assetData).not.toHaveProperty('functionalCheck');
    expect(body.assetData).not.toHaveProperty('isPersonalTransfer');
    expect(body.assetData).not.toHaveProperty('referenceVideoUrl');
    expect(body).not.toHaveProperty('receiptData');
    expect(await screen.findByText(/NODE-1234/)).toBeInTheDocument();
  });

  it('sends PATCH to the current BATS asset route in edit mode', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ id: 'page-1' }));
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderForm('edit');

    expect(screen.getByRole('heading', { name: /edit bats asset/i })).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('e.g. Samsung 55 UHD'), 'Edited Camera');
    await user.selectOptions(selectByName(container, 'categoryPageId'), 'cat1');
    await user.click(screen.getByRole('button', { name: /save bats/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/bats/page-1');
    expect(options).toMatchObject({ method: 'PATCH' });
    expect(await screen.findByText(/NODE-GE-1/)).toBeInTheDocument();
  });

  it('prefills edit mode when opened from the asset overview', () => {
    const { container } = renderForm('edit', '/bats/page-1/edit', {
      asset: {
        id: 'page-1',
        name: 'Existing Camera',
        categoryIds: ['cat1'],
        locationIds: ['loc1'],
        projectIds: [],
        index: 12,
        assetClass: 'Capitalized',
        status: 'In Service',
        unitPrice: 1299,
        serialNumber: 'PRIVATE-SERIAL',
        manufacturer: 'Canon',
        warrantyExpiration: '2027-01-01',
        powerDrawWatts: 15,
        notes: 'Already registered.',
        aiFieldNote: 'Use for field shoots.',
        primaryUser: 'DexterB',
        syncStatus: 'AI Ready',
      },
    });

    expect(screen.getByPlaceholderText('e.g. Samsung 55 UHD')).toHaveValue('Existing Camera');
    expect(selectByName(container, 'categoryPageId')).toHaveValue('cat1');
    expect(selectByName(container, 'locationPageId')).toHaveValue('loc1');
    expect(selectByName(container, 'assetClass')).toHaveValue('Capitalized');
    expect(selectByName(container, 'unitPrice')).toHaveValue(1299);
    expect(selectByName(container, 'serialNumber')).toHaveValue('PRIVATE-SERIAL');
    expect(selectByName(container, 'notes')).toHaveValue('Already registered.');
  });

  it('shows a visible error when live save fails', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ error: 'Failed to write to BATS database' }, false)));
    const { container } = renderForm();

    await user.type(screen.getByPlaceholderText('e.g. Samsung 55 UHD'), 'Camera Body');
    await user.selectOptions(selectByName(container, 'categoryPageId'), 'cat1');
    await user.click(screen.getByRole('button', { name: /save bats/i }));

    expect(await screen.findByText(/save failed: failed to write to bats database/i)).toBeInTheDocument();
    expect(screen.queryByText(/NODE-/)).not.toBeInTheDocument();
  });
});
