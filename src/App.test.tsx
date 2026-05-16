import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App routing', () => {
  it('redirects unauthenticated BATS visits to login', async () => {
    window.history.pushState({}, '', '/bats');

    render(<App />);

    expect(await screen.findByText('RESTRICTED SECTOR')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/login');
  });
});
