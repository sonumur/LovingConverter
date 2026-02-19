// Minimal Node/Express example using libreoffice-convert
// Run on a server where LibreOffice is installed (Linux, macOS, or Windows).

const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const libre = require('libreoffice-convert');

const upload = multer({ dest: 'uploads/' });
const app = express();

app.post('/convert/docx-to-pdf', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded');

  const inputPath = path.resolve(req.file.path);
  const input = fs.readFileSync(inputPath);

  libre.convert(input, '.pdf', undefined, (err, done) => {
    // cleanup uploaded file
    fs.unlinkSync(inputPath);

    if (err) {
      console.error('Conversion error:', err);
      return res.status(500).send('Conversion failed');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="output.pdf"');
    res.send(done);
  });
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`LibreOffice example listening on ${port}`));

/*
Usage (curl):
curl -F "file=@/path/to/input.docx" http://localhost:3001/convert/docx-to-pdf --output output.pdf

Notes:
- Install LibreOffice on the server first.
- npm install express multer libreoffice-convert
*/
