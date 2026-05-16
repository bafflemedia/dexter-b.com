import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { Login } from './Login';

const jsonResponse = (body: unknown, ok = true) => ({
  ok,
  headers: new Headers({ 'content-type': 'application/json' }),
  json: vi.fn().mockResolvedValue(body),
});

const renderLogin = (setAuthStatus = vi.fn()) => {
  render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<Login setAuthStatus={setAuthStatus} />} />
        <Route path="/bats" element={<div>BATS route reached</div>} />
      </Routes>
    </MemoryRouter>,
  );
  return { setAuthStatus };
};

describe('Login', () => {
  it('posts credentials with cookies and navigates to BATS on success', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ user: { username: 'dexterb', role: 'guardian' } }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const { setAuthStatus } = renderLogin();

    await user.type(screen.getByPlaceholderText('Username'), 'dexterb');
    await user.type(screen.getByPlaceholderText('Passcode'), 'guardian-pass');
    await user.click(screen.getByRole('button', { name: /initiate handshake/i }));

    await waitFor(() => expect(screen.getByText('BATS route reached')).toBeInTheDocument());
    expect(setAuthStatus).toHaveBeenCalledWith(true);
    expect(fetchMock).toHaveBeenCalledWith('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username: 'dexterb', password: 'guardian-pass' }),
    });
  });

  it('shows an invalid credential message on rejected login', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ error: 'nope' }, false)));
    renderLogin();

    await user.type(screen.getByPlaceholderText('Username'), 'dexterb');
    await user.type(screen.getByPlaceholderText('Passcode'), 'wrong');
    await user.click(screen.getByRole('button', { name: /initiate handshake/i }));

    expect(await screen.findByText('Signal rejected: Invalid credentials.')).toBeInTheDocument();
  });

  it('surfaces non-json server responses for diagnosis', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      headers: new Headers({ 'content-type': 'text/html' }),
      text: vi.fn().mockResolvedValue('<html>Hostinger fallback</html>'),
    }));
    renderLogin();

    await user.type(screen.getByPlaceholderText('Username'), 'dexterb');
    await user.type(screen.getByPlaceholderText('Passcode'), 'guardian-pass');
    await user.click(screen.getByRole('button', { name: /initiate handshake/i }));

    expect(await screen.findByText(/TRACE: Invalid Response Type/i)).toBeInTheDocument();
  });
});
