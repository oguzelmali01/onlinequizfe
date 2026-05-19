import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import QuizList from './pages/QuizList';
import QuizDetail from './pages/QuizDetail';
import Profile from './pages/Profile'; // EKLENDİ
import AdminDashboard from './pages/AdminDashboard'; // EKLENDİ

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/quizzes" element={<QuizList />} />
        <Route path="/quiz/:id" element={<QuizDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;