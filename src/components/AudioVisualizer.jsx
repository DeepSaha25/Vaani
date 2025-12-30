import React, { useEffect, useRef } from 'react';

const AudioVisualizer = ({ audioRef, isPlaying }) => {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const sourceRef = useRef(null);
    const analyserRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        if (!audioRef.current || !canvasRef.current) return;

        const initAudio = () => {
            if (!contextRef.current) {
                // Singleton AudioContext
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                contextRef.current = new AudioContext();

                analyserRef.current = contextRef.current.createAnalyser();
                analyserRef.current.fftSize = 256; // 128 bars

                // Connect audio element source
                // Note: creating source only once to avoid errors
                try {
                    sourceRef.current = contextRef.current.createMediaElementSource(audioRef.current);
                    sourceRef.current.connect(analyserRef.current);
                    analyserRef.current.connect(contextRef.current.destination);
                } catch (e) {
                    // Source might already be connected if re-mounting
                    console.warn("Source already connected or error:", e);
                }
            }
        };

        // Initialize on mount/first interaction
        initAudio();

        // Canvas Setup
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        // Handle high DPI
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const renderFrame = () => {
            if (!analyserRef.current) return;

            const bufferLength = analyserRef.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            analyserRef.current.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, rect.width, rect.height);

            const barWidth = (rect.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = (dataArray[i] / 255) * rect.height * 0.6; // Scale height

                // Gradient color
                const gradient = ctx.createLinearGradient(0, rect.height, 0, rect.height - barHeight);
                gradient.addColorStop(0, 'rgba(168, 85, 247, 0.8)'); // Purple
                gradient.addColorStop(1, 'rgba(236, 72, 153, 0.6)'); // Pink

                ctx.fillStyle = gradient;

                // Rounded bars
                if (barHeight > 0) {
                    ctx.beginPath();
                    ctx.roundRect(x, rect.height - barHeight - 10, barWidth, barHeight, 5);
                    ctx.fill();
                }

                x += barWidth + 1;
            }

            if (isPlaying) {
                animationRef.current = requestAnimationFrame(renderFrame);
            }
        };

        if (isPlaying) {
            // Resume context if suspended
            if (contextRef.current?.state === 'suspended') {
                contextRef.current.resume();
            }
            renderFrame();
        } else {
            // Clear canvas or show flat line?
            // Let's keep the last frame or clear
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        }

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [audioRef, isPlaying]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute bottom-0 left-0 w-full h-full pointer-events-none opacity-50 z-0"
            style={{ width: '100%', height: '100%' }} // Styles for layout
        />
    );
};

export default AudioVisualizer;
