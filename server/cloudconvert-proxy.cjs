const express = require('express');
const multer = require('multer');
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env.local') });

const app = express();
app.use(cors()); // Enable CORS for all routes

const upload = multer({ dest: 'uploads/' });
const CLOUDCONVERT_API = 'https://api.cloudconvert.com/v2/jobs';
const KEY = process.env.CLOUDCONVERT_API_KEY;

if (!KEY) {
    console.error('CLOUDCONVERT_API_KEY not set in .env.local');
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const log = (msg) => {
    const time = new Date().toISOString();
    fs.appendFileSync('debug.log', `[${time}] ${msg}\n`);
};

app.post('/convert/word-to-pdf', upload.single('file'), async (req, res) => {
    log(`Received request v5: ${req.file ? req.file.path : 'no file'}`);
    if (!req.file) {
        log('Error: file required');
        return res.status(400).send('file required');
    }
    if (!KEY) {
        log('Error: CloudConvert API key not configured');
        return res.status(500).send('CloudConvert API key not configured');
    }

    const filePath = path.resolve(req.file.path);

    try {
        // create job
        const jobSpec = {
            tasks: {
                'import-my-file': { operation: 'import/upload', filename: req.file.originalname },
                'convert-my-file': { operation: 'convert', input: 'import-my-file', output_format: 'pdf' },
                'export-my-file': { operation: 'export/url', input: 'convert-my-file' }
            }
        };

        log('Creating job...');
        const createRes = await fetch(CLOUDCONVERT_API, {
            method: 'POST',
            headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(jobSpec)
        });

        if (!createRes.ok) {
            const errText = await createRes.text();
            log(`Create Job Failed: ${createRes.status} ${errText}`);
            throw new Error(`Create Job Failed: ${errText}`);
        }

        const job = await createRes.json();
        const jobId = job.data && job.data.id;
        if (!jobId) throw new Error('No job id ' + JSON.stringify(job));
        log(`Job created: ${jobId}`);

        const importTask = (job.data.tasks || []).find(t => t.operation === 'import/upload');
        if (!importTask || !importTask.result || !importTask.result.form) throw new Error('No upload form');

        const uploadUrl = importTask.result.form.url;
        const params = importTask.result.form.parameters || {};

        const form = new FormData();
        Object.entries(params).forEach(([k, v]) => form.append(k, v));

        log(`Original filename: ${req.file.originalname}`);
        const fileBuffer = fs.readFileSync(filePath);
        form.append('file', fileBuffer, {
            filename: req.file.originalname,
            contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            knownLength: fileBuffer.length
        });

        log('Uploading file...');
        const uploadRes = await fetch(uploadUrl, { method: 'POST', body: form, headers: form.getHeaders() });
        if (!uploadRes.ok && uploadRes.status !== 204) {
            const txt = await uploadRes.text();
            log(`Upload failed: ${txt}`);
            throw new Error('Upload failed: ' + txt);
        }
        log('Upload successful');

        // poll job
        let jobData = null;
        for (let i = 0; i < 120; i++) {
            const r = await fetch(`https://api.cloudconvert.com/v2/jobs/${jobId}`, { headers: { Authorization: `Bearer ${KEY}` } });
            jobData = await r.json();
            const status = jobData && jobData.data && jobData.data.status;
            log(`Job status: ${status}`);
            if (status === 'finished') break;
            if (status === 'error' || status === 'failed') {
                const errorJson = JSON.stringify(jobData, null, 2);
                log(`Job error: ${errorJson}`);
                console.error('Job error', errorJson);
                throw new Error('Job failed: ' + (jobData.data.message || 'Unknown error'));
            }
            await sleep(2000);
        }

        const tasks = jobData.data.tasks || [];
        const exportTask = tasks.find(t => t.operation === 'export/url' && t.status === 'finished');
        if (!exportTask || !exportTask.result || !exportTask.result.files || exportTask.result.files.length === 0) throw new Error('No export file');

        const fileUrl = exportTask.result.files[0].url;
        log(`Downloading result: ${fileUrl}`);
        const fileRes = await fetch(fileUrl);
        if (!fileRes.ok) throw new Error('Download failed');
        res.setHeader('Content-Type', 'application/pdf');
        fileRes.body.pipe(res);
        log('Sent response');
    } catch (err) {
        log(`Conversion proxy error: ${err.message}`);
        console.error('Conversion proxy error:', err);
        res.status(500).send('Conversion failed: ' + (err.message || err));
    } finally {
        try { fs.unlinkSync(filePath); } catch (e) { }
    }
});

const port = process.env.PORT || 3002;
app.listen(port, () => {
    console.log(`CloudConvert proxy listening on ${port}`);
    log('Server Started v5 - Ready for requests');
});

