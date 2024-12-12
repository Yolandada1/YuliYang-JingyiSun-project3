import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar/Navbar';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import PostList from './components/Posts/PostList';
import UserProfile from './components/User/UserProfile';

const MainContent = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedUser, setSelectedUser] = useState(null);
  const { user, logout } = useAuth();

  const handleNavigation = (page) => {
    setCurrentPage(page);
    if (page === 'home') {
      setSelectedUser(null);
    }
  };

  const handleLoginSuccess = () => {
    setCurrentPage('home');
  };

  const handleRegisterSuccess = () => {
    setCurrentPage('home');
  };

  const handleUserClick = (username) => {
    setSelectedUser(username);
    setCurrentPage('profile');
  };

  const handleBack = () => {
    setCurrentPage('home');
    setSelectedUser(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        user={user} 
        onLogout={logout}
        onNavigate={handleNavigation}
      />
      
      <main className="container mx-auto py-4">
        {currentPage === 'login' && (
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        )}
        {currentPage === 'register' && (
          <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
        )}
        {currentPage === 'home' && (
          <div>
            <h1 className="text-2xl font-bold text-center mb-6">
              {user ? `Welcome, ${user.username}!` : 'Welcome to SocialApp'}
            </h1>
            <PostList 
              user={user}
              onUserClick={handleUserClick}
            />
          </div>
        )}
        {currentPage === 'profile' && selectedUser && (
          <UserProfile
            username={selectedUser}
            onBack={handleBack}
          />
        )}
      </main>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
};

export default App;