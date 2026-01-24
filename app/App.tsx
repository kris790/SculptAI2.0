import React from 'react';

const App: React.FC = () => {
    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1 style={styles.title}>SculptAI</h1>
                <p style={styles.subtitle}>Data Pipeline Data & Analytics</p>
            </header>
            <main style={styles.main}>
                <div style={styles.card}>
                    <h2 style={styles.cardTitle}>System Status</h2>
                    <div style={styles.statusIndicator}>
                        <span style={styles.dot}></span>
                        <span>Operational</span>
                    </div>
                </div>
            </main>
        </div>
    );
};

// Simple inline styles for immediate polished look without external dependencies
const styles = {
    container: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        backgroundColor: '#f9fafb',
        minHeight: '100vh',
        color: '#111827',
        display: 'flex',
        flexDirection: 'column' as const,
    },
    header: {
        backgroundColor: '#ffffff',
        padding: '1.5rem 2rem',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    },
    title: {
        fontSize: '1.5rem',
        fontWeight: '700',
        margin: 0,
        color: '#1f2937',
    },
    subtitle: {
        marginTop: '0.25rem',
        color: '#6b7280',
        fontSize: '0.875rem',
    },
    main: {
        padding: '2rem',
        maxWidth: '80rem',
        margin: '0 auto',
        width: '100%',
    },
    card: {
        backgroundColor: '#ffffff',
        padding: '1.5rem',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        maxWidth: '24rem',
    },
    cardTitle: {
        fontSize: '1.125rem',
        fontWeight: '600',
        marginBottom: '1rem',
        marginTop: 0,
    },
    statusIndicator: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: '#059669',
        fontWeight: '500',
    },
    dot: {
        width: '0.75rem',
        height: '0.75rem',
        backgroundColor: '#10b981',
        borderRadius: '50%',
    },
};

export default App;