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

module.exports = { createConvertJob };
