// User Service for handling user-related operations
const userService = {
    // Get user data from localStorage
    getUser: (username) => {
      try {
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        return users[username];
      } catch (error) {
        console.error('Error getting user:', error);
        return null;
      }
    },
  
    // Update user data
    updateUser: (username, userData) => {
      try {
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        users[username] = { ...users[username], ...userData };
        localStorage.setItem('users', JSON.stringify(users));
        return true;
      } catch (error) {
        console.error('Error updating user:', error);
        return false;
      }
    },
  
    // Check if username exists
    checkUsername: (username) => {
      try {
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        return !!users[username];
      } catch (error) {
        console.error('Error checking username:', error);
        return false;
      }
    },
  
    // Get all users
    getAllUsers: () => {
      try {
        return JSON.parse(localStorage.getItem('users') || '{}');
      } catch (error) {
        console.error('Error getting all users:', error);
        return {};
      }
    }
  };
  
  export default userService;