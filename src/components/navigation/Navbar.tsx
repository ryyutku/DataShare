import { Search, Plus, MessageSquare, Compass } from 'lucide-react';

export const Navbar = () => {
    return (
        <header className="navbar">
            {/* Left: Brand Logo */}
            <div className="nav-left">
                <a href="#" className="brand-logo">
                    <Compass className="w-8 h-8 text-[#ff4500]" />
                    <span>DataShare</span>
                </a>
            </div>

            {/* Middle: Search Bar */}
            <div className="search-container">
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Search
                        style={{
                            position: 'absolute',
                            left: '12px',
                            width: '16px',
                            height: '16px',
                            color: 'var(--text-muted)'
                        }}
                    />
                    <input
                        type="text"
                        className="search-bar"
                        placeholder="Search communities, posts, topics..."
                        style={{ paddingLeft: '36px' }}
                    />
                </div>
            </div>

            {/* Right: Actions & User Avatar */}
            <div className="nav-right">
                <button className="btn-action">
                    <Plus style={{ width: '16px', height: '16px' }} />
                    <span>Create</span>
                </button>
                <button className="btn-action">
                    <MessageSquare style={{ width: '16px', height: '16px' }} />
                    <span>Chat</span>
                </button>
                <div className="avatar">U</div>
            </div>
        </header>
    );
};