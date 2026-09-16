// src/components/navigation/LeftSidebar.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, ChevronDown, ChevronRight, Shield, Users } from 'lucide-react';
import { CreateCommunityModal } from '../community/CreateCommunityModal';
import { getCategorizedUserCommunities, type Community } from '../../services/communityService';

export type PageType = 'home' | 'profile' | 'create-post' | 'community';

interface LeftSidebarProps {
  onNavigate?: (page: PageType, slug?: string) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ onNavigate }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createdSubs, setCreatedSubs] = useState<Community[]>([]);
  const [joinedSubs, setJoinedSubs] = useState<Community[]>([]);

  // Accordion toggle states
  const [openCreated, setOpenCreated] = useState(true);
  const [openJoined, setOpenJoined] = useState(true);

  const loadCommunities = useCallback(async () => {
    const { created, joined } = await getCategorizedUserCommunities();
    setCreatedSubs(created);
    setJoinedSubs(joined);
  }, []);

  useEffect(() => {
    loadCommunities();

    // Auto-refresh sidebar whenever a community is created, joined, or deleted
    const handleUpdate = () => loadCommunities();
    window.addEventListener('community-created', handleUpdate);
    window.addEventListener('community-updated', handleUpdate);

    return () => {
      window.removeEventListener('community-created', handleUpdate);
      window.removeEventListener('community-updated', handleUpdate);
    };
  }, [loadCommunities]);

  return (
    <>
      <aside className="w-64 min-h-screen bg-[#0E1113] border-r border-[#343536] p-3 text-[#D7DADC] flex flex-col gap-4 font-sans select-none shrink-0">
        
        {/* ================= FEEDS GROUP ================= */}
        <div className="flex flex-col gap-1">
          <div className="text-[11px] font-bold text-[#818384] px-3 py-1 uppercase tracking-wider">
            Feeds
          </div>

          <button 
            type="button"
            onClick={() => onNavigate?.('home')} 
            className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-xl hover:bg-[#272729] text-left transition"
          >
            <span className="text-base">🏠</span> Home
          </button>

          <button 
            type="button"
            onClick={() => onNavigate?.('home')} 
            className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-xl hover:bg-[#272729] text-left transition text-[#818384] hover:text-white"
          >
            <span className="text-base">🔥</span> Popular
          </button>

          <button 
            type="button"
            onClick={() => onNavigate?.('home')} 
            className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-xl hover:bg-[#272729] text-left transition text-[#818384] hover:text-white"
          >
            <span className="text-base">🌐</span> Explore
          </button>

          {/* Start Community Button */}
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 w-full mt-2 py-2 px-3 bg-[#272729] hover:bg-[#343536] border border-[#343536] text-white rounded-full text-xs font-semibold transition"
          >
            <Plus className="w-4 h-4 text-[#FF4500]" />
            <span>Start a community</span>
          </button>
        </div>

        <hr className="border-[#343536] my-1" />

        {/* ================= YOUR COMMUNITIES (MODERATING) ================= */}
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => setOpenCreated(!openCreated)}
            className="flex items-center justify-between w-full px-3 py-1.5 text-[11px] font-bold text-[#818384] hover:text-white uppercase tracking-wider transition"
          >
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              Your Communities ({createdSubs.length})
            </span>
            {openCreated ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {openCreated && (
            <div className="flex flex-col gap-0.5 mt-1">
              {createdSubs.length === 0 ? (
                <div className="text-xs text-[#818384] px-4 py-2 italic">
                  No communities created yet
                </div>
              ) : (
                createdSubs.map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => onNavigate?.('community', sub.slug || sub.name.toLowerCase())}
                    className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-semibold hover:bg-[#272729] hover:text-white text-[#D7DADC] text-left transition group"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#FF4500] text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
                      r/
                    </div>
                    <span className="truncate flex-1">r/{sub.name}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* ================= JOINED COMMUNITIES ================= */}
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => setOpenJoined(!openJoined)}
            className="flex items-center justify-between w-full px-3 py-1.5 text-[11px] font-bold text-[#818384] hover:text-white uppercase tracking-wider transition"
          >
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              Joined Communities ({joinedSubs.length})
            </span>
            {openJoined ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {openJoined && (
            <div className="flex flex-col gap-0.5 mt-1">
              {joinedSubs.length === 0 ? (
                <div className="text-xs text-[#818384] px-4 py-2 italic">
                  No joined communities yet
                </div>
              ) : (
                joinedSubs.map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => onNavigate?.('community', sub.slug)}
                    className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-semibold hover:bg-[#272729] hover:text-white text-[#D7DADC] text-left transition group"
                  >
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
                      r/
                    </div>
                    <span className="truncate flex-1">r/{sub.name}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <hr className="border-[#343536] my-1" />

        {/* ================= RESOURCES ================= */}
        <div className="flex flex-col gap-1 text-[#818384]">
          <div className="text-[11px] font-bold px-3 py-1 uppercase tracking-wider">
            Resources
          </div>
          <a href="#" className="flex items-center gap-3 px-3 py-1.5 text-xs hover:text-white hover:bg-[#272729] rounded-xl transition">
            <span>📜</span> Community Rules
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-1.5 text-xs hover:text-white hover:bg-[#272729] rounded-xl transition">
            <span>🛡️</span> Privacy Policy
          </a>
        </div>
      </aside>

      {/* Modal for creating community */}
      <CreateCommunityModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={(newSlug) => {
          loadCommunities();
          onNavigate?.('community', newSlug);
        }}
      />
    </>
  );
};