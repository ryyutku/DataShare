// src/pages/CreatePostPage.tsx
import React, { useState, useEffect } from 'react';
import { SchemaBuilder } from '../components/ui/SchemaBuilder';
import { supabase } from '../services/supabaseclient';
import {
  createPost,
  getCommunities,
  getTags,
  type CommunityOption,
  type TagOption,
} from '../services/postService';
import type { DatasetField } from '../types/post';
import type { PageType } from '../components/navigation/Navbar';

interface CreatePostPageProps {
  preselectedCommunityId?: string | null;
  onNavigate?: (page: PageType, targetIdOrSlug?: string) => void;
}

export const CreatePostPage: React.FC<CreatePostPageProps> = ({ 
  preselectedCommunityId, 
  onNavigate 
}) => {
  const [communities, setCommunities] = useState<CommunityOption[]>([]);
  const [tags, setTags] = useState<TagOption[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<string>('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goalCount, setGoalCount] = useState<number>(100);
  const [activeTab, setActiveTab] = useState<'schema' | 'media' | 'preview'>('schema');

  const [fields, setFields] = useState<DatasetField[]>([
    {
      id: '1',
      name: 'item_name',
      type: 'string',
      description: 'Name of item or survey target',
      required: true,
      exampleValue: 'MacBook Pro M3',
    },
    {
      id: '2',
      name: 'price_usd',
      type: 'number',
      description: 'Price in USD',
      required: true,
      exampleValue: '1999',
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load communities and auto-select preselectedCommunityId
  useEffect(() => {
    async function loadData() {
      const [commList, tagList] = await Promise.all([
        getCommunities(),
        getTags(),
      ]);
      setCommunities(commList);
      setTags(tagList);

      if (commList.length > 0) {
        // Auto-select the community passed from CommunityPage
        if (preselectedCommunityId) {
          const match = commList.find(
            (c) => c.id === preselectedCommunityId || c.slug.toLowerCase() === preselectedCommunityId.toLowerCase()
          );
          if (match) {
            setSelectedCommunity(match.id);
            return;
          }
        }
        setSelectedCommunity(commList[0].id);
      }
    }
    loadData();
  }, [preselectedCommunityId]);

  const toggleTag = (id: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError('You must be logged in to create a data request.');
      return;
    }

    if (!selectedCommunity) {
      setError('Please choose a community.');
      return;
    }

    if (!title.trim()) {
      setError('Please provide a title.');
      return;
    }

    if (fields.length === 0) {
      setError('Please define at least one field for this dataset.');
      return;
    }

    const schemaObj: Record<string, string> = {};
    const exampleRowObj: Record<string, any> = {};

    for (const f of fields) {
      if (!f.name.trim()) continue;
      schemaObj[f.name] = f.type;
      exampleRowObj[f.name] =
        f.type === 'number' ? Number(f.exampleValue) || 0 : f.exampleValue || '';
    }

    try {
      setLoading(true);

      const created = await createPost({
        community_id: selectedCommunity,
        author_id: user.id,
        title: title.trim(),
        description: description.trim(),
        schema: schemaObj,
        example_row: exampleRowObj,
        goal_count: goalCount,
        tag_ids: selectedTagIds,
      });

      if (onNavigate) {
        onNavigate('post-detail', created.id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create dataset post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E1113] text-[#D7DADC] font-sans pb-12">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#343536]">
          <h1 className="text-xl font-bold text-[#D7DADC]">Request Data / Create Post</h1>
          <span className="text-xs text-[#818384] bg-[#272729] px-2.5 py-1 rounded">
            Target Responses: <strong className="text-[#D7DADC]">{goalCount}</strong>
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <main className="lg:col-span-2 flex flex-col gap-4">
          {/* Community Selector with auto-selected option */}
          <div className="w-full sm:w-80">
            <select
              value={selectedCommunity}
              onChange={(e) => setSelectedCommunity(e.target.value)}
              className="w-full bg-[#1A1A1B] border border-[#343536] text-[#D7DADC] text-sm rounded-lg px-3 py-2.5 focus:border-[#FF4500] focus:outline-none transition cursor-pointer"
            >
              <option value="" disabled>Choose a community to post in</option>
              {communities.map((c) => (
                <option key={c.id} value={c.id}>
                  r/{c.slug} ({c.name})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-[#1A1A1B] border border-[#343536] rounded-xl overflow-hidden shadow-sm">
            <nav className="flex border-b border-[#343536] bg-[#1A1A1B]/50 text-sm font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('schema')}
                className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition ${
                  activeTab === 'schema'
                    ? 'border-[#FF4500] text-[#D7DADC] bg-[#272729]/50'
                    : 'border-transparent text-[#818384] hover:text-[#D7DADC]'
                }`}
              >
                <span>📊</span> Dataset &amp; Survey Schema
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('media')}
                className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition ${
                  activeTab === 'media'
                    ? 'border-[#FF4500] text-[#D7DADC] bg-[#272729]/50'
                    : 'border-transparent text-[#818384] hover:text-[#D7DADC]'
                }`}
              >
                <span>🖼️</span> Guidelines &amp; Media
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition ${
                  activeTab === 'preview'
                    ? 'border-[#FF4500] text-[#D7DADC] bg-[#272729]/50'
                    : 'border-transparent text-[#818384] hover:text-[#D7DADC]'
                }`}
              >
                <span>👁️</span> JSON Schema Preview
              </button>
            </nav>

            <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
              {error && (
                <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 text-xs rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <input
                  type="text"
                  maxLength={300}
                  placeholder="Dataset / Survey Title (e.g. 2026 Electric Vehicle Market Survey)*"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-[#272729] text-[#D7DADC] text-base rounded-lg px-3.5 py-2.5 border border-[#343536] focus:border-[#FF4500] focus:outline-none placeholder-[#818384]"
                />
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-xs text-[#818384] font-medium mr-1">Topics:</span>
                  {tags.map((tag) => {
                    const isSelected = selectedTagIds.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`text-xs font-semibold px-3 py-1 rounded-full border transition ${
                          isSelected
                            ? 'border-[#FF4500] text-[#FF4500] bg-[#FF4500]/10'
                            : 'border-[#343536] text-[#818384] hover:text-[#D7DADC] hover:border-[#818384]'
                        }`}
                      >
                        #{tag.slug}
                      </button>
                    );
                  })}
                </div>
              )}

              <div>
                <textarea
                  rows={4}
                  placeholder="Describe your research context, instructions for contributors, and criteria for valid data points..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#272729] text-[#D7DADC] text-sm rounded-lg p-3 border border-[#343536] focus:border-[#FF4500] focus:outline-none placeholder-[#818384] resize-y"
                ></textarea>
              </div>

              {activeTab === 'schema' && (
                <SchemaBuilder
                  fields={fields}
                  onChange={setFields}
                  goalCount={goalCount}
                  onGoalChange={setGoalCount}
                />
              )}

              {activeTab === 'media' && (
                <div className="border-2 border-dashed border-[#343536] hover:border-[#818384] rounded-xl p-8 flex flex-col items-center justify-center gap-3 text-center transition">
                  <div className="w-12 h-12 rounded-full bg-[#272729] flex items-center justify-center text-2xl">
                    📁
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#D7DADC]">Upload Reference Prompt</p>
                    <p className="text-xs text-[#818384] mt-0.5">
                      Upload sample CSVs, schema diagrams, or images
                    </p>
                  </div>
                  <input type="file" className="text-xs text-[#818384]" />
                </div>
              )}

              {activeTab === 'preview' && (
                <div className="bg-[#0E1113] p-4 rounded-lg border border-[#343536] font-mono text-xs overflow-x-auto">
                  <pre className="text-green-400">
                    {JSON.stringify(
                      {
                        title: title || 'Untitled',
                        schema: fields.reduce((acc, f) => ({ ...acc, [f.name || 'field']: f.type }), {}),
                        example_row: fields.reduce((acc, f) => ({ ...acc, [f.name || 'field']: f.exampleValue }), {}),
                        goal_count: goalCount,
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#343536]">
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('home')}
                  className="px-4 py-2 text-sm font-semibold rounded-full border border-[#343536] text-[#818384] hover:text-[#D7DADC] hover:bg-[#272729] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 text-sm font-semibold rounded-full bg-[#FF4500] hover:bg-[#E03D00] text-white transition disabled:opacity-50 shadow-sm cursor-pointer"
                >
                  {loading ? 'Publishing Dataset...' : 'Publish Data Request'}
                </button>
              </div>
            </form>
          </div>
        </main>

        <aside className="hidden lg:flex flex-col gap-4">
          <div className="bg-[#1A1A1B] border border-[#343536] rounded-xl p-4">
            <h2 className="font-semibold text-[#D7DADC] text-sm mb-2">Posting Best Practices</h2>
            <ol className="list-decimal list-inside space-y-2 text-xs text-[#818384]">
              <li>Use clean, underscore_cased column names.</li>
              <li>Always supply an accurate example row.</li>
              <li>Keep schema simple to maximize contributions.</li>
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
};