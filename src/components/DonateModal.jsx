import React from 'react';
import donateImg from '../assets/donate.jpeg';

const DonateModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div
                className="bg-[#1e1e1e] border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative flex flex-col items-center gap-4 transform scale-100 transition-transform"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>

                <h2 className="text-2xl font-bold text-white mb-2">Support the Dev ❤️</h2>

                <div className="w-full aspect-square bg-white p-2 rounded-xl overflow-hidden shadow-inner">
                    <img
                        src={donateImg}
                        alt="Donate QR"
                        className="w-full h-full object-contain"
                    />
                </div>

                <p className="text-center text-gray-300 text-sm mt-2">
                    Scan to donate via UPI. <br /> Your support keeps Vaani ad-free!
                </p>

                <button
                    className="mt-2 w-full py-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg font-bold text-white shadow-lg shadow-green-900/40 hover:scale-[1.02] transition-transform"
                    onClick={onClose}
                >
                    Done
                </button>
            </div>
        </div>
    );
};

export default DonateModal;
