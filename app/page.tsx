"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

interface PostItem {
  post_id: string;
  post_title: string;
  post_content: string;
  author: { user_id: string; user_name: string };
  _count: { comments: number; likes: number };
}

interface PaginationData {
  data: PostItem[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export default function Home() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPosts = useCallback(async (pageNum: number) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/posts?page=${pageNum}&limit=10`);
      if (!res.ok) throw new Error("Failed to fetch posts");
      const data: PaginationData = await res.json();
      setPosts(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError("Failed to load posts");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(page);
  }, [page, fetchPosts]);

  const handleNextPage = () => {
    if (page < pagination.pages) setPage(page + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <div className="sticky top-0 bg-white shadow-sm z-50">
        <div className="max-w-4xl mx-auto px-4 lg:px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Community Board 📢</h1>
          <Link 
            href="/create-post" 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            ✏️ New Post
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No posts yet</p>
            <Link href="/create-post" className="text-blue-600 hover:text-blue-700 font-medium">
              Be the first to post →
            </Link>
          </div>
        )}

        {/* Posts Grid */}
        <div className="space-y-4 mb-8">
          {posts.map((post) => (
            <Link
              key={post.post_id}
              href={`/posts/${post.post_id}`}
              className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 hover:border-gray-300 overflow-hidden"
            >
              <div className="p-6 lg:p-8">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <h2 className="text-xl lg:text-2xl font-semibold text-gray-900 flex-1 line-clamp-2 hover:text-blue-600 transition">
                    {post.post_title}
                  </h2>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {post.post_content}
                </p>
                <div className="flex items-center justify-between flex-wrap gap-3 pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-600">
                    By <span className="font-medium text-gray-900">{post.author.user_name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>❤️ {post._count.likes}</span>
                    <span>💬 {post._count.comments}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center items-center gap-4">
            <button
              onClick={handlePrevPage}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
            >
              ← Previous
            </button>
            <div className="text-gray-700 font-medium">
              Page {page} of {pagination.pages}
            </div>
            <button
              onClick={handleNextPage}
              disabled={page === pagination.pages}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}