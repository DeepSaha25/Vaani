import React, { useEffect, useRef } from 'react';

const AudioVisualizer = ({ audioRef, isPlaying, analyser }) => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        if (!analyser || !canvasRef.current) return;

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
            // Safety check if analyser is still valid
            if (!analyser) return;

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            analyser.getByteFrequencyData(dataArray);

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
            renderFrame();
        } else {
            // Cancel animation if paused
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        }

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [analyser, isPlaying]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute bottom-0 left-0 w-full h-full pointer-events-none opacity-50 z-0"
            style={{ width: '100%', height: '100%' }} // Styles for layout
        />
    );
};

export default AudioVisualizer;
