import React, { useState } from 'react';
import axios from 'axios';

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return 'just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const MessagesInbox = ({ messagesData, setMessagesData }) => {
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [filter, setFilter]     = useState('all'); // 'all' | 'unread'

  const unreadCount = messagesData.filter(m => !m.read).length;
  const visible     = filter === 'unread' ? messagesData.filter(m => !m.read) : messagesData;

  const openMessage = async (msg) => {
    setSelected(msg);
    if (!msg.read) {
      try {
        await axios.patch(`/api/messages/${msg._id}/read`, {}, { headers: authHeaders() });
        setMessagesData(prev => prev.map(m => m._id === msg._id ? { ...m, read: true } : m));
        setSelected(prev => prev?._id === msg._id ? { ...prev, read: true } : prev);
      } catch { /* non-critical */ }
    }
  };

  const deleteMessage = async (id, e) => {
    e.stopPropagation();
    setDeleting(id);
    try {
      await axios.delete(`/api/messages/${id}`, { headers: authHeaders() });
      setMessagesData(prev => prev.filter(m => m._id !== id));
      if (selected?._id === id) setSelected(null);
    } catch { /* non-critical */ }
    finally { setDeleting(null); }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Messages</h2>
          <p className="text-slate-400 text-sm mt-1">
            {unreadCount > 0
              ? <span className="text-blue-400 font-medium">{unreadCount} unread</span>
              : 'All caught up'}
            {' · '}{messagesData.length} total
          </p>
        </div>
        <div className="flex gap-2">
          {['all', 'unread'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all duration-200 ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">{filter === 'unread' ? '✓' : '📭'}</div>
          <p className="text-slate-400 text-lg">
            {filter === 'unread' ? 'No unread messages' : 'No messages yet'}
          </p>
          <p className="text-slate-500 text-sm mt-1">
            {filter === 'all' && 'Messages from your public portfolio contact form will appear here.'}
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-5 gap-4">
          {/* List pane */}
          <div className="lg:col-span-2 space-y-2 max-h-[560px] overflow-y-auto pr-1">
            {visible.map(msg => (
              <div
                key={msg._id}
                onClick={() => openMessage(msg)}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 group ${
                  selected?._id === msg._id
                    ? 'border-blue-500 bg-blue-900/20'
                    : msg.read
                      ? 'border-slate-700 bg-slate-800/40 hover:border-slate-600'
                      : 'border-blue-700/50 bg-blue-950/20 hover:border-blue-500/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Avatar */}
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                      msg.read ? 'bg-slate-700 text-slate-400' : 'bg-blue-600 text-white'
                    }`}>
                      {msg.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-semibold truncate ${msg.read ? 'text-slate-300' : 'text-white'}`}>
                          {msg.name}
                        </p>
                        {!msg.read && (
                          <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate">{msg.subject}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-xs text-slate-500 whitespace-nowrap">{timeAgo(msg.createdAt)}</span>
                    <button
                      onClick={e => deleteMessage(msg._id, e)}
                      disabled={deleting === msg._id}
                      className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-900/20 transition-all duration-200 ml-1"
                    >
                      {deleting === msg._id
                        ? <i className="fas fa-spinner fa-spin text-xs" />
                        : <i className="fas fa-trash text-xs" />}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2 line-clamp-1 pl-12">{msg.message}</p>
              </div>
            ))}
          </div>

          {/* Detail pane */}
          <div className="lg:col-span-3">
            {selected ? (
              <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6 h-full">
                {/* Sender info */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                      {selected.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">{selected.name}</h3>
                      <a href={`mailto:${selected.email}`}
                        className="text-blue-400 text-sm hover:underline">
                        {selected.email}
                      </a>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">{new Date(selected.createdAt).toLocaleString()}</p>
                    <button
                      onClick={e => deleteMessage(selected._id, e)}
                      disabled={deleting === selected._id}
                      className="mt-2 text-xs text-red-400 hover:text-red-300 flex items-center gap-1 ml-auto transition-colors"
                    >
                      <i className="fas fa-trash" /> Delete
                    </button>
                  </div>
                </div>

                {/* Subject */}
                <div className="mb-4 pb-4 border-b border-slate-700">
                  <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Subject</p>
                  <p className="text-white font-semibold">{selected.subject}</p>
                </div>

                {/* Body */}
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Message</p>
                  <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                </div>

                {/* Reply button */}
                <div className="mt-6 pt-4 border-t border-slate-700">
                  <a
                    href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors duration-200"
                  >
                    <i className="fas fa-reply" /> Reply via Email
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-slate-800/30 rounded-xl border border-slate-700 border-dashed h-full flex items-center justify-center min-h-48">
                <div className="text-center">
                  <i className="fas fa-envelope-open text-slate-600 text-3xl mb-3" />
                  <p className="text-slate-500">Select a message to read</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesInbox;
