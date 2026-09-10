export const LeftSidebar = () => {
    return (
        <aside className="left-sidebar">
            {/* Feeds Group */}
            <div className="menu-group">
                <div className="menu-title">Feeds</div>
                <a href="#" className="menu-item active">
                    <span>🏠</span> Home
                </a>
                <a href="#" className="menu-item">
                    <span>🔥</span> Popular
                </a>
                <a href="#" className="menu-item">
                    <span>🌐</span> Explore
                </a>
            </div>

            {/* Communities Group */}
            <div className="menu-group">
                <div className="menu-title">Your Communities</div>
                <a href="#" className="menu-item">r/webdev</a>
                <a href="#" className="menu-item">r/technology</a>
                <a href="#" className="menu-item">r/AskReddit</a>
            </div>

            {/* Resources Group */}
            <div className="menu-group">
                <div className="menu-title">Resources</div>
                <a href="#" className="menu-item">
                    <span>📜</span> Community Rules
                </a>
                <a href="#" className="menu-item">
                    <span>🛡️</span> Privacy Policy
                </a>
                <a href="#" className="menu-item">
                    <span>❓</span> Help & FAQ
                </a>
            </div>
        </aside>
    );
};