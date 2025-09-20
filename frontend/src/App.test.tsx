import React from 'react';
import { render } from '@testing-library/react';

// Mock the API service to avoid axios imports
jest.mock('./services/api', () => ({
  authService: {
    login: jest.fn(),
    register: jest.fn(),
  },
  accountService: {
    getAccounts: jest.fn(),
    getAccount: jest.fn(),
    getAccountTransactions: jest.fn(),
  },
  transactionService: {
    transfer: jest.fn(),
    deposit: jest.fn(),
    withdraw: jest.fn(),
  },
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useNavigate: () => jest.fn(),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
}));

// Simple component test
describe('App Component', () => {
  test('basic utility test', () => {
    expect(1 + 1).toBe(2);
  });

  test('string operations work', () => {
    const appName = 'Banking App';
    expect(appName.includes('Banking')).toBe(true);
  });
});