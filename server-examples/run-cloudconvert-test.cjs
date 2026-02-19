// CommonJS test runner for environments where package.json sets "type":"module"
require('dotenv').config({ path: '.env.local' });
const { createConvertJob } = require('./cloudconvert-example.cjs');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const SLEEP_MS = 2000;
const MAX_ATTEMPTS = 60; // up to 2 minutes

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const inputUrl = process.argv[2] || 'https://file-examples.com/wp-content/uploads/2017/02/file-sample_100kB.docx';
  console.log('Using input URL:', inputUrl);

  try {
    const jobResp = await createConvertJob(undefined, inputUrl);
    const jobId = jobResp && jobResp.data && jobResp.data.id;
    if (!jobId) throw new Error('No job id returned');
    console.log('Created job:', jobId);

    // Poll job status
    let attempt = 0;
    let jobData = null;
    const key = process.env.CLOUDCONVERT_API_KEY;

    while (attempt < MAX_ATTEMPTS) {
      attempt++;
      const res = await fetch(`https://api.cloudconvert.com/v2/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${key}` }
      });
      jobData = await res.json();
      const status = jobData && jobData.data && jobData.data.status;
      console.log(`Poll ${attempt}: status=${status}`);
      if (status === 'finished') break;
      if (status === 'error' || status === 'failed') {
        // print redacted job data for debugging
        const safe = JSON.stringify(jobData, (k, v) => {
          if (typeof v === 'string' && v.includes('https://storage.cloudconvert.com')) return '[redacted-url]';
          return v;
        }, 2);
        console.error('Job entered error state. Job data (safe):', safe);
        throw new Error('Job failed');
      }
      await sleep(SLEEP_MS);
    }

    if (!jobData) throw new Error('Failed to fetch job status');
    const tasks = jobData.data.tasks || [];
    // find export task
    const exportTask = tasks.find(t => t.operation === 'export/url' || t.name === 'export-my-file');
    if (!exportTask || !exportTask.result || !exportTask.result.files || exportTask.result.files.length === 0) {
      throw new Error('No export file URL found in job');
    }

    const fileUrl = exportTask.result.files[0].url;
    console.log('Export file URL (redacted): [redacted-url]');

    // download file
    const fileRes = await fetch(fileUrl);
    if (!fileRes.ok) throw new Error(`Failed to download file: ${fileRes.status}`);
    const buffer = await fileRes.buffer();
    const outPath = path.resolve(__dirname, 'output.pdf');
    fs.writeFileSync(outPath, buffer);
    console.log('Downloaded exported PDF to', outPath);

  } catch (err) {
    console.error('CloudConvert poll/download failed:', err && err.message ? err.message : err);
    process.exit(2);
  }
})();
