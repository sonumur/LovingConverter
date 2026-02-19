import React, { useState, useRef } from 'react';
import { Upload, File, X, Download, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ConverterTool = ({ name, description, icon, onProcess, accept = "application/pdf", OptionsComponent }) => {
    const [files, setFiles] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [result, setResult] = useState(null);
    const [options, setOptions] = useState({});
    const fileInputRef = useRef(null);
    const hasDocxSelected = files.some(f => /\.docx$/i.test(f.name));

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...selectedFiles]);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        if (droppedFiles.length > 0) {
            setFiles(prev => [...prev, ...droppedFiles]);
        }
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        if (files.length === 1) setResult(null);
    };

    const handleProcess = async () => {
        console.log("Handle process clicked for:", name, "Files:", files);
        if (files.length === 0) return;
        setIsProcessing(true);
        try {
            const output = await onProcess(files, options);
            setResult(output);
        } catch (error) {
            console.error("Processing failed:", error);
            alert("Something went wrong during processing. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (!result) return;

        const downloadFile = (blob, suffix = '') => {
            const mimeToExt = {
                'application/pdf': '.pdf',
                'application/msword': '.doc',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
                'application/rtf': '.doc',
                'image/jpeg': '.jpg',
                'image/png': '.png',
                'application/zip': '.zip',
                'text/plain': '.txt'
            };

            const extension = mimeToExt[blob.type] || '.pdf';
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `loving-converter-${name.toLowerCase().replace(/\s+/g, '-')}${suffix}${extension}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        };

        if (Array.isArray(result)) {
            result.forEach((blob, index) => {
                downloadFile(blob, `_part_${index + 1}`);
            });
        } else {
            downloadFile(result);
        }
    };

    return (
        <div className="container" style={{ padding: 'clamp(40px, 10vw, 80px) 16px', minHeight: '80vh' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <div style={{
                    display: 'inline-flex',
                    padding: '12px',
                    background: 'var(--bg-gradient)',
                    borderRadius: '16px',
                    color: 'white',
                    marginBottom: '20px'
                }}>
                    {React.cloneElement(icon, { size: 32 })}
                </div>
                <h1 style={{ fontWeight: 800, marginBottom: '10px' }}>{name}</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(0.9rem, 4vw, 1.1rem)' }}>{description}</p>
            </div>

            <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>

                {files.length === 0 ? (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        style={{
                            border: isDragging ? '2px solid var(--primary)' : '2px dashed #ddd',
                            background: isDragging ? 'var(--primary-glow)' : 'transparent',
                            borderRadius: '24px',
                            padding: 'clamp(30px, 8vw, 60px) 20px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                        onMouseOut={e => e.currentTarget.style.borderColor = isDragging ? 'var(--primary)' : '#ddd'}
                    >
                        <Upload size={40} style={{ color: 'var(--primary)', marginBottom: '20px' }} />
                        <h3 style={{ marginBottom: '10px' }}>Select files or drag and drop</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Files will be processed securely on your browser</p>
                        <input
                            type="file"
                            multiple
                            accept={accept}
                            onChange={handleFileChange}
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                        />
                    </div>
                ) : (
                    <div>
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                                gap: '15px',
                                marginBottom: '30px',
                                padding: 'clamp(10px, 4vw, 20px)',
                                borderRadius: '12px',
                                background: isDragging ? 'var(--primary-glow)' : 'transparent',
                                border: isDragging ? '2px solid var(--primary)' : 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            <AnimatePresence>
                                {files.map((file, index) => (
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.8, opacity: 0 }}
                                        key={index}
                                        style={{
                                            position: 'relative',
                                            padding: '15px',
                                            background: '#f8f9fa',
                                            borderRadius: '12px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <button
                                            onClick={() => removeFile(index)}
                                            style={{
                                                position: 'absolute',
                                                top: '-5px',
                                                right: '-5px',
                                                background: '#ff4d4d',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '20px',
                                                height: '20px',
                                                cursor: 'pointer',
                                                padding: '2px'
                                            }}
                                        >
                                            <X size={14} />
                                        </button>
                                        <File size={32} style={{ color: 'var(--primary)' }} />
                                        <span style={{ fontSize: '0.8rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                                            {file.name}
                                        </span>
                                    </motion.div>
                                ))}
                                <motion.div
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{
                                        padding: '15px',
                                        border: '2px dashed #ddd',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Upload size={24} style={{ color: 'var(--text-muted)' }} />
                                    <input type="file" multiple accept={accept} onChange={handleFileChange} ref={fileInputRef} style={{ display: 'none' }} />
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {OptionsComponent && !result && (
                            <OptionsComponent onOptionsChange={setOptions} />
                        )}

                        {!result ? (
                            <button
                                onClick={handleProcess}
                                disabled={isProcessing}
                                className="btn-primary"
                                style={{ width: '100%', padding: '18px', fontSize: '1.2rem', justifyContent: 'center' }}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        Process {name} <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        ) : (
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <button
                                    onClick={handleDownload}
                                    className="btn-primary"
                                    style={{ flex: 2, padding: '18px', fontSize: '1.2rem', justifyContent: 'center' }}
                                >
                                    <Download /> Download Result
                                </button>
                                <button
                                    onClick={() => { setFiles([]); setResult(null); }}
                                    className="btn-primary"
                                    style={{ flex: 1, padding: '18px', fontSize: '1.2rem', justifyContent: 'center', background: '#f8f9fa', color: 'var(--text-main)', border: '1px solid #ddd' }}
                                >
                                    Start Over
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConverterTool;
