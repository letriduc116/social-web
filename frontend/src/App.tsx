import {
  // Navigate,
  Route,
  Routes,
} from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Homepage from './pages/Homepage';
import ProfilePage from './pages/ProfilePage';
import SearchPeoplePage from './pages/SearchPeoplePage';
import ChatPage from './pages/ChatPage';
import MiniChatProvider from './context/MiniChatContext';

function App() {
  return (
    <MiniChatProvider>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:userId" element={<ProfilePage />} />
        <Route path="/search/people" element={<SearchPeoplePage />} />
        <Route path="/messages" element={<ChatPage />} />
      </Routes>
    </MiniChatProvider>
  );
}

export default App;
