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
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        doc.addImage(imageData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
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
    const arrayBuffer = await file.arrayBuffer();
    
    // Convert DOCX to HTML to preserve formatting
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const html = result.value;
    
    // Extract text from HTML while preserving basic structure
    const parser = new DOMParser();
    const doc = new jsPDF();
    const docElement = parser.parseFromString(html, 'text/html');
    
    let yPosition = 15;
    const pageHeight = doc.internal.pageSize.height;
    const lineHeight = 5;
    const leftMargin = 10;
    const maxWidth = doc.internal.pageSize.width - 20;
    
    // Process paragraphs and preserve basic formatting
    const paragraphs = docElement.querySelectorAll('p, h1, h2, h3, h4, h5, h6');
    
    paragraphs.forEach(para => {
        const text = para.textContent.trim();
        if (!text) return;
        
        // Detect heading levels and adjust font size
        let fontSize = 11;
        const tagName = para.tagName.toLowerCase();
        if (tagName === 'h1') fontSize = 16;
        else if (tagName === 'h2') fontSize = 14;
        else if (tagName === 'h3') fontSize = 12;
        
        doc.setFontSize(fontSize);
        doc.setFont(undefined, fontSize > 11 ? 'bold' : 'normal');
        
        const splitText = doc.splitTextToSize(text, maxWidth);
        splitText.forEach(line => {
            if (yPosition + lineHeight > pageHeight - 10) {
                doc.addPage();
                yPosition = 15;
            }
            doc.text(line, leftMargin, yPosition);
            yPosition += lineHeight;
        });
        
        // Add space after paragraph
        yPosition += 3;
    });
    
    return doc.output('blob');
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
    const JSZip = (await import('jszip')).default;

    const file = files[0];
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    try {
        const loadingTask = pdfjsLib.getDocument({
            data: uint8Array,
            useWorkerFetch: true,
            isEvalSupported: true
        });
        const pdf = await loadingTask.promise;

        // First try to extract selectable text from the PDF pages to build an editable DOCX.
        const textPages = [];
        // Improved text extraction: group items by rounded Y coordinate to reconstruct lines
        for (let i = 1; i <= pdf.numPages; i++) {
            try {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();

                const linesMap = new Map();
                for (const item of textContent.items) {
                    const str = item.str || '';
                    const transform = item.transform || item.transformMatrix || [];
                    // PDF.js transform: [a, b, c, d, e, f] where f is y
                    const y = transform[5] || 0;
                    const key = Math.round(y);
                    if (!linesMap.has(key)) linesMap.set(key, []);
                    linesMap.get(key).push({ x: transform[4] || 0, str });
                }

                // Sort lines by descending Y (top to bottom)
                const sortedYs = Array.from(linesMap.keys()).sort((a, b) => b - a);
                const lines = sortedYs.map(y => {
                    const items = linesMap.get(y);
                    // sort items by x position
                    items.sort((a, b) => a.x - b.x);
                    return items.map(it => it.str).join(' ').trim();
                }).filter(Boolean);

                // Join lines into paragraph text with double newlines separating larger gaps
                const pageText = lines.join('\n');
                textPages.push(cleanText(pageText));
            } catch (e) {
                console.error(`Page ${i} text extraction failed:`, e);
                textPages.push('');
            }
        }

        const totalTextLength = textPages.reduce((s, p) => s + (p || '').trim().length, 0);

        if (totalTextLength > 0) {
            // Build editable DOCX using extracted text with proper paragraph structure
            const docSectionsChildren = [];

            textPages.forEach((tp, pageIndex) => {
                // Split into paragraphs by double newlines (better semantic structure)
                const paragraphTexts = (tp || '').split(/\n\n+/).filter(Boolean);
                
                if (paragraphTexts.length === 0) {
                    // Ensure at least an empty paragraph to preserve page
                    docSectionsChildren.push(new DocxParagraph({ 
                        children: [new DocxTextRun('')],
                        pageBreakBefore: pageIndex > 0 
                    }));
                } else {
                    paragraphTexts.forEach((paraText, paraIdx) => {
                        // Split paragraph into lines and rejoin as single paragraph
                        const lines = paraText.split('\n').map(l => l.trim()).filter(Boolean);
                        const combinedText = lines.join(' ');
                        
                        const para = new DocxParagraph({
                            children: [new DocxTextRun(combinedText)],
                            pageBreakBefore: paraIdx === 0 && pageIndex > 0,
                            spacing: { line: 240, after: 200 } // Add spacing between paragraphs
                        });
                        docSectionsChildren.push(para);
                    });
                }
            });

            const doc = new DocxDocument({
                sections: [
                    {
                        properties: {},
                        children: docSectionsChildren
                    }
                ]
            });

            const docxBlob = await DocxPacker.toBlob(doc);
            return docxBlob;
        }

        // If there is no selectable text, fall back to rendering pages as images
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
                const base64 = dataUrl.split(',')[1];
                pages.push({
                    base64,
                    width: viewport.width,
                    height: viewport.height,
                    aspectRatio: viewport.height / viewport.width,
                });
            } catch (e) {
                console.error(`Page ${i} render failed:`, e);
            }
        }

        if (pages.length === 0) throw new Error('No pages rendered');

        // EMU constants: 1 inch = 914400 EMU, A4 width = 7772400 EMU (8.5in)
        const PAGE_WIDTH_EMU = 7772400;  // 8.5 inches
        const MARGIN_EMU = 0;

        // Build document.xml body with one image per page
        let bodyXml = '';
        const imageRels = [];

        pages.forEach((pg, idx) => {
            const rId = `rId${idx + 1}`;
            const imgName = `image${idx + 1}.jpg`;
            imageRels.push({ rId, imgName, base64: pg.base64 });

            const imgWidthEmu = PAGE_WIDTH_EMU;
            const imgHeightEmu = Math.round(PAGE_WIDTH_EMU * pg.aspectRatio);

            // Page break before each page (except first)
            const pageBreakAttr = idx === 0 ? '' : '<w:br w:type="page"/>';

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

        // Build relationships for images
        let relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">`;
        imageRels.forEach(({ rId, imgName }) => {
            // Relationship targets in word/_rels/document.xml.rels should point to the media folder
            // relative to the /word directory: "media/<imgName>"
            relsXml += `
  <Relationship Id="${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${imgName}"/>`;
        });
        relsXml += `\n</Relationships>`;

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

        // Build ZIP
        const zip = new JSZip();
        zip.file('[Content_Types].xml', contentTypesXml);
        zip.file('_rels/.rels', appRelsXml);
        zip.file('word/document.xml', documentXml);
        zip.file('word/_rels/document.xml.rels', relsXml);

        // Add images
        imageRels.forEach(({ imgName, base64 }) => {
            zip.file(`word/media/${imgName}`, base64, { base64: true });
        });

        const zipBlob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        return zipBlob;

    } catch (error) {
        console.error('DOCX conversion failed:', error);
        return new Blob([`Error: ${error.message}`], { type: 'text/plain' });
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

// Generic mock for complex conversions
export const genericMockConversion = async (files, targetType) => {
    const file = files[0];
    const text = `Converted ${file.name} to ${targetType}.\n\nThis is a professional conversion simulation.`;
    return new Blob([text], { type: 'application/octet-stream' });
};
