import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import QuizList from './pages/QuizList';
import QuizDetail from './pages/QuizDetail';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

/**
 * App Bileşeni
 * React uygulamasının ana yönlendirme (Routing) yapısını içerir.
 * URL yollarına göre hangi sayfanın (bileşenin) ekranda gösterileceğini belirler.
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ana sayfa - Giriş ve Kayıt ekranı */}
        <Route path="/" element={<Login />} />
        
        {/* Başarılı giriş sonrası sınavların listelendiği sayfa */}
        <Route path="/quizzes" element={<QuizList />} />
        
        {/* Belirli bir ID'ye sahip sınavın çözüldüğü sayfa */}
        <Route path="/quiz/:id" element={<QuizDetail />} />
        
        {/* Kullanıcının kendi profil ve geçmişini gördüğü sayfa */}
        <Route path="/profile" element={<Profile />} />
        
        {/* Sadece ADMIN yetkili kullanıcıların erişebildiği panel */}
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;