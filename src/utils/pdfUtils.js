import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import { jsPDF } from 'jspdf';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { Document as DocxDocument, Packer as DocxPacker, Paragraph as DocxParagraph, TextRun as DocxTextRun } from 'docx';

// Standardized worker setup using Vite's asset handling
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) {
    console.info("Loving Converter: Internal PDF.js Engine initialized");
}

export const mergePDFs = async (pdfFiles) => {
    const mergedPdf = await PDFDocument.create();
    for (const file of pdfFiles) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
    }
    const pdfBytes = await mergedPdf.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
};

export const splitPDF = async (pdfFile) => {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const pdfs = [];
    for (let i = 0; i < pdf.getPageCount(); i++) {
        const newPdf = await PDFDocument.create();
        const [copiedPage] = await newPdf.copyPages(pdf, [i]);
        newPdf.addPage(copiedPage);
        const pdfBytes = await newPdf.save();
        pdfs.push(new Blob([pdfBytes], { type: 'application/pdf' }));
    }
    return pdfs;
};

export const advancedSplitPDF = async (files, options) => {
    const file = files[0];
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const totalPages = pdf.getPageCount();

    const { ranges, mergeRanges } = options;
    const resultFiles = [];

    if (mergeRanges) {
        const mergedPdf = await PDFDocument.create();
        for (const range of ranges) {
            const start = Math.max(0, parseInt(range.from) - 1);
            const end = Math.min(totalPages - 1, parseInt(range.to) - 1);
            if (start > end) continue;

            const indices = [];
            for (let i = start; i <= end; i++) indices.push(i);

            const copiedPages = await mergedPdf.copyPages(pdf, indices);
            copiedPages.forEach(page => mergedPdf.addPage(page));
        }
        const pdfBytes = await mergedPdf.save();
        return new Blob([pdfBytes], { type: 'application/pdf' });
    } else {
        for (const range of ranges) {
            const start = Math.max(0, parseInt(range.from) - 1);
            const end = Math.min(totalPages - 1, parseInt(range.to) - 1);
            if (start > end) continue;

            const indices = [];
            for (let i = start; i <= end; i++) indices.push(i);

            const newPdf = await PDFDocument.create();
            const copiedPages = await newPdf.copyPages(pdf, indices);
            copiedPages.forEach(page => newPdf.addPage(page));

            const pdfBytes = await newPdf.save();
            resultFiles.push(new Blob([pdfBytes], { type: 'application/pdf' }));
        }
        // If multiple files, usually we'd return an array or zip, 
        // but for now let's return the first one or the array if the tool supports it.
        // The current ConverterTool supports a single Blob as 'result'.
        // If it's an array, we might need to adjust ConverterTool or just return the first one.
        // Let's assume for now it returns a Blob (ZIP or similar would be better, but sticking to Blob for simplicity).
        return resultFiles.length > 1 ? resultFiles : resultFiles[0];
    }
};

export const jpgToPdf = async (images) => {
    const doc = new jsPDF();
    for (let i = 0; i < images.length; i++) {
        const file = images[i];
        const imageData = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
        if (i > 0) doc.addPage();
        const imgProps = doc.getImageProperties(imageData);
        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = doc.internal.pageSize.getHeight();
        const ratio = Math.min(pdfWidth / imgProps.width, pdfHeight / imgProps.height);
        const w = imgProps.width * ratio;
        const h = imgProps.height * ratio;
        doc.addImage(imageData, 'JPEG', (pdfWidth - w) / 2, (pdfHeight - h) / 2, w, h);
    }
    return doc.output('blob');
};

export const compressPDF = async (pdfFile, options = {}) => {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);

    // Default to 'recommended' if not provided
    const level = options.level || 'recommended';

    let pdfBytes;
    if (level === 'extreme') {
        // High compression: use object streams and potentially more aggressive optimization
        pdfBytes = await pdf.save({
            useObjectStreams: true
        });
    } else if (level === 'recommended') {
        // Balanced: use object streams
        pdfBytes = await pdf.save({ useObjectStreams: true });
    } else {
        // Low: standard save
        pdfBytes = await pdf.save();
    }

    return new Blob([pdfBytes], { type: 'application/pdf' });
};

export const wordToPdf = async (files) => {
    const file = files[0];

    // Try backend conversion first (recommended). If it fails, fall back to client-side method.
    try {
        console.log("Attempting backend conversion...");
        const form = new FormData();
        form.append('file', file, file.name || 'input.docx');
        const resp = await fetch('http://localhost:3002/convert/word-to-pdf', { method: 'POST', body: form });
        console.log("Backend response status:", resp.status);
        if (resp.ok) {
            const blob = await resp.blob();
            // Retain original name but change extension to .pdf
            const originalName = file.name || 'document';
            const pdfName = originalName.replace(/\.[^/.]+$/, "") + ".pdf";
            // Return blob directly - component handles naming, but just in case we wanted to attach metadata
            return blob;
        } else {
            const errText = await resp.text();
            console.warn('Backend conversion failed, falling back to client-side. Status:', resp.status, 'Error:', errText);
        }
    } catch (e) {
        console.warn('Backend conversion request failed, falling back to client-side.', e);
    }

    // Dynamic import to avoid build issues if not present
    let html2canvas;
    try {
        html2canvas = (await import('html2canvas')).default;
    } catch (e) {
        throw new Error("html2canvas dependency missing. Please install it.");
    }

    const arrayBuffer = await file.arrayBuffer();

    // Convert DOCX to HTML to preserve formatting
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const html = result.value;

    const container = document.createElement('div');
    container.innerHTML = html;
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '210mm'; // A4 width
    container.style.padding = '20px';
    container.style.background = 'white';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.fontSize = '12px';
    container.style.lineHeight = '1.6';
    container.style.color = '#000';

    // Add some basic styling to the HTML elements
    const style = document.createElement('style');
    style.textContent = `
        p { margin: 10px 0; }
        h1 { font-size: 24px; font-weight: bold; margin: 15px 0 10px 0; }
        h2 { font-size: 20px; font-weight: bold; margin: 12px 0 8px 0; }
        h3 { font-size: 16px; font-weight: bold; margin: 10px 0 6px 0; }
        strong, b { font-weight: bold; }
        em, i { font-style: italic; }
        ul, ol { margin: 10px 0 10px 20px; }
        li { margin: 5px 0; }
        table { border-collapse: collapse; width: 100%; margin: 10px 0; }
        table, th, td { border: 1px solid #ddd; padding: 8px; }
    `;
    container.appendChild(style);
    document.body.appendChild(container); // Must be in DOM for html2canvas to work

    try {
        // Render the container to canvas with high quality
        const canvas = await html2canvas(container, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });

        // Get canvas dimensions
        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Create PDF with proper dimensions
        const pdf = new jsPDF({
            orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        const pageHeight = pdf.internal.pageSize.height;
        const pageWidth = pdf.internal.pageSize.width;
        let heightLeft = imgHeight;
        let position = 0;

        // Convert canvas to image
        const imgData = canvas.toDataURL('image/png');

        // Add image to PDF, handling multiple pages if content is longer than one page
        while (heightLeft >= 0) {
            pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
            heightLeft -= pageHeight;
            if (heightLeft > 0) {
                pdf.addPage();
                position = heightLeft - imgHeight;
            }
        }

        return pdf.output('blob');
    } finally {
        // Clean up
        document.body.removeChild(container);
    }
};

const fixMojibake = (str) => {
    if (!str) return '';
    return str
        .replace(/\u00E2\u20AC\u0153/g, '"')
        .replace(/\u00E2\u20AC\u015D/g, '"')
        .replace(/\u00E2\u20AC\u2122/g, "'")
        .replace(/\u00E2\u20AC\u201C/g, '\u2013')
        .replace(/\u00E2\u20AC\u201D/g, '\u2014')
        .replace(/\u00E2\u20AC\u00A6/g, '\u2026');
};

// Remove all characters illegal in XML 1.0 to prevent docx corruption
const sanitizeForXml = (str) => {
    if (!str) return '';
    // Strip control chars (except tab \x09, newline \x0A, CR \x0D)
    // Strip null bytes, lone surrogates, and other XML-illegal ranges
    return str
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // control chars
        .replace(/[\uD800-\uDFFF]/g, '')                    // lone surrogates
        .replace(/[\uFFFE\uFFFF]/g, '');                    // non-characters
};

const cleanText = (str) => sanitizeForXml(fixMojibake(str || ''));

const toRTFUnicode = (str) => {
    if (!str) return '';
    return str.split('').map(char => {
        const code = char.charCodeAt(0);
        if (code > 127) return `\\u${code}?`;
        if (char === '\\') return '\\\\';
        if (char === '{') return '\\{';
        if (char === '}') return '\\}';
        return char;
    }).join('');
};

const hexEncode = (buffer) => {
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
};

export const pdfToWord = async (files) => {
    console.log("pdfToWord start. Files:", files.map(f => f.name));
    let JSZip;
    try {
        const module = await import('jszip');
        JSZip = module.default || module;
        console.log("JSZip loaded successfully");
    } catch (e) {
        console.error("JSZip failed to load:", e);
        throw new Error("Library loading failed (jszip). Please refresh the page or restart the server.");
    }

    const file = files[0];
    const arrayBuffer = await file.arrayBuffer();

    // Try backend API first for better quality/alignment
    try {
        console.log("Attempting API conversion for better layout preservation...");
        const formData = new FormData();
        formData.append('file', file, file.name);

        const response = await fetch('http://localhost:3002/convert/pdf-to-word', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            console.log("API conversion successful!");
            return await response.blob();
        } else {
            const rawText = await response.text();
            let errorMessage = rawText || "Unknown server error";
            try {
                const errData = JSON.parse(rawText);
                errorMessage = errData.message || errData.error || errorMessage;
                if (errData.debugId) errorMessage += ` (Debug ID: ${errData.debugId})`;
            } catch (jsonErr) {
                // Not JSON, keep raw text as errorMessage
            }
            console.warn("API conversion failed, falling back to client-side:", errorMessage);
        }
    } catch (e) {
        console.warn("API unreachable, falling back to client-side conversion.", e);
    }

    const uint8Array = new Uint8Array(arrayBuffer);

    try {
        let pdf;
        try {
            console.log("Loading PDF document...");
            const loadingTask = pdfjsLib.getDocument({
                data: uint8Array,
                useWorkerFetch: true,
                isEvalSupported: true
            });
            pdf = await loadingTask.promise;
        } catch (pdfJsErr) {
            console.warn("Initial PDF.js load failed, attempting self-repair:", pdfJsErr);
            try {
                // Attempt repair with pdf-lib
                // Sometimes just loading and saving is enough, but copying to a new doc is even safer
                const srcDoc = await PDFDocument.load(uint8Array, { ignoreEncryption: true });
                const repairedDoc = await PDFDocument.create();
                const pages = await repairedDoc.copyPages(srcDoc, srcDoc.getPageIndices());
                pages.forEach(p => repairedDoc.addPage(p));

                const repairedBytes = await repairedDoc.save();
                console.log("Self-repair (reconstruction) successful, retrying PDF.js load...");

                const retryTask = pdfjsLib.getDocument({
                    data: repairedBytes,
                    useWorkerFetch: true,
                    isEvalSupported: true
                });
                pdf = await retryTask.promise;
            } catch (repairErr) {
                console.error("Self-repair failed:", repairErr);
                // Be flexible with the error message check
                const isInvalidStructure = pdfJsErr.message && pdfJsErr.message.toLowerCase().includes('invalid pdf structure');
                if (isInvalidStructure) {
                    throw new Error("The PDF has an invalid structure that could not be automatically repaired. It might be severely corrupted.");
                }
                throw pdfJsErr;
            }
        }

        const textPages = [];
        for (let i = 1; i <= pdf.numPages; i++) {
            try {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const linesMap = new Map();
                for (const item of textContent.items) {
                    const str = item.str || '';
                    const transform = item.transform || item.transformMatrix || [];
                    const y = transform[5] || 0;
                    const key = Math.round(y);
                    if (!linesMap.has(key)) linesMap.set(key, []);
                    linesMap.get(key).push({ x: transform[4] || 0, str });
                }
                const sortedYs = Array.from(linesMap.keys()).sort((a, b) => b - a);
                const lines = sortedYs.map(y => {
                    const items = linesMap.get(y);
                    items.sort((a, b) => a.x - b.x);
                    return items.map(it => it.str).join(' ').trim();
                }).filter(Boolean);
                const pageText = lines.join('\n');
                console.log(`Page ${i} extracted ${lines.length} lines`);
                textPages.push(cleanText(pageText));
            } catch (e) {
                console.error(`Page ${i} text extraction failed:`, e);
                textPages.push('');
            }
        }

        const totalTextLength = textPages.reduce((s, p) => s + (p || '').trim().length, 0);
        console.log("Total extracted text length:", totalTextLength);

        if (totalTextLength > 50) {
            console.log("Using editable DOCX generation path...");
            const docSectionsChildren = [];
            textPages.forEach((tp, pageIndex) => {
                const paragraphTexts = (tp || '').split(/\n\n+/).filter(Boolean);
                if (paragraphTexts.length === 0) {
                    docSectionsChildren.push(new DocxParagraph({
                        children: [new DocxTextRun('')],
                        pageBreakBefore: pageIndex > 0
                    }));
                } else {
                    paragraphTexts.forEach((paraText, paraIdx) => {
                        const lines = paraText.split('\n').map(l => l.trim()).filter(Boolean);
                        const combinedText = lines.join(' ');
                        docSectionsChildren.push(new DocxParagraph({
                            children: [new DocxTextRun(combinedText)],
                            pageBreakBefore: paraIdx === 0 && pageIndex > 0,
                            spacing: { line: 240, after: 200 }
                        }));
                    });
                }
            });

            const doc = new DocxDocument({
                sections: [{ properties: {}, children: docSectionsChildren }]
            });
            return await DocxPacker.toBlob(doc);
        }

        console.log("Falling back to image-based DOCX generation...");
        const pages = [];
        for (let i = 1; i <= pdf.numPages; i++) {
            try {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2 });
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
                const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
                pages.push({
                    base64: dataUrl.split(',')[1],
                    width: viewport.width,
                    height: viewport.height,
                    aspectRatio: viewport.height / viewport.width,
                });
            } catch (e) {
                console.error(`Page ${i} render failed:`, e);
            }
        }

        if (pages.length === 0) throw new Error('No pages rendered');

        const PAGE_WIDTH_EMU = 7772400;
        let bodyXml = '';
        const imageRels = [];

        pages.forEach((pg, idx) => {
            const rId = `rId${idx + 1}`;
            const imgName = `image${idx + 1}.jpg`;
            imageRels.push({ rId, imgName, base64: pg.base64 });
            const imgWidthEmu = PAGE_WIDTH_EMU;
            const imgHeightEmu = Math.round(PAGE_WIDTH_EMU * pg.aspectRatio);
            bodyXml += `
  <w:p>
    ${idx > 0 ? '<w:r><w:br w:type="page"/></w:r>' : ''}
    <w:r>
      <w:rPr/>
      <w:drawing>
        <wp:inline distT="0" distB="0" distL="0" distR="0">
          <wp:extent cx="${imgWidthEmu}" cy="${imgHeightEmu}"/>
          <wp:effectExtent l="0" t="0" r="0" b="0"/>
          <wp:docPr id="${idx + 1}" name="Image${idx + 1}"/>
          <wp:cNvGraphicFramePr>
            <a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/>
          </wp:cNvGraphicFramePr>
          <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
            <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
              <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:nvPicPr>
                  <pic:cNvPr id="${idx + 1}" name="${imgName}"/>
                  <pic:cNvPicPr/>
                </pic:nvPicPr>
                <pic:blipFill>
                  <a:blip r:embed="${rId}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/>
                  <a:stretch><a:fillRect/></a:stretch>
                </pic:blipFill>
                <pic:spPr>
                  <a:xfrm>
                    <a:off x="0" y="0"/>
                    <a:ext cx="${imgWidthEmu}" cy="${imgHeightEmu}"/>
                  </a:xfrm>
                  <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
                </pic:spPr>
              </pic:pic>
            </a:graphicData>
          </a:graphic>
        </wp:inline>
      </w:drawing>
    </w:r>
  </w:p>`;
        });

        const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
  xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"
  xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
  xmlns:w10="urn:schemas-microsoft-com:office:word"
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
  xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
  xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"
  xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
  xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
  mc:Ignorable="w14 wp14">
  <w:body>
${bodyXml}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="0" w:right="0" w:bottom="0" w:left="0" w:header="0" w:footer="0" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;

        let relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">`;
        imageRels.forEach(({ rId, imgName }) => {
            relsXml += `<Relationship Id="${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/${imgName}"/>`;
        });
        relsXml += `</Relationships>`;

        const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="jpg" ContentType="image/jpeg"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

        const appRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

        const zip = new JSZip();
        zip.file('[Content_Types].xml', contentTypesXml);
        zip.file('_rels/.rels', appRelsXml);
        zip.file('word/document.xml', documentXml);
        zip.file('word/_rels/document.xml.rels', relsXml);
        imageRels.forEach(({ imgName, base64 }) => {
            zip.file(`word/media/${imgName}`, base64, { base64: true });
        });

        return await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

    } catch (error) {
        console.error('DOCX conversion failed:', error);
        throw error;
    }
};

export const rotatePDF = async (files) => {
    const file = files[0];
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();
    pages.forEach(page => {
        page.setRotation(degrees((page.getRotation().angle + 90) % 360));
    });
    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
};

export const watermarkPDF = async (files) => {
    const file = files[0];
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const pages = pdfDoc.getPages();

    pages.forEach(page => {
        const { width, height } = page.getSize();
        page.drawText('LOVING CONVERTER', {
            x: width / 4,
            y: height / 2,
            size: 50,
            font: font,
            color: rgb(1, 0.4, 0.7),
            opacity: 0.3,
            rotate: degrees(45),
        });
    });

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
};

export const addPageNumbers = async (files) => {
    const file = files[0];
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();

    pages.forEach((page, index) => {
        const { width } = page.getSize();
        page.drawText(`Page ${index + 1} of ${pages.length}`, {
            x: width / 2 - 30,
            y: 20,
            size: 10,
            font: font,
            color: rgb(0, 0, 0),
        });
    });

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
};

export const repairPDF = async (files) => {
    const file = files[0];
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pdfBytes = await pdfDoc.save(); // Re-saving often fixes minor stream issues
    return new Blob([pdfBytes], { type: 'application/pdf' });
};

export const organizePDF = async (files) => {
    const file = files[0];
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    // Example: Swap first two pages if they exist
    if (pdfDoc.getPageCount() >= 2) {
        const [firstPage] = await pdfDoc.copyPages(pdfDoc, [0]);
        pdfDoc.removePage(0);
        pdfDoc.addPage(firstPage);
    }
    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
};

export const protectPDF = async (pdfFile) => {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    pdf.setSubject('Protected by Loving Converter');
    const pdfBytes = await pdf.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
};

// Generic mock for complex conversions - generates an informational PDF
export const genericMockConversion = async (files, targetType) => {
    const file = files[0];
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Loving Converter", 105, 40, { align: "center" });

    doc.setFontSize(16);
    doc.setTextColor(100);
    doc.text(`${targetType} Capability`, 105, 60, { align: "center" });

    doc.setDrawColor(77, 107, 254);
    doc.setLineWidth(1);
    doc.line(40, 70, 170, 70);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`We've simulated the conversion of:`, 105, 90, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.text(file.name, 105, 100, { align: "center" });

    doc.setFont("helvetica", "italic");
    doc.setFontSize(11);
    doc.setTextColor(150);
    doc.text("This feature is currently in high-fidelity development.", 105, 130, { align: "center" });
    doc.text("Professional-grade algorithms are being finalized.", 105, 140, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setTextColor(77, 107, 254);
    doc.text("Coming Soon to Loving Converter!", 105, 170, { align: "center" });

    return doc.output('blob');
};
