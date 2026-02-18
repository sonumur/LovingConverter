import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    FileStack,
    Scissors,
    Minimize2,
    FileText,
    FileJson,
    Image as ImageIcon,
    FileCode,
    Lock,
    Unlock,
    Stamp,
    RotateCw,
    Type,
    Zap,
    Search,
    Languages,
    Crop,
    ShieldAlert,
    ArrowLeftRight,
    Camera
} from 'lucide-react'

const tools = [
    { id: 'merge', name: 'Merge PDF', icon: <FileStack />, desc: 'Combine PDFs in the order you want with the easiest PDF merger available.', color: '#FF66B2' },
    { id: 'split', name: 'Split PDF', icon: <Scissors />, desc: 'Separate one page or a whole set for easy conversion into independent PDF files.', color: '#FF7E91' },
    { id: 'compress', name: 'Compress PDF', icon: <Minimize2 />, desc: 'Reduce file size while optimizing for maximal PDF quality.', color: '#FF9671' },
    { id: 'pdf-to-word', name: 'PDF to Word', icon: <FileText />, desc: 'Easily convert your PDF files into easy to edit DOC and DOCX documents.', color: '#FFAE52' },
    { id: 'pdf-to-powerpoint', name: 'PDF to PowerPoint', icon: <FileCode />, desc: 'Turn your PDF files into easy to edit PPT and PPTX slideshows.', color: '#FFC75F' },
    { id: 'pdf-to-excel', name: 'PDF to Excel', icon: <FileJson />, desc: 'Pull data straight from PDFs into Excel spreadsheets in a few seconds.', color: '#4CAF50' },
    { id: 'word-to-pdf', name: 'Word to PDF', icon: <FileCode />, desc: 'Make DOC and DOCX files easy to read by converting them to PDF.', color: '#2196F3' },
    { id: 'powerpoint-to-pdf', name: 'PowerPoint to PDF', icon: <FileCode />, desc: 'Make PPT and PPTX slideshows easy to view by converting them to PDF.', color: '#E91E63' },
    { id: 'excel-to-pdf', name: 'Excel to PDF', icon: <FileJson />, desc: 'Make EXCEL spreadsheets easy to read by converting them to PDF.', color: '#009688' },
    { id: 'edit-pdf', name: 'Edit PDF', icon: <Type />, desc: 'Add text, images, shapes or freehand annotations to a PDF document.', color: '#FF6BB2' },
    { id: 'pdf-to-jpg', name: 'PDF to JPG', icon: <ImageIcon />, desc: 'Extract all images that are within a PDF file or convert every page into a JPG image.', color: '#FF5722' },
    { id: 'jpg-to-pdf', name: 'JPG to PDF', icon: <ImageIcon />, desc: 'Convert JPG images to PDF in seconds. Easily adjust orientation and margins.', color: '#FFD700' },
    { id: 'sign-pdf', name: 'Sign PDF', icon: <Stamp />, desc: 'Sign a document and request signatures. Self-sign or send requests.', color: '#673AB7' },
    { id: 'watermark', name: 'Watermark', icon: <Stamp />, desc: 'Stamp an image or text over your PDF in seconds. Choose typography, transparency and position.', color: '#3F51B5' },
    { id: 'rotate-pdf', name: 'Rotate PDF', icon: <RotateCw />, desc: 'Rotate your PDFs the way you need them. Even rotate multiple PDFs at once!', color: '#00BCD4' },
    { id: 'html-to-pdf', name: 'HTML to PDF', icon: <FileCode />, desc: 'Convert web pages in HTML to PDF with copy and paste of the URL.', color: '#8BC34A' },
    { id: 'unlock-pdf', name: 'Unlock PDF', icon: <Unlock />, desc: 'Remove PDF password security, so you can use your PDFs as you want.', color: '#795548' },
    { id: 'protect-pdf', name: 'Protect PDF', icon: <Lock />, desc: 'Encrypt your PDF with a password to prevent unauthorized access.', color: '#607D8B' },
    { id: 'organize-pdf', name: 'Organize PDF', icon: <FileStack />, desc: 'Sort, add and delete PDF pages. Drag and drop the page thumbnails.', color: '#F44336' },
    { id: 'pdf-to-pdfa', name: 'PDF to PDF/A', icon: <FileText />, desc: 'Convert PDF documents to PDF/A for long-term archiving.', color: '#9E9E9E' },
    { id: 'repair-pdf', name: 'Repair PDF', icon: <Zap />, desc: 'Recover data from a damaged or corrupt PDF document.', color: '#FF9800' },
    { id: 'page-numbers', name: 'Page Numbers', icon: <Type />, desc: 'Add page numbers into PDFs with ease. Choose position, dimensions, typography.', color: '#009688' },
    { id: 'scan-to-pdf', name: 'Scan to PDF', icon: <Camera />, desc: 'Capture documents from your device and save them as PDF.', color: '#4CAF50' },
    { id: 'ocr-pdf', name: 'OCR PDF', icon: <Search />, desc: 'Make scanned PDF searchable and selectable with high accuracy OCR.', color: '#3F51B5' },
    { id: 'compare-pdf', name: 'Compare PDF', icon: <ArrowLeftRight />, desc: 'Compare two PDF files and see the differences between them.', color: '#FF5722' },
    { id: 'redact-pdf', name: 'Redact PDF', icon: <ShieldAlert />, desc: 'Permanently remove sensitive content from your PDF files.', color: '#E91E63' },
    { id: 'crop-pdf', name: 'Crop PDF', icon: <Crop />, desc: 'Trim your PDF pages to a selected area, adjust margin size.', color: '#795548' },
    { id: 'translate-pdf', name: 'Translate PDF', icon: <Languages />, desc: 'Translate PDF documents into any language instantly.', color: '#2196F3' },
]


const ToolCard = ({ tool, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
    >
        <Link to={`/${tool.id}`} className="glass-card" style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            textDecoration: 'none',
            color: 'inherit'
        }}>
            <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: `${tool.color}15`,
                color: tool.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
            }}>
                {React.cloneElement(tool.icon, { size: 28 })}
            </div>
            <h3 style={{ marginBottom: '10px', fontSize: '1.25rem' }}>{tool.name}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{tool.desc}</p>
        </Link>
    </motion.div>
)

const Home = () => {
    return (
        <div>
            <section style={{
                padding: 'clamp(60px, 15vw, 120px) 0 60px',
                textAlign: 'center',
                background: 'radial-gradient(circle at 50% -20%, var(--primary-glow) 0%, rgba(255,255,255,0) 50%)'
            }}>
                <div className="container">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 style={{ fontWeight: 800, marginBottom: '20px', letterSpacing: '-1px' }}>
                            Everything you need to manage PDFs in
                            <br />
                            <span className="gradient-text">one powerful platform</span>
                        </h1>
                        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto 40px', lineHeight: '1.6' }}>
                            Every tool you need to use PDFs, at your fingertips. All are 100% FREE and easy to use!
                            Merge, split, compress, convert, rotate, unlock and watermark PDFs with just a few clicks.
                        </p>
                    </motion.div>
                </div>
            </section>

            <section style={{ padding: '20px 0' }}>
                <div className="container">
                    <div className="tool-grid">
                        {tools.map((tool, index) => (
                            <ToolCard key={tool.id} tool={tool} index={index} />
                        ))}
                    </div>
                </div>
            </section>

            
        </div>
    )
}

export default Home
