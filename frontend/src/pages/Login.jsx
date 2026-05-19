import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
    const navigate = useNavigate();

    // Kullanıcının girdiği verileri tutacağımız hafıza alanları (State)
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoginMode, setIsLoginMode] = useState(true); // Giriş mi Kayıt mı?
    const [isLoading, setIsLoading] = useState(false);

    // Backend'in adresi
    const API_URL = 'http://localhost:8080/api/auth';

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            alert("Lütfen kullanıcı adı ve şifrenizi girin.");
            return;
        }

        setIsLoading(true);

        if (isLoginMode) {
            // Giriş Yap
            try {
                const response = await axios.post(`${API_URL}/login`, {
                    username: username,
                    password: password
                });

                localStorage.setItem('token', response.data);
                navigate('/quizzes'); 
            } catch (error) {
                alert("Giriş başarısız! Lütfen bilgilerinizi kontrol edin.");
            }
        } else {
            // Kayıt Ol
            try {
                const response = await axios.post(`${API_URL}/register`, {
                    username: username,
                    password: password
                });
                alert("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
                setIsLoginMode(true); // Başarılı kayıttan sonra giriş ekranına dön
                setPassword(''); // Şifreyi temizle
            } catch (error) {
                alert("Kayıt başarısız! " + (error.response?.data?.message || error.response?.data || "Bir hata oluştu."));
            }
        }
        
        setIsLoading(false);
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f0f4f8',
            fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        }}>
            
            <div style={{
                display: 'flex',
                width: '900px',
                minHeight: '550px',
                backgroundColor: '#fff',
                borderRadius: '24px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                margin: '20px'
            }}>
                
                {/* Sol Panel - Mavi Gradyan */}
                <div style={{
                    flex: '1',
                    background: 'linear-gradient(135deg, #0e5cad 0%, #208eed 100%)',
                    color: 'white',
                    padding: '50px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Arka Plan Dekoratif Yuvarlaklar */}
                    <div style={{ position: 'absolute', top: '-50px', left: '-50px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
                    <div style={{ position: 'absolute', bottom: '-80px', right: '-50px', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
                    
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <h1 style={{ fontSize: '3em', margin: '0 0 15px 0', fontWeight: '800', letterSpacing: '2px' }}>
                            WELCOME
                        </h1>
                        <h3 style={{ fontSize: '1.2em', margin: '0 0 25px 0', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9 }}>
                            Online Quiz Platform
                        </h3>
                        <p style={{ lineHeight: '1.7', opacity: 0.8, fontSize: '0.95em' }}>
                            Bilgini sına, yeni şeyler öğren ve başarılarını takip et. Modern, hızlı ve adil sınav sistemimizle rakiplerinin önüne geç.
                        </p>
                    </div>
                </div>

                {/* Sağ Panel - Form Kısmı */}
                <div style={{
                    flex: '1.2',
                    padding: '60px 50px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    backgroundColor: '#ffffff'
                }}>
                    
                    <h2 style={{ fontSize: '2.2em', color: '#1a365d', margin: '0 0 10px 0', fontWeight: 'bold' }}>
                        {isLoginMode ? 'Sign in' : 'Sign up'}
                    </h2>
                    <p style={{ color: '#718096', marginBottom: '40px', fontSize: '0.9em' }}>
                        {isLoginMode ? 'Lütfen hesabınıza giriş yapınız.' : 'Sisteme katılmak için bilgilerinizi giriniz.'}
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        
                        <div>
                            <input
                                type="text"
                                placeholder="Kullanıcı Adı"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '16px 20px',
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    backgroundColor: '#f8fafc',
                                    boxSizing: 'border-box',
                                    fontSize: '1em',
                                    outline: 'none',
                                    transition: 'all 0.3s ease'
                                }}
                                onFocus={(e) => { e.target.style.borderColor = '#3182ce'; e.target.style.backgroundColor = '#fff'; }}
                                onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.backgroundColor = '#f8fafc'; }}
                            />
                        </div>

                        <div style={{ position: 'relative' }}>
                            <input
                                type="password"
                                placeholder="Şifre"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '16px 20px',
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    backgroundColor: '#f8fafc',
                                    boxSizing: 'border-box',
                                    fontSize: '1em',
                                    outline: 'none',
                                    transition: 'all 0.3s ease'
                                }}
                                onFocus={(e) => { e.target.style.borderColor = '#3182ce'; e.target.style.backgroundColor = '#fff'; }}
                                onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.backgroundColor = '#f8fafc'; }}
                            />
                        </div>

                        {isLoginMode && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85em', color: '#4a5568' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input type="checkbox" style={{ cursor: 'pointer' }} />
                                    Beni hatırla
                                </label>
                                <span style={{ cursor: 'pointer', color: '#3182ce' }}>Şifremi Unuttum?</span>
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                padding: '16px',
                                marginTop: '10px',
                                backgroundColor: '#208eed',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: 'bold',
                                fontSize: '1.1em',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                boxShadow: '0 4px 14px 0 rgba(32, 142, 237, 0.39)',
                                transition: 'background-color 0.3s, transform 0.1s'
                            }}
                            onMouseDown={(e) => { if(!isLoading) e.target.style.transform = 'scale(0.98)'; }}
                            onMouseUp={(e) => { if(!isLoading) e.target.style.transform = 'scale(1)'; }}
                            onMouseLeave={(e) => { if(!isLoading) e.target.style.transform = 'scale(1)'; }}
                        >
                            {isLoading ? 'İşleniyor...' : (isLoginMode ? 'Giriş Yap' : 'Kayıt Ol')}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '30px', fontSize: '0.9em', color: '#718096' }}>
                        {isLoginMode ? "Hesabınız yok mu? " : "Zaten bir hesabınız var mı? "}
                        <span 
                            onClick={() => {
                                setIsLoginMode(!isLoginMode);
                                setUsername('');
                                setPassword('');
                            }} 
                            style={{ color: '#208eed', fontWeight: 'bold', cursor: 'pointer', marginLeft: '5px' }}
                        >
                            {isLoginMode ? 'Kayıt Ol' : 'Giriş Yap'}
                        </span>
                    </div>

                </div>
            </div>
            
        </div>
    );
}

export default Login;