'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminKeys() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      // Fetch a large number of posts for admin view
      const res = await fetch('/api/posts?limit=100');
      if (!res.ok) throw new Error('Failed to fetch posts');
      const data = await res.json();
      setPosts(data.posts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post permanently?')) return;

    try {
      const res = await fetch(`/api/posts?id=${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      
      // Remove from state
      setPosts(posts.filter(p => p._id !== id));
    } catch (err) {
      alert('Error deleting post: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold font-display">Freedom Wall - Admin Keys</h1>
          <Link href="/" className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded font-semibold transition-colors">
            Back to Site
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
            Error: {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-slate-500">Loading posts...</div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200">
                  <th className="p-4 font-semibold text-slate-600">ID / Date</th>
                  <th className="p-4 font-semibold text-slate-600">Author</th>
                  <th className="p-4 font-semibold text-slate-600 w-1/2">Content</th>
                  <th className="p-4 font-semibold text-slate-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {posts.map((post) => (
                  <tr key={post._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 align-top">
                      <div className="text-xs font-mono text-slate-400 mb-1">{post._id}</div>
                      <div className="text-sm text-slate-600">
                        {new Date(post.createdAt).toLocaleDateString()}{' '}
                        {new Date(post.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      {post.isAnonymous ? (
                        <span className="text-slate-500 italic">Anonymous</span>
                      ) : (
                        <span className="font-semibold text-slate-800">@{post.userHandle}</span>
                      )}
                      <div className="text-xs text-slate-500 mt-1">
                        Type: {post.contentType} <br/>
                        Mood: {post.mood}
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="text-sm text-slate-800 max-h-32 overflow-y-auto whitespace-pre-wrap">
                        {post.content}
                      </div>
                    </td>
                    <td className="p-4 align-top text-right">
                      <button
                        onClick={() => handleDelete(post._id)}
                        className="px-3 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded font-semibold text-sm transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {posts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">
                      No posts found in the database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
