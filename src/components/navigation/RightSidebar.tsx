// RightSidebar.tsx
import { ExternalLink } from 'lucide-react';

interface RightSidebarProps {
    onOpenCreate?: () => void;
}

export const RightSidebar = ({ onOpenCreate }: RightSidebarProps) => {
    return (
        <aside
            className="right-sidebar"
            style={{
                position: 'sticky',
                top: '72px',
                height: 'calc(100vh - 88px)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                overflowY: 'auto',
                paddingRight: '4px'
            }}
        >
            {/* 1. Recent Posts Widget */}
            <div className="sidebar-widget">
                <h3>Recent Posts</h3>
                <div className="recent-item">
                    <a href="#">How to build an API from scratch</a>
                    <span>15 upvotes • 8 comments</span>
                </div>
                <div className="recent-item">
                    <a href="#">Best UI frameworks for quick prototypes</a>
                    <span>87 upvotes • 23 comments</span>
                </div>
            </div>

            {/* 🚀 PROMOTIONAL AD 1: SUPABASE */}
            <div
                className="sidebar-widget"
                style={{
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span
                        style={{
                            fontSize: '0.65rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            fontWeight: 700,
                            color: 'var(--text-muted)',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            padding: '2px 6px',
                            borderRadius: '4px'
                        }}
                    >
                        Promoted
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ad</span>
                </div>

                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '3px' }}>
                    Supabase Cloud Database
                </h4>
                <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', lineHeight: '1.3', marginBottom: '8px' }}>
                    Build scalable apps in minutes with Postgres, Auth & Realtime APIs.
                </p>

                <a
                    href="https://supabase.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'block', borderRadius: '8px', overflow: 'hidden', marginBottom: '8px' }}
                >
                    <img
                        src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80"
                        alt="Supabase Ad"
                        style={{ width: '100%', height: '110px', objectFit: 'cover', display: 'block' }}
                    />
                </a>

                <a
                    href="https://supabase.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        width: '100%',
                        backgroundColor: 'var(--card-hover)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-main)',
                        padding: '6px 12px',
                        borderRadius: '999px',
                        fontSize: '0.775rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                        transition: 'background 0.2s ease',
                    }}
                >
                    <span>Get Started Free</span>
                    <ExternalLink style={{ width: '13px', height: '13px' }} />
                </a>
            </div>

            {/* 🚀 PROMOTIONAL AD 2: NEON POSTGRES (SAME EXACT SIZE AND DESIGN) */}
            <div
                className="sidebar-widget"
                style={{
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span
                        style={{
                            fontSize: '0.65rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            fontWeight: 700,
                            color: 'var(--text-muted)',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            padding: '2px 6px',
                            borderRadius: '4px'
                        }}
                    >
                        Promoted
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ad</span>
                </div>

                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '3px' }}>
                    Neon Serverless Postgres
                </h4>
                <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', lineHeight: '1.3', marginBottom: '8px' }}>
                    Ship reliable features faster with serverless PostgreSQL and branching.
                </p>

                <a
                    href="https://neon.tech"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'block', borderRadius: '8px', overflow: 'hidden', marginBottom: '8px' }}
                >
                    <img
                        src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80"
                        alt="Neon Ad"
                        style={{ width: '100%', height: '110px', objectFit: 'cover', display: 'block' }}
                    />
                </a>

                <a
                    href="https://neon.tech"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        width: '100%',
                        backgroundColor: 'var(--card-hover)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-main)',
                        padding: '6px 12px',
                        borderRadius: '999px',
                        fontSize: '0.775rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                        transition: 'background 0.2s ease',
                    }}
                >
                    <span>Claim Free Database</span>
                    <ExternalLink style={{ width: '13px', height: '13px' }} />
                </a>
            </div>

            {/* Footer / Copyright links */}
            <div style={{ padding: '4px 8px 16px 8px', fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                <p>DataShare Inc. © {new Date().getFullYear()}. All rights reserved.</p>
            </div>
        </aside>
    );
};