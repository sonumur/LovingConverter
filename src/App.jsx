import React from 'react'
import { createBrowserRouter, RouterProvider, Routes, Route, Link, useLocation, Outlet } from 'react-router-dom'
import { Heart, FileText, Split, Combine, Image as ImageIcon, Zap, Shield, HeartHandshake, FileStack, Scissors, Minimize2, FileCode, Lock, Unlock, Type, FileJson, Stamp, RotateCw, Search, Languages, Crop, ShieldAlert, ArrowLeftRight, Camera } from 'lucide-react'
import Home from './pages/Home'
import ConverterTool from './pages/ConverterTool'
import About from './pages/About'
import Contact from './pages/Contact'
import PrivacyPolicy from './pages/PrivacyPolicy'
import Terms from './pages/Terms'
import SplitOptions from './components/SplitOptions'
import CompressOptions from './components/CompressOptions'
import { mergePDFs, splitPDF, advancedSplitPDF, compressPDF, jpgToPdf, wordToPdf, pdfToWord, rotatePDF, watermarkPDF, addPageNumbers, repairPDF, organizePDF, protectPDF, genericMockConversion } from './utils/pdfUtils'

const ScrollToTop = () => {
    const { pathname } = useLocation();
    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
};

function Layout() {
    return (
        <>
            <ScrollToTop />
            <div className="app-container">
                <header style={{
                    padding: 'clamp(10px, 4vw, 20px) 0',
                    position: 'sticky',
                    top: 0,
                    background: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 1000,
                    borderBottom: '1px solid var(--glass-border)'
                }}>
                    <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img src="/Untitled design(6).png" alt="Loving Converter" style={{ height: 'clamp(30px, 8vw, 40px)' }} />
                            <span style={{ fontSize: 'clamp(1rem, 4.5vw, 1.5rem)', fontWeight: 800, letterSpacing: '-0.5px', whiteSpace: 'nowrap' }} className="gradient-text">
                                Loving Converter
                            </span>
                        </Link>
                        <nav className="header-nav">
                            <Link to="/merge" className="hide-mobile">Merge</Link>
                            <Link to="/split" className="hide-mobile">Split</Link>
                            <Link to="/compress">Compress</Link>
                        </nav>
                    </div>
                </header>

                <main>
                    <Outlet />
                </main>

                <footer style={{
                    background: '#1a1a1a',
                    color: 'white',
                    padding: '60px 0',
                    marginTop: '100px'
                }}>
                    <div className="container">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' }}>
                            <div>
                                <h3 style={{ marginBottom: '20px' }} className="gradient-text">Loving Converter</h3>
                                <p style={{ opacity: 0.7 }}>The most loving way to work with your PDF files. Fast, easy, and secure conversion at your fingertips.</p>
                            </div>
                            <div>
                                <h4 style={{ marginBottom: '20px' }}>Solutions</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', opacity: 0.7 }}>
                                    <Link to="/merge">Merge PDF</Link>
                                    <Link to="/split">Split PDF</Link>
                                    <Link to="/compress">Compress PDF</Link>
                                </div>
                            </div>
                            <div>
                                <h4 style={{ marginBottom: '20px' }}>Company</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', opacity: 0.7 }}>
                                    <Link to="/about">About Us</Link>
                                    <Link to="/contact">Contact</Link>
                                    <Link to="/privacy">Privacy Policy</Link>
                                    <Link to="/terms">Terms of Service</Link>
                                </div>
                            </div>
                        </div>
                        <div style={{ marginTop: '60px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', textAlign: 'center', opacity: 0.5 }}>
                            © 2026 Loving Converter. Made with ❤️ for perfect PDFs.
                        </div>
                    </div>
                </footer>
            </div>
        </>
    )
}

const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        children: [
            { index: true, element: <Home /> },
            { path: 'merge', element: <ConverterTool name="Merge PDF" description="Combine PDFs." icon={<FileStack />} onProcess={mergePDFs} /> },
            { path: 'split', element: <ConverterTool name="Split PDF" description="Separate pages." icon={<Scissors />} onProcess={advancedSplitPDF} OptionsComponent={SplitOptions} /> },
            { path: 'compress', element: <ConverterTool name="Compress PDF" description="Reduce size." icon={<Minimize2 />} onProcess={(f, o) => compressPDF(f[0], o)} OptionsComponent={CompressOptions} /> },
            { path: 'pdf-to-word', element: <ConverterTool name="PDF to Word" description="PDF to DOCX." icon={<FileText />} onProcess={pdfToWord} /> },
            { path: 'word-to-pdf', element: <ConverterTool name="Word to PDF" description="DOCX to PDF." icon={<FileCode />} onProcess={wordToPdf} accept=".docx" /> },
            { path: 'jpg-to-pdf', element: <ConverterTool name="JPG to PDF" description="Images to PDF." icon={<ImageIcon />} onProcess={jpgToPdf} accept="image/*" /> },
            { path: 'pdf-to-jpg', element: <ConverterTool name="PDF to JPG" description="PDF to Images." icon={<ImageIcon />} onProcess={(f) => genericMockConversion(f, 'JPG')} /> },
            { path: 'pdf-to-powerpoint', element: <ConverterTool name="PDF to PowerPoint" description="PDF to PPTX." icon={<FileCode />} onProcess={(f) => genericMockConversion(f, 'PPTX')} /> },
            { path: 'pdf-to-excel', element: <ConverterTool name="PDF to Excel" description="PDF to XLSX." icon={<FileJson />} onProcess={(f) => genericMockConversion(f, 'XLSX')} /> },
            { path: 'excel-to-pdf', element: <ConverterTool name="Excel to PDF" description="XLSX to PDF." icon={<FileJson />} onProcess={(f) => genericMockConversion(f, 'Excel to PDF')} /> },
            { path: 'powerpoint-to-pdf', element: <ConverterTool name="PowerPoint to PDF" description="PPTX to PDF." icon={<FileCode />} onProcess={(f) => genericMockConversion(f, 'PowerPoint to PDF')} /> },
            { path: 'sign-pdf', element: <ConverterTool name="Sign PDF" description="Sign yourself or others." icon={<Stamp />} onProcess={(f) => genericMockConversion(f, 'Sign PDF')} /> },
            { path: 'watermark', element: <ConverterTool name="Watermark" description="Stamp text/image." icon={<Stamp />} onProcess={watermarkPDF} /> },
            { path: 'rotate-pdf', element: <ConverterTool name="Rotate PDF" description="Rotate pages." icon={<RotateCw />} onProcess={rotatePDF} /> },
            { path: 'html-to-pdf', element: <ConverterTool name="HTML to PDF" description="Web to PDF." icon={<FileCode />} onProcess={(f) => genericMockConversion(f, 'HTML to PDF')} /> },
            { path: 'unlock-pdf', element: <ConverterTool name="Unlock PDF" description="Remove password." icon={<Unlock />} onProcess={(f) => genericMockConversion(f, 'Unlock PDF')} /> },
            { path: 'protect-pdf', element: <ConverterTool name="Protect PDF" description="Add password." icon={<Lock />} onProcess={protectPDF} /> },
            { path: 'organize-pdf', element: <ConverterTool name="Organize PDF" description="Sort and reorder." icon={<FileStack />} onProcess={organizePDF} /> },
            { path: 'pdf-to-pdfa', element: <ConverterTool name="PDF to PDF/A" description="Archive format." icon={<FileText />} onProcess={(f) => genericMockConversion(f, 'PDF to PDF/A')} /> },
            { path: 'repair-pdf', element: <ConverterTool name="Repair PDF" description="Recover data." icon={<Zap />} onProcess={repairPDF} /> },
            { path: 'page-numbers', element: <ConverterTool name="Page Numbers" description="Add numbering." icon={<Type />} onProcess={addPageNumbers} /> },
            { path: 'ocr-pdf', element: <ConverterTool name="OCR PDF" description="Scan to text." icon={<Search />} onProcess={(f) => genericMockConversion(f, 'OCR PDF')} /> },
            { path: 'edit-pdf', element: <ConverterTool name="Edit PDF" description="Edit your PDF." icon={<Type />} onProcess={(f) => genericMockConversion(f, 'Edit PDF')} /> },
            { path: 'scan-to-pdf', element: <ConverterTool name="Scan to PDF" description="Scan documents." icon={<Camera />} onProcess={(f) => genericMockConversion(f, 'Scan to PDF')} /> },
            { path: 'compare-pdf', element: <ConverterTool name="Compare PDF" description="Compare PDFs." icon={<ArrowLeftRight />} onProcess={(f) => genericMockConversion(f, 'Compare PDF')} /> },
            { path: 'redact-pdf', element: <ConverterTool name="Redact PDF" description="Remove sensitive info." icon={<ShieldAlert />} onProcess={(f) => genericMockConversion(f, 'Redact PDF')} /> },
            { path: 'crop-pdf', element: <ConverterTool name="Crop PDF" description="Trim boundaries." icon={<Crop />} onProcess={(f) => genericMockConversion(f, 'Crop PDF')} /> },
            { path: 'translate-pdf', element: <ConverterTool name="Translate PDF" description="Translate content." icon={<Languages />} onProcess={(f) => genericMockConversion(f, 'Translate PDF')} /> },
            { path: 'about', element: <About /> },
            { path: 'contact', element: <Contact /> },
            { path: 'privacy', element: <PrivacyPolicy /> },
            { path: 'terms', element: <Terms /> },
        ]
    }
], { future: { v7_startTransition: true, v7_relativeSplatPath: true } });

function App() {
    return <RouterProvider router={router} />;
}

export default App
