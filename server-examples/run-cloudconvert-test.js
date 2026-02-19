// Test runner for CloudConvert example
// Loads .env.local and calls createConvertJob with a public .docx URL

require('dotenv').config({ path: '.env.local' });
const { createConvertJob } = require('./cloudconvert-example');

(async () => {
  const inputUrl = process.argv[2] || 'https://file-examples.com/wp-content/uploads/2017/02/file-sample_100kB.docx';
  console.log('Using input URL:', inputUrl);

  try {
    const res = await createConvertJob(undefined, inputUrl);
    // Avoid printing raw URLs that may contain signed tokens; print trimmed response
    const safe = JSON.stringify(res, (k, v) => {
      if (typeof v === 'string' && v.includes('https://storage.cloudconvert.com')) return '[redacted-url]';
      return v;
    }, 2);
    console.log('CloudConvert response (safe):', safe);
  } catch (err) {
    console.error('CloudConvert test failed:', err && err.message ? err.message : err);
    process.exit(2);
  }
})();
