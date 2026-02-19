import React from 'react'
import { motion } from 'framer-motion'

const PrivacyPolicy = () => {
    return (
        <div className="container" style={{ padding: '60px 24px', maxWidth: '900px' }}>
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '40px' }}
            >
                <h1 style={{ marginBottom: '20px' }}>Privacy <span className="gradient-text">Policy</span></h1>
                <p style={{ color: 'var(--text-muted)' }}>Last updated: February 19, 2026</p>
            </motion.section>

            <div className="glass-card" style={{ lineHeight: '1.8', color: 'var(--text-main)' }}>
                <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>1. Information We Collect</h3>
                <p>We do not collect personal information unless you voluntarily provide it to us through our contact forms. When you use our conversion tools, your files are processed on our secure servers and are automatically deleted after a short period (typically within 2 hours).</p>

                <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>2. How We Use Your Data</h3>
                <p>The files you upload are used solely for the purpose of performing the requested conversion. We do not inspect, copy, or share your files with third parties.</p>

                <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>3. Data Security</h3>
                <p>We implement industry-standard security measures to protect your data. All file transfers are encrypted using SSL/TLS protocols.</p>

                <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>4. Cookies</h3>
                <p>We may use cookies to improve your user experience, such as remembering your preferences and analyzing site traffic via anonymous analytics.</p>

                <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>5. Third-Party Services</h3>
                <p>Our site may contain links to other websites. We are not responsible for the privacy practices or content of those sites.</p>

                <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>6. Contact Us</h3>
                <p>If you have any questions about this Privacy Policy, please contact us at support@lovingconverter.com.</p>
            </div>
        </div>
    )
}

export default PrivacyPolicy
