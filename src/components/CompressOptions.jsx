import React, { useState } from 'react';
import { Zap, ShieldCheck, Heart } from 'lucide-react';

const CompressOptions = ({ onOptionsChange }) => {
    const [selectedLevel, setSelectedLevel] = useState('recommended');

    const levels = [
        {
            id: 'extreme',
            title: 'Extreme Compression',
            description: 'Less quality, high compression',
            icon: <Zap size={24} />,
            color: '#ff4d4d'
        },
        {
            id: 'recommended',
            title: 'Recommended Compression',
            description: 'Good quality, good compression',
            icon: <ShieldCheck size={24} />,
            color: 'var(--primary)'
        },
        {
            id: 'low',
            title: 'Less compression',
            description: 'High quality, less compression',
            icon: <Heart size={24} />,
            color: '#4d6bfe'
        }
    ];

    const handleSelect = (id) => {
        setSelectedLevel(id);
        onOptionsChange({ level: id });
    };

    return (
        <div style={{ marginTop: '30px', textAlign: 'left' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', fontWeight: 700 }}>Compression Level</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                {levels.map((level) => (
                    <div
                        key={level.id}
                        onClick={() => handleSelect(level.id)}
                        style={{
                            padding: '20px',
                            borderRadius: '16px',
                            border: `2px solid ${selectedLevel === level.id ? level.color : '#eee'}`,
                            background: selectedLevel === level.id ? `${level.color}10` : 'white',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                        }}
                    >
                        <div style={{ color: level.color }}>
                            {level.icon}
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, marginBottom: '4px' }}>{level.title}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{level.description}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CompressOptions;
