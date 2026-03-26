"use client";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Post {
  post_id: string;
  post_title: string;
  post_content: string;
  author: { user_id: string; user_name: string };
  comments: Comment[];
  _count: { comments: number; likes: number };
}

interface Comment {
  comment_id: string;
  comment_content: string;
  author: { user_id: string; user_name: string };
}

export default function PostDetail() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [newComment, setNewComment] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const postIdParam = params?.id;
  const postId = Array.isArray(postIdParam) ? postIdParam[0] : postIdParam;

  const fetchPost = useCallback(async () => {
    if (!postId) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/posts/${postId}`);
      if (!res.ok) throw new Error("Post not found");

      const data = await res.json();
      setPost(data);

      // Fetch like status
      const userId = localStorage.getItem("userId");
      const likeRes = await fetch(`/api/likes?post_id=${encodeURIComponent(postId)}&user_id=${encodeURIComponent(userId || "")}`);
      if (likeRes.ok) {
        const likeData = await likeRes.json();
        setIsLiked(likeData.isLiked);
        setLikeCount(likeData.likeCount);
      }
    } catch (err) {
      setError("Failed to load post");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    const id = localStorage.getItem("userId");
    setUserId(id);
    if (postId) {
      fetchPost();
    }
  }, [fetchPost, postId]);

  const handleLike = async () => {
    if (!userId) {
      alert("Please login to like posts");
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        body: JSON.stringify({ user_id: userId, post_id: postId }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsLiked(data.liked);
        setLikeCount(prev => data.liked ? prev + 1 : prev - 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      alert("Please login to comment");
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        body: JSON.stringify({
          content: newComment,
          post_id: postId,
          author_id: userId,
        }),
      });
      if (res.ok) {
        setNewComment("");
        fetchPost(); // Refresh comments
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Delete this comment?")) return;

    try {
      const res = await fetch("/api/comments", {
        method: "DELETE",
        body: JSON.stringify({ comment_id: commentId, author_id: userId }),
      });
      if (res.ok) {
        fetchPost();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center"><p className="text-red-500">{error}</p></div>;
  if (!post) return <div className="min-h-screen flex items-center justify-center"><p>Post not found</p></div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 lg:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <Link 
          href="/" 
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 transition"
        >
          ← Back to Posts
        </Link>

        {/* Post */}
        <div className="bg-white rounded-lg shadow-md p-6 lg:p-8 mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{post.post_title}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">By {post.author.user_name}</span>
              </div>
            </div>
          </div>

          <p className="text-gray-700 text-lg leading-relaxed mb-6 whitespace-pre-wrap">
            {post.post_content}
          </p>

          {/* Actions */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                isLiked
                  ? "bg-red-100 text-red-600 hover:bg-red-200"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              ❤️ {likeCount} {likeCount === 1 ? "Like" : "Likes"}
            </button>
            <div className="text-gray-600 px-4 py-2">
              💬 {post._count.comments} {post._count.comments === 1 ? "Comment" : "Comments"}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow-md p-6 lg:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Comments ({post._count.comments})</h2>

          {/* Add Comment */}
          {userId ? (
            <form onSubmit={handleCommentSubmit} className="mb-8 pb-8 border-b border-gray-200">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                required
              />
              <button
                type="submit"
                className="mt-3 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Post Comment
              </button>
            </form>
          ) : (
            <div className="mb-8 pb-8 border-b border-gray-200 bg-blue-50 p-4 rounded-lg">
              <p className="text-gray-700 mb-3">
                <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Login
                </Link>
                {" "}to comment
              </p>
            </div>
          )}

          {/* Display Comments */}
          <div className="space-y-4">
            {post.comments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
            ) : (
              post.comments.map((comment) => (
                <div key={comment.comment_id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-gray-900">{comment.author.user_name}</div>
                    {userId === comment.author.user_id && (
                      <button
                        onClick={() => handleDeleteComment(comment.comment_id)}
                        className="text-red-600 hover:text-red-700 text-sm transition"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{comment.comment_content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
