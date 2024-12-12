// Post Service for handling post-related operations
const postService = {
    // Get all posts
    getAllPosts: () => {
      try {
        const posts = JSON.parse(localStorage.getItem('posts') || '[]');
        return posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      } catch (error) {
        console.error('Error getting posts:', error);
        return [];
      }
    },
  
    // Get posts by username
    getUserPosts: (username) => {
      try {
        const posts = JSON.parse(localStorage.getItem('posts') || '[]');
        return posts
          .filter(post => post.username === username)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      } catch (error) {
        console.error('Error getting user posts:', error);
        return [];
      }
    },
  
    // Create new post
    createPost: (postData) => {
      try {
        const posts = JSON.parse(localStorage.getItem('posts') || '[]');
        const newPost = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          likes: 0,
          ...postData
        };
        posts.unshift(newPost);
        localStorage.setItem('posts', JSON.stringify(posts));
        return newPost;
      } catch (error) {
        console.error('Error creating post:', error);
        return null;
      }
    },
  
    // Update post
    updatePost: (postId, updates) => {
      try {
        const posts = JSON.parse(localStorage.getItem('posts') || '[]');
        const updatedPosts = posts.map(post => 
          post.id === postId ? { ...post, ...updates } : post
        );
        localStorage.setItem('posts', JSON.stringify(updatedPosts));
        return true;
      } catch (error) {
        console.error('Error updating post:', error);
        return false;
      }
    },
  
    // Delete post
    deletePost: (postId) => {
      try {
        const posts = JSON.parse(localStorage.getItem('posts') || '[]');
        const updatedPosts = posts.filter(post => post.id !== postId);
        localStorage.setItem('posts', JSON.stringify(updatedPosts));
        return true;
      } catch (error) {
        console.error('Error deleting post:', error);
        return false;
      }
    }
  };
  
  export default postService;