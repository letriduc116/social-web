import {
  // Navigate,
  Route,
  Routes,
} from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Homepage from './pages/Homepage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/profile/:userId" element={<ProfilePage />} />
    </Routes>
  );
}

export default App;
