import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Mic, StopCircle, Eye, AlertTriangle, BrainCircuit,
    ChevronRight, Timer, Loader2, Sparkles, Play, Square,
    Upload, FileText
} from 'lucide-react';

const ROLES = [
    { id: 'Frontend Developer', label: 'Frontend', color: '#61dafb' },
    { id: 'Backend Developer', label: 'Backend', color: '#339933' },
    { id: 'Full Stack Developer', label: 'Full Stack', color: '#8b5cf6' },
    { id: 'DevOps Engineer', label: 'DevOps', color: '#f97316' },
    { id: 'Data Scientist', label: 'Data Science', color: '#06b6d4' },
    { id: 'Mobile Developer', label: 'Mobile Dev', color: '#e44d26' },
];

const DIFFICULTIES = [
    { id: 'easy', label: 'Easy', emoji: '🟢', desc: 'Fresher level' },
    { id: 'medium', label: 'Medium', emoji: '🟡', desc: 'Mid-level' },
    { id: 'hard', label: 'Hard', emoji: '🔴', desc: 'Senior level' },
];

const FILLER_WORDS = /\b(um|uh|umm|uhh|like|you know|basically|actually|literally|so yeah|right|er|hmm|well)\b/gi;

const InterviewPage = () => {
    const navigate = useNavigate();
    
    // Phase: 'setup' | 'loading' | 'interview' | 'processing'
    const [phase, setPhase] = useState('setup');
    const [selectedRole, setSelectedRole] = useState(ROLES[0]);
    const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
    const [resumeFile, setResumeFile] = useState(null);
    
    // Interview state
    const [questions, setQuestions] = useState([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [transcript, setTranscript] = useState("");
    const [fillerCount, setFillerCount] = useState(0);
    const [isGazeWarning] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [questionTimestamps, setQuestionTimestamps] = useState([]);
    
    // Dynamic Loading state
    const loadingMessages = [
        "Analyzing your profile...",
        "Scanning industry requirements...",
        "Crafting personalized questions...",
        "Calibrating AI difficulty...",
        "Almost ready..."
    ];
    const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

    useEffect(() => {
        if (phase === 'loading') {
            const interval = setInterval(() => {
                setLoadingMsgIdx(prev => (prev + 1) % loadingMessages.length);
            }, 2500);
            return () => clearInterval(interval);
        }
    }, [phase]);
    
    // Refs
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const recognitionRef = useRef(null);
    const timerRef = useRef(null);
    const startTimeRef = useRef(null);
    const streamRef = useRef(null);
    const allTranscriptRef = useRef("");
    const fillerCountRef = useRef(0);
    const fileInputRef = useRef(null);

    // Timer
    useEffect(() => {
        if (phase === 'interview') {
            timerRef.current = setInterval(() => {
                setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [phase]);

    const formatTime = (sec) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // Generate questions
    const startInterview = async () => {
        setPhase('loading');
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('role', selectedRole.id);
            formData.append('difficulty', selectedDifficulty);
            if (resumeFile) {
                formData.append('resumeFile', resumeFile);
            }

            const res = await axios.post('https://prep-pro-platform.onrender.com/api/ai/generate-interview-questions',
                formData,
                { 
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }, 
                    timeout: 45000 
                }
            );
            setQuestions(res.data.questions);
            await setupMediaAndStart(res.data.questions);
        } catch (err) {
            console.error("Question generation error:", err);
            alert("Failed to generate questions. Please try again.");
            setPhase('setup');
        }
    };

    const setupMediaAndStart = async (qs) => {
        try {
            // Get camera + mic stream
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: 1280, height: 720, facingMode: 'user' }, 
                audio: true 
            });
            streamRef.current = stream;

            // Setup MediaRecorder with compatible mimeType
            let mimeType = 'video/webm;codecs=vp8,opus';
            if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
                mimeType = 'video/webm;codecs=vp9,opus';
            } else if (MediaRecorder.isTypeSupported('video/webm')) {
                mimeType = 'video/webm';
            }
            const recorder = new MediaRecorder(stream, { mimeType });
            chunksRef.current = [];
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };
            mediaRecorderRef.current = recorder;
            recorder.start(1000); // Collect data every second

            // Setup Speech Recognition
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = 'en-US';
                recognition.onresult = (event) => {
                    let fullText = "";
                    for (let i = 0; i < event.results.length; i++) {
                        fullText += event.results[i][0].transcript + " ";
                    }
                    setTranscript(fullText.trim());
                    allTranscriptRef.current = fullText.trim();
                    
                    // Count fillers
                    const matches = fullText.match(FILLER_WORDS) || [];
                    fillerCountRef.current = matches.length;
                    setFillerCount(matches.length);
                };
                recognition.onerror = (e) => {
                    if (e.error !== 'no-speech') console.error("Speech error:", e);
                };
                recognitionRef.current = recognition;
                recognition.start();
            }

            // Record first question timestamp
            startTimeRef.current = Date.now();
            setQuestionTimestamps([{ 
                questionText: qs[0].questionText, 
                type: qs[0].type,
                timestampStart: 0 
            }]);
            
            setPhase('interview');
        } catch (err) {
            console.error("Media setup error:", err);
            alert("Camera/microphone access denied. Please allow access and try again.");
            setPhase('setup');
        }
    };

    // Effect to attach stream to video element once it enters the DOM
    useEffect(() => {
        if (phase === 'interview' && streamRef.current && videoRef.current) {
            videoRef.current.srcObject = streamRef.current;
            videoRef.current.muted = true;
            videoRef.current.playsInline = true;
            videoRef.current.play().catch(e => console.log("Autoplay error:", e));
        }
    }, [phase]);

    // Next question
    const nextQuestion = () => {
        const currentTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
        
        // Update end time for current question
        setQuestionTimestamps(prev => {
            const updated = [...prev];
            updated[updated.length - 1].timestampEnd = currentTime;
            updated[updated.length - 1].answerTranscript = transcript;
            return updated;
        });

        if (currentQ + 1 < questions.length) {
            setCurrentQ(prev => prev + 1);
            // Add next question timestamp
            setQuestionTimestamps(prev => [...prev, {
                questionText: questions[currentQ + 1].questionText,
                type: questions[currentQ + 1].type,
                timestampStart: currentTime
            }]);
        } else {
            endInterview();
        }
    };

    // End interview
    const endInterview = async () => {
        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const currentTime = duration;
        
        // Finalize last question timestamp
        const finalTimestamps = [...questionTimestamps];
        if (finalTimestamps.length > 0) {
            finalTimestamps[finalTimestamps.length - 1].timestampEnd = currentTime;
            finalTimestamps[finalTimestamps.length - 1].answerTranscript = transcript;
        }

        setPhase('processing');
        
        // Stop all media
        clearInterval(timerRef.current);
        recognitionRef.current?.stop();
        
        // Stop recorder and get blob
        let recordingPath = '';
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            await new Promise(resolve => {
                mediaRecorderRef.current.onstop = resolve;
                mediaRecorderRef.current.stop();
            });
        }

        // Stop camera
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
        }

        const token = localStorage.getItem('token');

        // Upload recording
        try {
            if (chunksRef.current.length > 0) {
                const blob = new Blob(chunksRef.current, { type: 'video/webm' });
                const formData = new FormData();
                formData.append('recording', blob, 'interview.webm');
                
                const uploadRes = await axios.post('https://prep-pro-platform.onrender.com/api/interviews/upload-recording',
                    formData,
                    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
                );
                recordingPath = uploadRes.data.recordingPath;
            }
        } catch (err) {
            console.error("Upload error:", err);
        }

        // Default gaze score (FaceMesh can be re-integrated later for real tracking)
        const gazeScore = 70;

        // Get AI analysis
        let aiAnalysis = null;
        try {
            const analysisRes = await axios.post('https://prep-pro-platform.onrender.com/api/ai/analyze-interview',
                { 
                    role: selectedRole.id, 
                    transcript: allTranscriptRef.current, 
                    fillerCount: fillerCountRef.current, 
                    gazeScore, 
                    duration, 
                    questionCount: questions.length 
                },
                { headers: { Authorization: `Bearer ${token}` }, timeout: 30000 }
            );
            aiAnalysis = analysisRes.data;
        } catch (err) {
            console.error("AI analysis error:", err);
            aiAnalysis = { overallScore: 50, summary: "Analysis could not be completed." };
        }

        // Save to database
        try {
            await axios.post('https://prep-pro-platform.onrender.com/api/interviews/save',
                {
                    role: selectedRole.id,
                    difficulty: selectedDifficulty,
                    transcript: allTranscriptRef.current,
                    fillerCount: fillerCountRef.current,
                    gazeScore,
                    overallScore: aiAnalysis?.overallScore || 50,
                    questions: finalTimestamps,
                    recordingPath,
                    aiFeedback: JSON.stringify(aiAnalysis),
                    duration
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Log activity
            await axios.post('https://prep-pro-platform.onrender.com/api/activities',
                { type: 'interview', points: 50 },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (err) {
            console.error("Save error:", err);
        }

        // Navigate to result
        navigate('/interview/result', {
            state: {
                role: selectedRole.id,
                difficulty: selectedDifficulty,
                duration,
                fillerCount: fillerCountRef.current,
                gazeScore,
                questions: finalTimestamps,
                recordingPath,
                aiAnalysis,
                color: selectedRole.color
            }
        });
    };

    // ===== SETUP SCREEN =====
    if (phase === 'setup') {
        return (
            <div style={{ minHeight: '100vh', background: '#0c0f1a', color: '#f8fafc' }}>
                
                <main style={setupContainer}>
                    <div style={setupHero}>
                        <div style={heroBadge}><Sparkles size={14} /> AI MOCK INTERVIEW</div>
                        <h1 style={setupTitle}>
                            Practice Like It's <span style={gradientSpan}>Real</span>
                        </h1>
                        <p style={{ color: '#64748b', fontSize: '15px', maxWidth: '500px', margin: '0 auto', lineHeight: '1.7' }}>
                            AI-generated questions, video recording with timestamps, speech analysis, and detailed feedback.
                        </p>
                    </div>

                    <div style={setupCard}>
                        {/* Resume Upload */}
                        <label style={{ ...labelStyle, marginTop: 0 }}>UPLOAD RESUME</label>
                        <div 
                            style={uploadDropzone}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input 
                                type="file" 
                                accept=".pdf" 
                                style={{ display: 'none' }} 
                                ref={fileInputRef} 
                                onChange={(e) => setResumeFile(e.target.files[0])}
                            />
                            {resumeFile ? (
                                <div style={{ color: '#34d399', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                                    <FileText size={16} /> {resumeFile.name}
                                </div>
                            ) : (
                                <div style={{ color: '#94a3b8', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                                    <Upload size={16} /> Click to upload PDF to tailor questions to your experience
                                </div>
                            )}
                        </div>

                        {/* Role Selection */}
                        <label style={{ ...labelStyle, marginTop: '28px' }}>SELECT YOUR ROLE</label>
                        <div style={roleGrid}>
                            {ROLES.map(r => (
                                <div
                                    key={r.id}
                                    style={{
                                        ...roleOption,
                                        borderColor: selectedRole.id === r.id ? r.color : 'rgba(255,255,255,0.06)',
                                        background: selectedRole.id === r.id ? `${r.color}10` : 'transparent',
                                    }}
                                    onClick={() => setSelectedRole(r)}
                                >
                                    <div style={{ 
                                        width: '8px', height: '8px', borderRadius: '50%', 
                                        background: selectedRole.id === r.id ? r.color : 'rgba(255,255,255,0.1)' 
                                    }} />
                                    <span style={{ fontWeight: '600', fontSize: '13px' }}>{r.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Difficulty */}
                        <label style={{ ...labelStyle, marginTop: '28px' }}>DIFFICULTY</label>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            {DIFFICULTIES.map(d => (
                                <div
                                    key={d.id}
                                    style={{
                                        ...diffOption,
                                        borderColor: selectedDifficulty === d.id ? '#818cf8' : 'rgba(255,255,255,0.06)',
                                        background: selectedDifficulty === d.id ? 'rgba(129,140,248,0.08)' : 'transparent',
                                    }}
                                    onClick={() => setSelectedDifficulty(d.id)}
                                >
                                    <span style={{ fontSize: '18px' }}>{d.emoji}</span>
                                    <div>
                                        <div style={{ fontWeight: '700', fontSize: '13px' }}>{d.label}</div>
                                        <div style={{ fontSize: '10px', color: '#64748b' }}>{d.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Info */}
                        <div style={infoBox}>
                            <BrainCircuit size={16} color="#818cf8" />
                            <span>6 questions • Video recorded • AI feedback after</span>
                        </div>

                        {/* Start Button */}
                        <button style={startInterviewBtn} onClick={startInterview}>
                            <Play size={18} /> Start Mock Interview
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    // ===== LOADING SCREEN =====
    if (phase === 'loading') {
        return (
            <div style={fullCenter}>
                <div style={{ textAlign: 'center' }}>
                    <div style={brainPulse}><BrainCircuit size={48} color="#818cf8" /></div>
                    <h2 style={{ margin: '24px 0 8px', transition: 'opacity 0.3s' }}>
                        {loadingMessages[loadingMsgIdx]}
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '14px' }}>
                        AI is generating {selectedDifficulty} questions for <span style={{ color: selectedRole.color, fontWeight: '700' }}>{selectedRole.id}</span>
                    </p>
                    <div style={{ height: '4px', width: '200px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', margin: '28px auto 0', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: '40%', background: 'linear-gradient(90deg, #6366f1, #c084fc)', borderRadius: '10px', animation: 'loading-slide 1.5s ease infinite' }}></div>
                    </div>
                    <p style={{ color: '#475569', fontSize: '11px', marginTop: '20px' }}>This usually takes 10-15 seconds</p>
                </div>
            </div>
        );
    }

    // ===== PROCESSING SCREEN =====
    if (phase === 'processing') {
        return (
            <div style={fullCenter}>
                <div style={{ textAlign: 'center' }}>
                    <Loader2 size={48} color="#818cf8" style={{ animation: 'spin 1s linear infinite' }} />
                    <h2 style={{ margin: '24px 0 8px' }}>Analyzing Your Performance...</h2>
                    <p style={{ color: '#64748b', fontSize: '14px' }}>
                        Uploading recording & getting AI feedback
                    </p>
                </div>
            </div>
        );
    }

    // ===== INTERVIEW MODE =====
    const question = questions[currentQ];

    return (
        <div style={{ minHeight: '100vh', background: '#0c0f1a', color: '#f8fafc' }}>
            <main style={interviewLayout}>
                {/* LEFT: Video Feed */}
                <div style={leftCol}>
                    <div style={videoBox}>
                        <video ref={videoRef} autoPlay muted playsInline style={videoStyle} />
                        
                        {/* Live Badges */}
                        <div style={topOverlay}>
                            <div style={recBadge}>
                                <div style={recDot} /> REC
                            </div>
                            <div style={timerBadge}>
                                <Timer size={14} /> {formatTime(elapsedTime)}
                            </div>
                        </div>

                        {/* Gaze Warning */}
                        {isGazeWarning && (
                            <div style={gazeWarningToast}>
                                <AlertTriangle size={16} /> Look at the camera!
                            </div>
                        )}
                    </div>

                    {/* Stats */}
                    <div style={statsRow}>
                        <div style={metricCard}>
                            <Mic size={16} color={fillerCount > 5 ? '#ef4444' : '#818cf8'} />
                            <div>
                                <div style={{ fontSize: '18px', fontWeight: '900' }}>{fillerCount}</div>
                                <div style={{ fontSize: '10px', color: '#64748b' }}>Fillers</div>
                            </div>
                        </div>
                        <div style={metricCard}>
                            <Eye size={16} color="#10b981" />
                            <div>
                                <div style={{ fontSize: '18px', fontWeight: '900' }}>
                                    70%
                                </div>
                                <div style={{ fontSize: '10px', color: '#64748b' }}>Eye Contact</div>
                            </div>
                        </div>
                        <div style={metricCard}>
                            <BrainCircuit size={16} color="#f59e0b" />
                            <div>
                                <div style={{ fontSize: '18px', fontWeight: '900' }}>{currentQ + 1}/{questions.length}</div>
                                <div style={{ fontSize: '10px', color: '#64748b' }}>Question</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Question + Transcript */}
                <div style={rightCol}>
                    {/* Question Card */}
                    <div style={questionCard}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <span style={qBadge}>
                                {question?.type === 'behavioral' ? '💬 Behavioral' : '⚡ Technical'} — Q{currentQ + 1}
                            </span>
                        </div>
                        <h2 style={questionTextStyle}>{question?.questionText}</h2>
                    </div>

                    {/* Question Progress */}
                    <div style={qProgressRow}>
                        {questions.map((_, i) => (
                            <div key={i} style={{
                                flex: 1, height: '4px', borderRadius: '4px',
                                background: i < currentQ ? '#10b981' : i === currentQ ? '#818cf8' : 'rgba(255,255,255,0.06)',
                                transition: 'all 0.3s ease'
                            }} />
                        ))}
                    </div>

                    {/* Transcript */}
                    <div style={transcriptBox}>
                        <div style={transcriptLabel}>LIVE TRANSCRIPT</div>
                        <p style={transcriptText}>
                            {transcript || "Start speaking — AI is listening..."}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div style={actionBtnRow}>
                        {currentQ < questions.length - 1 ? (
                            <button style={nextBtn} onClick={nextQuestion}>
                                Next Question <ChevronRight size={16} />
                            </button>
                        ) : (
                            <button style={finishBtn} onClick={endInterview}>
                                <Square size={16} /> Finish Interview
                            </button>
                        )}
                        <button style={endEarlyBtn} onClick={endInterview}>
                            <StopCircle size={16} /> End Early
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

// ============ STYLES ============
const setupContainer = { maxWidth: '600px', margin: '0 auto', padding: '40px 20px 80px', textAlign: 'center' };
const setupHero = { marginBottom: '40px' };
const heroBadge = { display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(99,102,241,0.1)', color: '#818cf8', padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', letterSpacing: '1.5px', marginBottom: '16px' };
const setupTitle = { fontSize: '38px', fontWeight: '900', lineHeight: '1.1', margin: '0 0 12px' };
const gradientSpan = { background: 'linear-gradient(135deg, #818cf8, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' };

const setupCard = { background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '28px', padding: '36px', textAlign: 'left' };
const labelStyle = { display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', letterSpacing: '1.2px', marginBottom: '12px' };
const roleGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' };
const roleOption = { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '14px', border: '1px solid', cursor: 'pointer', transition: 'all 0.25s ease' };
const diffOption = { flex: 1, display: 'flex', alignItems: 'center', gap: '10px', padding: '14px', borderRadius: '14px', border: '1px solid', cursor: 'pointer', transition: 'all 0.25s ease' };
const uploadDropzone = { padding: '20px', borderRadius: '14px', border: '1px dashed rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.02)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.25s ease' };
const infoBox = { display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px', background: 'rgba(99,102,241,0.05)', borderRadius: '14px', marginTop: '24px', fontSize: '13px', color: '#94a3b8' };
const startInterviewBtn = { width: '100%', padding: '18px', marginTop: '20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: '16px', fontWeight: '700', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 8px 30px rgba(99,102,241,0.3)' };

const fullCenter = { minHeight: '100vh', background: '#0c0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f8fafc' };
const brainPulse = { width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(129,140,248,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', animation: 'pulse-glow 2s ease infinite' };

// Interview layout
const interviewLayout = { display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: '24px', padding: '24px', maxWidth: '1400px', margin: '0 auto', minHeight: '100vh', alignContent: 'start' };
const leftCol = { display: 'flex', flexDirection: 'column', gap: '16px' };
const videoBox = { position: 'relative', height: '480px', background: '#000', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' };
const videoStyle = { width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' };
const topOverlay = { position: 'absolute', top: '16px', left: '16px', right: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const recBadge = { display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239,68,68,0.2)', color: '#ef4444', padding: '6px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '800', border: '1px solid rgba(239,68,68,0.3)' };
const recDot = { width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulse-glow 1.5s infinite' };
const timerBadge = { display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '6px 14px', borderRadius: '10px', fontSize: '14px', fontWeight: '700' };
const gazeWarningToast = { position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: '#ef4444', color: '#fff', padding: '10px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '13px', boxShadow: '0 8px 25px rgba(239,68,68,0.4)' };

const statsRow = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' };
const metricCard = { display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'rgba(15,23,42,0.6)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.04)' };

const rightCol = { display: 'flex', flexDirection: 'column', gap: '16px' };
const questionCard = { background: 'rgba(15,23,42,0.6)', padding: '28px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.06)' };
const qBadge = { fontSize: '11px', fontWeight: '700', color: '#818cf8', background: 'rgba(99,102,241,0.1)', padding: '5px 12px', borderRadius: '8px' };
const questionTextStyle = { fontSize: '20px', fontWeight: '700', lineHeight: '1.5', margin: 0 };
const qProgressRow = { display: 'flex', gap: '6px' };

const transcriptBox = { flex: 1, background: 'rgba(15,23,42,0.3)', padding: '20px', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.06)', minHeight: '120px' };
const transcriptLabel = { fontSize: '10px', fontWeight: '700', color: '#64748b', letterSpacing: '1.5px', marginBottom: '10px' };
const transcriptText = { fontSize: '14px', lineHeight: '1.7', color: '#94a3b8', fontStyle: 'italic', margin: 0 };

const actionBtnRow = { display: 'flex', gap: '12px' };
const nextBtn = { flex: 1, padding: '16px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' };
const finishBtn = { ...nextBtn, background: 'linear-gradient(135deg, #10b981, #059669)' };
const endEarlyBtn = { padding: '16px 20px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '14px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' };

export default InterviewPage;