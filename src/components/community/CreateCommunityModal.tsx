// src/components/community/CreateCommunityModal.tsx
import React, { useState } from 'react';
import { X, Users, ArrowLeft } from 'lucide-react';
import { createCommunity } from '../../services/communityService';

const AVAILABLE_TOPICS = [
  { id: 'anime', label: 'Anime & Cosplay', emoji: '🍣' },
  { id: 'art', label: 'Art', emoji: '🧑‍🎨' },
  { id: 'business', label: 'Business & Finance', emoji: '💵' },
  { id: 'gaming', label: 'Games', emoji: '🕹️' },
  { id: 'tech', label: 'Technology', emoji: '🛰️' },
  { id: 'education', label: 'Education & Career', emoji: '🧑‍🏫' },
  { id: 'food', label: 'Food & Drinks', emoji: '🍔' },
  { id: 'health', label: 'Health & Wellness', emoji: '❤️‍🩹' },
  { id: 'music', label: 'Music', emoji: '🎶' },
  { id: 'movies', label: 'Movies & TV', emoji: '🎞️' },
  { id: 'sports', label: 'Sports', emoji: '🏅' },
  { id: 'science', label: 'Sciences', emoji: '🧪' },
  { id: 'travel', label: 'Places & Travel', emoji: '🌐' },
  { id: 'reading', label: 'Reading & Writing', emoji: '📖' },
  { id: 'internet', label: 'Internet Culture', emoji: '🙉' },
  { id: 'nature', label: 'Nature & Outdoors', emoji: '🌿' },
];

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (communityName: string) => void;
}

export const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Toggle selection for multiple topics
  const toggleTopic = (topicLabel: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicLabel)
        ? prev.filter((t) => t !== topicLabel)
        : [...prev, topicLabel]
    );
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow alphanumeric characters and underscores (Reddit standard)
    const sanitized = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
    setName(sanitized);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.length < 3) {
      setError('Community name must be at least 3 characters.');
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      await createCommunity({
        name,
        description,
        topics: selectedTopics,
      });

      window.dispatchEvent(new Event('community-created'));
      
      onSuccess?.(name);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-[#1A1A1B] text-[#D7DADC] border border-[#343536] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden z-10 font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[#343536]">
          <div className="flex items-center gap-2">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="p-1.5 text-[#818384] hover:text-white hover:bg-[#272729] rounded-full transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h2 className="text-xl font-bold text-white">
                {step === 1 ? 'What will your community be about?' : 'Tell us about your community'}
              </h2>
              <p className="text-xs text-[#818384]">Step {step} of 2</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#818384] hover:text-white hover:bg-[#272729] rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {step === 1 ? (
            /* ================= STEP 1: TOPIC SELECTION ================= */
            <div>
              <p className="text-sm text-[#818384] mb-4">
                Choose one or more topics to help people discover your community:
              </p>

              <div className="flex flex-wrap gap-2 max-h-[380px] overflow-y-auto pr-1">
                {AVAILABLE_TOPICS.map((topic) => {
                  const isSelected = selectedTopics.includes(topic.label);
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => toggleTopic(topic.label)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold border transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#FF4500]/15 border-[#FF4500] text-[#FF4500]'
                          : 'bg-[#272729] border-[#343536] text-[#D7DADC] hover:border-[#818384]'
                      }`}
                    >
                      <span>{topic.emoji}</span>
                      <span>{topic.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ================= STEP 2: NAME & DESCRIPTION + PREVIEW ================= */
            <form onSubmit={handleCreate} id="community-form" className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
              {/* Left Column: Form inputs */}
              <div className="md:col-span-3 flex flex-col gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-white uppercase tracking-wider">
                      Community Name *
                    </label>
                    <span className="text-[11px] text-[#818384]">
                      {21 - name.length} characters left
                    </span>
                  </div>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-sm text-[#818384] font-semibold">r/</span>
                    <input
                      type="text"
                      maxLength={21}
                      value={name}
                      onChange={handleNameChange}
                      placeholder="communityname"
                      required
                      className="w-full bg-[#272729] text-white text-sm rounded-xl pl-8 pr-4 py-2.5 border border-[#343536] focus:border-[#FF4500] focus:outline-none transition font-medium"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-white uppercase tracking-wider">
                      Description
                    </label>
                    <span className="text-[11px] text-[#818384]">
                      {500 - description.length} characters left
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    maxLength={500}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell visitors what this community is about..."
                    className="w-full bg-[#272729] text-white text-sm rounded-xl px-4 py-2.5 border border-[#343536] focus:border-[#FF4500] focus:outline-none transition resize-none"
                  />
                </div>

                {error && <div className="text-xs text-[#FF4500] font-medium">{error}</div>}
              </div>

              {/* Right Column: Reddit Live Preview Card */}
              <div className="md:col-span-2 bg-[#272729] border border-[#343536] rounded-xl overflow-hidden shadow-md">
                <div className="h-16 bg-[#343536]"></div>
                <div className="p-3.5 pt-0">
                  <div className="w-12 h-12 rounded-full bg-[#FF4500] border-2 border-[#1A1A1B] flex items-center justify-center -mt-6 text-white font-bold shadow">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-sm text-white mt-2 truncate">
                    r/{name || 'communityname'}
                  </h3>
                  <p className="text-[11px] text-[#818384] mt-0.5">
                    1 member · 1 online
                  </p>
                  <p className="text-xs text-[#D7DADC] mt-2.5 line-clamp-3 leading-relaxed">
                    {description || 'Your community description will show up here.'}
                  </p>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#1A1A1B] border-t border-[#343536]">
          <div className="flex gap-1">
            <span className={`w-2 h-2 rounded-full ${step === 1 ? 'bg-[#FF4500]' : 'bg-[#343536]'}`} />
            <span className={`w-2 h-2 rounded-full ${step === 2 ? 'bg-[#FF4500]' : 'bg-[#343536]'}`} />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold rounded-full border border-[#343536] text-[#D7DADC] hover:bg-[#272729] transition"
            >
              Cancel
            </button>

            {step === 1 ? (
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={selectedTopics.length === 0}
                className="px-5 py-2 text-xs font-bold rounded-full bg-[#FF4500] text-white hover:bg-[#E03D00] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                form="community-form"
                disabled={submitting || name.length < 3}
                className="px-5 py-2 text-xs font-bold rounded-full bg-[#FF4500] text-white hover:bg-[#E03D00] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Creating...' : 'Create Community'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};