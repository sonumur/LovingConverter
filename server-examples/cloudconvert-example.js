// Minimal CloudConvert example using fetch (server-side)
// Requires a CloudConvert API key.

const fetch = require('node-fetch');

async function createConvertJob(apiKey, inputUrl) {
  const key = apiKey || process.env.CLOUDCONVERT_API_KEY;
  if (!key) throw new Error('CloudConvert API key required. Set CLOUDCONVERT_API_KEY or pass apiKey param.');

  const res = await fetch('https://api.cloudconvert.com/v2/jobs', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      tasks: {
        'import-my-file': {
          operation: 'import/url',
          url: inputUrl
        },
        'convert-my-file': {
          operation: 'convert',
          input: 'import-my-file',
          output_format: 'pdf'
        },
        'export-my-file': {
          operation: 'export/url',
          input: 'convert-my-file'
        }
      }
    })
  });

  const data = await res.json();
  return data;
}

// Usage example (server):
// Ensure CLOUDCONVERT_API_KEY is set in the environment, or pass the key as the first argument.
// const apiKey = process.env.CLOUDCONVERT_API_KEY;
// createConvertJob(apiKey, 'https://example.com/my.docx').then(console.log).catch(console.error);

module.exports = { createConvertJob };
