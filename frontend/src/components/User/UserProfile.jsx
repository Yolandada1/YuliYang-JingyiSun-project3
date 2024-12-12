import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const UserProfile = ({ username, onBack }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [posts, setPosts] = useState([]);
  const [description, setDescription] = useState('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    loadUserData();
  }, [username]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      // Load user info
      const userResponse = await fetch(`/api/users/${username}`, {
        credentials: 'include'
      });
      
      if (!userResponse.ok) {
        throw new Error('Failed to load user info');
      }
      
      const userData = await userResponse.json();
      setUserInfo(userData);
      setDescription(userData.description || '');

      // Load user's posts
      const postsResponse = await fetch(`/api/posts/user/${username}`, {
        credentials: 'include'
      });
      
      if (!postsResponse.ok) {
        throw new Error('Failed to load posts');
      }
      
      const postsData = await postsResponse.json();
      setPosts(postsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDescription = async () => {
    try {
      const response = await fetch('/api/users/description', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ description }),
      });

      if (!response.ok) {
        throw new Error('Failed to update description');
      }

      setUserInfo(prev => ({
        ...prev,
        description
      }));
      setIsEditingDescription(false);
    } catch (err) {
      console.error('Error updating description:', err);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }
      
      setPosts(posts.filter(post => post._id !== postId));
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-xl text-red-500 mb-4">{error}</div>
        <button 
          onClick={onBack}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-xl text-gray-600 mb-4">User not found</div>
        <button 
          onClick={onBack}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Mobile-friendly header with back button */}
      <div className="sticky top-0 bg-white z-10 mb-4 p-2 border-b md:static md:border-none">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-gray-100 md:hidden"
          >
            ←
          </button>
          <h1 className="text-xl font-bold">{username}'s Profile</h1>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl">
            {username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{username}</h2>
            <p className="text-gray-500">
              Joined {new Date(userInfo.joinDate).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        {/* Description */}
        <div className="mt-4">
          {isEditingDescription && currentUser?.username === username ? (
            <div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Add a description..."
                maxLength={500}
              />
              <div className="mt-2 flex space-x-2">
                <button
                  onClick={handleSaveDescription}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditingDescription(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-gray-700">
                {userInfo.description || 'No description yet.'}
              </p>
              {currentUser?.username === username && (
                <button
                  onClick={() => setIsEditingDescription(true)}
                  className="mt-2 text-blue-500 hover:text-blue-700"
                >
                  Edit description
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* User's Posts */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold mb-4">Posts</h3>
        {posts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No posts yet
          </div>
        ) : (
          posts.map(post => (
            <div key={post._id} className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-start">
                <div className="font-medium text-gray-900">{post.username}</div>
                <span className="text-gray-500 text-sm">
                  {new Date(post.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="mt-2 text-gray-700 break-words">{post.content}</p>
              {currentUser?.username === username && (
                <div className="mt-3">
                  <button
                    onClick={() => handleDeletePost(post._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserProfile;