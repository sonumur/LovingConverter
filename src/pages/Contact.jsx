import React from 'react'
import { motion } from 'framer-motion'
import { Mail, MessageSquare, Globe, Send } from 'lucide-react'

const Contact = () => {
    return (
        <div className="container" style={{ padding: '60px 24px' }}>
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', marginBottom: '60px' }}
            >
                <h1 style={{ marginBottom: '20px' }}>Get in <span className="gradient-text">Touch</span></h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
                    Have questions or feedback? We'd love to hear from you. Our team is here to help.
                </p>
            </motion.section>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'start' }}>
                <div className="glass-card">
                    <h3 style={{ marginBottom: '25px' }}>Contact Information</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ color: 'var(--primary)' }}><Mail size={24} /></div>
                            <div>
                                <div style={{ fontWeight: 600 }}>Email</div>
                                <div style={{ color: 'var(--text-muted)' }}>support@lovingconverter.com</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ color: 'var(--primary)' }}><MessageSquare size={24} /></div>
                            <div>
                                <div style={{ fontWeight: 600 }}>Social Media</div>
                                <div style={{ color: 'var(--text-muted)' }}>@lovingconverter</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ color: 'var(--primary)' }}><Globe size={24} /></div>
                            <div>
                                <div style={{ fontWeight: 600 }}>Location</div>
                                <div style={{ color: 'var(--text-muted)' }}>Digital Nomad Heaven, Cloud</div>
                            </div>
                        </div>
                    </div>
                </div>

                <form className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: 500 }}>Name</label>
                            <input type="text" placeholder="John Doe" style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.5)' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: 500 }}>Email</label>
                            <input type="email" placeholder="john@example.com" style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.5)' }} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 500 }}>Subject</label>
                        <input type="text" placeholder="How can we help?" style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.5)' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 500 }}>Message</label>
                        <textarea rows="5" placeholder="Your message here..." style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.5)', resize: 'none' }}></textarea>
                    </div>
                    <button type="button" className="btn-primary" style={{ justifyContent: 'center' }}>
                        Send Message <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Contact
