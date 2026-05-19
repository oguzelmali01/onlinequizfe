import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AdminDashboard() {
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState([]);
    const [users, setUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('quizzes');
    const [loading, setLoading] = useState(true);

    // Yeni Sınav Formu State'leri
    const [showAddModal, setShowAddModal] = useState(false);
    const [editQuizId, setEditQuizId] = useState(null); // Düzenlenen sınavın ID'si
    const [newQuiz, setNewQuiz] = useState({
        title: '',
        description: '',
        category: '',
        timeLimitSeconds: 0,
        questions: []
    });

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { 'Authorization': `Bearer ${token}` } };

                const [quizzesRes, usersRes] = await Promise.all([
                    axios.get('http://localhost:8080/api/quizzes', config),
                    axios.get('http://localhost:8080/api/admin/users', config)
                ]);

                setQuizzes(quizzesRes.data);
                setUsers(usersRes.data);
                setLoading(false);
            } catch (error) {
                console.error("Admin verileri çekilemedi!", error);
                alert("Yetkisiz erişim! Admin paneline sadece yöneticiler girebilir.");
                navigate('/quizzes');
            }
        };

        fetchAdminData();
    }, [navigate]);

    const handleDeleteQuiz = async (id) => {
        if (!window.confirm("Bu sınavı silmek istediğinize emin misiniz?")) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8080/api/admin/quizzes/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setQuizzes(quizzes.filter(q => q.id !== id));
            alert("Sınav silindi.");
        } catch (error) {
            alert("Silme işlemi başarısız!");
        }
    };

    // Sınavı Düzenleme Moduna Geçir
    const handleEditQuiz = (quiz) => {
        setEditQuizId(quiz.id);
        setNewQuiz({
            title: quiz.title || '',
            description: quiz.description || '',
            category: quiz.category || '',
            timeLimitSeconds: quiz.timeLimitSeconds || 0,
            questions: quiz.questions ? [...quiz.questions] : []
        });
        setShowAddModal(true);
    };

    // Formu İptal Et
    const handleCancelForm = () => {
        setShowAddModal(false);
        setEditQuizId(null);
        setNewQuiz({ title: '', description: '', category: '', timeLimitSeconds: 0, questions: [] });
    };

    // Yeni Soru Ekleme
    const handleAddQuestion = () => {
        setNewQuiz({
            ...newQuiz,
            questions: [
                ...newQuiz.questions,
                { text: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A' }
            ]
        });
    };

    // Soru alanlarını güncelleme
    const handleQuestionChange = (index, field, value) => {
        const updatedQuestions = [...newQuiz.questions];
        updatedQuestions[index][field] = value;
        setNewQuiz({ ...newQuiz, questions: updatedQuestions });
    };

    // Soru Silme
    const handleRemoveQuestion = (index) => {
        const updatedQuestions = newQuiz.questions.filter((_, i) => i !== index);
        setNewQuiz({ ...newQuiz, questions: updatedQuestions });
    };

    // Form Gönderme
    const handleSubmitNewQuiz = async (e) => {
        e.preventDefault();
        if (newQuiz.questions.length === 0) {
            alert("Lütfen en az bir soru ekleyin!");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'Authorization': `Bearer ${token}` } };

            if (editQuizId) {
                // Güncelleme İşlemi (PUT)
                await axios.put(`http://localhost:8080/api/admin/quizzes/${editQuizId}`, newQuiz, config);
                alert("Sınav başarıyla güncellendi!");
            } else {
                // Yeni Ekleme İşlemi (POST)
                await axios.post('http://localhost:8080/api/quizzes', newQuiz, config);
                alert("Sınav başarıyla oluşturuldu!");
            }
            
            setShowAddModal(false);
            setEditQuizId(null);
            setNewQuiz({ title: '', description: '', category: '', timeLimitSeconds: 0, questions: [] });
            
            // Listeyi güncelle
            const response = await axios.get('http://localhost:8080/api/quizzes', config);
            setQuizzes(response.data);
            
        } catch (error) {
            console.error("Sınav işlemi sırasında hata:", error);
            alert("Sınav kaydedilirken bir hata oluştu.");
        }
    };

    const [selectedUser, setSelectedUser] = useState(null);
    const [userHistory, setUserHistory] = useState([]);

    const handleViewUser = async (user) => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            const historyRes = await axios.get(`http://localhost:8080/api/admin/users/${user.id}/history`, config);
            
            let runningTotal = 0;
            const maxScoresPerQuiz = {};

            const reversedHistory = [...historyRes.data].reverse().map(item => {
                let netGain = 0;
                const prevMax = maxScoresPerQuiz[item.quiz.id] || 0;
                if (item.score > prevMax) {
                    netGain = item.score - prevMax;
                    maxScoresPerQuiz[item.quiz.id] = item.score;
                }
                runningTotal += netGain;

                return {
                    ...item,
                    displayDate: new Date(item.attemptDate).toLocaleString('tr-TR', { 
                        day: '2-digit', month: '2-digit', year: 'numeric', 
                        hour: '2-digit', minute: '2-digit' 
                    }),
                    netGain: netGain,
                    cumulativeScore: runningTotal
                };
            });

            setUserHistory(reversedHistory);
            setSelectedUser(user);
        } catch (error) {
            console.error("Kullanıcı geçmişi çekilemedi!", error);
            alert("Kullanıcı geçmişi yüklenirken hata oluştu.");
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Bu kullanıcıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz!")) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8080/api/admin/users/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert("Kullanıcı başarıyla silindi.");
            setUsers(users.filter(u => u.id !== userId));
            setSelectedUser(null);
        } catch (error) {
            alert("Silme işlemi başarısız!");
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Yükleniyor...</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px', fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '30px', 
                padding: '25px 30px', 
                borderRadius: '16px',
                backgroundColor: '#9b59b6',
                color: 'white',
                boxShadow: '0 10px 25px rgba(155, 89, 182, 0.3)'
            }}>
                <h1 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '10px', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <span style={{ fontSize: '1.2em' }}>🛡️</span> Yönetici Paneli
                </h1>
                <button onClick={() => navigate('/quizzes')} style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.5)', borderRadius: '6px', fontWeight: 'bold', transition: 'all 0.2s', backdropFilter: 'blur(5px)' }}
                        onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.3)'}
                        onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'}>
                    Sınavlara Dön
                </button>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                <button 
                    onClick={() => setActiveTab('quizzes')}
                    style={{ flex: 1, padding: '15px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: activeTab === 'quizzes' ? '#9b59b6' : '#ecf0f1', color: activeTab === 'quizzes' ? 'white' : '#7f8c8d', transition: 'background-color 0.2s' }}
                >
                    📚 Sınav Yönetimi
                </button>
                <button 
                    onClick={() => setActiveTab('users')}
                    style={{ flex: 1, padding: '15px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: activeTab === 'users' ? '#9b59b6' : '#ecf0f1', color: activeTab === 'users' ? 'white' : '#7f8c8d', transition: 'background-color 0.2s' }}
                >
                    👥 Kullanıcılar ve Sonuçlar
                </button>
            </div>

            {activeTab === 'quizzes' && (
                <div>
                    {!showAddModal ? (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h2>Mevcut Sınavlar</h2>
                                <button 
                                    onClick={() => {
                                        setEditQuizId(null);
                                        setNewQuiz({ title: '', description: '', category: '', timeLimitSeconds: 0, questions: [] });
                                        setShowAddModal(true);
                                    }}
                                    style={{ padding: '10px 20px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                    + Yeni Sınav Ekle
                                </button>
                            </div>
                            
                            <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #ecf0f1' }}>
                                            <th style={{ padding: '15px 20px', color: '#7f8c8d' }}>ID</th>
                                            <th style={{ padding: '15px 20px', color: '#7f8c8d' }}>Sınav Adı</th>
                                            <th style={{ padding: '15px 20px', color: '#7f8c8d' }}>Kategori</th>
                                            <th style={{ padding: '15px 20px', color: '#7f8c8d' }}>Süre</th>
                                            <th style={{ padding: '15px 20px', color: '#7f8c8d' }}>İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {quizzes.map(quiz => (
                                            <tr key={quiz.id} style={{ borderBottom: '1px solid #f1f2f6' }}>
                                                <td style={{ padding: '15px 20px' }}>#{quiz.id}</td>
                                                <td style={{ padding: '15px 20px', fontWeight: 'bold' }}>{quiz.title}</td>
                                                <td style={{ padding: '15px 20px' }}>{quiz.category || '-'}</td>
                                                <td style={{ padding: '15px 20px' }}>{quiz.timeLimitSeconds ? `${quiz.timeLimitSeconds / 60} dk` : 'Süresiz'}</td>
                                                <td style={{ padding: '15px 20px', display: 'flex', gap: '10px' }}>
                                                    <button onClick={() => handleEditQuiz(quiz)} style={{ padding: '5px 10px', backgroundColor: '#f39c12', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Düzenle</button>
                                                    <button onClick={() => handleDeleteQuiz(quiz.id)} style={{ padding: '5px 10px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Sil</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        // Yeni Sınav Ekleme / Düzenleme Formu
                        <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h2 style={{ margin: 0 }}>{editQuizId ? '✏️ Sınavı Düzenle' : '✨ Yeni Sınav Oluştur'}</h2>
                                <button onClick={handleCancelForm} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1em' }}>İptal Et</button>
                            </div>
                            
                            <form onSubmit={handleSubmitNewQuiz}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>Sınav Başlığı</label>
                                        <input type="text" required value={newQuiz.title} onChange={e => setNewQuiz({...newQuiz, title: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #bdc3c7', boxSizing: 'border-box' }} placeholder="Örn: Tarih Quiz 1" />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>Kategori</label>
                                        <input type="text" value={newQuiz.category} onChange={e => setNewQuiz({...newQuiz, category: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #bdc3c7', boxSizing: 'border-box' }} placeholder="Örn: Genel Kültür" />
                                    </div>
                                    <div style={{ gridColumn: '1 / span 2' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>Açıklama</label>
                                        <textarea value={newQuiz.description} onChange={e => setNewQuiz({...newQuiz, description: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #bdc3c7', boxSizing: 'border-box', minHeight: '80px' }} placeholder="Sınav hakkında kısa bilgi..." />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>Süre Dakika (Sınırsız yapmak için 0 yazın)</label>
                                        <input 
                                            type="number" 
                                            min="0" 
                                            placeholder="0"
                                            value={newQuiz.timeLimitSeconds === 0 ? '' : newQuiz.timeLimitSeconds / 60} 
                                            onChange={e => {
                                                const val = e.target.value;
                                                setNewQuiz({...newQuiz, timeLimitSeconds: val === '' ? 0 : parseInt(val, 10) * 60});
                                            }} 
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #bdc3c7', boxSizing: 'border-box' }} 
                                        />
                                    </div>
                                </div>

                                <div style={{ borderTop: '2px solid #ecf0f1', paddingTop: '20px', marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                        <h3 style={{ margin: 0 }}>Sorular ({newQuiz.questions.length})</h3>
                                        <button type="button" onClick={handleAddQuestion} style={{ padding: '8px 15px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                                            + Soru Ekle
                                        </button>
                                    </div>

                                    {newQuiz.questions.map((q, index) => (
                                        <div key={index} style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px', position: 'relative' }}>
                                            <button type="button" onClick={() => handleRemoveQuestion(index)} style={{ position: 'absolute', top: '10px', right: '10px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '50%', width: '25px', height: '25px', cursor: 'pointer' }}>X</button>
                                            
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>{index + 1}. Soru Metni</label>
                                            <input type="text" required value={q.text} onChange={e => handleQuestionChange(index, 'text', e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #bdc3c7', boxSizing: 'border-box' }} />

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.9em', color: '#7f8c8d', marginBottom: '5px' }}>A Şıkkı</label>
                                                    <input type="text" required value={q.optionA} onChange={e => handleQuestionChange(index, 'optionA', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #bdc3c7', boxSizing: 'border-box' }} />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.9em', color: '#7f8c8d', marginBottom: '5px' }}>B Şıkkı</label>
                                                    <input type="text" required value={q.optionB} onChange={e => handleQuestionChange(index, 'optionB', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #bdc3c7', boxSizing: 'border-box' }} />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.9em', color: '#7f8c8d', marginBottom: '5px' }}>C Şıkkı</label>
                                                    <input type="text" required value={q.optionC} onChange={e => handleQuestionChange(index, 'optionC', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #bdc3c7', boxSizing: 'border-box' }} />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.9em', color: '#7f8c8d', marginBottom: '5px' }}>D Şıkkı</label>
                                                    <input type="text" required value={q.optionD} onChange={e => handleQuestionChange(index, 'optionD', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #bdc3c7', boxSizing: 'border-box' }} />
                                                </div>
                                            </div>

                                            <div style={{ marginTop: '15px' }}>
                                                <label style={{ fontWeight: 'bold', color: '#27ae60', marginRight: '10px' }}>Doğru Cevap:</label>
                                                <select value={q.correctAnswer} onChange={e => handleQuestionChange(index, 'correctAnswer', e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #bdc3c7' }}>
                                                    <option value="A">A</option>
                                                    <option value="B">B</option>
                                                    <option value="C">C</option>
                                                    <option value="D">D</option>
                                                </select>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button type="submit" style={{ width: '100%', padding: '15px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1em', cursor: 'pointer' }}>
                                    {editQuizId ? 'Değişiklikleri Kaydet' : 'Sınavı Sisteme Kaydet'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'users' && (
                <div>
                    {!selectedUser ? (
                        <>
                            <h2 style={{ marginBottom: '20px' }}>Sistemdeki Kullanıcılar</h2>
                            <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #ecf0f1' }}>
                                            <th style={{ padding: '15px 20px', color: '#7f8c8d' }}>ID</th>
                                            <th style={{ padding: '15px 20px', color: '#7f8c8d' }}>Kullanıcı Adı</th>
                                            <th style={{ padding: '15px 20px', color: '#7f8c8d' }}>Rol</th>
                                            <th style={{ padding: '15px 20px', color: '#7f8c8d' }}>Toplam Puan</th>
                                            <th style={{ padding: '15px 20px', color: '#7f8c8d' }}>İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(u => (
                                            <tr key={u.id} style={{ borderBottom: '1px solid #f1f2f6' }}>
                                                <td style={{ padding: '15px 20px' }}>#{u.id}</td>
                                                <td style={{ padding: '15px 20px', fontWeight: 'bold' }}>{u.username}</td>
                                                <td style={{ padding: '15px 20px' }}>
                                                    <span style={{ backgroundColor: u.role === 'ADMIN' ? '#e74c3c' : '#bdc3c7', color: 'white', padding: '3px 8px', borderRadius: '12px', fontSize: '0.8em' }}>{u.role}</span>
                                                </td>
                                                <td style={{ padding: '15px 20px', color: '#27ae60', fontWeight: 'bold' }}>{u.totalScore}</td>
                                                <td style={{ padding: '15px 20px' }}>
                                                    <button onClick={() => handleViewUser(u)} style={{ padding: '5px 15px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                                        Detaylar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <div>
                                    <button onClick={() => setSelectedUser(null)} style={{ padding: '8px 15px', backgroundColor: '#7f8c8d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginBottom: '10px' }}>
                                        ← Listeye Dön
                                    </button>
                                    <h2 style={{ margin: 0, color: '#2c3e50' }}>{selectedUser.username} Profil Detayları</h2>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <span style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#27ae60' }}>
                                        Toplam Puan: {selectedUser.totalScore}
                                    </span>
                                    {selectedUser.role !== 'ADMIN' && (
                                        <button onClick={() => handleDeleteUser(selectedUser.id)} style={{ padding: '10px 15px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                                            Kullanıcıyı Sil
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #ecf0f1' }}>
                                            <th style={{ padding: '15px 20px', color: '#7f8c8d' }}>Tarih</th>
                                            <th style={{ padding: '15px 20px', color: '#7f8c8d' }}>Sınav Adı</th>
                                            <th style={{ padding: '15px 20px', color: '#7f8c8d' }}>Doğru Sayısı</th>
                                            <th style={{ padding: '15px 20px', color: '#7f8c8d' }}>Sınav Sonucu</th>
                                            <th style={{ padding: '15px 20px', color: '#7f8c8d' }}>Genel Skor</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userHistory.length > 0 ? (
                                            [...userHistory].reverse().map((attempt) => (
                                                <tr key={attempt.id} style={{ borderBottom: '1px solid #f1f2f6' }}>
                                                    <td style={{ padding: '15px 20px', color: '#2c3e50' }}>{attempt.displayDate}</td>
                                                    <td style={{ padding: '15px 20px', color: '#2c3e50', fontWeight: '500' }}>{attempt.quiz.title}</td>
                                                    <td style={{ padding: '15px 20px', color: '#3498db' }}>{attempt.correctAnswers} / {attempt.totalQuestions}</td>
                                                    <td style={{ padding: '15px 20px', color: '#27ae60', fontWeight: 'bold' }}>{attempt.score}</td>
                                                    <td style={{ padding: '15px 20px', color: '#8e44ad', fontWeight: 'bold' }}>{attempt.cumulativeScore}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#7f8c8d' }}>Bu kullanıcı henüz hiç sınava girmemiş.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;
