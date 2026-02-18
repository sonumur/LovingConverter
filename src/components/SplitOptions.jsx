import React, { useState } from 'react';
import { Plus, Trash2, Layers, Scissors, Grid, Zap } from 'lucide-react';

const SplitOptions = ({ onOptionsChange }) => {
    const [mode, setMode] = useState('range'); // range, pages, size
    const [rangeMode, setRangeMode] = useState('custom'); // custom, fixed
    const [ranges, setRanges] = useState([{ from: 1, to: 1 }]);
    const [mergeRanges, setMergeRanges] = useState(false);
    const [fixedRangeCount, setFixedRangeCount] = useState(1);

    const updateOptions = (newRanges = ranges, newMerge = mergeRanges) => {
        onOptionsChange({ ranges: newRanges, mergeRanges: newMerge });
    };

    const addRange = () => {
        const lastRange = ranges[ranges.length - 1];
        const newRanges = [...ranges, { from: lastRange.to + 1, to: lastRange.to + 1 }];
        setRanges(newRanges);
        updateOptions(newRanges);
    };

    const removeRange = (index) => {
        if (ranges.length <= 1) return;
        const newRanges = ranges.filter((_, i) => i !== index);
        setRanges(newRanges);
        updateOptions(newRanges);
    };

    const handleRangeChange = (index, field, value) => {
        const newRanges = [...ranges];
        newRanges[index][field] = parseInt(value) || 1;
        setRanges(newRanges);
        updateOptions(newRanges);
    };

    return (
        <div style={{ marginTop: '30px', textAlign: 'left' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                <button
                    onClick={() => setMode('range')}
                    className={mode === 'range' ? 'active-tab' : 'inactive-tab'}
                    style={tabStyle(mode === 'range')}
                >
                    <Scissors size={18} /> Split by Range
                </button>
                <button
                    onClick={() => setMode('pages')}
                    className={mode === 'pages' ? 'active-tab' : 'inactive-tab'}
                    style={tabStyle(mode === 'pages')}
                >
                    <Layers size={18} /> Extract Pages
                </button>
                <button
                    onClick={() => setMode('size')}
                    className={mode === 'size' ? 'active-tab' : 'inactive-tab'}
                    style={tabStyle(mode === 'size')}
                >
                    <Grid size={18} /> Split by Size
                </button>
                
            </div>

            {mode === 'range' && (
                <div>
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                                type="radio"
                                checked={rangeMode === 'custom'}
                                onChange={() => setRangeMode('custom')}
                            />
                            Custom Ranges
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                                type="radio"
                                checked={rangeMode === 'fixed'}
                                onChange={() => setRangeMode('fixed')}
                            />
                            Fixed Ranges
                        </label>
                    </div>

                    {rangeMode === 'custom' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {ranges.map((range, index) => (
                                <div key={index} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '15px',
                                    padding: '15px',
                                    background: '#f8f9fa',
                                    borderRadius: '12px',
                                    border: '1px solid #eee'
                                }}>
                                    <span style={{ fontWeight: 600, minWidth: '80px' }}>Range {index + 1}</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <label>From</label>
                                        <input
                                            type="number"
                                            value={range.from}
                                            onChange={(e) => handleRangeChange(index, 'from', e.target.value)}
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <label>To</label>
                                        <input
                                            type="number"
                                            value={range.to}
                                            onChange={(e) => handleRangeChange(index, 'to', e.target.value)}
                                            style={inputStyle}
                                        />
                                    </div>
                                    <button
                                        onClick={() => removeRange(index)}
                                        style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer' }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={addRange}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    padding: '12px',
                                    border: '2px dashed #ddd',
                                    borderRadius: '12px',
                                    background: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer'
                                }}
                            >
                                <Plus size={18} /> Add Range
                            </button>
                        </div>
                    ) : (
                        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '12px' }}>
                            <p style={{ marginBottom: '10px' }}>Split PDF in fixed ranges of:</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input
                                    type="number"
                                    value={fixedRangeCount}
                                    onChange={(e) => setFixedRangeCount(e.target.value)}
                                    style={inputStyle}
                                />
                                <span>pages</span>
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: '20px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 500 }}>
                            <input
                                type="checkbox"
                                checked={mergeRanges}
                                onChange={(e) => {
                                    setMergeRanges(e.target.checked);
                                    updateOptions(ranges, e.target.checked);
                                }}
                            />
                            Merge all ranges in one PDF file
                        </label>
                    </div>
                </div>
            )}

            {mode !== 'range' && (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <p>Feature implementation for {mode} mode is coming soon!</p>
                </div>
            )}
        </div>
    );
};

const tabStyle = (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 15px',
    border: 'none',
    background: active ? 'var(--primary-glow)' : 'transparent',
    color: active ? 'var(--primary)' : 'var(--text-muted)',
    borderRadius: '10px',
    fontWeight: active ? 600 : 500,
    cursor: 'pointer',
    transition: 'all 0.2s'
});

const inputStyle = {
    width: '60px',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    textAlign: 'center'
};

export default SplitOptions;
