export const RightSidebar = () => {
    return (
        <aside className="right-sidebar">
            {/* Home Widget */}
            <div className="sidebar-widget">
                <h3>Home</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    Your personal frontpage. Come here to check in with your favorite communities.
                </p>
                <button
                    className="btn-action"
                    style={{
                        width: '100%',
                        justifyContent: 'center',
                        backgroundColor: 'var(--accent-orange)',
                        color: '#fff',
                    }}
                >
                    Create Post
                </button>
            </div>

            {/* Recent Posts Widget */}
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
        </aside>
    );
};