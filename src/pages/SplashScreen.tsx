import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const SplashScreen: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Navigate to batch selection after 3 seconds
        const timer = setTimeout(() => {
            navigate('/select-batch');
        }, 3000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Animated background glow effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-96 md:h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-1000">
                {/* YSPM Logo */}
                <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 mb-6 md:mb-8 drop-shadow-2xl animate-in slide-in-from-top duration-700">
                    <img
                        src="/yspm-logo.png"
                        alt="YSPM Logo"
                        className="w-full h-full object-contain"
                    />
                </div>

                {/* Department Text */}
                <div className="text-center space-y-1 md:space-y-2 animate-in slide-in-from-bottom duration-700 delay-300 px-4">
                    <h1 className="text-xl sm:text-2xl md:text-2xl font-serif tracking-wide text-white">
                        Department
                    </h1>
                    <h2 className="text-xl sm:text-2xl md:text-2xl font-serif tracking-wide text-white">
                        Artificial Intelligence
                    </h2>
                    <h2 className="text-lg sm:text-xl md:text-xl font-serif tracking-wide text-white">
                        &
                    </h2>
                    <h2 className="text-xl sm:text-2xl md:text-2xl font-serif tracking-wide mb-4 md:mb-6 text-white">
                        Machine Learning
                    </h2>

                    {/* YSPM Text */}
                    <h3 className="text-red-500 text-2xl sm:text-3xl md:text-3xl font-bold tracking-widest mt-3 md:mt-4">
                        YSPM
                    </h3>
                </div>

                {/* Loading indicator */}
                <div className="mt-8 md:mt-12 flex space-x-2 animate-in fade-in duration-500 delay-700">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>
        </div>
    );
};
