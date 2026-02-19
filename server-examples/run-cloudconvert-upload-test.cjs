// Test runner: create a CloudConvert job that uses import/upload, upload a local file,
// poll the job until finished, then download exported PDF.

require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const CLOUDCONVERT_API = 'https://api.cloudconvert.com/v2/jobs';
const key = process.env.CLOUDCONVERT_API_KEY;
if (!key) {
  console.error('CLOUDCONVERT_API_KEY not set in .env.local');
  process.exit(1);
}

const SLEEP_MS = 2000;
const MAX_ATTEMPTS = 120; // up to 4 minutes

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const { Document, Packer, Paragraph, TextRun } = require('docx');

(async () => {
  const tmpFile = path.resolve(__dirname, 'tmp-sample.docx');
  console.log('Generating minimal DOCX to', tmpFile);
  try {
    const doc = new Document({ sections: [{ properties: {}, children: [ new Paragraph({ children: [ new TextRun('CloudConvert upload test document') ] }) ] }] });
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(tmpFile, buffer);
  } catch (err) {
    console.error('DOCX generation failed:', err && err.message ? err.message : err);
    process.exit(2);
  }

  // Create job with an import/upload task
  const jobSpec = {
    tasks: {
      'import-my-file': { operation: 'import/upload' },
      'convert-my-file': { operation: 'convert', input: 'import-my-file', output_format: 'pdf' },
      'export-my-file': { operation: 'export/url', input: 'convert-my-file' }
    }
  };

  console.log('Creating job...');
  const createRes = await fetch(CLOUDCONVERT_API, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(jobSpec)
  });
  const job = await createRes.json();
  if (!job || !job.data) {
    console.error('Failed to create job', job);
    process.exit(2);
  }
  const jobId = job.data.id;
  console.log('Created job:', jobId);

  // Find the import task and upload form
  const importTask = (job.data.tasks || []).find(t => t.operation === 'import/upload');
  if (!importTask || !importTask.result || !importTask.result.form) {
    console.error('Upload form not found in job response', JSON.stringify(job, null, 2));
    process.exit(2);
  }

  const uploadUrl = importTask.result.form.url;
  const parameters = importTask.result.form.parameters || {};

  // Build multipart/form-data and upload
  const form = new FormData();
  Object.entries(parameters).forEach(([k, v]) => form.append(k, v));
  form.append('file', fs.createReadStream(tmpFile));

  console.log('Uploading file to CloudConvert upload URL...');
  const uploadRes = await fetch(uploadUrl, { method: 'POST', body: form, headers: form.getHeaders() });
  if (!uploadRes.ok && uploadRes.status !== 204) {
    console.error('Upload failed with status', uploadRes.status);
    const txt = await uploadRes.text();
    console.error('Upload response:', txt);
    process.exit(2);
  }
  console.log('Upload completed. Polling job...');

  // Poll job status
  let attempt = 0;
  let jobData = null;
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
      console.error('Job failed. Details:', JSON.stringify(jobData, null, 2));
      process.exit(2);
    }
    await sleep(SLEEP_MS);
  }

  if (!jobData) {
    console.error('Failed to fetch job status');
    process.exit(2);
  }

  const tasks = jobData.data.tasks || [];
  const exportTask = tasks.find(t => t.operation === 'export/url' && t.status === 'finished');
  if (!exportTask || !exportTask.result || !exportTask.result.files || exportTask.result.files.length === 0) {
    console.error('No finished export file found in job');
    process.exit(2);
  }

  const fileUrl = exportTask.result.files[0].url;
  console.log('Downloading exported PDF (redacted URL)');

  const fileRes = await fetch(fileUrl);
  if (!fileRes.ok) { console.error('Download failed', fileRes.status); process.exit(2); }
  const outPath = path.resolve(__dirname, 'upload-output.pdf');
  const dest = fs.createWriteStream(outPath);
  await new Promise((resolve, reject) => {
    fileRes.body.pipe(dest);
    fileRes.body.on('error', reject);
    dest.on('finish', resolve);
  });
  console.log('Downloaded exported PDF to', outPath);

  // cleanup tmp
  try { fs.unlinkSync(tmpFile); } catch (e) {}
})();
