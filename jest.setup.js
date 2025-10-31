import '@testing-library/jest-dom';

// TextEncoder/TextDecoderのポリフィル（@mui/x-data-gridなどで必要）
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}
