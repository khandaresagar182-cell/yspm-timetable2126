import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ChevronRight, Home } from 'lucide-react';
import { NoticeBoard } from '../components/NoticeBoard';
import { NewsTicker } from '../components/NewsTicker';

interface Department {
    id: string;
    name: string;
    shortName: string;
    active: boolean;
    color: string;
}

const departments: Department[] = [
    {
        id: 'aiml',
        name: 'Artificial Intelligence & Machine Learning',
        shortName: 'AI & ML',
        active: true,
        color: 'red'
    },
    {
        id: 'computer',
        name: 'Computer Engineering',
        shortName: 'Computer',
        active: false,
        color: 'blue'
    },
    {
        id: 'mechanical',
        name: 'Mechanical Engineering',
        shortName: 'Mechanical',
        active: false,
        color: 'orange'
    },
    {
        id: 'civil',
        name: 'Civil Engineering',
        shortName: 'Civil',
        active: false,
        color: 'green'
    },
    {
        id: 'electrical',
        name: 'Electrical Engineering',
        shortName: 'Electrical',
        active: false,
        color: 'yellow'
    },
    {
        id: 'electronics',
        name: 'Electronics & Telecommunication',
        shortName: 'E&TC',
        active: false,
        color: 'purple'
    },
    {
        id: 'it',
        name: 'Information Technology',
        shortName: 'Information Technology',
        active: false,
        color: 'cyan'
    }
];

const getColorClasses = (color: string, active: boolean) => {
    if (!active) return {
        iconBg: 'bg-gray-200',
        iconText: 'text-gray-400',
        border: 'border-gray-300',
        hoverBorder: ''
    };

    const colorMap: Record<string, any> = {
        red: {
            iconBg: 'bg-rose-100',
            iconText: 'text-rose-700',
            border: 'border-gray-300',
            hoverBorder: 'hover:border-rose-600',
            accent: 'text-rose-700'
        },
        blue: {
            iconBg: 'bg-blue-100',
            iconText: 'text-blue-700',
            border: 'border-gray-300',
            hoverBorder: 'hover:border-blue-600',
            accent: 'text-blue-700'
        },
        orange: {
            iconBg: 'bg-orange-100',
            iconText: 'text-orange-700',
            border: 'border-gray-300',
            hoverBorder: 'hover:border-orange-600',
            accent: 'text-orange-700'
        },
        green: {
            iconBg: 'bg-emerald-100',
            iconText: 'text-emerald-700',
            border: 'border-gray-300',
            hoverBorder: 'hover:border-emerald-600',
            accent: 'text-emerald-700'
        },
        yellow: {
            iconBg: 'bg-amber-100',
            iconText: 'text-amber-700',
            border: 'border-gray-300',
            hoverBorder: 'hover:border-amber-600',
            accent: 'text-amber-700'
        },
        purple: {
            iconBg: 'bg-violet-100',
            iconText: 'text-violet-700',
            border: 'border-gray-300',
            hoverBorder: 'hover:border-violet-600',
            accent: 'text-violet-700'
        },
        cyan: {
            iconBg: 'bg-cyan-100',
            iconText: 'text-cyan-700',
            border: 'border-gray-300',
            hoverBorder: 'hover:border-cyan-600',
            accent: 'text-cyan-700'
        }
    };

    return colorMap[color] || colorMap.red;
};

export const DepartmentSelect: React.FC = () => {
    const navigate = useNavigate();
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowContent(true);
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    const handleDepartmentSelect = (dept: Department) => {
        if (dept.active) {
            navigate(`/select-batch/${dept.id}`);
        }
    };

    // Loading Screen
    if (!showContent) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center">
                <div className="relative w-14 h-14">
                    <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-red-600 rounded-full border-t-transparent animate-[spin_0.8s_linear_infinite]"></div>
                    <div className="absolute inset-2 border-4 border-pink-500 rounded-full border-b-transparent animate-[spin_1s_linear_infinite_reverse]"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Official Header Bar */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 border-b-4 border-amber-500 shadow-lg">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <img
                            src={`${import.meta.env.BASE_URL}yspm-logo.png`}
                            alt="YSPM Logo"
                            className="w-12 h-12 object-contain"
                        />
                        <div>
                            <h1 className="text-lg font-bold text-white leading-tight">
                                YASHODA COLLEGE OF POLYTECHNIC
                            </h1>
                            <p className="text-xs text-blue-100">Yashoda Shikshan Prasarak Mandal, Satara</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Breadcrumb Navigation */}
            <div className="bg-blue-50 border-b border-blue-100">
                <div className="max-w-7xl mx-auto px-6 py-3">
                    <div className="flex items-center gap-2 text-sm">
                        <button
                            onClick={() => navigate('/')}
                            className="hover:bg-blue-100 p-1.5 rounded-full transition-colors"
                            title="Back to Home"
                        >
                            <Home className="w-4 h-4 text-blue-700" />
                        </button>
                        <ChevronRight className="w-3 h-3 text-blue-400" />
                        <span className="text-blue-800 font-medium">Department Selection</span>
                    </div>
                </div>
            </div>

            {/* News Ticker */}
            <NewsTicker />

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Page Header */}
                <div className="mb-10 border-l-4 border-blue-900 pl-4">
                    <h2 className="text-3xl font-bold text-blue-900 mb-2">Select Your Department</h2>
                    <p className="text-gray-700">Please choose your department from the available options below</p>
                </div>

                {/* Department Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {departments.map((dept, index) => {
                        const colors = getColorClasses(dept.color, dept.active);
                        return (
                            <button
                                key={dept.id}
                                onClick={() => handleDepartmentSelect(dept)}
                                disabled={!dept.active}
                                className={`
                                    relative group p-6 rounded-lg border-2 transition-all duration-300 text-left
                                    animate-[slideUp_0.4s_ease-out_${0.1 + index * 0.05}s_both]
                                    ${dept.active
                                        ? `bg-white hover:bg-gray-50 shadow-sm hover:shadow-lg ${colors.border} ${colors.hoverBorder} cursor-pointer`
                                        : 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60'
                                    }
                                `}
                                style={{ animationDelay: `${0.1 + index * 0.05}s` }}
                            >
                                {/* Coming Soon Badge */}
                                {!dept.active && (
                                    <div className="absolute top-4 right-4 bg-amber-50 border border-amber-300 text-amber-700 text-xs px-3 py-1 rounded font-medium">
                                        Coming Soon
                                    </div>
                                )}

                                {/* Department Icon */}
                                <div className={`w-16 h-16 mb-4 rounded-lg flex items-center justify-center ${colors.iconBg} overflow-hidden`}>
                                    {dept.id === 'aiml' ? (
                                        <img
                                            src={new URL('../assets/aisa-logo.jpg', import.meta.url).href}
                                            alt="AISA Logo"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <GraduationCap className={`w-8 h-8 ${colors.iconText}`} />
                                    )}
                                </div>

                                {/* Department Name */}
                                <h3 className={`text-xl font-bold mb-2 ${dept.active ? 'text-gray-800' : 'text-gray-500'}`}>
                                    {dept.shortName}
                                </h3>
                                <p className={`text-sm leading-relaxed ${dept.active ? 'text-gray-600' : 'text-gray-400'}`}>
                                    {dept.name}
                                </p>

                                {/* Arrow Icon for active departments */}
                                {dept.active && (
                                    <div className="absolute bottom-6 right-6">
                                        <ChevronRight className={`w-5 h-5 ${colors.accent} group-hover:translate-x-1 transition-transform`} />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Information Section */}
                <div className="bg-blue-100 border-l-4 border-blue-700 p-5 rounded-r mb-8">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-700" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-blue-900 font-medium">
                                <strong>Note:</strong> Additional departments will be available soon. Currently, only AI & ML department is active for student access.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Back to Home Button */}
                <div className="flex justify-center">
                    <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-blue-700 text-blue-800 rounded-lg hover:bg-blue-700 hover:text-white transition-all font-semibold shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Home
                    </button>
                </div>

                {/* Notice Board Section */}
                <div className="mt-12" id="notice-board">
                    <NoticeBoard />
                </div>
            </div>

            {/* Footer */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white mt-12 border-t-4 border-amber-500">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
                        <div>
                            <h3 className="font-bold mb-3">Contact Information</h3>
                            <p className="text-gray-300">S.NO.242, NH-4, Wadhe, Satara</p>
                            <p className="text-gray-300 mt-1">Maharashtra, India</p>
                        </div>
                        <div>
                            <h3 className="font-bold mb-3">Important Links</h3>
                            <ul className="space-y-1 text-gray-300">
                                <li>
                                    <a href="https://www.yes.edu.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                                        YSPM Official Website
                                    </a>
                                </li>
                                <li>
                                    <a href="https://msbte.ac.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                                        MSBTE
                                    </a>
                                </li>
                                <li>
                                    <a href="https://mahadbt.maharashtra.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                                        MahaDBT Scholarship
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold mb-3">Support</h3>
                            <p className="text-gray-300">For technical assistance, contact your department administrator.</p>
                        </div>
                    </div>
                    <div className="border-t border-gray-700 mt-6 pt-6 text-center text-sm text-gray-400">
                        <p>© 2026 Yashoda College of Polytechnic, Satara. All rights reserved.</p>
                        <p className="mt-1">Developed by AI/ML Student Association, YSPM</p>
                    </div>
                </div>
            </div>

            {/* Animations */}
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
