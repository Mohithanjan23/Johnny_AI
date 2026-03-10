import React, { useRef, useEffect } from 'react';

const PulsingMic = ({ state, onClick, analyserNode }) => {
    const visualizerRef = useRef(null);

    const getStateClasses = () => {
        switch (state) {
            case 'listening': return 'bg-green-500 animate-pulse-strong';
            case 'speaking': return 'bg-accent animate-pulse-medium';
            case 'processing': return 'bg-yellow-500 animate-pulse';
            case 'idle':
            default: return 'bg-secondary hover:bg-border-color';
        }
    };

    const getStateText = () => {
        switch (state) {
            case 'listening': return 'Listening...';
            case 'speaking': return 'Speaking...';
            case 'processing': return 'Thinking...';
            case 'idle':
            default: return 'Tap to speak';
        }
    };

    useEffect(() => {
        if (!visualizerRef.current) return;
        const canvas = visualizerRef.current;
        const bars = canvas.children;

        let animationFrameId;

        if (state === 'speaking') {
            // Simulate AI speaking waves
            const simulateSpeech = () => {
                animationFrameId = requestAnimationFrame(simulateSpeech);
                for (let i = 0; i < bars.length; i++) {
                    // Random wave generator
                    const randomHeight = Math.random() * 0.8 + 0.2;
                    // Slower transition for a more natural look
                    bars[i].style.transition = 'transform 0.1s ease-in-out';
                    bars[i].style.transform = `scaleY(${randomHeight})`;
                }
            };
            simulateSpeech();
        } else if (state === 'listening' && analyserNode) {
            analyserNode.fftSize = 128;
            const bufferLength = analyserNode.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const drawUserSpeech = () => {
                animationFrameId = requestAnimationFrame(drawUserSpeech);
                analyserNode.getByteFrequencyData(dataArray);

                for (let i = 0; i < bars.length; i++) {
                    const barHeight = Math.pow(dataArray[i * Math.floor(bufferLength/bars.length)] / 255, 2.5);
                    bars[i].style.transition = 'transform 0.05s ease-out';
                    bars[i].style.transform = `scaleY(${Math.max(0.05, barHeight)})`;
                }
            };
            drawUserSpeech();
        } else {
            // Reset state
            for (let i = 0; i < bars.length; i++) {
                bars[i].style.transition = 'transform 0.3s ease-out';
                bars[i].style.transform = 'scaleY(0.05)';
            }
        }

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [analyserNode, state]);


    return (
        <div className="flex flex-col items-center justify-center gap-4">
             <div className="relative w-48 h-48 flex items-center justify-center">
                {/* Visualizer bars will be positioned around the button */}
                <div ref={visualizerRef} className="absolute w-full h-full">
                    {Array.from({ length: 32 }).map((_, i) => (
                        <div
                            key={i}
                            className="absolute bottom-1/2 left-1/2 w-1 h-full bg-accent/70 origin-bottom transition-transform duration-75 ease-out"
                            style={{
                                transform: `rotate(${i * (360 / 32)}deg) scaleY(0.05)`,
                                transformOrigin: 'bottom',
                                height: '50%',
                                top: 0
                            }}
                        />
                    ))}
                </div>
                <button
                    onClick={onClick}
                    className={`absolute w-32 h-32 rounded-full transition-all duration-300 ease-in-out flex items-center justify-center border-4 border-border-color shadow-lg ${getStateClasses()}`}
                >
                    {/* Central orb */}
                </button>
            </div>
            <p className="text-text-secondary text-lg font-medium mt-4">{getStateText()}</p>
        </div>
    );
};

export default PulsingMic;

