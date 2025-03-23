// Test setup file
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock react-query
vi.mock('react-query', () => ({
  ...vi.importActual('react-query'),
  useQuery: vi.fn(),
  useMutation: vi.fn(),
}));

// Mock API response
global.fetch = vi.fn() as any;

// Mock window.matchMedia for ChakraUI
window.matchMedia = (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
});