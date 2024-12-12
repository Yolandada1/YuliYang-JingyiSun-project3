import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const PostList = ({ user, onUserClick }) => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/posts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPosts(data);
      setError(null);
    } catch (err) {
      console.error('Error loading posts:', err);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim() || !user) return;

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          content: newPost.trim(),
          username: user.username
        }),
      });

      if (!response.ok) throw new Error('Failed to create post');
      const post = await response.json();
      setPosts([post, ...posts]);
      setNewPost('');
    } catch (err) {
      console.error('Error creating post:', err);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete post');
      setPosts(posts.filter(post => post._id !== postId));
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const handleEditPost = async (postId, newContent) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ content: newContent }),
      });
      
      if (!response.ok) throw new Error('Failed to update post');
      const updatedPost = await response.json();
      setPosts(posts.map(post => 
        post._id === postId ? updatedPost : post
      ));
    } catch (err) {
      console.error('Error updating post:', err);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 px-4 md:px-0">
      {user && (
        <form onSubmit={handleCreatePost} className="bg-white p-4 rounded-lg shadow-md">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-2 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            maxLength={280}
          />
          <div className="mt-2 flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {280 - newPost.length} characters remaining
            </span>
            <button
              type="submit"
              disabled={!newPost.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 
                       disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Post
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No posts yet. Be the first to post!
          </div>
        ) : (
          posts.map(post => (
            <PostItem
              key={post._id}
              post={post}
              currentUser={user}
              onDelete={handleDeletePost}
              onEdit={handleEditPost}
              onUserClick={onUserClick}
            />
          ))
        )}
      </div>
    </div>
  );
};

const PostItem = ({ post, currentUser, onDelete, onEdit, onUserClick }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== post.content) {
      onEdit(post._id, editContent.trim());
    }
    setIsEditing(false);
  };

  const isOwner = currentUser && currentUser.username === post.username;

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-start">
        <button
          onClick={() => onUserClick(post.username)}
          className="flex items-center space-x-2 font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
            {post.username.charAt(0).toUpperCase()}
          </div>
          <span>{post.username}</span>
        </button>
        <span className="text-gray-500 text-sm">
          {new Date(post.createdAt).toLocaleString()}
        </span>
      </div>

      <div className="mt-2 pl-10">
        {isEditing ? (
          <div>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              maxLength={280}
            />
            <div className="mt-2 flex space-x-2">
              <button
                onClick={handleSaveEdit}
                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-gray-700 break-words">
              {post.content}
            </p>
            {isOwner && (
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(post._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostList;