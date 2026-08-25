// @vitest-environment jsdom
import { describe, expect, it, vi, afterEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import Login from './Login';


// antd's responsive observer needs matchMedia, which jsdom does not implement.
vi.stubGlobal('matchMedia', (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
}));
vi.mock('../firebase', () => ({
  auth: {},
}));

describe('Login', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the heading, password field, and submit button', () => {
    render(<Login />);

    expect(screen.getByRole('heading', { name: /notes/i })).toBeTruthy();
    expect(screen.getByLabelText(/password/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeTruthy();
  });
});
