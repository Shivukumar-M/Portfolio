import { useState, useEffect } from 'react';
import axios from 'axios';

const empty = { title: '', excerpt: '', content: '', coverImage: '', tags: '', published: false };

export default function BlogForm() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [view, setView] = useState('list'); // 'list' | 'editor'
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    axios.get('/api/blog', { headers }).then(r => setPosts(r.data)).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
      if (editing) {
        const { data } = await axios.put(`/api/blog/${editing}`, payload, { headers });
        setPosts(posts.map(p => p._id === editing ? data : p));
      } else {
        const { data } = await axios.post('/api/blog', payload, { headers });
        setPosts([data, ...posts]);
      }
      setForm(empty); setEditing(null); setView('list'); setMsg('Saved!');
    } catch { setMsg('Error saving.'); }
    setSaving(false);
    setTimeout(() => setMsg(''), 3000);
  };

  const del = async (id) => {
    await axios.delete(`/api/blog/${id}`, { headers });
    setPosts(posts.filter(p => p._id !== id));
  };

  const startEdit = (post) => {
    setEditing(post._id);
    setForm({ ...post, tags: (post.tags || []).join(', ') });
    setView('editor');
  };

  if (view === 'editor') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold text-lg">{editing ? 'Edit Post' : 'New Post'}</h3>
          <button onClick={() => { setView('list'); setEditing(null); setForm(empty); }}
            className="text-slate-400 hover:text-white text-sm transition-colors">
            <i className="fas fa-arrow-left mr-1"></i> Back
          </button>
        </div>

        <div>
          <label className="text-slate-400 text-sm">Title</label>
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
            className="w-full mt-1 bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm"
            placeholder="Post title..." />
        </div>
        <div>
          <label className="text-slate-400 text-sm">Cover Image URL (optional)</label>
          <input value={form.coverImage} onChange={e => setForm({ ...form, coverImage: e.target.value })}
            className="w-full mt-1 bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm"
            placeholder="https://..." />
        </div>
        <div>
          <label className="text-slate-400 text-sm">Excerpt (shown in listing)</label>
          <textarea value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })}
            rows={2} className="w-full mt-1 bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm resize-none"
            placeholder="Brief summary..." />
        </div>
        <div>
          <label className="text-slate-400 text-sm">Content (Markdown supported)</label>
          <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
            rows={14} className="w-full mt-1 bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm resize-none font-mono text-xs"
            placeholder="Write your post content here... (Markdown)" />
        </div>
        <div>
          <label className="text-slate-400 text-sm">Tags (comma-separated)</label>
          <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })}
            className="w-full mt-1 bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm"
            placeholder="React, Node.js, Tutorial" />
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-slate-300 text-sm cursor-pointer">
            <input type="checkbox" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })} className="rounded" />
            Publish immediately (visible on public portfolio)
          </label>
          <div className="flex items-center gap-3">
            {msg && <span className="text-green-400 text-sm">{msg}</span>}
            <button onClick={save} disabled={saving || !form.title || !form.content}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-40 text-sm font-medium">
              {saving ? 'Saving…' : editing ? 'Update' : 'Create Post'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold text-lg">Blog Posts ({posts.length})</h3>
        <button onClick={() => setView('editor')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2">
          <i className="fas fa-plus"></i> New Post
        </button>
      </div>

      {posts.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <i className="fas fa-pen-nib text-4xl mb-3 block"></i>
          <p>No posts yet. Write your first blog post!</p>
        </div>
      )}

      <div className="space-y-3">
        {posts.map(post => (
          <div key={post._id} className="bg-slate-700/40 border border-slate-600 rounded-xl p-4 flex justify-between items-start gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-white font-medium truncate">{post.title}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${post.published ? 'bg-green-500/20 text-green-400' : 'bg-slate-600 text-slate-400'}`}>
                  {post.published ? 'Published' : 'Draft'}
                </span>
              </div>
              {post.excerpt && <p className="text-slate-400 text-sm line-clamp-2">{post.excerpt}</p>}
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                <span><i className="fas fa-eye mr-1"></i>{post.views} views</span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                {post.tags?.length > 0 && <span className="text-blue-400">{post.tags.join(', ')}</span>}
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => startEdit(post)} className="text-slate-400 hover:text-blue-400 transition-colors"><i className="fas fa-edit"></i></button>
              <button onClick={() => del(post._id)} className="text-slate-400 hover:text-red-400 transition-colors"><i className="fas fa-trash"></i></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
