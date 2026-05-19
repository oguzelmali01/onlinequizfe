import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

/**
 * QuizDetail Bileşeni
 * Öğrencilerin sınava girdiği, soruları tek tek gördüğü ve zamanlayıcı ile
 * sınırlandırılmış sınav çözme ekranı.
 */
function QuizDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Sınav Verisi State'leri
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState({}); // Kullanıcının işaretlediği şıklar { questionId: 'A' }
    
    // UI State'leri
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    // Zamanlayıcı state'leri
    const [timeLeft, setTimeLeft] = useState(null);
    const timerRef = useRef(null);

    /**
     * Sınav verisini (sorular ve süre bilgisi) API'den çeker.
     * Bileşen ilk yüklendiğinde çalışır.
     */
    useEffect(() => {
        const fetchQuizDetail = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/quizzes/${id}`);
                setQuiz(response.data);
                
                // Eğer sınavın süresi varsa zamanlayıcıyı (countdown) başlat
                if (response.data.timeLimitSeconds && response.data.timeLimitSeconds > 0) {
                    setTimeLeft(response.data.timeLimitSeconds);
                }
                
                setLoading(false);
            } catch (error) {
                console.error("Sınav verisi çekilirken hata oluştu!", error);
                alert("Sınav yüklenirken bir hata oluştu.");
                setLoading(false);
            }
        };

        fetchQuizDetail();
    }, [id]);

    /**
     * Zamanlayıcı (Countdown) Mantığı:
     * timeLeft state'i 0'dan büyük olduğu sürece her saniye (1000ms) kendini bir azaltır.
     */
    // Zamanlayıcı geri sayım efekti
    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) return;

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [timeLeft === null]);

    // Format zaman
    const formatTime = (seconds) => {
        if (seconds === null) return "";
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleOptionSelect = (questionId, option) => {
        setAnswers(prevAnswers => ({
            ...prevAnswers,
            [questionId]: option
        }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    /**
     * Sınavı tamamlayıp cevapları backend'e gönderen fonksiyon.
     */
    const handleSubmit = async () => {
        // Obje formatındaki cevapları, backend'in beklediği dizi formuna dönüştür
        const answerList = Object.keys(answers).map(qId => ({
            questionId: parseInt(qId),
            selectedOption: answers[qId]
        }));

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`http://localhost:8080/api/quizzes/${id}/submit`, {
                answers: answerList
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Başarılı olursa sonucu göster ve ana sayfaya dön
            alert("🎉 Tebrikler!\n\n" + response.data);
            navigate('/quizzes');
        } catch (error) {
            console.error("Sınav gönderilirken hata oluştu:", error);
            alert("Sınav gönderilirken bir hata oluştu: " + (error.response?.data?.message || error.response?.data || "Bilinmeyen hata"));
        }
    };

    /**
     * Süre 0'a ulaştığında sınavı otomatik olarak (kullanıcı bitir demese de) gönderir.
     */
    // Süre dolduğunda otomatik submit
    useEffect(() => {
        if (timeLeft === 0) {
            alert("Süreniz doldu! Sınavınız otomatik olarak gönderiliyor.");
            handleSubmit();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft]);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f7fa' }}>
                <div style={{ color: '#2a5298', fontSize: '1.2em', fontWeight: 'bold' }}>Yükleniyor...</div>
            </div>
        );
    }

    if (!quiz) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f7fa' }}>
                <div style={{ color: '#e74c3c', fontSize: '1.2em', fontWeight: 'bold' }}>Sınav bulunamadı!</div>
            </div>
        );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
    const answeredCount = Object.keys(answers).length;

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f4f7fa',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: '"Inter", "Segoe UI", Roboto, sans-serif'
        }}>
            {/* Mobil App Boyutunda Ana Konteyner */}
            <div style={{
                width: '100%',
                maxWidth: '420px',
                minHeight: '800px',
                backgroundColor: '#f8f9fe',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '30px',
                boxShadow: '0 25px 50px rgba(0,0,0,0.1)'
            }}>
                {/* Arka Plandaki Mavi Kavisli Alan */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '320px',
                    background: 'linear-gradient(135deg, #0e5cad 0%, #208eed 100%)',
                    borderBottomLeftRadius: '40px',
                    borderBottomRightRadius: '40px',
                    zIndex: 0
                }}></div>

                {/* İçerik Katmanı */}
                <div style={{ position: 'relative', zIndex: 1, padding: '40px 25px' }}>
                    
                    {/* Üst Bar (Geri Tuşu & Başlık) */}
                    <div style={{ display: 'flex', alignItems: 'center', color: 'white', marginBottom: '20px' }}>
                        <button 
                            onClick={() => navigate('/quizzes')}
                            style={{ 
                                background: 'rgba(255,255,255,0.2)', 
                                border: 'none', 
                                color: 'white', 
                                width: '40px', 
                                height: '40px', 
                                borderRadius: '12px', 
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                fontSize: '1.2em'
                            }}
                        >
                            &larr;
                        </button>
                        <h2 style={{ margin: '0 auto', fontSize: '1.3em', fontWeight: '600', textAlign: 'center', flex: 1, padding: '0 10px' }}>
                            {quiz.title}
                        </h2>
                    </div>

                    {/* Süre Göstergesi */}
                    {timeLeft !== null && (
                        <div style={{ 
                            textAlign: 'center', 
                            color: timeLeft <= 60 ? '#ff7675' : '#e0e7ff', 
                            marginBottom: '15px', 
                            fontSize: '1.2em', 
                            fontWeight: 'bold',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            ⏳ {formatTime(timeLeft)}
                        </div>
                    )}

                    {/* Soru Göstergesi */}
                    <div style={{ textAlign: 'center', color: '#e0e7ff', marginBottom: '20px', fontSize: '0.95em', fontWeight: '500' }}>
                        Soru {currentQuestionIndex + 1} / {quiz.questions.length}
                    </div>

                    {/* Beyaz Soru Kartı */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '24px',
                        padding: '30px 20px',
                        boxShadow: '0 15px 35px rgba(0,0,0,0.08)',
                        minHeight: '380px',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <h3 style={{ marginTop: 0, marginBottom: '30px', color: '#2d3748', fontSize: '1.15em', lineHeight: '1.6', fontWeight: '600' }}>
                            {currentQuestion.text}
                        </h3>

                        {/* Şıklar */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {['A', 'B', 'C', 'D'].map((optionLetter) => {
                                const optionKey = `option${optionLetter}`;
                                const optionText = currentQuestion[optionKey];
                                const isSelected = answers[currentQuestion.id] === optionLetter;
                                
                                return (
                                    <div
                                        key={optionLetter}
                                        onClick={() => handleOptionSelect(currentQuestion.id, optionLetter)}
                                        style={{
                                            padding: '16px 20px',
                                            borderRadius: '16px',
                                            border: isSelected ? '2px solid transparent' : '2px solid #edf2f7',
                                            background: isSelected ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' : '#ffffff',
                                            color: isSelected ? 'white' : '#4a5568',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            transition: 'all 0.25s ease',
                                            boxShadow: isSelected ? '0 8px 20px rgba(79, 172, 254, 0.4)' : 'none'
                                        }}
                                    >
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : '#edf2f7',
                                            color: isSelected ? 'white' : '#a0aec0',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginRight: '15px',
                                            fontWeight: '700',
                                            fontSize: '1em'
                                        }}>
                                            {optionLetter}
                                        </div>
                                        <span style={{ fontWeight: isSelected ? '600' : '500', fontSize: '1.05em' }}>
                                            {optionText}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Alt Kontrol Butonları */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '35px' }}>
                        <button
                            onClick={handlePrev}
                            disabled={currentQuestionIndex === 0}
                            style={{
                                padding: '16px 25px',
                                borderRadius: '16px',
                                border: 'none',
                                background: currentQuestionIndex === 0 ? '#e2e8f0' : '#ffffff',
                                color: currentQuestionIndex === 0 ? '#a0aec0' : '#4a5568',
                                fontWeight: '700',
                                cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: currentQuestionIndex === 0 ? 'none' : '0 4px 10px rgba(0,0,0,0.05)'
                            }}
                        >
                            Önceki
                        </button>

                        {!isLastQuestion ? (
                            <button
                                onClick={handleNext}
                                style={{
                                    padding: '16px 35px',
                                    borderRadius: '16px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #0e5cad 0%, #208eed 100%)',
                                    color: 'white',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    boxShadow: '0 8px 20px rgba(32, 142, 237, 0.4)',
                                    transition: 'transform 0.1s'
                                }}
                            >
                                Sonraki &rarr;
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={answeredCount !== quiz.questions.length}
                                style={{
                                    padding: '16px 35px',
                                    borderRadius: '16px',
                                    border: 'none',
                                    background: answeredCount === quiz.questions.length ? 'linear-gradient(135deg, #11998e, #38ef7d)' : '#cbd5e0',
                                    color: 'white',
                                    fontWeight: '700',
                                    cursor: answeredCount === quiz.questions.length ? 'pointer' : 'not-allowed',
                                    boxShadow: answeredCount === quiz.questions.length ? '0 8px 20px rgba(17, 153, 142, 0.4)' : 'none',
                                    transition: 'all 0.3s'
                                }}
                            >
                                {answeredCount === quiz.questions.length ? 'Sınavı Bitir' : `${answeredCount}/${quiz.questions.length} Cevap`}
                            </button>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}

export default QuizDetail;
