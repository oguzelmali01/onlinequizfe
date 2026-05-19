import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function QuizList() {
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState([]);
    const [userProfile, setUserProfile] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                };

                // Quizleri, Profili ve Liderlik Tablosunu aynı anda çek
                const [quizzesRes, profileRes, leaderboardRes] = await Promise.all([
                    axios.get('http://localhost:8080/api/quizzes', config),
                    axios.get('http://localhost:8080/api/users/me', config),
                    axios.get('http://localhost:8080/api/users/leaderboard', config)
                ]);

                setQuizzes(quizzesRes.data);
                setUserProfile(profileRes.data);
                setLeaderboard(leaderboardRes.data);
                setLoading(false);
            } catch (error) {
                console.error("Veriler çekerken hata oluştu!", error);
                setLoading(false);
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    // Token geçersizse veya yoksa login'e at
                    localStorage.removeItem('token');
                    navigate('/');
                }
            }
        };

        fetchData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    if (loading) {
        return <div style={{ textAlign: 'center', marginTop: '50px', fontSize: '1.2em' }}>Sayfa yükleniyor... Lütfen bekleyin.</div>;
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px', fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
            
            {/* Üst Kısım: Başlık ve Profil Bilgisi */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', paddingBottom: '20px', borderBottom: '2px solid #ecf0f1' }}>
                <h1 style={{ margin: 0, color: '#2c3e50' }}>📚 Sınav Merkezi</h1>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {userProfile && (
                        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f1f8ff', padding: '10px 20px', borderRadius: '30px', border: '1px solid #cce5ff' }}>
                            <div style={{ marginRight: '15px' }}>
                                <span style={{ display: 'block', fontSize: '0.9em', color: '#5c6ac4' }}>Hoş Geldin,</span>
                                <strong style={{ color: '#2c3e50', fontSize: '1.1em' }}>{userProfile.username}</strong>
                            </div>
                            <div style={{ backgroundColor: '#5c6ac4', color: 'white', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold', marginRight: '10px' }}>
                                🏆 {userProfile.totalScore} Puan
                            </div>
                        </div>
                    )}
                    
                    <button onClick={() => navigate('/profile')} style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', transition: 'background-color 0.2s' }}>
                        Profil & Geçmiş
                    </button>

                    {userProfile?.role === 'ADMIN' && (
                        <button onClick={() => navigate('/admin')} style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#8e44ad', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', transition: 'background-color 0.2s' }}>
                            Yönetici Paneli
                        </button>
                    )}

                    <button onClick={handleLogout} style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', transition: 'background-color 0.2s' }}>
                        Çıkış Yap
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                {/* Sol Kısım: Sınav Listesi */}
                <div style={{ flex: '3', minWidth: '300px' }}>
                    <h2 style={{ color: '#34495e', marginBottom: '20px' }}>Mevcut Sınavlar</h2>
                    {quizzes.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '50px', backgroundColor: '#f8f9fa', borderRadius: '10px', color: '#7f8c8d' }}>
                            Henüz sistemde hiç sınav bulunmuyor.
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                            {quizzes.map((quiz) => (
                                <div key={quiz.id} style={{
                                    border: '1px solid #e1e8ed',
                                    borderRadius: '12px',
                                    padding: '25px',
                                    backgroundColor: '#ffffff',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between'
                                }}>
                                    <div>
                                        <h3 style={{ marginTop: '0', color: '#2c3e50', fontSize: '1.3em', marginBottom: '10px' }}>{quiz.title}</h3>
                                        <p style={{ color: '#7f8c8d', lineHeight: '1.5', marginBottom: '20px', fontSize: '0.95em' }}>
                                            {quiz.description || "Bu sınav için bir açıklama bulunmuyor."}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                                        <span style={{ fontSize: '0.9em', color: '#95a5a6', fontWeight: '600' }}>
                                            📝 {quiz.questions?.length || 0} Soru
                                        </span>
                                        <button
                                            onClick={() => navigate(`/quiz/${quiz.id}`)}
                                            style={{
                                                padding: '8px 15px',
                                                cursor: 'pointer',
                                                backgroundColor: '#3498db',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                fontWeight: 'bold',
                                                transition: 'background-color 0.2s'
                                            }}>
                                            Sınava Başla
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sağ Kısım: Liderlik Tablosu */}
                <div style={{ flex: '1', minWidth: '250px' }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e1e8ed', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ color: '#f39c12', marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '2px solid #fcf3cf', paddingBottom: '10px' }}>
                            👑 En İyiler
                        </h2>
                        
                        {leaderboard.length === 0 ? (
                            <p style={{ color: '#7f8c8d', textAlign: 'center' }}>Henüz kimse puan kazanmadı.</p>
                        ) : (
                            <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                                {leaderboard.map((user, index) => (
                                    <li key={user.id} style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center',
                                        padding: '12px 0',
                                        borderBottom: index !== leaderboard.length - 1 ? '1px solid #f1f2f6' : 'none'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ 
                                                width: '24px', 
                                                height: '24px', 
                                                display: 'flex', 
                                                justifyContent: 'center', 
                                                alignItems: 'center', 
                                                backgroundColor: index === 0 ? '#f1c40f' : index === 1 ? '#bdc3c7' : index === 2 ? '#cd7f32' : '#ecf0f1',
                                                color: index <= 2 ? 'white' : '#7f8c8d',
                                                borderRadius: '50%',
                                                fontWeight: 'bold',
                                                fontSize: '0.8em'
                                            }}>
                                                {index + 1}
                                            </span>
                                            <strong style={{ color: userProfile?.username === user.username ? '#3498db' : '#2c3e50' }}>
                                                {user.username} {userProfile?.username === user.username && "(Sen)"}
                                            </strong>
                                        </div>
                                        <span style={{ fontWeight: 'bold', color: '#27ae60' }}>{user.totalScore}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
            
        </div>
    );
}

export default QuizList;