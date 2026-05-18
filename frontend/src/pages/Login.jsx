import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
    const navigate = useNavigate();

    // Kullanıcının girdiği verileri tutacağımız hafıza alanları (State)
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // Backend'in adresi
    const API_URL = 'http://localhost:8080/api/auth';

    // Kayıt Ol Butonuna basıldığında çalışacak fonksiyon
    const handleRegister = async () => {
        try {
            const response = await axios.post(`${API_URL}/register`, {
                username: username,
                password: password
            });
            alert(response.data); // Backend'den gelen "Kayıt başarılı" mesajını ekranda göster
        } catch (error) {
            alert("Kayıt başarısız! " + error.response?.data?.message || "Bir hata oluştu.");
        }
    };

    // Giriş Yap Butonuna basıldığında çalışacak fonksiyon
    const handleLogin = async () => {
        try {
            const response = await axios.post(`${API_URL}/login`, {
                username: username,
                password: password
            });

            localStorage.setItem('token', response.data);
            navigate('/quizzes'); // YENİ: Giriş başarılıysa listeye ışınla!

        } catch (error) {
            alert("Giriş başarısız! Lütfen bilgilerinizi kontrol edin.");
        }
    };


    return (
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <h1>🎓 Online Quiz'e Hoş Geldiniz</h1>
            <p>Lütfen bilgilerinizi girin.</p>

            <form>
                <div>
                    <input
                        type="text"
                        placeholder="Kullanıcı Adı"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)} // Kutuya yazılanı hafızaya al
                        style={{ padding: '10px', margin: '10px' }}
                    />
                </div>
                <div>
                    <input
                        type="password"
                        placeholder="Şifre"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} // Kutuya yazılanı hafızaya al
                        style={{ padding: '10px', margin: '10px' }}
                    />
                </div>

                <button type="button" onClick={handleLogin} style={{ padding: '10px 20px', cursor: 'pointer', marginRight: '10px' }}>
                    Giriş Yap
                </button>
                <button type="button" onClick={handleRegister} style={{ padding: '10px 20px', cursor: 'pointer' }}>
                    Kayıt Ol
                </button>
            </form>
        </div>
    );
}

export default Login;