import React from 'react'
import { motion } from 'framer-motion'

const Terms = () => {
    return (
        <div className="container" style={{ padding: '60px 24px', maxWidth: '900px' }}>
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '40px' }}
            >
                <h1 style={{ marginBottom: '20px' }}>Terms of <span className="gradient-text">Service</span></h1>
                <p style={{ color: 'var(--text-muted)' }}>Last updated: February 19, 2026</p>
            </motion.section>

            <div className="glass-card" style={{ lineHeight: '1.8', color: 'var(--text-main)' }}>
                <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>1. Acceptance of Terms</h3>
                <p>By accessing and using Loving Converter, you agree to comply with and be bound by these Terms of Service.</p>

                <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>2. Use of Service</h3>
                <p>You agree to use Loving Converter only for lawful purposes. You are prohibited from using the service to process any material that is illegal, harmful, or violates the rights of others.</p>

                <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>3. Limitation of Liability</h3>
                <p>Loving Converter is provided "as is" without any warranties. We are not liable for any damages arising from the use or inability to use our services.</p>

                <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>4. Intellectual Property</h3>
                <p>All content and software on this site are the property of Loving Converter or its licensors and are protected by copyright laws.</p>

                <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>5. Changes to Terms</h3>
                <p>We reserve the right to modify these terms at any time. Your continued use of the site signifies your acceptance of any changes.</p>

                <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>6. Termination</h3>
                <p>We reserve the right to terminate or suspend access to our service immediately, without prior notice, for any reason whatsoever.</p>
            </div>
        </div>
    )
}

export default Terms
