import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';

if (!global.TextEncoder) {
  // @ts-expect-error assigning to global
  global.TextEncoder = TextEncoder;
}

if (!global.TextDecoder) {
  // @ts-expect-error assigning to global
  global.TextDecoder = TextDecoder as unknown as typeof global.TextDecoder;
}

jest.mock('next-intl');
jest.mock('mongoose');
