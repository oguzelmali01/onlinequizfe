import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import QuizList from './pages/QuizList'; // YENİ EKLENDİ

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        {/* YENİ EKLENDİ: /quizzes adresine gidilirse QuizList sayfasını aç */}
        <Route path="/quizzes" element={<QuizList />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;