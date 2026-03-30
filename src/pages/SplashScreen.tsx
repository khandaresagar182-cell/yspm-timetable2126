import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Facebook, Instagram, Youtube, User } from 'lucide-react';

import { AuthService } from '../services/authService';

export const SplashScreen: React.FC = () => {
    const navigate = useNavigate();
    const [showContent, setShowContent] = useState(false);
    const [loginType, setLoginType] = useState<'faculty' | 'student' | null>(null);
    const [currentBgIndex, setCurrentBgIndex] = useState(0);

    // Login State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const backgroundImages = [
        `${import.meta.env.BASE_URL}bg1.jpg`,
        `${import.meta.env.BASE_URL}bg2.jpg`
    ];

    useEffect(() => {
        // Initial delay for splash screen content
        const timer = setTimeout(() => {
            setShowContent(true);
        }, 1000);

        // Background slideshow interval
        const bgInterval = setInterval(() => {
            setCurrentBgIndex((prev) => (prev + 1) % backgroundImages.length);
        }, 5000);

        return () => {
            clearTimeout(timer);
            clearInterval(bgInterval);
        };
    }, []);

    // Load Remembered Credentials
    useEffect(() => {
        const savedEmail = localStorage.getItem('rememberedEmail');
        const savedPass = localStorage.getItem('rememberedPass');
        if (savedEmail && savedPass) {
            setEmail(savedEmail);
            setPassword(savedPass);
            setRememberMe(true);
        }
    }, []);

    const handleAuthLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const user = await AuthService.login(email, password);

            // Handle Remember Me
            if (rememberMe) {
                localStorage.setItem('rememberedEmail', email);
                localStorage.setItem('rememberedPass', password);
            } else {
                localStorage.removeItem('rememberedEmail');
                localStorage.removeItem('rememberedPass');
            }

            if (user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/select-department'); // Or wherever teachers should go
            }
        } catch (err: any) {
            setError('Failed to login. Check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    // Modern Loading Screen - Dual Arc Spinner
    if (!showContent) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center">
                {/* Modern Dual-Arc Spinner */}
                <div className="relative w-14 h-14">
                    <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-red-600 rounded-full border-t-transparent animate-[spin_0.8s_linear_infinite]"></div>
                    <div className="absolute inset-2 border-4 border-pink-500 rounded-full border-b-transparent animate-[spin_1s_linear_infinite_reverse]"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-auto">
            {/* Background Image Slideshow */}
            {backgroundImages.map((img, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${index === currentBgIndex ? 'opacity-100' : 'opacity-0'
                        }`}
                    style={{
                        backgroundImage: `url(${img})`,
                        zIndex: 0
                    }}
                />
            ))}

            {/* Widgets Container */}
            <div className="relative min-h-screen flex items-center justify-center p-8 z-10">
                {/* Connected Panels Wrapper */}
                <div className="relative flex flex-col md:flex-row items-center gap-6 md:gap-0 shadow-none md:shadow-2xl rounded-none md:rounded-3xl overflow-visible md:overflow-hidden max-w-5xl mx-auto w-full md:w-auto">
                    {/* Left Widget - College Info Panel */}
                    <div className="w-full md:w-[450px] min-h-[400px] md:min-h-[600px] relative overflow-hidden rounded-3xl md:rounded-none shadow-2xl md:shadow-none p-8 flex flex-col justify-center items-center text-white animate-[fadeIn_0.6s_ease-out] z-0">

                        {/* 1. Background Image Layer */}
                        <div className="absolute inset-0 z-0">
                            <img
                                src={`${import.meta.env.BASE_URL}splash-bg.png`}
                                alt="College Background"
                                className="w-full h-full object-fill opacity-60 mix-blend-overlay"
                            />
                        </div>

                        {/* 2. Gradient Overlay Layer */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-purple-800/80 to-red-700/80 z-10"></div>


                        {/* 3. Content Layer */}
                        <div className="relative z-20 flex flex-col items-center w-full">
                            {/* Logo */}
                            <div className="w-20 h-20 mb-6 animate-[slideDown_0.6s_ease-out_0.1s_both]">
                                <img
                                    src={`${import.meta.env.BASE_URL}yspm-logo.png`}
                                    alt="YSPM Logo"
                                    className="w-full h-full object-contain drop-shadow-2xl"
                                />
                            </div>

                            {/* Welcome Text */}
                            <h1 className="text-3xl font-bold mb-4 text-center tracking-wide animate-[slideUp_0.6s_ease-out_0.2s_both] drop-shadow-lg">
                                WELCOME TO
                            </h1>

                            {/* College Info */}
                            <div className="text-center mb-8 space-y-2 animate-[slideUp_0.6s_ease-out_0.3s_both] drop-shadow-lg">
                                <p className="text-sm opacity-90">Yashoda Shikshan Prasarak Mandal</p>
                                <p className="text-lg font-semibold">YASHODA COLLEGE OF POLYTECHNIC, SATARA</p>
                            </div>

                            {/* Address */}
                            <p className="text-center text-sm mb-8 animate-[slideUp_0.6s_ease-out_0.5s_both] drop-shadow-md">S.NO.242, NH-4, Wadhe, Satara</p>

                            {/* Social Media Icons */}
                            <div className="flex gap-4 animate-[slideUp_0.6s_ease-out_0.6s_both]">
                                <a href="https://m.facebook.com/profile.php?id=61584868965680&mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded border-2 border-white/50 shadow-lg flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-xl">
                                    <Facebook className="w-5 h-5" />
                                </a>
                                <a href="https://www.instagram.com/ytc_polytechnic?igsh=cjlrbnRta3QzZWNs" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded border-2 border-white/50 shadow-lg flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-xl">
                                    <Instagram className="w-5 h-5" />
                                </a>
                                <a href="https://youtube.com/@yspm2015?feature=shared" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded border-2 border-white/50 shadow-lg flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-xl">
                                    <Youtube className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Right Widget - Login Panel */}
                    <div className="w-full md:w-[450px] min-h-[400px] md:min-h-[600px] bg-gray-900 backdrop-blur-md rounded-3xl md:rounded-none shadow-2xl md:shadow-none p-8 flex flex-col justify-center items-center animate-[fadeIn_0.6s_ease-out_0.2s_both] relative z-10">
                        {/* Connecting Arrow/Shape Design */}
                        <div className="absolute hidden md:block
                            left-1/2 -translate-x-1/2 -top-[49px] md:top-1/2 md:-left-[49px] md:translate-x-0 md:-translate-y-1/2 
                            w-0 h-0 
                            border-l-[50px] border-l-transparent 
                            border-r-[50px] border-r-transparent 
                            border-b-[50px] border-b-gray-900
                            md:border-l-0 md:border-b-transparent md:border-t-transparent
                            md:border-r-[50px] md:border-r-gray-900 
                            md:border-t-[50px] md:border-b-[50px]
                            
                            drop-shadow-[-4px_0_4px_rgba(0,0,0,0.1)]">
                        </div>

                        {/* Login Selection or Login Form */}
                        {!loginType ? (
                            // Show two buttons first
                            <div className="w-full">
                                {/* Small Logo */}
                                <div className="w-16 h-16 mx-auto mb-6 animate-[scaleIn_0.5s_ease-out_0.3s_both]">
                                    <img
                                        src={`${import.meta.env.BASE_URL}yspm-logo.png`}
                                        alt="YSPM Logo"
                                        className="w-full h-full object-contain"
                                    />
                                </div>

                                {/* Title */}
                                <h2 className="text-2xl font-bold text-white text-center mb-2 animate-[slideUp_0.6s_ease-out_0.4s_both]">
                                    YASHODA SHIKSHAN
                                </h2>
                                <h3 className="text-xl font-bold text-white text-center mb-10 animate-[slideUp_0.6s_ease-out_0.5s_both]">
                                    PRASARAK MANDAL SATARA
                                </h3>

                                {/* Login Type Selection Buttons */}
                                <div className="space-y-4">
                                    <button
                                        onClick={() => setLoginType('faculty')}
                                        className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl active:scale-95 shadow-xl animate-[slideUp_0.6s_ease-out_0.6s_both]"
                                    >
                                        Faculty Login
                                    </button>
                                    <button
                                        onClick={() => {
                                            AuthService.logout(); // Clear any existing session
                                            navigate('/select-department');
                                        }}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl active:scale-95 shadow-xl animate-[slideUp_0.6s_ease-out_0.7s_both]"
                                    >
                                        Student Login
                                    </button>
                                </div>

                                {/* Footer Text */}
                                <p className="text-center text-gray-400 text-xs mt-8">
                                    © 2026 AI/ML Student Association,YSPM
                                </p>
                            </div>
                        ) : (
                            // Show login form
                            <div className="w-full relative animate-[scaleIn_0.4s_ease-out]">
                                <div className="relative">
                                    {/* Small Logo */}
                                    <div className="w-16 h-16 mx-auto mb-6">
                                        <img
                                            src={`${import.meta.env.BASE_URL}yspm-logo.png`}
                                            alt="YSPM Logo"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>

                                    {/* Title */}
                                    <h2 className="text-xl font-bold text-white text-center mb-8">
                                        YASHODA SHIKSHAN<br />PRASARAK MANDAL SATARA
                                    </h2>

                                    {/* Error Message */}
                                    {error && (
                                        <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm mb-4 text-center">
                                            {error}
                                        </div>
                                    )}

                                    {/* Login Form */}
                                    <form onSubmit={handleAuthLogin} className="space-y-4">
                                        {/* Username */}
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Username"
                                                className="w-full bg-white/90 pl-12 pr-4 py-3 rounded-full text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                                            />
                                        </div>

                                        {/* Password */}
                                        <div className="relative">
                                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            <input
                                                type="password"
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full bg-white/90 pl-12 pr-4 py-3 rounded-full text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                                            />
                                        </div>

                                        {/* Remember */}
                                        <div className="flex items-center text-sm">
                                            <label className="flex items-center text-white cursor-pointer select-none">
                                                <input
                                                    type="checkbox"
                                                    className="mr-2 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors"
                                                    checked={rememberMe}
                                                    onChange={(e) => setRememberMe(e.target.checked)}
                                                />
                                                Remember me
                                            </label>
                                        </div>

                                        {/* Login Button */}
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {loading ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                    </svg>
                                                    Login
                                                </>
                                            )}
                                        </button>

                                        {/* Back Button */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setLoginType(null);
                                                setError('');
                                                setEmail('');
                                                setPassword('');
                                            }}
                                            className="w-full text-gray-400 hover:text-white text-sm mt-4 transition-colors"
                                        >
                                            ← Back to selection
                                        </button>
                                    </form>

                                    {/* Footer Text */}
                                    <p className="text-center text-gray-500 text-xs mt-auto pt-4">
                                        © 2026 AI/ML Student Association,YSPM
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Custom Keyframe Animations */}
            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes scaleIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
            `}</style>
        </div>
    );
};
