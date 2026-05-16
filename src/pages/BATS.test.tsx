import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import BATS from './BATS';

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
  it('requires asset name and category before sync', async () => {
    const user = userEvent.setup();
    const { container } = render(<BATS />);
    const syncButton = screen.getByRole('button', { name: /sync bats/i });

    expect(syncButton).toBeDisabled();

    await user.type(screen.getByPlaceholderText('e.g. Samsung 55 UHD'), 'Studio Display');
    expect(syncButton).toBeDisabled();

    await user.selectOptions(selectByName(container, 'categoryPageId'), 'cat1');
    expect(selectByName(container, 'categoryPageId')).toHaveValue('cat1');
    expect(syncButton).toBeEnabled();
  });

  it('disables physical-asset-only fields for consumables', async () => {
    const user = userEvent.setup();
    const { container } = render(<BATS />);

    await user.selectOptions(selectByName(container, 'assetClass'), 'Consumable');

    expect(selectByName(container, 'serialNumber')).toBeDisabled();
    expect(selectByName(container, 'warrantyExpiration')).toBeDisabled();
    expect(selectByName(container, 'powerDrawWatts')).toBeDisabled();
    expect(screen.getByText('Consumable Details')).toBeInTheDocument();
  });

  it('sets owner-equity transaction details for personal transfers', async () => {
    const user = userEvent.setup();
    const { container } = render(<BATS />);

    await user.click(screen.getByRole('button', { name: /personal transfer/i }));

    expect(screen.getByText('DexterB (Owner)')).toBeInTheDocument();
    expect(selectByName(container, 'qbTransactionId')).toHaveValue('OWNER-EQUITY');
    expect(selectByName(container, 'notes')).toHaveValue(
      'Personal asset transferred to business inventory at Fair Market Value. Owner Equity Contribution.',
    );
  });

  it('purges intake state after reset confirmation', async () => {
    const user = userEvent.setup();
    const { container } = render(<BATS />);

    await user.type(screen.getByPlaceholderText('e.g. Samsung 55 UHD'), 'Temporary Asset');
    await user.selectOptions(selectByName(container, 'categoryPageId'), 'cat2');
    expect(screen.getByRole('button', { name: /sync bats/i })).toBeEnabled();

    const resetButton = container.querySelector('footer button');
    if (!resetButton) throw new Error('Missing reset button');
    await user.click(resetButton);
    expect(screen.getByText('Purge Intake?')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /yes, purge/i }));

    expect(screen.getByPlaceholderText('e.g. Samsung 55 UHD')).toHaveValue('');
    expect(selectByName(container, 'serialNumber')).toHaveValue('');
    expect(screen.getByRole('button', { name: /sync bats/i })).toBeDisabled();
  });

  it('sends only canonical assetData fields in live mode', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ page_id: 'notion-page-1234' }));
    vi.stubGlobal('fetch', fetchMock);
    const { container } = render(<BATS />);

    await user.click(container.querySelector('header button') as HTMLButtonElement);
    await user.click(screen.getByRole('button', { name: 'LIVE' }));
    await user.type(screen.getByPlaceholderText('e.g. Samsung 55 UHD'), 'Camera Body');
    await user.selectOptions(selectByName(container, 'categoryPageId'), 'cat1');
    await user.selectOptions(selectByName(container, 'locationPageId'), 'loc1');
    await user.type(selectByName(container, 'serialNumber'), 'PRIVATE-SERIAL');
    await user.type(selectByName(container, 'unitPrice'), '1999.99');
    await user.type(selectByName(container, 'notes'), 'Internal note');
    await user.click(screen.getByRole('button', { name: /sync bats/i }));

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
        categoryPageId: 'cat1',
        locationPageId: 'loc1',
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
});
