import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import Homepage from './pages/Homepage';
import ProfilePage from './pages/ProfilePage';
import SavedPostsPage from './pages/SavedPostsPage';
import SearchPeoplePage from './pages/SearchPeoplePage';
import ChatPage from './pages/ChatPage';
import AdminPage from './pages/AdminPage';
import FriendRequestPage from './pages/FriendRequestsPage';
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';
import MiniChatProvider from './context/MiniChatContext';

function App() {
  return (
    <MiniChatProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route path="/home" element={<Homepage />} />

        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:userId" element={<ProfilePage />} />
        <Route path="/saved" element={<SavedPostsPage />} />
        <Route path="/friends" element={<FriendRequestPage />} />
        <Route path="/search/people" element={<SearchPeoplePage />} />
        <Route path="/messages" element={<ChatPage />} />

        <Route
          path="/admin/*"
          element={
            <AdminProtectedRoute>
              <AdminPage />
            </AdminProtectedRoute>
          }
        />

        {/* Nếu nhập sai route thì quay về login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </MiniChatProvider>
  );
}

export default App;
