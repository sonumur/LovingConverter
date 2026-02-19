import React from 'react'
import { motion } from 'framer-motion'
import { Heart, Shield, Zap, HeartHandshake } from 'lucide-react'

const About = () => {
    return (
        <div className="container" style={{ padding: '60px 24px' }}>
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', marginBottom: '80px' }}
            >
                <h1 style={{ marginBottom: '20px' }}>About <span className="gradient-text">Loving Converter</span></h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>
                    We believe that working with PDFs shouldn't be a chore. Loving Converter was born out of a desire to create the most user-friendly, fast, and secure PDF tools on the web.
                </p>
            </motion.section>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', marginBottom: '80px' }}>
                <div className="glass-card">
                    <div style={{ color: 'var(--primary)', marginBottom: '15px' }}><Heart size={32} /></div>
                    <h3 style={{ marginBottom: '10px' }}>Built with Love</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Every feature is crafted with attention to detail to ensure the best possible experience for our users.</p>
                </div>
                <div className="glass-card">
                    <div style={{ color: '#4CAF50', marginBottom: '15px' }}><Shield size={32} /></div>
                    <h3 style={{ marginBottom: '10px' }}>Privacy First</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Your files are your business. We use end-to-end encryption and automatically delete files after processing.</p>
                </div>
                <div className="glass-card">
                    <div style={{ color: '#FF9800', marginBottom: '15px' }}><Zap size={32} /></div>
                    <h3 style={{ marginBottom: '10px' }}>Lightning Fast</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Our optimized infrastructure ensures that even large PDF operations happen in seconds.</p>
                </div>
                <div className="glass-card">
                    <div style={{ color: '#2196F3', marginBottom: '15px' }}><HeartHandshake size={32} /></div>
                    <h3 style={{ marginBottom: '10px' }}>Always Free</h3>
                    <p style={{ color: 'var(--text-muted)' }}>We are committed to providing high-quality tools for everyone, without hidden costs or subscriptions.</p>
                </div>
            </div>

            <section style={{ maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
                <h2 style={{ marginBottom: '30px', textAlign: 'center' }}>Our Story</h2>
                <p style={{ marginBottom: '20px' }}>
                    Loving Converter started as a small internal tool to solve common PDF frustrations. We found that most existing solutions were either too expensive, filled with annoying ads, or difficult to use. We decided to build something better.
                </p>
                <p>
                    Today, we serve thousands of users daily, helping students, professionals, and businesses manage their documents with ease. Our mission is to continue evolving our platform to be the gold standard for PDF management.
                </p>
            </section>
        </div>
    )
}

export default About
