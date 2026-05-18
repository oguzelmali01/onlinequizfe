import React from 'react';
import { useNavigate } from 'react-router-dom';

function QuizList() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token'); // Çıkış yapınca anahtarı sil
        navigate('/'); // Login sayfasına geri dön
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>📚 Mevcut Sınavlar (Quizler)</h1>
            <p>Burada veritabanından gelen sınavlar listelenecek...</p>

            <button onClick={handleLogout} style={{ marginTop: '20px', padding: '10px', cursor: 'pointer', backgroundColor: '#ff4d4d', color: 'white', border: 'none' }}>
                Çıkış Yap
            </button>
        </div>
    );
}

export default QuizList;