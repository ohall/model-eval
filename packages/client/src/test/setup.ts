// Test setup file
import '@testing-library/jest-dom';

// Mock react-query
jest.mock('react-query', () => ({
  ...jest.requireActual('react-query'),
  useQuery: jest.fn(),
  useMutation: jest.fn(),
}));

// Mock API response
global.fetch = jest.fn();

// Mock window.matchMedia for ChakraUI
window.matchMedia = (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
});