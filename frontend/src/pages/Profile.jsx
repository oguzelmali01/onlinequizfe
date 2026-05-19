import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { 'Authorization': `Bearer ${token}` } };

                const [userRes, historyRes] = await Promise.all([
                    axios.get('http://localhost:8080/api/users/me', config),
                    axios.get('http://localhost:8080/api/users/my-history', config)
                ]);

                setUser(userRes.data);
                
                // Tarihe göre artan sıraya (eskiden yeniye) dizebiliriz grafik için
                const reversedHistory = [...historyRes.data].reverse().map(item => ({
                    ...item,
                    displayDate: new Date(item.attemptDate).toLocaleDateString()
                }));
                
                setHistory(reversedHistory);
                setLoading(false);
            } catch (error) {
                console.error("Profil verileri çekilemedi!", error);
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    localStorage.removeItem('token');
                    navigate('/');
                }
                setLoading(false);
            }
        };
        fetchProfileData();
    }, [navigate]);

    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Yükleniyor...</div>;
    if (!user) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Kullanıcı bulunamadı!</div>;

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '30px 20px', fontFamily: '"Segoe UI", Roboto, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ color: '#2c3e50', margin: 0 }}>👤 Profilim & Geçmişim</h1>
                <button onClick={() => navigate('/quizzes')} style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>
                    Sınavlara Dön
                </button>
            </div>

            <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '30px', display: 'flex', gap: '30px', alignItems: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#5c6ac4', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2em', fontWeight: 'bold' }}>
                    {user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h2 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>{user.username}</h2>
                    <p style={{ margin: 0, color: '#7f8c8d', fontSize: '1.1em' }}>
                        Genel Puan: <strong style={{ color: '#27ae60' }}>{user.totalScore}</strong>
                    </p>
                </div>
            </div>

            {history.length > 0 ? (
                <div>
                    <h2 style={{ color: '#34495e', marginBottom: '20px' }}>📈 Başarı Grafiği</h2>
                    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '30px', height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={history}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ecf0f1" />
                                <XAxis dataKey="displayDate" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                                <Line type="monotone" dataKey="score" name="Alınan Puan" stroke="#5c6ac4" strokeWidth={4} dot={{ r: 6, fill: '#5c6ac4', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <h2 style={{ color: '#34495e', marginBottom: '20px' }}>📋 Önceki Sınavlarım</h2>
                    <div style={{ overflowX: 'auto', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #ecf0f1' }}>
                                    <th style={{ padding: '15px 20px', color: '#7f8c8d', fontWeight: '600' }}>Tarih</th>
                                    <th style={{ padding: '15px 20px', color: '#7f8c8d', fontWeight: '600' }}>Sınav Adı</th>
                                    <th style={{ padding: '15px 20px', color: '#7f8c8d', fontWeight: '600' }}>Doğru Sayısı</th>
                                    <th style={{ padding: '15px 20px', color: '#7f8c8d', fontWeight: '600' }}>Sınav Sonucu</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...history].reverse().map((attempt) => (
                                    <tr key={attempt.id} style={{ borderBottom: '1px solid #f1f2f6' }}>
                                        <td style={{ padding: '15px 20px', color: '#2c3e50' }}>{new Date(attempt.attemptDate).toLocaleString()}</td>
                                        <td style={{ padding: '15px 20px', color: '#2c3e50', fontWeight: '500' }}>{attempt.quiz.title}</td>
                                        <td style={{ padding: '15px 20px', color: '#3498db' }}>{attempt.correctAnswers} / {attempt.totalQuestions}</td>
                                        <td style={{ padding: '15px 20px', color: '#27ae60', fontWeight: 'bold' }}>{attempt.score}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '50px', backgroundColor: '#f8f9fa', borderRadius: '12px', color: '#7f8c8d' }}>
                    <h3 style={{ margin: '0 0 10px 0' }}>Henüz hiç sınava girmediniz.</h3>
                    <p>Hemen bir teste başlayın ve ilk puanınızı alın!</p>
                </div>
            )}
        </div>
    );
}

export default Profile;
